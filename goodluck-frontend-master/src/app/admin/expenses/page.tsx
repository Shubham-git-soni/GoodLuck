"use client";

import { useState, useEffect } from "react";
import { FileText, DollarSign, AlertTriangle, TrendingUp, Eye, CheckCircle2, XCircle, CreditCard } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminExpensesPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [salesmanFilter, setSalesmanFilter] = useState("all");
  const [violationFilter, setViolationFilter] = useState("all");

  useEffect(() => {
    const reportsData = require("@/lib/mock-data/expense-reports.json");
    const salesmenData = require("@/lib/mock-data/salesmen.json");

    setReports(reportsData);
    setSalesmen(salesmenData);
  }, []);

  const filteredReports = reports.filter((report) => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    if (salesmanFilter !== "all" && report.salesmanId !== salesmanFilter) return false;
    if (violationFilter === "yes" && report.policyViolations === 0) return false;
    if (violationFilter === "no" && report.policyViolations > 0) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-500", label: "Pending" },
      approved: { color: "bg-blue-500", label: "Approved" },
      paid: { color: "bg-green-500", label: "Paid" },
      rejected: { color: "bg-red-500", label: "Rejected" },
    };
    return config[status] || config.pending;
  };

  const handleApprove = (reportId: string, reportTitle: string) => {
    toast({
      title: "Report Approved",
      description: `"${reportTitle}" has been approved for payment`,
    });
    // Update report status logic here
  };

  const handleReject = (reportId: string, reportTitle: string) => {
    toast({
      title: "Report Rejected",
      description: `"${reportTitle}" has been rejected`,
      variant: "destructive",
    });
    // Update report status logic here
  };

  const handleMarkAsPaid = (reportId: string, reportTitle: string) => {
    toast({
      title: "Payment Processed",
      description: `"${reportTitle}" marked as paid`,
    });
    // Update report status logic here
  };

  // Summary calculations
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const approvedReports = reports.filter((r) => r.status === "approved").length;
  const totalPendingAmount = reports
    .filter((r) => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const violationReports = reports.filter((r) => r.policyViolations > 0).length;

  return (
    <PageContainer>
      <div className="mb-6">
        <PageHeader
          title="Expense Reports"
          description="Review and approve expense reports from all salesmen"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvedReports}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{totalPendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">To be paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{violationReports}</div>
            <p className="text-xs text-muted-foreground">Reports flagged</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Expense Reports</CardTitle>
            <Link href="/admin/expenses/reports">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Salesmen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesmen</SelectItem>
                  {salesmen.map((salesman) => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={violationFilter} onValueChange={setViolationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Policy Violations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="yes">With Violations</SelectItem>
                  <SelectItem value="no">No Violations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reports Table */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                No expense reports match the current filters
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Salesman</TableHead>
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
                {filteredReports.map((report) => {
                  const statusBadge = getStatusBadge(report.status);
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{report.salesmanName}</div>
                        <div className="text-xs text-muted-foreground">
                          {report.salesmanId}
                        </div>
                      </TableCell>
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
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/expenses/${report.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {report.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(report.id, report.reportTitle)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(report.id, report.reportTitle)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {report.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsPaid(report.id, report.reportTitle)}
                            >
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
