"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Settings as SettingsIcon, Store, Palette, Monitor, Receipt, ToggleLeft } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState({
    swishNumber: "",
    bubbleText1: "",
    bubbleText2: "",
    bubbleVisible: true,
    selectButtonVisible: true,
    storeName: "Zivert Holms hörna",
    storeSubtitle: "",
    screensaverEnabled: true,
    screensaverText: "Välkommen!",
    screensaverDelay: 120,
    receiptPrefix: "ZH",
    primaryColor: "#2d6b5a",
    secondaryColor: "#d4a574",
    accentColor: "#f5a623",
    offersEnabled: true,
    wishesEnabled: true,
    kioskLocked: true,
  });

  useEffect(() => {
    if (settings) {
      setForm((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(settings).filter(([_, v]) => v !== undefined)
        ),
      }));
    }
  }, [settings]);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    await updateMutation.mutateAsync(form);
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Laddar inställningar...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-6 w-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inställningar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurera din kiosk — alla ändringar synkas till kiosken</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <section className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Butiksinformation</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Butiksnamn</Label>
              <Input value={form.storeName} onChange={(e) => update("storeName", e.target.value)} placeholder="Zivert Holms hörna" />
            </div>
            <div className="space-y-2">
              <Label>Undertitel</Label>
              <Input value={form.storeSubtitle} onChange={(e) => update("storeSubtitle", e.target.value)} placeholder="Hemmets bästa hörna" />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Betalning & Kvitton</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Swish-nummer</Label>
              <Input value={form.swishNumber} onChange={(e) => update("swishNumber", e.target.value)} placeholder="07XXXXXXXX" />
              <p className="text-xs text-gray-500">Visas för kunder vid betalning</p>
            </div>
            <div className="space-y-2">
              <Label>Kvittoprefix</Label>
              <Input value={form.receiptPrefix} onChange={(e) => update("receiptPrefix", e.target.value)} placeholder="ZH" />
              <p className="text-xs text-gray-500">T.ex. ZH &rarr; kvitto ZH-0001</p>
            </div>
          </div>
        </section>

        {/* Theme Colors */}
        <section className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tema & Färger</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primärfärg</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="w-12 h-10 p-1" />
                <Input value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="flex-1" />
              </div>
              <p className="text-xs text-gray-500">Huvudfärg på kiosken</p>
            </div>
            <div className="space-y-2">
              <Label>Sekundärfärg</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)} className="w-12 h-10 p-1" />
                <Input value={form.secondaryColor} onChange={(e) => update("secondaryColor", e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accentfärg</Label>
              <div className="flex gap-2">
                <Input type="color" value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="w-12 h-10 p-1" />
                <Input value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
        </section>

        {/* Kiosk Display */}
        <section className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kiosk-skärm</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bubbla text rad 1</Label>
                <Input value={form.bubbleText1} onChange={(e) => update("bubbleText1", e.target.value)} placeholder="Välkommen!" />
              </div>
              <div className="space-y-2">
                <Label>Bubbla text rad 2</Label>
                <Input value={form.bubbleText2} onChange={(e) => update("bubbleText2", e.target.value)} placeholder="Bläddra bland produkterna" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skärmsläckare text</Label>
                <Input value={form.screensaverText} onChange={(e) => update("screensaverText", e.target.value)} placeholder="Välkommen!" />
              </div>
              <div className="space-y-2">
                <Label>Skärmsläckare fördröjning (sek)</Label>
                <Input type="number" value={form.screensaverDelay} onChange={(e) => update("screensaverDelay", Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div><Label>Visa bubbla</Label><p className="text-xs text-gray-500">Informationsbubbla på kiosken</p></div>
                <Switch checked={form.bubbleVisible} onCheckedChange={(v) => update("bubbleVisible", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Visa välj-knapp</Label><p className="text-xs text-gray-500">Kategori-väljaren på kiosken</p></div>
                <Switch checked={form.selectButtonVisible} onCheckedChange={(v) => update("selectButtonVisible", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Skärmsläckare</Label><p className="text-xs text-gray-500">Aktiveras efter inaktivitet</p></div>
                <Switch checked={form.screensaverEnabled} onCheckedChange={(v) => update("screensaverEnabled", v)} />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Toggles */}
        <section className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <div className="flex items-center gap-2 mb-4">
            <ToggleLeft className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Funktioner</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><Label>Erbjudanden</Label><p className="text-xs text-gray-500">Visa erbjudanden på kiosken</p></div>
              <Switch checked={form.offersEnabled} onCheckedChange={(v) => update("offersEnabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Kundönskningar</Label><p className="text-xs text-gray-500">Tillåt kunder skicka önskemål</p></div>
              <Switch checked={form.wishesEnabled} onCheckedChange={(v) => update("wishesEnabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Kiosk låst läge</Label><p className="text-xs text-gray-500">Lås kiosken i helskärm (ingen home/back-knapp)</p></div>
              <Switch checked={form.kioskLocked} onCheckedChange={(v) => update("kioskLocked", v)} />
            </div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full gap-2" size="lg">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Sparar..." : "Spara alla inställningar"}
        </Button>
      </div>
    </div>
  );
}
