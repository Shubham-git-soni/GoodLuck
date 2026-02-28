"use client";

import { useState, useEffect } from "react";
import { FileText, AlertTriangle, CheckCircle2, XCircle, CreditCard, TrendingUp, Eye, DollarSign } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminExpensesPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const reportsData = require("@/lib/mock-data/expense-reports.json");
    setReports(reportsData);
  }, []);

  // ── Summary counts ────────────────────────────────────────────────────────
  const pendingCount   = reports.filter(r => r.status === "pending").length;
  const approvedCount  = reports.filter(r => r.status === "approved").length;
  const totalPending   = reports.filter(r => r.status === "pending" || r.status === "approved").reduce((s, r) => s + r.totalAmount, 0);
  const violationCount = reports.filter(r => r.policyViolations > 0).length;

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleApprove = (row: any) => {
    let changed = false;
    setReports(prev => {
      if (prev.find(r => r.id === row.id)?.status === "approved") return prev;
      changed = true;
      return prev.map(r => r.id === row.id ? { ...r, status: "approved" } : r);
    });
    setTimeout(() => { if (changed) toast.success(`"${row.reportTitle}" approved`); }, 0);
  };

  const handleReject = (row: any) => {
    let changed = false;
    setReports(prev => {
      if (prev.find(r => r.id === row.id)?.status === "rejected") return prev;
      changed = true;
      return prev.map(r => r.id === row.id ? { ...r, status: "rejected" } : r);
    });
    setTimeout(() => { if (changed) toast.error(`"${row.reportTitle}" rejected`); }, 0);
  };

  const handleMarkAsPaid = (row: any) => {
    let changed = false;
    setReports(prev => {
      if (prev.find(r => r.id === row.id)?.status === "paid") return prev;
      changed = true;
      return prev.map(r => r.id === row.id ? { ...r, status: "paid" } : r);
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

      {/* DataGrid */}
      <DataGrid
        data={reports}
        columns={columns}
        rowKey="id"
        rowActions={rowActions}
        title="Expense Reports"
        density="compact"
        striped
        inlineFilters
        enableRowPinning
        enableColumnPinning
        showStats
        emptyMessage="No expense reports found."
        emptyIcon={<FileText className="h-10 w-10" />}
        quickFilters={[
          { key: "status_pending",  field: "status", label: "Pending",  value: "pending"  },
          { key: "status_approved", field: "status", label: "Approved", value: "approved" },
          { key: "status_paid",     field: "status", label: "Paid",     value: "paid"     },
          { key: "status_rejected", field: "status", label: "Rejected", value: "rejected" },
        ]}
        maxHeight={560}
      />
    </PageContainer>
  );
}
