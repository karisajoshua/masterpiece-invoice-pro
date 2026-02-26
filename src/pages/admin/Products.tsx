import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Package } from "lucide-react";
import { useProductManagement, ProductInsert, ProductUpdate } from "@/hooks/useProductManagement";

const emptyForm: ProductInsert = {
  product_code: "",
  name: "",
  description: "",
  default_unit_price: 0,
  default_vat_percent: 16,
  category: "",
};

export default function Products() {
  const { products, isLoading, createProduct, updateProduct, toggleActive, isCreating, isUpdating } = useProductManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInsert>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      product_code: product.product_code,
      name: product.name,
      description: product.description || "",
      default_unit_price: product.default_unit_price,
      default_vat_percent: product.default_vat_percent ?? 16,
      category: product.category || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.product_code.trim()) return;
    if (editingId) {
      updateProduct({ id: editingId, ...form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createProduct(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <div className="p-6">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products & Services</h2>
          <p className="text-muted-foreground">Manage your product catalog and pricing.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Code *</Label>
                  <Input value={form.product_code} onChange={(e) => updateField("product_code", e.target.value)} placeholder="e.g. SRV-001" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category || ""} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Services" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Product or service name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Optional description" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Unit Price *</Label>
                  <Input type="number" min="0" step="0.01" value={form.default_unit_price} onChange={(e) => updateField("default_unit_price", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Default VAT %</Label>
                  <Input type="number" min="0" max="100" value={form.default_vat_percent ?? 16} onChange={(e) => updateField("default_vat_percent", parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                {editingId ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog ({products.length})
          </CardTitle>
          <CardDescription>All products and services including inactive ones.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No products yet. Add your first product or service.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">VAT %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={!product.is_active ? "opacity-50" : ""}>
                    <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{product.name}</span>
                        {product.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category || "—"}</TableCell>
                    <TableCell className="text-right">{product.default_unit_price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{product.default_vat_percent ?? 16}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={(checked) => toggleActive({ id: product.id, is_active: checked })}
                        />
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
