"use client";

import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  Clock,
  Plus,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Edit2,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import visitsData from "@/lib/mock-data/visits.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BooksellerVisit {
  id: string;
  srNo: number;
  date: string;
  time: string;
  day: string;
  booksellerName: string;
  contactNo: string;
  email: string;
  address: string;
  city: string;
  purpose: string;
  paymentGL: number;
  paymentVP: number;
  remarks: string;
  jointWorking: string;
  specimenGiven: number;
}

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateBooksellerVisitData = (salesmanId: string): BooksellerVisit[] => {
  const booksellers = [
    { name: "Kitab Mahal - Mumbai", city: "Mumbai", phone: "+91 9876543210", email: "kitabmahal@bookstore.com", address: "123 Main Road, Andheri" },
    { name: "Crossword Bookstore - Delhi", city: "Delhi", phone: "+91 9876543211", email: "crossword@bookstore.com", address: "45 CP Market, Connaught Place" },
    { name: "Sapna Book House - Bangalore", city: "Bangalore", phone: "+91 9876543212", email: "sapna@bookstore.com", address: "78 MG Road, Brigade Road" },
    { name: "Landmark Books - Chennai", city: "Chennai", phone: "+91 9876543213", email: "landmark@bookstore.com", address: "56 Anna Salai, T Nagar" },
    { name: "Odyssey Books - Hyderabad", city: "Hyderabad", phone: "+91 9876543214", email: "odyssey@bookstore.com", address: "89 Banjara Hills" },
    { name: "Higginbothams - Chennai", city: "Chennai", phone: "+91 9876543215", email: "higginbothams@bookstore.com", address: "12 Mount Road" },
    { name: "Current Books - Mumbai", city: "Mumbai", phone: "+91 9876543216", email: "current@bookstore.com", address: "34 SV Road, Malad" },
    { name: "Scholar's Choice - Pune", city: "Pune", phone: "+91 9876543217", email: "scholars@bookstore.com", address: "67 FC Road, Deccan" },
  ];

  const purposes = [
    "Order Collection",
    "Payment Collection",
    "New Book Introduction",
    "Stock Check",
    "Relationship Building",
    "Complaint Resolution",
    "Promotional Activity",
    "Follow-up",
  ];

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const booksellerVisits = visitsData.filter(
    (v) => v.salesmanId === salesmanId && v.type === "bookseller"
  );

  return booksellerVisits.map((visit, index) => {
    const bookseller = booksellers[Math.floor(Math.random() * booksellers.length)];
    const visitDate = new Date(visit.date);
    const dayOfWeek = daysOfWeek[visitDate.getDay()];

    const hour = 9 + Math.floor(Math.random() * 8);
    const minute = Math.floor(Math.random() * 60);
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    return {
      id: `BV${String(index + 1).padStart(3, "0")}`,
      srNo: index + 1,
      date: visit.date,
      time,
      day: dayOfWeek,
      booksellerName: bookseller.name,
      contactNo: bookseller.phone,
      email: bookseller.email,
      address: bookseller.address,
      city: bookseller.city,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      paymentGL: Math.floor(Math.random() * 80000) + 20000,
      paymentVP: Math.floor(Math.random() * 50000) + 10000,
      jointWorking: Math.random() > 0.8 ? "Yes" : "No",
      specimenGiven: Math.floor(Math.random() * 20),
      remarks: [
        "Good response, confirmed order for next month",
        "Payment collected successfully",
        "New books introduced, awaiting feedback",
        "Stock levels adequate, no immediate requirement",
        "Building relationship, scheduled next visit",
        "Complaint resolved, customer satisfied",
        "Promotional materials distributed",
        "Follow-up on pending order, expected delivery next week",
      ][Math.floor(Math.random() * 8)],
    };
  });
};

