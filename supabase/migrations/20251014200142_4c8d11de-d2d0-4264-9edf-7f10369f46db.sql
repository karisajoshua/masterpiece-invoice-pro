-- Create company settings table
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Master Piece International Supplies and Services',
  company_pin TEXT NOT NULL DEFAULT 'P051566058Q',
  logo_url TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'MPISS-',
  address TEXT DEFAULT 'Lunga Lunga Business Complex, Industrial Area, Nairobi, Kenya',
  phone_1 TEXT DEFAULT '+254 728 268 660',
  phone_2 TEXT DEFAULT '+254 752 268 660',
  phone_3 TEXT DEFAULT '+254 780 566 660',
  email TEXT DEFAULT 'info@mpissl.co.ke',
  currency_label TEXT NOT NULL DEFAULT 'Ksh',
  default_vat_percent NUMERIC NOT NULL DEFAULT 16,
  payment_terms_days INTEGER NOT NULL DEFAULT 7,
  payment_terms_text TEXT DEFAULT 'Payment due within 7 days of receipt.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('paid', 'unpaid', 'overdue');

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no TEXT UNIQUE NOT NULL,
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  billing_address TEXT,
  reference TEXT,
  status public.invoice_status NOT NULL DEFAULT 'unpaid',
  currency_label TEXT NOT NULL DEFAULT 'Ksh',
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_total NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  vat_percent NUMERIC NOT NULL DEFAULT 16,
  line_total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on invoice_id for better performance
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for now, can be restricted later with authentication)
CREATE POLICY "Allow all access to company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to invoice_items" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for company_settings updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate line item total
CREATE OR REPLACE FUNCTION public.calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.line_total = NEW.qty * NEW.unit_price * (1 + NEW.vat_percent / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate line total
CREATE TRIGGER calculate_invoice_item_total
  BEFORE INSERT OR UPDATE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_line_total();

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id UUID;
  v_subtotal NUMERIC;
  v_vat_total NUMERIC;
  v_grand_total NUMERIC;
BEGIN
  -- Get the invoice_id (works for INSERT, UPDATE, DELETE)
  IF TG_OP = 'DELETE' THEN
    v_invoice_id = OLD.invoice_id;
  ELSE
    v_invoice_id = NEW.invoice_id;
  END IF;

  -- Calculate totals
  SELECT 
    COALESCE(SUM(qty * unit_price), 0),
    COALESCE(SUM(qty * unit_price * vat_percent / 100), 0),
    COALESCE(SUM(line_total), 0)
  INTO v_subtotal, v_vat_total, v_grand_total
  FROM public.invoice_items
  WHERE invoice_id = v_invoice_id;

  -- Update invoice
  UPDATE public.invoices
  SET 
    subtotal = v_subtotal,
    vat_total = v_vat_total,
    grand_total = v_grand_total
  WHERE id = v_invoice_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice totals when items change
CREATE TRIGGER update_invoice_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_sequence INTEGER;
  v_invoice_no TEXT;
BEGIN
  -- Get prefix from settings
  SELECT invoice_prefix INTO v_prefix FROM public.company_settings LIMIT 1;
  v_prefix = COALESCE(v_prefix, 'MPISS-');
  
  -- Get current year
  v_year = TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COUNT(*) + 1 INTO v_sequence
  FROM public.invoices
  WHERE invoice_no LIKE v_prefix || v_year || '-%';
  
  -- Generate invoice number
  v_invoice_no = v_prefix || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_invoice_no;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update overdue invoices
CREATE OR REPLACE FUNCTION public.update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status = 'unpaid'
    AND date_issued < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_items;

-- Insert initial company settings
INSERT INTO public.company_settings (
  company_name,
  company_pin,
  invoice_prefix,
  address,
  phone_1,
  phone_2,
  phone_3,
  email,
  currency_label,
  default_vat_percent,
  payment_terms_days,
  payment_terms_text
) VALUES (
  'Master Piece International Supplies and Services',
  'P051566058Q',
  'MPISS-',
  'Lunga Lunga Business Complex, Industrial Area, Nairobi, Kenya',
  '+254 728 268 660',
  '+254 752 268 660',
  '+254 780 566 660',
  'info@mpissl.co.ke',
  'Ksh',
  16,
  7,
  'Payment due within 7 days of receipt.'
);