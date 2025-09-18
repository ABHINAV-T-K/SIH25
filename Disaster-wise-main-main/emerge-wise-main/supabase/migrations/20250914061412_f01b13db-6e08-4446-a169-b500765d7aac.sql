-- Fix recursive RLS on profiles causing 500 errors
-- 1) Create a security definer function to get current user's role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT role
  FROM public.profiles
  WHERE user_id = auth.uid();
$$;

-- 2) Replace the recursive policy on profiles SELECT
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');
