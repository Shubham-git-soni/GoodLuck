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
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminExpensesPage() {
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
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-yellow-100">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{pendingReports}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending Review</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{approvedReports}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Approved</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Pending payment</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">
              ₹{totalPendingAmount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Pending</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">To be paid</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{violationReports}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Policy Violations</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Reports flagged</p>
            </div>
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

          {/* Reports DataGrid */}
          <DataGrid
            data={filteredReports}
            columns={[
              {
                key: "id",
                header: "Report ID",
                sortable: true,
                filterable: true,
                width: 120,
                render: (value) => (
                  <span className="font-semibold text-primary">{value}</span>
                ),
              },
              {
                key: "salesmanName",
                header: "Salesman",
                sortable: true,
                filterable: true,
                width: 180,
                render: (value, row) => (
                  <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.salesmanId}
                    </div>
                  </div>
                ),
              },
              {
                key: "reportTitle",
                header: "Title",
                sortable: true,
                filterable: true,
                width: 200,
                render: (value, row) => (
                  <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.startDate} to {row.endDate}
                    </div>
                  </div>
                ),
              },
              {
                key: "dateSubmitted",
                header: "Submitted",
                sortable: true,
                width: 120,
                render: (value) => (
                  <span className="text-sm">
                    {new Date(value).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "expenseCount",
                header: "Items",
                sortable: true,
                width: 100,
                render: (value) => (
                  <Badge variant="secondary" className="font-medium">
                    {value}
                  </Badge>
                ),
              },
              {
                key: "totalAmount",
                header: "Total Amount",
                sortable: true,
                width: 150,
                render: (value) => (
                  <span className="font-semibold text-lg">
                    ₹{value.toLocaleString()}
                  </span>
                ),
              },
              {
                key: "policyViolations",
                header: "Violations",
                sortable: true,
                width: 120,
                render: (value) =>
                  value > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {value}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white text-xs">
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
                render: (value) => {
                  const statusBadge = getStatusBadge(value);
                  return (
                    <Badge className={`${statusBadge.color} text-white`}>
                      {statusBadge.label}
                    </Badge>
                  );
                },
              },
            ]}
            rowActions={(row) => {
              const actions: RowAction[] = [
                {
                  label: "View Details",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: (row) => {
                    window.location.href = `/admin/expenses/${row.id}`;
                  },
                },
              ];

              if (row.status === "pending") {
                actions.push(
                  {
                    label: "Approve",
                    icon: <CheckCircle2 className="h-4 w-4" />,
                    onClick: (row) => handleApprove(row.id, row.reportTitle),
                  },
                  {
                    label: "Reject",
                    icon: <XCircle className="h-4 w-4" />,
                    onClick: (row) => handleReject(row.id, row.reportTitle),
                    danger: true,
                  }
                );
              }

              if (row.status === "approved") {
                actions.push({
                  label: "Mark as Paid",
                  icon: <CreditCard className="h-4 w-4" />,
                  onClick: (row) => handleMarkAsPaid(row.id, row.reportTitle),
                });
              }

              return actions;
            }}
            density="comfortable"
            striped={true}
            emptyState={{
              icon: <FileText className="h-12 w-12" />,
              title: "No Reports Found",
              description: "No expense reports match the current filters",
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
