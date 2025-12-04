-- Add AI analysis fields to client_documents table
ALTER TABLE public.client_documents 
ADD COLUMN ai_suggested_type text,
ADD COLUMN ai_confidence numeric,
ADD COLUMN ai_analyzed_at timestamp with time zone,
ADD COLUMN ai_reasoning text;