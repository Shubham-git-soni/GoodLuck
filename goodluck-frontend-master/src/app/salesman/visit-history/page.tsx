"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, School, Users, BookOpen, Filter, Search, ChevronRight, Clock } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/ui/empty-state";

interface VisitRecord {
  id: string;
  type: "school" | "bookseller" | "qb";
  entityId: string;
  entityName: string;
  city: string;
  address: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime?: string;
  purposes: string[];
  contactPerson: string;
  notes?: string;
  status: "completed" | "in-progress";
}

export default function VisitHistoryPage() {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In real app, this would come from API
  useEffect(() => {
    setTimeout(() => {
      const mockVisits: VisitRecord[] = [
        {
          id: "VH001",
          type: "school",
          entityId: "SCH001",
          entityName: "Delhi Public School",
          city: "Delhi",
          address: "Mathura Road, New Delhi - 110025",
          visitDate: "2025-11-20",
          checkInTime: "10:30 AM",
          checkOutTime: "12:15 PM",
          purposes: ["Book Prescription Discussion", "Sample Distribution"],
          contactPerson: "Dr. Rajesh Sharma",
          notes: "Principal showed interest in new Mathematics series",
          status: "completed",
        },
        {
          id: "VH002",
          type: "qb",
          entityId: "QB002",
          entityName: "Ryan International School",
          city: "Mumbai",
          address: "Goregaon West, Mumbai - 400062",
          visitDate: "2025-11-18",
          checkInTime: "2:00 PM",
          checkOutTime: "3:30 PM",
          purposes: ["QB Discussion"],
          contactPerson: "Mrs. Pooja Mehta",
          notes: "Reviewed Class 10 sample papers",
          status: "completed",
        },
        {
          id: "VH003",
          type: "bookseller",
          entityId: "BS001",
          entityName: "Books & More",
          city: "Delhi",
          address: "Connaught Place, New Delhi",
          visitDate: "2025-11-15",
          checkInTime: "11:00 AM",
          checkOutTime: "11:45 AM",
          purposes: ["Payment Collection", "Relationship Building"],
          contactPerson: "Mr. Anil Kapoor",
          notes: "Collected payment of ₹45,000",
          status: "completed",
        },
        {
          id: "VH004",
          type: "school",
          entityId: "SCH003",
          entityName: "St. Xavier's High School",
          city: "Delhi",
          address: "Raj Nagar, New Delhi - 110017",
          visitDate: "2025-11-12",
          checkInTime: "9:30 AM",
          checkOutTime: "11:00 AM",
          purposes: ["Relationship Building", "Feedback Collection"],
          contactPerson: "Mrs. Priya Mehta",
          notes: "Discussed upcoming book requirements for next academic year",
          status: "completed",
        },
        {
          id: "VH005",
          type: "school",
          entityId: "SCH005",
          entityName: "Modern Public School",
          city: "Delhi",
          address: "Vasant Vihar, New Delhi - 110057",
          visitDate: "2025-11-10",
          checkInTime: "1:00 PM",
          checkOutTime: "2:30 PM",
          purposes: ["Sample Distribution"],
          contactPerson: "Mr. Arun Kumar",
          notes: "Distributed 20 specimen books for review",
          status: "completed",
        },
        {
          id: "VH006",
          type: "qb",
          entityId: "QB001",
          entityName: "Delhi Public School",
          city: "Delhi",
          address: "Mathura Road, New Delhi - 110025",
          visitDate: "2025-11-08",
          checkInTime: "3:00 PM",
          checkOutTime: "4:15 PM",
          purposes: ["Question Paper Discussion"],
          contactPerson: "Dr. Rajesh Sharma",
          notes: "Reviewed question bank format and content",
          status: "completed",
        },
        {
          id: "VH007",
          type: "bookseller",
          entityId: "BS002",
          entityName: "Academic Book Store",
          city: "Delhi",
          address: "Karol Bagh, New Delhi",
          visitDate: "2025-11-05",
          checkInTime: "10:00 AM",
          checkOutTime: "10:45 AM",
          purposes: ["Documentation", "Payment Collection"],
          contactPerson: "Mr. Rajiv Sharma",
          notes: "Updated GST documentation",
          status: "completed",
        },
        {
          id: "VH008",
          type: "school",
          entityId: "SCH007",
          entityName: "Bloom Dale School",
          city: "Delhi",
          address: "Palam Vihar, New Delhi",
          visitDate: "2025-10-28",
          checkInTime: "11:30 AM",
          checkOutTime: "1:00 PM",
          purposes: ["New Product Introduction", "Book Prescription Discussion"],
          contactPerson: "Ms. Kavita Singh",
          notes: "Introduced new English literature series",
          status: "completed",
        },
      ];
      setVisits(mockVisits);
      setFilteredVisits(mockVisits);
      setIsLoading(false);
    }, 800);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = visits;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (visit) =>
          visit.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visit.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          visit.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((visit) => visit.type === typeFilter);
    }

    // Month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter((visit) => {
        const visitMonth = new Date(visit.visitDate).toISOString().slice(0, 7);
        return visitMonth === monthFilter;
      });
    }

    setFilteredVisits(filtered);
  }, [searchQuery, typeFilter, monthFilter, visits]);

  // Get unique months from visits
  const getMonthOptions = () => {
    const months = new Set(
      visits.map((v) => new Date(v.visitDate).toISOString().slice(0, 7))
    );
    return Array.from(months).sort().reverse();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "school":
        return School;
      case "qb":
        return BookOpen;
      case "bookseller":
        return Users;
      default:
        return MapPin;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      school: "School",
      qb: "QB",
      bookseller: "Book Seller",
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Visit History" description="View your past visits" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Visit History"
        description={`${visits.length} total visits recorded`}
      />

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, or contact person..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="school">Schools</SelectItem>
              <SelectItem value="qb">QBs</SelectItem>
              <SelectItem value="bookseller">Book Sellers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {getMonthOptions().map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(month + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setMonthFilter("all");
            }}
            className="col-span-2 md:col-span-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredVisits.length} of {visits.length} visits
        </p>
      </div>

      {/* Visit List */}
      {filteredVisits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No visits found"
          description="Try adjusting your search or filter criteria"
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery("");
              setTypeFilter("all");
              setMonthFilter("all");
            },
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((visit) => {
            const TypeIcon = getTypeIcon(visit.type);

            return (
              <Card key={visit.id} className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-base truncate">
                          {visit.entityName}
                        </h3>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {getTypeBadge(visit.type)}
                        </Badge>
                        {visit.status === "completed" && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {/* Date & Time */}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {new Date(visit.visitDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {visit.checkInTime}
                            {visit.checkOutTime && ` - ${visit.checkOutTime}`}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {visit.city}, {visit.address}
                          </span>
                        </div>

                        {/* Contact Person */}
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{visit.contactPerson}</span>
                        </div>

                        {/* Purposes */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {visit.purposes.map((purpose, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {purpose}
                            </Badge>
                          ))}
                        </div>

                        {/* Notes */}
                        {visit.notes && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-xs italic">{visit.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
