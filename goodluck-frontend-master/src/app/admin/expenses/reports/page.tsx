"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, FileText, Download, Calendar, AlertTriangle, CheckCircle2, LayoutGrid, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";

export default function AdminExpenseAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2025-12");

  useEffect(() => {
    import("@/lib/dummy-api").then(({ getExpenseReports, getExpenses, getSalesmen }) =>
      Promise.all([getExpenseReports(), getExpenses(), getSalesmen()]).then(
        ([r, e, s]) => { setReports(r); setExpenses(e); setSalesmen(s); }
      )
    );
  }, []);

  // Calculate analytics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = reports
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.paidAmount, 0);
  const pendingExpenses = reports
    .filter((r) => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const violationCount = expenses.filter((e) => e.policyViolation).length;

  // Expense by type
  const expensesByType = expenses.reduce((acc: any, expense) => {
    if (!acc[expense.expenseType]) {
      acc[expense.expenseType] = 0;
    }
    acc[expense.expenseType] += expense.amount;
    return acc;
  }, {});

  const expenseTypeData = Object.entries(expensesByType).map(([type, amount]) => ({
    type,
    amount: amount as number,
  }));

  // Salesman-wise breakdown
  const salesmanExpenses = salesmen.map((salesman) => {
    const salesmanReports = reports.filter((r) => r.salesmanId === salesman.id);
    const totalAmount = salesmanReports.reduce((sum, r) => sum + r.totalAmount, 0);
    const paidAmount = salesmanReports.reduce((sum, r) => sum + r.paidAmount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const reportCount = salesmanReports.length;
    const violationCount = salesmanReports.reduce(
      (sum, r) => sum + r.policyViolations,
      0
    );

    return {
      ...salesman,
      totalAmount,
      paidAmount,
      pendingAmount,
      reportCount,
      violationCount,
    };
  });

  const handleExport = () => {
    // Export to Excel logic
    toast.success("Exporting expense report to Excel...");
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <PageHeader
          title="Expense Analytics"
          description="Comprehensive expense reports and analytics"
        />
      </div>

      {/* KPI Cards — dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Total Expenses */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">Total Expenses</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">All time submissions</p>
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">₹{paidExpenses.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">Paid Amount</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress
                value={totalExpenses > 0 ? Math.round((paidExpenses / totalExpenses) * 100) : 0}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {totalExpenses > 0 ? ((paidExpenses / totalExpenses) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">₹{pendingExpenses.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">Pending Amount</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                {reports.filter((r) => r.status === "pending" || r.status === "approved").length} pending reports
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policy Violations */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{violationCount}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">Policy Violations</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress
                value={expenses.length > 0 ? Math.round((violationCount / expenses.length) * 100) : 0}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {expenses.length > 0 ? ((violationCount / expenses.length) * 100).toFixed(1) : 0}% of expenses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Expense by Type - Graphical */}
        <Card className="border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-0 border-b-0 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  Expenses by Type
                </CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5 ml-9">Visual distribution of spend</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="flex flex-col xl:flex-row items-center gap-4">
              <div className="w-full xl:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="amount"
                      stroke="none"
                    >
                      {expenseTypeData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#4b5563'][index % 5]}
                          className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      formatter={(v: any) => `₹${v.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full xl:w-1/2 space-y-2.5">
                {expenseTypeData.sort((a, b) => b.amount - a.amount).slice(0, 4).map((item, idx) => {
                  const colors = ['bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-blue-500'];
                  const textColors = ['text-orange-600', 'text-amber-600', 'text-emerald-600', 'text-blue-600'];
                  return (
                    <div key={item.type} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all cursor-default group">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white", colors[idx % 4])} />
                        <span className="text-xs font-bold text-foreground/80 lowercase first-letter:uppercase group-hover:text-foreground">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-foreground tracking-tight">₹{item.amount.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-muted-foreground/70 uppercase">{((item.amount / totalExpenses) * 100).toFixed(1)}% share</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary - Metric Centric */}
        <Card className="border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-2 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                Monthly Statistics
              </CardTitle>
              <div className="w-[140px]">
                <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 gap-3.5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText className="h-20 w-20" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shadow-inner group-hover:bg-primary/5">
                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reports Logged</h4>
                <p className="text-2xl font-bold text-foreground tracking-tight leading-none">{reports.length}</p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="text-[9px] font-black border-2 border-primary/20 bg-primary/5 text-primary">SYNCED</Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl gradient-card-orange border-0 shadow-sm relative overflow-hidden group ring-1 ring-orange-500/10">
              <div className="h-11 w-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-orange-900/60 uppercase tracking-widest">Total Submitted</h4>
                <p className="text-2xl font-bold text-orange-950 tracking-tight leading-none">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="ml-auto flex flex-col items-end">
                <div className="flex items-center gap-1 text-orange-700 font-black text-xs">
                  <ArrowUpRight className="h-4 w-4" /> 12.4%
                </div>
                <span className="text-[8px] font-bold text-orange-700/50 uppercase">vs Last Month</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl gradient-card-amber border-0 shadow-sm relative overflow-hidden group ring-1 ring-amber-500/10">
              <div className="h-11 w-11 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-amber-900/60 uppercase tracking-widest">Amount Approved</h4>
                <p className="text-2xl font-bold text-amber-950 tracking-tight leading-none">₹{reports.filter(r => r.status === "approved" || r.status === "paid").reduce((sum, r) => sum + r.approvedAmount, 0).toLocaleString()}</p>
              </div>
              <div className="ml-auto">
                <div className="h-9 w-9 rounded-full border-4 border-amber-900/10 flex items-center justify-center bg-white/20">
                  <div className="h-5 w-5 rounded-full bg-amber-600 animate-pulse" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salesman-wise Breakdown */}
      <div className="mb-3">
        <h2 className="text-base font-semibold">Salesman-wise Expense Breakdown</h2>
      </div>
      <DataGrid
        data={salesmanExpenses
          .filter((s) => s.reportCount > 0)
          .sort((a, b) => b.totalAmount - a.totalAmount)}
        columns={[
          {
            key: "name",
            header: "Salesman",
            sortable: true,
            filterable: true,
            width: 220,
            render: (value, row) => (
              <div>
                <div className="font-semibold text-sm">{value}</div>
                <div className="text-xs text-muted-foreground">{row.id}</div>
              </div>
            ),
          },
          {
            key: "reportCount",
            header: "Reports",
            type: "number",
            sortable: true,
            width: 100,
            align: "center",
            render: (value) => (
              <Badge variant="secondary" className="text-xs">
                {value}
              </Badge>
            ),
          },
          {
            key: "totalAmount",
            header: "Total Amount",
            type: "number",
            sortable: true,
            width: 150,
            render: (value) => (
              <span className="font-semibold">₹{value.toLocaleString()}</span>
            ),
          },
          {
            key: "paidAmount",
            header: "Paid Amount",
            type: "number",
            sortable: true,
            width: 150,
            render: (value) => (
              <span className="text-green-600 font-medium">
                ₹{value.toLocaleString()}
              </span>
            ),
          },
          {
            key: "pendingAmount",
            header: "Pending Amount",
            type: "number",
            sortable: true,
            width: 150,
            render: (value) => (
              <span className="text-purple-600 font-medium">
                ₹{value.toLocaleString()}
              </span>
            ),
          },
          {
            key: "violationCount",
            header: "Violations",
            type: "number",
            sortable: true,
            width: 130,
            align: "center",
            render: (value) =>
              value > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {value}
                </Badge>
              ) : (
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  None
                </Badge>
              ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            width: 120,
            align: "center",
            render: (value, row) =>
              row.pendingAmount > 0 ? (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-green-500 hover:bg-green-600 text-white">
                  Settled
                </Badge>
              ),
          },
        ]}
        density="comfortable"
        striped={true}
        emptyMessage="No expense data found for salesmen"
        emptyIcon={<Users className="h-12 w-12" />}
      />
    </PageContainer>
  );
}
