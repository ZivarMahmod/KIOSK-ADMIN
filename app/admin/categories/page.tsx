"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/queries";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#000000");
  const [subtitle, setSubtitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setEmoji("");
    setColor("#000000");
    setSubtitle("");
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setEmoji(cat.emoji || "");
    setColor(cat.color || "#000000");
    setSubtitle(cat.subtitle || "");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) {
      await updateMutation.mutateAsync({
        id: editing.id,
        name: name.trim(),
        description,
        emoji: emoji.trim(),
        color,
        subtitle: subtitle.trim(),
      });
    } else {
      await createMutation.mutateAsync({
        name: name.trim(),
        userId: user?.id || "",
        description,
        emoji: emoji.trim(),
        color,
        subtitle: subtitle.trim(),
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Är du säker på att du vill ta bort denna kategori?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kategorier</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hantera produktkategorier för din kiosk</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Ny kategori
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Sök kategorier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border border-emerald-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Emoji</TableHead>
              <TableHead className="font-semibold">Namn</TableHead>
              <TableHead className="font-semibold">Undertitel</TableHead>
              <TableHead className="font-semibold">Beskrivning</TableHead>
              <TableHead className="font-semibold">Färg</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Inga kategorier hittade. Skapa din första!</TableCell></TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-emerald-50/30 dark:hover:bg-white/5">
                  <TableCell className="text-xl">{cat.emoji || "—"}</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{cat.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{cat.subtitle || "—"}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{cat.description || "—"}</TableCell>
                  <TableCell>
                    {cat.color ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-gray-500">{cat.color}</span>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cat.status !== false ? "default" : "secondary"} className={cat.status !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                      {cat.status !== false ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Redigera kategori" : "Ny kategori"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Namn *</Label>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Dryck, Snacks..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-subtitle">Undertitel</Label>
              <Input id="cat-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Kort undertitel för kiosken..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Beskrivning</Label>
              <Input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Valfri beskrivning..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-emoji">Emoji</Label>
                <Input id="cat-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="T.ex. 🍕 🥤 🍬" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-color">Färg</Label>
                <div className="flex gap-2">
                  <Input type="color" id="cat-color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1" />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" placeholder="#000000" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? "Sparar..." : editing ? "Uppdatera" : "Skapa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
