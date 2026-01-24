import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle, Receipt, CreditCard, FileText } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface PaymentHistoryDialogProps {
  invoiceId: string;
  invoiceNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Payment {
  id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  payment_reference: string;
  status: string;
  approval_notes: string | null;
  proof_of_payment_url: string | null;
  created_at: string;
  approved_at: string | null;
}

export function PaymentHistoryDialog({
  invoiceId,
  invoiceNo,
  open,
  onOpenChange,
}: PaymentHistoryDialogProps) {
  const { settings } = useCompanySettings();
  const currencyLabel = settings?.currency_label || "Ksh";

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payment-history", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: open && !!invoiceId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalApproved = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount_paid, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History - {invoiceNo}
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg border bg-green-500/5 p-4">
            <p className="text-sm text-muted-foreground">Total Approved</p>
            <p className="text-xl font-bold text-green-600">
              {currencyLabel} {totalApproved.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-amber-500/5 p-4">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-xl font-bold text-amber-600">
              {currencyLabel} {totalPending.toLocaleString()}
            </p>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="relative pl-8 pb-4"
                >
                  {/* Timeline line */}
                  {index < payments.length - 1 && (
                    <div className="absolute left-[9px] top-6 h-full w-0.5 bg-border" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1">
                    {getStatusIcon(payment.status)}
                  </div>

                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-lg font-semibold">
                          {currencyLabel} {payment.amount_paid.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.payment_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Method:</span>{" "}
                        <span className="font-medium capitalize">{payment.payment_method.replace("_", " ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reference:</span>{" "}
                        <span className="font-medium">{payment.payment_reference}</span>
                      </div>
                    </div>

                    {payment.proof_of_payment_url && (
                      <div className="mt-3">
                        <a
                          href={payment.proof_of_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Proof of Payment
                        </a>
                      </div>
                    )}

                    {payment.status === "approved" && payment.approved_at && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Approved on {format(new Date(payment.approved_at), "MMM d, yyyy")}
                      </p>
                    )}

                    {payment.status === "rejected" && payment.approval_notes && (
                      <div className="mt-3 p-2 rounded bg-destructive/10 text-sm">
                        <span className="font-medium text-destructive">Rejection Reason:</span>{" "}
                        <span className="text-destructive/80">{payment.approval_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
