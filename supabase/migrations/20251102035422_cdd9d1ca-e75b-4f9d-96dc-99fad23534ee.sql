-- Create storage bucket for app files
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-files', 'app-files', true);

-- Create RLS policies for app files bucket
CREATE POLICY "Admins can upload app files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'app-files' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Anyone can download app files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'app-files');

CREATE POLICY "Admins can delete app files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'app-files' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);