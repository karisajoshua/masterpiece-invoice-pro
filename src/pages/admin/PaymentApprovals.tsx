import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePayments } from "@/hooks/usePayments";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export default function PaymentApprovals() {
  const { payments, approvePayment, rejectPayment } = usePayments();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  const { data: paymentsWithDetails = [] } = useQuery({
    queryKey: ["payments-with-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          invoices(invoice_no, client_name, grand_total),
          clients(company_name, email)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const pendingPayments = paymentsWithDetails.filter((p) => p.status === "pending");
  const approvedPayments = paymentsWithDetails.filter((p) => p.status === "approved");
  const rejectedPayments = paymentsWithDetails.filter((p) => p.status === "rejected");

  const handleApprove = () => {
    if (selectedPayment) {
      approvePayment({
        paymentId: selectedPayment.id,
        notes: approvalNotes || undefined,
      });
      setSelectedPayment(null);
      setApprovalNotes("");
    }
  };

  const handleReject = () => {
    if (selectedPayment && rejectNotes.trim()) {
      rejectPayment({
        paymentId: selectedPayment.id,
        notes: rejectNotes,
      });
      setSelectedPayment(null);
      setRejectNotes("");
    }
  };

  const PaymentCard = ({ payment }: { payment: any }) => (
    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => setSelectedPayment(payment)}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium">{payment.invoices?.invoice_no}</p>
              <p className="text-sm text-muted-foreground">{payment.clients?.company_name}</p>
            </div>
            <Badge variant={
              payment.status === "approved" ? "default" :
              payment.status === "rejected" ? "destructive" : "secondary"
            }>
              {payment.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">Ksh {payment.amount_paid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Method</p>
              <p className="font-medium capitalize">{payment.payment_method.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reference</p>
              <p className="font-medium">{payment.payment_reference}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Submitted: {new Date(payment.created_at).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payment Approvals</h2>
        <p className="text-muted-foreground">Review and approve client payments</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedPayments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPayments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvedPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rejectedPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPayment && (
        <Dialog open onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <p className="text-lg font-medium">{selectedPayment.invoices?.invoice_no}</p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p className="text-lg font-medium">{selectedPayment.clients?.company_name}</p>
                </div>
                <div>
                  <Label>Amount Paid</Label>
                  <p className="text-lg font-medium text-primary">
                    Ksh {selectedPayment.amount_paid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <p className="text-lg font-medium">
                    {new Date(selectedPayment.payment_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="text-lg font-medium capitalize">
                    {selectedPayment.payment_method.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <Label>Transaction Reference</Label>
                  <p className="text-lg font-medium">{selectedPayment.payment_reference}</p>
                </div>
              </div>

              {selectedPayment.proof_of_payment_url && (
                <div>
                  <Label>Proof of Payment</Label>
                  <a
                    href={selectedPayment.proof_of_payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View attachment
                  </a>
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <Label>Approval Notes (Optional)</Label>
                    <Textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add any notes about this approval..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setRejectNotes("");
                        const notes = prompt("Enter rejection reason:");
                        if (notes) {
                          setRejectNotes(notes);
                          handleReject();
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button className="flex-1 gap-2" onClick={handleApprove}>
                      <CheckCircle className="h-4 w-4" />
                      Approve Payment
                    </Button>
                  </div>
                </>
              )}

              {selectedPayment.approval_notes && (
                <div>
                  <Label>Admin Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedPayment.approval_notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}