-- Add missing RLS policies for data_sync_status table
CREATE POLICY "Admins can view data sync status" 
ON public.data_sync_status 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage data sync status" 
ON public.data_sync_status 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Add comprehensive RLS policies for alert_ingestion_queue
CREATE POLICY "System can insert into alert ingestion queue" 
ON public.alert_ingestion_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System and admins can update alert ingestion queue" 
ON public.alert_ingestion_queue 
FOR UPDATE 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete from alert ingestion queue" 
ON public.alert_ingestion_queue 
FOR DELETE 
USING (is_admin());