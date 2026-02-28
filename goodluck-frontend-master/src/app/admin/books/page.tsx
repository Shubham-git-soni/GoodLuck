"use client";

import { useState, useRef } from "react";
import { Plus, BookOpen, Upload, Download, Pencil, Trash2, Eye } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Book } from "@/types";
import booksData from "@/lib/mock-data/books.json";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";

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
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        }`}>
        {v === "Goodluck Publications" ? "GL" : "VP"}
      </span>
    ),
  },
  { key: "board", header: "Board", width: 100, sortable: true, filterable: true, render: (v) => v || "—" },
  { key: "isbn", header: "ISBN", width: 170, sortable: true, filterable: true, render: (v) => v || "—" },
  { key: "mrp", header: "MRP", width: 90, sortable: true, render: (v) => `₹${v}` },
  {
    key: "sellingPrice", header: "Selling", width: 90, sortable: true,
    render: (v) => <span className="text-green-600 font-semibold">₹{v}</span>
  },
  {
    key: "specimenPrice", header: "Specimen", width: 90, sortable: true,
    render: (v) => <span className="text-blue-600 font-semibold">₹{v}</span>
  },
  { key: "stockAvailable", header: "Stock", width: 80, sortable: true, render: (v) => v ?? 0 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>(booksData as Book[]);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewBook, setViewBook] = useState<Book | null>(null);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "", class: "", mrp: "", sellingPrice: "", specimenPrice: "",
    publishedUnder: "", subject: "", board: "CBSE", isbn: "",
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDeleteBook = (book: Book) => {
    setBooks((prev) => prev.filter((b) => b.id !== book.id));
    toast.success(`"${book.title}" deleted`);
  };

  const handleAddBook = () => {
    if (!formData.title || !formData.class || !formData.mrp || !formData.sellingPrice || !formData.specimenPrice || !formData.publishedUnder) {
      toast.error("Please fill all required fields"); return;
    }
    const mrp = parseFloat(formData.mrp);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const specimenPrice = parseFloat(formData.specimenPrice);
    if (sellingPrice > mrp) { toast.error("Selling price cannot exceed MRP"); return; }
    if (specimenPrice > sellingPrice) { toast.error("Specimen price cannot exceed selling price"); return; }

    const newBook: Book = {
      id: `BK${String(books.length + 1).padStart(3, "0")}`,
      title: formData.title, class: formData.class, mrp, sellingPrice, specimenPrice,
      publishedUnder: formData.publishedUnder as "Goodluck Publications" | "Vidhyarthi Prakashan",
      subject: formData.subject || undefined, board: formData.board || undefined,
      isbn: formData.isbn || undefined, stockAvailable: 0,
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setBooks((prev) => [...prev, newBook]);
    toast.success("Book added successfully!");
    setFormData({ title: "", class: "", mrp: "", sellingPrice: "", specimenPrice: "", publishedUnder: "", subject: "", board: "CBSE", isbn: "" });
    setIsAddBookOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editBook) return;
    setBooks((prev) => prev.map((b) => b.id === editBook.id ? editBook : b));
    toast.success(`"${editBook.title}" updated`);
    setEditBook(null);
  };

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
              publishedUnder: (c[5]?.trim() || "Goodluck Publications") as "Goodluck Publications" | "Vidhyarthi Prakashan",
              subject: c[6]?.trim() || undefined, board: c[7]?.trim() || "CBSE",
              isbn: c[8]?.trim() || undefined, stockAvailable: parseInt(c[9]?.trim() || "0"),
              createdDate: new Date().toISOString().split("T")[0], lastUpdated: new Date().toISOString().split("T")[0],
            };
            if (b.title && b.class && b.mrp > 0) imported.push(b); else errs++;
          } catch { errs++; }
        });
        if (imported.length > 0) {
          setBooks((prev) => [...prev, ...imported]);
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

  // ── Row actions (shown as inline icon buttons on row hover) ──────────────────
  const rowActions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (b: Book) => setViewBook(b) },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (b: Book) => setEditBook(b) },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: handleDeleteBook, danger: true },
  ];

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <PageContainer>

      {/* ── Page Header with action buttons on the right ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <PageHeader title="Books Management" description={`${books.length} books in catalog`} />

        <div className="flex items-center gap-2 shrink-0">
          {/* Import */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-1.5" /> Import
              </Button>
            </DialogTrigger>
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

          {/* Add Book */}
          <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1.5" /> Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>Add a new book to the catalog</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-title">Book Title *</Label>
                  <Input id="add-title" placeholder="Enter book title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                          <SelectItem key={c} value={c}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="e.g., Mathematics" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>MRP (₹) *</Label>      <Input type="number" min="0" step="0.01" placeholder="0.00" value={formData.mrp} onChange={(e) => setFormData({ ...formData, mrp: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Selling (₹) *</Label>  <Input type="number" min="0" step="0.01" placeholder="0.00" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Specimen (₹) *</Label> <Input type="number" min="0" step="0.01" placeholder="0.00" value={formData.specimenPrice} onChange={(e) => setFormData({ ...formData, specimenPrice: e.target.value })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Published Under *</Label>
                  <Select value={formData.publishedUnder} onValueChange={(v) => setFormData({ ...formData, publishedUnder: v })}>
                    <SelectTrigger><SelectValue placeholder="Select publisher" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goodluck Publications">Goodluck Publications</SelectItem>
                      <SelectItem value="Vidhyarthi Prakashan">Vidhyarthi Prakashan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Board</Label><Input placeholder="e.g., CBSE, ICSE" value={formData.board} onChange={(e) => setFormData({ ...formData, board: e.target.value })} /></div>
                  <div className="space-y-2"><Label>ISBN</Label> <Input placeholder="978-XX-XXXX-XXX-X" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsAddBookOpen(false)}>Cancel</Button>
                <Button onClick={handleAddBook}>Add Book</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewBook} onOpenChange={(o) => !o && setViewBook(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Book Details
            </DialogTitle>
          </DialogHeader>
          {viewBook && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input readOnly value={viewBook.id} className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input readOnly value={viewBook.stockAvailable ?? 0} className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input readOnly value={viewBook.title} className="bg-muted/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Input readOnly value={viewBook.class} className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input readOnly value={viewBook.subject ?? ""} className="bg-muted/50" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>MRP (₹)</Label>      <Input readOnly value={viewBook.mrp} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>Selling (₹)</Label>  <Input readOnly value={viewBook.sellingPrice} className="text-green-600 font-medium bg-muted/50" /></div>
                <div className="space-y-2"><Label>Specimen (₹)</Label> <Input readOnly value={viewBook.specimenPrice} className="text-blue-600 font-medium bg-muted/50" /></div>
              </div>
              <div className="space-y-2">
                <Label>Publisher</Label>
                <Input readOnly value={viewBook.publishedUnder} className="bg-muted/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Board</Label><Input readOnly value={viewBook.board ?? ""} className="bg-muted/50" /></div>
                <div className="space-y-2"><Label>ISBN</Label> <Input readOnly value={viewBook.isbn ?? ""} className="bg-muted/50" /></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewBook(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editBook} onOpenChange={(o) => !o && setEditBook(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details below</DialogDescription>
          </DialogHeader>
          {editBook && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={editBook.title} onChange={(e) => setEditBook((prev) => prev ? { ...prev, title: e.target.value } : prev)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={editBook.class} onValueChange={(v) => setEditBook((prev) => prev ? { ...prev, class: v } : prev)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => (
                        <SelectItem key={c} value={c}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={editBook.subject ?? ""} onChange={(e) => setEditBook((prev) => prev ? { ...prev, subject: e.target.value } : prev)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>MRP (₹)</Label>      <Input type="number" value={editBook.mrp} onChange={(e) => setEditBook((prev) => prev ? { ...prev, mrp: parseFloat(e.target.value) || 0 } : prev)} /></div>
                <div className="space-y-2"><Label>Selling (₹)</Label>  <Input type="number" value={editBook.sellingPrice} onChange={(e) => setEditBook((prev) => prev ? { ...prev, sellingPrice: parseFloat(e.target.value) || 0 } : prev)} /></div>
                <div className="space-y-2"><Label>Specimen (₹)</Label> <Input type="number" value={editBook.specimenPrice} onChange={(e) => setEditBook((prev) => prev ? { ...prev, specimenPrice: parseFloat(e.target.value) || 0 } : prev)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Publisher *</Label>
                <Select value={editBook.publishedUnder} onValueChange={(v) => setEditBook((prev) => prev ? { ...prev, publishedUnder: v as Book["publishedUnder"] } : prev)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goodluck Publications">Goodluck Publications</SelectItem>
                    <SelectItem value="Vidhyarthi Prakashan">Vidhyarthi Prakashan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Board</Label><Input value={editBook.board ?? ""} onChange={(e) => setEditBook((prev) => prev ? { ...prev, board: e.target.value } : prev)} /></div>
                <div className="space-y-2"><Label>ISBN</Label> <Input value={editBook.isbn ?? ""} onChange={(e) => setEditBook((prev) => prev ? { ...prev, isbn: e.target.value } : prev)} /></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditBook(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      />
    </PageContainer>
  );
}
