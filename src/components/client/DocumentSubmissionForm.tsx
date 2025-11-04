import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface DocumentSubmissionFormProps {
  clientId: string;
  onSubmit: (data: { file: File; documentType: string; notes?: string; clientId: string }) => void;
  isSubmitting: boolean;
}

export function DocumentSubmissionForm({
  clientId,
  onSubmit,
  isSubmitting,
}: DocumentSubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) return;

    onSubmit({
      file,
      documentType,
      notes: notes || undefined,
      clientId,
    });

    // Reset form
    setFile(null);
    setDocumentType("");
    setNotes("");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Document</CardTitle>
        <CardDescription>
          Upload documents for admin review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX, PNG, JPG (Max 10MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="tax_document">Tax Document</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={!file || !documentType || isSubmitting} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
