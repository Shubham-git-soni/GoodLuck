"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Download,
  Filter,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Plus,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "@/hooks/use-toast";

import salesmenData from "@/lib/mock-data/salesmen.json";

// Mock bookseller data
const generateBooksellerData = (salesmanName: string) => {
  const cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Gujarat"];

  const booksellers = [
    "Kitab Mahal",
    "Crossword Bookstore",
    "Landmark Books",
    "Sapna Book House",
    "Odyssey Books",
    "Higginbothams",
    "Current Books",
    "The Book Shop",
    "Scholar's Choice",
    "Educational Emporium",
    "Academic Books",
    "Student Store",
    "Knowledge Hub",
    "Learning Center Books",
    "Campus Bookstore",
  ];

  const numBooksellers = Math.floor(Math.random() * 8) + 5; // 5-12 booksellers per salesman

  return Array.from({ length: numBooksellers }, (_, index) => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const booksellerName = booksellers[Math.floor(Math.random() * booksellers.length)];

    return {
      id: `BS${String(index + 1).padStart(3, "0")}`,
      srNo: index + 1,
      salesman: salesmanName,
      booksellerName: `${booksellerName} - ${city}`,
      contactNo: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `${booksellerName.toLowerCase().replace(/[^a-z0-9]/g, "")}${city.toLowerCase()}@bookstore.com`,
      address: `${Math.floor(Math.random() * 500) + 1} ${["Main Road", "Station Road", "MG Road", "Park Street", "Commercial Street"][Math.floor(Math.random() * 5)]}, ${city}`,
      city,
      state,
    };
  });
};

export default function BooksellerListPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [booksellerData, setBooksellerData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Generate bookseller data for this salesman
        const booksellers = generateBooksellerData(foundSalesman.name);
        setBooksellerData(booksellers);
        setFilteredData(booksellers);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...booksellerData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.booksellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.contactNo.includes(searchQuery)
      );
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((item) => item.city === cityFilter);
    }

    // State filter
    if (stateFilter !== "all") {
      filtered = filtered.filter((item) => item.state === stateFilter);
    }

    setFilteredData(filtered);
  }, [searchQuery, cityFilter, stateFilter, booksellerData]);

  const handleDelete = (bookseller: any) => {
    // Remove bookseller from data
    const updatedData = booksellerData.filter((b) => b.id !== bookseller.id);
    setBooksellerData(updatedData);

    toast({
      title: "Bookseller Deleted",
      description: `${bookseller.booksellerName} has been removed from the list.`,
      variant: "destructive",
    });
  };

  const handleEdit = (bookseller: any) => {
    toast({
      title: "Edit Bookseller",
      description: `Opening edit form for ${bookseller.booksellerName}`,
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/team">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Get unique cities and states for filters
  const cities = Array.from(new Set(booksellerData.map((item) => item.city))).sort();
  const states = Array.from(new Set(booksellerData.map((item) => item.state))).sort();

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`Bookseller List - ${salesman.name}`}
          description={`Complete list of booksellers assigned to ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Booksellers</p>
              <Store className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{filteredData.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Cities Covered</p>
            </div>
            <p className="text-2xl font-bold">{cities.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">States Covered</p>
            </div>
            <p className="text-2xl font-bold">{states.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Salesman</p>
            </div>
            <p className="text-lg font-bold truncate">{salesman.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by bookseller name, city, or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by city" />
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

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bookseller
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookseller List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5" />
            Bookseller List ({filteredData.length} booksellers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Sr. No.</TableHead>
                  <TableHead className="min-w-[150px]">Salesman</TableHead>
                  <TableHead className="min-w-[200px]">Bookseller Name</TableHead>
                  <TableHead className="min-w-[140px]">Contact No.</TableHead>
                  <TableHead className="min-w-[220px]">Email</TableHead>
                  <TableHead className="min-w-[250px]">Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead className="text-center w-[80px]">Delete</TableHead>
                  <TableHead className="text-center w-[80px]">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No booksellers found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.srNo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.salesman}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.booksellerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {item.contactNo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[200px]" title={item.email}>
                            {item.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[230px]" title={item.address}>
                            {item.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.city}</Badge>
                      </TableCell>
                      <TableCell>{item.state}</TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bookseller</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{item.booksellerName}</strong>?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item)}
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
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer Summary */}
          {filteredData.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Booksellers</p>
                  <p className="font-bold text-lg">{filteredData.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cities Covered</p>
                  <p className="font-bold text-lg">{cities.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">States Covered</p>
                  <p className="font-bold text-lg">{states.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-bold text-lg truncate">{salesman.name}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
