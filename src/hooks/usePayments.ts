import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  invoice_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  proof_of_payment_url: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by_client_id: string | null;
  approved_by_admin_id: string | null;
  approval_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayments(invoiceId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", invoiceId],
    queryFn: async () => {
      let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
      
      if (invoiceId) {
        query = query.eq("invoice_id", invoiceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!invoiceId || invoiceId === undefined,
  });

  const submitPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at" | "updated_at" | "approved_by_admin_id" | "approval_notes" | "approved_at">) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Payment submitted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approvePayment = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes?: string }) => {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approval_notes: notes || null,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Payment approved successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectPayment = useMutation({
    mutationFn: async ({ paymentId, notes }: { paymentId: string; notes: string }) => {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "rejected",
          approval_notes: notes,
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: "Payment rejected" });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    payments,
    isLoading,
    submitPayment: submitPayment.mutate,
    approvePayment: approvePayment.mutate,
    rejectPayment: rejectPayment.mutate,
  };
}