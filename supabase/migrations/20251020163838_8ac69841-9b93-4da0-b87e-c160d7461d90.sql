-- Create clients table for company information
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_pin TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL UNIQUE,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  billing_address TEXT NOT NULL,
  physical_address TEXT,
  industry TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients table
CREATE POLICY "Admins can manage all clients"
ON public.clients FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their own record"
ON public.clients FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Clients can update their own record"
ON public.clients FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_unit_price NUMERIC(10, 2) NOT NULL,
  default_vat_percent NUMERIC(5, 2) DEFAULT 16,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for products table
CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view products"
ON public.products FOR SELECT
TO authenticated
USING (is_active = true);

-- Create payment_status enum
CREATE TYPE payment_status AS ENUM ('not_started', 'partial', 'paid_pending_approval', 'fully_paid');

-- Modify invoices table
ALTER TABLE public.invoices 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN total_paid NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN balance_due NUMERIC(10, 2) GENERATED ALWAYS AS (grand_total - COALESCE(total_paid, 0)) STORED,
ADD COLUMN payment_status payment_status DEFAULT 'not_started';

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid > 0),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  proof_of_payment_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  approved_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approval_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments table
CREATE POLICY "Admins can manage all payments"
ON public.payments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can create payments for their invoices"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  submitted_by_client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  submitted_by_client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

-- Update invoices RLS policies to include clients
CREATE POLICY "Clients can view their own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);

-- Function to update invoice totals when payment is approved
CREATE OR REPLACE FUNCTION update_invoice_payment_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.invoices
    SET 
      total_paid = COALESCE((
        SELECT SUM(amount_paid) 
        FROM public.payments 
        WHERE invoice_id = NEW.invoice_id 
        AND status = 'approved'
      ), 0)
    WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment approval
CREATE TRIGGER trigger_update_invoice_payment_totals
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_totals();

-- Function to update payment status based on payments
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  v_balance NUMERIC;
  v_total_paid NUMERIC;
  v_grand_total NUMERIC;
  v_has_pending BOOLEAN;
BEGIN
  SELECT balance_due, total_paid, grand_total INTO v_balance, v_total_paid, v_grand_total
  FROM public.invoices WHERE id = NEW.invoice_id;
  
  SELECT EXISTS (
    SELECT 1 FROM public.payments 
    WHERE invoice_id = NEW.invoice_id 
    AND status = 'pending'
  ) INTO v_has_pending;
  
  UPDATE public.invoices
  SET payment_status = CASE
    WHEN v_balance <= 0 THEN 'fully_paid'::payment_status
    WHEN v_has_pending THEN 'paid_pending_approval'::payment_status
    WHEN v_total_paid > 0 AND v_balance > 0 THEN 'partial'::payment_status
    ELSE 'not_started'::payment_status
  END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment status update
CREATE TRIGGER trigger_update_invoice_payment_status
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

-- Function to auto-create client record on company signup
CREATE OR REPLACE FUNCTION handle_new_client_user()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'client') THEN
    INSERT INTO public.clients (
      user_id, 
      email, 
      company_name,
      company_pin,
      contact_person,
      phone_primary,
      billing_address,
      is_active
    )
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Pending Setup'),
      COALESCE(NEW.raw_user_meta_data->>'company_pin', 'PENDING'),
      COALESCE(NEW.raw_user_meta_data->>'contact_person', 'Pending'),
      COALESCE(NEW.raw_user_meta_data->>'phone_primary', 'Pending'),
      COALESCE(NEW.raw_user_meta_data->>'billing_address', 'Pending'),
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating client record
CREATE TRIGGER trigger_handle_new_client_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_client_user();

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Clients can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid() IN (SELECT user_id FROM public.clients)
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Clients can view their own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  auth.uid() IN (SELECT user_id FROM public.clients)
);

-- Enable realtime for new tables
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.payments REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- Create indexes for performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_products_code ON public.products(product_code);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);

-- Update timestamp triggers for new tables
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();