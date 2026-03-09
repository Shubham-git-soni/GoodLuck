"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  School as SchoolIcon,
  Download,
  Calendar,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Users,
  Target,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MultipleVisitRow {
  id: string;
  srNo: number;
  schoolId: string;
  schoolName: string;
  board: string;
  strength: number;
  address: string;
  city: string;
  noOfVisits: number;
  date: string;
  purpose: string;
  jointWorking: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  supplyThrough: string;
  specimenGiven: number;
  specimenRequired: number;
  schoolComment: string;
  yourComment: string;
  visitIndex: number;
}

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateMultipleVisitData = (salesmanId: string): MultipleVisitRow[] => {
  const supplyThrough = ["Direct", "Bookseller", "Distributor", "Regional Office"];
  const purposes = ["New Adoption", "Renewal", "Follow-up", "Relationship Building", "Specimen Distribution"];

  const salesmanVisits = visitsData.filter(
    (v) => v.salesmanId === salesmanId && v.type === "school"
  );

  const schoolVisitMap = new Map<string, any[]>();
  salesmanVisits.forEach((visit) => {
    if (visit.schoolId) {
      if (!schoolVisitMap.has(visit.schoolId)) {
        schoolVisitMap.set(visit.schoolId, []);
      }
      schoolVisitMap.get(visit.schoolId)?.push(visit);
    }
  });

  const reportRows: MultipleVisitRow[] = [];
  let globalSrNo = 1;

  Array.from(schoolVisitMap.entries())
    .filter(([_, visits]) => visits.length >= 2)
    .sort((a, b) => b[1].length - a[1].length) // Sort by number of visits
    .forEach(([schoolId, visits]) => {
      const school = schoolsData.find((s) => s.id === schoolId);
      if (!school) return;

      const sortedVisits = [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      sortedVisits.forEach((visit, vIdx) => {
        const defaultPhone = "+91 9876543210";
        const defaultEmail = `${school.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@school.com`;
        const contact = school.contacts && school.contacts.length > 0
          ? school.contacts[0]
          : { name: "Principal", phone: defaultPhone, email: defaultEmail };

        reportRows.push({
          id: `${visit.id}-${vIdx}`,
          srNo: globalSrNo,
          schoolId: school.id,
          schoolName: school.name,
          board: school.board,
          strength: school.strength,
          address: school.address,
          city: school.city,
          noOfVisits: visits.length,
          date: visit.date,
          purpose: purposes[Math.floor(Math.random() * purposes.length)],
          jointWorking: Math.random() > 0.7 ? "Yes" : "No",
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
          visitIndex: vIdx,
        });
      });
      globalSrNo++;
    });

  return reportRows;
};

export default function MultipleVisitReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [reportData, setReportData] = useState<MultipleVisitRow[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);
        setReportData(generateMultipleVisitData(salesmanId));
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  const filteredData = useMemo(() => {
    return [...reportData];
  }, [reportData]);

  const stats = useMemo(() => {
    const schools = new Set(filteredData.map(d => d.schoolId));
    const totalVisits = filteredData.length;
    const totalSpecimen = filteredData.reduce((sum, d) => sum + d.specimenGiven, 0);
    const avgVisits = schools.size > 0 ? (totalVisits / schools.size).toFixed(1) : "0";

    return {
      totalSchools: schools.size,
      totalVisits,
      totalSpecimen,
      avgVisits
    };
  }, [filteredData]);

  const columns: GridColumn<MultipleVisitRow>[] = [
    {
      key: "srNo",
      header: "Sr. No.",
      width: 60,
      align: "center",
      pinned: "left",
      render: (v, row) => row.visitIndex === 0 ? <span className="font-semibold text-primary">{v}</span> : ""
    },
    {
      key: "schoolName",
      header: "School Name",
      width: 250,
      pinned: "left",
      render: (v, row) => row.visitIndex === 0 ? <span className="font-bold text-sm">{v}</span> : ""
    },
    {
      key: "schoolId",
      header: "School ID",
      width: 100,
      render: (v, row) => row.visitIndex === 0 ? <Badge variant="outline" className="text-[10px]">{v}</Badge> : ""
    },
    {
      key: "board",
      header: "School Board",
      width: 120,
      render: (v, row) => row.visitIndex === 0 ? <Badge variant="secondary" className="text-[10px]">{v}</Badge> : ""
    },
    {
      key: "strength",
      header: "School Strength",
      width: 130,
      align: "center",
      render: (v, row) => row.visitIndex === 0 ? <span className="text-xs text-muted-foreground font-medium">{v}</span> : ""
    },
    {
      key: "address",
      header: "School Address",
      width: 250,
      render: (v, row) => row.visitIndex === 0 ? <p className="text-[11px] text-muted-foreground truncate" title={v as string}>{v}</p> : ""
    },
    {
      key: "city",
      header: "School City",
      width: 120,
      render: (v, row) => row.visitIndex === 0 ? <span className="text-xs">{v}</span> : ""
    },
    {
      key: "noOfVisits",
      header: "No. of Visits",
      width: 110,
      align: "center",
      render: (v, row) => row.visitIndex === 0 ? <Badge className="bg-primary/10 text-primary border-primary/20">{v}</Badge> : ""
    },
    {
      key: "date",
      header: "Date",
      width: 110,
      render: (v) => <span className="text-xs font-medium">{new Date(v as string).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
    },
    {
      key: "purpose",
      header: "Purpose",
      width: 150,
      render: (v) => <span className="text-xs">{v}</span>
    },
    {
      key: "jointWorking",
      header: "Joint Working",
      width: 110,
      align: "center",
      render: (v) => v === "Yes" ? <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200">Yes</Badge> : <span className="text-muted-foreground/30">—</span>
    },
    {
      key: "contactName",
      header: "Contact Info",
      width: 180,
      render: (_, row) => (
        <div className="flex flex-col text-[11px]">
          <span className="font-semibold">{row.contactName}</span>
          <span className="text-muted-foreground tracking-tight">{row.contactPhone}</span>
        </div>
      )
    },
    {
      key: "supplyThrough",
      header: "Supply Through",
      width: 130,
      render: (v) => <span className="text-[11px] text-muted-foreground">{v}</span>
    },
    {
      key: "specimenGiven",
      header: "Specimen Given",
      width: 120,
      align: "center"
    },
    {
      key: "specimenRequired",
      header: "Specimen Required",
      width: 140,
      align: "center"
    },
    {
      key: "schoolComment",
      header: "School Comment",
      width: 250,
      render: (v) => <p className="text-[11px] text-muted-foreground italic line-clamp-1">{v}</p>
    },
    {
      key: "yourComment",
      header: "Your Comment",
      width: 250,
      render: (v) => <p className="text-[11px] font-medium line-clamp-1">{v}</p>
    },
  ];

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

  if (!salesman) return (
    <PageContainer>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
        <Button asChild><Link href="/admin/team">Back to Team</Link></Button>
      </div>
    </PageContainer>
  );

  return (
    <PageContainer>
      {/* Reference from school-visit-report: Simple header */}
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`Multiple Visit Report of ${salesman.name}`}
          description={`Comprehensive report of schools visited 2 or more times by ${salesman.name}`}
        />
      </div>

      {/* Reference from school-visit-report: Gradient cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <SchoolIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{stats.totalSchools}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Partner Schools</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{stats.totalVisits}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Visits</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{stats.totalSpecimen}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Specimen Given</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{stats.avgVisits}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Visits/School</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Grid */}
      <DataGrid
        data={filteredData}
        columns={columns}
        title="School Interaction Log"
        rowKey="id"
        showStats={true}
        onExport={(data) => toast.success(`Exporting ${data.length} records to Excel`)}
        className="border shadow-sm"
      />
    </PageContainer>
  );
}
