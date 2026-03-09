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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function MyExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    import("@/lib/dummy-api").then(({ getExpenses, getExpenseReports }) =>
      Promise.all([
        getExpenses({ salesmanId: "SM001" }),
        getExpenseReports({ salesmanId: "SM001" }),
      ]).then(([e, r]) => { setExpenses(e); setReports(r); })
    );
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
      <div className="flex items-start justify-between gap-3 mb-6">
        <PageHeader
          title="My Expenses"
          description="Manage your expenses and expense reports"
        />
        <Link href="/salesman/expenses/add" className="shrink-0">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Summary Cards — 2×2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold">{draftExpenses.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Draft Expenses</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">₹{totalDraftAmount.toLocaleString()}</span> total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">{draftViolations}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Policy Warnings</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">In draft expenses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-amber-600">{reports.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Reports</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">All time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">
              ₹{reports
                .filter((r) => r.status === "pending" || r.status === "approved")
                .reduce((sum, r) => sum + r.totalAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending Amount</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Draft Expenses and Reports */}
      <Tabs defaultValue="drafts" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="drafts" className="text-xs sm:text-sm">
            Drafts ({draftExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">
            Reports ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* Draft Expenses Tab */}
        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle>Draft Expenses</CardTitle>
                {draftExpenses.length > 0 && (
                  <Link href="/salesman/expenses/create-report">
                    <Button size="sm">
                      <FileText className="h-4 w-4 mr-1.5" />
                      Create Report
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
                <div className="space-y-3">
                  {draftExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-start gap-3 p-3 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{expense.expenseType}</Badge>
                          <span className="font-bold text-base">₹{expense.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{expense.description || "—"}</p>
                        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {expense.hasReceipt ? (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />Receipt
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-orange-600 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />No Receipt
                              </Badge>
                            )}
                            {expense.policyViolation ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />Warning
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500 text-white text-xs">Draft</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  {reports.map((report) => {
                    const statusBadge = getReportStatusBadge(report.status);
                    return (
                      <div key={report.id} className="p-3 rounded-xl border bg-background hover:bg-muted/40 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{report.reportTitle}</p>
                            <p className="text-xs text-muted-foreground">{report.id}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge className={`${statusBadge.color} text-white text-xs`}>{statusBadge.label}</Badge>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{new Date(report.dateSubmitted).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">{report.expenseCount} items</Badge>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {report.policyViolations > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />{report.policyViolations} warning{report.policyViolations > 1 ? "s" : ""}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />Clean
                              </Badge>
                            )}
                            <span className="font-bold text-sm">₹{report.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        {(report.startDate || report.endDate) && (
                          <p className="text-xs text-muted-foreground mt-1.5">{report.startDate} – {report.endDate}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
