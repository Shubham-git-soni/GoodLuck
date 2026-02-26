"use client";

import { useState, useMemo } from "react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface SalesmanRow {
  id: string;
  name: string;
  state: string;
  region: string;
  totalVisits: number;
  schools: number;
  booksellers: number;
  revenue: number;
  attendance: number;
  status: "Active" | "Inactive" | "On Leave";
  joinDate: string;
  email: string;
  phone: string;
}

const DATA: SalesmanRow[] = [
  { id: "SM001", name: "Rajesh Kumar", state: "Delhi", region: "North", totalVisits: 142, schools: 98, booksellers: 44, revenue: 284000, attendance: 92, status: "Active", joinDate: "2022-03-15", email: "rajesh@crm.in", phone: "9810001111" },
  { id: "SM002", name: "Arjun Mehta", state: "Maharashtra", region: "West", totalVisits: 128, schools: 87, booksellers: 41, revenue: 256000, attendance: 88, status: "Active", joinDate: "2021-07-20", email: "arjun@crm.in", phone: "9820002222" },
  { id: "SM003", name: "Priya Sharma", state: "Karnataka", region: "South", totalVisits: 115, schools: 79, booksellers: 36, revenue: 230000, attendance: 95, status: "Active", joinDate: "2023-01-10", email: "priya@crm.in", phone: "9830003333" },
  { id: "SM004", name: "Vikram Singh", state: "Gujarat", region: "West", totalVisits: 98, schools: 65, booksellers: 33, revenue: 196000, attendance: 78, status: "Inactive", joinDate: "2020-11-05", email: "vikram@crm.in", phone: "9840004444" },
  { id: "SM005", name: "Sneha Reddy", state: "Telangana", region: "South", totalVisits: 134, schools: 91, booksellers: 43, revenue: 268000, attendance: 90, status: "Active", joinDate: "2022-08-22", email: "sneha@crm.in", phone: "9850005555" },
  { id: "SM006", name: "Amit Patel", state: "Rajasthan", region: "North", totalVisits: 89, schools: 58, booksellers: 31, revenue: 178000, attendance: 85, status: "On Leave", joinDate: "2021-04-14", email: "amit@crm.in", phone: "9860006666" },
  { id: "SM007", name: "Kavya Nair", state: "Kerala", region: "South", totalVisits: 156, schools: 108, booksellers: 48, revenue: 312000, attendance: 97, status: "Active", joinDate: "2022-12-01", email: "kavya@crm.in", phone: "9870007777" },
  { id: "SM008", name: "Ravi Gupta", state: "UP", region: "North", totalVisits: 72, schools: 48, booksellers: 24, revenue: 144000, attendance: 70, status: "Inactive", joinDate: "2019-06-30", email: "ravi@crm.in", phone: "9880008888" },
  { id: "SM009", name: "Ananya Joshi", state: "MP", region: "Central", totalVisits: 110, schools: 76, booksellers: 34, revenue: 220000, attendance: 91, status: "Active", joinDate: "2023-03-18", email: "ananya@crm.in", phone: "9890009999" },
  { id: "SM010", name: "Suresh Iyer", state: "Tamil Nadu", region: "South", totalVisits: 145, schools: 100, booksellers: 45, revenue: 290000, attendance: 93, status: "Active", joinDate: "2021-09-11", email: "suresh@crm.in", phone: "9800010000" },
  { id: "SM011", name: "Pooja Verma", state: "Bihar", region: "East", totalVisits: 67, schools: 44, booksellers: 23, revenue: 134000, attendance: 75, status: "Active", joinDate: "2023-06-05", email: "pooja@crm.in", phone: "9811011011" },
  { id: "SM012", name: "Deepak Rao", state: "Odisha", region: "East", totalVisits: 88, schools: 60, booksellers: 28, revenue: 176000, attendance: 82, status: "On Leave", joinDate: "2022-02-28", email: "deepak@crm.in", phone: "9822022022" },
  { id: "SM013", name: "Meera Pillai", state: "Goa", region: "West", totalVisits: 54, schools: 36, booksellers: 18, revenue: 108000, attendance: 80, status: "Active", joinDate: "2023-09-01", email: "meera@crm.in", phone: "9833033033" },
  { id: "SM014", name: "Kiran Sharma", state: "Haryana", region: "North", totalVisits: 121, schools: 83, booksellers: 38, revenue: 242000, attendance: 89, status: "Active", joinDate: "2021-12-15", email: "kiran@crm.in", phone: "9844044044" },
  { id: "SM015", name: "Lakshmi Devi", state: "Andhra Pradesh", region: "South", totalVisits: 138, schools: 95, booksellers: 43, revenue: 276000, attendance: 94, status: "Active", joinDate: "2022-05-20", email: "lakshmi@crm.in", phone: "9855055055" },
];

