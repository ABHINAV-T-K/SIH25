# Disaster Management System - Backend Implementation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (already configured)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Environment Configuration**
   - Frontend `.env` is already configured
   - Backend `.env` is already configured with Supabase credentials

3. **Start Development Environment**
   ```bash
   # Option 1: Use the automated script
   ./start-dev.sh
   
   # Option 2: Manual start
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Health Check: http://localhost:8000/health

## 🏗️ Backend Architecture

### Core Features Implemented

#### 1. **Real-time Communication**
- Socket.IO integration for live updates
- Real-time alerts and notifications
- Live dashboard statistics
- Incident reporting with instant notifications

#### 2. **AI-Powered Features**
- Automatic severity calculation for incidents
- Resource requirement prediction
- Risk assessment for locations
- Evacuation route optimization

#### 3. **Comprehensive API Endpoints**

**Alerts API** (`/api/alerts`)
- `GET /` - Get all alerts
- `POST /` - Create new alert
- `PATCH /:id/status` - Update alert status
- `GET /severity/:level` - Get alerts by severity

**Incidents API** (`/api/incidents`)
- `GET /` - Get all incidents
- `POST /` - Report new incident (with AI severity)
- `PATCH /:id/verify` - Verify incident
- `GET /location/:location` - Get incidents by location

**Resources API** (`/api/resources`)
- `GET /` - Get all resources
- `PATCH /:id/availability` - Update resource status
- `GET /nearby` - Get nearby resources
- `GET /capacity-status` - Get capacity statistics
- `POST /` - Add new resource

**Evacuation API** (`/api/evacuation`)
- `GET /` - Get all routes
- `POST /optimize` - Get optimized route
- `PATCH /:id/status` - Update route status
- `GET /capacity-status` - Get route capacity stats

**AI API** (`/api/ai`)
- `POST /severity` - Calculate incident severity
- `POST /predict-resources` - Predict resource needs
- `POST /risk-assessment` - Assess area risk
- `POST /evacuation-recommendations` - Get evacuation advice

**Notifications API** (`/api/notifications`)
- `POST /emergency` - Send emergency notification
- `POST /sms` - Send SMS alerts
- `POST /push` - Send push notifications
- `POST /broadcast` - System-wide broadcast

#### 4. **Automated Background Tasks**
- Stale alert monitoring (every 5 minutes)
- Daily statistics generation
- Resource capacity monitoring (every 15 minutes)
- Traffic updates for evacuation routes (every 10 minutes)
- Weekly cleanup of old data
- System health checks (hourly)

#### 5. **Enhanced Security & Performance**
- Rate limiting (100 requests per minute)
- Request compression
- Security headers with Helmet
- Error handling and logging
- CORS configuration

## 🔄 Real-time Features

### Socket.IO Events

**Client → Server:**
- `join_location` - Join location-based room
- `join_role` - Join role-based room
- `report_incident` - Report new incident
- `update_resource_status` - Update resource availability
- `update_route_status` - Update evacuation route
- `create_alert` - Create emergency alert
- `request_dashboard_data` - Request latest stats

**Server → Client:**
- `new_emergency_alert` - New alert created
- `high_severity_incident` - Critical incident reported
- `resource_updated` - Resource status changed
- `route_status_updated` - Route status changed
- `capacity_warning` - Resource at high capacity
- `traffic_updates` - Route traffic conditions
- `emergency_notification` - Emergency broadcast
- `dashboard_data` - Real-time statistics

## 🤖 AI Features

### Severity Calculation
The AI system analyzes incidents based on:
- Incident type (earthquake, flood, fire, etc.)
- Description keywords (critical, severe, massive, etc.)
- Location density (major cities get higher scores)
- Historical patterns

### Resource Prediction
Automatically predicts required resources:
- Medical teams needed
- Fire department units
- Police units required
- Shelter capacity
- Estimated affected population

### Risk Assessment
Evaluates location-based risks:
- Flood risk by geography
- Earthquake vulnerability
- Fire hazard levels
- Weather-related risks

## 📊 Dashboard Enhancements

### Real-time Statistics
- Active alerts count
- Available resources
- Open evacuation routes
- Verified incidents
- System health status

### Capacity Monitoring
- Resource utilization rates
- Evacuation route usage
- Shelter occupancy
- Real-time warnings for overcapacity

## 🔧 Development Features

### Logging
- Winston-based logging system
- Error tracking and debugging
- Performance monitoring
- Audit trails for critical operations

### Error Handling
- Comprehensive error middleware
- Graceful failure handling
- User-friendly error messages
- Automatic retry mechanisms

### Testing & Monitoring
- Health check endpoints
- System status monitoring
- Performance metrics
- Automated background tasks

## 🚀 Production Deployment

### Environment Variables
```bash
# Server
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs
GOOGLE_MAPS_API_KEY=your_maps_key
WEATHER_API_KEY=your_weather_key
SMS_API_KEY=your_sms_key
```

### Build & Deploy
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## 📱 Mobile & PWA Support

The system includes:
- Progressive Web App (PWA) capabilities
- Mobile-responsive design
- Offline functionality
- Push notification support
- Location-based services

## 🔐 Security Features

- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Authentication via Supabase
- Role-based access control

## 🎯 Key Benefits

1. **Real-time Updates**: Instant notifications and live data
2. **AI-Powered Intelligence**: Smart severity assessment and predictions
3. **Scalable Architecture**: Handles multiple concurrent users
4. **Comprehensive Monitoring**: Full system observability
5. **User-Friendly**: Intuitive interface with real-time feedback
6. **Production Ready**: Robust error handling and logging

## 📞 Support

For technical support or questions about the implementation, refer to the code comments and logging output for debugging information.

The system is now fully functional with a complete backend infrastructure supporting real-time disaster management operations.
