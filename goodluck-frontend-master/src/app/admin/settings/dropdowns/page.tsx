"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Settings, Plus, Trash2, Pencil, Check, X,
  Search, BookOpen, User, Target, Layers,
  Car, MessageSquare, Tag, CreditCard, CheckCircle,
  AlertCircle, ClipboardCheck, Hash, ChevronRight, ArrowLeft,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataGrid } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import rawData from "@/lib/mock-data/dropdown-options.json";

const DROPDOWN_KEY = "db_dropdown_options";

function loadDropdownData(): Record<string, string[]> {
  if (typeof window === "undefined") return rawData as any;
  const stored = localStorage.getItem(DROPDOWN_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const initial = rawData as any;
  localStorage.setItem(DROPDOWN_KEY, JSON.stringify(initial));
  return initial;
}

function persistDropdownData(data: Record<string, string[]>) {
  if (typeof window !== "undefined") localStorage.setItem(DROPDOWN_KEY, JSON.stringify(data));
}

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

// ─── EditConfirmDialog ────────────────────────────────────────────────────────
function EditConfirmDialog({
  open, oldVal, newVal, onConfirm, onCancel,
}: {
  open: boolean; oldVal: string; newVal: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <Pencil className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-base font-bold leading-tight">Confirm Update?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          Change <span className="font-semibold text-foreground">&ldquo;{oldVal}&rdquo;</span> to
        </p>
        <p className="text-sm font-semibold text-foreground mb-4">&ldquo;{newVal}&rdquo;</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Yes, Update
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MobileItemsList — stable identity across re-renders ─────────────────────
type MobileItemsListProps = {
  items: string[];
  catKey: string;
  editIdx: number | null;
  editVal: string;
  editRef: React.RefObject<HTMLInputElement | null>;
  onEditVal: (v: string) => void;
  onStartEdit: (idx: number) => void;
  onRequestSaveEdit: (catKey: string) => void;
  onCancelEdit: () => void;
  onDelete: (idx: number, catKey: string) => void;
};

function MobileItemsList({
  items, catKey, editIdx, editVal, editRef,
  onEditVal, onStartEdit, onRequestSaveEdit, onCancelEdit, onDelete,
}: MobileItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Settings className="h-7 w-7 opacity-30" />
        </div>
        <p className="text-sm font-medium">No items yet</p>
        <p className="text-xs text-muted-foreground mt-1">Add your first item above</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <div
          key={`${catKey}-${idx}`}
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-card transition-all",
            editIdx === idx ? "border-primary/40 bg-primary/5" : "border-border/60"
          )}
        >
          {editIdx === idx ? (
            <>
              <Input
                ref={editRef}
                className="h-9 text-sm flex-1 rounded-xl"
                value={editVal}
                onChange={e => onEditVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") onCancelEdit(); }}
                autoFocus
              />
              <button
                onClick={() => onRequestSaveEdit(catKey)}
                className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <Check className="h-4 w-4 text-emerald-700" />
              </button>
              <button
                onClick={onCancelEdit}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{item}</span>
              <button
                onClick={() => onStartEdit(idx)}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => onDelete(idx, catKey)}
                className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DropdownManagerPage() {
  const [data, setData] = useState<Record<string, string[]>>(rawData as any);

  // Load from localStorage on mount
  useEffect(() => { setData(loadDropdownData()); }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => { persistDropdownData(data); }, [data]);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key as string);
  const [sideSearch, setSideSearch] = useState("");
  // Mobile: null = category list, string = detail view for that category
  const [mobileCat, setMobileCat] = useState<string | null>(null);

  const [newValue, setNewValue] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [editConfirm, setEditConfirm] = useState<{ catKey: string; oldVal: string; newVal: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ idx: number; name: string; catKey: string } | null>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const desktopCatConfig = CATEGORIES.find(c => c.key === activeCat) ?? CATEGORIES[0];
  const mobileCatConfig = mobileCat ? CATEGORIES.find(c => c.key === mobileCat) ?? null : null;

  const filteredSide = useMemo(() =>
    CATEGORIES.filter(c => c.label.toLowerCase().includes(sideSearch.toLowerCase())),
    [sideSearch]);

  // ── Callbacks ────────────────────────────────────────────────────────────────
  const addItem = useCallback((catKey: string, value: string) => {
    const val = value.trim();
    if (!val) { toast.error("Value cannot be empty"); return; }
    let added = false;
    let duplicate = false;
    setData(prev => {
      const existing = prev[catKey] || [];
      if (existing.some((i: string) => i.toLowerCase() === val.toLowerCase())) {
        duplicate = true; return prev;
      }
      added = true;
      return { ...prev, [catKey]: [...existing, val] };
    });
    setTimeout(() => {
      if (duplicate) toast.error("Item already exists");
      else if (added) toast.success(`"${val}" added`);
    }, 0);
  }, []);

  const startEdit = useCallback((idx: number, items: string[]) => {
    setEditIdx(idx);
    setEditVal(items[idx]);
    setTimeout(() => editRef.current?.focus(), 50);
  }, []);

  const requestSaveEdit = useCallback((catKey: string) => {
    if (editIdx === null) return;
    const val = editVal.trim();
    if (!val) { toast.error("Value cannot be empty"); return; }
    const arr = (data[catKey] || []) as string[];
    const oldVal = arr[editIdx] ?? "";
    const others = arr.filter((_, i) => i !== editIdx);
    if (others.some((i: string) => i.toLowerCase() === val.toLowerCase())) {
      toast.error("Item already exists"); return;
    }
    if (oldVal === val) { setEditIdx(null); return; }
    setEditConfirm({ catKey, oldVal, newVal: val });
  }, [editIdx, editVal, data]);

  const doSaveEdit = useCallback(() => {
    if (!editConfirm || editIdx === null) return;
    const { catKey, newVal } = editConfirm;
    setData(prev => {
      const arr = [...(prev[catKey] || [])];
      arr[editIdx] = newVal;
      return { ...prev, [catKey]: arr };
    });
    toast.success(`Updated to "${newVal}"`);
    setEditIdx(null);
    setEditConfirm(null);
  }, [editConfirm, editIdx]);

  const cancelEdit = useCallback(() => setEditIdx(null), []);

  const requestDelete = useCallback((idx: number, catKey: string) => {
    const name = (data[catKey] || [])[idx];
    setDeleteTarget({ idx, name, catKey });
  }, [data]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setData(prev => ({
      ...prev,
      [deleteTarget.catKey]: (prev[deleteTarget.catKey] || []).filter((_, i) => i !== deleteTarget.idx),
    }));
    toast.success(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const switchCat = (key: string) => {
    setActiveCat(key);
    setNewValue("");
    setEditIdx(null);
  };

  const openMobileCat = (key: string) => {
    setMobileCat(key);
    setNewValue("");
    setEditIdx(null);
  };

  const closeMobileCat = () => {
    setMobileCat(null);
    setNewValue("");
    setEditIdx(null);
  };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          MOBILE: Full-screen detail view (slide in over category list)
          ════════════════════════════════════════════════════════════════════ */}
      {mobileCat && mobileCatConfig && (() => {
        const Icon = mobileCatConfig.icon;
        const items = data[mobileCat] || [];
        return (
          <div className="md:hidden fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b shrink-0">
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={closeMobileCat}
                  className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", mobileCatConfig.bg)}>
                  <Icon className={cn("h-4 w-4", mobileCatConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold tracking-tight truncate">{mobileCatConfig.label}</h2>
                  <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Add input bar */}
              <div className="px-4 pb-3 flex gap-2">
                <Input
                  ref={addInputRef}
                  className="flex-1 h-11 rounded-xl text-sm"
                  placeholder={`Add new ${mobileCatConfig.label.toLowerCase().replace(/s$/, "")}...`}
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { addItem(mobileCat, newValue); setNewValue(""); }
                  }}
                />
                <Button
                  className="h-11 w-11 rounded-xl shrink-0 p-0"
                  onClick={() => { addItem(mobileCat, newValue); setNewValue(""); }}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
              <MobileItemsList
                items={items}
                catKey={mobileCat}
                editIdx={editIdx}
                editVal={editVal}
                editRef={editRef}
                onEditVal={setEditVal}
                onStartEdit={(idx) => startEdit(idx, items)}
                onRequestSaveEdit={requestSaveEdit}
                onCancelEdit={cancelEdit}
                onDelete={requestDelete}
              />
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════════
          MAIN PAGE
          ════════════════════════════════════════════════════════════════════ */}
      <PageContainer>

        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Dropdown Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {CATEGORIES.length} categories · manage all dropdown options
          </p>
        </div>

        {/* ── MOBILE: Category list ── */}
        <div className="md:hidden">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 h-11 rounded-xl"
              placeholder="Search categories..."
              value={sideSearch}
              onChange={e => setSideSearch(e.target.value)}
            />
          </div>

          {/* Category grid — 2 per row on larger phones, 1 on small */}
          <div className="flex flex-col gap-2">
            {filteredSide.map(cat => {
              const Icon = cat.icon;
              const count = (data[cat.key] || []).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => openMobileCat(cat.key)}
                  className="flex items-center gap-3.5 px-4 py-4 rounded-2xl border border-border/70 bg-card text-left active:scale-[0.98] transition-transform shadow-sm"
                >
                  <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0", cat.bg)}>
                    <Icon className={cn("h-5 w-5", cat.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{count} item{count !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
            {filteredSide.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No categories found
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP: sidebar + panel layout ── */}
        <div className="hidden md:flex gap-4 min-h-[600px]">

          {/* LEFT: Category Sidebar */}
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
                      isActive ? "bg-primary text-white shadow-sm" : "hover:bg-muted/60 text-slate-700"
                    )}
                  >
                    <div className={cn("p-1 rounded", isActive ? "bg-white/20" : cat.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : cat.color)} />
                    </div>
                    <span className="flex-1 truncate font-medium">{cat.label}</span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] h-4 px-1.5 shrink-0", isActive ? "bg-white/20 text-white border-0" : "")}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Items Panel */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-end gap-2">
              <Input
                className="w-80 h-10"
                placeholder={`Add new ${desktopCatConfig.label.toLowerCase().replace(/s$/, "")}...`}
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { addItem(activeCat, newValue); setNewValue(""); }
                }}
              />
              <Button className="h-10 px-6" onClick={() => { addItem(activeCat, newValue); setNewValue(""); }}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <div className="flex-1 min-h-[460px]">
              {(data[activeCat] || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white border border-dashed rounded-xl h-full">
                  <Settings className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No items yet. Add one above.</p>
                </div>
              ) : (
                <DataGrid
                  data={(data[activeCat] || []).map(item => ({ item }))}
                  columns={[{
                    key: "item",
                    header: desktopCatConfig.label,
                    sortable: true,
                    render: (val, row) => {
                      const items = data[activeCat] || [];
                      const realIdx = items.indexOf(row.item);
                      const isEditing = editIdx === realIdx;
                      if (isEditing) {
                        return (
                          <div className="flex items-center gap-2">
                            <Input
                              ref={editRef}
                              className="h-7 text-sm flex-1"
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <button onClick={() => requestSaveEdit(activeCat)} className="p-1 rounded text-emerald-600 hover:bg-emerald-50">
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
                      onClick: (row) => startEdit((data[activeCat] || []).indexOf(row.item), data[activeCat] || [])
                    },
                    {
                      label: "Delete",
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      onClick: (row) => requestDelete((data[activeCat] || []).indexOf(row.item), activeCat),
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

        {/* ── Edit Confirmation Dialog ── */}
        <EditConfirmDialog
          open={!!editConfirm}
          oldVal={editConfirm?.oldVal ?? ""}
          newVal={editConfirm?.newVal ?? ""}
          onConfirm={doSaveEdit}
          onCancel={() => setEditConfirm(null)}
        />

        {/* ── Delete Confirmation Dialog ── */}
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={open => { if (!open) setDeleteTarget(null); }}
          itemName={deleteTarget?.name ?? ""}
          contextLabel={`from ${CATEGORIES.find(c => c.key === deleteTarget?.catKey)?.label ?? ""}`}
          onConfirm={confirmDelete}
        />

      </PageContainer>
    </>
  );
}
