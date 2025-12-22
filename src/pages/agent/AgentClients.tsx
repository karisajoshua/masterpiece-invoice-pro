import { useAgentClients } from "@/hooks/useAgentClients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function AgentClients() {
  const { clientsWithStats, isLoading } = useAgentClients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Clients</h1>
        <p className="text-muted-foreground">
          View all clients you've onboarded
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboarded Clients</CardTitle>
          <CardDescription>
            {clientsWithStats.length} client{clientsWithStats.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientsWithStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No clients yet</p>
              <p className="text-sm">Clients you onboard using your agent code will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsWithStats.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">{client.company_name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </TableCell>
                      <TableCell>
                        <div>{client.contact_person || "-"}</div>
                        <div className="text-xs text-muted-foreground">{client.phone_primary}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(client.approval_status)}>
                          {client.approval_status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{client.paid_invoices}</span>
                          <span className="text-muted-foreground">/</span>
                          <span>{client.total_invoices}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">paid</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {client.total_payments.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${client.outstanding > 0 ? "text-warning" : "text-success"}`}>
                          Ksh {client.outstanding.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={client.engagement_score} 
                            className="w-16 h-2"
                          />
                          <span className={`text-sm font-medium ${getEngagementColor(client.engagement_score)}`}>
                            {client.engagement_score}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(client.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
