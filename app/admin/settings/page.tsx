"use client";

import { useState, useEffect, useCallback } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/queries/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save, Settings as SettingsIcon, Store, Palette, Monitor, Receipt,
  ToggleLeft, Clock, Volume2, Shield, CreditCard, AlertTriangle, Printer,
} from "lucide-react";

const DAY_LABELS: Record<string, string> = {
  mon: "Måndag",
  tue: "Tisdag",
  wed: "Onsdag",
  thu: "Torsdag",
  fri: "Fredag",
  sat: "Lördag",
  sun: "Söndag",
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const defaultOpeningHours: Record<string, { from: string; to: string; closed: boolean }> = {
  mon: { from: "08:00", to: "18:00", closed: false },
  tue: { from: "08:00", to: "18:00", closed: false },
  wed: { from: "08:00", to: "18:00", closed: false },
  thu: { from: "08:00", to: "18:00", closed: false },
  fri: { from: "08:00", to: "18:00", closed: false },
  sat: { from: "10:00", to: "16:00", closed: false },
  sun: { from: "00:00", to: "00:00", closed: true },
};

const FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState<Record<string, any>>({
    // Butiksinformation
    storeName: "Zivert Holms hörna",
    storeSubtitle: "",
    companyAddress: "",
    orgNumber: "",
    vatNumber: "",
    logoUrl: "",
    // Betalning
    swishNumber: "",
    paymentSwish: true,
    paymentCard: false,
    paymentCash: false,
    paymentQR: false,
    receiptPrefix: "ZH",
    // Utseende / Tema
    primaryColor: "#2d6b5a",
    secondaryColor: "#d4a574",
    accentColor: "#f5a623",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    buttonRadius: 8,
    fontFamily: "Inter",
    productCardStyle: "style1",
    productsPerRow: 3,
    themeMode: "light",
    animationsEnabled: true,
    // Kiosk-display
    welcomeText: "Välkommen till vår kiosk!",
    screensaverEnabled: true,
    screensaverDelay: 5,
    screensaverText: "Välkommen!",
    bubbleText1: "",
    bubbleText2: "",
    bubbleVisible: true,
    selectButtonVisible: true,
    // Drift
    openingHours: defaultOpeningHours,
    autoRestartTime: "03:00",
    ordersPaused: false,
    pauseMessage: "",
    emergencyMessage: "",
    // Ljud & Tillganglighet
    soundEffects: true,
    soundVolume: 70,
    largeTextMode: false,
    highContrast: false,
    // Funktioner
    offersEnabled: true,
    wishesEnabled: true,
    kioskLocked: true,
    tippingEnabled: false,
    tipAmount1: 10,
    tipAmount2: 20,
    tipAmount3: 50,
    orderQueueEnabled: true,
    orderQueueFormat: "ZH-####",
    // Kvittodesign
    receiptLogoUrl: "",
    receiptThankYou: "Tack för ditt köp!",
    receiptFooter: "",
    receiptShowOrderNumber: true,
    receiptShowDateTime: true,
    receiptShowVat: true,
    receiptFontSize: 12,
    receiptPaperWidth: "80mm",
    // Sakerhet
    kioskPassword: "",
    sessionTimeout: 30,
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

  const update = useCallback((key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateHours = useCallback((day: string, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  }, []);

  const handleSave = async () => {
    await updateMutation.mutateAsync(form as any);
  };

  const handleSendEmergency = async () => {
    if (!form.emergencyMessage.trim()) return;
    await updateMutation.mutateAsync({ emergencyMessage: form.emergencyMessage } as any);
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Laddar inställningar...</div>;

  const sectionClass = "rounded-xl border border-slate-200 dark:border-white/10 p-6 bg-white/80 dark:bg-white/5";
  const sectionHeaderClass = "flex items-center gap-2 mb-4";
  const h2Class = "text-lg font-semibold text-gray-900 dark:text-white";
  const hintClass = "text-xs text-gray-500";

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

        {/* ─── Butiksinformation ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Store className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Butiksinformation</h2>
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Företagsadress</Label>
              <Input value={form.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} placeholder="Storgatan 1, 123 45 Stad" />
            </div>
            <div className="space-y-2">
              <Label>Organisationsnummer</Label>
              <Input value={form.orgNumber} onChange={(e) => update("orgNumber", e.target.value)} placeholder="XXXXXX-XXXX" />
            </div>
            <div className="space-y-2">
              <Label>Momsregistreringsnummer</Label>
              <Input value={form.vatNumber} onChange={(e) => update("vatNumber", e.target.value)} placeholder="SE123456789001" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Logotyp URL</Label>
              <Input value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://..." />
              {form.logoUrl && (
                <div className="mt-2 p-2 border rounded-lg inline-block bg-white">
                  <img src={form.logoUrl} alt="Logo" className="h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Betalning ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <CreditCard className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Betalning</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Swish-nummer</Label>
              <Input value={form.swishNumber} onChange={(e) => update("swishNumber", e.target.value)} placeholder="07XXXXXXXX" />
              <p className={hintClass}>Visas för kunder vid betalning</p>
            </div>
            <div className="space-y-2">
              <Label>Kvittoprefix</Label>
              <Input value={form.receiptPrefix} onChange={(e) => update("receiptPrefix", e.target.value)} placeholder="ZH" />
              <p className={hintClass}>T.ex. ZH &rarr; kvitto ZH-0001</p>
            </div>
          </div>
          <div className="mt-4">
            <Label className="mb-3 block">Betalmetoder aktiverade</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                ["paymentSwish", "Swish"],
                ["paymentCard", "Kort"],
                ["paymentCash", "Kontant"],
                ["paymentQR", "QR"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={form[key]} onCheckedChange={(v) => update(key, !!v)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Utseende / Tema ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Palette className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Utseende / Tema</h2>
          </div>
          {/* Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              ["primaryColor", "Primärfärg"],
              ["secondaryColor", "Sekundärfärg"],
              ["accentColor", "Accentfärg"],
              ["backgroundColor", "Bakgrundsfärg"],
              ["textColor", "Textfärg"],
            ] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input type="color" value={form[key]} onChange={(e) => update(key, e.target.value)} className="w-12 h-10 p-1" />
                  <Input value={form[key]} onChange={(e) => update(key, e.target.value)} className="flex-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Button radius */}
          <div className="mt-4 space-y-2">
            <Label>Knappradie: {form.buttonRadius}px</Label>
            <input type="range" min={0} max={20} value={form.buttonRadius} onChange={(e) => update("buttonRadius", Number(e.target.value))} className="w-full accent-emerald-600" />
          </div>

          {/* Font */}
          <div className="mt-4 space-y-2">
            <Label>Typsnitt</Label>
            <Select value={form.fontFamily} onValueChange={(v) => update("fontFamily", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Product card style */}
          <div className="mt-4 space-y-2">
            <Label>Produktkortsstil</Label>
            <div className="flex gap-4">
              {["style1", "style2", "style3"].map((s, i) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="productCardStyle" value={s} checked={form.productCardStyle === s} onChange={() => update("productCardStyle", s)} className="accent-emerald-600" />
                  <span className="text-sm">Stil {i + 1}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Products per row */}
          <div className="mt-4 space-y-2">
            <Label>Antal produkter per rad</Label>
            <div className="flex gap-4">
              {[2, 3, 4].map((n) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="productsPerRow" value={n} checked={form.productsPerRow === n} onChange={() => update("productsPerRow", n)} className="accent-emerald-600" />
                  <span className="text-sm">{n}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme mode */}
          <div className="mt-4 space-y-2">
            <Label>Temaläge</Label>
            <div className="flex gap-4">
              {([["light", "Ljust läge"], ["dark", "Mörkt läge"], ["auto", "Auto"]] as const).map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="themeMode" value={v} checked={form.themeMode === v} onChange={() => update("themeMode", v)} className="accent-emerald-600" />
                  <span className="text-sm">{l}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Animations */}
          <div className="mt-4 flex items-center justify-between">
            <div><Label>Animationer</Label><p className={hintClass}>Aktivera/avaktivera UI-animationer</p></div>
            <Switch checked={form.animationsEnabled} onCheckedChange={(v) => update("animationsEnabled", v)} />
          </div>
        </section>

        {/* ─── Kiosk-display ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Monitor className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Kiosk-display</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Välkomsttext</Label>
              <Textarea value={form.welcomeText} onChange={(e) => update("welcomeText", e.target.value)} placeholder="Välkommen till vår kiosk!" rows={2} />
            </div>
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
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div><Label>Visa bubbla</Label><p className={hintClass}>Informationsbubbla på kiosken</p></div>
                <Switch checked={form.bubbleVisible} onCheckedChange={(v) => update("bubbleVisible", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div><Label>Visa välj-knapp</Label><p className={hintClass}>Kategori-väljaren på kiosken</p></div>
                <Switch checked={form.selectButtonVisible} onCheckedChange={(v) => update("selectButtonVisible", v)} />
              </div>
            </div>
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="flex items-center justify-between">
              <div><Label>Skärmsläckare aktiverad</Label></div>
              <Switch checked={form.screensaverEnabled} onCheckedChange={(v) => update("screensaverEnabled", v)} />
            </div>
            {form.screensaverEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fördröjning: {form.screensaverDelay} min</Label>
                  <input type="range" min={1} max={30} value={form.screensaverDelay} onChange={(e) => update("screensaverDelay", Number(e.target.value))} className="w-full accent-emerald-600" />
                </div>
                <div className="space-y-2">
                  <Label>Skärmsläckartext</Label>
                  <Input value={form.screensaverText} onChange={(e) => update("screensaverText", e.target.value)} placeholder="Välkommen!" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Drift ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Clock className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Drift</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Öppettider</Label>
              <div className="space-y-2">
                {DAY_KEYS.map((day) => {
                  const h = form.openingHours?.[day] || defaultOpeningHours[day];
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">{DAY_LABELS[day]}</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <Checkbox checked={h.closed} onCheckedChange={(v) => updateHours(day, "closed", !!v)} />
                        <span className="text-xs text-gray-500">Stängt</span>
                      </label>
                      <Input type="time" value={h.from} onChange={(e) => updateHours(day, "from", e.target.value)} className="w-28" disabled={h.closed} />
                      <span className="text-gray-400">—</span>
                      <Input type="time" value={h.to} onChange={(e) => updateHours(day, "to", e.target.value)} className="w-28" disabled={h.closed} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Automatisk omstart-tid</Label>
              <Input type="time" value={form.autoRestartTime} onChange={(e) => update("autoRestartTime", e.target.value)} className="w-36" />
              <p className={hintClass}>Kiosken startas om automatiskt vid denna tid</p>
            </div>
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="flex items-center justify-between">
              <div><Label>Pausa beställningar</Label><p className={hintClass}>Stänger av beställningar tillfälligt</p></div>
              <Switch checked={form.ordersPaused} onCheckedChange={(v) => update("ordersPaused", v)} />
            </div>
            {form.ordersPaused && (
              <div className="space-y-2">
                <Label>Pausmeddelande</Label>
                <Textarea value={form.pauseMessage} onChange={(e) => update("pauseMessage", e.target.value)} placeholder="Vi tar en kort paus..." rows={2} />
              </div>
            )}
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Nödmeddelande</Label>
              <Textarea value={form.emergencyMessage} onChange={(e) => update("emergencyMessage", e.target.value)} placeholder="Skriv ett nödmeddelande som visas på kiosken..." rows={2} />
              <Button variant="outline" size="sm" onClick={handleSendEmergency} disabled={updateMutation.isPending || !form.emergencyMessage.trim()}>
                Skicka nödmeddelande
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Ljud & Tillgänglighet ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Volume2 className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Ljud & Tillgänglighet</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Ljudeffekter</Label><p className={hintClass}>Spela ljud vid interaktioner</p></div>
              <Switch checked={form.soundEffects} onCheckedChange={(v) => update("soundEffects", v)} />
            </div>
            {form.soundEffects && (
              <div className="space-y-2">
                <Label>Volym: {form.soundVolume}%</Label>
                <input type="range" min={0} max={100} value={form.soundVolume} onChange={(e) => update("soundVolume", Number(e.target.value))} className="w-full accent-emerald-600" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div><Label>Stor text-läge</Label><p className={hintClass}>Ökar textstorleken på kiosken</p></div>
              <Switch checked={form.largeTextMode} onCheckedChange={(v) => update("largeTextMode", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Hög kontrast</Label><p className={hintClass}>Ökad kontrast för bättre läsbarhet</p></div>
              <Switch checked={form.highContrast} onCheckedChange={(v) => update("highContrast", v)} />
            </div>
          </div>
        </section>

        {/* ─── Funktioner ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <ToggleLeft className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Funktioner</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Erbjudanden</Label><p className={hintClass}>Visa erbjudanden på kiosken</p></div>
              <Switch checked={form.offersEnabled} onCheckedChange={(v) => update("offersEnabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Kundönskningar</Label><p className={hintClass}>Tillåt kunder skicka önskemål</p></div>
              <Switch checked={form.wishesEnabled} onCheckedChange={(v) => update("wishesEnabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Kiosk låst läge</Label><p className={hintClass}>Lås kiosken i helskärm</p></div>
              <Switch checked={form.kioskLocked} onCheckedChange={(v) => update("kioskLocked", v)} />
            </div>
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="flex items-center justify-between">
              <div><Label>Dricks-funktion</Label><p className={hintClass}>Låt kunder lämna dricks</p></div>
              <Switch checked={form.tippingEnabled} onCheckedChange={(v) => update("tippingEnabled", v)} />
            </div>
            {form.tippingEnabled && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Belopp 1</Label>
                  <Input type="number" value={form.tipAmount1} onChange={(e) => update("tipAmount1", Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>Belopp 2</Label>
                  <Input type="number" value={form.tipAmount2} onChange={(e) => update("tipAmount2", Number(e.target.value))} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>Belopp 3</Label>
                  <Input type="number" value={form.tipAmount3} onChange={(e) => update("tipAmount3", Number(e.target.value))} min={0} />
                </div>
              </div>
            )}
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="flex items-center justify-between">
              <div><Label>Orderkönummer</Label><p className={hintClass}>Visa könummer efter beställning</p></div>
              <Switch checked={form.orderQueueEnabled} onCheckedChange={(v) => update("orderQueueEnabled", v)} />
            </div>
            {form.orderQueueEnabled && (
              <div className="space-y-2">
                <Label>Könummerformat</Label>
                <Input value={form.orderQueueFormat} onChange={(e) => update("orderQueueFormat", e.target.value)} placeholder="ZH-####" />
                <p className={hintClass}>Använd # för siffror, t.ex. ZH-#### ger ZH-0001</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Kvittodesign ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Printer className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Kvittodesign</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Logotyp URL</Label>
              <Input value={form.receiptLogoUrl} onChange={(e) => update("receiptLogoUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Tack-meddelande</Label>
              <Textarea value={form.receiptThankYou} onChange={(e) => update("receiptThankYou", e.target.value)} placeholder="Tack för ditt köp!" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Sidfot text</Label>
              <Textarea value={form.receiptFooter} onChange={(e) => update("receiptFooter", e.target.value)} placeholder="Valfri text längst ner på kvittot" rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.receiptShowOrderNumber} onCheckedChange={(v) => update("receiptShowOrderNumber", !!v)} />
                <span className="text-sm">Visa ordernummer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.receiptShowDateTime} onCheckedChange={(v) => update("receiptShowDateTime", !!v)} />
                <span className="text-sm">Visa datum/tid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.receiptShowVat} onCheckedChange={(v) => update("receiptShowVat", !!v)} />
                <span className="text-sm">Visa moms-uppdelning</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Teckenstorlek: {form.receiptFontSize}pt</Label>
              <input type="range" min={8} max={16} value={form.receiptFontSize} onChange={(e) => update("receiptFontSize", Number(e.target.value))} className="w-full accent-emerald-600" />
            </div>
            <div className="space-y-2">
              <Label>Pappersbredd</Label>
              <div className="flex gap-4">
                {(["58mm", "80mm"] as const).map((w) => (
                  <label key={w} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="receiptPaperWidth" value={w} checked={form.receiptPaperWidth === w} onChange={() => update("receiptPaperWidth", w)} className="accent-emerald-600" />
                    <span className="text-sm">{w}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Säkerhet ─── */}
        <section className={sectionClass}>
          <div className={sectionHeaderClass}>
            <Shield className="h-5 w-5 text-slate-500" />
            <h2 className={h2Class}>Säkerhet</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kiosklösenord</Label>
              <Input type="password" value={form.kioskPassword} onChange={(e) => update("kioskPassword", e.target.value)} placeholder="Lösenord för att avsluta kiosk-läge" />
              <p className={hintClass}>Krävs för att lämna kiosk-läget</p>
            </div>
            <div className="space-y-2">
              <Label>Sessionstimeout: {form.sessionTimeout} min</Label>
              <input type="range" min={5} max={120} step={5} value={form.sessionTimeout} onChange={(e) => update("sessionTimeout", Number(e.target.value))} className="w-full accent-emerald-600" />
              <p className={hintClass}>Återställ kiosken efter inaktivitet</p>
            </div>
          </div>
        </section>

        {/* ─── Save ─── */}
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full gap-2" size="lg">
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Sparar..." : "Spara alla inställningar"}
        </Button>
      </div>
    </div>
  );
}
