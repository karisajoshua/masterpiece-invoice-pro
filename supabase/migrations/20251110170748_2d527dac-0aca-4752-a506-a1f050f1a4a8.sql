-- Phase 1.1: Link existing invoices to clients based on email/name/phone
UPDATE public.invoices i
SET client_id = c.id
FROM public.clients c
WHERE i.client_id IS NULL
  AND (
    i.client_email = c.email
    OR i.client_name = c.company_name
    OR i.client_phone = c.phone_primary
  );

-- Phase 1.4: Create storage bucket for payment proofs if not exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Clients can upload their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Clients can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;

-- Create RLS policies for payment-proofs bucket
CREATE POLICY "Clients can upload their own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid() IN (
    SELECT user_id FROM clients WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Clients can view their own payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND (
    auth.uid() IN (
      SELECT user_id FROM clients WHERE id::text = (storage.foldername(name))[1]
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Phase 2.8: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'invoice', 'payment', 'document', 'reminder'
  related_id UUID, -- Can reference invoice_id, payment_id, or document_id
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());