"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid } from "@/components/ui/data-grid";
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
import schoolsData from "@/lib/mock-data/schools.json";

// ─── Visit purpose palette ────────────────────────────────────────────────────
const VISIT_TYPES = [
  "Marketing Brochures",
  "Product Demo",
  "Given Specimen",
  "Feedback",
  "Final Pitch",
];

const VISIT_COLORS: Record<string, string> = {
  "Marketing Brochures": "bg-orange-100 text-orange-700 border-orange-200",
  "Product Demo": "bg-blue-100 text-blue-700 border-blue-200",
  "Given Specimen": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Feedback": "bg-amber-100 text-amber-700 border-amber-200",
  "Final Pitch": "bg-violet-100 text-violet-700 border-violet-200",
};

// ─── Mock data — matches screenshot exactly ───────────────────────────────────
const MOCK_VISIT_PLANS = [
  { schoolName: "Public School", totalVisits: 1, visits: ["Marketing Brochures"] },
  { schoolName: "Abc Public School", totalVisits: 5, visits: ["", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Given Specimen"] },
  { schoolName: "Academic Hights Public School", totalVisits: 8, visits: ["", "Product Demo", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Given Specimen", "Given Specimen", "Feedback"] },
  { schoolName: "Academic World School", totalVisits: 1, visits: [""] },
  { schoolName: "Aditya Public School", totalVisits: 8, visits: ["", "Marketing Brochures", "Marketing Brochures", "Given Specimen", "Feedback", "Product Demo", "Given Specimen", "Feedback"] },
  { schoolName: "Alma Mater The School", totalVisits: 5, visits: ["", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Feedback"] },
  { schoolName: "Amar Singh Public School", totalVisits: 1, visits: ["Marketing Brochures"] },
  { schoolName: "Apex Public School", totalVisits: 7, visits: ["", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Given Specimen", "Final Pitch"] },
  { schoolName: "B N Public School", totalVisits: 11, visits: ["Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Given Specimen", "Feedback", "Given Specimen", "Final Pitch", "Final Pitch"] },
  { schoolName: "Bishop Academy", totalVisits: 1, visits: ["Marketing Brochures"] },
  { schoolName: "Blue Bells Public School", totalVisits: 4, visits: ["Marketing Brochures", "Marketing Brochures", "Given Specimen", "Feedback"] },
  { schoolName: "Cambridge International", totalVisits: 6, visits: ["Marketing Brochures", "Product Demo", "Marketing Brochures", "Given Specimen", "Given Specimen", "Final Pitch"] },
  { schoolName: "DAV Public School", totalVisits: 9, visits: ["Marketing Brochures", "Marketing Brochures", "Product Demo", "Marketing Brochures", "Given Specimen", "Feedback", "Given Specimen", "Final Pitch", "Feedback"] },
  { schoolName: "Delhi Public School", totalVisits: 3, visits: ["Marketing Brochures", "Given Specimen", "Final Pitch"] },
  { schoolName: "Greenwood International", totalVisits: 7, visits: ["Marketing Brochures", "Marketing Brochures", "Marketing Brochures", "Given Specimen", "Feedback", "Product Demo", "Final Pitch"] },
];

const MAX_VISITS = 17;

function buildRows() {
  return MOCK_VISIT_PLANS.map((plan, idx) => {
    const row: any = {
      id: `SPV-${idx + 1}`,
      sno: idx + 1,
      schoolName: plan.schoolName,
      totalVisits: plan.totalVisits,
    };
    for (let i = 1; i <= MAX_VISITS; i++) {
      row[`v${i}`] = plan.visits[i - 1] || "";
    }
    return row;
  });
}

// ─── Visit cell renderer ──────────────────────────────────────────────────────
function VisitCell({ value }: { value: string }) {
  if (!value) return <span className="text-muted-foreground/30 text-[10px]">—</span>;
  const cls = VISIT_COLORS[value] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border leading-tight ${cls}`}>
      {value}
    </span>
  );
}

// ─── Chart View ──────────────────────────────────────────────────────────────
const CHART_PALETTE = ["#f97316", "#6b7280", "#10b981", "#9ca3af", "#f59e0b", "#d1d5db"];

function VisitChartView({ data }: { data: any[] }) {
  // Top schools by total visits
  const topVisits = [...data]
    .sort((a, b) => b.totalVisits - a.totalVisits)
    .slice(0, 10)
    .map((r) => ({
      name: r.schoolName.length > 20 ? r.schoolName.slice(0, 20) + "…" : r.schoolName,
      visits: r.totalVisits,
    }));

  // Purpose distribution count
  const purposeMap: Record<string, number> = {};
  data.forEach((row) => {
    for (let i = 1; i <= MAX_VISITS; i++) {
      const v = row[`v${i}`];
      if (v) purposeMap[v] = (purposeMap[v] || 0) + 1;
    }
  });
  const purposeData = Object.entries(purposeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Visit frequency pie: schools with ≤3 visits vs >3
  const lowVisits = data.filter((r) => r.totalVisits <= 3).length;
  const highVisits = data.filter((r) => r.totalVisits > 3).length;
  const freqPie = [
    { name: "≤ 3 Visits", value: lowVisits, fill: "#9ca3af" },
    { name: "> 3 Visits", value: highVisits, fill: "#f97316" },
  ];

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Schools by Visits */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top Schools by Total Visits</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topVisits} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="visits" name="Visits" radius={[0, 4, 4, 0]}>
                {topVisits.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#f97316" : "#9ca3af"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Purpose Distribution */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Visit Purpose Distribution</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={purposeData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 10 }} width={28} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {purposeData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visit Frequency Pie */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold mb-3">Visit Frequency Split</p>
        <div className="flex items-center gap-8 justify-center">
          <ResponsiveContainer width={220} height={200}>
            <PieChart>
              <Pie data={freqPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                labelLine={false}>
                {freqPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {freqPie.map((e) => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: e.fill }} />
                <span className="text-sm">{e.name}: <strong>{e.value} schools</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SalesPlanVisitPage() {
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

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>; LOADING_CHECK

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

  // Columns: School List, Total Visits, V1–V17
  const visitCols = Array.from({ length: MAX_VISITS }, (_, i) => ({
    key: `v${i + 1}`,
    header: `V${i + 1}`,
    width: 130,
    sortable: false,
    render: (value: string) => <VisitCell value={value} />,
  }));

  const columns = [
    {
      key: "sno",
      header: "#",
      width: 50,
      sortable: false,
    },
    {
      key: "schoolName",
      header: "School List",
      minWidth: 190,
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <span className="font-semibold text-primary text-xs leading-snug">{value}</span>
      ),
    },
    {
      key: "totalVisits",
      header: "Total Visits",
      width: 95,
      sortable: true,
      type: "number" as const,
      render: (value: number) => (
        <span className="font-bold text-orange-500 text-sm">{value}</span>
      ),
    },
    ...visitCols,
  ];

  const extraViews = [
    {
      key: "chart",
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Chart",
      render: (data: any[]) => <VisitChartView data={data} />,
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
          title="Sales Plan Visit"
          description={`Visit plan schedule for ${salesman.name}`}
        />
      </div>

      <DataGrid
        data={rows}
        columns={columns}
        rowKey="id"
        title={`${salesman.name} — Sales Plan Visit`}
        description={`${rows.length} schools · V1–V17 visit log`}
        showStats
        density="comfortable"
        extraViews={extraViews}
        onExport={(data, format) => console.log("Export", format, data)}
      />
    </PageContainer>
  );
}
