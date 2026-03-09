"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, TrendingUp, School, BookmarkCheck, LibraryBig } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { BarChart2 } from "lucide-react";

import schoolsData from "@/lib/mock-data/schools.json";

export default function PrescribedBooksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      let totalPrescriptions = 0;
      const subjectCount: Record<string, number> = {};
      const statusCount: Record<string, number> = {};
      const classCount: Record<string, number> = {};

      const allBooks = schoolsData.flatMap((school) =>
        school.prescribedBooks.map((b) => {
          totalPrescriptions++;
          subjectCount[b.subject] = (subjectCount[b.subject] || 0) + 1;
          statusCount[b.status] = (statusCount[b.status] || 0) + 1;
          classCount[b.class] = (classCount[b.class] || 0) + 1;

          return {
            id: `${school.id}-${b.subject}-${b.class}`,
            schoolName: school.name,
            city: school.city,
            state: school.state,
            board: school.board,
            subject: b.subject,
            class: b.class,
            book: b.book,
            status: b.status,
            assignedTo: school.assignedTo,
          };
        })
      );

      const topSubject = Object.entries(subjectCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      const topClass = Object.entries(classCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      setData(allBooks);
      setAnalytics({
        total: totalPrescriptions,
        topSubject,
        topClass,
        activePrescriptions: statusCount["Prescribed"] || 0,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const columns = useMemo<GridColumn<any>[]>(
    () => [
      {
        key: "schoolName",
        header: "School Name",
        type: "text",
        width: 250,
        sortable: true,
        filterable: true,
        pinned: "left",
      },
      {
        key: "city",
        header: "City / State",
        type: "text",
        width: 150,
        sortable: true,
        filterable: true,
        render: (_: any, row: any) => (
          <div>
            <div className="font-semibold">{row.city}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{row.state}</div>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        type: "text",
        width: 150,
        sortable: true,
        filterable: true,
        render: (val: string) => (
          <Badge variant="outline" className="font-semibold">{val}</Badge>
        )
      },
      {
        key: "class",
        header: "Class",
        type: "text",
        width: 100,
        sortable: true,
        filterable: true,
        align: "center",
      },
      {
        key: "book",
        header: "Book Name",
        type: "text",
        width: 280,
        sortable: true,
        filterable: true,
        render: (val: string) => (
          <span className="font-medium flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{val}</span>
          </span>
        )
      },
      {
        key: "status",
        header: "Status",
        type: "badge",
        width: 130,
        sortable: true,
        filterable: true,
        badgeMap: {
          "Prescribed": { variant: "default", label: "Prescribed" },
          "Pending": { variant: "secondary", label: "Pending" },
          "Lost": { variant: "destructive", label: "Lost" },
        },
      },
      {
        key: "assignedTo",
        header: "Manager ID",
        type: "text",
        width: 120,
        sortable: true,
        filterable: true,
        align: "center",
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Prescribed Book Portfolio"
        description="Comprehensive analytics of your books prescribed across all school portfolios."
      />

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Prescribed"
          value={analytics.activePrescriptions || 0}
          icon={BookmarkCheck}
        />
        <StatsCard
          title="Top Subject"
          value={analytics.topSubject || "-"}
          icon={LibraryBig}
        />
        <StatsCard
          title="Top Class"
          value={`Class ${analytics.topClass}` || "-"}
          icon={School}
        />
        <StatsCard
          title="All Records"
          value={analytics.total || 0}
          icon={TrendingUp}
        />
      </div>

      <div className="h-[calc(100vh-280px)] min-h-[500px]">
        <DataGrid
          data={data}
          columns={columns}
          rowKey="id"
          density="normal"
          title="Tracking Registry"
          enableColumnPinning
          enableRowPinning
          extraViews={[
            {
              key: "chart",
              icon: <BarChart2 className="h-3.5 w-3.5" />,
              label: "Chart",
              render: (gridData) => <PrescribedBooksChartView data={gridData as any[]} />,
            },
          ]}
        />
      </div>
    </PageContainer>
  );
}

// ─── Chart colors ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  Prescribed: "var(--color-chart-2)", // Emerald/Green
  Pending: "var(--color-chart-1)",   // Orange
  Lost: "var(--color-chart-3)",      // Red
};

// ─── PrescribedBooksChartView ──────────────────────────────────────────────────
function PrescribedBooksChartView({ data }: { data: any[] }) {
  const statusData = (["Prescribed", "Pending", "Lost"]).map(s => ({
    name: s,
    value: data.filter(d => d.status === s).length,
    fill: STATUS_COLORS[s],
  })).filter(d => d.value > 0);

  const subjectCounts: Record<string, Record<string, number>> = {};
  data.forEach(d => {
    const t = d.subject || "Other";
    if (!subjectCounts[t]) subjectCounts[t] = { Prescribed: 0, Pending: 0, Lost: 0 };
    subjectCounts[t][d.status] = (subjectCounts[t][d.status] || 0) + 1;
  });
  const subjectData = Object.entries(subjectCounts).map(([subject, counts]) => ({
    subject, ...counts,
  })).sort((a: any, b: any) => (b.Prescribed + b.Pending) - (a.Prescribed + a.Pending)).slice(0, 10);

  const classCounts: Record<string, number> = {};
  data.forEach(d => {
    if (d.status === "Prescribed") {
      classCounts[d.class] = (classCounts[d.class] || 0) + 1;
    }
  });
  const classData = Object.entries(classCounts)
    .map(([c, count]) => ({ name: `Class ${c}`, value: count }))
    .sort((a, b) => b.value - a.value).slice(0, 8);

  const total = data.length;

  return (
    <div className="space-y-6">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {statusData.map(s => (
          <div key={s.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.fill }} />
            <span className="text-sm font-semibold">{s.name}</span>
            <span className="text-xs text-muted-foreground">{s.value} ({total ? Math.round(s.value / total * 100) : 0}%)</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut – Status Distribution */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Status Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <RechartsTooltip formatter={(v) => [`${v} records`, ""]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar – Subject Breakdown */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top Subjects Breakdown</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={subjectData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Prescribed" name="Prescribed" fill={STATUS_COLORS.Prescribed} stackId="a" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Pending" name="Pending" fill={STATUS_COLORS.Pending} stackId="a" />
              <Bar dataKey="Lost" name="Lost" fill={STATUS_COLORS.Lost} stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal Bar – Class adoption */}
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold mb-3">Top Classes (Prescribed Count)</p>
        <ResponsiveContainer width="100%" height={Math.max(200, classData.length * 44)}>
          <BarChart data={classData} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
            <RechartsTooltip formatter={(v) => [`${v} books`, "Count"]} />
            <Bar dataKey="value" name="Prescribed Count" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
