-- Allow admins to delete client documents
CREATE POLICY "Admins can delete documents" 
ON public.client_documents 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));