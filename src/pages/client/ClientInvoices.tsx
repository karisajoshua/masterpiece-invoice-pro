import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, History } from "lucide-react";
import { format } from "date-fns";
import { PaymentSubmissionDialog } from "@/components/client/PaymentSubmissionDialog";
import { PaymentHistoryDialog } from "@/components/PaymentHistoryDialog";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export default function ClientInvoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentHistoryInvoice, setPaymentHistoryInvoice] = useState<{ id: string; no: string } | null>(null);

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

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["client-all-invoices", client?.id],
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

  // Real-time subscription for invoice updates
  useEffect(() => {
    if (!client?.id) return;

    const channel = supabase
      .channel('client-invoice-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `client_id=eq.${client.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["client-all-invoices", client.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["client-all-invoices", client.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [client?.id, queryClient]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "destructive";
      case "partial": return "secondary";
      case "paid_pending_approval": return "default";
      case "fully_paid": return "default";
      default: return "secondary";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "Not Started";
      case "partial": return "Partially Paid";
      case "paid_pending_approval": return "Pending Approval";
      case "fully_paid": return "Fully Paid";
      default: return status.replace(/_/g, " ");
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("sort_order");

      if (itemsError) throw itemsError;

      const pdfDoc = await generateInvoicePDF(invoiceData, items, settings);
      pdfDoc.save(`${invoiceData.invoice_no}.pdf`);
      toast({ title: "Invoice downloaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error downloading invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">All Invoices</h2>
        <p className="text-muted-foreground">View and manage your invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid_pending_approval">Pending Approval</SelectItem>
                <SelectItem value="fully_paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No invoices found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                    <TableCell>{format(new Date(invoice.date_issued), "MMM d, yyyy")}</TableCell>
                    <TableCell>Ksh {invoice.grand_total.toLocaleString()}</TableCell>
                    <TableCell className={invoice.total_paid > 0 ? "text-green-600 font-medium" : ""}>
                      Ksh {invoice.total_paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      Ksh {(invoice.balance_due || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getPaymentStatusColor(invoice.payment_status)}
                        className={
                          invoice.payment_status === "fully_paid" 
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                            : invoice.payment_status === "partial"
                            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                            : ""
                        }
                      >
                        {getPaymentStatusLabel(invoice.payment_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaymentHistoryInvoice({ id: invoice.id, no: invoice.invoice_no })}
                          title="Payment History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        {invoice.balance_due && invoice.balance_due > 0 && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedInvoiceId && (
        <PaymentSubmissionDialog
          invoiceId={selectedInvoiceId}
          clientId={client?.id || ""}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}

      {paymentHistoryInvoice && (
        <PaymentHistoryDialog
          invoiceId={paymentHistoryInvoice.id}
          invoiceNo={paymentHistoryInvoice.no}
          open={!!paymentHistoryInvoice}
          onOpenChange={(open) => !open && setPaymentHistoryInvoice(null)}
        />
      )}
    </div>
  );
}
