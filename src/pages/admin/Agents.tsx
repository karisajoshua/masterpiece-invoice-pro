import { useState } from "react";
import { useAgents, FieldAgent } from "@/hooks/useAgents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Trash2, RotateCcw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Agents() {
  const { agents, inactiveAgents, isLoading, createAgent, isCreating, deactivateAgent, isDeactivating, reactivateAgent, isReactivating } = useAgents();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", full_name: "", phone: "", region: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAgent(formData);
    setIsDialogOpen(false);
    setFormData({ email: "", password: "", full_name: "", phone: "", region: "" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Agent code copied to clipboard" });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-muted-foreground">Loading agents...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Field Agents</h1>
          <p className="text-muted-foreground">Manage field agents and their codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Agent</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Field Agent</DialogTitle>
              <DialogDescription>Add a new field agent to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>{isCreating ? "Creating..." : "Create Agent"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({agents.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveAgents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader><CardTitle>Active Agents</CardTitle></CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Users className="mx-auto h-12 w-12 mb-2 opacity-50" /><p>No active agents</p></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead><TableHead>Agent Code</TableHead><TableHead>Contact</TableHead><TableHead>Region</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">{agent.agent_code}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(agent.agent_code)}><Copy className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                        <TableCell><div>{agent.email}</div><div className="text-xs text-muted-foreground">{agent.phone}</div></TableCell>
                        <TableCell>{agent.region || "-"}</TableCell>
                        <TableCell>{format(new Date(agent.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Deactivate Agent</AlertDialogTitle><AlertDialogDescription>This will deactivate {agent.full_name}'s account.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deactivateAgent(agent.id)} disabled={isDeactivating}>Deactivate</AlertDialogAction></AlertDialogFooter>
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

        <TabsContent value="inactive">
          <Card>
            <CardHeader><CardTitle>Inactive Agents</CardTitle></CardHeader>
            <CardContent>
              {inactiveAgents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Users className="mx-auto h-12 w-12 mb-2 opacity-50" /><p>No inactive agents</p></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Agent Code</TableHead><TableHead>Contact</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {inactiveAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.full_name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{agent.agent_code}</Badge></TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="sm" variant="outline"><RotateCcw className="h-4 w-4 mr-1" />Reactivate</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Reactivate Agent</AlertDialogTitle><AlertDialogDescription>This will reactivate {agent.full_name}'s account.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => reactivateAgent(agent.id)} disabled={isReactivating}>Reactivate</AlertDialogAction></AlertDialogFooter>
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
