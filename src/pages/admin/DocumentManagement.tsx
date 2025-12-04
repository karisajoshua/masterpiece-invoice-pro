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
import { FileText, Download, CheckCircle, XCircle, Eye, Trash2, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const { documents, isLoading, updateDocumentStatus, isUpdating, deleteDocument, isDeleting } = useAdminDocuments();
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
                    <TableHead>AI Analysis</TableHead>
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
                      <TableCell>
                        {doc.ai_suggested_type ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-primary" />
                                  <span className="capitalize text-sm">
                                    {doc.ai_suggested_type.replace("_", " ")}
                                  </span>
                                  <Badge variant={doc.ai_confidence && doc.ai_confidence >= 80 ? "default" : "secondary"} className="text-xs ml-1">
                                    {doc.ai_confidence}%
                                  </Badge>
                                  {doc.ai_suggested_type !== doc.document_type && (
                                    <Badge variant="outline" className="text-xs ml-1">differs</Badge>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">{doc.ai_reasoning}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(doc.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
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
                                {doc.ai_suggested_type && (
                                  <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-primary" />
                                      <p className="text-sm font-medium">AI Analysis</p>
                                      <Badge variant={doc.ai_confidence && doc.ai_confidence >= 80 ? "default" : "secondary"} className="text-xs">
                                        {doc.ai_confidence}% confident
                                      </Badge>
                                    </div>
                                    <p className="text-sm">
                                      Suggested: <span className="capitalize font-medium">{doc.ai_suggested_type.replace("_", " ")}</span>
                                      {doc.ai_suggested_type !== doc.document_type && (
                                        <span className="text-muted-foreground"> (client chose: {doc.document_type.replace("_", " ")})</span>
                                      )}
                                    </p>
                                    {doc.ai_reasoning && (
                                      <p className="text-xs text-muted-foreground">{doc.ai_reasoning}</p>
                                    )}
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.document_name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteDocument({ documentId: doc.id, documentUrl: doc.document_url })}
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
