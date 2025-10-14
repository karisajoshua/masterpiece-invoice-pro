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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, Trash2, FileDown, CheckCircle2 } from "lucide-react";

const mockInvoices = [
  { no: "MPISS-2025-0012", client: "Acme Corporation", date: "15 Jan 2025", amount: "58,000.00", status: "paid" },
  { no: "MPISS-2025-0011", client: "Tech Solutions Ltd", date: "12 Jan 2025", amount: "120,500.00", status: "unpaid" },
  { no: "MPISS-2025-0010", client: "Global Industries", date: "10 Jan 2025", amount: "14,250.00", status: "paid" },
  { no: "MPISS-2025-0009", client: "Metro Services", date: "08 Jan 2025", amount: "45,300.00", status: "overdue" },
  { no: "MPISS-2025-0008", client: "BuildCo Kenya", date: "05 Jan 2025", amount: "87,600.00", status: "paid" },
  { no: "MPISS-2025-0007", client: "Prime Contractors", date: "03 Jan 2025", amount: "32,750.00", status: "unpaid" },
  { no: "MPISS-2025-0006", client: "Swift Logistics", date: "01 Jan 2025", amount: "68,900.00", status: "paid" },
  { no: "MPISS-2025-0005", client: "Alpha Enterprises", date: "28 Dec 2024", amount: "91,200.00", status: "overdue" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                  <TableRow key={invoice.no} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.no}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="font-semibold">{invoice.amount}</TableCell>
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
                          {invoice.status !== "paid" && (
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 text-destructive">
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
