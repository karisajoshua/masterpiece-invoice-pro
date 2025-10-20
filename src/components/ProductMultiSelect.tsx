import { useState } from "react";
import { Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts, Product } from "@/hooks/useProducts";

interface ProductMultiSelectProps {
  onProductsSelect: (products: Product[]) => void;
}

export function ProductMultiSelect({ onProductsSelect }: ProductMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { products, isLoading } = useProducts();

  const handleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleAddProducts = () => {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    onProductsSelect(selectedProducts);
    setSelectedIds([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Add from Products
          {selectedIds.length > 0 && ` (${selectedIds.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.product_code} ${product.name}`}
                  onSelect={() => handleSelect(product.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(product.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.product_code} • Ksh {product.default_unit_price.toLocaleString()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedIds.length > 0 && (
          <div className="border-t p-2">
            <Button onClick={handleAddProducts} className="w-full" size="sm">
              Add {selectedIds.length} Product{selectedIds.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}