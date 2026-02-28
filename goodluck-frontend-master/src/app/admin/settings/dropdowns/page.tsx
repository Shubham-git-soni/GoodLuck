"use client";

import { useState, useMemo, useRef } from "react";
import {
  Settings, Plus, Trash2, Pencil, Check, X,
  Search, MapPin, BookOpen, User, Target, Layers,
  Car, MessageSquare, Tag, CreditCard, CheckCircle,
  AlertCircle, ClipboardCheck, ChevronRight, Hash
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import rawData from "@/lib/mock-data/dropdown-options.json";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "boards", label: "Boards", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  { key: "contactRoles", label: "Contact Roles", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "visitPurposes", label: "Visit Purposes", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "needMappingTypes", label: "Need Mapping Types", icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "subjects", label: "Subjects", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "travelModes", label: "Travel Modes", icon: Car, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "feedbackCategories", label: "Feedback Categories", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50" },
  { key: "discountCategories", label: "Discount Categories", icon: Tag, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "paymentStatuses", label: "Payment Statuses", icon: CreditCard, color: "text-teal-600", bg: "bg-teal-50" },
  { key: "visitStatuses", label: "Visit Statuses", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  { key: "tadaStatuses", label: "TA/DA Statuses", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
  { key: "approvalStatuses", label: "Approval Statuses", icon: ClipboardCheck, color: "text-cyan-600", bg: "bg-cyan-50" },
  { key: "specimenConditions", label: "Specimen Conditions", icon: Hash, color: "text-slate-600", bg: "bg-slate-50" },
  { key: "managerTypes", label: "Manager Types", icon: User, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "complianceStatuses", label: "Compliance Statuses", icon: CheckCircle, color: "text-lime-600", bg: "bg-lime-50" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DropdownManagerPage() {
  const [data, setData] = useState<Record<string, string[]>>(rawData as any);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key as string);
  const [sideSearch, setSideSearch] = useState("");

  // ── Item-level state ──────────────────────────────────────────────────────
  const [newValue, setNewValue] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ idx: number; name: string } | null>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const catConfig = CATEGORIES.find(c => c.key === activeCat)!;
  const allItems: string[] = data[activeCat] || [];

  const filteredSide = useMemo(() =>
    CATEGORIES.filter(c => c.label.toLowerCase().includes(sideSearch.toLowerCase())),
    [sideSearch]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const addItem = () => {
    const val = newValue.trim();
    if (!val) { toast.error("Value cannot be empty"); return; }
    if (allItems.some(i => i.toLowerCase() === val.toLowerCase())) { toast.error("Item already exists"); return; }
    setData(p => ({ ...p, [activeCat]: [...(p[activeCat] || []), val] }));
    setNewValue("");
    toast.success(`"${val}" added`);
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditVal(allItems[idx]);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const val = editVal.trim();
    if (!val) { toast.error("Value cannot be empty"); return; }
    const others = allItems.filter((_, i) => i !== editIdx);
    if (others.some(i => i.toLowerCase() === val.toLowerCase())) { toast.error("Item already exists"); return; }
    setData(p => {
      const arr = [...(p[activeCat] || [])];
      arr[editIdx] = val;
      return { ...p, [activeCat]: arr };
    });
    setEditIdx(null);
    toast.success(`Updated to "${val}"`);
  };

  const cancelEdit = () => { setEditIdx(null); };

  const deleteItem = (idx: number) => {
    const name = allItems[idx];
    setDeleteTarget({ idx, name });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setData(p => ({ ...p, [activeCat]: (p[activeCat] || []).filter((_, i) => i !== deleteTarget.idx) }));
    toast.success(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  };

  const switchCat = (key: string) => {
    setActiveCat(key);
    setNewValue("");
    setEditIdx(null);
  };

  return (
    <PageContainer>
      {/* Page title */}
      <div className="mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" /> Dropdown Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage all dropdown options used across the system — {CATEGORIES.length} categories
        </p>
      </div>

      <div className="flex gap-4 min-h-[600px]">

        {/* ── LEFT: Category Sidebar ── */}
        <div className="w-56 shrink-0 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Search categories..."
              value={sideSearch}
              onChange={e => setSideSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[560px] pr-1">
            {filteredSide.map(cat => {
              const Icon = cat.icon;
              const count = (data[cat.key] || []).length;
              const isActive = activeCat === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => switchCat(cat.key)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm w-full",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "hover:bg-muted/60 text-slate-700"
                  )}
                >
                  <div className={cn("p-1 rounded", isActive ? "bg-white/20" : cat.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : cat.color)} />
                  </div>
                  <span className="flex-1 truncate font-medium">{cat.label}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] h-4 px-1.5 shrink-0",
                      isActive ? "bg-white/20 text-white border-0" : ""
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Items Panel ── */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Add new item — inline */}
          <div className="flex justify-end gap-2">
            <Input
              className="w-80 h-10"
              placeholder={`Add new ${catConfig.label.toLowerCase().replace(/s$/, "")}...`}
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addItem()}
            />
            <Button className="h-10 px-6" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex-1 min-h-[460px]">
            {allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white border border-dashed rounded-xl h-full">
                <Settings className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No items yet. Add one above.</p>
              </div>
            ) : (
              <DataGrid
                data={allItems.map(item => ({ item }))}
                columns={[{
                  key: "item",
                  header: catConfig.label,
                  sortable: true,
                  render: (val, row) => {
                    const realIdx = allItems.indexOf(row.item);
                    const isEditing = editIdx === realIdx;
                    if (isEditing) {
                      return (
                        <div className="flex items-center gap-2">
                          <Input
                            ref={editRef}
                            className="h-7 text-sm flex-1"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                          />
                          <button onClick={saveEdit} className="p-1 rounded text-emerald-600 hover:bg-emerald-50">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-1 rounded text-muted-foreground hover:bg-muted">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    }
                    return <span className="font-medium">{val}</span>;
                  }
                }]}
                rowActions={[
                  {
                    label: "Edit",
                    icon: <Pencil className="h-3.5 w-3.5" />,
                    onClick: (row) => startEdit(allItems.indexOf(row.item))
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="h-3.5 w-3.5" />,
                    onClick: (row) => deleteItem(allItems.indexOf(row.item)),
                    danger: true
                  }
                ]}
                density="compact"
                maxHeight={500}
                inlineFilters={false}
              />
            )}
          </div>
        </div>

      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" /> Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.name}&rdquo;</span>{" "}
              from <span className="font-semibold text-foreground">{catConfig.label}</span>?{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageContainer>
  );
}
