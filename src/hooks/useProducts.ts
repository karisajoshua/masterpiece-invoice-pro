import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  default_unit_price: number;
  default_vat_percent: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("product_code");

      if (error) throw error;
      return data as Product[];
    },
  });

  return {
    products,
    isLoading,
  };
}