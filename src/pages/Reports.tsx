import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, FileText } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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

  // Prepare data for Monthly Income Trend chart (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthInvoices = invoices.filter((inv) => {
      const date = new Date(inv.date_issued);
      return date >= monthStart && date <= monthEnd;
    });
    
    const monthRevenue = monthInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.grand_total, 0);
    
    monthlyData.push({
      month: format(monthDate, "MMM"),
      revenue: monthRevenue,
      invoices: monthInvoices.length,
    });
  }

  // Prepare data for Payment Status Breakdown chart
  const totalInvoices = invoices.length || 1;
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const unpaidCountForChart = invoices.filter((inv) => inv.status === "unpaid").length;
  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

  const statusData = [
    { name: "Paid", value: paidCount, color: "hsl(var(--success))" },
    { name: "Unpaid", value: unpaidCountForChart, color: "hsl(var(--warning))" },
    { name: "Overdue", value: overdueCount, color: "hsl(var(--destructive))" },
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
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    `${settings.currency_label} ${value.toLocaleString()}`,
                    "Revenue"
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    `${value} (${((value / totalInvoices) * 100).toFixed(0)}%)`,
                    "Invoices"
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
