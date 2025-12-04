import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, mimeType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing document: ${fileName}, type: ${mimeType}`);

    // Build the message content based on file type
    const isImage = mimeType.startsWith("image/");
    const isPDF = mimeType === "application/pdf";
    
    let messageContent: any[];
    
    if (isImage) {
      messageContent = [
        {
          type: "text",
          text: `Analyze this document image and categorize it into one of these categories: invoice, receipt, contract, tax_document, or other. Consider the visual layout, text content, and document structure.`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${fileBase64}`
          }
        }
      ];
    } else {
      // For PDFs and other documents, we'll describe what we know
      messageContent = [
        {
          type: "text",
          text: `I have a document file named "${fileName}" with MIME type "${mimeType}". Based on the filename and file type, categorize this document into one of these categories: invoice, receipt, contract, tax_document, or other. Provide your best assessment.`
        }
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a document analysis assistant. Your job is to categorize business documents accurately. Always use the categorize_document function to return your analysis."
          },
          {
            role: "user",
            content: messageContent
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "categorize_document",
              description: "Categorize the analyzed document",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["invoice", "receipt", "contract", "tax_document", "other"],
                    description: "The document category"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score from 0 to 100"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation for the categorization"
                  }
                },
                required: ["category", "confidence", "reasoning"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "categorize_document" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "categorize_document") {
      throw new Error("Invalid AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
