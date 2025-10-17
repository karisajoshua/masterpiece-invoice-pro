-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for company_settings
DROP POLICY IF EXISTS "Allow all access to company_settings" ON public.company_settings;

CREATE POLICY "Authenticated users can view company settings"
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can update company settings"
  ON public.company_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for invoices
DROP POLICY IF EXISTS "Allow all access to invoices" ON public.invoices;

CREATE POLICY "Authenticated users can view all invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invoices"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all invoices"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all invoices"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (true);

-- Update RLS policies for invoice_items
DROP POLICY IF EXISTS "Allow all access to invoice_items" ON public.invoice_items;

CREATE POLICY "Authenticated users can view all invoice items"
  ON public.invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invoice items"
  ON public.invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all invoice items"
  ON public.invoice_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all invoice items"
  ON public.invoice_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign 'user' role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();