"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Users, FileText, Download, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
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

export default function AdminExpenseAnalyticsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2025-12");

  useEffect(() => {
    const reportsData = require("@/lib/mock-data/expense-reports.json");
    const expensesData = require("@/lib/mock-data/expenses.json");
    const salesmenData = require("@/lib/mock-data/salesmen.json");

    setReports(reportsData);
    setExpenses(expensesData);
    setSalesmen(salesmenData);
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
            <p className="text-xl font-bold tracking-tight">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Expenses</p>
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
            <p className="text-xl font-bold tracking-tight">₹{paidExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paid Amount</p>
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
            <p className="text-xl font-bold tracking-tight">₹{pendingExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending Amount</p>
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
            <p className="text-xl font-bold tracking-tight">{violationCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Policy Violations</p>
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
        {/* Expense by Type */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Expenses by Type</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Breakdown of expenses across categories</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {expenseTypeData
                .sort((a, b) => b.amount - a.amount)
                .map((item, index) => {
                  const percentage = (item.amount / totalExpenses) * 100;
                  const colors = [
                    'bg-gradient-to-r from-blue-500 to-blue-600',
                    'bg-gradient-to-r from-green-500 to-green-600',
                    'bg-gradient-to-r from-purple-500 to-purple-600',
                    'bg-gradient-to-r from-orange-500 to-orange-600',
                    'bg-gradient-to-r from-pink-500 to-pink-600',
                  ];
                  const bgColors = [
                    'bg-blue-50 dark:bg-blue-950/20',
                    'bg-green-50 dark:bg-green-950/20',
                    'bg-purple-50 dark:bg-purple-950/20',
                    'bg-orange-50 dark:bg-orange-950/20',
                    'bg-pink-50 dark:bg-pink-950/20',
                  ];
                  return (
                    <div key={item.type} className={`p-3 rounded-lg ${bgColors[index % bgColors.length]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{item.type}</span>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-sm font-bold">
                            ₹{item.amount.toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-white dark:bg-gray-800 rounded-full h-2.5 shadow-inner">
                        <div
                          className={`${colors[index % colors.length]} h-2.5 rounded-full transition-all duration-500 shadow-md`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Monthly Summary</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Current month statistics</p>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-12">December 2025</SelectItem>
                  <SelectItem value="2025-11">November 2025</SelectItem>
                  <SelectItem value="2025-10">October 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Total Reports
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {reports.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                      Submitted Amount
                    </p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      ₹{totalExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Approved Amount
                    </p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      ₹
                      {reports
                        .filter((r) => r.status === "approved" || r.status === "paid")
                        .reduce((sum, r) => sum + r.approvedAmount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salesman-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Salesman-wise Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
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
                key: "pendingAmount",
                header: "Status",
                sortable: true,
                width: 120,
                align: "center",
                render: (value) =>
                  value > 0 ? (
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
        </CardContent>
      </Card>
    </PageContainer>
  );
}
