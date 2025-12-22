import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAgent } from "./useAgents";

export interface AgentClient {
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
  agent_id: string | null;
  approval_status: "pending" | "approved" | "rejected" | null;
  created_at: string;
  updated_at: string;
}

export interface AgentClientWithStats extends AgentClient {
  total_invoices: number;
  paid_invoices: number;
  total_payments: number;
  outstanding: number;
  engagement_score: number;
  last_activity: string | null;
}

export function useAgentClients() {
  const { agent } = useCurrentAgent();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["agent-clients", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AgentClient[];
    },
    enabled: !!agent,
  });

  const { data: clientsWithStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ["agent-clients-stats", agent?.id],
    queryFn: async () => {
      if (!agent) return [];

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", agent.id);

      if (clientsError) throw clientsError;

      // Fetch all invoices for these clients
      const clientIds = clientsData.map((c) => c.id);
      
      const { data: invoices = [], error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .in("client_id", clientIds);

      if (invoicesError) throw invoicesError;

      // Fetch all payments for these invoices
      const invoiceIds = invoices.map((i) => i.id);
      
      const { data: payments = [], error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .in("invoice_id", invoiceIds);

      if (paymentsError) throw paymentsError;

      // Calculate stats for each client
      return clientsData.map((client) => {
        const clientInvoices = invoices.filter((i) => i.client_id === client.id);
        const clientPayments = payments.filter((p) =>
          clientInvoices.some((i) => i.id === p.invoice_id)
        );

        const paidInvoices = clientInvoices.filter(
          (i) => i.payment_status === "fully_paid"
        ).length;

        const totalPayments = clientPayments
          .filter((p) => p.status === "approved")
          .reduce((sum, p) => sum + Number(p.amount_paid), 0);

        const outstanding = clientInvoices.reduce(
          (sum, i) => sum + (i.balance_due ?? i.grand_total - (i.total_paid ?? 0)),
          0
        );

        // Calculate engagement score (0-100)
        let score = 0;
        if (client.approval_status === "approved") score += 20;
        if (clientInvoices.length > 0) score += 30;
        if (paidInvoices > 0) score += 30;
        if (paidInvoices === clientInvoices.length && clientInvoices.length > 0)
          score += 20;

        // Get last activity date
        const lastInvoice = clientInvoices.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        const lastPayment = clientPayments.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        let lastActivity = null;
        if (lastInvoice || lastPayment) {
          const invoiceDate = lastInvoice ? new Date(lastInvoice.created_at) : new Date(0);
          const paymentDate = lastPayment ? new Date(lastPayment.created_at) : new Date(0);
          lastActivity = invoiceDate > paymentDate 
            ? lastInvoice?.created_at 
            : lastPayment?.created_at;
        }

        return {
          ...client,
          total_invoices: clientInvoices.length,
          paid_invoices: paidInvoices,
          total_payments: totalPayments,
          outstanding,
          engagement_score: score,
          last_activity: lastActivity,
        } as AgentClientWithStats;
      });
    },
    enabled: !!agent,
  });

  // Dashboard statistics
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.approval_status === "approved" && c.is_active).length,
    pendingApproval: clients.filter((c) => c.approval_status === "pending").length,
    thisMonth: clients.filter((c) => {
      const created = new Date(c.created_at);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  // Funnel data
  const funnelData = {
    registered: clients.length,
    active: clients.filter((c) => c.approval_status === "approved" && c.is_active).length,
    hasInvoices: clientsWithStats.filter((c) => c.total_invoices > 0).length,
    madePayment: clientsWithStats.filter((c) => c.total_payments > 0).length,
    fullyPaid: clientsWithStats.filter(
      (c) => c.paid_invoices === c.total_invoices && c.total_invoices > 0
    ).length,
  };

  return {
    clients,
    clientsWithStats,
    isLoading: isLoading || isLoadingStats,
    stats,
    funnelData,
  };
}
