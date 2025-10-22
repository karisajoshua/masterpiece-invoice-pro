import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { clientRegistrationSchema } from "@/schemas/clientRegistration";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [accountType, setAccountType] = useState<"admin" | "client">("admin");
  const [companyName, setCompanyName] = useState("");
  const [companyPin, setCompanyPin] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phonePrimary, setPhonePrimary] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email: signInEmail, password: signInPassword });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    setIsLoading(false);
    
    if (!error) {
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email: signUpEmail, password: signUpPassword });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (accountType === "client") {
      const clientValidation = clientRegistrationSchema.safeParse({
        accountType: "company",
        email: signUpEmail,
        password: signUpPassword,
        confirmPassword: signUpPassword,
        companyName,
        companyPin,
        contactPerson,
        phonePrimary,
        phoneSecondary,
        billingAddress,
        physicalAddress,
        industry,
      });
      if (!clientValidation.success) {
        toast({
          title: "Validation Error",
          description: clientValidation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, {
      data: {
        role: accountType,
        ...(accountType === "client" && {
          company_name: companyName,
          company_pin: companyPin,
          contact_person: contactPerson,
          phone_primary: phonePrimary,
          phone_secondary: phoneSecondary || null,
          billing_address: billingAddress,
          physical_address: physicalAddress || null,
          industry: industry || null,
        }),
      },
    });
    setIsLoading(false);
    
    if (!error) {
      toast({
        title: "Account created successfully",
        description: accountType === "client" 
          ? "Please sign in to access your dashboard" 
          : "Please sign in to continue",
      });
      setSignUpEmail("");
      setSignUpPassword("");
      setCompanyName("");
      setCompanyPin("");
      setContactPerson("");
      setPhonePrimary("");
      setPhoneSecondary("");
      setBillingAddress("");
      setPhysicalAddress("");
      setIndustry("");
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary">
                <span className="text-2xl font-bold text-primary-foreground">MP</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Master Piece</h1>
            <p className="text-muted-foreground mt-2">Invoicing Console</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-3">
                      <Label>Account Type</Label>
                      <RadioGroup value={accountType} onValueChange={(v) => setAccountType(v as "admin" | "client")}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="admin" id="admin" />
                          <Label htmlFor="admin" className="font-normal cursor-pointer">Admin Account</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="client" id="client" />
                          <Label htmlFor="client" className="font-normal cursor-pointer">Client Account</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    {accountType === "client" && (
                      <>
                        <div className="border-t pt-4 space-y-4">
                          <h3 className="font-medium text-sm">Company Information</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name *</Label>
                            <Input
                              id="company-name"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Your Company Ltd"
                              required
                              disabled={isLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company-pin">Company PIN *</Label>
                            <Input
                              id="company-pin"
                              value={companyPin}
                              onChange={(e) => setCompanyPin(e.target.value)}
                              placeholder="P000000000X"
                              required
                              disabled={isLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contact-person">Contact Person *</Label>
                            <Input
                              id="contact-person"
                              value={contactPerson}
                              onChange={(e) => setContactPerson(e.target.value)}
                              placeholder="John Doe"
                              required
                              disabled={isLoading}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="phone-primary">Phone Primary *</Label>
                              <Input
                                id="phone-primary"
                                value={phonePrimary}
                                onChange={(e) => setPhonePrimary(e.target.value)}
                                placeholder="+254 ..."
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone-secondary">Phone Secondary</Label>
                              <Input
                                id="phone-secondary"
                                value={phoneSecondary}
                                onChange={(e) => setPhoneSecondary(e.target.value)}
                                placeholder="+254 ..."
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="billing-address">Billing Address *</Label>
                            <Textarea
                              id="billing-address"
                              value={billingAddress}
                              onChange={(e) => setBillingAddress(e.target.value)}
                              placeholder="123 Business Street, City"
                              required
                              disabled={isLoading}
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="physical-address">Physical Address</Label>
                            <Textarea
                              id="physical-address"
                              value={physicalAddress}
                              onChange={(e) => setPhysicalAddress(e.target.value)}
                              placeholder="456 Office Park, City"
                              disabled={isLoading}
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
                              <SelectTrigger id="industry">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="construction">Construction</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="hospitality">Hospitality</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Background Image & Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2340&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center text-primary-foreground space-y-6 max-w-lg">
          <h2 className="text-4xl font-bold">Welcome to Master Piece</h2>
          <p className="text-xl opacity-90">
            Streamline your invoicing process with our powerful and intuitive console.
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Professional Invoices</h3>
                <p className="text-sm opacity-80">Create beautiful invoices in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Track Payments</h3>
                <p className="text-sm opacity-80">Monitor invoice status and payments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Business Insights</h3>
                <p className="text-sm opacity-80">Get detailed reports and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
