import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInvoices, Invoice, InvoiceItem } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit_price: number;
  vat_percent: number;
}

export default function EditInvoice() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { invoices, updateInvoice, getInvoiceItems } = useInvoices();
  const { settings } = useCompanySettings();

  const [loading, setLoading] = useState(true);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [status, setStatus] = useState<"paid" | "unpaid" | "overdue">("unpaid");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState("");

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (!invoiceId) return;

      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) {
        toast({
          title: "Invoice Not Found",
          description: "The invoice you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate("/history");
        return;
      }

      try {
        const items = await getInvoiceItems(invoiceId);
        
        setInvoiceDate(invoice.date_issued);
        setStatus(invoice.status);
        setClientName(invoice.client_name);
        setClientEmail(invoice.client_email || "");
        setClientPhone(invoice.client_phone || "");
        setBillingAddress(invoice.billing_address || "");
        setReference(invoice.reference || "");
        setNotes(invoice.notes || "");
        setOriginalInvoiceNo(invoice.invoice_no);
        
        setLineItems(
          items.map((item) => ({
            id: item.id,
            description: item.description,
            qty: item.qty,
            unit_price: item.unit_price,
            vat_percent: item.vat_percent,
          }))
        );

        setLoading(false);
      } catch (error) {
        toast({
          title: "Error Loading Invoice",
          description: "Failed to load invoice data. Please try again.",
          variant: "destructive",
        });
        navigate("/history");
      }
    };

    loadInvoiceData();
  }, [invoiceId, invoices, getInvoiceItems, navigate]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: "",
        qty: 1,
        unit_price: 0,
        vat_percent: settings?.default_vat_percent || 16,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (item: LineItem) => {
    return item.qty * item.unit_price * (1 + item.vat_percent / 100);
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.unit_price,
    0
  );

  const vatTotal = lineItems.reduce(
    (sum, item) => sum + (item.qty * item.unit_price * item.vat_percent) / 100,
    0
  );

  const grandTotal = subtotal + vatTotal;

  const handleSave = () => {
    if (!invoiceId) return;

    if (!clientName || lineItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in client name and add at least one line item.",
        variant: "destructive",
      });
      return;
    }

    const invoiceData: Partial<Invoice> = {
      date_issued: invoiceDate,
      status,
      client_name: clientName,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      billing_address: billingAddress || null,
      reference: reference || null,
      notes: notes || null,
      subtotal,
      vat_total: vatTotal,
      grand_total: grandTotal,
      currency_label: settings?.currency_label || "Ksh",
    };

    const items: InvoiceItem[] = lineItems.map((item) => ({
      id: item.id,
      invoice_id: invoiceId,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      vat_percent: item.vat_percent,
      line_total: calculateLineTotal(item),
      sort_order: 0,
      created_at: new Date().toISOString(),
    }));

    updateInvoice({ invoiceId, invoiceData, items });
    navigate("/history");
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/history")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Invoice</h2>
          <p className="text-muted-foreground">Invoice No: {originalInvoiceNo}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+254 XXX XXX XXX"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Textarea
                  id="billingAddress"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Enter billing address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference/PO Number</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Optional reference"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Item</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.qty}
                        onChange={(e) =>
                          updateLineItem(item.id, "qty", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price ({settings.currency_label})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.vat_percent}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "vat_percent",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium">Line Total: </span>
                    {settings.currency_label} {calculateLineTotal(item).toLocaleString()}
                  </div>
                </div>
              ))}
              {lineItems.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No items added yet. Click "Add Item" to get started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or terms..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" size="lg">
            Update Invoice
          </Button>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Header */}
              <div className="border-b pb-4">
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

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice No:</p>
                  <p className="font-medium">{originalInvoiceNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date:</p>
                  <p className="font-medium">
                    {invoiceDate ? new Date(invoiceDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                {reference && (
                  <div>
                    <p className="text-muted-foreground">Reference:</p>
                    <p className="font-medium">{reference}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-medium uppercase">{status}</p>
                </div>
              </div>

              {/* Client Details */}
              <div>
                <p className="text-sm font-bold mb-1">BILL TO:</p>
                <p className="font-medium">{clientName || "Client Name"}</p>
                {billingAddress && (
                  <p className="text-sm text-muted-foreground">{billingAddress}</p>
                )}
                {clientEmail && <p className="text-sm text-muted-foreground">{clientEmail}</p>}
                {clientPhone && <p className="text-sm text-muted-foreground">{clientPhone}</p>}
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <p className="font-bold text-sm">Items:</p>
                {lineItems.map((item) => (
                  <div key={item.id} className="text-sm border-b pb-2">
                    <p className="font-medium">{item.description || "Item description"}</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        {item.qty} x {settings.currency_label} {item.unit_price.toLocaleString()}{" "}
                        (VAT {item.vat_percent}%)
                      </span>
                      <span className="font-medium text-foreground">
                        {settings.currency_label} {calculateLineTotal(item).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {settings.currency_label} {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT Total:</span>
                  <span className="font-medium">
                    {settings.currency_label} {vatTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>GRAND TOTAL:</span>
                  <span>
                    {settings.currency_label} {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
