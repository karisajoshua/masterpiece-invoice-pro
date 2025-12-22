-- Add 'agent' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';

-- Create approval_status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create field_agents table
CREATE TABLE public.field_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  agent_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add agent_id and approval_status columns to clients table
ALTER TABLE public.clients 
ADD COLUMN agent_id UUID REFERENCES public.field_agents(id),
ADD COLUMN approval_status public.approval_status DEFAULT 'approved';

-- Create agent_messages table for Agent-Admin communication
CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.field_agents(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.field_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is an agent
CREATE OR REPLACE FUNCTION public.get_agent_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.field_agents WHERE user_id = _user_id AND is_active = true LIMIT 1
$$;

-- RLS Policies for field_agents
CREATE POLICY "Admins can manage all agents"
ON public.field_agents
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view their own record"
ON public.field_agents
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for agent_messages
CREATE POLICY "Admins can manage all messages"
ON public.agent_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view messages related to them"
ON public.agent_messages
FOR SELECT
USING (agent_id = get_agent_id(auth.uid()));

CREATE POLICY "Agents can send messages"
ON public.agent_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND 
  agent_id = get_agent_id(auth.uid())
);

-- Update clients RLS to allow agents to view their onboarded clients (read-only)
CREATE POLICY "Agents can view their onboarded clients"
ON public.clients
FOR SELECT
USING (agent_id = get_agent_id(auth.uid()));

-- Allow agents to view invoices for their clients
CREATE POLICY "Agents can view invoices for their clients"
ON public.invoices
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE agent_id = get_agent_id(auth.uid())
  )
);

-- Allow agents to view payments for their clients
CREATE POLICY "Agents can view payments for their clients"
ON public.payments
FOR SELECT
USING (
  invoice_id IN (
    SELECT i.id FROM public.invoices i
    JOIN public.clients c ON i.client_id = c.id
    WHERE c.agent_id = get_agent_id(auth.uid())
  )
);

-- Trigger to update updated_at on field_agents
CREATE TRIGGER update_field_agents_updated_at
BEFORE UPDATE ON public.field_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for agent_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_messages;