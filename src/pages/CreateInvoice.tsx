import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useNavigate } from "react-router-dom";
import { ClientSearchCombobox } from "@/components/ClientSearchCombobox";
import { ProductMultiSelect } from "@/components/ProductMultiSelect";
import { Client } from "@/hooks/useClients";
import { Product } from "@/hooks/useProducts";
import logo from "@/assets/masterpiece-logo.png";

interface LineItem {
  id: string;
  description: string;
  qty: number | string;
  unitPrice: number | string;
  vatPercent: number | string;
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const { settings } = useCompanySettings();
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"paid" | "unpaid" | "overdue">("unpaid");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPin, setClientPin] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", qty: "", unitPrice: "", vatPercent: "16" },
  ]);

  useEffect(() => {
    if (settings) {
      setLineItems([
        { id: "1", description: "", qty: "", unitPrice: "", vatPercent: settings.default_vat_percent.toString() },
      ]);
    }
  }, [settings]);

  const handleClientSelect = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      setClientName(client.company_name);
      setClientPin(client.company_pin);
      setClientEmail(client.email);
      setClientPhone(client.phone_primary);
      setBillingAddress(client.billing_address);
    }
  };

  const handleProductsSelect = (products: Product[]) => {
    const newItems = products.map((product) => ({
      id: Date.now().toString() + Math.random().toString(),
      description: product.name,
      qty: "1",
      unitPrice: product.default_unit_price.toString(),
      vatPercent: product.default_vat_percent?.toString() || settings?.default_vat_percent.toString() || "16",
    }));
    setLineItems([...lineItems, ...newItems]);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: "",
        qty: "",
        unitPrice: "",
        vatPercent: settings?.default_vat_percent.toString() || "16",
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (item: LineItem) => {
    const qty = parseFloat(item.qty.toString()) || 0;
    const price = parseFloat(item.unitPrice.toString()) || 0;
    const vat = parseFloat(item.vatPercent.toString()) || 0;
    return qty * price * (1 + vat / 100);
  };

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.qty.toString()) || 0;
    const price = parseFloat(item.unitPrice.toString()) || 0;
    return sum + qty * price;
  }, 0);

  const vatTotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.qty.toString()) || 0;
    const price = parseFloat(item.unitPrice.toString()) || 0;
    const vat = parseFloat(item.vatPercent.toString()) || 0;
    return sum + qty * price * (vat / 100);
  }, 0);

  const grandTotal = subtotal + vatTotal;

  const handleSave = () => {
    if (!clientName.trim()) {
      return;
    }

    const items = lineItems
      .filter(item => item.description.trim())
      .map(item => ({
        description: item.description,
        qty: parseFloat(item.qty.toString()) || 0,
        unit_price: parseFloat(item.unitPrice.toString()) || 0,
        vat_percent: parseFloat(item.vatPercent.toString()) || 0,
        sort_order: 0,
      }));

    if (items.length === 0) {
      return;
    }

    createInvoice(
      {
        invoice: {
          client_id: selectedClient?.id || null,
          date_issued: date,
          client_name: clientName,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          billing_address: billingAddress || null,
          reference: reference || null,
          status,
          notes: notes || null,
          currency_label: settings?.currency_label || "Ksh",
          pdf_url: null,
        },
        items,
      },
      {
        onSuccess: () => {
          navigate("/history");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create New Invoice</h2>
        <p className="text-muted-foreground">Invoice number will be generated automatically.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reference (Optional)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="PO or reference number"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Existing Client</Label>
                <ClientSearchCombobox value={selectedClient?.id} onSelect={handleClientSelect} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company PIN</Label>
                  <Input
                    value={clientPin}
                    onChange={(e) => setClientPin(e.target.value)}
                    placeholder="P000000000X"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+254 ..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Billing Address</Label>
                <Textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Enter billing address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">Line Items</CardTitle>
              <div className="flex gap-2">
                <ProductMultiSelect onProductsSelect={handleProductsSelect} />
                <Button onClick={addLineItem} size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {lineItems.length > 1 && (
                      <Button
                        onClick={() => removeLineItem(item.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onChange={(e) => updateLineItem(item.id, "qty", e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.vatPercent}
                        onChange={(e) => updateLineItem(item.id, "vatPercent", e.target.value)}
                        placeholder="16"
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-right text-muted-foreground">
                    Line Total: {settings?.currency_label || "Ksh"} {calculateLineTotal(item).toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information or payment terms..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full" size="lg">
              Save Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <Card className="lg:sticky lg:top-6 lg:h-fit">
          <CardHeader className="border-b bg-muted/30">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border overflow-hidden bg-white mb-2">
                    <img src={logo} alt="Master Piece Logo" className="h-full w-full object-contain p-1" />
                  </div>
                  <h2 className="text-xs font-medium text-muted-foreground">
                    {settings?.company_name || "Master Piece International Supplies and Services"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    PIN: {settings?.company_pin || "P051566058Q"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">Auto-Generated</div>
                  <div className="text-xs text-muted-foreground mt-1">{date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-xs">
                <div>
                  <p className="font-medium mb-1">Company Details:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {settings?.address || "Lunga Lunga Business Complex, Industrial Area, Nairobi, Kenya"}<br />
                    {settings?.phone_1 || "+254 728 268 660"}<br />
                    {settings?.email || "info@mpissl.co.ke"}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Bill To:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {clientName || "Client Name"}<br />
                    {clientEmail && <>{clientEmail}<br /></>}
                    {clientPhone && <>{clientPhone}</>}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="text-xs font-medium text-muted-foreground border-b pb-2">
              INVOICE ITEMS
            </div>

            {lineItems.filter(item => item.description).length > 0 ? (
              <div className="space-y-3">
                {lineItems.filter(item => item.description).map((item, index) => (
                  <div key={item.id} className="text-sm flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.qty} × {settings?.currency_label || "Ksh"} {parseFloat(item.unitPrice.toString() || "0").toLocaleString()} 
                        {item.vatPercent && ` (VAT ${item.vatPercent}%)`}
                      </div>
                    </div>
                    <div className="font-medium text-nowrap">
                      {settings?.currency_label || "Ksh"} {calculateLineTotal(item).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No items added yet
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{settings?.currency_label || "Ksh"} {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">VAT:</span>
                <span className="font-medium">{settings?.currency_label || "Ksh"} {vatTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span className="text-primary">{settings?.currency_label || "Ksh"} {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
