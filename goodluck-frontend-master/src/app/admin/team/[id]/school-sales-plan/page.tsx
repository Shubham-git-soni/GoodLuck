"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";
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

// ─── Structured Mock Data ────────────────────────────────────────────────────
const MOCK_PLANS = [
  {
    schoolName: "Public School",
    purposes: ["1. Marketing Brochures"],
    specimen: [],
    tryToPrescribe: 0,
    target: 0,
    achieved: 0,
  },
  {
    schoolName: "Abc Public School",
    purposes: ["1.", "2. Marketing Brochures", "3. Marketing Brochures", "4. Marketing Brochures", "5. Given Specimen"],
    specimen: ["1 set Artificial Intelligence and Coding 1-8"],
    tryToPrescribe: 5,
    target: 80000,
    achieved: 0,
  },
  {
    schoolName: "Academic Heights Public School",
    purposes: ["1.", "2. Product Demo", "3. Marketing Brochures", "4. Marketing Brochures", "5. Marketing Brochures", "6. Given Specimen", "7. Given Specimen", "8. Feedback"],
    specimen: [
      "1 set Happy Faces (With Hindi) A",
      "1 set Happy Faces (With Hindi) B",
      "1 set Happy Faces (With Hindi) C",
      "1 set Basic English Grammar and Composition 1-8",
      "1 set Modern Science and Technology 3",
      "1 set Modern Science and Technology 4",
      "1 set Modern Science and Technology 5",
      "1 set Go for Social Studies 3",
      "1 set Go for Social Studies 4",
      "1 set Go for Social Studies 5",
      "1 set Our Green World 1",
      "1 set Our Green World 2",
      "1 set Nai Mil Hindi Vyakaran & Rachna 1",
      "1 set Nai Mil Hindi Vyakaran & Rachna 2",
      "1 set Nai Mil Hindi Vyakaran & Rachna 3",
      "1 set Nai Mil Hindi Vyakaran & Rachna 4",
      "1 set Nai Mil Hindi Vyakaran & Rachna 5",
      "1 set Nai Mil Hindi Vyakaran & Rachna 6",
      "1 set Nai Mil Hindi Vyakaran & Rachna 7",
      "1 set Nai Mil Hindi Vyakaran & Rachna 8",
    ],
    tryToPrescribe: 20,
    target: 350000,
    achieved: 0,
  },
  {
    schoolName: "Academic World School",
    purposes: ["1."],
    specimen: [],
    tryToPrescribe: 0,
    target: 0,
    achieved: 0,
  },
  {
    schoolName: "Aditya Public School",
    purposes: ["1.", "2. Marketing Brochures", "3. Marketing Brochures", "4. Given Specimen"],
    specimen: [
      "1 set Happy Faces (With Hindi) C",
      "1 set A Book of Moral Science (Activity) 1-8",
    ],
    tryToPrescribe: 8,
    target: 120000,
    achieved: 0,
  },
  {
    schoolName: "Bright Future School",
    purposes: ["1. Marketing Brochures", "2. Product Demo", "3. Given Specimen"],
    specimen: [
      "1 set Creative Hands A-8",
      "1 set Speak & Write 1-8",
      "1 set Know It Now GK 1-8",
    ],
    tryToPrescribe: 12,
    target: 200000,
    achieved: 145000,
  },
  {
    schoolName: "Delhi Public School",
    purposes: ["1. Marketing Brochures", "2. Given Specimen", "3. Feedback"],
    specimen: [
      "1 set Innovative Biology 6-8",
      "1 set Innovative Chemistry 6-8",
      "1 set Innovative Physics 6-8",
      "1 set Lab Manual 9-10",
    ],
    tryToPrescribe: 15,
    target: 450000,
    achieved: 380000,
  },
  {
    schoolName: "Greenwood International School",
    purposes: ["1. Product Demo", "2. Marketing Brochures", "3. Given Specimen"],
    specimen: [
      "1 set Happy Faces A",
      "1 set Happy Faces B",
      "1 set Candy Cursive 1-8",
    ],
    tryToPrescribe: 10,
    target: 175000,
    achieved: 90000,
  },
  {
    schoolName: "Holy Cross Convent School",
    purposes: ["1. Marketing Brochures", "2. Given Specimen"],
    specimen: [
      "1 set Rashmi Hindi 1-8",
      "1 set Nai Kiran Hindi 1-8",
      "1 set Chhavi Sulekh Mala 0-7",
    ],
    tryToPrescribe: 18,
    target: 280000,
    achieved: 210000,
  },
  {
    schoolName: "St. Mary's Public School",
    purposes: ["1. Product Demo", "2. Marketing Brochures", "3. Marketing Brochures", "4. Given Specimen", "5. Feedback"],
    specimen: [
      "1 set Conquer English CB 1-8",
      "1 set Conquer English WB 1-8",
      "1 set Smart English 6-8",
      "1 set BEG 1-8",
    ],
    tryToPrescribe: 22,
    target: 520000,
    achieved: 420000,
  },
  {
    schoolName: "Modern Academy",
    purposes: ["1. Marketing Brochures"],
    specimen: ["1 set Colour Canvas A-8"],
    tryToPrescribe: 6,
    target: 95000,
    achieved: 40000,
  },
  {
    schoolName: "Sunrise Public School",
    purposes: ["1. Marketing Brochures", "2. Given Specimen"],
    specimen: [
      "1 set Patterns Semester 1-5",
      "1 set Sunshine Semester LKG-5",
    ],
    tryToPrescribe: 9,
    target: 150000,
    achieved: 0,
  },
];

// ─── Chart View Component ────────────────────────────────────────────────────
const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"];

