-- Fix security warnings: Add search_path to all functions

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update calculate_line_total function
CREATE OR REPLACE FUNCTION public.calculate_line_total()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.line_total = NEW.qty * NEW.unit_price * (1 + NEW.vat_percent / 100);
  RETURN NEW;
END;
$$;

-- Update update_invoice_totals function
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id UUID;
  v_subtotal NUMERIC;
  v_vat_total NUMERIC;
  v_grand_total NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_invoice_id = OLD.invoice_id;
  ELSE
    v_invoice_id = NEW.invoice_id;
  END IF;

  SELECT 
    COALESCE(SUM(qty * unit_price), 0),
    COALESCE(SUM(qty * unit_price * vat_percent / 100), 0),
    COALESCE(SUM(line_total), 0)
  INTO v_subtotal, v_vat_total, v_grand_total
  FROM public.invoice_items
  WHERE invoice_id = v_invoice_id;

  UPDATE public.invoices
  SET 
    subtotal = v_subtotal,
    vat_total = v_vat_total,
    grand_total = v_grand_total
  WHERE id = v_invoice_id;

  RETURN NULL;
END;
$$;

-- Update generate_invoice_number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_sequence INTEGER;
  v_invoice_no TEXT;
BEGIN
  SELECT invoice_prefix INTO v_prefix FROM public.company_settings LIMIT 1;
  v_prefix = COALESCE(v_prefix, 'MPISS-');
  
  v_year = TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COUNT(*) + 1 INTO v_sequence
  FROM public.invoices
  WHERE invoice_no LIKE v_prefix || v_year || '-%';
  
  v_invoice_no = v_prefix || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_invoice_no;
END;
$$;

-- Update update_overdue_invoices function
CREATE OR REPLACE FUNCTION public.update_overdue_invoices()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE status = 'unpaid'
    AND date_issued < CURRENT_DATE - INTERVAL '7 days';
END;
$$;