export default function GridDemoPage() {
  const [data, setData] = useState(DATA);
  const [selected, setSelected] = useState<SalesmanRow[]>([]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const active = data.filter((d) => d.status === "Active").length;
    const totalVisits = data.reduce((sum, d) => sum + d.totalVisits, 0);
    const totalSchools = data.reduce((sum, d) => sum + d.schools, 0);
    const totalBooksellers = data.reduce((sum, d) => sum + d.booksellers, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgAttendance = (data.reduce((sum, d) => sum + d.attendance, 0) / data.length).toFixed(1);
    const topPerformer = [...data].sort((a, b) => b.revenue - a.revenue)[0];

    return { active, totalVisits, totalSchools, totalBooksellers, totalRevenue, avgAttendance, topPerformer };
  }, [data]);

  // Enhanced columns - SIMPLE & PROFESSIONAL
  const COLUMNS: GridColumn<SalesmanRow>[] = [
    {
      key: "id",
      header: "ID",
      type: "text",
      width: 80,
      align: "center",
      sortable: true,
      pinned: "left",
      render: (v) => <span className="font-mono text-xs font-medium text-muted-foreground">{v}</span>,
    },
    {
      key: "name",
      header: "Salesperson",
      type: "text",
      sortable: true,
      width: 200,
      filterable: true,
      render: (v, row) => {
        const isTop = row.id === metrics.topPerformer?.id;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{v}</span>
                {isTop && <Award className="h-3.5 w-3.5 text-amber-500 fill-amber-500" title="Top Performer" />}
              </div>
              <span className="text-xs text-muted-foreground">{row.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "state",
      header: "State",
      type: "text",
      sortable: true,
      filterable: true,
      width: 130,
      render: (v) => <span className="text-sm">{v}</span>,
    },
    {
      key: "region",
      header: "Region",
      sortable: true,
      filterable: true,
      width: 100,
      align: "center",
      render: (v) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {v}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      sortable: true,
      filterable: true,
      width: 100,
      align: "center",
      badgeMap: {
        Active: { label: "Active", variant: "default" },
        Inactive: { label: "Inactive", variant: "secondary" },
        "On Leave": { label: "On Leave", variant: "outline" },
      },
    },
    {
      key: "totalVisits",
      header: "Visits",
      type: "number",
      sortable: true,
      align: "center",
      width: 80,
      aggregate: "sum",
      render: (v) => (
        <div className="font-semibold text-sm tabular-nums">
          {Number(v).toLocaleString()}
        </div>
      ),
    },
    {
      key: "schools",
      header: "Schools",
      type: "number",
      sortable: true,
      align: "center",
      width: 80,
      aggregate: "sum",
      render: (v) => (
        <div className="font-semibold text-sm tabular-nums">
          {Number(v).toLocaleString()}
        </div>
      ),
    },
    {
      key: "booksellers",
      header: "Booksellers",
      type: "number",
      sortable: true,
      align: "center",
      width: 100,
      aggregate: "sum",
      render: (v) => (
        <div className="font-semibold text-sm tabular-nums">
          {Number(v).toLocaleString()}
        </div>
      ),
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      align: "right",
      width: 120,
      aggregate: "sum",
      render: (v) => {
        const revenue = Number(v);
        return (
          <div className="font-semibold text-sm tabular-nums">
            ₹{(revenue / 1000).toFixed(0)}k
          </div>
        );
      },
      tooltip: (v) => `Total Revenue: ₹${Number(v).toLocaleString("en-IN")}`,
    },
    {
      key: "attendance",
      header: "Attendance",
      sortable: true,
      width: 140,
      align: "center",
      aggregate: "avg",
      render: (v) => {
        const attendance = Number(v);
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${attendance}%` }} />
            </div>
            <span className="text-xs font-semibold tabular-nums w-9 text-right">{attendance}%</span>
          </div>
        );
      },
    },
    {
      key: "joinDate",
      header: "Joined",
      sortable: true,
      width: 100,
      render: (v) => (
        <span className="text-xs text-muted-foreground">
          {new Date(v).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      type: "actions",
      width: 120,
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => toast.info(`Viewing ${row.name}'s profile`)}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => toast.info(`Editing ${row.name}`)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              setData(data.filter((d) => d.id !== row.id));
              toast.success(`Removed ${row.name}`);
            }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];


  return (
    <PageContainer>
      <PageHeader title="Sales Team Grid" description="Professional sales team management interface" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Team Size</CardDescription>
            <CardTitle className="text-2xl">{data.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{metrics.active} Active</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Visits</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalVisits.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Schools</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalSchools.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Covered</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Booksellers</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalBooksellers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Partners</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Revenue</CardDescription>
            <CardTitle className="text-2xl">₹{(metrics.totalRevenue / 100000).toFixed(1)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card className="border-l-2 border-l-foreground/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Attendance</CardDescription>
            <CardTitle className="text-2xl">{metrics.avgAttendance}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Professional DataGrid */}
      <DataGrid<SalesmanRow>
        title={`Sales Team (${data.length} Members)`}
        data={data}
        columns={COLUMNS}
        rowKey="id"
        selectable
        enableRowPinning
        enableColumnPinning
        showStats={false} // Removed - we have stats cards above
        striped
        inlineFilters
        maxHeight={600}
        presetKey="sales-team-professional"
        onSelectionChange={setSelected}
        pageSizes={[10, 25, 50, 100]}
        defaultPageSize={25}
        emptyMessage="No salespeople found."
        expandedRowRender={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {row.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {row.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Booksellers</p>
              <p className="text-lg font-bold">{row.booksellers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">School Conversion</p>
              <p className="text-lg font-bold">
                {row.totalVisits > 0 ? Math.round((row.schools / row.totalVisits) * 100) : 0}%
              </p>
            </div>
          </div>
        )}
        onCellEdit={(row, key, val) => {
          setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, [key]: val } : r)));
          toast.success(`Updated ${key}`);
        }}
        onRefresh={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
            loading: "Refreshing...",
            success: "Data refreshed!",
            error: "Failed to refresh",
          })
        }
        onImport={(rows) => toast.success(`Imported ${rows.length} rows`)}
      />
    </PageContainer>
  );
}
