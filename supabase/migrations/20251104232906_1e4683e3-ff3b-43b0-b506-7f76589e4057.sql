-- Create document_status enum
CREATE TYPE public.document_status AS ENUM ('pending', 'reviewed', 'approved', 'rejected');

-- Create client_documents table
CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  notes TEXT,
  status public.document_status NOT NULL DEFAULT 'pending',
  reviewed_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Clients can insert their own documents"
ON public.client_documents
FOR INSERT
WITH CHECK (
  submitted_by_user_id = auth.uid() AND
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);

CREATE POLICY "Clients can view their own documents"
ON public.client_documents
FOR SELECT
USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
);

-- RLS Policies for admins
CREATE POLICY "Admins can view all documents"
ON public.client_documents
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all documents"
ON public.client_documents
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false);

-- Storage policies for clients
CREATE POLICY "Clients can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for admins
CREATE POLICY "Admins can view all client documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_documents;

-- Trigger for updated_at
CREATE TRIGGER update_client_documents_updated_at
BEFORE UPDATE ON public.client_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();