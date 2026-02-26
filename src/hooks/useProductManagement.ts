import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  default_unit_price: number;
  default_vat_percent: number | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = {
  product_code: string;
  name: string;
  description?: string | null;
  default_unit_price: number;
  default_vat_percent?: number | null;
  category?: string | null;
};

export type ProductUpdate = Partial<ProductInsert> & { id: string };

export function useProductManagement() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product_code");
      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product Created", description: "New product added successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to create product.", variant: "destructive" });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product Updated", description: "Product updated successfully." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update product.", variant: "destructive" });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: is_active ? "Product Activated" : "Product Deactivated",
        description: `Product has been ${is_active ? "activated" : "deactivated"}.`,
      });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to update product.", variant: "destructive" });
    },
  });

  return {
    products,
    isLoading,
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    toggleActive: toggleActive.mutate,
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
  };
}
