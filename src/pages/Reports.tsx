import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, FileText } from "lucide-react";

export default function Reports() {
  const summaryData = [
    {
      title: "Total Revenue (This Month)",
      value: "Ksh 452,350",
      description: "January 2025",
      icon: DollarSign,
      trend: "+12.5% from last month",
    },
    {
      title: "Unpaid Total",
      value: "Ksh 192,750",
      description: "Outstanding amount",
      icon: TrendingUp,
      trend: "5 unpaid invoices",
    },
    {
      title: "Invoices Issued",
      value: "24",
      description: "This month",
      icon: FileText,
      trend: "+3 from last month",
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-success"></div>
                  <span className="text-sm">Paid</span>
                </div>
                <span className="font-semibold">18 (75%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-warning"></div>
                  <span className="text-sm">Unpaid</span>
                </div>
                <span className="font-semibold">5 (21%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-destructive"></div>
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="font-semibold">1 (4%)</span>
              </div>
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
