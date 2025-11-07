-- Fix the generate_invoice_number function to prevent duplicate invoice numbers
-- The function now extracts the maximum sequence number from existing invoices
-- and increments it, instead of using COUNT(*) which causes duplicates

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_max_sequence INTEGER;
  v_invoice_no TEXT;
BEGIN
  -- Get the invoice prefix from company settings
  SELECT invoice_prefix INTO v_prefix FROM public.company_settings LIMIT 1;
  v_prefix = COALESCE(v_prefix, 'MPISS-');
  
  -- Get the current year
  v_year = TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Find the maximum sequence number for the current year
  -- Extract the sequence number from invoice_no that matches the pattern 'PREFIX-YEAR-NNNN'
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_no FROM LENGTH(v_prefix || v_year || '-') + 1)
      AS INTEGER
    )
  ), 0) INTO v_max_sequence
  FROM public.invoices
  WHERE invoice_no LIKE v_prefix || v_year || '-%';
  
  -- Increment the sequence
  v_max_sequence = v_max_sequence + 1;
  
  -- Format the invoice number with leading zeros
  v_invoice_no = v_prefix || v_year || '-' || LPAD(v_max_sequence::TEXT, 4, '0');
  
  RETURN v_invoice_no;
END;
$function$;