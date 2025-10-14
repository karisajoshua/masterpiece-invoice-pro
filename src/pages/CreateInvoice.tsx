import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  vatPercent: number;
}

export default function CreateInvoice() {
  const [invoiceNo] = useState(`MPISS-2025-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [status, setStatus] = useState("unpaid");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", qty: 1, unitPrice: 0, vatPercent: 16 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: "", qty: 1, unitPrice: 0, vatPercent: 16 },
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
    const subtotal = item.qty * item.unitPrice;
    const vat = subtotal * (item.vatPercent / 100);
    return subtotal + vat;
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatTotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.unitPrice * (item.vatPercent / 100),
    0
  );
  const grandTotal = subtotal + vatTotal;

  const handleSave = () => {
    if (!clientName || lineItems.some((item) => !item.description)) {
      toast({
        title: "Error",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Invoice ${invoiceNo} saved successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create New Invoice</h2>
        <p className="text-muted-foreground">Fill in client and item details. Totals update automatically.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input value={invoiceNo} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Date Issued</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
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
                <Label>Client Name *</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Phone</Label>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Line Items</CardTitle>
              <Button onClick={addLineItem} size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
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
                        className="h-8 w-8 p-0 text-destructive"
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
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateLineItem(item.id, "qty", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price (Ksh)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.vatPercent}
                        onChange={(e) => updateLineItem(item.id, "vatPercent", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-right">
                    Line Total: Ksh {calculateLineTotal(item).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              Save Invoice
            </Button>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t-4 border-primary p-6 space-y-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">MP</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Master Piece International</h3>
                        <p className="text-xs text-muted-foreground">Supplies and Services</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Lunga Lunga Business Complex</p>
                      <p>Industrial Area, Nairobi, Kenya</p>
                      <p>+254 728 268 660</p>
                      <p>info@mpissl.co.ke</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xl font-bold text-primary">INVOICE</h4>
                    <p className="text-sm font-medium">{invoiceNo}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Bill To:</p>
                    <p className="font-medium">{clientName || "Client Name"}</p>
                    {clientEmail && <p className="text-sm">{clientEmail}</p>}
                    {clientPhone && <p className="text-sm">{clientPhone}</p>}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      item.description && (
                        <div key={item.id} className="text-sm flex justify-between">
                          <span>{index + 1}. {item.description} (x{item.qty})</span>
                          <span className="font-medium">
                            Ksh {calculateLineTotal(item).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>Ksh {subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT Total:</span>
                    <span>Ksh {vatTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span className="text-primary">Ksh {grandTotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="border-t pt-4 text-xs text-muted-foreground">
                  <p>Payment due within 7 days of receipt.</p>
                  <p className="mt-2 font-medium">Thank you for your business.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
