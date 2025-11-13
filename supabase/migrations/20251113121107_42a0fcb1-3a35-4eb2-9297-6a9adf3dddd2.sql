-- Create trigger to update invoice balance when payments are approved
CREATE OR REPLACE FUNCTION update_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.invoices
  SET 
    balance_due = grand_total - COALESCE((
      SELECT SUM(amount_paid)
      FROM public.payments
      WHERE invoice_id = NEW.invoice_id
      AND status = 'approved'
    ), 0)
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_invoice_payment_totals ON public.payments;
DROP TRIGGER IF EXISTS trigger_update_invoice_payment_status ON public.payments;
DROP TRIGGER IF EXISTS trigger_update_invoice_balance ON public.payments;

-- Create trigger that fires after payment insert or update
CREATE TRIGGER trigger_update_invoice_balance
AFTER INSERT OR UPDATE OF status, amount_paid ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_balance();