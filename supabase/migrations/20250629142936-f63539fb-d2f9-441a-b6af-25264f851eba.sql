
-- Add RLS policies for INSERT, UPDATE, and DELETE operations on travel_records table
CREATE POLICY "Allow authenticated users to insert travel records" 
  ON public.travel_records 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update travel records" 
  ON public.travel_records 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete travel records" 
  ON public.travel_records 
  FOR DELETE 
  TO authenticated 
  USING (true);