export default function BooksellerVisitReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [visitData, setVisitData] = useState<BooksellerVisit[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BooksellerVisit | null>(null);

  // Date Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);
        const visits = generateBooksellerVisitData(salesmanId);
        setVisitData(visits);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  const filteredData = useMemo(() => {
    let data = [...visitData];
    if (dateFrom) data = data.filter((v) => v.date >= dateFrom);
    if (dateTo) data = data.filter((v) => v.date <= dateTo);
    return data;
  }, [visitData, dateFrom, dateTo]);

  const handleDelete = (visit: BooksellerVisit) => {
    setVisitData((prev) => prev.filter((v) => v.id !== visit.id));
    setDeleteTarget(null);
    toast.success(`Visit to ${visit.booksellerName} deleted`);
  };

  const columns: GridColumn<BooksellerVisit>[] = [
    { key: "srNo", header: "Sr. No.", width: 70, align: "center", pinned: "left" },
    {
      key: "date",
      header: "Date",
      width: 120,
      type: "date",
      render: (v) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{new Date(v as string).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      key: "time",
      header: "Time",
      width: 90,
      render: (v) => (
        <div className="flex items-center gap-1.5 opacity-80">
          <Clock className="h-3 w-3" />
          <span className="text-[11px] tabular-nums tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: "day",
      header: "Day",
      width: 100,
      render: (v) => <Badge variant="outline" className="text-[10px] font-medium bg-muted/30">{v}</Badge>
    },
    {
      key: "jointWorking",
      header: "Joint Working",
      width: 120,
      align: "center",
      render: (v) => v === "Yes" ? (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">Joint</Badge>
      ) : <span className="text-muted-foreground/30">—</span>
    },
    { key: "booksellerName", header: "Book Seller", width: 220, pinned: "left" },
    {
      key: "contactNo",
      header: "Contact Info",
      width: 200,
      render: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium tracking-tight whitespace-nowrap">{row.contactNo}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[150px]">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: "address",
      header: "Address",
      width: 250,
      render: (v) => (
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground/80 leading-relaxed">
          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{v}</span>
        </div>
      )
    },
    {
      key: "city",
      header: "City",
      width: 120,
      render: (v) => <span className="text-sm font-medium">{v}</span>
    },
    { 
      key: "purpose", 
      header: "Purpose", 
      width: 180,
      render: (v) => <Badge variant="secondary" className="font-normal text-[11px]">{v}</Badge>
    },
    { 
      key: "specimenGiven", 
      header: "Specimen Given", 
      width: 130, 
      align: "center",
      render: (v) => <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">{v}</Badge>
    },
    {
      key: "paymentGL",
      header: "Payment GL",
      width: 120,
      align: "right",
      type: "number",
      render: (v) => <span className="font-bold text-primary">₹{(Number(v) / 1000).toFixed(1)}K</span>
    },
    {
      key: "paymentVP",
      header: "Payment VP",
      width: 120,
      align: "right",
      type: "number",
      render: (v) => <span className="font-bold opacity-70">₹{(Number(v) / 1000).toFixed(1)}K</span>
    },
    {
      key: "remarks",
      header: "Remarks",
      width: 250,
      render: (v) => <p className="text-xs text-muted-foreground line-clamp-2 italic">"{v}"</p>
    },
  ];

  const totalGL = useMemo(() => filteredData.reduce((sum, item) => sum + item.paymentGL, 0), [filteredData]);
  const totalVP = useMemo(() => filteredData.reduce((sum, item) => sum + item.paymentVP, 0), [filteredData]);
  const uniqueBooksellers = useMemo(() => new Set(filteredData.map(v => v.booksellerName)).size, [filteredData]);

  const extraViews = [
    {
      key: "charts",
      label: "Analytics",
      icon: <BarChart2 className="h-3.5 w-3.5" />,
      render: (data: BooksellerVisit[]) => {
        const visitsByDate: Record<string, number> = {};
        data.forEach((v) => {
          const d = new Date(v.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' });
          visitsByDate[d] = (visitsByDate[d] || 0) + 1;
        });
        const barData = Object.entries(visitsByDate).map(([name, count]) => ({ name, count }));

        const purposes: Record<string, number> = {};
        data.forEach((v) => {
          purposes[v.purpose] = (purposes[v.purpose] || 0) + 1;
        });
        const COLORS = ["#f97316", "#fbbf24", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#6366f1"];
        const pieData = Object.entries(purposes).map(([name, value]) => ({ name, value }));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl border border-border/50">
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Visit Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="oklch(0.66 0.20 45)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-amber-500" />
                  Visit Purpose Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={260}>
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
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

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
          title={`Bookseller Visit Report of ${salesman.name}`}
          description={`Detailed bookseller visit records for ${salesman.name}`}
          action={<Button><Plus className="h-4 w-4 mr-2" /> Add Visit</Button>}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
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
                <Store className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{uniqueBooksellers}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Unique Shops</p>
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

      {/* Main Data Grid */}
      <DataGrid
        data={filteredData}
        columns={columns}
        title="Bookseller Interaction Records"
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
            onClick: (row) => toast.info(`Editing visit to ${row.booksellerName}`),
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
        itemName={deleteTarget ? `Visit to ${deleteTarget.booksellerName}` : ""}
        contextLabel={deleteTarget ? `on ${new Date(deleteTarget.date).toLocaleDateString()}` : undefined}
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </PageContainer>
  );
}
