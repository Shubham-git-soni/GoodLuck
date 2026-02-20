"use client";

import { useState, useRef } from "react";
import { Plus, Search, Filter, BookOpen, Package, Upload, Download } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Book } from "@/types";
import booksData from "@/lib/mock-data/books.json";

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>(booksData as Book[]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(booksData as Book[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add book form state
  const [formData, setFormData] = useState({
    title: "",
    class: "",
    mrp: "",
    sellingPrice: "",
    specimenPrice: "",
    publishedUnder: "",
    subject: "",
    board: "CBSE",
    isbn: "",
  });

  // Apply filters
  const applyFilters = () => {
    let filtered = books;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.class.includes(searchQuery)
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter((book) => book.class === classFilter);
    }

    // Publisher filter
    if (publisherFilter !== "all") {
      filtered = filtered.filter((book) => book.publishedUnder === publisherFilter);
    }

    setFilteredBooks(filtered);
  };

  // Update filters when dependencies change
  useState(() => {
    applyFilters();
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => applyFilters(), 0);
  };

  const handleClassFilterChange = (value: string) => {
    setClassFilter(value);
    setTimeout(() => applyFilters(), 0);
  };

  const handlePublisherFilterChange = (value: string) => {
    setPublisherFilter(value);
    setTimeout(() => applyFilters(), 0);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setClassFilter("all");
    setPublisherFilter("all");
    setFilteredBooks(books);
  };

  const handleAddBook = () => {
    // Validation
    if (
      !formData.title ||
      !formData.class ||
      !formData.mrp ||
      !formData.sellingPrice ||
      !formData.specimenPrice ||
      !formData.publishedUnder
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const mrp = parseFloat(formData.mrp);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const specimenPrice = parseFloat(formData.specimenPrice);

    if (sellingPrice > mrp) {
      toast.error("Selling price cannot be greater than MRP");
      return;
    }

    if (specimenPrice > sellingPrice) {
      toast.error("Specimen price cannot be greater than selling price");
      return;
    }

    const newBook: Book = {
      id: `BK${String(books.length + 1).padStart(3, "0")}`,
      title: formData.title,
      class: formData.class,
      mrp,
      sellingPrice,
      specimenPrice,
      publishedUnder: formData.publishedUnder as "Goodluck Publications" | "Vidhyarthi Prakashan",
      subject: formData.subject || undefined,
      board: formData.board || undefined,
      isbn: formData.isbn || undefined,
      stockAvailable: 0,
      createdDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    setBooks([...books, newBook]);
    setFilteredBooks([...books, newBook]);
    toast.success("Book added successfully!");

    // Reset form
    setFormData({
      title: "",
      class: "",
      mrp: "",
      sellingPrice: "",
      specimenPrice: "",
      publishedUnder: "",
      subject: "",
      board: "CBSE",
      isbn: "",
    });
    setIsAddBookOpen(false);
  };

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (validTypes.includes(file.type) || file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) {
        setImportFile(file);
      } else {
        toast.error("Please upload a CSV or Excel file");
        e.target.value = "";
      }
    }
  };

  const handleImportBooks = () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    // Simulate CSV/Excel parsing
    // In real app, use libraries like papaparse for CSV or xlsx for Excel
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").slice(1); // Skip header row

        const importedBooks: Book[] = [];
        let successCount = 0;
        let errorCount = 0;

        rows.forEach((row) => {
          if (!row.trim()) return;

          const columns = row.split(",");
          if (columns.length < 6) {
            errorCount++;
            return;
          }

          try {
            const book: Book = {
              id: `BK${String(books.length + importedBooks.length + 1).padStart(3, "0")}`,
              title: columns[0]?.trim() || "",
              class: columns[1]?.trim() || "",
              mrp: parseFloat(columns[2]?.trim() || "0"),
              sellingPrice: parseFloat(columns[3]?.trim() || "0"),
              specimenPrice: parseFloat(columns[4]?.trim() || "0"),
              publishedUnder: (columns[5]?.trim() || "Goodluck Publications") as "Goodluck Publications" | "Vidhyarthi Prakashan",
              subject: columns[6]?.trim() || undefined,
              board: columns[7]?.trim() || "CBSE",
              isbn: columns[8]?.trim() || undefined,
              stockAvailable: parseInt(columns[9]?.trim() || "0"),
              createdDate: new Date().toISOString().split("T")[0],
              lastUpdated: new Date().toISOString().split("T")[0],
            };

            if (book.title && book.class && book.mrp > 0) {
              importedBooks.push(book);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            errorCount++;
          }
        });

        if (importedBooks.length > 0) {
          setBooks([...books, ...importedBooks]);
          setFilteredBooks([...books, ...importedBooks]);
          toast.success(`Successfully imported ${successCount} books${errorCount > 0 ? `. ${errorCount} rows had errors.` : ""}`);
          setIsImportOpen(false);
          setImportFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          toast.error("No valid books found in the file");
        }
      } catch (err) {
        toast.error("Error parsing file. Please check the format.");
      }
    };

    reader.readAsText(importFile);
  };

  const downloadTemplate = () => {
    const headers = "Title,Class,MRP,Selling Price,Specimen Price,Published Under,Subject,Board,ISBN,Stock Available";
    const sampleRow = "Sample Book Title,10,500,450,225,Goodluck Publications,Mathematics,CBSE,978-93-5678-XXX-X,100";
    const csv = `${headers}\n${sampleRow}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "books_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  // Get unique classes
  const uniqueClasses = Array.from(new Set(books.map((b) => b.class))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  return (
    <PageContainer>
      <div className="space-y-4 mb-6">
        <PageHeader title="Books Management" description={`${books.length} books in catalog`} />

        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Import Books
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Books</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file to import multiple books at once
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">File Format Requirements:</p>
                      <ul className="text-xs space-y-1 ml-4 list-disc">
                        <li>CSV or Excel (.xlsx) file</li>
                        <li>Headers: Title, Class, MRP, Selling Price, Specimen Price, Published Under, Subject, Board, ISBN, Stock Available</li>
                        <li>Published Under must be either "Goodluck Publications" or "Vidhyarthi Prakashan"</li>
                      </ul>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={downloadTemplate}
                        className="p-0 h-auto text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download Template
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleImportBooks} disabled={!importFile}>
                  Import Books
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>Add a new book to the catalog</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Book Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Class and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
              </div>

              {/* MRP, Selling Price, Specimen Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹) *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specimenPrice">Specimen Price (₹) *</Label>
                  <Input
                    id="specimenPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.specimenPrice}
                    onChange={(e) => setFormData({ ...formData, specimenPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Published Under */}
              <div className="space-y-2">
                <Label htmlFor="publishedUnder">Published Under *</Label>
                <Select
                  value={formData.publishedUnder}
                  onValueChange={(value) => setFormData({ ...formData, publishedUnder: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select publisher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goodluck Publications">Goodluck Publications</SelectItem>
                    <SelectItem value="Vidhyarthi Prakashan">Vidhyarthi Prakashan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Board and ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="board">Board</Label>
                  <Input
                    id="board"
                    placeholder="e.g., CBSE, ICSE"
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    placeholder="978-XX-XXXX-XXX-X"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAddBookOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleAddBook} className="w-full sm:w-auto">Add Book</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, subject, or class..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={classFilter} onValueChange={handleClassFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {uniqueClasses.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={publisherFilter} onValueChange={handlePublisherFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Publisher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Publishers</SelectItem>
              <SelectItem value="Goodluck Publications">Goodluck Publications</SelectItem>
              <SelectItem value="Vidhyarthi Prakashan">Vidhyarthi Prakashan</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleResetFilters} className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
        </p>
      </div>

      {/* Books List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2">{book.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        Class {book.class}
                      </Badge>
                      {book.subject && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {book.subject}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                </div>

                {/* Publisher */}
                <div className="text-[11px] sm:text-xs text-muted-foreground">
                  <span className="font-medium">Publisher:</span>
                  <span className="block sm:inline sm:ml-1 truncate">
                    {book.publishedUnder === "Goodluck Publications" ? "GL" : "VP"}
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">MRP:</span>
                    <span className="font-semibold">₹{book.mrp}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Selling:</span>
                    <span className="font-semibold text-green-600">₹{book.sellingPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Specimen:</span>
                    <span className="font-semibold text-blue-600">₹{book.specimenPrice}</span>
                  </div>
                </div>

                {/* Stock & ISBN */}
                <div className="space-y-1 pt-2 border-t">
                  {book.stockAvailable !== undefined && (
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
                      <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span>Stock: {book.stockAvailable}</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      <span className="font-medium">ISBN:</span> {book.isbn}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No books found matching your criteria</p>
          </CardContent>
        </Card>
      )}
      </div>
    </PageContainer>
  );
}
