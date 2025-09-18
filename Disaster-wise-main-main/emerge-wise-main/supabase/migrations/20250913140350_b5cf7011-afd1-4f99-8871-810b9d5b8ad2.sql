-- ENUM TYPES
CREATE TYPE public.incident_type AS ENUM (
  'flood', 'fire', 'earthquake', 'weather', 'accident', 'hazmat', 'medical', 'other'
);

CREATE TYPE public.severity_level AS ENUM (
  'low', 'medium', 'high', 'critical'
);

CREATE TYPE public.alert_status AS ENUM (
  'active', 'resolved', 'monitoring', 'watch'
);

CREATE TYPE public.resource_type AS ENUM (
  'shelter', 'hospital', 'fire_station', 'police_station', 'emergency_contact'
);

-- INCIDENT REPORTS
CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type incident_type NOT NULL,
  severity severity_level NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_info TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  images TEXT[],
  ai_severity_score DECIMAL(3,1),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  status alert_status DEFAULT 'monitoring',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EMERGENCY ALERTS
CREATE TABLE public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  severity severity_level NOT NULL,
  type incident_type NOT NULL,
  ai_severity_score DECIMAL(3,1),
  affected_population TEXT,
  status alert_status DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EMERGENCY RESOURCES
CREATE TABLE public.emergency_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  capacity INTEGER,
  current_occupancy INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  coordinates POINT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EVACUATION ROUTES
CREATE TABLE public.evacuation_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  route_points JSONB,
  distance_km DECIMAL(10,2),
  estimated_time_minutes INTEGER,
  difficulty_level TEXT,
  current_status TEXT DEFAULT 'open',
  ai_optimized BOOLEAN DEFAULT false,
  capacity INTEGER,
  current_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- USER PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ENABLE RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evacuation_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Incident Reports
CREATE POLICY "Anyone can submit incident reports" ON public.incident_reports
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view verified incident reports" ON public.incident_reports
FOR SELECT USING (verified = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update incident reports" ON public.incident_reports
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'operator')
  )
);

-- Emergency Alerts
CREATE POLICY "Public can view active alerts" ON public.emergency_alerts FOR SELECT USING (true);
CREATE POLICY "Admins can manage alerts" ON public.emergency_alerts FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'operator')
  )
);

-- Emergency Resources
CREATE POLICY "Public can view available resources" ON public.emergency_resources FOR SELECT USING (true);
CREATE POLICY "Admins can manage resources" ON public.emergency_resources FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'operator')
  )
);

-- Evacuation Routes
CREATE POLICY "Public can view evacuation routes" ON public.evacuation_routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage evacuation routes" ON public.evacuation_routes FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role IN ('admin', 'operator')
  )
);

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin')
);

-- TIMESTAMP TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_alerts_updated_at
  BEFORE UPDATE ON public.emergency_alerts FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_resources_updated_at
  BEFORE UPDATE ON public.emergency_resources FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evacuation_routes_updated_at
  BEFORE UPDATE ON public.evacuation_routes FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- HANDLE NEW USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SAMPLE INDIAN EMERGENCY RESOURCES
INSERT INTO public.emergency_resources (name, type, address, phone, capacity, current_occupancy, available) VALUES
('Central Delhi Shelter', 'shelter', 'Connaught Place, New Delhi', '+91-11-23456789', 250, 100, true),
('AIIMS Hospital', 'hospital', 'Ansari Nagar, New Delhi', '+91-11-26588500', 500, 230, true),
('Mumbai Fire Station #1', 'fire_station', 'Fort, Mumbai', '+91-22-12345678', NULL, NULL, true),
('Bangalore Police Headquarters', 'police_station', 'MG Road, Bangalore', '+91-80-23456789', NULL, NULL, true),
('National Emergency Helpline', 'emergency_contact', 'Pan India', '112', NULL, NULL, true),
('Apollo Hospital Chennai', 'hospital', 'Greams Road, Chennai', '+91-44-28293333', 300, 150, true),
('Kolkata Red Cross Shelter', 'shelter', 'Park Street, Kolkata', '+91-33-12345678', 200, 80, true),
('Hyderabad Fire Station #2', 'fire_station', 'Banjara Hills, Hyderabad', '+91-40-23456789', NULL, NULL, true),
('Police Station Andheri', 'police_station', 'Andheri, Mumbai', '+91-22-34567890', NULL, NULL, true),
('Emergency Coordination Center Delhi', 'emergency_contact', 'Connaught Place, New Delhi', '+91-11-34567890', NULL, NULL, true);

-- SAMPLE EVACUATION ROUTES
INSERT INTO public.evacuation_routes (name, from_location, to_location, distance_km, estimated_time_minutes, difficulty_level, current_status, capacity, current_usage) VALUES
('CP to Central Delhi Shelter', 'Connaught Place', 'Central Delhi Shelter', 4.5, 15, 'easy', 'open', 500, 120),
('Fort to Mumbai Fire Station', 'Fort, Mumbai', 'Mumbai Fire Station #1', 3.2, 10, 'easy', 'open', 400, 90),
('MG Road to Bangalore Police HQ', 'MG Road, Bangalore', 'Bangalore Police Headquarters', 5.0, 20, 'moderate', 'open', 300, 60),
