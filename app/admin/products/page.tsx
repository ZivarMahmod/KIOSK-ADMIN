"use client";

import { useState, useMemo } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/queries";
import { useCategories } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Package } from "lucide-react";
import type { Product } from "@/types";

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || "—";

  const openCreate = () => {
    setEditing(null); setName(""); setPrice(""); setQuantity(""); setBrand(""); setCategoryId("");
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p); setName(p.name); setPrice(String(p.price || "")); setQuantity(String(p.quantity || ""));
    setBrand((p as any).brand || ""); setCategoryId(p.categoryId || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data: any = { name: name.trim(), price: Number(price) || 0, quantity: Number(quantity) || 0, brand, categoryId, status: true };
    if (editing) {
      await updateMutation.mutateAsync({ ...data, id: editing.id });
    } else {
      await createMutation.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Radera denna produkt?")) await deleteMutation.mutateAsync(id);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Produkter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{products.length} produkter · Lagervärde: {totalValue.toLocaleString()} kr</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-rose-600 hover:bg-rose-700"><Plus className="h-4 w-4" /> Ny produkt</Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Sök produkter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kategorier</SelectItem>
            {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-rose-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-rose-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Namn</TableHead>
              <TableHead className="font-semibold">Varumärke</TableHead>
              <TableHead className="font-semibold">Kategori</TableHead>
              <TableHead className="font-semibold text-right">Pris</TableHead>
              <TableHead className="font-semibold text-right">Lager</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500"><Package className="h-8 w-8 mx-auto mb-2 text-rose-300" />Inga produkter hittade</TableCell></TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-rose-50/30 dark:hover:bg-white/5">
                  <TableCell className="font-medium text-gray-900 dark:text-white">{p.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{(p as any).brand || "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{getCategoryName(p.categoryId || "")}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{p.price} kr</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${(p.quantity || 0) <= 5 ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                      {p.quantity || 0} st
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Redigera produkt" : "Ny produkt"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Namn *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Varumärke</Label><Input value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Pris (kr)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
              <div className="space-y-2"><Label>Antal</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Välj..." /></SelectTrigger>
                  <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700">{isSubmitting ? "Sparar..." : editing ? "Uppdatera" : "Skapa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
