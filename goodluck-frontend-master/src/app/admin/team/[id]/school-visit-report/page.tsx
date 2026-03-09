"use client";

import { useState, useEffect, useMemo } from "react";
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
  TrendingUp,
  TrendingDown,
  Edit2,
  BarChart2,
  PieChart as PieChartIcon,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

interface SchoolVisit {
  id: string;
  srNo: number;
  date: string;
  time: string;
  day: string;
  schoolName: string;
  schoolCity: string;
  board: string;
  strength: number;
  contactPerson: string;
  contactNo: string;
  purpose: string;
  supplyThrough: string;
  specimenGiven: number;
  specimenRequired: number;
  paymentGL: number;
  paymentVP: number;
  jointWorking: string;
  schoolComment: string;
  yourComment: string;
}

// Generate enhanced visit data
const generateSchoolVisitData = (salesmanId: string): SchoolVisit[] => {
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
      jointWorking: Math.random() > 0.7 ? "Yes" : "No",
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
  }).filter(Boolean) as SchoolVisit[];
};

export default function SchoolVisitReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [visitData, setVisitData] = useState<SchoolVisit[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SchoolVisit | null>(null);

  // Date Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);
        const visits = generateSchoolVisitData(salesmanId);
        setVisitData(visits);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  const filteredData = useMemo(() => {
    let data = [...visitData];
    if (dateFrom) {
      data = data.filter(d => d.date >= dateFrom);
    }
    if (dateTo) {
      data = data.filter(d => d.date <= dateTo);
    }
    return data;
  }, [visitData, dateFrom, dateTo]);


  const columns: GridColumn[] = [
    { key: "srNo", header: "Sr. No.", width: 70, type: "number", align: "center" },
    { key: "date", header: "Date", width: 130, type: "date" },
    { key: "time", header: "Time", width: 100 },
    { key: "day", header: "Day", width: 110 },
    { key: "jointWorking", header: "Joint Working", width: 120, type: "badge" },
    { key: "schoolName", header: "School Name", width: 250 },
    { key: "schoolCity", header: "City", width: 150 },
    { key: "board", header: "Board", width: 100, type: "badge" },
    { key: "strength", header: "Strength", width: 100, type: "number", align: "right" },
    { key: "contactPerson", header: "Contact Person", width: 180 },
    { key: "contactNo", header: "Contact No.", width: 150 },
    { key: "purpose", header: "Purpose", width: 180, type: "badge" },
    { key: "supplyThrough", header: "Supply Through", width: 150, type: "badge" },
    { key: "specimenGiven", header: "Specimen Given", width: 130, type: "number", align: "right" },
    { key: "specimenRequired", header: "Specimen Required", width: 140, type: "number", align: "right" },
    { key: "paymentGL", header: "Payment GL", width: 120, type: "number", align: "right" },
    { key: "paymentVP", header: "Payment VP", width: 120, type: "number", align: "right" },
    { key: "schoolComment", header: "School Comment", width: 250 },
    { key: "yourComment", header: "Your Comment", width: 250 },
  ];

  const handleDelete = (visit: any) => {
    setVisitData(prev => prev.filter(v => v.id !== visit.id));
    toast.success("Visit record deleted");
  };

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;
  if (!salesman) return (
    <PageContainer>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
        <Link href="/admin/team">
          <Button><ArrowLeft className="h-4 w-4 mr-2" /> Back to Team</Button>
        </Link>
      </div>
    </PageContainer>
  );

  const totalSpecimen = filteredData.reduce((sum, item) => sum + item.specimenGiven, 0);
  const totalGL = filteredData.reduce((sum, item) => sum + item.paymentGL, 0);
  const totalVP = filteredData.reduce((sum, item) => sum + item.paymentVP, 0);

  const extraViews = [
    {
      key: "charts",
      label: "Analytics",
      icon: <BarChart2 className="h-3.5 w-3.5" />,
      render: (data: SchoolVisit[]) => {
        const visitsByDate: Record<string, number> = {};
        data.forEach((v: SchoolVisit) => {
          const d = new Date(v.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' });
          visitsByDate[d] = (visitsByDate[d] || 0) + 1;
        });
        const barData = Object.entries(visitsByDate).map(([name, count]) => ({ name, count }));

        const purposes: Record<string, number> = {};
        data.forEach((v: SchoolVisit) => {
          purposes[v.purpose] = (purposes[v.purpose] || 0) + 1;
        });
        const COLORS = ["#f97316", "#fbbf24", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#6366f1"];
        const pieData = Object.entries(purposes).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 min-h-[400px]">
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight">Visit Frequency</CardTitle>
                  <p className="text-[10px] text-muted-foreground">Number of school visits by date</p>
                </div>
                <BarChart2 className="h-4 w-4 text-primary opacity-50" />
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                    <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-muted/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight">Visit Purposes</CardTitle>
                  <p className="text-[10px] text-muted-foreground">Distribution of visit activities</p>
                </div>
                <PieChartIcon className="h-4 w-4 text-amber-500 opacity-50" />
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
      }
    }
  ];

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`School Visit Report of ${salesman.name}`}
          description={`Detailed school visit tracking for ${salesman.name}`}
          action={<Button><Plus className="h-4 w-4 mr-2" /> Add Visit</Button>}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <SchoolIcon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{filteredData.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Visits</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <BarChart2 className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{totalSpecimen}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Specimen Given</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">₹{(totalGL / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-0.5">Payment GL</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">₹{(totalVP / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-0.5">Payment VP</p>
          </CardContent>
        </Card>
      </div>

      <DataGrid
        data={filteredData}
        columns={columns}
        title="School Visit Records"
        showStats={true}
        onExport={(data) => toast.success(`Exporting ${data.length} records to Excel`)}
        extraViews={extraViews}
        toolbar={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-1.5">Date Filter:</span>
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onFromChange={setDateFrom}
                onToChange={setDateTo}
                className="bg-transparent border-0 shadow-none hover:bg-transparent"
              />
            </div>
          </div>
        }
        rowActions={(row) => [
          {
            label: "Edit",
            icon: <Edit2 className="h-3.5 w-3.5" />,
            onClick: (row) => toast.info(`Editing visit to ${row.schoolName}`),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-3.5 w-3.5" />,
            danger: true,
            onClick: (row) => setDeleteTarget(row),
          }
        ]}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        itemName={deleteTarget ? `Visit to ${deleteTarget.schoolName}` : ""}
        contextLabel={deleteTarget ? `on ${new Date(deleteTarget.date).toLocaleDateString()}` : undefined}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </PageContainer>
  );
}
