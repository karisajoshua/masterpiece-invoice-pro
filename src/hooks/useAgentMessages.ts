import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";
import { useCurrentAgent } from "./useAgents";
import { useEffect } from "react";

export interface AgentMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  agent_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useAgentMessages() {
  const { user } = useAuth();
  const { agent } = useCurrentAgent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["agent-messages", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AgentMessage[];
    },
    enabled: !!agent,
  });

  const unreadCount = messages.filter(
    (m) => !m.is_read && m.receiver_id === user?.id
  ).length;

  const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (data: { receiverId: string; message: string }) => {
      if (!user || !agent) throw new Error("Not authenticated");

      const { error } = await supabase.from("agent_messages").insert({
        sender_id: user.id,
        receiver_id: data.receiverId,
        agent_id: agent.id,
        message: data.message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("agent_messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-messages"] });
    },
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!agent) return;

    const channel = supabase
      .channel("agent-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
          filter: `agent_id=eq.${agent.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["agent-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agent, queryClient]);

  return {
    messages,
    isLoading,
    unreadCount,
    sendMessage,
    isSending,
    markAsRead,
  };
}

// Hook for admin to view all agent messages
export function useAdminAgentMessages(agentId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-agent-messages", agentId],
    queryFn: async () => {
      if (!agentId) return [];

      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AgentMessage[];
    },
    enabled: !!agentId,
  });

  const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (data: { receiverId: string; message: string; agentId: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("agent_messages").insert({
        sender_id: user.id,
        receiver_id: data.receiverId,
        agent_id: data.agentId,
        message: data.message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agent-messages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("agent_messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agent-messages"] });
    },
  });

  // Subscribe to realtime messages
  useEffect(() => {
    if (!agentId) return;

    const channel = supabase
      .channel("admin-agent-messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
          filter: `agent_id=eq.${agentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-agent-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage,
    isSending,
    markAsRead,
  };
}
