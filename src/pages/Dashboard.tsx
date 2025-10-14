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

const kpiData = [
  {
    title: "Total Invoices",
    value: "24",
    description: "All invoices created to date",
    icon: FileText,
    trend: "+3 this month",
  },
  {
    title: "Paid Invoices",
    value: "18",
    description: "Payments received",
    icon: CheckCircle2,
    trend: "75% paid rate",
  },
  {
    title: "Unpaid Invoices",
    value: "5",
    description: "Awaiting payment",
    icon: Clock,
    trend: "21% unpaid",
  },
  {
    title: "Outstanding",
    value: "Ksh 192,750",
    description: "Total amount due",
    icon: AlertCircle,
    trend: "Due within 7 days",
  },
];

const recentInvoices = [
  { no: "MPISS-2025-0012", client: "Acme Corp", date: "15 Jan 2025", amount: "Ksh 58,000", status: "paid" },
  { no: "MPISS-2025-0011", client: "Tech Solutions Ltd", date: "12 Jan 2025", amount: "Ksh 120,500", status: "unpaid" },
  { no: "MPISS-2025-0010", client: "Global Industries", date: "10 Jan 2025", amount: "Ksh 14,250", status: "paid" },
  { no: "MPISS-2025-0009", client: "Metro Services", date: "08 Jan 2025", amount: "Ksh 45,300", status: "overdue" },
  { no: "MPISS-2025-0008", client: "BuildCo Kenya", date: "05 Jan 2025", amount: "Ksh 87,600", status: "paid" },
];

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
              {recentInvoices.map((invoice) => (
                <TableRow key={invoice.no} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{invoice.no}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
