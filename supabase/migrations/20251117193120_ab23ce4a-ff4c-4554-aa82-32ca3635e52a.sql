-- Drop the incorrect trigger and function
DROP TRIGGER IF EXISTS trigger_update_invoice_balance ON public.payments;
DROP FUNCTION IF EXISTS public.update_invoice_balance();

-- Create a new function that only updates total_paid
CREATE OR REPLACE FUNCTION public.update_invoice_totals_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update when status is approved
  IF NEW.status = 'approved' THEN
    UPDATE public.invoices
    SET total_paid = COALESCE((
      SELECT SUM(amount_paid)
      FROM public.payments
      WHERE invoice_id = NEW.invoice_id
      AND status = 'approved'
    ), 0)
    WHERE id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating invoice totals when payment status changes
CREATE TRIGGER trigger_update_invoice_totals_on_payment
AFTER INSERT OR UPDATE OF status, amount_paid ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_totals_on_payment();