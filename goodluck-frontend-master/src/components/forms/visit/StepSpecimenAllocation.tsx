"use client";

import { Plus, X, Package, IndianRupee } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";

import specimensData from "@/lib/mock-data/specimens.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface SpecimenRow {
  specimenId: string;
  book: string;
  subject: string;
  class: string;
  mrp: number;
  qty: number;
  price: number; // price per unit = 50% MRP
  amount: number; // qty × price
}

interface ReturnRow {
  specimenId: string;
  book: string;
  subject: string;
  class: string;
  qty: number;
  condition: string;
}

// Specimens allocated to current salesman
const availableSpecimens = specimensData.filter(
  (s) => s.allocated["SM001"] && s.allocated["SM001"] > 0
);

function halfMrp(mrp: number) {
  return Math.round(mrp * 0.5);
}

function emptyRow(): SpecimenRow {
  return { specimenId: "", book: "", subject: "", class: "", mrp: 0, qty: 1, price: 0, amount: 0 };
}

function emptyReturnRow(): ReturnRow {
  return { specimenId: "", book: "", subject: "", class: "", qty: 1, condition: "" };
}

export default function StepSpecimenAllocation({ formData, updateFormData }: StepProps) {
  const purposes: string[] = formData.purposes ?? [];
  const showSpecimenGiven = purposes.includes("Given Specimen");
  const showSpecimenReturned = purposes.includes("Collect Specimen");
  const showPayment = purposes.includes("Order Finalization");

  // ── Given rows (stored in formData)
  const givenRows: SpecimenRow[] = formData.givenRows ?? [emptyRow()];
  const returnRows: ReturnRow[] = formData.returnRows ?? [emptyReturnRow()];

  const setGivenRows = (rows: SpecimenRow[]) => updateFormData({ givenRows: rows });
  const setReturnRows = (rows: ReturnRow[]) => updateFormData({ returnRows: rows });

  // ── Specimen row handlers
  const handleSpecimenSelect = (index: number, specimenId: string) => {
    const spec = availableSpecimens.find((s) => s.id === specimenId);
    const rows = [...givenRows];
    if (spec) {
      const price = halfMrp(spec.mrp);
      rows[index] = {
        ...rows[index],
        specimenId,
        book: spec.bookName,
        subject: spec.subject,
        class: spec.class,
        mrp: spec.mrp,
        price,
        qty: 1,
        amount: price * 1,
      };
    } else {
      rows[index] = emptyRow();
    }
    setGivenRows(rows);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const rows = [...givenRows];
    const safeQty = Math.max(1, qty);
    rows[index] = { ...rows[index], qty: safeQty, amount: rows[index].price * safeQty };
    setGivenRows(rows);
  };

  const handleAddGivenRow = () => {
    setGivenRows([...givenRows, emptyRow()]);
  };

  const handleRemoveGivenRow = (index: number) => {
    const rows = givenRows.filter((_, i) => i !== index);
    setGivenRows(rows.length ? rows : [emptyRow()]);
  };

  const totalSpecimenAmount = givenRows.reduce((sum, r) => sum + (r.amount || 0), 0);

  // ── Return row handlers
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

  const handleAddReturnRow = () => {
    setReturnRows([...returnRows, emptyReturnRow()]);
  };

  const handleRemoveReturnRow = (index: number) => {
    const rows = returnRows.filter((_, i) => i !== index);
    setReturnRows(rows.length ? rows : [emptyReturnRow()]);
  };

  return (
    <div className="space-y-6">

      {/* ── Payment ── */}
      {showPayment && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Order / Payment
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Payment Received GL (₹)</Label>
              <Input
                type="number" min="0" inputMode="numeric"
                placeholder="Enter GL payment amount"
                value={formData.paymentReceivedGL || ""}
                onChange={(e) => updateFormData({ paymentReceivedGL: parseInt(e.target.value) || 0 })}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Payment Received VP (₹)</Label>
              <Input
                type="number" min="0" inputMode="numeric"
                placeholder="Enter VP payment amount"
                value={formData.paymentReceivedVP || ""}
                onChange={(e) => updateFormData({ paymentReceivedVP: parseInt(e.target.value) || 0 })}
                className="h-11"
              />
            </div>
          </div>
        </div>
      )}

      {showPayment && (showSpecimenGiven || showSpecimenReturned) && <Separator />}

      {/* ── Given Specimen ── */}
      {showSpecimenGiven && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Given Specimen
          </p>

          {/* Row list */}
          <div className="space-y-3">
            {givenRows.map((row, index) => (
              <div key={index} className="rounded-xl border border-border bg-background p-3 space-y-3">

                {/* Row header: index + remove */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Book {index + 1}
                  </span>
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

                {/* Book dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Select Book</Label>
                  {/* Mobile */}
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
                  {/* Desktop */}
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
                </div>

                {/* Qty + Price + Amount row — only shown once book is selected */}
                {row.specimenId && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Price / Unit</Label>
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

          {/* Add More button */}
          <Button
            type="button"
            onClick={handleAddGivenRow}
            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>

          {/* Total Specimen Amount */}
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Total Specimen Amount</span>
            </div>
            <span className="text-lg font-bold text-primary">
              ₹{totalSpecimenAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {showSpecimenGiven && showSpecimenReturned && <Separator />}

      {/* ── Collect Specimen (Returns) ── */}
      {showSpecimenReturned && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Collect Specimen
          </p>

          <div className="space-y-3">
            {returnRows.map((row, index) => (
              <div key={index} className="rounded-xl border border-border bg-background p-3 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Book {index + 1}
                  </span>
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

                {/* Book dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Select Book</Label>
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
            onClick={handleAddReturnRow}
            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>
        </div>
      )}

      {/* ── No relevant purposes ── */}
      {!showSpecimenGiven && !showSpecimenReturned && !showPayment && (
        <div className="text-center py-8 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20">
          <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            No specimen or payment fields required for the selected purposes.
          </p>
          <p className="text-xs text-muted-foreground mt-1">You can proceed to the next step.</p>
        </div>
      )}
    </div>
  );
}
