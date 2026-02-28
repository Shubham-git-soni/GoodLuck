"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, BookOpen, Upload, Download, Pencil, Trash2, Eye, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Book } from "@/types";
import booksData from "@/lib/mock-data/books.json";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormState = {
  title: string; class: string; mrp: string; sellingPrice: string;
  specimenPrice: string; publishedUnder: string; subject: string;
  board: string; isbn: string;
};

const EMPTY_FORM: FormState = {
  title: "", class: "", mrp: "", sellingPrice: "",
  specimenPrice: "", publishedUnder: "", subject: "", board: "CBSE", isbn: "",
};

const CLASS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const PUBLISHER_OPTIONS = ["Goodluck Publications", "Vidhyarthi Prakashan"];

// ─── Form Fields (extracted outside component — prevents keyboard close on mobile) ──
function BookFormFields({
  form, setForm, mobile = false,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  mobile?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Book Title <span className="text-destructive">*</span></Label>
        <Input
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Enter book title"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Class <span className="text-destructive">*</span></Label>
          {mobile ? (
            <NativeSelect value={form.class} onValueChange={v => setForm({ ...form, class: v })} placeholder="Select class">
              {CLASS_OPTIONS.map(c => <NativeSelectOption key={c} value={c}>Class {c}</NativeSelectOption>)}
            </NativeSelect>
          ) : (
            <Select value={form.class} onValueChange={v => setForm({ ...form, class: v })}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Subject</Label>
          <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g., Mathematics" />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Published Under <span className="text-destructive">*</span></Label>
        {mobile ? (
          <NativeSelect value={form.publishedUnder} onValueChange={v => setForm({ ...form, publishedUnder: v })} placeholder="Select publisher">
            {PUBLISHER_OPTIONS.map(p => <NativeSelectOption key={p} value={p}>{p}</NativeSelectOption>)}
          </NativeSelect>
        ) : (
          <Select value={form.publishedUnder} onValueChange={v => setForm({ ...form, publishedUnder: v })}>
            <SelectTrigger><SelectValue placeholder="Select publisher" /></SelectTrigger>
            <SelectContent>{PUBLISHER_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <Label>MRP (₹) <span className="text-destructive">*</span></Label>
          <Input type="number" min="0" placeholder="0.00" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Selling (₹) <span className="text-destructive">*</span></Label>
          <Input type="number" min="0" placeholder="0.00" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Specimen (₹) <span className="text-destructive">*</span></Label>
          <Input type="number" min="0" placeholder="0.00" value={form.specimenPrice} onChange={e => setForm({ ...form, specimenPrice: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Board</Label>
          <Input value={form.board} onChange={e => setForm({ ...form, board: e.target.value })} placeholder="e.g., CBSE" />
        </div>
        <div className="grid gap-2">
          <Label>ISBN</Label>
          <Input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="978-XX-XXXX-XXX-X" />
        </div>
      </div>
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
const BOOK_COLUMNS: GridColumn<Book>[] = [
  { key: "id", header: "ID", width: 90, sortable: true, pinned: "left" },
  { key: "title", header: "Title", width: 250, sortable: true, filterable: true },
  { key: "class", header: "Class", width: 90, sortable: true, filterable: true },
  { key: "subject", header: "Subject", width: 150, sortable: true, filterable: true, render: (v) => v || "—" },
  {
    key: "publishedUnder", header: "Publisher", width: 150, sortable: true, filterable: true,
    render: (v) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v === "Goodluck Publications"
        ? "bg-blue-100 text-blue-700"
        : "bg-purple-100 text-purple-700"
        }`}>
        {v === "Goodluck Publications" ? "GL" : "VP"}
      </span>
    ),
  },
  { key: "board", header: "Board", width: 100, sortable: true, filterable: true, render: (v) => v || "—" },
  { key: "isbn", header: "ISBN", width: 170, sortable: true, filterable: true, render: (v) => v || "—" },
  { key: "mrp", header: "MRP", width: 90, sortable: true, render: (v) => `₹${v}` },
  { key: "sellingPrice", header: "Selling", width: 90, sortable: true, render: (v) => <span className="text-green-600 font-semibold">₹{v}</span> },
  { key: "specimenPrice", header: "Specimen", width: 90, sortable: true, render: (v) => <span className="text-blue-600 font-semibold">₹{v}</span> },
  { key: "stockAvailable", header: "Stock", width: 80, sortable: true, render: (v) => v ?? 0 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>(booksData as Book[]);
  const [isMobile, setIsMobile] = useState(false);

  // mobile sheet states
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetMode, setMobileSheetMode] = useState<"add" | "edit">("add");
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // desktop dialog states
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [desktopViewBook, setDesktopViewBook] = useState<Book | null>(null);
  const [desktopEditBook, setDesktopEditBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const resetForm = () => setForm(EMPTY_FORM);

  // ── Open add/edit sheet or dialog depending on viewport ─────────────────────
  const openAdd = () => {
    resetForm();
    if (window.innerWidth < 768) { setMobileSheetMode("add"); setIsMobileSheetOpen(true); }
    else setIsAddBookOpen(true);
  };

  const openEdit = (book: Book) => {
    const f: FormState = {
      title: book.title, class: book.class, mrp: String(book.mrp),
      sellingPrice: String(book.sellingPrice), specimenPrice: String(book.specimenPrice),
      publishedUnder: book.publishedUnder, subject: book.subject ?? "",
      board: book.board ?? "CBSE", isbn: book.isbn ?? "",
    };
    if (window.innerWidth < 768) {
      setForm(f); setEditingBookId(book.id);
      setMobileSheetMode("edit"); setIsMobileSheetOpen(true);
    } else {
      setDesktopEditBook(book);
    }
  };

  const openView = (book: Book) => {
    if (window.innerWidth < 768) setViewBook(book);
    else setDesktopViewBook(book);
  };

  // ── Submit handlers ──────────────────────────────────────────────────────────
  const validateForm = (f: FormState) => {
    if (!f.title || !f.class || !f.mrp || !f.sellingPrice || !f.specimenPrice || !f.publishedUnder) {
      toast.error("Please fill all required fields"); return false;
    }
    const mrp = parseFloat(f.mrp), sp = parseFloat(f.sellingPrice), spc = parseFloat(f.specimenPrice);
    if (sp > mrp) { toast.error("Selling price cannot exceed MRP"); return false; }
    if (spc > sp) { toast.error("Specimen price cannot exceed selling price"); return false; }
    return true;
  };

  const handleMobileSubmit = () => {
    if (!validateForm(form)) return;
    if (mobileSheetMode === "add") {
      const newBook: Book = {
        id: `BK${String(books.length + 1).padStart(3, "0")}`,
        title: form.title, class: form.class,
        mrp: parseFloat(form.mrp), sellingPrice: parseFloat(form.sellingPrice),
        specimenPrice: parseFloat(form.specimenPrice),
        publishedUnder: form.publishedUnder as Book["publishedUnder"],
        subject: form.subject || undefined, board: form.board || undefined,
        isbn: form.isbn || undefined, stockAvailable: 0,
        createdDate: new Date().toISOString().split("T")[0],
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setBooks(prev => [newBook, ...prev]);
      toast.success("Book added successfully!");
    } else if (editingBookId) {
      setBooks(prev => prev.map(b => b.id === editingBookId ? {
        ...b, title: form.title, class: form.class,
        mrp: parseFloat(form.mrp), sellingPrice: parseFloat(form.sellingPrice),
        specimenPrice: parseFloat(form.specimenPrice),
        publishedUnder: form.publishedUnder as Book["publishedUnder"],
        subject: form.subject || undefined, board: form.board || undefined,
        isbn: form.isbn || undefined,
        lastUpdated: new Date().toISOString().split("T")[0],
      } : b));
      toast.success("Book updated successfully!");
    }
    setIsMobileSheetOpen(false);
    resetForm();
    setEditingBookId(null);
  };

  const handleDesktopAdd = () => {
    if (!validateForm(form)) return;
    const newBook: Book = {
      id: `BK${String(books.length + 1).padStart(3, "0")}`,
      title: form.title, class: form.class,
      mrp: parseFloat(form.mrp), sellingPrice: parseFloat(form.sellingPrice),
      specimenPrice: parseFloat(form.specimenPrice),
      publishedUnder: form.publishedUnder as Book["publishedUnder"],
      subject: form.subject || undefined, board: form.board || undefined,
      isbn: form.isbn || undefined, stockAvailable: 0,
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setBooks(prev => [...prev, newBook]);
    toast.success("Book added successfully!");
    resetForm();
    setIsAddBookOpen(false);
  };

  const handleDesktopSaveEdit = () => {
    if (!desktopEditBook) return;
    setBooks(prev => prev.map(b => b.id === desktopEditBook.id ? desktopEditBook : b));
    toast.success(`"${desktopEditBook.title}" updated`);
    setDesktopEditBook(null);
  };

  const handleDeleteBook = (book: Book) => setDeleteTarget(book);

  const confirmDeleteBook = () => {
    if (!deleteTarget) return;
    setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  };

  // ── Import ───────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (ok.includes(file.type) || file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) {
      setImportFile(file);
    } else { toast.error("Please upload a CSV or Excel file"); e.target.value = ""; }
  };

  const handleImportBooks = () => {
    if (!importFile) { toast.error("Please select a file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = (ev.target?.result as string).split("\n").slice(1);
        const imported: Book[] = []; let errs = 0;
        rows.forEach((row) => {
          if (!row.trim()) return;
          const c = row.split(",");
          if (c.length < 6) { errs++; return; }
          try {
            const b: Book = {
              id: `BK${String(books.length + imported.length + 1).padStart(3, "0")}`,
              title: c[0]?.trim() || "", class: c[1]?.trim() || "",
              mrp: parseFloat(c[2]?.trim() || "0"), sellingPrice: parseFloat(c[3]?.trim() || "0"),
              specimenPrice: parseFloat(c[4]?.trim() || "0"),
              publishedUnder: (c[5]?.trim() || "Goodluck Publications") as Book["publishedUnder"],
              subject: c[6]?.trim() || undefined, board: c[7]?.trim() || "CBSE",
              isbn: c[8]?.trim() || undefined, stockAvailable: parseInt(c[9]?.trim() || "0"),
              createdDate: new Date().toISOString().split("T")[0], lastUpdated: new Date().toISOString().split("T")[0],
            };
            if (b.title && b.class && b.mrp > 0) imported.push(b); else errs++;
          } catch { errs++; }
        });
        if (imported.length > 0) {
          setBooks(prev => [...prev, ...imported]);
          toast.success(`Imported ${imported.length} books${errs > 0 ? `. ${errs} rows had errors.` : ""}`);
          setIsImportOpen(false); setImportFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else { toast.error("No valid books found in the file"); }
      } catch { toast.error("Error parsing file. Please check the format."); }
    };
    reader.readAsText(importFile);
  };

  const downloadTemplate = () => {
    const csv = "Title,Class,MRP,Selling Price,Specimen Price,Published Under,Subject,Board,ISBN,Stock Available\nSample Book,10,500,450,225,Goodluck Publications,Mathematics,CBSE,978-93-5678-XXX-X,100";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "books_template.csv" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  // ── Row actions ──────────────────────────────────────────────────────────────
  const rowActions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: openView },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: openEdit },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: handleDeleteBook, danger: true },
  ];

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <PageContainer>

      {/* ── Mobile View Bottom Sheet ── */}
      {isMobile && viewBook && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setViewBook(null)} />
          <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
            <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Book Details
              </h2>
              <button onClick={() => setViewBook(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {/* Identity card */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-2xl">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-base leading-tight line-clamp-2">{viewBook.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">Class {viewBook.class}</Badge>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${viewBook.publishedUnder === "Goodluck Publications" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {viewBook.publishedUnder === "Goodluck Publications" ? "GL" : "VP"}
                    </span>
                    {viewBook.subject && <span className="text-xs text-muted-foreground">{viewBook.subject}</span>}
                  </div>
                </div>
              </div>
              {/* Info rows */}
              <div className="divide-y divide-border/50">
                {[
                  { label: "Book ID", value: viewBook.id },
                  { label: "Board", value: viewBook.board || "—" },
                  { label: "ISBN", value: viewBook.isbn || "—" },
                  { label: "MRP", value: `₹ ${viewBook.mrp}` },
                  { label: "Selling Price", value: `₹ ${viewBook.sellingPrice}` },
                  { label: "Specimen Price", value: `₹ ${viewBook.specimenPrice}` },
                  { label: "Stock Available", value: String(viewBook.stockAvailable ?? 0) },
                  { label: "Publisher", value: viewBook.publishedUnder },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between py-3 gap-2">
                    <p className="text-xs text-muted-foreground font-medium shrink-0">{label}</p>
                    <p className="text-sm font-semibold text-right break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 px-5 pb-6 pt-3 border-t flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => { setViewBook(null); openEdit(viewBook); }}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setViewBook(null)}>
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
                  {mobileSheetMode === "add" ? "Add New Book" : "Edit Book"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Fill in all details below</p>
              </div>
              <button onClick={() => { setIsMobileSheetOpen(false); resetForm(); }} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" as any }} className="px-5 pb-4">
              <BookFormFields form={form} setForm={setForm} mobile />
            </div>
            <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0">
              <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleMobileSubmit}>
                {mobileSheetMode === "edit" ? "Save Changes" : "Add Book"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Add Book Dialog ── */}
      <Dialog open={isAddBookOpen} onOpenChange={(o) => { setIsAddBookOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>Add a new book to the catalog</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <BookFormFields form={form} setForm={setForm} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setIsAddBookOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleDesktopAdd}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Desktop View Dialog ── */}
      <Dialog open={!!desktopViewBook} onOpenChange={(o) => !o && setDesktopViewBook(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Book Details
            </DialogTitle>
          </DialogHeader>
          {desktopViewBook && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>ID</Label><Input readOnly value={desktopViewBook.id} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>Stock</Label><Input readOnly value={desktopViewBook.stockAvailable ?? 0} className="bg-muted/50" /></div>
              </div>
              <div className="space-y-2"><Label>Title</Label><Input readOnly value={desktopViewBook.title} className="bg-muted/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Class</Label><Input readOnly value={desktopViewBook.class} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>Subject</Label><Input readOnly value={desktopViewBook.subject ?? ""} className="bg-muted/50" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>MRP (₹)</Label>      <Input readOnly value={desktopViewBook.mrp} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>Selling (₹)</Label>  <Input readOnly value={desktopViewBook.sellingPrice} className="text-green-600 font-medium bg-muted/50" /></div>
                <div className="space-y-2"><Label>Specimen (₹)</Label> <Input readOnly value={desktopViewBook.specimenPrice} className="text-blue-600 font-medium bg-muted/50" /></div>
              </div>
              <div className="space-y-2"><Label>Publisher</Label><Input readOnly value={desktopViewBook.publishedUnder} className="bg-muted/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Board</Label><Input readOnly value={desktopViewBook.board ?? ""} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>ISBN</Label> <Input readOnly value={desktopViewBook.isbn ?? ""} className="bg-muted/50" /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDesktopViewBook(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Desktop Edit Dialog ── */}
      <Dialog open={!!desktopEditBook} onOpenChange={(o) => !o && setDesktopEditBook(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details below</DialogDescription>
          </DialogHeader>
          {desktopEditBook && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={desktopEditBook.title} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, title: e.target.value } : prev)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={desktopEditBook.class} onValueChange={v => setDesktopEditBook(prev => prev ? { ...prev, class: v } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASS_OPTIONS.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={desktopEditBook.subject ?? ""} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, subject: e.target.value } : prev)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>MRP (₹)</Label>      <Input type="number" value={desktopEditBook.mrp} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, mrp: parseFloat(e.target.value) || 0 } : prev)} /></div>
                <div className="space-y-2"><Label>Selling (₹)</Label>  <Input type="number" value={desktopEditBook.sellingPrice} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, sellingPrice: parseFloat(e.target.value) || 0 } : prev)} /></div>
                <div className="space-y-2"><Label>Specimen (₹)</Label> <Input type="number" value={desktopEditBook.specimenPrice} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, specimenPrice: parseFloat(e.target.value) || 0 } : prev)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Publisher *</Label>
                <Select value={desktopEditBook.publishedUnder} onValueChange={v => setDesktopEditBook(prev => prev ? { ...prev, publishedUnder: v as Book["publishedUnder"] } : prev)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PUBLISHER_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Board</Label><Input value={desktopEditBook.board ?? ""} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, board: e.target.value } : prev)} /></div>
                <div className="space-y-2"><Label>ISBN</Label> <Input value={desktopEditBook.isbn ?? ""} onChange={e => setDesktopEditBook(prev => prev ? { ...prev, isbn: e.target.value } : prev)} /></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDesktopEditBook(null)}>Cancel</Button>
            <Button onClick={handleDesktopSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Import Dialog (desktop only — Import is not on mobile header) ── */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Books</DialogTitle>
            <DialogDescription>Upload a CSV or Excel file to import multiple books at once</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm font-medium">File Format Requirements:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>CSV or Excel (.xlsx) file</li>
                    <li>Headers: Title, Class, MRP, Selling Price, Specimen Price, Published Under, Subject, Board, ISBN, Stock</li>
                    <li>Published Under: "Goodluck Publications" or "Vidhyarthi Prakashan"</li>
                  </ul>
                  <Button variant="link" size="sm" onClick={downloadTemplate} className="p-0 h-auto text-xs">
                    <Download className="h-3 w-3 mr-1" /> Download Template
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input id="import-file" ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
              {importFile && <p className="text-sm text-muted-foreground">Selected: {importFile.name}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsImportOpen(false); setImportFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>Cancel</Button>
            <Button onClick={handleImportBooks} disabled={!importFile}>Import Books</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between mb-5 flex-wrap gap-3">
        <PageHeader title="Books Management" description={`${books.length} books in catalog`} />
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1.5" /> Import
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Book
          </Button>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Books Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{books.length} books in catalog</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-9 px-3" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-1.5" /> Import
            </Button>
            <Button size="sm" className="h-9 px-3" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" /> Add
            </Button>
          </div>
        </div>
      </div>

      {/* ── DataGrid ── */}
      <DataGrid
        data={books}
        columns={BOOK_COLUMNS}
        rowKey="id"
        defaultPageSize={15}
        selectable
        enableRowPinning
        enableColumnPinning
        inlineFilters
        striped
        density="compact"
        rowActions={rowActions}
        className="border shadow-sm rounded-xl overflow-hidden"
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        itemName={deleteTarget?.title ?? ""}
        contextLabel="from books catalog"
        onConfirm={confirmDeleteBook}
      />
    </PageContainer>
  );
}
