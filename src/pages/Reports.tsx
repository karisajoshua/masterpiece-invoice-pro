import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, FileText } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function Reports() {
  const { invoices, isLoading } = useInvoices();
  const { settings } = useCompanySettings();

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Current month data
  const currentMonthInvoices = invoices.filter((inv) => {
    const date = new Date(inv.date_issued);
    return date >= currentMonthStart && date <= currentMonthEnd;
  });

  const currentMonthRevenue = currentMonthInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.grand_total, 0);

  const unpaidTotal = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.grand_total, 0);

  const unpaidCount = invoices.filter(
    (inv) => inv.status === "unpaid" || inv.status === "overdue"
  ).length;

  // Last month data for trends
  const lastMonthInvoices = invoices.filter((inv) => {
    const date = new Date(inv.date_issued);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const lastMonthRevenue = lastMonthInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.grand_total, 0);

  const revenueGrowth = lastMonthRevenue > 0
    ? parseFloat((((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
    : 0;

  const invoiceGrowth = currentMonthInvoices.length - lastMonthInvoices.length;

  const summaryData = [
    {
      title: "Total Revenue (This Month)",
      value: `${settings.currency_label} ${currentMonthRevenue.toLocaleString()}`,
      description: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      icon: DollarSign,
      trend: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}% from last month`,
    },
    {
      title: "Unpaid Total",
      value: `${settings.currency_label} ${unpaidTotal.toLocaleString()}`,
      description: "Outstanding amount",
      icon: TrendingUp,
      trend: `${unpaidCount} unpaid invoices`,
    },
    {
      title: "Invoices Issued",
      value: currentMonthInvoices.length.toString(),
      description: "This month",
      icon: FileText,
      trend: `${invoiceGrowth > 0 ? "+" : ""}${invoiceGrowth} from last month`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance Insights</h2>
        <p className="text-muted-foreground">Monitor your business performance and payment trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryData.map((item) => (
          <Card key={item.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              <p className="text-xs text-primary mt-2">{item.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Chart visualization coming soon</p>
              <p className="text-xs mt-2">Monthly revenue breakdown and trends</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="space-y-4 w-full max-w-sm">
              {(() => {
                const totalInvoices = invoices.length || 1;
                const paidCount = invoices.filter((inv) => inv.status === "paid").length;
                const unpaidCount = invoices.filter((inv) => inv.status === "unpaid").length;
                const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

                const paidPercent = ((paidCount / totalInvoices) * 100).toFixed(0);
                const unpaidPercent = ((unpaidCount / totalInvoices) * 100).toFixed(0);
                const overduePercent = ((overdueCount / totalInvoices) * 100).toFixed(0);

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-success"></div>
                        <span className="text-sm">Paid</span>
                      </div>
                      <span className="font-semibold">{paidCount} ({paidPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-warning"></div>
                        <span className="text-sm">Unpaid</span>
                      </div>
                      <span className="font-semibold">{unpaidCount} ({unpaidPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full bg-destructive"></div>
                        <span className="text-sm">Overdue</span>
                      </div>
                      <span className="font-semibold">{overdueCount} ({overduePercent}%)</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
