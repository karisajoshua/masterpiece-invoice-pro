import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Invoice {
  id: string;
  invoice_no: string;
  client_id: string | null;
  date_issued: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  billing_address: string | null;
  reference: string | null;
  status: "paid" | "unpaid" | "overdue";
  currency_label: string;
  notes: string | null;
  subtotal: number;
  vat_total: number;
  grand_total: number;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  qty: number;
  unit_price: number;
  vat_percent: number;
  line_total: number;
  sort_order: number;
  created_at: string;
}

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("invoices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createInvoice = useMutation({
    mutationFn: async ({
      invoice,
      items,
    }: {
      invoice: Omit<Invoice, "id" | "invoice_no" | "subtotal" | "vat_total" | "grand_total" | "created_at" | "updated_at">;
      items: Omit<InvoiceItem, "id" | "invoice_id" | "line_total" | "created_at">[];
    }) => {
      // Generate invoice number
      const { data: invoiceNo, error: invoiceNoError } = await supabase.rpc(
        "generate_invoice_number"
      );

      if (invoiceNoError) throw invoiceNoError;

      // Create invoice with required client_name
      const { data: newInvoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{ 
          client_id: invoice.client_id,
          client_name: invoice.client_name,
          invoice_no: invoiceNo,
          date_issued: invoice.date_issued,
          client_email: invoice.client_email,
          client_phone: invoice.client_phone,
          billing_address: invoice.billing_address,
          reference: invoice.reference,
          status: invoice.status,
          currency_label: invoice.currency_label,
          notes: invoice.notes,
          pdf_url: invoice.pdf_url,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsWithInvoiceId = items.map((item, index) => ({
        ...item,
        invoice_id: newInvoice.id,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Created",
        description: "Your invoice has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "paid" | "unpaid" | "overdue";
    }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been deleted successfully.",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      invoiceId,
      invoiceData,
      items,
    }: {
      invoiceId: string;
      invoiceData: Partial<Invoice>;
      items: InvoiceItem[];
    }) => {
      // Update invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", invoiceId);

      if (invoiceError) throw invoiceError;

      // Delete existing items
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

      // Insert new items
      const itemsToInsert = items.map((item, index) => ({
        invoice_id: invoiceId,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
        vat_percent: item.vat_percent,
        sort_order: index,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return invoiceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Updated",
        description: "The invoice has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("sort_order");

    if (error) throw error;
    return data as InvoiceItem[];
  };

  return {
    invoices,
    isLoading,
    createInvoice: createInvoice.mutate,
    updateInvoice: updateInvoiceMutation.mutate,
    updateInvoiceStatus: updateInvoiceStatus.mutate,
    deleteInvoice: deleteInvoice.mutate,
    getInvoiceItems,
  };
}

export function useInvoiceItems(invoiceId: string | null) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["invoice-items", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];

      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("sort_order");

      if (error) throw error;
      return data as InvoiceItem[];
    },
    enabled: !!invoiceId,
  });

  return { items, isLoading };
}
