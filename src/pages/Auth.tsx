import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

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

    setIsLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword);
    setIsLoading(false);
    
    if (!error) {
      setSignUpEmail("");
      setSignUpPassword("");
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
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
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
                      <Label htmlFor="signup-password">Password</Label>
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
