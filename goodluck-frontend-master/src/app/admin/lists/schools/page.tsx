"use client";

import { useState, useEffect } from "react";
import { Search, School, MapPin, Users, Phone, Mail, Eye, Edit, Trash2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { School as SchoolType } from "@/types";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

export default function SchoolListPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");

  useEffect(() => {
    setSchools(schoolsData as SchoolType[]);
    setFilteredSchools(schoolsData as SchoolType[]);
  }, []);

  useEffect(() => {
    let filtered = schools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (school) =>
          school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((school) => school.city === cityFilter);
    }

    // Board filter
    if (boardFilter !== "all") {
      filtered = filtered.filter((school) => school.board === boardFilter);
    }

    setFilteredSchools(filtered);
  }, [searchQuery, cityFilter, boardFilter, schools]);

  // Get unique cities and boards for filters
  const cities = Array.from(new Set(schools.map((s) => s.city))).sort();
  const boards = Array.from(new Set(schools.map((s) => s.board))).sort();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="School List"
          description={`Complete list of ${schools.length} schools`}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
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

              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards.map((board) => (
                    <SelectItem key={board} value={board}>
                      {board}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-muted-foreground">
                {filteredSchools.length} schools found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools Table */}
        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px] text-center font-semibold">Sr. No.</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">School Name</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">School ID</TableHead>
                    <TableHead className="min-w-[100px] font-semibold">Board</TableHead>
                    <TableHead className="text-right min-w-[100px] font-semibold">Strength</TableHead>
                    <TableHead className="min-w-[140px] font-semibold">Contact</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">Email</TableHead>
                    <TableHead className="text-center min-w-[80px] font-semibold">Visits</TableHead>
                    <TableHead className="min-w-[280px] font-semibold">Address</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">State</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">City</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">Station</TableHead>
                    <TableHead className="text-right min-w-[130px] font-semibold">Sales Target</TableHead>
                    <TableHead className="text-right min-w-[130px] font-semibold">Try to Prescribe</TableHead>
                    <TableHead className="text-center min-w-[120px] font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                        No schools found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school, index) => {
                      // Count visits for this school
                      const schoolVisits = visitsData.filter(
                        (v) => v.schoolId === school.id && v.type === "school"
                      ).length;

                      // Get contact info
                      const defaultPhone = "+91 9876543210";
                      const defaultEmail = `${school.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`;
                      const contact = school.contacts && school.contacts.length > 0
                        ? school.contacts[0]
                        : { name: "Principal", phone: defaultPhone, email: defaultEmail };

                      // Generate random sales target and try to prescribe
                      const salesTarget = Math.floor(Math.random() * 500000) + 100000;
                      const tryToPrescribe = Math.floor(Math.random() * 50) + 10;

                      return (
                        <TableRow key={school.id} className="hover:bg-muted/30">
                          <TableCell className="text-center font-medium">{index + 1}</TableCell>
                          <TableCell className="font-semibold">{school.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {school.id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-medium">
                              {school.board}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {school.strength.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm">{contact.phone || defaultPhone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate max-w-[190px]" title={contact.email || defaultEmail}>
                                {contact.email || defaultEmail}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={schoolVisits > 0 ? "default" : "secondary"}
                              className="min-w-[40px] justify-center"
                            >
                              {schoolVisits}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <span className="text-sm line-clamp-2">{school.address}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{school.state}</TableCell>
                          <TableCell className="font-medium">{school.city}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {school.station || school.city}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{(salesTarget / 1000).toFixed(0)}K
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {tryToPrescribe}
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit School
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove School
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
