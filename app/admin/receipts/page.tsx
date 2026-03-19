"use client";

import { useState, useMemo, useCallback } from "react";
import { useReceipts, useUpdateReceipt, useDeleteReceipt } from "@/hooks/queries/use-receipts";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/queries/use-tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Tag, Trash2, Filter, ChevronDown, ChevronUp, Download,
  Printer, RotateCcw, ArrowUpDown, CreditCard, X
} from "lucide-react";
import type { Receipt, ReceiptItem } from "@/types";

const STANDARD_TAGS = [
  { name: "TEST", emoji: "\uD83E\uDDEA", color: "#9333ea" },
  { name: "EGET BRUK", emoji: "\uD83C\uDFE0", color: "#2563eb" },
  { name: "SKADA", emoji: "\uD83D\uDC94", color: "#dc2626" },
  { name: "OVRIGT", emoji: "\uD83D\uDCCC", color: "#6b7280" },
];

const RETURN_REASONS = [
  { value: "Defekt", label: "Defekt" },
  { value: "Felbestallning", label: "Felbestallning" },
  { value: "Angerratt", label: "Angerratt" },
  { value: "Annat", label: "Annat" },
];

const PAYMENT_METHODS = [
  { value: "all", label: "Alla" },
  { value: "Kort", label: "Kort" },
  { value: "Kontant", label: "Kontant" },
  { value: "Swish", label: "Swish" },
  { value: "Faktura", label: "Faktura" },
];

type SortKey = "kvittoNummer" | "datum" | "tid" | "items" | "total" | "betalning" | "status" | "tagType";
type SortDir = "asc" | "desc";

