"use client";

import { useState } from "react";
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/hooks/queries/use-offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Search, Star } from "lucide-react";
import type { Offer, OfferProduct } from "@/types";

export default function OffersPage() {
  const { data: offers = [], isLoading } = useOffers();
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();
  const deleteMutation = useDeleteOffer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [isMainOffer, setIsMainOffer] = useState(false);
  const [products, setProducts] = useState<OfferProduct[]>([{ namn: "", antal: 1 }]);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = offers.filter((o) => o.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setOfferPrice("");
    setIsMainOffer(false);
    setProducts([{ namn: "", antal: 1 }]);
    setDialogOpen(true);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setOfferPrice(String(offer.offerPrice || ""));
    setIsMainOffer(offer.isMainOffer);
    setProducts(offer.products?.length ? offer.products : [{ namn: "", antal: 1 }]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const validProducts = products.filter((p) => p.namn.trim());
    const data = { title: title.trim(), description, products: validProducts, offerPrice: Number(offerPrice) || 0, isMainOffer };
    if (editing) {
      await updateMutation.mutateAsync({ ...data, id: editing.id });
    } else {
      await createMutation.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Radera detta erbjudande?")) await deleteMutation.mutateAsync(id);
  };

  const addProduct = () => setProducts([...products, { namn: "", antal: 1 }]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));
  const updateProduct = (idx: number, field: keyof OfferProduct, value: string | number) => {
    const updated = [...products];
    (updated[idx] as any)[field] = value;
    setProducts(updated);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Erbjudanden</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Skapa paketpriser och kampanjer för kiosken</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700"><Plus className="h-4 w-4" /> Nytt erbjudande</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Sök erbjudanden..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-amber-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Titel</TableHead>
              <TableHead className="font-semibold">Produkter</TableHead>
              <TableHead className="font-semibold text-right">Pris</TableHead>
              <TableHead className="font-semibold">Huvud</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Inga erbjudanden. Skapa ditt första!</TableCell></TableRow>
            ) : (
              filtered.map((offer) => (
                <TableRow key={offer.id} className="hover:bg-amber-50/30 dark:hover:bg-white/5">
                  <TableCell>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{offer.title}</span>
                      {offer.description && <p className="text-xs text-gray-500 mt-0.5">{offer.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {offer.products?.map((p) => `${p.namn} x${p.antal}`).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{offer.offerPrice} kr</TableCell>
                  <TableCell>
                    {offer.isMainOffer && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Star className="h-3 w-3 mr-1" /> Huvud</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(offer)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(offer.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Redigera erbjudande" : "Nytt erbjudande"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="T.ex. Nocco + Proteinbar" required />
            </div>
            <div className="space-y-2">
              <Label>Beskrivning</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Valfri beskrivning..." />
            </div>
            <div className="space-y-2">
              <Label>Paketpris (kr)</Label>
              <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="40" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Produkter i paketet</Label>
                <Button type="button" variant="outline" size="sm" onClick={addProduct}>+ Lägg till</Button>
              </div>
              {products.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Produktnamn" value={p.namn} onChange={(e) => updateProduct(i, "namn", e.target.value)} className="flex-1" />
                  <Input type="number" min="1" value={p.antal} onChange={(e) => updateProduct(i, "antal", Number(e.target.value))} className="w-20" />
                  {products.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(i)} className="text-red-500"><Trash2 className="h-3 w-3" /></Button>}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isMainOffer} onCheckedChange={setIsMainOffer} />
              <Label>Visa som huvud-erbjudande på kiosken</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">{isSubmitting ? "Sparar..." : editing ? "Uppdatera" : "Skapa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