function SalesPlanChartView({ data }: { data: any[] }) {
  const chartData = data
    .filter((r) => r.target > 0)
    .map((r) => ({
      name: r.schoolName.length > 18 ? r.schoolName.slice(0, 18) + "…" : r.schoolName,
      target: Math.round(r.target / 1000),
      achieved: Math.round(r.achieved / 1000),
    }))
    .sort((a, b) => b.target - a.target)
    .slice(0, 10);

  const totalTarget = data.reduce((s, r) => s + r.target, 0);
  const totalAchieved = data.reduce((s, r) => s + r.achieved, 0);
  const totalPending = totalTarget - totalAchieved;

  const achievementPieData = [
    { name: "Achieved", value: totalAchieved, fill: "#10b981" },
    { name: "Pending", value: totalPending > 0 ? totalPending : 0, fill: "#f97316" },
  ];

  const purposeCount: Record<string, number> = {};
  data.forEach((r) => {
    r.purposeList?.forEach((p: string) => {
      const key = p.replace(/^\d+\.\s*/, "").trim();
      if (key) purposeCount[key] = (purposeCount[key] || 0) + 1;
    });
  });
  const purposeData = Object.entries(purposeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target vs Achieved Bar Chart */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top Schools — Target vs Achieved (₹K)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
              <Tooltip formatter={(v: number) => `₹${v}K`} cursor={{ fill: "transparent" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target" fill="#f97316" radius={[0, 4, 4, 0]} />
              <Bar dataKey="achieved" name="Achieved" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall Achievement Pie */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Overall Achievement</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={achievementPieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${Math.round((percent ?? 0) * 100)}%`
                }
                labelLine={false}
              >
                {achievementPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">Total Target</p>
            <p className="text-lg font-bold text-orange-500">₹{(totalTarget / 100000).toFixed(2)}L</p>
          </div>
        </div>
      </div>

      {/* Purpose Distribution */}
      {purposeData.length > 0 && (
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Purpose Distribution (Top Activities)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={purposeData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" name="Schools" radius={[4, 4, 0, 0]}>
                {purposeData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SchoolSalesPlanPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [salesPlanData, setSalesPlanData] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);

        // Merge mock plans with assigned schools
        const assignedSchools = schoolsData.filter(
          (s: any) => s.assignedTo === foundSalesman.name
        );

        const mapped = MOCK_PLANS.map((plan, idx) => {
          const school = assignedSchools[idx] || {};
          return {
            id: school.id || `PLAN-${idx + 1}`,
            sno: idx + 1,
            schoolName: plan.schoolName,
            board: (school as any).board || "CBSE",
            purposeList: plan.purposes,
            purpose: plan.purposes.join("\n"),
            tryToPrescribe: plan.tryToPrescribe,
            specimenGiven: plan.specimen.join("\n"),
            target: plan.target,
            achieved: plan.achieved,
          };
        });

        setSalesPlanData(mapped);
      }
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

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

  const columns = [
    {
      key: "sno",
      header: "#",
      width: 55,
      sortable: false,
    },
    {
      key: "schoolName",
      header: "School Name",
      sortable: true,
      filterable: true,
      minWidth: 200,
      render: (value: string) => (
        <span className="font-semibold text-primary">{value}</span>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      minWidth: 200,
      render: (value: string) => (
        <div className="space-y-0.5 py-1">
          {value.split("\n").filter(Boolean).map((p, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-snug">{p}</p>
          ))}
        </div>
      ),
    },
    {
      key: "tryToPrescribe",
      header: "Try to Prescribe",
      type: "number" as const,
      sortable: true,
      width: 140,
      render: (value: number) => (
        <span className="font-semibold">{value || "—"}</span>
      ),
    },
    {
      key: "specimenGiven",
      header: "Specimen Given",
      minWidth: 270,
      render: (value: string) =>
        value ? (
          <div className="space-y-0.5 py-1">
            {value.split("\n").map((s, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-snug">{s}</p>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground/40 text-xs">—</span>
        ),
    },
    {
      key: "target",
      header: "Target",
      type: "number" as const,
      sortable: true,
      width: 110,
      render: (value: number) => (
        <span className="font-semibold text-orange-500">
          {value > 0 ? `₹${(value / 1000).toFixed(0)}K` : "0"}
        </span>
      ),
    },
    {
      key: "achieved",
      header: "Achieved",
      type: "number" as const,
      sortable: true,
      width: 110,
      render: (value: number, row: any) => {
        if (!row.target) return <span className="text-muted-foreground">0</span>;
        const pct = Math.round((value / row.target) * 100);
        const color =
          pct >= 80 ? "text-emerald-600" : pct >= 40 ? "text-amber-500" : "text-rose-500";
        return (
          <div>
            <span className={`font-semibold ${color}`}>
              {value > 0 ? `₹${(value / 1000).toFixed(0)}K` : "0"}
            </span>
            {value > 0 && (
              <p className={`text-[10px] ${color}`}>{pct}%</p>
            )}
          </div>
        );
      },
    },
  ];

  const extraViews = [
    {
      key: "chart",
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Chart",
      render: (data: any[]) => <SalesPlanChartView data={data} />,
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
          title="School Sales Plan"
          description={`Sales plan and targets for ${salesman.name}`}
        />
      </div>

      <DataGrid
        data={salesPlanData}
        columns={columns}
        rowKey="id"
        title={`${salesman.name} — School Sales Plan`}
        description={`${salesPlanData.length} schools`}
        showStats
        density="comfortable"
        extraViews={extraViews}
        onExport={(data, format) => console.log("Export", format, data)}
      />
    </PageContainer>
  );
}
