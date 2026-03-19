"use client";

import { useState } from "react";
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Warehouse } from "lucide-react";
import type { Warehouse as WarehouseType } from "@/types";

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseType | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("Store");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = warehouses.filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openCreate = () => {
    setEditing(null); setName(""); setAddress(""); setType("Store");
    setDialogOpen(true);
  };

  const openEdit = (w: WarehouseType) => {
    setEditing(w); setName(w.name); setAddress((w as any).address || ""); setType((w as any).type || "Store");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const data: any = { name: name.trim(), address, type, status: true };
    if (editing) {
      await updateMutation.mutateAsync({ ...data, id: editing.id });
    } else {
      await createMutation.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Radera denna lagerplats?")) await deleteMutation.mutateAsync(id);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Lagerplatser</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hantera dina lagerplatser (kyl, förråd, garage)</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-sky-600 hover:bg-sky-700"><Plus className="h-4 w-4" /> Ny lagerplats</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Sök lagerplatser..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-xl border border-sky-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Namn</TableHead>
              <TableHead className="font-semibold">Adress</TableHead>
              <TableHead className="font-semibold">Typ</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500"><Warehouse className="h-8 w-8 mx-auto mb-2 text-sky-300" />Inga lagerplatser</TableCell></TableRow>
            ) : (
              filtered.map((w) => (
                <TableRow key={w.id} className="hover:bg-sky-50/30 dark:hover:bg-white/5">
                  <TableCell className="font-medium text-gray-900 dark:text-white">{w.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">{(w as any).address || "—"}</TableCell>
                  <TableCell><Badge variant="secondary">{(w as any).type || "—"}</Badge></TableCell>
                  <TableCell>
                    <Badge className={w.status ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}>
                      {w.status ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Redigera lagerplats" : "Ny lagerplats"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Namn *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Kyl, Förråd, Garage..." required /></div>
            <div className="space-y-2"><Label>Adress/Plats</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Butiken, Garaget..." /></div>
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Store">Butik (kyl/hylla)</SelectItem>
                  <SelectItem value="Storage">Förråd (garage)</SelectItem>
                  <SelectItem value="Main">Huvudlager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Avbryt</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-700">{isSubmitting ? "Sparar..." : editing ? "Uppdatera" : "Skapa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
