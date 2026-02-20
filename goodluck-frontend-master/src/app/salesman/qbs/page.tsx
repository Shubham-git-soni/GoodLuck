"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Search, Filter, MapPin, Calendar, Users, ChevronRight, Building2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import EmptyState from "@/components/ui/empty-state";
import { QB } from "@/types";
import { toast } from "sonner";

// Import mock data
import qbsData from "@/lib/mock-data/qbs.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function QBListPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [qbs, setQbs] = useState<QB[]>([]);
  const [filteredQbs, setFilteredQbs] = useState<QB[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add QB Form State
  const [newQb, setNewQb] = useState({
    schoolName: "",
    schoolBoard: "",
    city: "",
    state: "",
    address: "",
    strength: "",
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setQbs(qbsData as QB[]);
      setFilteredQbs(qbsData as QB[]);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = qbs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (qb) =>
          qb.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          qb.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          qb.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Board filter
    if (boardFilter !== "all") {
      filtered = filtered.filter((qb) => qb.schoolBoard === boardFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((qb) => qb.city === cityFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((qb) => qb.status === statusFilter);
    }

    setFilteredQbs(filtered);
  }, [searchQuery, boardFilter, cityFilter, statusFilter, qbs]);

  // Get unique boards and cities
  const boards = ["all", ...Array.from(new Set(qbs.map((q) => q.schoolBoard)))];
  const cities = ["all", ...Array.from(new Set(qbs.map((q) => q.city)))];

  // Handle Add QB Submit
  const handleAddQb = () => {
    if (!newQb.schoolName || !newQb.schoolBoard || !newQb.city || !newQb.state || !newQb.address || !newQb.strength) {
      toast.error("Please fill all required fields");
      return;
    }

    if (parseInt(newQb.strength) <= 0) {
      toast.error("Strength must be a positive number");
      return;
    }

    toast.success("QB added successfully!");
    setIsAddModalOpen(false);
    setNewQb({
      schoolName: "",
      schoolBoard: "",
      city: "",
      state: "",
      address: "",
      strength: "",
    });
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "Active":
        return "default";
      case "Pending":
        return "secondary";
      case "Inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="My QBs" description="Manage your Question Banks" />
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="My QBs"
        description={`${qbs.length} Question Banks`}
        action={
          <div className="flex gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add QB
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question Bank</DialogTitle>
                <DialogDescription>
                  Fill in the school details for the new Question Bank.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* School Name */}
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={newQb.schoolName}
                    onChange={(e) => setNewQb({ ...newQb, schoolName: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>

                {/* School Board */}
                <div className="grid gap-2">
                  <Label htmlFor="schoolBoard">School Board *</Label>
                  <Select value={newQb.schoolBoard} onValueChange={(value) => setNewQb({ ...newQb, schoolBoard: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownOptions.boards.map((board) => (
                        <SelectItem key={board} value={board}>
                          {board}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City *</Label>
                    <Select value={newQb.city} onValueChange={(value) => setNewQb({ ...newQb, city: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={newQb.state} onValueChange={(value) => setNewQb({ ...newQb, state: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address */}
                <div className="grid gap-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={newQb.address}
                    onChange={(e) => setNewQb({ ...newQb, address: e.target.value })}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>

                {/* Strength */}
                <div className="grid gap-2">
                  <Label htmlFor="strength">Strength *</Label>
                  <Input
                    id="strength"
                    type="number"
                    min="1"
                    value={newQb.strength}
                    onChange={(e) => setNewQb({ ...newQb, strength: e.target.value })}
                    placeholder="Enter student strength"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQb}>Add QB</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href="/salesman/qbs/add-visit">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Visit
            </Button>
          </Link>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by school name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Board" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {boards.slice(1).map((board) => (
                <SelectItem key={board} value={board}>
                  {board}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.slice(1).map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setBoardFilter("all");
              setCityFilter("all");
              setStatusFilter("all");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredQbs.length} of {qbs.length} QBs
        </p>
      </div>

      {/* QB List */}
      {filteredQbs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No QBs found"
          description="Try adjusting your search or filter criteria"
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSearchQuery("");
              setBoardFilter("all");
              setCityFilter("all");
              setStatusFilter("all");
            },
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredQbs.map((qb) => (
            <Card key={qb.id} className="hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">
                      {qb.schoolName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {qb.schoolBoard}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(qb.status)} className="text-xs">
                        {qb.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{qb.city}, {qb.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{qb.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{qb.strength} students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>
                          Last updated: {new Date(qb.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
