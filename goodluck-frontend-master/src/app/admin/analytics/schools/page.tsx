"use client";

import { useEffect, useState } from "react";
import { School, TrendingUp, AlertCircle, Users, Eye, TrendingDown } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";

import schoolsData from "@/lib/mock-data/schools.json";
import salesmenData from "@/lib/mock-data/salesmen.json";
import contactsData from "@/lib/mock-data/contact-persons.json";

export default function SchoolAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});
 
  useEffect(() => {
    setTimeout(() => {
      const total = schoolsData.length;
      const blocked = schoolsData.filter((s) => s.isBlocked).length;
      const notVisited = schoolsData.filter((s) => s.visitCount === 0).length;
      const visitedOnce = schoolsData.filter((s) => s.visitCount === 1).length;
      const visitedTwicePlus = schoolsData.filter((s) => s.visitCount >= 2).length;

      const byBoard = schoolsData.reduce((acc: any, s) => {
        acc[s.board] = (acc[s.board] || 0) + 1;
        return acc;
      }, {});

      const bySalesman = salesmenData.map((sm) => {
        const assigned = schoolsData.filter((s) => s.assignedTo === sm.id);
        return {
          salesman: sm.name,
          total: assigned.length,
          blocked: assigned.filter((s) => s.isBlocked).length,
          notVisited: assigned.filter((s) => s.visitCount === 0).length,
          visitedTwicePlus: assigned.filter((s) => s.visitCount >= 2).length,
        };
      });

      const mappedSchools = schoolsData.map((school) => {
        const sm = salesmenData.find((s) => s.id === school.assignedTo);
        const history = school.businessHistory || [];
        const currentYearRev = history.find(h => h.year === 2025)?.revenue || 0;
        const prevYearRev = history.find(h => h.year === 2024)?.revenue || 0;
        const revenueGrowth = prevYearRev ? ((currentYearRev - prevYearRev) / prevYearRev) * 100 : 0;
        const schoolContacts = contactsData.filter(c => c.schoolId === school.id);

        return {
          ...school,
          salesmanName: sm ? sm.name : "Unassigned",
          currentRevenue: currentYearRev,
          revenueGrowth: revenueGrowth,
          contacts: schoolContacts,
        };
      });

      setAnalytics({
        total,
        blocked,
        notVisited,
        visitedOnce,
        visitedTwicePlus,
        byBoard,
        bySalesman,
        allSchools: mappedSchools,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  const combinedColumns: GridColumn<any>[] = [
    {
      key: "name",
      header: "School Name",
      sortable: true,
      filterable: true,
      width: 250,
      render: (v, row) => (
        <div>
          <p className="font-semibold text-primary">{v}</p>
          <p className="text-[11px] text-muted-foreground">{row.city}, {row.state}</p>
        </div>
      )
    },
    {
      key: "salesmanName",
      header: "Assigned Salesman",
      sortable: true,
      filterable: true,
      width: 170,
      render: (v) => <span className="font-medium">{v}</span>
    },
    {
      key: "board",
      header: "Board",
      sortable: true,
      filterable: true,
      width: 100,
      align: "center",
      render: (v) => <Badge variant="outline" className="font-medium">{v}</Badge>
    },
    {
      key: "visitCount",
      header: "Visits",
      sortable: true,
      filterable: true,
      width: 90,
      align: "center",
      render: (v) => v === 0 ? <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200">0</Badge> : <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">{v}</Badge>
    },
    {
      key: "lastVisitDate",
      header: "Last Visit",
      sortable: true,
      width: 120,
      render: (v) => v ? <span className="text-sm">{new Date(v).toLocaleDateString()}</span> : <span className="text-muted-foreground text-xs italic">Never</span>
    },
    {
      key: "strength",
      header: "Strength",
      sortable: true,
      width: 100,
      align: "right",
      render: (v) => <span className="text-muted-foreground">{v.toLocaleString()}</span>
    },
    {
      key: "isBlocked",
      header: "Status",
      sortable: true,
      width: 100,
      align: "center",
      render: (v) => v ? <Badge variant="destructive">Blocked</Badge> : <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
    },
    {
      key: "currentRevenue",
      header: "Current Revenue",
      sortable: true,
      width: 130,
      align: "right",
      render: (v) => <span className="font-semibold text-primary">₹{(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k</span>
    },
    {
      key: "revenueGrowth",
      header: "Growth",
      sortable: true,
      width: 90,
      align: "center",
      render: (v) => v === 0 ? <span className="text-muted-foreground">-</span> :
        v > 0 ? <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1"><TrendingUp className="h-3 w-3" />{v.toFixed(0)}%</Badge> :
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 gap-1"><TrendingDown className="h-3 w-3" />{Math.abs(v).toFixed(0)}%</Badge>
    }
  ];

  const visitData = [
    { name: "Not Visited", value: analytics.notVisited, color: "#E9423D" }, // red/crimson
    { name: "Visited Once", value: analytics.visitedOnce, color: "#EDB041" }, // yellow/orange
    { name: "Visited 2+ Times", value: analytics.visitedTwicePlus, color: "#F47B20" }, // primary orange
  ];

  const boardData = Object.entries(analytics.byBoard)
    .sort((a: any, b: any) => b[1] - a[1]) // Sort descending
    .map(([name, value]) => ({ name, value }));
  // Theme colors from globals.css: chart-1 through chart-5
  const boardColors = ["#F47B20", "#EDB041", "#E9423D", "#D9BE45", "#DA2A59"];

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-sm p-3 text-sm">
          <p className="font-semibold mb-1">{payload[0].name || payload[0].payload.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].payload.color || payload[0].payload.fill }} />
            <span className="font-medium">{payload[0].value} schools</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <PageContainer>
      <PageHeader
        title="School Analytics"
        description="Analyze school portfolio and performance"
      />

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        <StatsCard
          title="Total Schools"
          value={analytics.total}
          icon={School}
        />
        <StatsCard
          title="Blocked Schools"
          value={analytics.blocked}
          description={`${((analytics.blocked / analytics.total) * 100).toFixed(1)}% of total`}
          icon={AlertCircle}
        />
        <StatsCard
          title="Not Visited"
          value={analytics.notVisited}
          description="Need first visit"
          icon={TrendingUp}
        />
        <StatsCard
          title="Visited 2+ Times"
          value={analytics.visitedTwicePlus}
          description="Regular engagement"
          icon={Users}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Visit Status Breakdown - Donut Chart */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Visit Status Breakdown</CardTitle>
            <CardDescription>Schools grouped by visiting frequency</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="relative h-[240px] w-full flex items-center justify-center mb-2">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-primary">{analytics.total}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Schools</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={4}
                    cornerRadius={6}
                    dataKey="value"
                    strokeWidth={0}
                    style={{ outline: "none" }}
                  >
                    {visitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-auto">
              {visitData.map((item) => (
                <div key={item.name} className="flex flex-col items-center text-center p-3 rounded-2xl bg-muted/40 shadow-sm border border-muted/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold">{item.value}</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground/80 mt-1">
                    {((item.value / analytics.total) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Board-wise Distribution - Bar Chart */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle>Board-wise Distribution</CardTitle>
            <CardDescription>Number of schools prescribed by each educational board</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6">
            <div className="h-[280px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={boardData}
                  layout="vertical"
                  margin={{ top: 10, right: 40, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 13, fontWeight: 600 }}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 4, 4]}
                    barSize={16}
                    background={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }}
                  >
                    {boardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={boardColors[index % boardColors.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" fill="currentColor" fontSize={13} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Master Data Grid - Combined Data */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="rounded-md border bg-background overflow-hidden">
          <DataGrid
            data={analytics.allSchools}
            columns={combinedColumns}
            canExpandRow={(row: any) => row.contacts && row.contacts.length > 0}
            expandedRowRender={(row: any) => {
              if (!row.contacts || row.contacts.length === 0) {
                return (
                  <div className="p-6 text-center text-muted-foreground bg-muted/10 rounded-md border border-dashed">
                    No contact persons registered for this school yet.
                  </div>
                );
              }

              return (
                <div className="p-4 bg-muted/10">
                  <h4 className="font-semibold text-sm mb-3">Key Contact Persons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {row.contacts.map((contact: any) => (
                      <div key={contact.id} className="bg-background rounded-lg border p-3 flex flex-col hover:shadow-sm transition-shadow">
                        <span className="font-medium text-primary text-sm">{contact.name}</span>
                        <span className="text-xs text-muted-foreground mb-2">{contact.designation}</span>
                        <div className="text-xs font-medium space-y-1">
                          <p>Phone: <span className="font-normal">{contact.contactNo}</span></p>
                          <p>Email: <span className="font-normal">{contact.email}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
            density="compact"
            striped
            rowKey="id"
          />
        </div>
      </div>
    </PageContainer>
  );
}
