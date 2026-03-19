"use client";

import { useState, useMemo } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useProducts } from "@/hooks/queries";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, ChevronRight, Package } from "lucide-react";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#000000");
  const [subtitle, setSubtitle] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [visibleFrom, setVisibleFrom] = useState("");
  const [visibleTo, setVisibleTo] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [showOnKiosk, setShowOnKiosk] = useState(true);
  const [status, setStatus] = useState(true);

  // Product count per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p: any) => {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Build parent-child tree for display
  const parentCategories = useMemo(() => categories.filter((c) => !c.parentId), [categories]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categories.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      (c.description || "").toLowerCase().includes(term) ||
      (c.subtitle || "").toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  // Group by parent for hierarchical display
  const grouped = useMemo(() => {
    const roots = filtered.filter((c) => !c.parentId);
    const children = filtered.filter((c) => c.parentId);
    const result: Array<{ cat: Category; indent: boolean }> = [];
    roots.forEach((root) => {
      result.push({ cat: root, indent: false });
      children
        .filter((c) => c.parentId === root.id)
        .forEach((child) => result.push({ cat: child, indent: true }));
    });
    // Also show orphaned subcategories (parent not in filtered)
    const shownIds = new Set(result.map((r) => r.cat.id));
    children.filter((c) => !shownIds.has(c.id)).forEach((c) => result.push({ cat: c, indent: true }));
    return result;
  }, [filtered]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEmoji("");
    setColor("#000000");
    setSubtitle("");
    setParentId("none");
    setVisibleFrom("");
    setVisibleTo("");
    setBannerImageUrl("");
    setSortOrder(0);
    setShowOnKiosk(true);
    setStatus(true);
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setEmoji(cat.emoji || "");
    setColor(cat.color || "#000000");
    setSubtitle(cat.subtitle || "");
    setParentId(cat.parentId || "none");
    setVisibleFrom(cat.visibleFrom || "");
    setVisibleTo(cat.visibleTo || "");
    setBannerImageUrl(cat.bannerImageUrl || "");
    setSortOrder(cat.sortOrder ?? 0);
    setShowOnKiosk(cat.showOnKiosk !== false);
    setStatus(cat.status !== false);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name: name.trim(),
      description,
      emoji: emoji.trim(),
      color,
      subtitle: subtitle.trim(),
      status,
      parentId: parentId && parentId !== "none" ? parentId : null,
      visibleFrom: visibleFrom || null,
      visibleTo: visibleTo || null,
      bannerImageUrl: bannerImageUrl || null,
      sortOrder,
      showOnKiosk,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...data });
    } else {
      await createMutation.mutateAsync({ userId: user?.id || "", ...data });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Är du säker på att du vill ta bort denna kategori?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const getParentName = (pid: string | null | undefined) => {
    if (!pid) return null;
    const parent = categories.find((c) => c.id === pid);
    return parent?.name || null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kategorier</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hantera produktkategorier för din kiosk ({categories.length} kategorier)
          </p>
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
              <TableHead className="font-semibold text-center">Produkter</TableHead>
              <TableHead className="font-semibold text-center">Kiosk</TableHead>
              <TableHead className="font-semibold">Synlighet</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : grouped.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">Inga kategorier hittade. Skapa din första!</TableCell></TableRow>
            ) : (
              grouped.map(({ cat, indent }) => (
                <TableRow key={cat.id} className="hover:bg-emerald-50/30 dark:hover:bg-white/5">
                  <TableCell className="text-xl">{cat.emoji || "—"}</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-1">
                      {indent && <ChevronRight className="h-3 w-3 text-gray-400 ml-2" />}
                      <span className={indent ? "text-gray-600 dark:text-gray-400" : ""}>{cat.name}</span>
                    </div>
                    {indent && (
                      <span className="text-xs text-gray-400 ml-5">under {getParentName(cat.parentId)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{cat.subtitle || "—"}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{cat.description || "—"}</TableCell>
                  <TableCell>
                    {cat.color ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: cat.color }} />
                        <span className="text-xs text-gray-500">{cat.color}</span>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{productCounts[cat.id] || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={cat.showOnKiosk !== false ? "default" : "secondary"} className={cat.showOnKiosk !== false ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""}>
                      {cat.showOnKiosk !== false ? "Ja" : "Nej"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {cat.visibleFrom || cat.visibleTo ? (
                      <span>{cat.visibleFrom || "—"} - {cat.visibleTo || "—"}</span>
                    ) : "Alltid"}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
              <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Valfri beskrivning..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-emoji">Emoji</Label>
                <Input id="cat-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="T.ex. &amp;#x1F355; &amp;#x1F964; &amp;#x1F36C;" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-color">Bakgrundsfärg</Label>
                <div className="flex gap-2">
                  <Input type="color" id="cat-color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1" />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" placeholder="#000000" />
                </div>
              </div>
            </div>

            {/* Parent category */}
            <div className="space-y-2">
              <Label>Överordnad kategori (valfritt)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ingen (toppnivå)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen (toppnivå)</SelectItem>
                  {categories
                    .filter((c) => c.id !== editing?.id && !c.parentId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner image */}
            <div className="space-y-2">
              <Label>Bannerbild URL</Label>
              <Input value={bannerImageUrl} onChange={(e) => setBannerImageUrl(e.target.value)} placeholder="https://..." />
              {bannerImageUrl && (
                <div className="mt-1 rounded-lg overflow-hidden border bg-white">
                  <img src={bannerImageUrl} alt="Banner" className="h-20 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>

            {/* Schedule visibility */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Synlig från (tid)</Label>
                <Input type="time" value={visibleFrom} onChange={(e) => setVisibleFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Synlig till (tid)</Label>
                <Input type="time" value={visibleTo} onChange={(e) => setVisibleTo(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-2">Lämna tomma för att alltid visa kategorin</p>

            {/* Sort order */}
            <div className="space-y-2">
              <Label>Sorteringsordning</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} />
              <p className="text-xs text-gray-500">Lägre nummer visas först</p>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div><Label>Visa på kiosk</Label><p className="text-xs text-gray-500">Synlig för kunder i kiosken</p></div>
              <Switch checked={showOnKiosk} onCheckedChange={setShowOnKiosk} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Aktiv</Label><p className="text-xs text-gray-500">Inaktiva kategorier döljs</p></div>
              <Switch checked={status} onCheckedChange={setStatus} />
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
