import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const getStatusBadge = (status: string) => {
  const variants = {
    paid: "default",
    unpaid: "secondary",
    overdue: "destructive",
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function Dashboard() {
  const { invoices, isLoading } = useInvoices();
  const { settings } = useCompanySettings();

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === "paid").length;
  const unpaidInvoices = invoices.filter(inv => inv.status === "unpaid").length;
  const overdueInvoices = invoices.filter(inv => inv.status === "overdue").length;
  const outstanding = invoices
    .filter(inv => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.grand_total, 0);

  const recentInvoices = invoices.slice(0, 5);

  const kpiData = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      description: "All time",
      icon: FileText,
      trend: null,
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      description: `${totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}% of total`,
      icon: CheckCircle2,
      trend: null,
    },
    {
      title: "Unpaid Invoices",
      value: unpaidInvoices,
      description: `${overdueInvoices} overdue`,
      icon: Clock,
      trend: null,
    },
    {
      title: "Outstanding",
      value: `${settings?.currency_label || "Ksh"} ${outstanding.toLocaleString()}`,
      description: "Pending payment",
      icon: AlertCircle,
      trend: null,
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome to Your Invoicing Dashboard</h2>
        <p className="text-muted-foreground">Track all your invoices, monitor payments, and manage your clients efficiently.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              <p className="text-xs text-primary mt-2">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.invoice_no}</TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>{new Date(invoice.date_issued).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">
                      {settings?.currency_label || "Ksh"} {invoice.grand_total.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No invoices yet. Create your first invoice to get started!
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
