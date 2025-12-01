import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ClientDocument } from "./useClientDocuments";

interface DocumentWithClient extends ClientDocument {
  clients: {
    company_name: string;
    email: string;
  };
}

export function useAdminDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select(`
          *,
          clients (
            company_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DocumentWithClient[];
    },
  });

  // Real-time subscription for new documents
  useEffect(() => {
    const channel = supabase
      .channel("admin-documents-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "client_documents",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
          const doc = payload.new as ClientDocument;
          toast({
            title: "New Document Submitted",
            description: `A new document "${doc.document_name}" has been submitted.`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const updateDocumentStatus = useMutation({
    mutationFn: async ({
      documentId,
      status,
      adminNotes,
    }: {
      documentId: string;
      status: "reviewed" | "approved" | "rejected";
      adminNotes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_documents")
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by_admin_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast({
        title: "Document Status Updated",
        description: "The document status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async ({ documentId, documentUrl }: { documentId: string; documentUrl: string }) => {
      // Delete the file from storage first
      const { error: storageError } = await supabase.storage
        .from("client-documents")
        .remove([documentUrl]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
      }

      // Delete the document record
      const { error } = await supabase
        .from("client_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast({
        title: "Document Deleted",
        description: "The document has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    updateDocumentStatus: updateDocumentStatus.mutate,
    isUpdating: updateDocumentStatus.isPending,
    deleteDocument: deleteDocument.mutate,
    isDeleting: deleteDocument.isPending,
  };
}