export default function ReceiptsPage() {
  const { data: receipts = [], isLoading } = useReceipts();
  const { data: customTags = [] } = useTags();
  const updateMutation = useUpdateReceipt();
  const deleteMutation = useDeleteReceipt();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();
  const { toast } = useToast();

  // Merge standard tags with custom tags from Firebase
  const allTags = [
    ...STANDARD_TAGS.map((t) => ({ ...t, id: `standard-${t.name}`, isStandard: true })),
    ...customTags.map((t) => ({ ...t, isStandard: false })),
  ].filter((t, i, arr) => {
    if (t.isStandard) return true;
    return !STANDARD_TAGS.some((st) => st.name.toUpperCase() === t.name.toUpperCase());
  });

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("datum");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // UI state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("");
  const [newTagColor, setNewTagColor] = useState("#f97316");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReceipt, setReturnReceipt] = useState<Receipt | null>(null);
  const [returnItems, setReturnItems] = useState<Set<number>>(new Set());
  const [returnReason, setReturnReason] = useState("Defekt");
  const [returnNotes, setReturnNotes] = useState("");

  // Delete confirm dialog
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = receipts.filter((r) => {
      const matchSearch = !searchTerm ||
        r.kvittoNummer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.total).includes(searchTerm) ||
        r.datum?.includes(searchTerm) ||
        r.items?.some((i: ReceiptItem) => i.namn?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "registered" && r.status === "registrerad") ||
        (statusFilter === "unregistered" && r.status === "ej_registrerad") ||
        (statusFilter === "tagged" && r.tagged) ||
        (statusFilter === "retur" && (r as any).returnStatus);
      const matchPayment = paymentFilter === "all" || r.betalning === paymentFilter;
      const matchTag = tagFilter === "all" || r.tagType === tagFilter;
      const matchDateFrom = !dateFrom || (r.datum || "") >= dateFrom;
      const matchDateTo = !dateTo || (r.datum || "") <= dateTo;
      return matchSearch && matchStatus && matchPayment && matchTag && matchDateFrom && matchDateTo;
    });

    // Sort
    result.sort((a, b) => {
      let valA: any, valB: any;
      switch (sortKey) {
        case "kvittoNummer": valA = a.kvittoNummer || ""; valB = b.kvittoNummer || ""; break;
        case "datum": valA = a.datum || ""; valB = b.datum || ""; break;
        case "tid": valA = a.tid || ""; valB = b.tid || ""; break;
        case "items": valA = a.items?.length || 0; valB = b.items?.length || 0; break;
        case "total": valA = a.total || 0; valB = b.total || 0; break;
        case "betalning": valA = a.betalning || ""; valB = b.betalning || ""; break;
        case "status": valA = a.status || ""; valB = b.status || ""; break;
        case "tagType": valA = a.tagType || ""; valB = b.tagType || ""; break;
        default: valA = ""; valB = "";
      }
      if (typeof valA === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [receipts, searchTerm, statusFilter, paymentFilter, tagFilter, dateFrom, dateTo, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown className={`inline h-3 w-3 ml-1 ${sortKey === col ? "text-orange-500" : "text-gray-400"}`} />
  );

  const handleTag = async (receipt: Receipt, tagName: string | null) => {
    await updateMutation.mutateAsync({
      id: receipt.id,
      tagged: tagName !== null,
      tagType: tagName,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await createTagMutation.mutateAsync({ name: newTagName.trim(), emoji: newTagEmoji, color: newTagColor });
    setNewTagName("");
    setNewTagEmoji("");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  };

  // CSV Export
  const exportCSV = useCallback(() => {
    const toExport = selectedIds.size > 0
      ? filtered.filter(r => selectedIds.has(r.id))
      : filtered;
    const header = "Kvittonummer;Datum;Tid;Artiklar;Total;Betalmetod;Status;Tagg\n";
    const rows = toExport.map(r =>
      `${r.kvittoNummer};${r.datum};${r.tid};${r.items?.length || 0};${r.total};${r.betalning || ""};${r.status};${r.tagType || ""}`
    ).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kvitton_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exporterad", description: `${toExport.length} kvitton exporterade` });
  }, [filtered, selectedIds, toast]);

  // Return handling
  const openReturnDialog = (receipt: Receipt) => {
    setReturnReceipt(receipt);
    setReturnItems(new Set());
    setReturnReason("Defekt");
    setReturnNotes("");
    setReturnDialogOpen(true);
  };

  const handleReturn = async () => {
    if (!returnReceipt) return;
    const isFullReturn = returnItems.size === 0 || returnItems.size === (returnReceipt.items?.length || 0);
    toast({
      title: isFullReturn ? "Full retur initierad" : "Delretur initierad",
      description: `Kvitto ${returnReceipt.kvittoNummer} - ${returnReason}${returnNotes ? `: ${returnNotes}` : ""}. Lagerjustering behover goras manuellt.`,
    });
    setReturnDialogOpen(false);
  };

  const totalRevenue = filtered.reduce((sum, r) => sum + (r.total || 0), 0);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setTagFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || paymentFilter !== "all" || tagFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kvitton</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visa och hantera forsaljningskvitton</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportera CSV
          </Button>
          <Button onClick={() => setTagDialogOpen(true)} variant="outline" className="gap-2">
            <Tag className="h-4 w-4" /> Hantera taggar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Antal kvitton</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total forsaljning</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRevenue.toFixed(0)} kr</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Snittorder</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.length > 0 ? (totalRevenue / filtered.length).toFixed(0) : 0} kr</p>
        </div>
        <div className="rounded-xl border border-orange-400/20 bg-orange-50/50 dark:bg-orange-900/10 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Taggade</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filtered.filter((r) => r.tagged).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Sok kvittonummer, produkt, belopp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="registered">Registrerade</SelectItem>
              <SelectItem value="unregistered">Ej registrerade</SelectItem>
              <SelectItem value="tagged">Taggade</SelectItem>
              <SelectItem value="retur">Returer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[140px]">
              <CreditCard className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Betalning" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(pm => (
                <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-500 whitespace-nowrap">Fran:</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[160px]" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-500 whitespace-nowrap">Till:</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[160px]" />
          </div>
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[150px]">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tagg" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla taggar</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag.id} value={tag.name}>{tag.emoji} {tag.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
              <X className="h-3 w-3" /> Rensa filter
            </Button>
          )}
          {selectedIds.size > 0 && (
            <span className="text-sm text-orange-600 font-medium">{selectedIds.size} valda</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-orange-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50/50 dark:bg-white/10">
              <TableHead className="w-10">
                <Checkbox
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("kvittoNummer")}>Kvitto # <SortIcon col="kvittoNummer" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("datum")}>Datum <SortIcon col="datum" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("tid")}>Tid <SortIcon col="tid" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("items")}>Artiklar <SortIcon col="items" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none text-right" onClick={() => handleSort("total")}>Summa <SortIcon col="total" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("betalning")}>Betalmetod <SortIcon col="betalning" /></TableHead>
              <TableHead className="font-semibold cursor-pointer select-none" onClick={() => handleSort("status")}>Status <SortIcon col="status" /></TableHead>
              <TableHead className="font-semibold">Tagg</TableHead>
              <TableHead className="font-semibold text-right">Atgarder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">Inga kvitton hittade</TableCell></TableRow>
            ) : (
              filtered.map((receipt) => (
                <>
                  <TableRow
                    key={receipt.id}
                    className={`hover:bg-orange-50/30 dark:hover:bg-white/5 cursor-pointer ${expandedId === receipt.id ? "bg-orange-50/40 dark:bg-white/10" : ""}`}
                    onClick={() => setExpandedId(expandedId === receipt.id ? null : receipt.id)}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(receipt.id)}
                        onCheckedChange={() => toggleSelect(receipt.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        {expandedId === receipt.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {receipt.kvittoNummer}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{receipt.datum}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{receipt.tid}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{receipt.items?.length || 0} st</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{receipt.total} kr</TableCell>
                    <TableCell>
                      {receipt.betalning ? (
                        <Badge variant="secondary" className="text-xs">{receipt.betalning}</Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={receipt.status === "registrerad" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                        {receipt.status === "registrerad" ? "Registrerad" : "Ej registrerad"}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Select
                        value={receipt.tagType || "none"}
                        onValueChange={(val) => handleTag(receipt, val === "none" ? null : val)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Valj tagg" />
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
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Initiera retur" onClick={() => openReturnDialog(receipt)}>
                          <RotateCcw className="h-4 w-4 text-orange-500" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Skriv ut" onClick={() => toast({ title: "Skriver ut...", description: `Kvitto ${receipt.kvittoNummer}` })}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirmId(receipt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded detail */}
                  {expandedId === receipt.id && (
                    <TableRow key={`${receipt.id}-detail`} className="bg-orange-50/20 dark:bg-white/5">
                      <TableCell colSpan={10}>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Kvittonummer</p>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">{receipt.kvittoNummer}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Datum & tid</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{receipt.datum} {receipt.tid}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Betalmetod</p>
                              <Badge variant="secondary">{receipt.betalning || "Ej angiven"}</Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <Badge className={receipt.status === "registrerad" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                                {receipt.status === "registrerad" ? "Registrerad" : "Ej registrerad"}
                              </Badge>
                            </div>
                          </div>

                          <div className="rounded-lg border border-orange-200/50 dark:border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-orange-50/50 dark:bg-white/5">
                                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Artikel</th>
                                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Antal</th>
                                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Styckpris</th>
                                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Totalt</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(receipt.items || []).map((item: ReceiptItem, idx: number) => (
                                  <tr key={idx} className="border-t border-orange-100/50 dark:border-white/5">
                                    <td className="p-2 text-gray-900 dark:text-white">{item.namn}</td>
                                    <td className="p-2 text-right text-gray-600 dark:text-gray-400">{item.antal}</td>
                                    <td className="p-2 text-right text-gray-600 dark:text-gray-400">{item.prisStyck?.toFixed(2)} kr</td>
                                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">{item.prisTotal?.toFixed(2)} kr</td>
                                  </tr>
                                ))}
                                <tr className="border-t-2 border-orange-200 dark:border-white/20">
                                  <td colSpan={3} className="p-2 text-right font-bold text-gray-900 dark:text-white">Summa:</td>
                                  <td className="p-2 text-right font-bold text-gray-900 dark:text-white">{receipt.total} kr</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => openReturnDialog(receipt)}>
                              <RotateCcw className="h-3 w-3" /> Initiera retur
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({ title: "Skriver ut...", description: `Kvitto ${receipt.kvittoNummer}` })}>
                              <Printer className="h-3 w-3" /> Skriv ut / PDF
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({ title: "Skickat", description: "Kvittot har skickats till kunden (placeholder)" })}>
                              Skicka till kund
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Initiera retur - {returnReceipt?.kvittoNummer}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Valj artiklar att returnera (lamnna tomt for full retur):</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(returnReceipt?.items || []).map((item: ReceiptItem, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                    <Checkbox
                      checked={returnItems.has(idx)}
                      onCheckedChange={(checked) => {
                        setReturnItems(prev => {
                          const next = new Set(prev);
                          if (checked) next.add(idx); else next.delete(idx);
                          return next;
                        });
                      }}
                    />
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">{item.namn}</span>
                    <span className="text-sm text-gray-500">{item.antal} st</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.prisTotal} kr</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Returorsak</Label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {returnReason === "Annat" && (
              <div className="space-y-2">
                <Label>Beskriv orsak</Label>
                <Textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Beskriv orsaken..." />
              </div>
            )}

            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-700 dark:text-amber-300">
              Notera: Lagerjustering sker automatiskt vid fullstandig returhantering.
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Avbryt</Button></DialogClose>
            <Button onClick={handleReturn} className="bg-orange-600 hover:bg-orange-700">
              Bekrafta retur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera kvitto?</AlertDialogTitle>
            <AlertDialogDescription>Denna atgard kan inte angras. Kvittot raderas permanent.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {allTags.length === STANDARD_TAGS.length && customTags.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Inga egna taggar skapade annu</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Stang</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
