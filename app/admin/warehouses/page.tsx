"use client";

import { useState, useMemo } from "react";
import {
  useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse,
  useProducts,
  useStockAllocations, useCreateStockAllocation, useAdjustStock, useTransferStock, useStockAdjustmentLog,
  useCategories,
} from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil, Trash2, Plus, Search, Warehouse, Package, ArrowRightLeft,
  AlertTriangle, RefreshCw, ClipboardList, TrendingDown, Truck
} from "lucide-react";
import type { Warehouse as WarehouseType, Product, StockAllocation } from "@/types";

const WAREHOUSE_TYPES = [
  { value: "Butik", label: "Butik (kiosk)" },
  { value: "Kyl", label: "Kyl" },
  { value: "Frys", label: "Frys" },
  { value: "Forrad", label: "Forrad" },
  { value: "Garage", label: "Garage" },
  { value: "Store", label: "Butik (hylla)" },
  { value: "Storage", label: "Huvudlager" },
  { value: "Main", label: "Huvudlager" },
];

const ADJUSTMENT_REASONS = [
  { value: "Svinn", label: "Svinn" },
  { value: "Stold", label: "Stold" },
  { value: "Korrigering", label: "Korrigering" },
  { value: "Inleverans", label: "Inleverans" },
  { value: "Retur", label: "Retur" },
];

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading: whLoading } = useWarehouses();
  const { data: products = [], isLoading: prodLoading } = useProducts();
  const { data: allocations = [], isLoading: allocLoading } = useStockAllocations();
  const { data: categories = [] } = useCategories();
  const { data: adjustmentLog = [] } = useStockAdjustmentLog();
  const createWh = useCreateWarehouse();
  const updateWh = useUpdateWarehouse();
  const deleteWh = useDeleteWarehouse();
  const createAlloc = useCreateStockAllocation();
  const adjustStock = useAdjustStock();
  const transferStock = useTransferStock();
  const { toast } = useToast();

  // Warehouse CRUD state
  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<WarehouseType | null>(null);
  const [whName, setWhName] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whType, setWhType] = useState("Butik");
  const [whSearch, setWhSearch] = useState("");
  const [deleteWhId, setDeleteWhId] = useState<string | null>(null);

  // Stock management state
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");

  // Refill dialog (move stock from warehouse to kiosk)
  const [refillOpen, setRefillOpen] = useState(false);
  const [refillProductId, setRefillProductId] = useState("");
  const [refillFromWarehouse, setRefillFromWarehouse] = useState("");
  const [refillToWarehouse, setRefillToWarehouse] = useState("");
  const [refillQty, setRefillQty] = useState("1");

  // Adjust dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustWarehouse, setAdjustWarehouse] = useState("");
  const [adjustQtyChange, setAdjustQtyChange] = useState("0");
  const [adjustReason, setAdjustReason] = useState("Korrigering");
  const [adjustNotes, setAdjustNotes] = useState("");

  // Inleverans dialog
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [deliveryProductId, setDeliveryProductId] = useState("");
  const [deliveryWarehouse, setDeliveryWarehouse] = useState("");
  const [deliveryQty, setDeliveryQty] = useState("1");
  const [deliverySupplier, setDeliverySupplier] = useState("");
  const [deliveryCost, setDeliveryCost] = useState("");
  const [deliveryExpDate, setDeliveryExpDate] = useState("");

  // Create allocation dialog
  const [allocDialogOpen, setAllocDialogOpen] = useState(false);
  const [allocProductId, setAllocProductId] = useState("");
  const [allocWarehouseId, setAllocWarehouseId] = useState("");
  const [allocQty, setAllocQty] = useState("0");

  // Build stock overview: product -> warehouse -> quantity
  const stockOverview = useMemo(() => {
    const map = new Map<string, {
      product: Product;
      totalStock: number;
      kioskStock: number;
      minLevel: number;
      allocByWarehouse: Map<string, number>;
    }>();

    for (const alloc of allocations) {
      const pid = alloc.productId;
      const product = products.find(p => p.id === pid);
      if (!product) continue;

      if (!map.has(pid)) {
        map.set(pid, {
          product,
          totalStock: 0,
          kioskStock: 0,
          minLevel: product.minStockLevel || 0,
          allocByWarehouse: new Map(),
        });
      }

      const entry = map.get(pid)!;
      const qty = Number(alloc.quantity || 0);
      entry.totalStock += qty;
      entry.allocByWarehouse.set(alloc.warehouseId, qty);

      // Check if this warehouse is a kiosk/butik type
      const wh = warehouses.find(w => w.id === alloc.warehouseId);
      if (wh && ((wh as any).type === "Butik" || (wh as any).type === "Store")) {
        entry.kioskStock += qty;
      }
    }

    // Also add products that have no allocations
    for (const product of products) {
      if (!map.has(product.id)) {
        map.set(product.id, {
          product,
          totalStock: product.quantity || 0,
          kioskStock: 0,
          minLevel: product.minStockLevel || 0,
          allocByWarehouse: new Map(),
        });
      }
    }

    return map;
  }, [products, allocations, warehouses]);

  const filteredStock = useMemo(() => {
    let entries = Array.from(stockOverview.values());

    if (stockSearch) {
      const term = stockSearch.toLowerCase();
      entries = entries.filter(e =>
        e.product.name.toLowerCase().includes(term) ||
        e.product.sku?.toLowerCase().includes(term)
      );
    }

    if (stockCategoryFilter !== "all") {
      entries = entries.filter(e => e.product.categoryId === stockCategoryFilter);
    }

    return entries.sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [stockOverview, stockSearch, stockCategoryFilter]);

  const getStockStatus = (total: number, min: number) => {
    if (min <= 0) return "normal";
    if (total > min) return "ok";
    if (total === min) return "warn";
    return "low";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok": return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">OK</Badge>;
      case "warn": return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Min</Badge>;
      case "low": return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Lag</Badge>;
      default: return <Badge variant="secondary">-</Badge>;
    }
  };

  const lowStockCount = filteredStock.filter(e => getStockStatus(e.totalStock, e.minLevel) === "low").length;

  // Warehouse CRUD handlers
  const filteredWarehouses = warehouses.filter(w => w.name.toLowerCase().includes(whSearch.toLowerCase()));

  const openCreateWh = () => {
    setEditingWh(null); setWhName(""); setWhAddress(""); setWhType("Butik");
    setWhDialogOpen(true);
  };

  const openEditWh = (w: WarehouseType) => {
    setEditingWh(w); setWhName(w.name); setWhAddress((w as any).address || ""); setWhType((w as any).type || "Butik");
    setWhDialogOpen(true);
  };

  const handleSubmitWh = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim()) return;
    const data: any = { name: whName.trim(), address: whAddress, type: whType, status: true };
    if (editingWh) {
      await updateWh.mutateAsync({ ...data, id: editingWh.id });
    } else {
      await createWh.mutateAsync(data);
    }
    setWhDialogOpen(false);
  };

  const handleDeleteWh = async () => {
    if (deleteWhId) {
      await deleteWh.mutateAsync(deleteWhId);
      setDeleteWhId(null);
    }
  };

  // Refill handler
  const handleRefill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillProductId || !refillFromWarehouse || !refillToWarehouse || !refillQty) return;
    await transferStock.mutateAsync({
      productId: refillProductId,
      fromWarehouseId: refillFromWarehouse,
      toWarehouseId: refillToWarehouse,
      quantity: Number(refillQty),
    });
    setRefillOpen(false);
  };

  // Adjust handler
  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustWarehouse) return;
    await adjustStock.mutateAsync({
      productId: adjustProductId,
      warehouseId: adjustWarehouse,
      quantityChange: Number(adjustQtyChange),
      reason: adjustReason,
      notes: adjustNotes || undefined,
    });
    setAdjustOpen(false);
  };

  // Inleverans handler
  const handleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryProductId || !deliveryWarehouse || !deliveryQty) return;
    await adjustStock.mutateAsync({
      productId: deliveryProductId,
      warehouseId: deliveryWarehouse,
      quantityChange: Number(deliveryQty),
      reason: "Inleverans",
      notes: [
        deliverySupplier && `Leverantor: ${deliverySupplier}`,
        deliveryCost && `Kostnad: ${deliveryCost} kr`,
        deliveryExpDate && `Utgangsdatum: ${deliveryExpDate}`,
      ].filter(Boolean).join(", ") || undefined,
    });
    setDeliveryOpen(false);
    toast({ title: "Inleverans registrerad" });
  };

  // Create allocation handler
  const handleCreateAlloc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocProductId || !allocWarehouseId) return;
    await createAlloc.mutateAsync({
      productId: allocProductId,
      warehouseId: allocWarehouseId,
      quantity: Number(allocQty),
    });
    setAllocDialogOpen(false);
  };

  const openRefill = (productId: string) => {
    setRefillProductId(productId);
    const storageWh = warehouses.find(w => {
      const t = (w as any).type;
      return t && t !== "Butik" && t !== "Store";
    });
    const kioskWh = warehouses.find(w => {
      const t = (w as any).type;
      return t === "Butik" || t === "Store";
    });
    setRefillFromWarehouse(storageWh?.id || "");
    setRefillToWarehouse(kioskWh?.id || "");
    setRefillQty("1");
    setRefillOpen(true);
  };

  const openAdjust = (productId: string) => {
    setAdjustProductId(productId);
    setAdjustWarehouse(warehouses[0]?.id || "");
    setAdjustQtyChange("0");
    setAdjustReason("Korrigering");
    setAdjustNotes("");
    setAdjustOpen(true);
  };

  const isLoading = whLoading || prodLoading || allocLoading;
  const isWhSubmitting = createWh.isPending || updateWh.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Lager & Inventering</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hantera lagerplatser, lagersaldon och leveranser</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setDeliveryProductId(products[0]?.id || ""); setDeliveryWarehouse(warehouses[0]?.id || ""); setDeliveryQty("1"); setDeliverySupplier(""); setDeliveryCost(""); setDeliveryExpDate(""); setDeliveryOpen(true); }} variant="outline" className="gap-2">
            <Truck className="h-4 w-4" /> Inleverans
          </Button>
          <Button onClick={openCreateWh} className="gap-2 bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4" /> Ny lagerplats
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-sky-400/20 bg-sky-50/50 dark:bg-sky-900/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Warehouse className="h-4 w-4 text-sky-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Lagerplatser</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{warehouses.length}</p>
        </div>
        <div className="rounded-xl border border-sky-400/20 bg-sky-50/50 dark:bg-sky-900/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-sky-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Produkter</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
        </div>
        <div className="rounded-xl border border-sky-400/20 bg-sky-50/50 dark:bg-sky-900/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-sky-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Allokeringar</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{allocations.length}</p>
        </div>
        <div className="rounded-xl border border-sky-400/20 bg-sky-50/50 dark:bg-sky-900/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-red-500" : "text-sky-500"}`} />
            <p className="text-sm text-gray-500 dark:text-gray-400">Lagt lager</p>
          </div>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{lowStockCount}</p>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="gap-1"><Package className="h-4 w-4" /> Lagersaldo</TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-1"><Warehouse className="h-4 w-4" /> Lagerplatser</TabsTrigger>
          <TabsTrigger value="allocations" className="gap-1"><ArrowRightLeft className="h-4 w-4" /> Allokeringar</TabsTrigger>
          <TabsTrigger value="log" className="gap-1"><ClipboardList className="h-4 w-4" /> Justeringslogg</TabsTrigger>
        </TabsList>

        {/* ========== STOCK TAB ========== */}
        <TabsContent value="stock">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Sok produkt..." value={stockSearch} onChange={e => setStockSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={stockCategoryFilter} onValueChange={setStockCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ""}{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-sky-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/50 dark:bg-white/10">
                  <TableHead className="font-semibold">Produktnamn</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold text-right">Totalt lager</TableHead>
                  <TableHead className="font-semibold text-right">I butik/kiosk</TableHead>
                  <TableHead className="font-semibold text-right">Miniminiva</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-right">Atgarder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
                ) : filteredStock.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Inga produkter hittade</TableCell></TableRow>
                ) : (
                  filteredStock.map(entry => {
                    const status = getStockStatus(entry.totalStock, entry.minLevel);
                    const cat = categories.find(c => c.id === entry.product.categoryId);
                    return (
                      <TableRow key={entry.product.id} className={`hover:bg-sky-50/30 dark:hover:bg-white/5 ${status === "low" ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          <div>
                            {entry.product.name}
                            {entry.product.sku && <span className="text-xs text-gray-400 ml-2">({entry.product.sku})</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {cat ? `${cat.emoji || ""} ${cat.name}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{entry.totalStock}</TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">{entry.kioskStock}</TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">{entry.minLevel || "-"}</TableCell>
                        <TableCell className="text-center">{getStatusBadge(status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="outline" size="sm" className="text-xs gap-1 h-7" onClick={() => openRefill(entry.product.id)}>
                              <RefreshCw className="h-3 w-3" /> Fyll pa
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs gap-1 h-7" onClick={() => openAdjust(entry.product.id)}>
                              <TrendingDown className="h-3 w-3" /> Justera
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
        </TabsContent>

        {/* ========== WAREHOUSES TAB ========== */}
        <TabsContent value="warehouses">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Sok lagerplatser..." value={whSearch} onChange={(e) => setWhSearch(e.target.value)} className="pl-10" />
          </div>

          <div className="rounded-xl border border-sky-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/50 dark:bg-white/10">
                  <TableHead className="font-semibold">Namn</TableHead>
                  <TableHead className="font-semibold">Adress</TableHead>
                  <TableHead className="font-semibold">Typ</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Produkter</TableHead>
                  <TableHead className="font-semibold text-right">Atgarder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
                ) : filteredWarehouses.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500"><Warehouse className="h-8 w-8 mx-auto mb-2 text-sky-300" />Inga lagerplatser</TableCell></TableRow>
                ) : (
                  filteredWarehouses.map((w) => {
                    const whAllocs = allocations.filter(a => a.warehouseId === w.id);
                    const productCount = whAllocs.length;
                    const totalQty = whAllocs.reduce((s, a) => s + Number(a.quantity || 0), 0);
                    return (
                      <TableRow key={w.id} className="hover:bg-sky-50/30 dark:hover:bg-white/5">
                        <TableCell className="font-medium text-gray-900 dark:text-white">{w.name}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{(w as any).address || "\u2014"}</TableCell>
                        <TableCell><Badge variant="secondary">{(w as any).type || "\u2014"}</Badge></TableCell>
                        <TableCell>
                          <Badge className={w.status ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}>
                            {w.status ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">
                          {productCount} produkter ({totalQty} st)
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => openEditWh(w)}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteWhId(w.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ========== ALLOCATIONS TAB ========== */}
        <TabsContent value="allocations">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Visar vilka produkter som finns i vilka lagerplatser</p>
            <Button onClick={() => { setAllocProductId(products[0]?.id || ""); setAllocWarehouseId(warehouses[0]?.id || ""); setAllocQty("0"); setAllocDialogOpen(true); }} variant="outline" className="gap-2" size="sm">
              <Plus className="h-4 w-4" /> Ny allokering
            </Button>
          </div>

          <div className="rounded-xl border border-sky-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/50 dark:bg-white/10">
                  <TableHead className="font-semibold">Produkt</TableHead>
                  <TableHead className="font-semibold">Lagerplats</TableHead>
                  <TableHead className="font-semibold text-right">Antal</TableHead>
                  <TableHead className="font-semibold text-right">Reserverat</TableHead>
                  <TableHead className="font-semibold text-right">Tillgangligt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
                ) : allocations.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Inga allokeringar</TableCell></TableRow>
                ) : (
                  allocations.map(a => (
                    <TableRow key={a.id} className="hover:bg-sky-50/30 dark:hover:bg-white/5">
                      <TableCell className="font-medium text-gray-900 dark:text-white">{a.product?.name || a.productId}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{a.warehouse?.name || a.warehouseId}</TableCell>
                      <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{a.quantity}</TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-400">{a.reservedQuantity}</TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-400">{a.quantity - a.reservedQuantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ========== ADJUSTMENT LOG TAB ========== */}
        <TabsContent value="log">
          <div className="rounded-xl border border-sky-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-sky-100 dark:border-white/10">
              <h2 className="font-semibold text-gray-900 dark:text-white">Justeringslogg</h2>
              <p className="text-sm text-gray-500">Senaste 100 lagerjusteringar</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-sky-50/50 dark:bg-white/10">
                  <TableHead className="font-semibold">Datum</TableHead>
                  <TableHead className="font-semibold">Produkt</TableHead>
                  <TableHead className="font-semibold">Lagerplats</TableHead>
                  <TableHead className="font-semibold text-right">Forre</TableHead>
                  <TableHead className="font-semibold text-right">Andring</TableHead>
                  <TableHead className="font-semibold text-right">Nytt</TableHead>
                  <TableHead className="font-semibold">Orsak</TableHead>
                  <TableHead className="font-semibold">Anteckning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(adjustmentLog as any[]).length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Inga justeringar loggade annu</TableCell></TableRow>
                ) : (
                  (adjustmentLog as any[]).map((log: any) => {
                    const product = products.find(p => p.id === log.productId);
                    const wh = warehouses.find(w => w.id === log.warehouseId);
                    const date = log.createdAt ? new Date(log.createdAt).toLocaleString("sv-SE") : "-";
                    return (
                      <TableRow key={log.id} className="hover:bg-sky-50/30 dark:hover:bg-white/5">
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{date}</TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white">{product?.name || log.productId}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{wh?.name || log.warehouseId}</TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">{log.oldQuantity}</TableCell>
                        <TableCell className={`text-right font-medium ${log.quantityChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {log.quantityChange >= 0 ? "+" : ""}{log.quantityChange}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-gray-900 dark:text-white">{log.newQuantity}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs">{log.reason}</Badge></TableCell>
                        <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">{log.notes || "-"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ========== DIALOGS ========== */}

      {/* Warehouse Create/Edit Dialog */}
      <Dialog open={whDialogOpen} onOpenChange={setWhDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingWh ? "Redigera lagerplats" : "Ny lagerplats"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitWh} className="space-y-4">
            <div className="space-y-2"><Label>Namn *</Label><Input value={whName} onChange={(e) => setWhName(e.target.value)} placeholder="T.ex. Kyl, Forrad, Garage..." required /></div>
            <div className="space-y-2"><Label>Adress/Plats</Label><Input value={whAddress} onChange={(e) => setWhAddress(e.target.value)} placeholder="Butiken, Garaget..." /></div>
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={whType} onValueChange={setWhType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={isWhSubmitting} className="bg-sky-600 hover:bg-sky-700">{isWhSubmitting ? "Sparar..." : editingWh ? "Uppdatera" : "Skapa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Warehouse Confirm */}
      <AlertDialog open={!!deleteWhId} onOpenChange={(open) => !open && setDeleteWhId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Radera lagerplats?</AlertDialogTitle>
            <AlertDialogDescription>Denna atgard kan inte angras. Alla allokeringar for denna lagerplats kan paverkas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteWh}>Radera</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refill Dialog (Transfer) */}
      <Dialog open={refillOpen} onOpenChange={setRefillOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Fyll pa - Flytta lager till butik</DialogTitle></DialogHeader>
          <form onSubmit={handleRefill} className="space-y-4">
            <div className="space-y-2">
              <Label>Produkt</Label>
              <Select value={refillProductId} onValueChange={setRefillProductId}>
                <SelectTrigger><SelectValue placeholder="Valj produkt" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fran lagerplats</Label>
              <Select value={refillFromWarehouse} onValueChange={setRefillFromWarehouse}>
                <SelectTrigger><SelectValue placeholder="Valj kallager" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({(w as any).type || "-"})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Till lagerplats (butik/kiosk)</Label>
              <Select value={refillToWarehouse} onValueChange={setRefillToWarehouse}>
                <SelectTrigger><SelectValue placeholder="Valj mallager" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name} ({(w as any).type || "-"})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Antal</Label>
              <Input type="number" min="1" value={refillQty} onChange={e => setRefillQty(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={transferStock.isPending} className="bg-sky-600 hover:bg-sky-700">
                {transferStock.isPending ? "Flyttar..." : "Flytta lager"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Justera lagersaldo</DialogTitle></DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="space-y-2">
              <Label>Produkt</Label>
              <Select value={adjustProductId} onValueChange={setAdjustProductId}>
                <SelectTrigger><SelectValue placeholder="Valj produkt" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lagerplats</Label>
              <Select value={adjustWarehouse} onValueChange={setAdjustWarehouse}>
                <SelectTrigger><SelectValue placeholder="Valj lagerplats" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Andring (+ eller -)</Label>
              <Input type="number" value={adjustQtyChange} onChange={e => setAdjustQtyChange(e.target.value)} placeholder="T.ex. -5 eller +10" />
            </div>
            <div className="space-y-2">
              <Label>Orsak</Label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Anteckning (valfritt)</Label>
              <Textarea value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} placeholder="Beskriv justeringen..." />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={adjustStock.isPending} className="bg-sky-600 hover:bg-sky-700">
                {adjustStock.isPending ? "Sparar..." : "Justera"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Inleverans Dialog */}
      <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrera inleverans</DialogTitle></DialogHeader>
          <form onSubmit={handleDelivery} className="space-y-4">
            <div className="space-y-2">
              <Label>Produkt</Label>
              <Select value={deliveryProductId} onValueChange={setDeliveryProductId}>
                <SelectTrigger><SelectValue placeholder="Valj produkt" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Till lagerplats</Label>
              <Select value={deliveryWarehouse} onValueChange={setDeliveryWarehouse}>
                <SelectTrigger><SelectValue placeholder="Valj lagerplats" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Antal</Label>
                <Input type="number" min="1" value={deliveryQty} onChange={e => setDeliveryQty(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Kostnad (kr)</Label>
                <Input type="number" value={deliveryCost} onChange={e => setDeliveryCost(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leverantor</Label>
              <Input value={deliverySupplier} onChange={e => setDeliverySupplier(e.target.value)} placeholder="Leverantorsnamn" />
            </div>
            <div className="space-y-2">
              <Label>Utgangsdatum (valfritt)</Label>
              <Input type="date" value={deliveryExpDate} onChange={e => setDeliveryExpDate(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={adjustStock.isPending} className="bg-sky-600 hover:bg-sky-700">
                {adjustStock.isPending ? "Sparar..." : "Registrera inleverans"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Allocation Dialog */}
      <Dialog open={allocDialogOpen} onOpenChange={setAllocDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ny allokering</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateAlloc} className="space-y-4">
            <div className="space-y-2">
              <Label>Produkt</Label>
              <Select value={allocProductId} onValueChange={setAllocProductId}>
                <SelectTrigger><SelectValue placeholder="Valj produkt" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lagerplats</Label>
              <Select value={allocWarehouseId} onValueChange={setAllocWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Valj lagerplats" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Antal</Label>
              <Input type="number" min="0" value={allocQty} onChange={e => setAllocQty(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={createAlloc.isPending} className="bg-sky-600 hover:bg-sky-700">
                {createAlloc.isPending ? "Sparar..." : "Skapa allokering"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
