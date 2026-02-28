"use client";

import { useEffect, useState } from "react";
import { Plus, X, Trash2, Eye, Pencil, MapPin, Store } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import { BookSeller } from "@/types";
import { toast } from "sonner";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

import bookSellersData from "@/lib/mock-data/book-sellers.json";
import { ALL_STATES, getCitiesForState } from "@/lib/state-city-map";

// ── Extracted outside component so identity is stable across re-renders ──────
type FormState = {
  shopName: string; ownerName: string; state: string; city: string;
  address: string; phone: string; email: string; gstNumber: string; creditLimit: string;
};

function FormFields({
  form, setForm, modalMode, mobile = false,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  modalMode: "add" | "edit" | "view";
  mobile?: boolean;
}) {
  const cities = form.state ? getCitiesForState(form.state) : [];
  const isView = modalMode === "view";
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Shop Name <span className="text-destructive">*</span></Label>
          <Input
            readOnly={isView}
            value={form.shopName}
            onChange={e => setForm({ ...form, shopName: e.target.value })}
            placeholder="Enter shop name"
            className={isView ? "bg-muted/50 pointer-events-none" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>Owner Name <span className="text-destructive">*</span></Label>
          <Input
            readOnly={isView}
            value={form.ownerName}
            onChange={e => setForm({ ...form, ownerName: e.target.value })}
            placeholder="Enter owner name"
            className={isView ? "bg-muted/50 pointer-events-none" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>State <span className="text-destructive">*</span></Label>
          {mobile ? (
            <NativeSelect
              disabled={isView}
              value={form.state}
              onValueChange={v => setForm({ ...form, state: v, city: "" })}
              placeholder="Select state"
            >
              {ALL_STATES.map(s => <NativeSelectOption key={s} value={s}>{s}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select disabled={isView} value={form.state} onValueChange={v => setForm({ ...form, state: v, city: "" })}>
              <SelectTrigger className={isView ? "bg-muted/50" : ""}><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{ALL_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label>City <span className="text-destructive">*</span></Label>
          {mobile ? (
            <NativeSelect
              disabled={isView || !form.state}
              value={form.city}
              onValueChange={v => setForm({ ...form, city: v })}
              placeholder={form.state ? "Select city" : "Select state first"}
            >
              {cities.map(c => <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select disabled={isView || !form.state} value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
              <SelectTrigger className={isView ? "bg-muted/50" : ""}><SelectValue placeholder={form.state ? "Select city" : "Select state first"} /></SelectTrigger>
              <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea
          readOnly={isView}
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          placeholder="Enter complete address"
          rows={2}
          className={isView ? "bg-muted/50 pointer-events-none" : ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Contact Number</Label>
          <Input
            readOnly={isView}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
            placeholder="10-digit number"
            className={isView ? "bg-muted/50 pointer-events-none" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            readOnly={isView}
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email"
            className={isView ? "bg-muted/50 pointer-events-none" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>GST Number</Label>
          <Input
            readOnly={isView}
            value={form.gstNumber}
            onChange={e => setForm({ ...form, gstNumber: e.target.value })}
            placeholder="Enter GST number"
            className={isView ? "bg-muted/50 pointer-events-none" : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>Credit Limit</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₹</span>
            <Input
              readOnly={isView}
              type="number"
              value={form.creditLimit}
              onChange={e => setForm({ ...form, creditLimit: e.target.value })}
              placeholder="Enter amount"
              className={`pl-7 ${isView ? "bg-muted/50 pointer-events-none" : ""}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminBookSellerListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookSellers, setBookSellers] = useState<BookSeller[]>([]);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [viewSeller, setViewSeller] = useState<BookSeller | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BookSeller | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [form, setForm] = useState<FormState>({
    shopName: "", ownerName: "", state: "", city: "",
    address: "", phone: "", email: "", gstNumber: "", creditLimit: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setBookSellers(bookSellersData as BookSeller[]);
      setIsLoading(false);
    }, 800);
  }, []);

  const resetForm = () => setForm({ shopName: "", ownerName: "", state: "", city: "", address: "", phone: "", email: "", gstNumber: "", creditLimit: "" });

  const openModal = (mode: "add" | "edit" | "view", seller?: BookSeller) => {
    setModalMode(mode);
    setSelectedSellerId(seller?.id || null);
    if (seller) {
      setForm({
        shopName: seller.shopName,
        ownerName: seller.ownerName,
        state: (seller as any).state || "",
        city: seller.city,
        address: seller.address,
        phone: seller.phone,
        email: seller.email,
        gstNumber: seller.gstNumber,
        creditLimit: seller.creditLimit.toString(),
      });
    } else {
      resetForm();
    }
    if (window.innerWidth < 768) setIsMobileSheetOpen(true);
    else setIsDesktopDialogOpen(true);
  };

  const handleSubmit = () => {
    if (modalMode === "view") { setIsMobileSheetOpen(false); setIsDesktopDialogOpen(false); return; }
    if (!form.shopName || !form.ownerName || !form.city) {
      toast.error("Please fill all required fields");
      return;
    }
    if (modalMode === "add") {
      const newEntry: BookSeller = {
        id: `BS${String(bookSellers.length + 1).padStart(3, "0")}`,
        shopName: form.shopName,
        ownerName: form.ownerName,
        city: form.city,
        state: form.state,
        address: form.address,
        phone: form.phone,
        email: form.email,
        gstNumber: form.gstNumber,
        creditLimit: parseFloat(form.creditLimit) || 0,
        currentOutstanding: 0,
        lastVisitDate: new Date().toISOString().split("T")[0],
      } as any;
      setBookSellers(prev => [newEntry, ...prev]);
      toast.success(`Book seller "${form.shopName}" added successfully!`);
    } else if (modalMode === "edit" && selectedSellerId) {
      setBookSellers(prev => prev.map(s => s.id === selectedSellerId ? {
        ...s,
        shopName: form.shopName,
        ownerName: form.ownerName,
        state: form.state,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        gstNumber: form.gstNumber,
        creditLimit: parseFloat(form.creditLimit) || s.creditLimit,
      } : s));
      toast.success(`"${form.shopName}" updated successfully!`);
    }
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    resetForm();
  };

  const handleDelete = (seller: BookSeller) => setDeleteTarget(seller);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setBookSellers(prev => prev.filter(s => s.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.shopName}" deleted`);
    setDeleteTarget(null);
  };

  const BOOKSELLER_COLUMNS: GridColumn<BookSeller>[] = [
    { key: "shopName", header: "Shop Name", pinned: "left", width: 220, sortable: true, filterable: true, render: (v) => <span className="font-semibold text-sm text-primary">{v}</span> },
    { key: "ownerName", header: "Owner", width: 160, sortable: true, filterable: true },
    { key: "city", header: "City", width: 120, sortable: true, filterable: true, render: (v) => <Badge variant="secondary" className="text-[10px]">{v}</Badge> },
    { key: "state", header: "State", width: 130, sortable: true, filterable: true, render: (v) => <span className="text-xs">{v || "—"}</span> },
    { key: "phone", header: "Contact", width: 130, render: (v) => <span className="text-xs">{v || "N/A"}</span> },
    { key: "email", header: "Email", width: 180, render: (v) => <span className="text-xs text-muted-foreground truncate block w-full" title={v}>{v || "N/A"}</span> },
    {
      key: "currentOutstanding", header: "Outstanding", width: 130, align: "right", sortable: true,
      render: (v, row) => (
        <Badge variant={v > row.creditLimit * 0.8 ? "destructive" : v > row.creditLimit * 0.5 ? "secondary" : "outline"} className="text-[10px]">
          ₹{(v / 1000).toFixed(1)}K
        </Badge>
      )
    },
    {
      key: "creditLimit", header: "Credit Limit", width: 120, align: "right", sortable: true,
      render: (v) => <span className="text-xs font-medium">₹{(v / 100000).toFixed(1)}L</span>
    },
    {
      key: "lastVisitDate", header: "Last Visit", width: 110, sortable: true,
      render: (v) => <span className="text-xs text-muted-foreground">{v ? new Date(v).toLocaleDateString() : "Never"}</span>
    },
  ];

  const rowActions: RowAction<BookSeller>[] = [
    {
      label: "View", icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (s) => {
        if (window.innerWidth < 768) setViewSeller(s);
        else openModal("view", s);
      }
    },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (s) => openModal("edit", s) },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: handleDelete, danger: true },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="All Book Sellers" description="Manage all book seller relationships" />
        <div className="space-y-3">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* ── Mobile View Bottom Sheet ── */}
      {isMobile && viewSeller && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewSeller(null)} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Store className="h-4 w-4" /> Book Seller Details
              </h2>
              <button onClick={() => setViewSeller(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-2xl">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {viewSeller.shopName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-base leading-tight">{viewSeller.shopName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{viewSeller.ownerName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{viewSeller.city}{(viewSeller as any).state ? `, ${(viewSeller as any).state}` : ""}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-0 divide-y divide-border/50">
                {[
                  { label: "Seller ID", value: viewSeller.id },
                  { label: "Contact", value: viewSeller.phone || "—" },
                  { label: "Email", value: viewSeller.email || "—" },
                  { label: "GST No.", value: viewSeller.gstNumber || "—" },
                  { label: "Credit Limit", value: viewSeller.creditLimit ? `₹ ${viewSeller.creditLimit.toLocaleString()}` : "—" },
                  { label: "Outstanding", value: viewSeller.currentOutstanding ? `₹ ${viewSeller.currentOutstanding.toLocaleString()}` : "₹ 0" },
                  { label: "Last Visit", value: viewSeller.lastVisitDate ? new Date(viewSeller.lastVisitDate).toLocaleDateString() : "Never" },
                  { label: "Address", value: viewSeller.address || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between py-3 gap-2">
                    <p className="text-xs text-muted-foreground font-medium shrink-0">{label}</p>
                    <p className="text-sm font-semibold text-right break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 px-5 pb-6 pt-3 border-t flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => { setViewSeller(null); openModal("edit", viewSeller); }}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setViewSeller(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Add/Edit Bottom Sheet ── */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setIsMobileSheetOpen(false); resetForm(); }} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  {modalMode === "add" ? "Add Book Seller" : modalMode === "edit" ? "Edit Book Seller" : "Book Seller Details"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modalMode === "view" ? "Book seller record details." : "Fill in all details below"}
                </p>
              </div>
              <button onClick={() => { setIsMobileSheetOpen(false); resetForm(); }} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" as any }} className="px-5 pb-4">
              <FormFields form={form} setForm={setForm} modalMode={modalMode} mobile />
            </div>
            <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0">
              <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleSubmit}>
                {modalMode === "view" ? "Close" : modalMode === "edit" ? "Save Changes" : "Add Book Seller"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Dialog ── */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={(o) => { setIsDesktopDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Add New Book Seller" : modalMode === "edit" ? "Edit Book Seller" : "Book Seller Details"}</DialogTitle>
            <DialogDescription>
              {modalMode === "view" ? "Review the bookseller information below." : "Fill in the book seller details."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FormFields form={form} setForm={setForm} modalMode={modalMode} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDesktopDialogOpen(false); resetForm(); }}>
              {modalMode === "view" ? "Close" : "Cancel"}
            </Button>
            {modalMode !== "view" && (
              <Button onClick={handleSubmit}>
                {modalMode === "edit" ? "Save Changes" : "Add Book Seller"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Desktop Header ── */}
      <div className="hidden md:block mb-6">
        <PageHeader
          title="All Book Sellers"
          description={`${bookSellers.length} total book sellers`}
          action={
            <Button size="sm" onClick={() => openModal("add")}>
              <Plus className="h-4 w-4 mr-2" />Add Book Seller
            </Button>
          }
        />
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">All Book Sellers</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{bookSellers.length} total book sellers</p>
          </div>
          <Button size="sm" className="h-9 px-3" onClick={() => openModal("add")}>
            <Plus className="h-4 w-4 mr-1.5" />Add
          </Button>
        </div>
      </div>

      {/* ── DataGrid (both mobile + desktop) ── */}
      <DataGrid
        data={bookSellers}
        columns={BOOKSELLER_COLUMNS}
        rowKey="id"
        rowActions={rowActions}
        density="compact"
        selectable
        inlineFilters
        striped
        enableRowPinning
        defaultPageSize={15}
        className="border shadow-sm rounded-xl overflow-hidden"
        emptyMessage="No book sellers found"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        itemName={deleteTarget?.shopName ?? ""}
        contextLabel="from book sellers"
        onConfirm={confirmDelete}
      />
    </PageContainer>
  );
}
