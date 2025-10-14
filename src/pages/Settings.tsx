import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [companyName, setCompanyName] = useState("Master Piece International Supplies and Services");
  const [invoicePrefix, setInvoicePrefix] = useState("MPISS-");
  const [address, setAddress] = useState("Lunga Lunga Business Complex, Industrial Area, Nairobi, Kenya");
  const [phone1, setPhone1] = useState("+254 728 268 660");
  const [phone2, setPhone2] = useState("+254 752 268 660");
  const [phone3, setPhone3] = useState("+254 780 566 660");
  const [email, setEmail] = useState("info@mpissl.co.ke");
  const [currencyLabel, setCurrencyLabel] = useState("Ksh");
  const [defaultVat, setDefaultVat] = useState("16");
  const [paymentTerms, setPaymentTerms] = useState("Payment due within 7 days of receipt.");

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your company settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Settings Reset",
      description: "Default settings have been restored.",
      variant: "destructive",
    });
  };

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
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                  <span className="text-2xl font-bold text-primary">MP</span>
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
