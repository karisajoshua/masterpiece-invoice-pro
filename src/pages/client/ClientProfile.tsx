import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ClientProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ["client-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    contact_person: "",
    email: "",
    phone_primary: "",
    phone_secondary: "",
    billing_address: "",
    physical_address: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        contact_person: client.contact_person || "",
        email: client.email || "",
        phone_primary: client.phone_primary || "",
        phone_secondary: client.phone_secondary || "",
        billing_address: client.billing_address || "",
        physical_address: client.physical_address || "",
      });
    }
  }, [client]);

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", client?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile", user?.id] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={client?.company_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Company PIN</Label>
              <Input value={client?.company_pin} disabled />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={client?.industry || "Not specified"} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Phone</Label>
                <Input
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Phone</Label>
                <Input
                  value={formData.phone_secondary}
                  onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Address</Label>
                <Textarea
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Textarea
                  value={formData.physical_address}
                  onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}