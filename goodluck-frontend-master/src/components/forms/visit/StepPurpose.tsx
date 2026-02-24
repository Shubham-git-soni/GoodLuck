"use client";

import { Plus, X, IndianRupee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import dropdownOptions from "@/lib/mock-data/dropdown-options.json";
import specimensData from "@/lib/mock-data/specimens.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

// Specimens allocated to current salesman
const availableSpecimens = specimensData.filter(
  (s) => s.allocated["SM001"] && s.allocated["SM001"] > 0
);

function halfMrp(mrp: number) {
  return Math.round(mrp * 0.5);
}

function emptyGivenRow() {
  return { specimenId: "", book: "", subject: "", class: "", mrp: 0, qty: 1, price: 0, amount: 0 };
}

function emptyReturnRow() {
  return { specimenId: "", book: "", subject: "", class: "", qty: 1, condition: "" };
}

export default function StepPurpose({ formData, updateFormData }: StepProps) {
  const purposeOptions = dropdownOptions.visitPurposes.map((p) => ({
    value: p,
    label: p,
  }));

  const purposes: string[] = formData.purposes ?? [];

  const handleChange = (selected: string[]) => {
    updateFormData({
      purposes: selected,
      ...(!selected.includes("Need Mapping") && { needMappingType: "" }),
    });
  };

  const showNeedMapping = purposes.includes("Need Mapping");
  const showGivenSpecimen = purposes.includes("Given Specimen");
  const showCollectSpecimen = purposes.includes("Collect Specimen");

  // ── Given rows
  const givenRows: any[] = formData.givenRows ?? [emptyGivenRow()];
  const returnRows: any[] = formData.returnRows ?? [emptyReturnRow()];

  const setGivenRows = (rows: any[]) => updateFormData({ givenRows: rows });
  const setReturnRows = (rows: any[]) => updateFormData({ returnRows: rows });

  const handleSpecimenSelect = (index: number, specimenId: string) => {
    const spec = availableSpecimens.find((s) => s.id === specimenId);
    const rows = [...givenRows];
    if (spec) {
      const price = halfMrp(spec.mrp);
      rows[index] = { ...rows[index], specimenId, book: spec.bookName, subject: spec.subject, class: spec.class, mrp: spec.mrp, price, qty: 1, amount: price };
    } else {
      rows[index] = emptyGivenRow();
    }
    setGivenRows(rows);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const rows = [...givenRows];
    const safeQty = Math.max(1, qty);
    rows[index] = { ...rows[index], qty: safeQty, amount: rows[index].price * safeQty };
    setGivenRows(rows);
  };

  const handleRemoveGivenRow = (index: number) => {
    const rows = givenRows.filter((_: any, i: number) => i !== index);
    setGivenRows(rows.length ? rows : [emptyGivenRow()]);
  };

  const totalSpecimenAmount = givenRows.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  // ── Return rows
  const handleReturnSpecimenSelect = (index: number, specimenId: string) => {
    const spec = availableSpecimens.find((s) => s.id === specimenId);
    const rows = [...returnRows];
    if (spec) {
      rows[index] = { ...rows[index], specimenId, book: spec.bookName, subject: spec.subject, class: spec.class, qty: 1 };
    } else {
      rows[index] = emptyReturnRow();
    }
    setReturnRows(rows);
  };

  const handleReturnQtyChange = (index: number, qty: number) => {
    const rows = [...returnRows];
    rows[index] = { ...rows[index], qty: Math.max(1, qty) };
    setReturnRows(rows);
  };

  const handleReturnConditionChange = (index: number, condition: string) => {
    const rows = [...returnRows];
    rows[index] = { ...rows[index], condition };
    setReturnRows(rows);
  };

  const handleRemoveReturnRow = (index: number) => {
    const rows = returnRows.filter((_: any, i: number) => i !== index);
    setReturnRows(rows.length ? rows : [emptyReturnRow()]);
  };

  return (
    <div className="space-y-5">

      {/* ── Purpose dropdown ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Purpose(s) of Visit
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Select one or more purposes for this visit</p>
        <MultiSelect
          options={purposeOptions}
          value={formData.purposes ?? []}
          onChange={handleChange}
          placeholder="Select visit purpose(s)…"
          searchable={false}
        />
      </div>

      {!(formData.purposes?.length > 0) && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Select at least one purpose to continue
        </p>
      )}

      {/* ── Need Mapping sub-options ── */}
      {showNeedMapping && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/40 animate-in fade-in slide-in-from-top-1 duration-200">
          <Label className="text-sm font-semibold">Need Mapping Type <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={formData.needMappingType}
            onValueChange={(value) => updateFormData({ needMappingType: value })}
            className="space-y-1"
          >
            {dropdownOptions.needMappingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={type} id={`nm-${type}`} />
                <Label htmlFor={`nm-${type}`} className="font-normal cursor-pointer text-sm">{type}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* ── Given Specimen inline section ── */}
      {showGivenSpecimen && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Given Specimen
          </p>

          <div className="space-y-3">
            {givenRows.map((row: any, index: number) => (
              <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                {/* Row header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Book {index + 1}</span>
                  {givenRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGivenRow(index)}
                      className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Book dropdown — mobile */}
                <div className="md:hidden">
                  <NativeSelect
                    value={row.specimenId}
                    onValueChange={(v) => handleSpecimenSelect(index, v)}
                    placeholder="Choose allocated specimen…"
                  >
                    {availableSpecimens.map((s) => (
                      <NativeSelectOption key={s.id} value={s.id}>
                        {s.bookName} — Cl.{s.class} ({s.subject})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                {/* Book dropdown — desktop */}
                <div className="hidden md:block">
                  <Select value={row.specimenId} onValueChange={(v) => handleSpecimenSelect(index, v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose allocated specimen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecimens.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.bookName} — Class {s.class} ({s.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Qty / Price / Amount — only after book selected */}
                {row.specimenId && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input
                        type="number" min={1} inputMode="numeric"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Price/Unit</Label>
                      <div className="flex h-10 items-center rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground">
                        ₹{row.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <div className="flex h-10 items-center rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm font-bold text-primary">
                        ₹{row.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add More */}
          <Button
            type="button"
            onClick={() => setGivenRows([...givenRows, emptyGivenRow()])}
            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-0"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Total Specimen Amount</span>
            </div>
            <span className="text-base font-bold text-primary">₹{totalSpecimenAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* ── Collect Specimen inline section ── */}
      {showCollectSpecimen && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Collect Specimen
          </p>

          <div className="space-y-3">
            {returnRows.map((row: any, index: number) => (
              <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Book {index + 1}</span>
                  {returnRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReturnRow(index)}
                      className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <div className="md:hidden">
                  <NativeSelect
                    value={row.specimenId}
                    onValueChange={(v) => handleReturnSpecimenSelect(index, v)}
                    placeholder="Choose specimen book…"
                  >
                    {availableSpecimens.map((s) => (
                      <NativeSelectOption key={s.id} value={s.id}>
                        {s.bookName} — Cl.{s.class} ({s.subject})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="hidden md:block">
                  <Select value={row.specimenId} onValueChange={(v) => handleReturnSpecimenSelect(index, v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose specimen book…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecimens.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.bookName} — Class {s.class} ({s.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {row.specimenId && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input
                        type="number" min={1} inputMode="numeric"
                        value={row.qty}
                        onChange={(e) => handleReturnQtyChange(index, parseInt(e.target.value) || 1)}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Condition</Label>
                      <div className="md:hidden">
                        <NativeSelect
                          value={row.condition}
                          onValueChange={(v) => handleReturnConditionChange(index, v)}
                          placeholder="Select condition"
                        >
                          {dropdownOptions.specimenConditions.map((c) => (
                            <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="hidden md:block">
                        <Select value={row.condition} onValueChange={(v) => handleReturnConditionChange(index, v)}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownOptions.specimenConditions.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => setReturnRows([...returnRows, emptyReturnRow()])}
            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>
        </div>
      )}
    </div>
  );
}
