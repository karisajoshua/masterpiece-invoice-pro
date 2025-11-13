import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayments } from "@/hooks/usePayments";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle } from "lucide-react";

interface PaymentSubmissionDialogProps {
  invoiceId: string;
  clientId: string;
  onClose: () => void;
}

export function PaymentSubmissionDialog({
  invoiceId,
  clientId,
  onClose,
}: PaymentSubmissionDialogProps) {
  const { toast } = useToast();
  const { submitPayment } = usePayments();
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const { data: invoice } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${invoiceId}-${Date.now()}.${fileExt}`;
      const filePath = `${clientId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      setProofUrl(data.publicUrl);
      toast({ title: "Proof of payment uploaded" });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    if (invoice && amountValue > invoice.balance_due) {
      toast({
        title: "Amount exceeds balance",
        description: "Payment amount cannot exceed the balance due",
        variant: "destructive",
      });
      return;
    }

    if (!transactionRef.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Please enter a transaction reference",
        variant: "destructive",
      });
      return;
    }

    submitPayment({
      invoice_id: invoiceId,
      amount_paid: amountValue,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      payment_reference: transactionRef,
      proof_of_payment_url: proofUrl,
      status: "pending",
      submitted_by_client_id: clientId,
    });

    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Submit Payment</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] px-6">
          <div className="space-y-6 pb-6">
            {/* Invoice Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-base">Invoice Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Invoice Number</p>
                  <p className="font-medium">{invoice.invoice_no}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-medium">Ksh {invoice.grand_total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Amount Paid</p>
                  <p className="font-medium">Ksh {invoice.total_paid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Balance Due</p>
                  <p className="font-medium text-primary">Ksh {invoice.balance_due.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount to Pay *</Label>
                <Input
                  type="number"
                  min="0"
                  max={invoice.balance_due}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transaction Reference *</Label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction ID or reference"
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label>Proof of Payment (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="text-base"
                  />
                  {uploading && <Upload className="w-5 h-5 animate-spin text-muted-foreground" />}
                  {proofUrl && <CheckCircle className="w-5 h-5 text-green-600" />}
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Uploading file...</p>}
                {proofUrl && <p className="text-sm text-green-600">File uploaded successfully</p>}
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                  className="text-base resize-none"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t bg-background">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="min-w-[100px]">
            Submit Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}