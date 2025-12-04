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
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Check, Loader2 } from "lucide-react";
import { useDocumentAnalysis } from "@/hooks/useDocumentAnalysis";

interface DocumentSubmissionFormProps {
  clientId: string;
  onSubmit: (data: { 
    file: File; 
    documentType: string; 
    notes?: string; 
    clientId: string;
    aiSuggestedType?: string;
    aiConfidence?: number;
    aiReasoning?: string;
  }) => void;
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
  const { analyzeDocument, isAnalyzing, result, clearResult } = useDocumentAnalysis();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    clearResult();
    setDocumentType("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    const analysisResult = await analyzeDocument(file);
    if (analysisResult) {
      setDocumentType(analysisResult.category);
    }
  };

  const handleAcceptSuggestion = () => {
    if (result) {
      setDocumentType(result.category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) return;

    onSubmit({
      file,
      documentType,
      notes: notes || undefined,
      clientId,
      aiSuggestedType: result?.category,
      aiConfidence: result?.confidence,
      aiReasoning: result?.reasoning,
    });

    // Reset form
    setFile(null);
    setDocumentType("");
    setNotes("");
    clearResult();
    (e.target as HTMLFormElement).reset();
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 80) return "default";
    if (confidence >= 50) return "secondary";
    return "outline";
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Document</CardTitle>
        <CardDescription>
          Upload documents for admin review. Use AI to auto-categorize.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: PDF, DOC, DOCX, PNG, JPG (Max 10MB)
            </p>
          </div>

          {file && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>

              {result && (
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Suggestion</span>
                    <Badge variant={getConfidenceBadgeVariant(result.confidence)}>
                      {result.confidence}% confident
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {formatDocumentType(result.category)}
                    </Badge>
                    {documentType !== result.category && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAcceptSuggestion}
                        className="h-7 text-xs"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                </div>
              )}
            </div>
          )}

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
            {result && documentType && documentType !== result.category && (
              <p className="text-xs text-muted-foreground">
                You selected a different type than AI suggested ({formatDocumentType(result.category)})
              </p>
            )}
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
