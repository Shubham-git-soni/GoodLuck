"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, DollarSign, Calendar, ChevronRight, Plus } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import EmptyState from "@/components/ui/empty-state";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { BookSeller } from "@/types";
import { toast } from "sonner";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { Trash2, Eye, Pencil } from "lucide-react";

import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";
import { ALL_STATES, getCitiesForState } from "@/lib/state-city-map";

export default function AdminBookSellerListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookSellers, setBookSellers] = useState<BookSeller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<BookSeller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);

  const [newSeller, setNewSeller] = useState({
    shopName: "", ownerName: "", city: "", state: "", address: "", phone: "", email: "", gstNumber: "", creditLimit: "",
  });
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedSeller, setSelectedSeller] = useState<BookSeller | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setBookSellers(bookSellersData as BookSeller[]);
      setFilteredSellers(bookSellersData as BookSeller[]);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = bookSellers.filter(
        (seller) =>
          seller.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSellers(filtered);
    } else {
      setFilteredSellers(bookSellers);
    }
  }, [searchQuery, bookSellers]);

  const resetForm = () => setNewSeller({ shopName: "", ownerName: "", city: "", state: "", address: "", phone: "", email: "", gstNumber: "", creditLimit: "" });

  const openModal = (mode: "add" | "edit" | "view", seller?: BookSeller) => {
    setModalMode(mode);
    if (seller) {
      setSelectedSeller(seller);
      setNewSeller({
        shopName: seller.shopName,
        ownerName: seller.ownerName,
        city: seller.city,
        state: (seller as any).state || "",
        address: seller.address,
        phone: seller.phone,
        email: seller.email,
        gstNumber: seller.gstNumber,
        creditLimit: seller.creditLimit.toString(),
      });
    } else {
      setSelectedSeller(null);
      resetForm();
    }
    if (window.innerWidth < 768) setIsMobileSheetOpen(true);
    else setIsDesktopDialogOpen(true);
  };

  const handleAddSeller = () => {
    if (modalMode === "view") return;
    if (!newSeller.shopName || !newSeller.ownerName || !newSeller.city) {
      toast.error("Please fill all required fields");
      return;
    }

    if (modalMode === "add") {
      toast.success("Book seller added successfully! Pending admin approval.");
    } else {
      toast.success("Book seller details updated successfully.");
    }

    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    resetForm();
  };

  const handleDelete = (seller: BookSeller) => {
    toast.success(`Book seller "${seller.shopName}" deleted`);
  };

  const BOOKSELLER_COLUMNS: GridColumn<BookSeller>[] = [
    { key: "shopName", header: "Shop Name", pinned: "left", width: 220, sortable: true, filterable: true, render: (v) => <span className="font-semibold text-sm text-primary">{v}</span> },
    { key: "ownerName", header: "Owner", width: 160, sortable: true, filterable: true },
    { key: "city", header: "City", width: 120, sortable: true, filterable: true, render: (v) => <Badge variant="secondary" className="text-[10px]">{v}</Badge> },
    { key: "state", header: "State", width: 120, sortable: true, filterable: true, render: (v) => <span className="text-xs">{v || "—"}</span> },
    { key: "phone", header: "Contact", width: 130, render: (v) => <span className="text-xs">{v || "N/A"}</span> },
    { key: "email", header: "Email", width: 180, render: (v) => <span className="text-xs text-muted-foreground truncate block w-full" title={v}>{v || "N/A"}</span> },
    {
      key: "currentOutstanding",
      header: "Outstanding",
      width: 130,
      align: "right",
      sortable: true,
      render: (v, row) => (
        <Badge variant={v > row.creditLimit * 0.8 ? "destructive" : v > row.creditLimit * 0.5 ? "secondary" : "outline"} className="text-[10px]">
          ₹{(v / 1000).toFixed(1)}K
        </Badge>
      )
    },
    {
      key: "creditLimit",
      header: "Credit Limit",
      width: 120,
      align: "right",
      sortable: true,
      render: (v) => <span className="text-xs font-medium">₹{(v / 100000).toFixed(1)}L</span>
    },
    {
      key: "lastVisitDate",
      header: "Last Visit",
      width: 110,
      sortable: true,
      render: (v) => <span className="text-xs text-muted-foreground">{v ? new Date(v).toLocaleDateString() : "Never"}</span>
    },
  ];

  const rowActions: RowAction<BookSeller>[] = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (s) => openModal("view", s) },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (s) => openModal("edit", s) },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (s) => handleDelete(s), danger: true },
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

  // Common fields shared by mobile + desktop
  // Cities filtered based on selected state
  const filteredCities = newSeller.state ? getCitiesForState(newSeller.state) : [];

  const commonFields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Shop Name *</Label>
          <Input readOnly={modalMode === "view"} value={newSeller.shopName} onChange={(e) => setNewSeller({ ...newSeller, shopName: e.target.value })} placeholder="Enter shop name" />
        </div>
        <div className="grid gap-2">
          <Label>Owner Name *</Label>
          <Input readOnly={modalMode === "view"} value={newSeller.ownerName} onChange={(e) => setNewSeller({ ...newSeller, ownerName: e.target.value })} placeholder="Enter owner name" />
        </div>
      </div>
      {/* State first — then City filtered by state */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>State <span className="text-destructive">*</span></Label>
          <Select
            disabled={modalMode === "view"}
            value={newSeller.state}
            onValueChange={(v) => setNewSeller({ ...newSeller, state: v, city: "" })}
          >
            <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>City <span className="text-destructive">*</span></Label>
          <Select
            disabled={modalMode === "view" || !newSeller.state}
            value={newSeller.city}
            onValueChange={(v) => setNewSeller({ ...newSeller, city: v })}
          >
            <SelectTrigger className={modalMode === "view" ? "bg-muted/50" : ""}>
              <SelectValue placeholder={newSeller.state ? "Select city" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea readOnly={modalMode === "view"} value={newSeller.address} onChange={(e) => setNewSeller({ ...newSeller, address: e.target.value })} placeholder="Enter complete address" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Contact Number</Label>
          <Input readOnly={modalMode === "view"} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={newSeller.phone} onChange={(e) => setNewSeller({ ...newSeller, phone: e.target.value.replace(/\D/g, "") })} placeholder="10-digit number" />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input readOnly={modalMode === "view"} type="email" value={newSeller.email} onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })} placeholder="Enter email" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>GST Number</Label>
          <Input readOnly={modalMode === "view"} value={newSeller.gstNumber} onChange={(e) => setNewSeller({ ...newSeller, gstNumber: e.target.value })} placeholder="Enter GST number" />
        </div>
        <div className="grid gap-2">
          <Label>Credit Limit</Label>
          <Input readOnly={modalMode === "view"} type="number" value={newSeller.creditLimit} onChange={(e) => setNewSeller({ ...newSeller, creditLimit: e.target.value })} placeholder="Enter amount" />
        </div>
      </div>
    </>
  );

  // Mobile form
  const mobileFormFields = (
    <div className="grid gap-4">
      {commonFields}
    </div>
  );

  // Desktop form
  const desktopFormFields = (
    <div className="grid gap-4">
      {commonFields}
    </div>
  );

  return (
    <PageContainer>
      {/* Mobile Bottom Sheet */}
      <MobileSheet
        open={isMobileSheetOpen}
        onClose={() => { setIsMobileSheetOpen(false); resetForm(); }}
        title={modalMode === "add" ? "Add Book Seller" : modalMode === "edit" ? "Edit Book Seller" : "View Book Seller"}
        description={modalMode === "view" ? "Bookseller record details" : "Details will be submitted for admin approval"}
        footer={modalMode !== "view" && (
          <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleAddSeller}>
            {modalMode === "add" ? "Submit for Approval" : "Save Changes"}
          </Button>
        )}
      >
        {mobileFormFields}
      </MobileSheet>

      {/* Desktop Dialog */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={(o) => { setIsDesktopDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === "add" ? "Add New Book Seller" : modalMode === "edit" ? "Edit Book Seller" : "Book Seller Details"}</DialogTitle>
            <DialogDescription>
              {modalMode === "view" ? "Review the bookseller information below." : "Fill in the book seller details. This will be submitted for admin approval."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">{desktopFormFields}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDesktopDialogOpen(false); resetForm(); }}>
              {modalMode === "view" ? "Close" : "Cancel"}
            </Button>
            {modalMode !== "view" && (
              <Button onClick={handleAddSeller}>
                {modalMode === "add" ? "Submit for Approval" : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page Header ── */}
      <div className="mb-6">
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

      {/* ── Desktop DataGrid ── */}
      <div className="hidden md:block">
        <DataGrid
          data={bookSellers}
          columns={BOOKSELLER_COLUMNS}
          rowActions={rowActions}
          density="compact"
          selectable
          inlineFilters
          striped
          enableRowPinning
        />
      </div>

      {/* ── Mobile View ── */}
      <div className="md:hidden space-y-4">
        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shop, owner, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>

        <div className="space-y-3">
          {filteredSellers.length === 0 ? (
            <EmptyState icon={Search} title="No book sellers found" description="Try adjusting your search criteria" action={{ label: "Clear Search", onClick: () => setSearchQuery("") }} />
          ) : (
            filteredSellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-md transition-all cursor-pointer border-none shadow-sm bg-muted/30" onClick={() => openModal("view", seller)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm mb-1 truncate text-primary">{seller.shopName}</h3>
                          <p className="text-xs text-muted-foreground mb-2">Owner: {seller.ownerName}</p>
                          <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground mb-3">
                            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span>{seller.city}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /><span>Last visit: {new Date(seller.lastVisitDate).toLocaleDateString()}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={seller.currentOutstanding > seller.creditLimit * 0.8 ? "destructive" : seller.currentOutstanding > seller.creditLimit * 0.5 ? "secondary" : "outline"} className="text-[10px] px-2 py-0">
                              Outstanding: ₹{(seller.currentOutstanding / 1000).toFixed(0)}K
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-2 py-0">Limit: ₹{(seller.creditLimit / 100000).toFixed(1)}L</Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-50" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
