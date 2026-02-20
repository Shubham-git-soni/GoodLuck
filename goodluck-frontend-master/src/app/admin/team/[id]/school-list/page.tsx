"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  School as SchoolIcon,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

// Generate enhanced school data with additional fields
const generateEnhancedSchoolData = (schools: any[], salesmanId: string) => {
  return schools.map((school, index) => {
    // Count visits for this school by this salesman
    const schoolVisits = visitsData.filter(
      (v) => v.salesmanId === salesmanId && v.schoolId === school.id && v.type === "school"
    );

    return {
      srNo: index + 1,
      schoolId: school.id,
      schoolName: school.name,
      board: school.board,
      strength: school.strength,
      contact: school.phone || `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: school.email || `${school.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`,
      visits: schoolVisits.length,
      address: school.address,
      state: school.state,
      city: school.city,
      station: school.station || school.city,
      salesTarget: Math.floor(Math.random() * 500000) + 100000,
      tryToPrescribe: Math.floor(Math.random() * 50) + 10,
    };
  });
};

export default function SchoolListPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [schoolListData, setSchoolListData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Get assigned schools and enhance with additional data
        const assignedSchools = schoolsData.filter(
          (s) => s.assignedTo === foundSalesman.name
        );
        const enhancedData = generateEnhancedSchoolData(assignedSchools, salesmanId);
        setSchoolListData(enhancedData);
        setFilteredData(enhancedData);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...schoolListData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.schoolId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Board filter
    if (boardFilter !== "all") {
      filtered = filtered.filter((item) => item.board === boardFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((item) => item.city === cityFilter);
    }

    setFilteredData(filtered);
  }, [searchQuery, boardFilter, cityFilter, schoolListData]);

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

  // Calculate summary statistics
  const totalSchools = filteredData.length;
  const totalVisits = filteredData.reduce((sum, item) => sum + item.visits, 0);
  const totalTarget = filteredData.reduce((sum, item) => sum + item.salesTarget, 0);
  const totalTryToPrescribe = filteredData.reduce(
    (sum, item) => sum + item.tryToPrescribe,
    0
  );

  // Get unique boards and cities for filters
  const boards = Array.from(new Set(schoolListData.map((item) => item.board))).sort();
  const cities = Array.from(new Set(schoolListData.map((item) => item.city))).sort();

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
          title={`School List of ${salesman.name}`}
          description={`Complete list of schools assigned to ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Schools</p>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalSchools}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
            <p className="text-2xl font-bold">{totalVisits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {totalSchools > 0 ? (totalVisits / totalSchools).toFixed(1) : 0} per school
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Sales Target</p>
            </div>
            <p className="text-2xl font-bold">₹{(totalTarget / 100000).toFixed(1)}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Try to Prescribe</p>
            </div>
            <p className="text-2xl font-bold">{totalTryToPrescribe}</p>
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
                  placeholder="Search by school name, ID, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by board" />
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

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            School List ({filteredData.length} schools)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Sr. No.</TableHead>
                  <TableHead className="min-w-[200px]">School Name</TableHead>
                  <TableHead className="min-w-[120px]">School ID</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead className="text-right">Strength</TableHead>
                  <TableHead className="min-w-[130px]">Contact</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                  <TableHead className="min-w-[200px]">Address</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead className="text-right min-w-[120px]">Sales Target</TableHead>
                  <TableHead className="text-right">Try to Prescribe</TableHead>
                  <TableHead className="text-center min-w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                      No schools found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.schoolId}>
                      <TableCell className="font-medium">{item.srNo}</TableCell>
                      <TableCell className="font-medium">{item.schoolName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.schoolId}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.board}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.strength}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {item.contact}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {item.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.visits > 0 ? "default" : "secondary"}>
                          {item.visits}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={item.address}>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.state}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.station}</TableCell>
                      <TableCell className="text-right">
                        ₹{(item.salesTarget / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell className="text-right">{item.tryToPrescribe}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                  <p className="text-muted-foreground">Total Schools</p>
                  <p className="font-bold text-lg">{totalSchools}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Visits</p>
                  <p className="font-bold text-lg">{totalVisits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Sales Target</p>
                  <p className="font-bold text-lg">₹{(totalTarget / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Try to Prescribe</p>
                  <p className="font-bold text-lg">{totalTryToPrescribe}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
