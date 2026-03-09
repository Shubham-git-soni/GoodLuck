"use client";

import { useEffect, useState, useMemo } from "react";
import { BookOpen, TrendingDown, TrendingUp, BarChart3, PieChartIcon } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { getSpecimens, getSalesmen } from "@/lib/dummy-api";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export default function SpecimenTrackingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [specimensData, setSpecimensData] = useState<any[]>([]);
  const [salesmanData, setSalesmanData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"salesmen" | "inventory">("salesmen");

  useEffect(() => {
    Promise.all([getSpecimens(), getSalesmen()]).then(([specimens, salesmen]) => {
      setSpecimensData(specimens.map(s => ({ ...s, totalValue: s.stockAvailable * s.mrp })));

      const totalBudget = salesmen.reduce((sum: number, s: any) => sum + s.specimenBudget, 0);
      const totalUsed = salesmen.reduce((sum: number, s: any) => sum + s.specimenUsed, 0);
      const totalStock = specimens.reduce((sum: number, s: any) => sum + s.stockAvailable, 0);

      const bySalesman = salesmen.map((sm: any) => ({
        id: sm.id,
        name: sm.name,
        budget: sm.specimenBudget,
        used: sm.specimenUsed,
        remaining: sm.specimenBudget - sm.specimenUsed,
        percentage: Math.round((sm.specimenUsed / sm.specimenBudget) * 100),
      }));

      setSalesmanData(bySalesman);
      setStats({ totalBudget, totalUsed, totalRemaining: totalBudget - totalUsed, totalStock });
      setIsLoading(false);
    });
  }, []);

  // -- Chart Views are now rendered by premium components at the bottom of the file --

  // -- Grid Columns Setup --
  const salesmanCols = useMemo<GridColumn<any>[]>(() => [
    {
      key: "name",
      header: "Salesman Name",
      type: "text",
      width: 200,
      sortable: true,
      filterable: true,
      pinned: "left",
    },
    {
      key: "budget",
      header: "Total Budget",
      type: "number",
      width: 150,
      sortable: true,
      render: (v) => `₹${(v / 100000).toFixed(2)}L`
    },
    {
      key: "used",
      header: "Used Amount",
      type: "number",
      width: 150,
      sortable: true,
      render: (v) => <span className="text-destructive font-bold">₹{(v / 100000).toFixed(2)}L</span>
    },
    {
      key: "remaining",
      header: "Remaining",
      type: "number",
      width: 150,
      sortable: true,
      render: (v) => <span className="text-primary font-bold">₹{(v / 100000).toFixed(2)}L</span>
    },
    {
      key: "percentage",
      header: "Utilization",
      type: "progress",
      width: 250,
      sortable: true,
    },
    {
      key: "status",
      header: "Health Status",
      type: "badge",
      width: 150,
      sortable: false,
      render: (_, row) => (
        <Badge variant={row.percentage >= 80 ? "destructive" : row.percentage >= 50 ? "secondary" : "outline"} className="uppercase tracking-wider text-[10px]">
          {row.percentage >= 80 ? 'Critical' : row.percentage >= 50 ? 'Warning' : 'Healthy'}
        </Badge>
      )
    }
  ], []);

  const inventoryCols = useMemo<GridColumn<any>[]>(() => [
    {
      key: "bookName",
      header: "Book Name",
      type: "text",
      width: 250,
      sortable: true,
      filterable: true,
      pinned: "left",
    },
    {
      key: "subject",
      header: "Subject",
      type: "text",
      width: 150,
      sortable: true,
      filterable: true,
      render: (v) => <Badge variant="outline">{v}</Badge>
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
      key: "stockAvailable",
      header: "Stock Available",
      type: "number",
      width: 150,
      sortable: true,
      align: "right",
      render: (v) => (
        <span className={v < 100 ? "text-destructive font-bold" : "text-emerald-600 font-bold"}>
          {v} units
        </span>
      )
    },
    {
      key: "mrp",
      header: "MRP",
      type: "number",
      width: 120,
      sortable: true,
      align: "right",
      render: (v) => `₹${v}`
    },
    {
      key: "totalValue",
      header: "Total Stock Value",
      type: "number",
      width: 160,
      sortable: true,
      align: "right",
      render: (v) => <span className="text-muted-foreground font-medium">₹{v.toLocaleString()}</span>
    }
  ], []);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Specimen Tracking"
        description="Monitor highly granular specimen inventory and salesmen budget utilization metrics"
      />

      {/* Stats KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <StatsCard
          title="Total Allocated Budget"
          value={`₹${(stats.totalBudget / 100000).toFixed(1)}L`}
          icon={BookOpen}
        />
        <StatsCard
          title="Consolidated Usage"
          value={`₹${(stats.totalUsed / 100000).toFixed(1)}L`}
          description={`${Math.round((stats.totalUsed / stats.totalBudget) * 100)}% naturally utilized`}
          icon={TrendingDown}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Safe Remaining Limit"
          value={`₹${(stats.totalRemaining / 100000).toFixed(1)}L`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Central Inventory Stock"
          value={stats.totalStock.toLocaleString()}
          description="Total physical books stored"
          icon={BookOpen}
        />
      </div>

      {/* ── Toggle: Salesman Constraints + Warehouse Inventory ── */}

      {/* Desktop toggle */}
      <div className="hidden md:flex items-center gap-1 bg-muted rounded-xl p-1 mb-4 w-fit">
        <button
          onClick={() => setActiveTab("salesmen")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "salesmen"
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Salesman Constraints
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "inventory"
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Warehouse Inventory
        </button>
      </div>

      {/* Mobile toggle */}
      <div className="flex gap-0 mb-4 border-b md:hidden">
        <button
          onClick={() => setActiveTab("salesmen")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px flex-1 justify-center ${activeTab === "salesmen"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Constraints
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px flex-1 justify-center ${activeTab === "inventory"
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          Inventory
        </button>
      </div>

      {activeTab === "salesmen" && (
        <div className="h-[calc(100vh-280px)] min-h-[500px]">
          <DataGrid
            data={salesmanData}
            columns={salesmanCols}
            rowKey="id"
            density="normal"
            title="Salesman Financial Quotas"
            enableColumnPinning
            extraViews={[
              { key: "chart", icon: <BarChart3 className="h-4 w-4" />, label: "Chart", render: (data) => <SalesmanChartView data={data as any[]} /> }
            ]}
          />
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="h-[calc(100vh-280px)] min-h-[500px]">
          <DataGrid
            data={specimensData}
            columns={inventoryCols}
            rowKey="id"
            density="normal"
            title="Available Stock Pipeline"
            enableColumnPinning
            extraViews={[
              { key: "chart", icon: <PieChartIcon className="h-4 w-4" />, label: "Chart", render: (data) => <InventoryChartView data={data as any[]} /> }
            ]}
          />
        </div>
      )}

    </PageContainer>
  );
}

// ─── Salesman Chart View ──────────────────────────────────────────────────
function SalesmanChartView({ data }: { data: any[] }) {
  const totalBudget = data.reduce((sum, d) => sum + d.budget, 0);
  const totalUsed = data.reduce((sum, d) => sum + d.used, 0);
  const totalRemaining = totalBudget - totalUsed;

  const budgetData = [
    { name: "Used Budget", value: totalUsed, fill: "var(--color-chart-2)" },
    { name: "Remaining Limit", value: totalRemaining, fill: "var(--color-chart-1)" },
  ];

  const topSalesmen = [...data].sort((a, b) => b.percentage - a.percentage).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Overall Budget Utilization</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={budgetData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value"
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                {budgetData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top 8 Salesmen by Constraints</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSalesmen} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`} cursor={{ fill: "transparent" }} />
              <Bar dataKey="used" name="Used Budget" stackId="a" fill="var(--color-chart-2)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining Limit" stackId="a" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Chart View ──────────────────────────────────────────────────
function InventoryChartView({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, item) => {
    acc[item.subject] = (acc[item.subject] || 0) + item.stockAvailable;
    return acc;
  }, {} as Record<string, number>);

  const COLORS_NEW = [
    "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
    "var(--color-chart-4)", "var(--color-chart-5)", "var(--primary)"
  ];

  const subjectData = Object.entries(grouped)
    .map(([name, value], i) => ({ name, value, fill: COLORS_NEW[i % COLORS_NEW.length] }))
    .sort((a: any, b: any) => b.value - a.value);

  const topValueBooks = [...data]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .map(b => ({ name: b.bookName, value: b.totalValue, fill: "var(--color-chart-2)" }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Stock Distribution by Subject</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={subjectData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value"
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                {subjectData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} units`} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Top 10 Books by Stock Value</p>
          <ResponsiveContainer width="100%" height={Math.max(260, topValueBooks.length * 35)}>
            <BarChart data={topValueBooks} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" name="Total Value" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
