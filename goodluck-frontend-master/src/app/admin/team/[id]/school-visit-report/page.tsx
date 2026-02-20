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
  Edit,
  Trash2,
  Phone,
  Calendar,
  Clock,
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
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

// Generate enhanced visit data
const generateSchoolVisitData = (salesmanId: string) => {
  const purposes = [
    "New Adoption",
    "Renewal",
    "Specimen Distribution",
    "Follow-up",
    "Complaint Resolution",
    "Payment Collection",
    "Relationship Building",
    "Introduction",
  ];

  const supplyThrough = ["Direct", "Bookseller", "Distributor", "Regional Office"];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get actual visits from mock data
  const salesmanVisits = visitsData.filter(
    (v) => v.salesmanId === salesmanId && v.type === "school"
  );

  return salesmanVisits.map((visit, index) => {
    const school = schoolsData.find((s) => s.id === visit.schoolId);
    if (!school) return null;

    const visitDate = new Date(visit.date);
    const dayOfWeek = daysOfWeek[visitDate.getDay()];

    // Generate random time
    const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
    const minute = Math.floor(Math.random() * 60);
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    // Get random contact person from school
    const defaultPhone = "+91 9876543210";
    const contactPerson = school.contacts && school.contacts.length > 0
      ? school.contacts[Math.floor(Math.random() * school.contacts.length)]
      : { name: "Principal", phone: defaultPhone };

    return {
      id: `SV${String(index + 1).padStart(3, "0")}`,
      srNo: index + 1,
      date: visit.date,
      time,
      day: dayOfWeek,
      schoolName: school.name,
      schoolCity: school.city,
      board: school.board,
      strength: school.strength,
      contactPerson: contactPerson.name,
      contactNo: contactPerson.phone || defaultPhone,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      supplyThrough: supplyThrough[Math.floor(Math.random() * supplyThrough.length)],
      specimenGiven: Math.floor(Math.random() * 30) + 5,
      specimenRequired: Math.floor(Math.random() * 40) + 10,
      paymentGL: Math.floor(Math.random() * 50000) + 10000,
      paymentVP: Math.floor(Math.random() * 30000) + 5000,
      schoolComment: [
        "Interested in new books for next session",
        "Need more specimen copies",
        "Payment pending, will clear next month",
        "Very satisfied with service",
        "Requesting discount for bulk order",
        "Need to schedule follow-up meeting",
      ][Math.floor(Math.random() * 6)],
      yourComment: [
        "Good response from school",
        "Follow-up required next week",
        "Payment collection pending",
        "New books introduced successfully",
        "School interested in VP series",
        "Need to send more specimens",
      ][Math.floor(Math.random() * 6)],
    };
  }).filter(Boolean);
};

export default function SchoolVisitReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [visitData, setVisitData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Generate visit data
        const visits = generateSchoolVisitData(salesmanId);
        setVisitData(visits);
        setFilteredData(visits);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...visitData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.schoolCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Board filter
    if (boardFilter !== "all") {
      filtered = filtered.filter((item) => item.board === boardFilter);
    }

    // Purpose filter
    if (purposeFilter !== "all") {
      filtered = filtered.filter((item) => item.purpose === purposeFilter);
    }

    setFilteredData(filtered);
  }, [searchQuery, boardFilter, purposeFilter, visitData]);

  const handleDelete = (visit: any) => {
    const updatedData = visitData.filter((v) => v.id !== visit.id);
    setVisitData(updatedData);

    toast({
      title: "Visit Deleted",
      description: `Visit to ${visit.schoolName} has been removed.`,
      variant: "destructive",
    });
  };

  const handleEdit = (visit: any) => {
    toast({
      title: "Edit Visit",
      description: `Opening edit form for visit to ${visit.schoolName}`,
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

  // Calculate summary statistics
  const totalVisits = filteredData.length;
  const totalSpecimenGiven = filteredData.reduce((sum, item) => sum + item.specimenGiven, 0);
  const totalPaymentGL = filteredData.reduce((sum, item) => sum + item.paymentGL, 0);
  const totalPaymentVP = filteredData.reduce((sum, item) => sum + item.paymentVP, 0);

  // Get unique boards and purposes for filters
  const boards = Array.from(new Set(visitData.map((item) => item.board))).sort();
  const purposes = Array.from(new Set(visitData.map((item) => item.purpose))).sort();

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
          title={`School Visit Report of ${salesman.name}`}
          description={`Detailed school visit records for ${salesman.name}`}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalVisits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Specimen Given</p>
            </div>
            <p className="text-2xl font-bold">{totalSpecimenGiven}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Payment GL</p>
            </div>
            <p className="text-2xl font-bold">₹{(totalPaymentGL / 100000).toFixed(1)}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Payment VP</p>
            </div>
            <p className="text-2xl font-bold">₹{(totalPaymentVP / 100000).toFixed(1)}L</p>
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
                  placeholder="Search by school name, city, or contact person..."
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

              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  {purposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
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
                Add Visit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Visit Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            School Visit Records ({filteredData.length} visits)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Sr. No.</TableHead>
                  <TableHead className="min-w-[110px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Time</TableHead>
                  <TableHead className="min-w-[100px]">Day</TableHead>
                  <TableHead className="min-w-[200px]">School Name</TableHead>
                  <TableHead className="min-w-[120px]">City</TableHead>
                  <TableHead className="min-w-[80px]">Board</TableHead>
                  <TableHead className="text-right">Strength</TableHead>
                  <TableHead className="min-w-[150px]">Contact Person</TableHead>
                  <TableHead className="min-w-[130px]">Contact No.</TableHead>
                  <TableHead className="min-w-[150px]">Purpose</TableHead>
                  <TableHead className="min-w-[130px]">Supply Through</TableHead>
                  <TableHead className="text-right">Specimen Given</TableHead>
                  <TableHead className="text-right">Specimen Required</TableHead>
                  <TableHead className="text-right min-w-[110px]">Payment GL</TableHead>
                  <TableHead className="text-right min-w-[110px]">Payment VP</TableHead>
                  <TableHead className="min-w-[200px]">School Comment</TableHead>
                  <TableHead className="min-w-[200px]">Your Comment</TableHead>
                  <TableHead className="w-[100px] text-center sticky right-0 bg-background">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8 text-muted-foreground">
                      No school visits found matching your criteria
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
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.srNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formattedDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {item.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.day}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{item.schoolName}</TableCell>
                        <TableCell>{item.schoolCity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.board}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.strength}</TableCell>
                        <TableCell>{item.contactPerson}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {item.contactNo}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.purpose}</Badge>
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
                        <TableCell className="text-right font-medium">
                          ₹{(item.paymentGL / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{(item.paymentVP / 1000).toFixed(1)}K
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.schoolComment}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.yourComment}
                          </p>
                        </TableCell>
                        <TableCell className="text-center sticky right-0 bg-background">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
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
                                  <AlertDialogTitle>Delete Visit</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the visit to{" "}
                                    <strong>{item.schoolName}</strong> on {formattedDate}? This
                                    action cannot be undone.
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
                          </div>
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
                  <p className="text-muted-foreground">Total Visits</p>
                  <p className="font-bold text-lg">{totalVisits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Specimen Given</p>
                  <p className="font-bold text-lg">{totalSpecimenGiven}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Payment GL</p>
                  <p className="font-bold text-lg">₹{(totalPaymentGL / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Payment VP</p>
                  <p className="font-bold text-lg">₹{(totalPaymentVP / 100000).toFixed(1)}L</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
