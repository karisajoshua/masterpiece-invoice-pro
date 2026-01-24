-- Create triggers for updating invoice payment totals and status when payments change
-- These triggers call the existing functions that were not attached to the payments table

-- Drop existing triggers if they exist (to avoid errors)
DROP TRIGGER IF EXISTS on_payment_update_totals ON public.payments;
DROP TRIGGER IF EXISTS on_payment_update_status ON public.payments;

-- Create trigger for updating invoice totals when payment status changes
CREATE TRIGGER on_payment_update_totals
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_totals_on_payment();

-- Create trigger for updating payment status after totals are updated
CREATE TRIGGER on_payment_update_status
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_payment_status();

-- Fix existing data: Update all invoices to recalculate payment_status based on current values
UPDATE public.invoices
SET payment_status = CASE
  WHEN balance_due <= 0 THEN 'fully_paid'::payment_status
  WHEN EXISTS (
    SELECT 1 FROM public.payments 
    WHERE invoice_id = invoices.id 
    AND status = 'pending'
  ) THEN 'paid_pending_approval'::payment_status
  WHEN total_paid > 0 AND balance_due > 0 THEN 'partial'::payment_status
  ELSE 'not_started'::payment_status
END;