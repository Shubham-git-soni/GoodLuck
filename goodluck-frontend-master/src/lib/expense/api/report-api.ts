// ============================================================
// Report API Service (Fake)
// ============================================================

import type { ExpenseReport, ReportFilters } from '../types';
import { getReports, setReports, getExpenses, setExpenses, addAuditEntry } from '../store';
import { generateId, now, randomDelay } from '../utils/formatters';
import { API_DELAY_MIN, API_DELAY_MAX } from '../utils/constants';

// ─── Read ────────────────────────────────────────────────────

export async function fetchReports(filters?: ReportFilters): Promise<ExpenseReport[]> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    let result = [...getReports()];

    if (!filters) return result;

    if (filters.salesmanId) {
        result = result.filter((r) => r.salesmanId === filters.salesmanId);
    }
    if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        result = result.filter((r) => statuses.includes(r.status));
    }
    if (filters.dateFrom) {
        result = result.filter((r) => r.dateSubmitted >= filters.dateFrom!);
    }
    if (filters.dateTo) {
        result = result.filter((r) => r.dateSubmitted <= filters.dateTo!);
    }
    if (filters.hasViolations !== undefined) {
        result = result.filter((r) =>
            filters.hasViolations ? r.policyViolations > 0 : r.policyViolations === 0
        );
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
            (r) =>
                r.reportTitle.toLowerCase().includes(q) ||
                r.salesmanName.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q)
        );
    }
    if (filters.sortBy) {
        const dir = filters.sortOrder === 'desc' ? -1 : 1;
        result.sort((a, b) => {
            const aVal = a[filters.sortBy!];
            const bVal = b[filters.sortBy!];
            if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
            return String(aVal).localeCompare(String(bVal)) * dir;
        });
    }

    return result;
}

export async function fetchReportById(id: string): Promise<ExpenseReport | null> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    return getReports().find((r) => r.id === id) || null;
}

// ─── Write ───────────────────────────────────────────────────

export async function createReport(data: {
    salesmanId: string;
    salesmanName: string;
    reportTitle: string;
    notes: string;
    expenseIds: string[];
}): Promise<ExpenseReport> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const expenses = getExpenses();
    const selectedExpenses = expenses.filter((e) => data.expenseIds.includes(e.id));

    const totalAmount = selectedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const violations = selectedExpenses.filter((e) => e.policyViolation).length;
    const dates = selectedExpenses.map((e) => e.date).sort();

    const report: ExpenseReport = {
        id: generateId('RPT'),
        salesmanId: data.salesmanId,
        salesmanName: data.salesmanName,
        reportTitle: data.reportTitle,
        dateSubmitted: now().split('T')[0],
        startDate: dates[0] || now().split('T')[0],
        endDate: dates[dates.length - 1] || now().split('T')[0],
        status: 'pending',
        totalAmount,
        approvedAmount: 0,
        paidAmount: 0,
        expenseCount: selectedExpenses.length,
        expenseIds: data.expenseIds,
        policyViolations: violations,
        adminComments: null,
        notes: data.notes || null,
        fraudRiskScore: 0,
        approvalChain: [
            { level: 1, role: 'Manager', status: 'pending' },
        ],
        currentApprovalLevel: 1,
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        paidAt: null,
        createdAt: now(),
        updatedAt: now(),
    };

    // Update expenses to "submitted" and link to report
    const updatedExpenses = expenses.map((e) => {
        if (data.expenseIds.includes(e.id)) {
            return { ...e, status: 'submitted' as const, reportId: report.id, updatedAt: now() };
        }
        return e;
    });

    setExpenses(updatedExpenses);
    setReports([...getReports(), report]);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'report',
        entityId: report.id,
        action: 'submitted',
        performedBy: data.salesmanName,
        performedAt: now(),
        details: `Submitted report "${data.reportTitle}" with ${selectedExpenses.length} expenses totaling ₹${totalAmount}`,
    });

    return report;
}

