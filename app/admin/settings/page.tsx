"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [swishNumber, setSwishNumber] = useState("");
  const [bubbleText1, setBubbleText1] = useState("");
  const [bubbleText2, setBubbleText2] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [selectButtonVisible, setSelectButtonVisible] = useState(true);

  useEffect(() => {
    if (settings) {
      setSwishNumber(settings.swishNumber || "");
      setBubbleText1(settings.bubbleText1 || "");
      setBubbleText2(settings.bubbleText2 || "");
      setBubbleVisible(settings.bubbleVisible !== false);
      setSelectButtonVisible(settings.selectButtonVisible !== false);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      swishNumber,
      bubbleText1,
      bubbleText2,
      bubbleVisible,
      selectButtonVisible,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Laddar inställningar...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-6 w-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inställningar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurera din kiosk</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Betalning */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Betalning</h2>
          <div className="space-y-2">
            <Label htmlFor="swish">Swish-nummer</Label>
            <Input id="swish" value={swishNumber} onChange={(e) => setSwishNumber(e.target.value)} placeholder="07XXXXXXXX" />
            <p className="text-xs text-gray-500">Numret som visas för kunder vid betalning</p>
          </div>
        </div>

        {/* Kiosk-utseende */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kiosk-utseende</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bubble1">Bubbla text rad 1</Label>
              <Input id="bubble1" value={bubbleText1} onChange={(e) => setBubbleText1(e.target.value)} placeholder="Välkommen!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bubble2">Bubbla text rad 2</Label>
              <Input id="bubble2" value={bubbleText2} onChange={(e) => setBubbleText2(e.target.value)} placeholder="Bläddra bland våra produkter" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Visa bubbla</Label>
                <p className="text-xs text-gray-500">Visa informationsbubbla på kiosken</p>
              </div>
              <Switch checked={bubbleVisible} onCheckedChange={setBubbleVisible} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Visa välj-knapp</Label>
                <p className="text-xs text-gray-500">Visa kategori-väljaren på kiosken</p>
              </div>
              <Switch checked={selectButtonVisible} onCheckedChange={setSelectButtonVisible} />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full gap-2" size="lg">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Sparar..." : "Spara inställningar"}
        </Button>
      </div>
    </div>
  );
}
