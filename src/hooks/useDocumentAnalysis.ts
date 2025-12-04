import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AnalysisResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export function useDocumentAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeDocument = async (file: File): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          fileBase64: base64,
          fileName: file.name,
          mimeType: file.type,
        },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult: AnalysisResult = {
        category: data.category,
        confidence: data.confidence,
        reasoning: data.reasoning,
      };

      setResult(analysisResult);
      return analysisResult;
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze document",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return {
    analyzeDocument,
    isAnalyzing,
    result,
    clearResult,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
