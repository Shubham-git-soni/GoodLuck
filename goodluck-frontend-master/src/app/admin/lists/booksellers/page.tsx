"use client";

import { useState, useEffect } from "react";
import { Search, Store, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookSeller } from "@/types";
import { toast } from "@/hooks/use-toast";

// Import mock data
import bookSellersData from "@/lib/mock-data/book-sellers.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

export default function BooksellerListPage() {
  const [booksellers, setBooksellers] = useState<BookSeller[]>([]);
  const [filteredBooksellers, setFilteredBooksellers] = useState<BookSeller[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    setBooksellers(bookSellersData as BookSeller[]);
    setFilteredBooksellers(bookSellersData as BookSeller[]);
  }, []);

  useEffect(() => {
    let filtered = booksellers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (seller) =>
          seller.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.phone.includes(searchQuery) ||
          seller.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((seller) => seller.city === cityFilter);
    }

    setFilteredBooksellers(filtered);
  }, [searchQuery, cityFilter, booksellers]);

  const handleDelete = (bookseller: BookSeller) => {
    const updatedData = booksellers.filter((b) => b.id !== bookseller.id);
    setBooksellers(updatedData);

    toast({
      title: "Bookseller Deleted",
      description: `${bookseller.shopName} has been removed from the list.`,
      variant: "destructive",
    });
  };

  const handleEdit = (bookseller: BookSeller) => {
    toast({
      title: "Edit Bookseller",
      description: `Opening edit form for ${bookseller.shopName}`,
    });
  };

  // Get unique cities for filter
  const cities = Array.from(new Set(booksellers.map((b) => b.city))).sort();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Bookseller List"
          description={`Complete list of ${booksellers.length} booksellers`}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search booksellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-muted-foreground">
                {filteredBooksellers.length} booksellers found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booksellers Table */}
        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px] text-center font-semibold">Sr. No.</TableHead>
                    <TableHead className="min-w-[150px] font-semibold">Salesman</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">Bookseller Name</TableHead>
                    <TableHead className="min-w-[140px] font-semibold">Contact No.</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">Email</TableHead>
                    <TableHead className="min-w-[280px] font-semibold">Address</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">City</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">State</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">Delete</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooksellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No booksellers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooksellers.map((seller, index) => {
                      // Get salesman name from assignedTo
                      const salesman = salesmenData.find((s) => s.id === seller.assignedTo);
                      const salesmanName = salesman ? salesman.name : seller.assignedTo;

                      // Extract state from address or use a default
                      const state = seller.city === "Mumbai" || seller.city === "Pune"
                        ? "Maharashtra"
                        : seller.city === "Delhi"
                        ? "Delhi"
                        : seller.city === "Bangalore"
                        ? "Karnataka"
                        : seller.city === "Hyderabad"
                        ? "Telangana"
                        : seller.city === "Chennai"
                        ? "Tamil Nadu"
                        : seller.city === "Kolkata"
                        ? "West Bengal"
                        : "India";

                      return (
                        <TableRow key={seller.id} className="hover:bg-muted/30">
                          <TableCell className="text-center font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {salesmanName}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{seller.shopName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm">{seller.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate max-w-[190px]" title={seller.email}>
                                {seller.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-sm line-clamp-2">{seller.address}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{seller.city}</TableCell>
                          <TableCell className="font-medium">{state}</TableCell>
                          <TableCell className="text-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Bookseller</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{seller.shopName}</strong>?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(seller)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(seller)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
