import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { CompanySettings } from "@/hooks/useCompanySettings";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";

interface InvoicePreviewDialogProps {
  invoice: Invoice | null;
  items: InvoiceItem[];
  settings: CompanySettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePreviewDialog({
  invoice,
  items,
  settings,
  open,
  onOpenChange,
}: InvoicePreviewDialogProps) {
  if (!invoice) return null;

  const handleDownload = async () => {
    try {
      const pdf = await generateInvoicePDF(invoice, items, settings);
      pdf.save(`Invoice-${invoice.invoice_no}.pdf`);
      toast({
        title: "PDF Downloaded",
        description: "Invoice has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Invoice Preview
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6 border rounded-lg bg-background">
          {/* Company Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              {settings.logo_url && (
                <img src={settings.logo_url} alt="Company Logo" className="h-16 mb-2" />
              )}
              <h3 className="font-bold text-lg">{settings.company_name}</h3>
              <p className="text-sm text-muted-foreground">PIN: {settings.company_pin}</p>
              <p className="text-sm text-muted-foreground">{settings.address}</p>
              <p className="text-sm text-muted-foreground">
                {settings.phone_1} | {settings.email}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-sm mt-2">
                <span className="font-semibold">Invoice No:</span> {invoice.invoice_no}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(invoice.date_issued).toLocaleDateString()}
              </p>
              {invoice.reference && (
                <p className="text-sm">
                  <span className="font-semibold">Reference:</span> {invoice.reference}
                </p>
              )}
              <p className="text-sm">
                <span className="font-semibold">Status:</span>{" "}
                <span className="uppercase font-bold">{invoice.status}</span>
              </p>
            </div>
          </div>

          {/* Client Details */}
          <div>
            <h4 className="font-bold mb-2">BILL TO:</h4>
            <p className="font-semibold">{invoice.client_name}</p>
            {invoice.billing_address && (
              <p className="text-sm text-muted-foreground">{invoice.billing_address}</p>
            )}
            {invoice.client_email && (
              <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
            )}
            {invoice.client_phone && (
              <p className="text-sm text-muted-foreground">{invoice.client_phone}</p>
            )}
          </div>

          {/* Line Items */}
          <div>
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">VAT %</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lineTotal = item.qty * item.unit_price * (1 + item.vat_percent / 100);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.qty}</td>
                      <td className="py-2 text-right">
                        {settings.currency_label} {item.unit_price.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">{item.vat_percent}%</td>
                      <td className="py-2 text-right">
                        {settings.currency_label} {lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span>
                  {settings.currency_label} {invoice.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">VAT Total:</span>
                <span>
                  {settings.currency_label} {invoice.vat_total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>GRAND TOTAL:</span>
                <span>
                  {settings.currency_label} {invoice.grand_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-4">
              <h4 className="font-bold mb-2">Notes:</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            {settings.payment_terms_text}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
