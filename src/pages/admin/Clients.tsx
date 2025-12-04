import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trash2, Eye, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const { clients, inactiveClients, isLoading, deleteClient, reactivateClient, isDeleting, isReactivating } = useClients();
  const { invoices } = useInvoices();
  const navigate = useNavigate();

  const getClientStats = (clientId: string) => {
    const clientInvoices = invoices.filter((inv) => inv.client_id === clientId);
    const totalInvoices = clientInvoices.length;
    const outstanding = clientInvoices.reduce(
      (sum, inv) => sum + (inv.balance_due ?? inv.grand_total - (inv.total_paid ?? 0)),
      0
    );
    return { totalInvoices, outstanding };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clients</h1>
        <p className="text-muted-foreground">
          Manage all registered clients
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({clients.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveClients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
              <CardDescription>
                {clients.length} active client{clients.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No active clients</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => {
                      const stats = getClientStats(client.id);
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.company_name}</TableCell>
                          <TableCell>{client.contact_person || "-"}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone_primary}</TableCell>
                          <TableCell>{stats.totalInvoices}</TableCell>
                          <TableCell>Ksh {stats.outstanding.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/admin/client/${client.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{client.company_name}"? This will deactivate the client and they will no longer be able to access their account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteClient(client.id)}
                                      disabled={isDeleting}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Clients</CardTitle>
              <CardDescription>
                {inactiveClients.length} deactivated client{inactiveClients.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inactiveClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No inactive clients</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.company_name}</TableCell>
                        <TableCell>{client.contact_person || "-"}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone_primary}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reactivate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reactivate Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reactivate "{client.company_name}"? They will be able to log in and access their account again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => reactivateClient(client.id)}
                                  disabled={isReactivating}
                                >
                                  Reactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
