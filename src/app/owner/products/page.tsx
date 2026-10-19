"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Archive, Edit2, FileText, Package, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  tags: string[] | null;
  isFeatured: boolean;
  isArchived: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ProductUpdate = {
  id: string;
  productId: string;
  title: string;
  content: string;
  version: string | null;
  publishedAt: string;
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  price: "",
  currency: "USD",
  category: "",
  tags: "",
  isFeatured: false,
  isArchived: false,
};

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [productForm, setProductForm] = useState(emptyForm);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [newUpdateForm, setNewUpdateForm] = useState({ title: "", version: "", content: "" });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/products");
      if (!response.ok) {
        throw new Error("Failed to load products");
      }
      const payload = await response.json();
      const nextProducts = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.products)
          ? payload.products
          : [];
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        unique.add(product.category);
      }
    });
    return Array.from(unique);
  }, [products]);

  const metrics = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((product) => !product.isArchived).length,
      featured: products.filter((product) => product.isFeatured).length,
      archived: products.filter((product) => product.isArchived).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === "ALL" || product.category === filterCategory;
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && !product.isArchived) ||
        (filterStatus === "ARCHIVED" && product.isArchived) ||
        (filterStatus === "FEATURED" && product.isFeatured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, filterCategory, filterStatus]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setProductForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      slug: product.slug,
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      currency: product.currency ?? "USD",
      category: product.category ?? "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
    });
    setDialogOpen(true);
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitting(true);

    try {
      const payload = {
        title: productForm.title,
        slug: productForm.slug || undefined,
        description: productForm.description,
        price: productForm.price ? Number(productForm.price) : null,
        currency: productForm.currency,
        category: productForm.category,
        tags: productForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isFeatured: productForm.isFeatured,
        isArchived: productForm.isArchived,
      };

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "Failed to save product");
      }

      setDialogOpen(false);
      await fetchProducts();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Failed to save product");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.title}" and all associated release notes?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to delete product");
      }
      await fetchProducts();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Failed to delete product");
    }
  };

  const openUpdatesModal = async (product: Product) => {
    setSelectedProduct(product);
    setUpdatesLoading(true);

    try {
      const response = await fetch(`/api/admin/product-updates?productId=${product.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch updates");
      }
      const payload = await response.json();
      setUpdates(Array.isArray(payload) ? payload : []);
    } catch {
      setUpdates([]);
    } finally {
      setUpdatesLoading(false);
    }
  };

  const handleCreateUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct) {
      return;
    }

    try {
      const response = await fetch("/api/admin/product-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          title: newUpdateForm.title,
          version: newUpdateForm.version || null,
          content: newUpdateForm.content,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to publish release note");
      }

      setNewUpdateForm({ title: "", version: "", content: "" });
      await openUpdatesModal(selectedProduct);
    } catch (createError) {
      alert(createError instanceof Error ? createError.message : "Failed to publish release note");
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    const confirmed = window.confirm("Delete this product update?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/product-updates/${updateId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete update");
      }
      if (selectedProduct) {
        await openUpdatesModal(selectedProduct);
      }
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Failed to delete update");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-100">
            <Package className="h-6 w-6 text-emerald-400" />
            Products & Product Updates
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage studio offerings, release notes, pricing, and showcase inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            onClick={() => void fetchProducts()}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={openCreateDialog}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-400">Active Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{metrics.active}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-400">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{metrics.featured}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-500">Archived</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-400">{metrics.archived}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800/80 bg-zinc-900/40">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, slug, or category..."
                className="border-zinc-800 bg-zinc-950 pl-9 text-zinc-200 placeholder:text-zinc-600"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="FEATURED">Featured</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900/40">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-zinc-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading products...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 p-12 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Package className="mx-auto mb-2 h-10 w-10 opacity-30" />
              No products match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-950/60">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="font-medium text-zinc-400">Product</TableHead>
                  <TableHead className="font-medium text-zinc-400">Category</TableHead>
                  <TableHead className="font-medium text-zinc-400">Price</TableHead>
                  <TableHead className="font-medium text-zinc-400">Status</TableHead>
                  <TableHead className="text-right font-medium text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-zinc-800/60 hover:bg-zinc-900/60">
                    <TableCell>
                      <div className="font-medium text-zinc-200">{product.title}</div>
                      <div className="text-xs font-mono text-zinc-500">/{product.slug}</div>
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="outline" className="border-zinc-800 text-zinc-400">
                          {product.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-zinc-300">
                        {product.price != null
                          ? `${product.currency ?? "USD"}${product.price.toFixed(2)}`
                          : "Unpriced"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {product.isArchived ? (
                          <Badge variant="outline" className="border-zinc-700 bg-zinc-950 text-zinc-400">
                            Archived
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-800/60 bg-emerald-950/30 text-emerald-400">
                            Active
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge variant="outline" className="border-amber-800/60 bg-amber-950/30 text-amber-400">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400"
                          onClick={() => void openUpdatesModal(product)}
                        >
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          Updates
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit2 className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-rose-400"
                          onClick={() => void handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configure the product metadata, pricing, visibility, and showcase placement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-zinc-300">Product Title *</Label>
                <Input
                  required
                  value={productForm.title}
                  onChange={(event) => setProductForm({ ...productForm, title: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Slug</Label>
                <Input
                  value={productForm.slug}
                  onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Category</Label>
                <Input
                  value={productForm.category}
                  onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Currency</Label>
                <Input
                  value={productForm.currency}
                  onChange={(event) => setProductForm({ ...productForm, currency: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-zinc-300">Tags</Label>
                <Input
                  value={productForm.tags}
                  onChange={(event) => setProductForm({ ...productForm, tags: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-zinc-300">Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  className="min-h-[90px] border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/60 p-2.5">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Featured item</div>
                  <div className="text-[10px] text-zinc-500">Display in the showcase feed</div>
                </div>
                <Switch
                  checked={productForm.isFeatured}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, isFeatured: checked })}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/60 p-2.5">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Archived</div>
                  <div className="text-[10px] text-zinc-500">Move the product out of the live catalog</div>
                </div>
                <Switch
                  checked={productForm.isArchived}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, isArchived: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-zinc-400">
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-500">
                {formSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Release Notes: {selectedProduct?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Publish versioned notes tied to this product.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUpdate} className="space-y-3 border-b border-zinc-800 pb-5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Title *</Label>
                <Input
                  required
                  value={newUpdateForm.title}
                  onChange={(event) => setNewUpdateForm({ ...newUpdateForm, title: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Version</Label>
                <Input
                  value={newUpdateForm.version}
                  onChange={(event) => setNewUpdateForm({ ...newUpdateForm, version: event.target.value })}
                  className="border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-100"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-zinc-300">Content *</Label>
                <Textarea
                  required
                  value={newUpdateForm.content}
                  onChange={(event) => setNewUpdateForm({ ...newUpdateForm, content: event.target.value })}
                  className="min-h-[80px] border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Publish Note
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Update History ({updates.length})
            </h4>

            {updatesLoading ? (
              <div className="rounded-md border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                Loading release history...
              </div>
            ) : updates.length === 0 ? (
              <div className="rounded-md border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                No release notes yet for this product.
              </div>
            ) : (
              <div className="space-y-2.5">
                {updates.map((update) => (
                  <div key={update.id} className="space-y-1.5 rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-200">{update.title}</span>
                        {update.version && (
                          <Badge variant="outline" className="border-emerald-800/60 bg-emerald-950/20 text-[10px] text-emerald-400">
                            {update.version}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">
                          {new Date(update.publishedAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400"
                          onClick={() => void handleDeleteUpdate(update.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-zinc-400">{update.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
