"use client";

import { useState, useEffect } from "react";
import { FileText, DollarSign, AlertTriangle, Eye, CheckCircle2, XCircle, CreditCard, Clock, CheckCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataGrid, RowAction } from "@/components/ui/data-grid";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminExpensesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState("all");

  useEffect(() => {
    const reportsData = require("@/lib/mock-data/expense-reports.json");
    setReports(reportsData);
  }, []);

  // Filter reports based on status tab
  const filteredReports = reports.filter((report) => {
    if (statusTab === "all") return true;
    if (statusTab === "pending") return report.status === "pending";
    if (statusTab === "approved") return report.status === "approved";
    if (statusTab === "paid") return report.status === "paid";
    if (statusTab === "rejected") return report.status === "rejected";
    if (statusTab === "violations") return report.policyViolations > 0;
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
    toast.success("Report Approved", {
      description: `"${reportTitle}" has been approved for payment`,
    });
    setTimeout(() => { if (changed) toast.success(`"${row.reportTitle}" approved`); }, 0);
  };

  const handleReject = (reportId: string, reportTitle: string) => {
    toast.error("Report Rejected", {
      description: `"${reportTitle}" has been rejected`,
    });
    setTimeout(() => { if (changed) toast.error(`"${row.reportTitle}" rejected`); }, 0);
  };

  const handleMarkAsPaid = (reportId: string, reportTitle: string) => {
    toast.success("Payment Processed", {
      description: `"${reportTitle}" marked as paid`,
    });
    setTimeout(() => { if (changed) toast.success(`"${row.reportTitle}" marked as paid`); }, 0);
  };

  // ── Status badge helper ───────────────────────────────────────────────────
  const statusConfig: Record<string, { className: string; label: string }> = {
    pending:  { className: "bg-yellow-500 text-white",  label: "Pending"  },
    approved: { className: "bg-blue-500 text-white",    label: "Approved" },
    paid:     { className: "bg-green-600 text-white",   label: "Paid"     },
    rejected: { className: "bg-red-500 text-white",     label: "Rejected" },
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns: GridColumn<any>[] = [
    {
      key: "id",
      header: "Report ID",
      sortable: true,
      filterable: true,
      width: 110,
      render: (v) => <span className="font-semibold text-primary text-sm">{v}</span>,
    },
    {
      key: "salesmanName",
      header: "Salesman",
      sortable: true,
      filterable: true,
      width: 160,
      render: (v, row) => (
        <div>
          <p className="font-medium text-sm leading-tight">{v}</p>
          <p className="text-xs text-muted-foreground">{row.salesmanId}</p>
        </div>
      ),
    },
    {
      key: "reportTitle",
      header: "Title",
      sortable: true,
      filterable: true,
      width: 210,
      render: (v, row) => (
        <div>
          <p className="font-medium text-sm leading-tight">{v}</p>
          <p className="text-xs text-muted-foreground">{row.startDate} → {row.endDate}</p>
        </div>
      ),
    },
    {
      key: "dateSubmitted",
      header: "Submitted",
      sortable: true,
      filterable: true,
      width: 120,
      type: "date",
      render: (v) => <span className="text-sm">{new Date(v).toLocaleDateString()}</span>,
    },
    {
      key: "expenseCount",
      header: "Items",
      sortable: true,
      width: 80,
      align: "center",
      render: (v) => <Badge variant="secondary" className="font-semibold">{v}</Badge>,
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      sortable: true,
      width: 140,
      align: "right",
      render: (v) => <span className="font-bold text-sm">₹{v.toLocaleString()}</span>,
    },
    {
      key: "policyViolations",
      header: "Violations",
      sortable: true,
      width: 120,
      align: "center",
      render: (v) =>
        v > 0 ? (
          <Badge variant="destructive" className="text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />{v}
          </Badge>
        ) : (
          <Badge className="bg-green-500 text-white text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" />None
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      width: 110,
      render: (v) => {
        const cfg = statusConfig[v] ?? statusConfig.pending;
        return <Badge className={cfg.className}>{cfg.label}</Badge>;
      },
    },
  ];

  // ── Row actions (dynamic per status) ─────────────────────────────────────
  const rowActions = (row: any): RowAction<any>[] => {
    const actions: RowAction<any>[] = [
      {
        label: "View",
        icon: <Eye className="h-3.5 w-3.5" />,
        onClick: (r) => { window.location.href = `/admin/expenses/${r.id}`; },
      },
    ];
    if (row.status === "pending") {
      actions.push(
        {
          label: "Approve",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          onClick: handleApprove,
        },
        {
          label: "Reject",
          icon: <XCircle className="h-3.5 w-3.5" />,
          onClick: handleReject,
          danger: true,
        }
      );
    }
    if (row.status === "approved") {
      actions.push({
        label: "Mark Paid",
        icon: <CreditCard className="h-3.5 w-3.5" />,
        onClick: handleMarkAsPaid,
      });
    }
    return actions;
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <PageHeader
          title="All Expense Reports"
          description="Review and approve expense reports from all salesmen"
        />
        <Link href="/admin/expenses/reports">
          <Button variant="outline" size="sm" className="shrink-0 mt-1">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold">₹{totalPending.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold">{violationCount}</p>
                <p className="text-xs text-muted-foreground">Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex bg-muted/50 p-1 rounded-2xl mb-6 overflow-x-auto no-scrollbar border w-max">
        <button
          onClick={() => setStatusTab("all")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "all" ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <FileText className={`h-4 w-4 ${statusTab === "all" ? "text-primary" : "text-muted-foreground"}`} />
          All Reports
          <Badge variant={statusTab === "all" ? "default" : "secondary"} className="ml-1 text-[10px] h-4 px-1">{reports.length}</Badge>
        </button>
        <button
          onClick={() => setStatusTab("pending")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "pending" ? "bg-background text-yellow-600 shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <Clock className={`h-4 w-4 ${statusTab === "pending" ? "text-yellow-600" : "text-muted-foreground"}`} />
          Pending Review
          <Badge variant={statusTab === "pending" ? "default" : "secondary"} className={`ml-1 text-[10px] h-4 px-1 ${statusTab === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}>{reports.filter(r => r.status === "pending").length}</Badge>
        </button>
        <button
          onClick={() => setStatusTab("approved")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "approved" ? "bg-background text-blue-600 shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <CheckCircle2 className={`h-4 w-4 ${statusTab === "approved" ? "text-blue-600" : "text-muted-foreground"}`} />
          Approved
          <Badge variant={statusTab === "approved" ? "default" : "secondary"} className={`ml-1 text-[10px] h-4 px-1 ${statusTab === "approved" ? "bg-blue-600 hover:bg-blue-700" : ""}`}>{reports.filter(r => r.status === "approved").length}</Badge>
        </button>
        <button
          onClick={() => setStatusTab("paid")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "paid" ? "bg-background text-green-600 shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <DollarSign className={`h-4 w-4 ${statusTab === "paid" ? "text-green-600" : "text-muted-foreground"}`} />
          Paid
          <Badge variant={statusTab === "paid" ? "default" : "secondary"} className={`ml-1 text-[10px] h-4 px-1 ${statusTab === "paid" ? "bg-green-600 hover:bg-green-700" : ""}`}>{reports.filter(r => r.status === "paid").length}</Badge>
        </button>
        <button
          onClick={() => setStatusTab("rejected")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "rejected" ? "bg-background text-red-600 shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <XCircle className={`h-4 w-4 ${statusTab === "rejected" ? "text-red-600" : "text-muted-foreground"}`} />
          Rejected
          <Badge variant={statusTab === "rejected" ? "default" : "secondary"} className={`ml-1 text-[10px] h-4 px-1 ${statusTab === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}`}>{reports.filter(r => r.status === "rejected").length}</Badge>
        </button>
        <button
          onClick={() => setStatusTab("violations")}
          className={`flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${statusTab === "violations" ? "bg-background text-orange-600 shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"}`}
        >
          <AlertTriangle className={`h-4 w-4 ${statusTab === "violations" ? "text-orange-600" : "text-muted-foreground"}`} />
          Violations
          <Badge variant={statusTab === "violations" ? "default" : "secondary"} className={`ml-1 text-[10px] h-4 px-1 ${statusTab === "violations" ? "bg-orange-600 hover:bg-orange-700" : ""}`}>{reports.filter(r => r.policyViolations > 0).length}</Badge>
        </button>
      </div>
      {/* Reports DataGrid */}
      <DataGrid
        data={filteredReports}
        selectable
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
        emptyIcon={<FileText className="h-12 w-12" />}
        emptyMessage="No expense reports match the current filters"
      />
    </PageContainer>
  );
}
