import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import masterpieceLogo from "@/assets/masterpiece-logo.png";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"admin" | "client">("client");
  const [companyName, setCompanyName] = useState("");
  const [companyPin, setCompanyPin] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phonePrimary, setPhonePrimary] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const { signIn, signUp, user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 5;

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (user && !roleLoading) {
      if (role === "admin") {
        navigate("/");
      } else if (role === "client") {
        navigate("/client/dashboard");
      } else if (role === "user" || !role) {
        // User has no valid role assigned
        toast({
          title: "Access Denied",
          description: "Your account doesn't have a valid role assigned. Please contact an administrator.",
          variant: "destructive",
        });
        // Sign out the user
        signUp("", "").then(() => {
          setSignInEmail("");
          setSignInPassword("");
        });
      }
    }
  }, [user, role, roleLoading, navigate, toast]);

  // Show loading while checking authentication and role
  if (user && roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!signUpEmail || !signUpPassword || !confirmPassword) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        if (signUpPassword !== confirmPassword) {
          toast({
            title: "Validation Error",
            description: "Passwords don't match",
            variant: "destructive",
          });
          return false;
        }
        const emailValidation = authSchema.safeParse({ email: signUpEmail, password: signUpPassword });
        if (!emailValidation.success) {
          toast({
            title: "Validation Error",
            description: emailValidation.error.errors[0].message,
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!companyName || !companyPin) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (!contactPerson || !phonePrimary) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        if (!billingAddress) {
          toast({
            title: "Validation Error",
            description: "Please fill in the billing address",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientValidation = clientRegistrationSchema.safeParse({
      accountType: "company",
      email: signUpEmail,
      password: signUpPassword,
      confirmPassword: confirmPassword,
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

    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, {
      data: {
        role: accountType,
        company_name: companyName,
        company_pin: companyPin,
        contact_person: contactPerson,
        phone_primary: phonePrimary,
        phone_secondary: phoneSecondary || null,
        billing_address: billingAddress,
        physical_address: physicalAddress || null,
        industry: industry || null,
      },
    });
    setIsLoading(false);
    
    if (!error) {
      toast({
        title: "Account created successfully",
        description: "Please sign in to access your dashboard",
      });
      setSignUpEmail("");
      setSignUpPassword("");
      setConfirmPassword("");
      setCompanyName("");
      setCompanyPin("");
      setContactPerson("");
      setPhonePrimary("");
      setPhoneSecondary("");
      setBillingAddress("");
      setPhysicalAddress("");
      setIndustry("");
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={masterpieceLogo} 
                alt="Master Piece Logo" 
                className="h-20 w-auto"
              />
            </div>
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
                  <CardDescription>
                    Step {currentStep} of {totalSteps} - {
                      currentStep === 1 ? "Account credentials" :
                      currentStep === 2 ? "Company details" :
                      currentStep === 3 ? "Contact information" :
                      currentStep === 4 ? "Address details" :
                      "Additional information"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-6">
                    {/* Step 1: Email and Password */}
                    {currentStep === 1 && (
                      <div className="space-y-4 animate-fade-in">
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
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm Password *</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Company Information */}
                    {currentStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
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
                      </div>
                    )}

                    {/* Step 3: Contact Information */}
                    {currentStep === 3 && (
                      <div className="space-y-4 animate-fade-in">
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
                        <div className="space-y-2">
                          <Label htmlFor="phone-primary">Primary Phone *</Label>
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
                          <Label htmlFor="phone-secondary">Secondary Phone</Label>
                          <Input
                            id="phone-secondary"
                            value={phoneSecondary}
                            onChange={(e) => setPhoneSecondary(e.target.value)}
                            placeholder="+254 ..."
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Address Information */}
                    {currentStep === 4 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-2">
                          <Label htmlFor="billing-address">Billing Address *</Label>
                          <Textarea
                            id="billing-address"
                            value={billingAddress}
                            onChange={(e) => setBillingAddress(e.target.value)}
                            placeholder="123 Business Street, City"
                            required
                            disabled={isLoading}
                            rows={3}
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
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 5: Industry */}
                    {currentStep === 5 && (
                      <div className="space-y-4 animate-fade-in">
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
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-4">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      )}
                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                          {isLoading ? "Creating account..." : "Sign Up"}
                        </Button>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex gap-2 justify-center pt-2">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index + 1 === currentStep
                              ? "w-8 bg-primary"
                              : index + 1 < currentStep
                              ? "w-2 bg-primary"
                              : "w-2 bg-muted"
                          }`}
                        />
                      ))}
                    </div>
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
