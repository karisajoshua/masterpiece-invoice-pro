import { useAgentClients } from "@/hooks/useAgentClients";
import { useCurrentAgent } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const COLORS = ["hsl(238, 47%, 29%)", "hsl(43, 87%, 61%)", "hsl(142, 71%, 45%)", "hsl(27, 98%, 63%)", "hsl(0, 65%, 51%)"];

export default function AgentDashboard() {
  const { agent } = useCurrentAgent();
  const { clientsWithStats, stats, funnelData, isLoading } = useAgentClients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = clientsWithStats.reduce((acc, client) => {
    const month = new Date(client.created_at).toLocaleString("default", { month: "short" });
    const existing = acc.find((d) => d.month === month);
    if (existing) {
      existing.clients += 1;
      existing.active += client.approval_status === "approved" ? 1 : 0;
    } else {
      acc.push({
        month,
        clients: 1,
        active: client.approval_status === "approved" ? 1 : 0,
      });
    }
    return acc;
  }, [] as { month: string; clients: number; active: number }[]);

  const paymentStatusData = [
    { name: "No Payment", value: clientsWithStats.filter((c) => c.total_payments === 0).length },
    { name: "Partial", value: clientsWithStats.filter((c) => c.total_payments > 0 && c.outstanding > 0).length },
    { name: "Fully Paid", value: clientsWithStats.filter((c) => c.paid_invoices === c.total_invoices && c.total_invoices > 0).length },
  ].filter((d) => d.value > 0);

  const funnelItems = [
    { label: "Registered", value: funnelData.registered, icon: Users },
    { label: "Active", value: funnelData.active, icon: UserCheck },
    { label: "Has Invoices", value: funnelData.hasInvoices, icon: BarChart3 },
    { label: "Made Payment", value: funnelData.madePayment, icon: TrendingUp },
    { label: "Fully Paid", value: funnelData.fullyPaid, icon: Target },
  ];

  const maxFunnelValue = Math.max(funnelData.registered, 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your client onboarding performance
          </p>
        </div>
        {agent && (
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20">
            {agent.agent_code}
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">All onboarded clients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            <UserCheck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved & active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin review</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">New registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Trend */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Onboarding Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(238, 47%, 29%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(238, 47%, 29%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="clients"
                    stroke="hsl(238, 47%, 29%)"
                    fillOpacity={1}
                    fill="url(#colorClients)"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(142, 71%, 45%)"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="Active"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {paymentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No payment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Engagement Funnel */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Client Engagement Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelItems.map((item, index) => {
              const percentage = maxFunnelValue > 0 ? (item.value / maxFunnelValue) * 100 : 0;
              const ItemIcon = item.icon;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ItemIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-8" 
                      style={{
                        width: `${Math.max(percentage, 20)}%`,
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                      style={{ color: percentage > 50 ? "white" : "inherit" }}
                    >
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Clients Table */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Recent Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientsWithStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No clients onboarded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoices</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Paid</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsWithStats.slice(0, 5).map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-medium">{client.company_name}</div>
                        <div className="text-xs text-muted-foreground">{client.contact_person}</div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            client.approval_status === "approved"
                              ? "default"
                              : client.approval_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {client.approval_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm">{client.total_invoices}</td>
                      <td className="py-3 px-2 text-sm">{client.paid_invoices}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={client.engagement_score} className="w-16 h-2" />
                          <span className="text-xs font-medium">{client.engagement_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
