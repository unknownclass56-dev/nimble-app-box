-- Fix profiles table RLS policy to prevent public email harvesting
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to increment download count atomically
CREATE OR REPLACE FUNCTION public.increment_download_count(app_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.apps
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = app_id_param;
END;
$$;