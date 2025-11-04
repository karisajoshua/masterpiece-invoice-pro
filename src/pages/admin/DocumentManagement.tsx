import { Layout } from "@/components/Layout";
import { useAdminDocuments } from "@/hooks/useAdminDocuments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Download, CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

function getStatusBadge(status: string) {
  const variants = {
    pending: "secondary",
    reviewed: "default",
    approved: "default",
    rejected: "destructive",
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
      {status}
    </Badge>
  );
}

export default function DocumentManagement() {
  const { documents, isLoading, updateDocumentStatus, isUpdating } = useAdminDocuments();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const handleStatusUpdate = (status: "reviewed" | "approved" | "rejected") => {
    if (!selectedDoc) return;
    updateDocumentStatus({
      documentId: selectedDoc.id,
      status,
      adminNotes: adminNotes || undefined,
    });
    setSelectedDoc(null);
    setAdminNotes("");
  };

  const downloadDocument = async (documentUrl: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("client-documents")
      .download(documentUrl);

    if (error) {
      console.error("Error downloading:", error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Documents</h1>
          <p className="text-muted-foreground">
            Review and manage documents submitted by clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Submitted Documents</CardTitle>
            <CardDescription>
              {documents.length} document{documents.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No documents submitted yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.document_name}</TableCell>
                      <TableCell>{doc.clients.company_name}</TableCell>
                      <TableCell className="capitalize">{doc.document_type.replace("_", " ")}</TableCell>
                      <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadDocument(doc.document_url, doc.document_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setAdminNotes(doc.admin_notes || "");
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Document</DialogTitle>
                                <DialogDescription>
                                  {doc.document_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Client</p>
                                  <p className="text-sm text-muted-foreground">{doc.clients.company_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Document Type</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {doc.document_type.replace("_", " ")}
                                  </p>
                                </div>
                                {doc.notes && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Client Notes</p>
                                    <p className="text-sm text-muted-foreground">{doc.notes}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium mb-2">Admin Notes</p>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this document..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleStatusUpdate("approved")}
                                    disabled={isUpdating}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate("rejected")}
                                    disabled={isUpdating}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
