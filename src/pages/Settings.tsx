import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import logo from "@/assets/masterpiece-logo.png";

export default function Settings() {
  const { settings, isLoading, updateSettings } = useCompanySettings();

  const [companyName, setCompanyName] = useState("");
  const [companyPin, setCompanyPin] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [address, setAddress] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [email, setEmail] = useState("");
  const [currencyLabel, setCurrencyLabel] = useState("");
  const [defaultVat, setDefaultVat] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name);
      setCompanyPin(settings.company_pin);
      setInvoicePrefix(settings.invoice_prefix);
      setAddress(settings.address);
      setPhone1(settings.phone_1);
      setPhone2(settings.phone_2);
      setPhone3(settings.phone_3);
      setEmail(settings.email);
      setCurrencyLabel(settings.currency_label);
      setDefaultVat(settings.default_vat_percent.toString());
      setPaymentTerms(settings.payment_terms_text);
      setPaymentDetails(settings.payment_details || "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      company_name: companyName,
      company_pin: companyPin,
      invoice_prefix: invoicePrefix,
      address,
      phone_1: phone1,
      phone_2: phone2,
      phone_3: phone3,
      email,
      currency_label: currencyLabel,
      default_vat_percent: parseFloat(defaultVat),
      payment_terms_text: paymentTerms,
      payment_details: paymentDetails,
    });
  };

  const handleReset = () => {
    if (settings) {
      setCompanyName(settings.company_name);
      setCompanyPin(settings.company_pin);
      setInvoicePrefix(settings.invoice_prefix);
      setAddress(settings.address);
      setPhone1(settings.phone_1);
      setPhone2(settings.phone_2);
      setPhone3(settings.phone_3);
      setEmail(settings.email);
      setCurrencyLabel(settings.currency_label);
      setDefaultVat(settings.default_vat_percent.toString());
      setPaymentTerms(settings.payment_terms_text);
      setPaymentDetails(settings.payment_details || "");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Settings</h2>
        <p className="text-muted-foreground">Manage your company profile and invoice defaults.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Profile</CardTitle>
            <CardDescription>Update your company information and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="e.g., MPISS-"
              />
              <p className="text-xs text-muted-foreground">
                Invoices will be numbered as: {invoicePrefix}YYYY-####
              </p>
            </div>
            <div className="space-y-2">
              <Label>Company PIN</Label>
              <Input
                value={companyPin}
                onChange={(e) => setCompanyPin(e.target.value)}
                placeholder="Enter company PIN"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border overflow-hidden bg-white">
                  <img src={logo} alt="Master Piece Logo" className="h-full w-full object-contain p-2" />
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: PNG or JPG, max 2MB, square format
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Details</CardTitle>
            <CardDescription>Information displayed on invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter business address"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Phone 1</Label>
                <Input
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  placeholder="+254 ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Phone 2</Label>
                <Input
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  placeholder="+254 ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Phone 3</Label>
                <Input
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value)}
                  placeholder="+254 ..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@company.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Defaults</CardTitle>
            <CardDescription>Set default values for new invoices</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Currency Label</Label>
              <Input
                value={currencyLabel}
                onChange={(e) => setCurrencyLabel(e.target.value)}
                placeholder="e.g., Ksh, USD, EUR"
              />
            </div>
            <div className="space-y-2">
              <Label>Default VAT %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={defaultVat}
                onChange={(e) => setDefaultVat(e.target.value)}
                placeholder="16"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms (Days)</Label>
              <Input
                type="number"
                min="0"
                value="7"
                placeholder="7"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Default Payment Terms Text</Label>
              <Textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Enter default payment terms"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
            <CardDescription>Bank details displayed on invoices for client payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Payment Details</Label>
              <Textarea
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder="Bank: KCB KICC Branch&#10;A/C: 1329591283&#10;Paybill: 522533&#10;A/C No: 9097900"
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                These details will appear on every generated invoice PDF.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1 md:flex-initial">
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset Defaults
        </Button>
      </div>
    </div>
  );
}
