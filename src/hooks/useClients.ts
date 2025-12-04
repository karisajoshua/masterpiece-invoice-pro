import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  user_id: string | null;
  company_name: string;
  company_pin: string;
  contact_person: string | null;
  email: string;
  phone_primary: string;
  phone_secondary: string | null;
  billing_address: string;
  physical_address: string | null;
  industry: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("company_name");

      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: inactiveClients = [], isLoading: isLoadingInactive } = useQuery({
    queryKey: ["clients-inactive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", false)
        .order("company_name");

      if (error) throw error;
      return data as Client[];
    },
  });

  const createClient = useMutation({
    mutationFn: async (client: Omit<Client, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("clients")
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from("clients")
        .update({ is_active: false })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-inactive"] });
      toast({ title: "Client deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reactivateClient = useMutation({
    mutationFn: async (clientId: string) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ is_active: true })
        .eq("id", clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients-inactive"] });
      toast({ title: "Client reactivated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error reactivating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    clients,
    inactiveClients,
    isLoading,
    isLoadingInactive,
    createClient: createClient.mutate,
    deleteClient: deleteClient.mutate,
    reactivateClient: reactivateClient.mutate,
    isDeleting: deleteClient.isPending,
    isReactivating: reactivateClient.isPending,
  };
}