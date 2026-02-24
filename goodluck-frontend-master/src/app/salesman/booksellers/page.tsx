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

import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function BookSellerListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookSellers, setBookSellers] = useState<BookSeller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<BookSeller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);

  const [newSeller, setNewSeller] = useState({
    shopName: "", ownerName: "", city: "", address: "", contactNumber: "", email: "", gstNumber: "", creditLimit: "",
  });

  useEffect(() => {
    setTimeout(() => {
      const assigned = bookSellersData.filter((b) => b.assignedTo === "SM001");
      setBookSellers(assigned as BookSeller[]);
      setFilteredSellers(assigned as BookSeller[]);
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

  const resetForm = () => setNewSeller({ shopName: "", ownerName: "", city: "", address: "", contactNumber: "", email: "", gstNumber: "", creditLimit: "" });

  const handleAddSeller = () => {
    if (!newSeller.shopName || !newSeller.ownerName || !newSeller.city) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Book seller added successfully! Pending admin approval.");
    setIsMobileSheetOpen(false);
    setIsDesktopDialogOpen(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Book Sellers" description="Manage your book seller relationships" />
        <div className="space-y-3">
          <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  // Common fields shared by mobile + desktop
  const commonFields = (
    <>
      <div className="grid gap-2">
        <Label>Shop Name *</Label>
        <Input value={newSeller.shopName} onChange={(e) => setNewSeller({ ...newSeller, shopName: e.target.value })} placeholder="Enter shop name" />
      </div>
      <div className="grid gap-2">
        <Label>Owner Name *</Label>
        <Input value={newSeller.ownerName} onChange={(e) => setNewSeller({ ...newSeller, ownerName: e.target.value })} placeholder="Enter owner name" />
      </div>
      <div className="grid gap-2">
        <Label>Address</Label>
        <Textarea value={newSeller.address} onChange={(e) => setNewSeller({ ...newSeller, address: e.target.value })} placeholder="Enter complete address" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Contact Number</Label>
          <Input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} value={newSeller.contactNumber} onChange={(e) => setNewSeller({ ...newSeller, contactNumber: e.target.value.replace(/\D/g, "") })} placeholder="10-digit number" />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={newSeller.email} onChange={(e) => setNewSeller({ ...newSeller, email: e.target.value })} placeholder="Enter email" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>GST Number</Label>
          <Input value={newSeller.gstNumber} onChange={(e) => setNewSeller({ ...newSeller, gstNumber: e.target.value })} placeholder="Enter GST number" />
        </div>
        <div className="grid gap-2">
          <Label>Credit Limit</Label>
          <Input type="number" value={newSeller.creditLimit} onChange={(e) => setNewSeller({ ...newSeller, creditLimit: e.target.value })} placeholder="Enter amount" />
        </div>
      </div>
    </>
  );

  // Mobile form — uses NativeSelect for City (works inside mobile sheet)
  const mobileFormFields = (
    <div className="grid gap-4">
      {commonFields}
      <div className="grid gap-2">
        <Label>City *</Label>
        <NativeSelect value={newSeller.city} onValueChange={(v) => setNewSeller({ ...newSeller, city: v })} placeholder="Select city">
          {dropdownOptions.cities.map((city) => <NativeSelectOption key={city} value={city}>{city}</NativeSelectOption>)}
        </NativeSelect>
      </div>
    </div>
  );

  // Desktop form — uses Radix Select for City
  const desktopFormFields = (
    <div className="grid gap-4">
      {commonFields}
      <div className="grid gap-2">
        <Label>City *</Label>
        <Select value={newSeller.city} onValueChange={(v) => setNewSeller({ ...newSeller, city: v })}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {dropdownOptions.cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <PageContainer>
      {/* Mobile Bottom Sheet */}
      <MobileSheet
        open={isMobileSheetOpen}
        onClose={() => { setIsMobileSheetOpen(false); resetForm(); }}
        title="Add Book Seller"
        description="Details will be submitted for admin approval"
        footer={
          <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={handleAddSeller}>Submit for Approval</Button>
        }
      >
        {mobileFormFields}
      </MobileSheet>

      {/* Desktop Dialog */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={(o) => { setIsDesktopDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book Seller</DialogTitle>
            <DialogDescription>Fill in the book seller details. This will be submitted for admin approval.</DialogDescription>
          </DialogHeader>
          <div className="py-2">{desktopFormFields}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDesktopDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleAddSeller}>Submit for Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Master Tabs */}
      <div className="md:hidden mb-4">
        <div className="flex rounded-2xl bg-muted p-1 gap-1 mb-4">
          <Link href="/salesman/schools" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
              My Schools
            </button>
          </Link>
          <Link href="/salesman/qbs" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">
              My QBs
            </button>
          </Link>
          <Link href="/salesman/booksellers" className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold bg-background text-primary shadow-sm">
              Book Sellers
            </button>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Book Sellers"
        description={`${bookSellers.length} book sellers assigned`}
        action={
          <>
            <Button size="sm" className="md:hidden" onClick={() => setIsMobileSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Book Seller
            </Button>
            <Button size="sm" className="hidden md:flex" onClick={() => setIsDesktopDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Book Seller
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by shop name, owner, or city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Showing {filteredSellers.length} of {bookSellers.length} book sellers</p>
      </div>

      {filteredSellers.length === 0 ? (
        <EmptyState icon={Search} title="No book sellers found" description="Try adjusting your search criteria" action={{ label: "Clear Search", onClick: () => setSearchQuery("") }} />
      ) : (
        <div className="space-y-3">
          {filteredSellers.map((seller) => (
            <Link key={seller.id} href={`/salesman/booksellers/${seller.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1 truncate">{seller.shopName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">Owner: {seller.ownerName}</p>
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /><span>{seller.city}</span></div>
                            <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /><span>Last visit: {new Date(seller.lastVisitDate).toLocaleDateString()}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={seller.currentOutstanding > seller.creditLimit * 0.8 ? "destructive" : seller.currentOutstanding > seller.creditLimit * 0.5 ? "secondary" : "outline"}>
                              <DollarSign className="h-3 w-3 mr-1" />Outstanding: ₹{(seller.currentOutstanding / 1000).toFixed(0)}K
                            </Badge>
                            <Badge variant="outline" className="text-xs">Credit: ₹{(seller.creditLimit / 100000).toFixed(1)}L</Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
