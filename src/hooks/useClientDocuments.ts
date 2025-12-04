import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface ClientDocument {
  id: string;
  client_id: string;
  submitted_by_user_id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  file_size: number;
  notes: string | null;
  status: "pending" | "reviewed" | "approved" | "rejected";
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  ai_suggested_type: string | null;
  ai_confidence: number | null;
  ai_analyzed_at: string | null;
  ai_reasoning: string | null;
}

export function useClientDocuments(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["client-documents", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClientDocument[];
    },
    enabled: !!clientId,
  });

  // Real-time subscription for status changes
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel("client-documents-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "client_documents",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
          const doc = payload.new as ClientDocument;
          if (doc.status !== "pending") {
            toast({
              title: "Document Status Updated",
              description: `Your document "${doc.document_name}" has been ${doc.status}.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient, toast]);

  const submitDocument = useMutation({
    mutationFn: async ({
      file,
      documentType,
      notes,
      clientId: cId,
      aiSuggestedType,
      aiConfidence,
      aiReasoning,
    }: {
      file: File;
      documentType: string;
      notes?: string;
      clientId: string;
      aiSuggestedType?: string;
      aiConfidence?: number;
      aiReasoning?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("client-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data, error } = await supabase
        .from("client_documents")
        .insert({
          client_id: cId,
          submitted_by_user_id: user.id,
          document_name: file.name,
          document_type: documentType,
          document_url: fileName,
          file_size: file.size,
          notes,
          ai_suggested_type: aiSuggestedType,
          ai_confidence: aiConfidence,
          ai_reasoning: aiReasoning,
          ai_analyzed_at: aiSuggestedType ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents"] });
      toast({
        title: "Document Submitted",
        description: "Your document has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Submitting Document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    submitDocument: submitDocument.mutate,
    isSubmitting: submitDocument.isPending,
  };
}
