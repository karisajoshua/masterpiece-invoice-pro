import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PaymentSubmissionDialog } from "@/components/client/PaymentSubmissionDialog";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const { data: client } = useQuery({
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

  const { data: invoices = [] } = useQuery({
    queryKey: ["client-invoices", client?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", client?.id)
        .order("date_issued", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!client,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["client-payments", client?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, invoices(invoice_no)")
        .eq("submitted_by_client_id", client?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!client,
  });

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
  const pendingApprovals = payments.filter((p) => p.status === "pending").length;
  const paidThisMonth = payments
    .filter((p) => p.status === "approved" && new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount_paid, 0);
  const activeInvoices = invoices.filter((inv) => inv.payment_status !== "fully_paid").length;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "destructive";
      case "partial": return "secondary";
      case "paid_pending_approval": return "default";
      case "fully_paid": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {client?.company_name}</h2>
        <p className="text-muted-foreground">Here's an overview of your account</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ksh {paidThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvoices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-medium">{invoice.invoice_no}</p>
                  <p className="text-sm text-muted-foreground">
                    Issued: {new Date(invoice.date_issued).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPaymentStatusColor(invoice.payment_status)}>
                      {invoice.payment_status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="font-medium">Ksh {invoice.grand_total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Balance: Ksh {(invoice.balance_due || 0).toLocaleString()}
                  </p>
                  {invoice.balance_due && invoice.balance_due > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedInvoiceId(invoice.id)}
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment: any) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="font-medium">{payment.invoices?.invoice_no}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">Ksh {payment.amount_paid.toLocaleString()}</p>
                  <Badge
                    variant={
                      payment.status === "approved"
                        ? "default"
                        : payment.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedInvoiceId && (
        <PaymentSubmissionDialog
          invoiceId={selectedInvoiceId}
          clientId={client?.id || ""}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
}