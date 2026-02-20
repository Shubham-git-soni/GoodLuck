"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Calendar, DollarSign, AlertTriangle, Eye, Edit, Trash2, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function MyExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const expensesData = require("@/lib/mock-data/expenses.json");
    const reportsData = require("@/lib/mock-data/expense-reports.json");

    // Filter for current salesman (SM001 for demo)
    const myExpenses = expensesData.filter((e: any) => e.salesmanId === "SM001");
    const myReports = reportsData.filter((r: any) => r.salesmanId === "SM001");

    setExpenses(myExpenses);
    setReports(myReports);
  }, []);

  const draftExpenses = expenses.filter((e) => e.status === "draft");
  const submittedExpenses = expenses.filter((e) => e.reportId !== null);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      draft: { color: "bg-gray-500", label: "Draft" },
      submitted: { color: "bg-yellow-500", label: "Pending" },
      approved: { color: "bg-blue-500", label: "Approved" },
      paid: { color: "bg-green-500", label: "Paid" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    };
    return config[status] || config.draft;
  };

  const getReportStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-500", label: "Pending" },
      approved: { color: "bg-blue-500", label: "Approved" },
      paid: { color: "bg-green-500", label: "Paid" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    };
    return config[status] || config.pending;
  };

  const totalDraftAmount = draftExpenses.reduce((sum, e) => sum + e.amount, 0);
  const draftViolations = draftExpenses.filter((e) => e.policyViolation).length;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="My Expenses"
          description="Manage your expenses and expense reports"
        />
        <Link href="/salesman/expenses/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalDraftAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftViolations}</div>
            <p className="text-xs text-muted-foreground">In draft expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{reports
                .filter((r) => r.status === "pending" || r.status === "approved")
                .reduce((sum, r) => sum + r.totalAmount, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Draft Expenses and Reports */}
      <Tabs defaultValue="drafts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drafts">
            Draft Expenses ({draftExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Expense Reports ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* Draft Expenses Tab */}
        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Draft Expenses</CardTitle>
                {draftExpenses.length > 0 && (
                  <Link href="/salesman/expenses/create-report">
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Report from Drafts
                    </Button>
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Add expenses to a report before submitting for approval
              </p>
            </CardHeader>
            <CardContent>
              {draftExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Draft Expenses</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first expense
                  </p>
                  <Link href="/salesman/expenses/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.expenseType}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell>
                          {expense.hasReceipt ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {expense.policyViolation ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Policy Warning
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500 text-white">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your submitted expense reports and their approval status
              </p>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground">
                    Create your first expense report from draft expenses
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const statusBadge = getReportStatusBadge(report.status);
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.id}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <div className="font-medium">{report.reportTitle}</div>
                            <div className="text-xs text-muted-foreground">
                              {report.startDate} to {report.endDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(report.dateSubmitted).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{report.expenseCount}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{report.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {report.policyViolations > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {report.policyViolations}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                None
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusBadge.color} text-white`}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
