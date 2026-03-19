"use client";

import { useWishes, useClearWishes } from "@/hooks/queries/use-wishes";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Heart } from "lucide-react";

export default function WishesPage() {
  const { data: wishes = [], isLoading } = useWishes();
  const clearMutation = useClearWishes();

  const handleClearAll = async () => {
    if (wishes.length === 0) return;
    if (confirm(`Radera alla ${wishes.length} önskningar?`)) {
      await clearMutation.mutateAsync();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kundönskningar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Önskemål och feedback från kioskkunder</p>
        </div>
        <Button variant="destructive" onClick={handleClearAll} disabled={clearMutation.isPending || wishes.length === 0} className="gap-2">
          <Trash2 className="h-4 w-4" /> Rensa alla ({wishes.length})
        </Button>
      </div>

      <div className="rounded-xl border border-violet-400/20 dark:border-white/10 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-violet-50/50 dark:bg-white/10">
              <TableHead className="font-semibold">Kategori</TableHead>
              <TableHead className="font-semibold">Önskning</TableHead>
              <TableHead className="font-semibold text-right">Tid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-500">Laddar...</TableCell></TableRow>
            ) : wishes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-violet-300" />
                  <p>Inga önskningar ännu</p>
                  <p className="text-xs mt-1">Kundernas önskemål från kiosken visas här</p>
                </TableCell>
              </TableRow>
            ) : (
              wishes.map((wish) => (
                <TableRow key={wish.id} className="hover:bg-violet-50/30 dark:hover:bg-white/5">
                  <TableCell>
                    {wish.category ? (
                      <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{wish.category}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">{wish.text}</TableCell>
                  <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {wish.timestamp?.toDate ? new Date(wish.timestamp.toDate()).toLocaleString("sv-SE") : wish.timestamp?._seconds ? new Date(wish.timestamp._seconds * 1000).toLocaleString("sv-SE") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
