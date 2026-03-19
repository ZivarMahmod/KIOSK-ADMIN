"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkUpdateProducts,
  useBulkDeleteProducts,
} from "@/hooks/queries";
import { useCategories } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Package,
  LayoutGrid,
  List,
  ChevronDown,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ArrowUpDown,
  X,
} from "lucide-react";
import type { Product, CreateProductInput, UpdateProductInput } from "@/types";
import type { Allergen, StockStatus, VatRate } from "@/types/product";
import { ALLERGEN_LABELS, BADGE_PRESETS, STOCK_STATUS_LABELS } from "@/types/product";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];

const VAT_OPTIONS: VatRate[] = [0, 6, 12, 25];

type SortField = "name" | "price" | "quantity" | "updatedAt" | "sortWeight";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "list";

// Default form state factory
function emptyForm() {
  return {
    name: "",
    brand: "",
    descriptionShort: "",
    descriptionLong: "",
    price: "",
    campaignPrice: "",
    campaignFrom: "",
    campaignTo: "",
    imageUrl: "",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    badgeLabel: "",
    badgeColor: "#ef4444",
    categoryId: "",
    sku: "",
    quantity: "",
    minStockLevel: "",
    stockStatus: "i_lager" as StockStatus,
    sortWeight: "",
    showOnKiosk: true,
    allergens: [] as Allergen[],
    nutritionInfo: "",
    vatRate: 25 as VatRate,
    costPrice: "",
    supplierName: "",
    internalNote: "",
  };
}