export async function approveReport(id: string, adminComments: string, approvedBy: string = 'Admin'): Promise<ExpenseReport> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const reports = getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Report ${id} not found`);

    const updated: ExpenseReport = {
        ...reports[index],
        status: 'approved',
        adminComments,
        approvedAmount: reports[index].totalAmount,
        approvedBy,
        approvedAt: now(),
        updatedAt: now(),
        approvalChain: reports[index].approvalChain.map((step) =>
            step.status === 'pending'
                ? { ...step, status: 'approved' as const, approverName: approvedBy, approvedAt: now(), comments: adminComments }
                : step
        ),
    };

    const newReports = [...reports];
    newReports[index] = updated;
    setReports(newReports);

    // Update linked expenses
    const expenses = getExpenses().map((e) => {
        if (updated.expenseIds.includes(e.id)) {
            return { ...e, status: 'approved' as const, approvedBy, approvedAt: now(), updatedAt: now() };
        }
        return e;
    });
    setExpenses(expenses);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'report',
        entityId: id,
        action: 'approved',
        performedBy: approvedBy,
        performedAt: now(),
        details: `Approved report "${updated.reportTitle}" — ₹${updated.totalAmount}`,
    });

    return updated;
}

export async function rejectReport(id: string, adminComments: string, rejectedBy: string = 'Admin'): Promise<ExpenseReport> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const reports = getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Report ${id} not found`);

    const updated: ExpenseReport = {
        ...reports[index],
        status: 'rejected',
        adminComments,
        rejectedBy,
        rejectedAt: now(),
        updatedAt: now(),
        approvalChain: reports[index].approvalChain.map((step) =>
            step.status === 'pending'
                ? { ...step, status: 'rejected' as const, approverName: rejectedBy, approvedAt: now(), comments: adminComments }
                : step
        ),
    };

    const newReports = [...reports];
    newReports[index] = updated;
    setReports(newReports);

    // Set linked expenses back to draft
    const expenses = getExpenses().map((e) => {
        if (updated.expenseIds.includes(e.id)) {
            return { ...e, status: 'rejected' as const, updatedAt: now() };
        }
        return e;
    });
    setExpenses(expenses);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'report',
        entityId: id,
        action: 'rejected',
        performedBy: rejectedBy,
        performedAt: now(),
        details: `Rejected report "${updated.reportTitle}" — Reason: ${adminComments}`,
    });

    return updated;
}

export async function markReportAsPaid(id: string, paidBy: string = 'Admin'): Promise<ExpenseReport> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const reports = getReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Report ${id} not found`);

    const updated: ExpenseReport = {
        ...reports[index],
        status: 'paid',
        paidAmount: reports[index].approvedAmount,
        paidAt: now(),
        updatedAt: now(),
    };

    const newReports = [...reports];
    newReports[index] = updated;
    setReports(newReports);

    // Update linked expenses
    const expenses = getExpenses().map((e) => {
        if (updated.expenseIds.includes(e.id)) {
            return { ...e, status: 'paid' as const, paidAt: now(), updatedAt: now() };
        }
        return e;
    });
    setExpenses(expenses);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'report',
        entityId: id,
        action: 'paid',
        performedBy: paidBy,
        performedAt: now(),
        details: `Marked report "${updated.reportTitle}" as paid — ₹${updated.paidAmount}`,
    });

    return updated;
}

// ─── Bulk Operations ─────────────────────────────────────────

export async function bulkApproveReports(
    ids: string[],
    adminComments: string,
    approvedBy: string = 'Admin'
): Promise<void> {
    for (const id of ids) {
        await approveReport(id, adminComments, approvedBy);
    }
}

export async function bulkRejectReports(
    ids: string[],
    adminComments: string,
    rejectedBy: string = 'Admin'
): Promise<void> {
    for (const id of ids) {
        await rejectReport(id, adminComments, rejectedBy);
    }
}

export async function bulkMarkAsPaid(ids: string[], paidBy: string = 'Admin'): Promise<void> {
    for (const id of ids) {
        await markReportAsPaid(id, paidBy);
    }
}
