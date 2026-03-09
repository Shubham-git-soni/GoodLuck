"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart2,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid } from "@/components/ui/data-grid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import salesmenData from "@/lib/mock-data/salesmen.json";

// ─── Mock Data exactly matching screenshot ────────────────────────────────────
const MOCK_SCHOOLS = [
  { schoolName: "Public School", id: "3701", board: "CBSE", strength: 800, contact: "", email: "contact@gorakhpurpublicschool.in", visits: 1, address: "Rustampur", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Abc Public School", id: "27008", board: "CBSE", strength: 2000, contact: "8833170149", email: "schoolabcpublic@gmail.com", visits: 5, address: "Divya nagar", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Academic Hights Public School", id: "37093", board: "CBSE", strength: 2000, contact: "", email: "support@academicheights.in", visits: 8, address: "Pipraich Road", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Academic World School", id: "43393", board: "CBSE", strength: 800, contact: "0", email: "", visits: 1, address: "Jughu", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Aditya Public School", id: "2700", board: "CBSE", strength: 1000, contact: "", email: "adityapublicschool@gmail.com", visits: 8, address: "Jughu", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Alma Mater The School", id: "27000", board: "CBSE", strength: 600, contact: "9792530417", email: "almamaterthschool@gmail.com", visits: 4, address: "Maaniram", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Amar Singh Public School", id: "49039", board: "CBSE", strength: 500, contact: "0", email: "", visits: 1, address: "Arya Nagar", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Apex Public School", id: "27018", board: "ICSE", strength: 300, contact: "9986051747", email: "apexschool@gmail.com", visits: 5, address: "Guhatiya", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "B N Public School", id: "2710", board: "CBSE", strength: 1200, contact: "", email: "bnsgpko@gmail.com", visits: 11, address: "Shahjanawa", state: "Uttar Pradesh", city: "Gorakhpur", station: "Gorakhpur" },
  { schoolName: "Bishop Academy", id: "37093", board: "CBSE", strength: 2500, contact: "", email: "info@bishopacademy.in", visits: 0, address: "Near Kachahari", state: "Uttar Pradesh", city: "Maharajganj", station: "Maharajganj" },
  { schoolName: "Blooming Buds Convent School", id: "27043", board: "CBSE", strength: 1000, contact: "9838477751", email: "bbdshastrig@gmail.com", visits: 1, address: "Gandhigali", state: "Uttar Pradesh", city: "Basti", station: "Basti" },
];

function buildRows() {
  return MOCK_SCHOOLS.map((s, i) => {
    // Generate random target just to have data (screenshot showed blank but we need it for charts/stats)
    const target = Math.floor(Math.random() * 200000) + 50000;
    return {
      rowId: `SCH-${i + 1}`,
      sno: i + 1,
      ...s,
      salesTarget: target,
    };
  });
}

// ─── Chart View ──────────────────────────────────────────────────────────────
const CHART_PALETTE = ["#f97316", "#9ca3af", "#10b981", "#3b82f6", "#f59e0b"];

function SchoolListChartView({ data }: { data: any[] }) {
  // Board Distribution
  const boardMap: Record<string, number> = {};
  data.forEach((r) => {
    boardMap[r.board] = (boardMap[r.board] || 0) + 1;
  });
  const boardPie = Object.entries(boardMap).map(([name, value]) => ({ name, value }));

  // Top Schools by Strength
  const strengthBar = [...data]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)
    .map((r) => ({
      name: r.schoolName.length > 15 ? r.schoolName.slice(0, 15) + "…" : r.schoolName,
      strength: r.strength,
    }));

  // Schools by Station
  const stationMap: Record<string, number> = {};
  data.forEach((r) => {
    stationMap[r.station] = (stationMap[r.station] || 0) + 1;
  });
  const stationBar = Object.entries(stationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Schools by Strength */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top Schools by Student Strength</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={strengthBar} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} width={35} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="strength" name="Strength" radius={[4, 4, 0, 0]}>
                {strengthBar.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % 2 === 0 ? 0 : 1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Board & Station Stats */}
        <div className="flex flex-col gap-5">
          {/* Board Pie */}
          <div className="bg-card border rounded-xl p-4 shadow-sm flex-1 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Board Distribution</p>
              <p className="text-xs text-muted-foreground mb-4">Total {data.length} schools</p>
              <div className="space-y-2">
                {boardPie.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ background: CHART_PALETTE[i] }} />
                    <span className="text-xs font-medium">{e.name}: {e.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-[140px] h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={boardPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {boardPie.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Station Bar */}
          <div className="bg-card border rounded-xl p-4 shadow-sm flex-[1.5]">
            <p className="text-sm font-semibold mb-3">Schools by Station</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={stationBar} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" name="Schools" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Actions Cell ─────────────────────────────────────────────────────────────
function ActionsCell() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:bg-blue-50/50">
        <Edit className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50/50">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SchoolListPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [rows] = useState(() => buildRows());

  useEffect(() => {
    setTimeout(() => {
      const found = salesmenData.find((s) => s.id === salesmanId);
      if (found) setSalesman(found);
      setIsLoading(false);
    }, 400);
  }, [salesmanId]);

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/team">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // screenshot columns: #, School Name, ID, Board, Strength, Contact, Email, Visits, Address, State, City, Station, Sales Target, Action
  const columns = [
    { key: "sno", header: "#", width: 50, sortable: false },
    { key: "schoolName", header: "School Name", minWidth: 180, sortable: true, filterable: true, render: (v: string) => <span className="font-medium text-xs">{v}</span> },
    { key: "id", header: "ID", width: 70, sortable: true, render: (v: string) => <span className="text-muted-foreground">{v}</span> },
    { key: "board", header: "Board", width: 70, sortable: true },
    { key: "strength", header: "Strength", width: 80, sortable: true, type: "number" as const },
    { key: "contact", header: "Contact", width: 100, sortable: false, render: (v: string) => <span className="text-muted-foreground">{v || "—"}</span> },
    { key: "email", header: "Email", minWidth: 180, sortable: false, render: (v: string) => <span className="text-muted-foreground truncate" title={v}>{v || "—"}</span> },
    { key: "visits", header: "Visits", width: 70, sortable: true, type: "number" as const, render: (v: number) => <span className="font-semibold text-orange-600">{v}</span> },
    { key: "address", header: "Address", minWidth: 120, sortable: false, render: (v: string) => <span className="text-muted-foreground truncate" title={v}>{v}</span> },
    { key: "state", header: "State", width: 120, sortable: true },
    { key: "city", header: "City", width: 100, sortable: true },
    { key: "station", header: "Station", width: 100, sortable: true },
    { key: "salesTarget", header: "Sales Target", width: 100, sortable: true, type: "number" as const, render: (v: number) => `₹${(v / 1000).toFixed(0)}K` },
    { key: "actions", header: "Action", width: 80, sortable: false, render: () => <ActionsCell /> },
  ];

  const extraViews = [
    {
      key: "chart",
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Chart View",
      render: (data: any[]) => <SchoolListChartView data={data} />,
    },
  ];

  return (
    <PageContainer>
      <div className="mb-4 md:mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-2 md:mb-4 text-xs md:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`School List of ${salesman.name}`}
          description={`Detailed portfolio of ${rows.length} assigned schools`}
        />
      </div>

      <DataGrid
        data={rows}
        columns={columns}
        rowKey="rowId"
        title="School Portfolio"
        description={`${rows.length} entries`}
        showStats
        density="compact"
        extraViews={extraViews}
        onExport={(data, format) => console.log("Export", format, data)}
      />
    </PageContainer>
  );
}
