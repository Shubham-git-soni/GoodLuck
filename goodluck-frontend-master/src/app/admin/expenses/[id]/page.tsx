"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, XCircle, CreditCard, Download, MessageSquare } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminExpenseReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const reportId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [adminComments, setAdminComments] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const reportsData = require("@/lib/mock-data/expense-reports.json");
    const expensesData = require("@/lib/mock-data/expenses.json");

    const currentReport = reportsData.find((r: any) => r.id === reportId);
    if (currentReport) {
      setReport(currentReport);
      setAdminComments(currentReport.adminComments || "");

      // Get expenses for this report
      const reportExpenses = expensesData.filter(
        (e: any) => e.reportId === reportId
      );
      setExpenses(reportExpenses);
    }
    setLoading(false);
  }, [reportId]);

  if (loading) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </PageContainer>
    );
  }

  if (!report) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
          <Link href="/admin/expenses">
            <Button>Back to Reports</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Helper functions - now safe to use report
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-500", label: "Pending" },
      approved: { color: "bg-blue-500", label: "Approved" },
      paid: { color: "bg-green-500", label: "Paid" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    };
    return config[status] || config.pending;
  };

  const handleApproveReport = () => {
    if (!adminComments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please add admin comments before approving",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Approved",
      description: `"${report.reportTitle}" has been approved for payment`,
    });
    router.push("/admin/expenses");
  };

  const handleRejectReport = () => {
    if (!adminComments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please add rejection reason before rejecting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Rejected",
      description: `"${report.reportTitle}" has been rejected`,
      variant: "destructive",
    });
    router.push("/admin/expenses");
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Payment Processed",
      description: `"${report.reportTitle}" marked as paid`,
    });
    router.push("/admin/expenses");
  };

  const statusBadge = getStatusBadge(report.status);

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/admin/expenses">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Reports
          </Button>
        </Link>
        <PageHeader
          title={`Report: ${report.reportTitle}`}
          description={`Review and approve expense report from ${report.salesmanName}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Report Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report ID</p>
                  <p className="font-semibold">{report.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={`${statusBadge.color} text-white`}>
                    {statusBadge.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Salesman</p>
                  <p className="font-semibold">{report.salesmanName}</p>
                  <p className="text-xs text-muted-foreground">{report.salesmanId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Submitted</p>
                  <p className="font-semibold">
                    {new Date(report.dateSubmitted).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Range</p>
                  <p className="font-semibold">
                    {report.startDate} to {report.endDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="font-semibold">{report.expenseCount} items</p>
                </div>
              </div>

              {report.notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Salesman Notes</p>
                  <p className="text-sm">{report.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Items */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Items ({expenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
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
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Missing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.policyViolation ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Violation
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {report.policyViolations > 0 && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-700 dark:text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      <strong>Policy Violations Detected:</strong> {report.policyViolations}{" "}
                      expense(s) exceed policy limits. Review carefully before approving.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Admin Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="adminComments">
                  Comments {report.status === "pending" && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="adminComments"
                  placeholder="Add comments about this expense report..."
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  rows={4}
                  disabled={report.status === "paid" || report.status === "rejected"}
                />
                {report.status === "pending" && (
                  <p className="text-xs text-muted-foreground">
                    Comments are required before approving or rejecting this report
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Total Items</span>
                  <span className="text-lg font-bold">{report.expenseCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{report.totalAmount.toLocaleString()}
                  </span>
                </div>

                {report.approvedAmount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Approved Amount
                    </span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      ₹{report.approvedAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {report.policyViolations > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Violations
                    </span>
                    <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                      {report.policyViolations}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {report.status === "pending" && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleApproveReport}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Report
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleRejectReport}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Report
                    </Button>
                  </>
                )}

                {report.status === "approved" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleMarkAsPaid}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}

                {(report.status === "paid" || report.status === "rejected") && (
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      This report has been {report.status}
                    </p>
                  </div>
                )}
              </div>

              {report.approvedBy && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">
                    {report.status === "rejected" ? "Rejected By" : "Approved By"}
                  </p>
                  <p className="font-medium text-sm">{report.approvedBy || report.rejectedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      report.approvedAt || report.rejectedAt
                    ).toLocaleString()}
                  </p>
                </div>
              )}

              {report.status === "paid" && report.paidAt && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Payment Date</p>
                  <p className="font-medium text-sm">
                    {new Date(report.paidAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
