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
  Calendar,
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
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

// Generate multiple visit report data
const generateMultipleVisitData = (salesmanId: string) => {
  const supplyThrough = ["Direct", "Bookseller", "Distributor", "Regional Office"];

  // Get schools visited by this salesman
  const salesmanVisits = visitsData.filter(
    (v) => v.salesmanId === salesmanId && v.type === "school"
  );

  // Group visits by school
  const schoolVisitMap = new Map();
  salesmanVisits.forEach((visit) => {
    if (!schoolVisitMap.has(visit.schoolId)) {
      schoolVisitMap.set(visit.schoolId, []);
    }
    schoolVisitMap.get(visit.schoolId).push(visit);
  });

  // Filter schools with multiple visits (2 or more)
  const multipleVisitSchools = Array.from(schoolVisitMap.entries())
    .filter(([_, visits]) => visits.length >= 2)
    .map(([schoolId, visits], index) => {
      const school = schoolsData.find((s) => s.id === schoolId);
      if (!school) return null;

      // Get all visit dates
      const visitDates = visits.map((v: any) => v.date).sort();
      const latestVisit = visitDates[visitDates.length - 1];

      // Get random contact person
      const defaultPhone = "+91 9876543210";
      const defaultEmail = `${school.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`;
      const contact = school.contacts && school.contacts.length > 0
        ? school.contacts[0]
        : { name: "Principal", phone: defaultPhone, email: defaultEmail };

      return {
        srNo: index + 1,
        schoolId: school.id,
        schoolName: school.name,
        board: school.board,
        strength: school.strength,
        address: school.address,
        city: school.city,
        noOfVisits: visits.length,
        date: latestVisit,
        contactName: contact.name,
        contactPhone: contact.phone || defaultPhone,
        contactEmail: contact.email || defaultEmail,
        supplyThrough: supplyThrough[Math.floor(Math.random() * supplyThrough.length)],
        specimenGiven: Math.floor(Math.random() * 40) + 10,
        specimenRequired: Math.floor(Math.random() * 50) + 15,
        schoolComment: [
          "Regular follow-ups appreciated, interested in expanding book list",
          "Good response on previous visits, need more specimen copies",
          "Payment pending from last order, will clear next month",
          "Very satisfied with multiple visits and support",
          "Requesting priority delivery for next academic session",
          "Multiple meetings helped in building trust and relationship",
        ][Math.floor(Math.random() * 6)],
        yourComment: [
          "Consistent engagement, high potential for sales growth",
          "Multiple visits building strong relationship",
          "School showing interest, need regular follow-up",
          "Payment collection pending, maintain contact",
          "Excellent response, should continue frequent visits",
          "Strong prospect, schedule more visits next month",
        ][Math.floor(Math.random() * 6)],
      };
    })
    .filter(Boolean);

  return multipleVisitSchools;
};

export default function MultipleVisitReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);
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

        // Generate multiple visit report data
        const data = generateMultipleVisitData(salesmanId);
        setReportData(data);
        setFilteredData(data);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...reportData];

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
  }, [searchQuery, boardFilter, cityFilter, reportData]);

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
  const totalVisits = filteredData.reduce((sum, item) => sum + item.noOfVisits, 0);
  const avgVisitsPerSchool = totalSchools > 0 ? (totalVisits / totalSchools).toFixed(1) : 0;
  const totalSpecimenGiven = filteredData.reduce((sum, item) => sum + item.specimenGiven, 0);

  // Get unique boards and cities for filters
  const boards = Array.from(new Set(reportData.map((item) => item.board))).sort();
  const cities = Array.from(new Set(reportData.map((item) => item.city))).sort();

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
          title={`Multiple Visit Report of ${salesman.name}`}
          description={`Schools with multiple visits by ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Schools with Multiple Visits</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Visits/School</p>
            </div>
            <p className="text-2xl font-bold">{avgVisitsPerSchool}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Specimen Given</p>
            </div>
            <p className="text-2xl font-bold">{totalSpecimenGiven}</p>
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
        </CardContent>
      </Card>

      {/* Multiple Visit Report Table */}
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
                  <TableHead className="min-w-[180px]">Board & Strength</TableHead>
                  <TableHead className="min-w-[250px]">School Address</TableHead>
                  <TableHead className="min-w-[120px]">City</TableHead>
                  <TableHead className="text-center min-w-[100px]">No. of Visits</TableHead>
                  <TableHead className="min-w-[110px]">Latest Visit Date</TableHead>
                  <TableHead className="min-w-[200px]">Contact Info</TableHead>
                  <TableHead className="min-w-[130px]">Supply Through</TableHead>
                  <TableHead className="text-right">Specimen Given</TableHead>
                  <TableHead className="text-right">Specimen Required</TableHead>
                  <TableHead className="min-w-[250px]">School Comment</TableHead>
                  <TableHead className="min-w-[250px]">Your Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      No schools with multiple visits found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <TableRow key={item.schoolId}>
                        <TableCell className="font-medium">{item.srNo}</TableCell>
                        <TableCell className="font-medium">{item.schoolName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.schoolId}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary">{item.board}</Badge>
                            <p className="text-sm text-muted-foreground">
                              Strength: {item.strength}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.city}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-blue-600">
                            {item.noOfVisits} visits
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formattedDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">{item.contactName}</p>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {item.contactPhone}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{item.contactEmail}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.supplyThrough}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="bg-green-600">
                            {item.specimenGiven}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.specimenRequired}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.schoolComment}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.yourComment}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                  <p className="text-muted-foreground">Average Visits/School</p>
                  <p className="font-bold text-lg">{avgVisitsPerSchool}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Specimen Given</p>
                  <p className="font-bold text-lg">{totalSpecimenGiven}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
