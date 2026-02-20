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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    alert("Export to Excel functionality would be implemented here");
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Expense Analytics"
            description="Comprehensive expense reports and analytics"
          />
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{paidExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((paidExpenses / totalExpenses) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{pendingExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reports.filter((r) => r.status === "pending" || r.status === "approved").length} reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{violationCount}</div>
            <p className="text-xs text-muted-foreground">
              {((violationCount / expenses.length) * 100).toFixed(1)}% of expenses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Expense by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseTypeData
                .sort((a, b) => b.amount - a.amount)
                .map((item) => {
                  const percentage = (item.amount / totalExpenses) * 100;
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.type}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">
                            ₹{item.amount.toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Summary</CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[150px]">
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
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{reports.length}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted Amount</p>
                    <p className="text-2xl font-bold">
                      ₹{totalExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Approved Amount</p>
                    <p className="text-2xl font-bold">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesman</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesmanExpenses
                .filter((s) => s.reportCount > 0)
                .sort((a, b) => b.totalAmount - a.totalAmount)
                .map((salesman) => (
                  <TableRow key={salesman.id}>
                    <TableCell>
                      <div className="font-medium">{salesman.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {salesman.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{salesman.reportCount}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{salesman.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ₹{salesman.paidAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-purple-600 font-medium">
                      ₹{salesman.pendingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {salesman.violationCount > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {salesman.violationCount}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          None
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {salesman.pendingAmount > 0 ? (
                        <Badge className="bg-yellow-500 text-white">Pending</Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">Settled</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
