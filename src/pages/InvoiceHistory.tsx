import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, Trash2, FileDown, CheckCircle2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    paid: "default",
    unpaid: "secondary",
    overdue: "destructive",
  };
  
  return (
    <Badge variant={variants[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function InvoiceHistory() {
  const { invoices, isLoading, updateInvoiceStatus, deleteInvoice } = useInvoices();
  const { settings } = useCompanySettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">All Invoices</h2>
        <p className="text-muted-foreground">Search, filter, and manage your invoice records.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Invoice Records</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client name or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "paid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("paid")}
                >
                  Paid
                </Button>
                <Button
                  variant={filterStatus === "unpaid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("unpaid")}
                >
                  Unpaid
                </Button>
                <Button
                  variant={filterStatus === "overdue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("overdue")}
                >
                  Overdue
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount (Ksh)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>{new Date(invoice.date_issued).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">
                      {settings?.currency_label || "Ksh"} {invoice.grand_total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <FileDown className="h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => updateInvoiceStatus({ id: invoice.id, status: "paid" })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this invoice?")) {
                                deleteInvoice(invoice.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No invoices found. {filterStatus !== "all" && "Try adjusting your filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
