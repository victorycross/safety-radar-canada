
-- Create table for immigration and travel announcements
CREATE TABLE public.immigration_travel_announcements (
  id text NOT NULL PRIMARY KEY,
  title text NOT NULL,
  summary text,
  content text,
  link text,
  pub_date timestamp with time zone,
  source text NOT NULL DEFAULT 'Immigration, Refugees and Citizenship Canada',
  category text, -- e.g., "media advisories", "statements", "news releases"
  announcement_type text, -- "immigration", "citizenship", "refugee", "travel"
  location text DEFAULT 'Canada',
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  archived_at timestamp with time zone,
  archived_by uuid,
  archive_reason text
);

-- Add Row Level Security
ALTER TABLE public.immigration_travel_announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (announcements are public information)
CREATE POLICY "Anyone can view immigration travel announcements" 
  ON public.immigration_travel_announcements 
  FOR SELECT 
  USING (true);

-- Create policies for admin operations (requires authentication)
CREATE POLICY "Admins can insert immigration travel announcements" 
  ON public.immigration_travel_announcements 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update immigration travel announcements" 
  ON public.immigration_travel_announcements 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete immigration travel announcements" 
  ON public.immigration_travel_announcements 
  FOR DELETE 
  USING (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_immigration_travel_announcements_pub_date 
  ON public.immigration_travel_announcements(pub_date DESC);

CREATE INDEX idx_immigration_travel_announcements_category 
  ON public.immigration_travel_announcements(category);

CREATE INDEX idx_immigration_travel_announcements_type 
  ON public.immigration_travel_announcements(announcement_type);

CREATE INDEX idx_immigration_travel_announcements_source 
  ON public.immigration_travel_announcements(source);
