import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FieldAgent {
  id: string;
  user_id: string;
  agent_code: string;
  full_name: string;
  phone: string;
  email: string;
  region: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAgents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("field_agents")
        .select("*")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data as FieldAgent[];
    },
  });

  const { data: inactiveAgents = [], isLoading: isLoadingInactive } = useQuery({
    queryKey: ["agents-inactive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("field_agents")
        .select("*")
        .eq("is_active", false)
        .order("full_name");

      if (error) throw error;
      return data as FieldAgent[];
    },
  });

  const generateAgentCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "AGT-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const { mutateAsync: createAgent, isPending: isCreating } = useMutation({
    mutationFn: async (agentData: {
      email: string;
      password: string;
      full_name: string;
      phone: string;
      region?: string;
    }) => {
      // First create the auth user with agent role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: agentData.email,
        password: agentData.password,
        options: {
          data: {
            role: "agent",
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const agentCode = generateAgentCode();

      // Create the field_agents record
      const { data, error } = await supabase
        .from("field_agents")
        .insert({
          user_id: authData.user.id,
          agent_code: agentCode,
          full_name: agentData.full_name,
          phone: agentData.phone,
          email: agentData.email,
          region: agentData.region || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast({
        title: "Agent created",
        description: "The field agent has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: deactivateAgent, isPending: isDeactivating } = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from("field_agents")
        .update({ is_active: false })
        .eq("id", agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agents-inactive"] });
      toast({
        title: "Agent deactivated",
        description: "The field agent has been deactivated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deactivating agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: reactivateAgent, isPending: isReactivating } = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from("field_agents")
        .update({ is_active: true })
        .eq("id", agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agents-inactive"] });
      toast({
        title: "Agent reactivated",
        description: "The field agent has been reactivated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error reactivating agent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateAgentCode = async (code: string): Promise<FieldAgent | null> => {
    const { data, error } = await supabase
      .from("field_agents")
      .select("*")
      .eq("agent_code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error) return null;
    return data as FieldAgent | null;
  };

  return {
    agents,
    inactiveAgents,
    isLoading,
    isLoadingInactive,
    createAgent,
    isCreating,
    deactivateAgent,
    isDeactivating,
    reactivateAgent,
    isReactivating,
    validateAgentCode,
    generateAgentCode,
  };
}

export function useCurrentAgent() {
  const { data: agent, isLoading } = useQuery({
    queryKey: ["current-agent"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("field_agents")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as FieldAgent | null;
    },
  });

  return { agent, isLoading };
}