type FormState = ReturnType<typeof emptyForm>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const bulkUpdateMutation = useBulkUpdateProducts();
  const bulkDeleteMutation = useBulkDeleteProducts();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [dialogTab, setDialogTab] = useState("basic");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // ---- helpers ----
  const getCategoryName = (catId: string) =>
    categories.find((c) => c.id === catId)?.name || "\u2014";

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ---- filtering + sorting ----
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(term) ||
        (p.sku || "").toLowerCase().includes(term) ||
        ((p as any).brand || "").toLowerCase().includes(term);
      const matchCategory =
        categoryFilter === "all" || p.categoryId === categoryFilter;
      const matchStock =
        stockStatusFilter === "all" ||
        ((p as any).stockStatus || "i_lager") === stockStatusFilter;
      const matchVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "visible"
          ? (p as any).showOnKiosk !== false
          : (p as any).showOnKiosk === false);
      const pMin = priceMin ? Number(priceMin) : 0;
      const pMax = priceMax ? Number(priceMax) : Infinity;
      const matchPrice = p.price >= pMin && p.price <= pMax;
      return matchSearch && matchCategory && matchStock && matchVisibility && matchPrice;
    });

    list.sort((a, b) => {
      let av: any, bv: any;
      switch (sortField) {
        case "name":
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
        case "price":
          av = a.price;
          bv = b.price;
          break;
        case "quantity":
          av = a.quantity || 0;
          bv = b.quantity || 0;
          break;
        case "updatedAt":
          av = a.updatedAt || a.createdAt || "";
          bv = b.updatedAt || b.createdAt || "";
          break;
        case "sortWeight":
          av = (a as any).sortWeight ?? 999;
          bv = (b as any).sortWeight ?? 999;
          break;
        default:
          av = a.name;
          bv = b.name;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, searchTerm, categoryFilter, stockStatusFilter, visibilityFilter, priceMin, priceMax, sortField, sortDir]);

  // ---- Dialog open/close ----
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogTab("basic");
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    const pa = p as any;
    setForm({
      name: p.name || "",
      brand: pa.brand || "",
      descriptionShort: pa.descriptionShort || "",
      descriptionLong: pa.descriptionLong || "",
      price: String(p.price || ""),
      campaignPrice: pa.campaignPrice != null ? String(pa.campaignPrice) : "",
      campaignFrom: pa.campaignFrom || "",
      campaignTo: pa.campaignTo || "",
      imageUrl: p.imageUrl || "",
      backgroundColor: pa.backgroundColor || "#ffffff",
      textColor: pa.textColor || "#000000",
      badgeLabel: pa.badgeLabel || "",
      badgeColor: pa.badgeColor || "#ef4444",
      categoryId: p.categoryId || "",
      sku: p.sku || "",
      quantity: String(p.quantity || ""),
      minStockLevel: pa.minStockLevel != null ? String(pa.minStockLevel) : "",
      stockStatus: pa.stockStatus || "i_lager",
      sortWeight: pa.sortWeight != null ? String(pa.sortWeight) : "",
      showOnKiosk: pa.showOnKiosk !== false,
      allergens: pa.allergens || [],
      nutritionInfo: pa.nutritionInfo || "",
      vatRate: pa.vatRate ?? 25,
      costPrice: pa.costPrice != null ? String(pa.costPrice) : "",
      supplierName: pa.supplierName || "",
      internalNote: pa.internalNote || "",
    });
    setDialogTab("basic");
    setDialogOpen(true);
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: any = {
      name: form.name.trim(),
      brand: form.brand,
      descriptionShort: form.descriptionShort,
      descriptionLong: form.descriptionLong,
      price: Number(form.price) || 0,
      campaignPrice: form.campaignPrice ? Number(form.campaignPrice) : null,
      campaignFrom: form.campaignFrom || null,
      campaignTo: form.campaignTo || null,
      imageUrl: form.imageUrl || null,
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      badgeLabel: form.badgeLabel || null,
      badgeColor: form.badgeColor,
      categoryId: form.categoryId || null,
      sku: form.sku || null,
      quantity: Number(form.quantity) || 0,
      minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : 0,
      stockStatus: form.stockStatus,
      sortWeight: form.sortWeight ? Number(form.sortWeight) : 0,
      showOnKiosk: form.showOnKiosk,
      allergens: form.allergens,
      nutritionInfo: form.nutritionInfo || null,
      vatRate: form.vatRate,
      costPrice: form.costPrice ? Number(form.costPrice) : null,
      supplierName: form.supplierName || null,
      internalNote: form.internalNote || null,
      status: true,
    };

    if (editing) {
      await updateMutation.mutateAsync({ ...payload, id: editing.id });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Radera denna produkt?")) await deleteMutation.mutateAsync(id);
  };

  // ---- Bulk actions ----
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const bulkChangeCategory = async () => {
    if (!bulkCategoryId || selected.size === 0) return;
    const items: UpdateProductInput[] = Array.from(selected).map((id) => ({
      id,
      categoryId: bulkCategoryId,
    }));
    await bulkUpdateMutation.mutateAsync(items);
    setSelected(new Set());
    setBulkMenuOpen(false);
  };

  const bulkChangeVisibility = async (visible: boolean) => {
    if (selected.size === 0) return;
    const items: UpdateProductInput[] = Array.from(selected).map((id) => ({
      id,
      showOnKiosk: visible,
    }));
    await bulkUpdateMutation.mutateAsync(items);
    setSelected(new Set());
    setBulkMenuOpen(false);
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Radera ${selected.size} produkter?`)) return;
    await bulkDeleteMutation.mutateAsync(Array.from(selected));
    setSelected(new Set());
    setBulkMenuOpen(false);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    bulkUpdateMutation.isPending ||
    bulkDeleteMutation.isPending;

  const totalValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
    0
  );

  // ---- Allergen toggle helper ----
  const toggleAllergen = (a: Allergen) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(a)
        ? prev.allergens.filter((x) => x !== a)
        : [...prev.allergens, a],
    }));
  };

  // ---- Render ----
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Produkter
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {products.length} produkter &middot; Lagerv&auml;rde:{" "}
            {totalValue.toLocaleString("sv-SE")} kr
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-rose-600 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" /> Ny produkt
        </Button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="S&ouml;k namn, SKU, varum&auml;rke..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla kategorier</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Lagerstatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla statusar</SelectItem>
            {(Object.entries(STOCK_STATUS_LABELS) as [StockStatus, string][]).map(
              ([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Synlighet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            <SelectItem value="visible">Synlig p&aring; kiosk</SelectItem>
            <SelectItem value="hidden">Dold</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input
            placeholder="Min kr"
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Max kr"
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Toolbar: sort, view toggle, bulk actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sortera:</span>
          {(
            [
              ["name", "Namn"],
              ["price", "Pris"],
              ["quantity", "Lager"],
              ["updatedAt", "Senast"],
              ["sortWeight", "Vikt"],
            ] as [SortField, string][]
          ).map(([f, label]) => (
            <Button
              key={f}
              variant={sortField === f ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleSort(f)}
              className="gap-1 text-xs"
            >
              {label}
              {sortField === f && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                className="gap-1"
              >
                Bulk ({selected.size}) <ChevronDown className="h-3 w-3" />
              </Button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 space-y-2 min-w-[220px]">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Byt kategori
                  </div>
                  <div className="flex gap-1">
                    <Select
                      value={bulkCategoryId}
                      onValueChange={setBulkCategoryId}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue placeholder="Kategori..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!bulkCategoryId || isSubmitting}
                      onClick={bulkChangeCategory}
                    >
                      OK
                    </Button>
                  </div>
                  <div className="border-t pt-2 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => bulkChangeVisibility(true)}
                      disabled={isSubmitting}
                    >
                      <Eye className="h-3 w-3" /> Visa p&aring; kiosk
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={() => bulkChangeVisibility(false)}
                      disabled={isSubmitting}
                    >
                      <EyeOff className="h-3 w-3" /> D&ouml;lj fr&aring;n kiosk
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs gap-2 text-red-600 hover:text-red-700"
                      onClick={bulkDelete}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-3 w-3" /> Radera markerade
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-2">
        Visar {filtered.length} av {products.length} produkter
      </p>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-xl border border-rose-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50/50 dark:bg-white/10">
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      filtered.length > 0 && selected.size === filtered.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead
                  className="font-semibold cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  Namn
                </TableHead>
                <TableHead className="font-semibold">Varum&auml;rke</TableHead>
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead
                  className="font-semibold text-right cursor-pointer"
                  onClick={() => toggleSort("price")}
                >
                  Pris
                </TableHead>
                <TableHead
                  className="font-semibold text-right cursor-pointer"
                  onClick={() => toggleSort("quantity")}
                >
                  Lager
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">
                  Kiosk
                </TableHead>
                <TableHead className="font-semibold text-right">
                  &Aring;tg&auml;rder
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    Laddar...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    <Package className="h-8 w-8 mx-auto mb-2 text-rose-300" />
                    Inga produkter hittade
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const pa = p as any;
                  const lowStock =
                    (p.quantity || 0) <=
                    (pa.minStockLevel || 5);
                  return (
                    <TableRow
                      key={p.id}
                      className="hover:bg-rose-50/30 dark:hover:bg-white/5"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(p.id)}
                          onCheckedChange={() => toggleSelect(p.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {p.name}
                          {pa.badgeLabel && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                              style={{
                                backgroundColor: pa.badgeColor || "#ef4444",
                              }}
                            >
                              {pa.badgeLabel}
                            </span>
                          )}
                        </div>
                        {p.sku && (
                          <span className="text-xs text-gray-400">
                            {p.sku}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {pa.brand || "\u2014"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(p.categoryId || "")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {p.price} kr
                          </span>
                          {pa.campaignPrice != null && (
                            <span className="block text-xs text-rose-500">
                              Kampanj: {pa.campaignPrice} kr
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-medium ${lowStock ? "text-red-500" : "text-gray-900 dark:text-white"}`}
                        >
                          {p.quantity || 0} st
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (pa.stockStatus || "i_lager") === "i_lager"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {STOCK_STATUS_LABELS[
                            (pa.stockStatus as StockStatus) || "i_lager"
                          ] || "I lager"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {pa.showOnKiosk !== false ? (
                          <Eye className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <p className="col-span-full text-center py-8 text-gray-500">
              Laddar...
            </p>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-rose-300" />
              Inga produkter hittade
            </div>
          ) : (
            filtered.map((p) => {
              const pa = p as any;
              const lowStock =
                (p.quantity || 0) <= (pa.minStockLevel || 5);
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-rose-400/20 dark:border-white/10 shadow bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden group relative"
                  style={{
                    backgroundColor: pa.backgroundColor || undefined,
                    color: pa.textColor || undefined,
                  }}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                    />
                  </div>
                  {/* Badge */}
                  {pa.badgeLabel && (
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
                        style={{
                          backgroundColor: pa.badgeColor || "#ef4444",
                        }}
                      >
                        {pa.badgeLabel}
                      </span>
                    </div>
                  )}
                  {/* Image */}
                  <div className="h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {p.name}
                        </h3>
                        {pa.brand && (
                          <p className="text-xs opacity-60">{pa.brand}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{p.price} kr</p>
                        {pa.campaignPrice != null && (
                          <p className="text-[10px] text-rose-500">
                            {pa.campaignPrice} kr
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {getCategoryName(p.categoryId || "")}
                      </Badge>
                      <span
                        className={`text-xs font-medium ${lowStock ? "text-red-500" : ""}`}
                      >
                        {p.quantity || 0} st
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {pa.showOnKiosk !== false ? (
                          <Eye className="h-3 w-3 text-green-500" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        )}
                        <Badge
                          variant={
                            (pa.stockStatus || "i_lager") === "i_lager"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {STOCK_STATUS_LABELS[
                            (pa.stockStatus as StockStatus) || "i_lager"
                          ] || "I lager"}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* =================== EDIT DIALOG =================== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Redigera produkt" : "Ny produkt"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs
              value={dialogTab}
              onValueChange={setDialogTab}
              className="w-full"
            >
              <TabsList className="mb-4 w-full grid grid-cols-5">
                <TabsTrigger value="basic">Grundl&auml;ggande</TabsTrigger>
                <TabsTrigger value="appearance">Utseende</TabsTrigger>
                <TabsTrigger value="stock">Lager</TabsTrigger>
                <TabsTrigger value="details">Detaljer</TabsTrigger>
                <TabsTrigger value="internal">Internt</TabsTrigger>
              </TabsList>

              {/* ---- TAB: Basic ---- */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Namn <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Varum&auml;rke</Label>
                    <Input
                      value={form.brand}
                      onChange={(e) => setField("brand", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kort beskrivning</Label>
                  <Input
                    value={form.descriptionShort}
                    onChange={(e) =>
                      setField("descriptionShort", e.target.value)
                    }
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label>L&aring;ng beskrivning</Label>
                  <Textarea
                    value={form.descriptionLong}
                    onChange={(e) =>
                      setField("descriptionLong", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pris (kr)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kampanjpris (kr)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.campaignPrice}
                      onChange={(e) =>
                        setField("campaignPrice", e.target.value)
                      }
                      placeholder="L&auml;mna tomt om ingen kampanj"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => setField("categoryId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="V&auml;lj..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kampanj fr&aring;n</Label>
                    <Input
                      type="date"
                      value={form.campaignFrom}
                      onChange={(e) =>
                        setField("campaignFrom", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kampanj till</Label>
                    <Input
                      type="date"
                      value={form.campaignTo}
                      onChange={(e) =>
                        setField("campaignTo", e.target.value)
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              {/* ---- TAB: Appearance ---- */}
              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label>Bild-URL (PNG/JPG)</Label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => setField("imageUrl", e.target.value)}
                    placeholder="https://..."
                  />
                  {form.imageUrl && (
                    <div className="mt-2 border rounded-lg p-2 inline-block">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="max-h-40 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bakgrundsf&auml;rg p&aring; kort</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={form.backgroundColor}
                        onChange={(e) =>
                          setField("backgroundColor", e.target.value)
                        }
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={form.backgroundColor}
                        onChange={(e) =>
                          setField("backgroundColor", e.target.value)
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Textf&auml;rg</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={(e) =>
                          setField("textColor", e.target.value)
                        }
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={form.textColor}
                        onChange={(e) =>
                          setField("textColor", e.target.value)
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Badge-etikett</Label>
                    <Select
                      value={
                        BADGE_PRESETS.includes(form.badgeLabel as any)
                          ? form.badgeLabel
                          : form.badgeLabel
                          ? "__custom"
                          : "__none"
                      }
                      onValueChange={(v) => {
                        if (v === "__none") setField("badgeLabel", "");
                        else if (v === "__custom") setField("badgeLabel", form.badgeLabel || "");
                        else setField("badgeLabel", v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ingen badge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Ingen badge</SelectItem>
                        {BADGE_PRESETS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom">Egen text...</SelectItem>
                      </SelectContent>
                    </Select>
                    {!BADGE_PRESETS.includes(form.badgeLabel as any) &&
                      form.badgeLabel !== "" && (
                        <Input
                          value={form.badgeLabel}
                          onChange={(e) =>
                            setField("badgeLabel", e.target.value)
                          }
                          placeholder="Skriv badge-text..."
                          className="mt-1"
                        />
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label>Badge-f&auml;rg</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={form.badgeColor}
                        onChange={(e) =>
                          setField("badgeColor", e.target.value)
                        }
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={form.badgeColor}
                        onChange={(e) =>
                          setField("badgeColor", e.target.value)
                        }
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Live preview card */}
                <div className="space-y-2">
                  <Label>F&ouml;rhandsvisning</Label>
                  <div
                    className="rounded-xl border p-4 max-w-[240px]"
                    style={{
                      backgroundColor: form.backgroundColor,
                      color: form.textColor,
                    }}
                  >
                    {form.badgeLabel && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium inline-block mb-2"
                        style={{
                          backgroundColor: form.badgeColor || "#ef4444",
                        }}
                      >
                        {form.badgeLabel}
                      </span>
                    )}
                    {form.imageUrl && (
                      <img
                        src={form.imageUrl}
                        alt=""
                        className="h-24 w-full object-cover rounded mb-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <p className="font-semibold text-sm">
                      {form.name || "Produktnamn"}
                    </p>
                    {form.brand && (
                      <p className="text-xs opacity-60">{form.brand}</p>
                    )}
                    <p className="font-bold mt-1">
                      {form.campaignPrice ? (
                        <>
                          <span className="line-through opacity-50 mr-1">
                            {form.price || 0} kr
                          </span>
                          <span className="text-rose-500">
                            {form.campaignPrice} kr
                          </span>
                        </>
                      ) : (
                        <>{form.price || 0} kr</>
                      )}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ---- TAB: Stock ---- */}
              <TabsContent value="stock" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU / Artikelnummer</Label>
                    <Input
                      value={form.sku}
                      onChange={(e) => setField("sku", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lagerstatus</Label>
                    <Select
                      value={form.stockStatus}
                      onValueChange={(v) =>
                        setField("stockStatus", v as StockStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(STOCK_STATUS_LABELS) as [
                            StockStatus,
                            string,
                          ][]
                        ).map(([val, label]) => (
                          <SelectItem key={val} value={val}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Antal i lager</Label>
                    <Input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setField("quantity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimumniv&aring; (varning)</Label>
                    <Input
                      type="number"
                      value={form.minStockLevel}
                      onChange={(e) =>
                        setField("minStockLevel", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sorteringsvikt</Label>
                    <Input
                      type="number"
                      value={form.sortWeight}
                      onChange={(e) => setField("sortWeight", e.target.value)}
                      placeholder="L&auml;gre = f&ouml;rst"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={form.showOnKiosk}
                    onCheckedChange={(v) => setField("showOnKiosk", v)}
                  />
                  <Label>Visa p&aring; kiosk</Label>
                </div>
              </TabsContent>

              {/* ---- TAB: Details ---- */}
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label>Allergener</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {ALL_ALLERGENS.map((a) => (
                      <label
                        key={a}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={form.allergens.includes(a)}
                          onCheckedChange={() => toggleAllergen(a)}
                        />
                        {ALLERGEN_LABELS[a]}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kalorier / N&auml;ringsinfo</Label>
                  <Input
                    value={form.nutritionInfo}
                    onChange={(e) =>
                      setField("nutritionInfo", e.target.value)
                    }
                    placeholder="T.ex. 250 kcal, protein 12g..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Momssats</Label>
                    <Select
                      value={String(form.vatRate)}
                      onValueChange={(v) =>
                        setField("vatRate", Number(v) as VatRate)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VAT_OPTIONS.map((r) => (
                          <SelectItem key={r} value={String(r)}>
                            {r}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ink&ouml;pspris (kr)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(e) => setField("costPrice", e.target.value)}
                      placeholder="F&ouml;r marginalber&auml;kning"
                    />
                    {form.costPrice && form.price && (
                      <p className="text-xs text-gray-500">
                        Marginal:{" "}
                        {(
                          ((Number(form.price) - Number(form.costPrice)) /
                            Number(form.price)) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ---- TAB: Internal ---- */}
              <TabsContent value="internal" className="space-y-4">
                <div className="space-y-2">
                  <Label>Leverant&ouml;r</Label>
                  <Input
                    value={form.supplierName}
                    onChange={(e) =>
                      setField("supplierName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intern anteckning</Label>
                  <Textarea
                    value={form.internalNote}
                    onChange={(e) =>
                      setField("internalNote", e.target.value)
                    }
                    rows={4}
                    placeholder="Syns bara h&auml;r i admin..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Avbryt
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isSubmitting
                  ? "Sparar..."
                  : editing
                  ? "Uppdatera"
                  : "Skapa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
