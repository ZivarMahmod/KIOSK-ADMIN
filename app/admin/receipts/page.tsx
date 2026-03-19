"use client";

import { useState, useMemo } from "react";
import { useReceipts, useUpdateReceipt, useDeleteReceipt } from "@/hooks/queries/use-receipts";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/queries/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Tag, Trash2, Filter } from "lucide-react";
import type { Receipt } from "@/types";

const STANDARD_TAGS = [
  { name: "TEST", emoji: "🧪", color: "#9333ea" },
  { name: "EGET BRUK", emoji: "🏠", color: "#2563eb" },
  { name: "SKADA", emoji: "💔", color: "#dc2626" },
  { name: "ÖVRIGT", emoji: "📌", color: "#6b7280" },
];

export default function ReceiptsPage() {
  const { data: receipts = [], isLoading } = useReceipts();
  const { data: customTags = [] } = useTags();
  const updateMutation = useUpdateReceipt();
  const deleteMutation = useDeleteReceipt();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();

  // Merge standard tags with custom tags from Firebase (deduplicate by name)
  const allTags = [
    ...STANDARD_TAGS.map((t) => ({ ...t, id: `standard-${t.name}`, isStandard: true })),
    ...customTags.map((t) => ({ ...t, isStandard: false })),
  ].filter((t, i, arr) => {
    // Keep standard tags, and only keep custom tags whose name doesn't collide with a standard tag
    if (t.isStandard) return true;
    return !STANDARD_TAGS.some((st) => st.name.toUpperCase() === t.name.toUpperCase());
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("");
  const [newTagColor, setNewTagColor] = useState("#f97316");

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch = !searchTerm ||
        r.kvittoNummer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items?.some((i: any) => i.namn?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "registered" && r.status === "registrerad") ||
        (statusFilter === "unregistered" && r.status === "ej_registrerad") ||
        (statusFilter === "tagged" && r.tagged);
      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  const handleTag = async (receipt: Receipt, tagName: string | null) => {
    await updateMutation.mutateAsync({
      id: receipt.id,
      tagged: tagName !== null,
      tagType: tagName,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Radera detta kvitto?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await createTagMutation.mutateAsync({ name: newTagName.trim(), emoji: newTagEmoji, color: newTagColor });
    setNewTagName("");
    setNewTagEmoji("");
  };

  const totalRevenue = filtered.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kvitton</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visa och hantera försäljningskvitton</p>
        </div>
        <Button onClick={() => setTagDialogOpen(true)} variant="outline" className="gap-2">
          <Tag className="h-4 w-4" /> Hantera taggar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Antal kvitton</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total försäljning</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRevenue.toFixed(0)} kr</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Taggade</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.filter((r) => r.tagged).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Sök kvittonummer eller produkt..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            <SelectItem value="registered">Registrerade</SelectItem>
            <SelectItem value="unregistered">Ej registrerade</SelectItem>
            <SelectItem value="tagged">Taggade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-orange-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Kvitto #</TableHead>
              <TableHead className="font-semibold">Datum</TableHead>
              <TableHead className="font-semibold">Tid</TableHead>
              <TableHead className="font-semibold">Artiklar</TableHead>
              <TableHead className="font-semibold text-right">Summa</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Tagg</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Inga kvitton hittade</TableCell></TableRow>
            ) : (
              filtered.map((receipt) => (
                <TableRow key={receipt.id} className="hover:bg-orange-50/30 dark:hover:bg-white/5">
                  <TableCell className="font-mono font-medium text-gray-900 dark:text-white">{receipt.kvittoNummer}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{receipt.datum}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{receipt.tid}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{receipt.items?.length || 0} st</TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{receipt.total} kr</TableCell>
                  <TableCell>
                    <Badge className={receipt.status === "registrerad" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                      {receipt.status === "registrerad" ? "Registrerad" : "Ej registrerad"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={receipt.tagType || "none"}
                      onValueChange={(val) => handleTag(receipt, val === "none" ? null : val)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Välj tagg" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ingen tagg</SelectItem>
                        {allTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.name}>
                            {tag.emoji} {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(receipt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tag Management Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hantera taggar</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
            <Input placeholder="Taggnamn" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="flex-1" />
            <Input placeholder="Emoji" value={newTagEmoji} onChange={(e) => setNewTagEmoji(e.target.value)} className="w-16" />
            <Input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-12 p-1" />
            <Button type="submit" size="sm" disabled={createTagMutation.isPending}>+</Button>
          </form>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allTags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                  <span>{tag.emoji} {tag.name}</span>
                  {tag.isStandard && <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">Standard</span>}
                </div>
                {!tag.isStandard && (
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteTagMutation.mutate(tag.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {allTags.length === STANDARD_TAGS.length && customTags.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Inga egna taggar skapade ännu</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Stäng</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
