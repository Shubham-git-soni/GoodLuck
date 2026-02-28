"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, XCircle, CreditCard, Download, MessageSquare, Eye } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
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

  const expenseColumns: GridColumn<any>[] = [
    {
      key: "date",
      header: "Date",
      type: "date",
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "expenseType",
      header: "Type",
      sortable: true,
      filterable: true,
      width: 150,
      render: (v) => <Badge variant="outline">{v}</Badge>
    },
    {
      key: "amount",
      header: "Amount",
      type: "number",
      sortable: true,
      align: "right",
      width: 120,
      render: (v) => <span className="font-semibold tabular-nums">₹{v.toLocaleString()}</span>
    },
    {
      key: "description",
      header: "Description",
      width: 250,
      render: (v) => <span className="truncate block w-[250px]" title={v}>{v || "-"}</span>
    },
    {
      key: "hasReceipt",
      header: "Receipt",
      align: "center",
      width: 120,
      render: (v) => v ? (
        <Button variant="ghost" size="sm" className="h-8">
          <Download className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
      ) : (
        <Badge variant="outline" className="text-orange-600 bg-orange-50 dark:bg-orange-950/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Missing
        </Badge>
      )
    },
    {
      key: "policyViolation",
      header: "Status",
      align: "center",
      width: 120,
      render: (v) => v ? (
        <Badge variant="destructive" className="text-[11px] h-6 px-1.5">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Violation
        </Badge>
      ) : (
        <Badge className="bg-green-500 text-white text-[11px] h-6 px-1.5 hover:bg-green-600 border-0">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          OK
        </Badge>
      )
    }
  ];

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
          {/* Compact Report Information */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 p-5 bg-card border rounded-xl shadow-sm">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Report ID</p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold">{report.id}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <Badge className={`${statusBadge.color} text-white text-[11px] h-5`}>
                {statusBadge.label}
              </Badge>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Salesman</p>
              <p className="text-sm font-semibold text-foreground">{report.salesmanName}</p>
              <p className="text-[11px] text-muted-foreground">{report.salesmanId}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Date Range</p>
              <p className="text-sm font-semibold">{report.startDate} to {report.endDate}</p>
              <p className="text-[11px] text-muted-foreground">Submitted: {new Date(report.dateSubmitted).toLocaleDateString()}</p>
            </div>
            {report.notes && (
              <div className="col-span-2 lg:col-span-4 mt-2 pt-3 border-t">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Salesman Notes</p>
                <p className="text-sm italic text-muted-foreground bg-muted/30 p-2 rounded-md border-l-2 border-primary/50">{report.notes}</p>
              </div>
            )}
          </div>

          {/* Expense Items */}
          <div className="space-y-4">
            <DataGrid
              data={expenses}
              columns={expenseColumns}
              rowActions={[
                {
                  label: "View Receipt",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (row) => {
                    if (row.hasReceipt) {
                      toast({ title: "View Receipt", description: `Viewing receipt for ${row.expenseType}` });
                    } else {
                      toast({ title: "No Receipt", description: "This expense does not have a receipt attached.", variant: "destructive" });
                    }
                  },
                }
              ]}
              title={`Expense Items (${expenses.length})`}
              rowKey="id"
              striped
              density="compact"
              emptyMessage="No expense items found"
              emptyIcon={<FileText className="h-10 w-10 text-muted-foreground" />}
            />

            {report.policyViolations > 0 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-700 dark:text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
                    <strong>Policy Violations Detected:</strong> {report.policyViolations}{" "}
                    expense(s) exceed policy limits. Review carefully before approving.
                  </p>
                </div>
              </div>
            )}
          </div>

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
        <div className="space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-base font-semibold">Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
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
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      Violations
                    </span>
                    <span className="text-lg font-bold text-red-700 dark:text-red-400">
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
