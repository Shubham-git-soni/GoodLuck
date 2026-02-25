// ============================================================
// Expense Module — Data Seeder
// ============================================================
// Seeds the store from existing JSON mock data on first load.
// Adds enterprise fields to existing records.

import type { Expense, ExpenseReport, ExpensePolicy, TadaClaim, ExpenseStoreState, CategorizationMapping } from './types';
import { replaceState, isSeeded, getPolicies, setPolicies } from './store';
import { STORE_VERSION, DEFAULT_SETTINGS, DEFAULT_CATEGORY_KEYWORDS } from './utils/constants';
import { generateId, now } from './utils/formatters';

// Import raw mock data
import rawExpenses from '@/lib/mock-data/expenses.json';
import rawReports from '@/lib/mock-data/expense-reports.json';
import rawPolicies from '@/lib/mock-data/expense-policies.json';
import rawTadaClaims from '@/lib/mock-data/tada-claims.json';

// ─── Transform Functions ─────────────────────────────────────

function transformExpense(raw: Record<string, unknown>): Expense {
    return {
        id: raw.id as string,
        salesmanId: raw.salesmanId as string,
        salesmanName: raw.salesmanName as string,
        expenseType: raw.expenseType as string,
        date: raw.date as string,
        amount: raw.amount as number,
        description: (raw.description as string) || '',
        receiptUrl: (raw.receiptUrl as string) || null,
        hasReceipt: (raw.hasReceipt as boolean) || false,
        policyViolation: (raw.policyViolation as boolean) || false,
        violationReason: (raw.violationReason as string) || undefined,
        status: (raw.status as Expense['status']) || 'draft',
        reportId: (raw.reportId as string) || null,
        currency: 'INR',
        ocrResult: null,
        fraudRiskScore: 0,
        fraudReasons: [],
        duplicateOf: null,
        duplicateSimilarity: 0,
        categoryConfidence: 1,
        tags: [],
        approvedBy: (raw.approvedBy as string) || null,
        approvedAt: (raw.approvedAt as string) || null,
        paidAt: (raw.paidAt as string) || null,
        adminComments: (raw.adminComments as string) || null,
        createdAt: (raw.createdAt as string) || now(),
        updatedAt: (raw.createdAt as string) || now(),
    };
}

function transformReport(raw: Record<string, unknown>): ExpenseReport {
    return {
        id: raw.id as string,
        salesmanId: raw.salesmanId as string,
        salesmanName: raw.salesmanName as string,
        reportTitle: raw.reportTitle as string,
        dateSubmitted: raw.dateSubmitted as string,
        startDate: raw.startDate as string,
        endDate: raw.endDate as string,
        status: (raw.status as ExpenseReport['status']) || 'pending',
        totalAmount: raw.totalAmount as number,
        approvedAmount: (raw.approvedAmount as number) || 0,
        paidAmount: (raw.paidAmount as number) || 0,
        expenseCount: (raw.expenseCount as number) || 0,
        expenseIds: [],    // will be linked below
        policyViolations: (raw.policyViolations as number) || 0,
        adminComments: (raw.adminComments as string) || null,
        notes: (raw.notes as string) || null,
        fraudRiskScore: 0,
        approvalChain: [],
        currentApprovalLevel: 0,
        approvedBy: (raw.approvedBy as string) || null,
        approvedAt: (raw.approvedAt as string) || null,
        rejectedBy: (raw.rejectedBy as string) || null,
        rejectedAt: (raw.rejectedAt as string) || null,
        paidAt: (raw.paidAt as string) || null,
        createdAt: (raw.createdAt as string) || now(),
        updatedAt: (raw.createdAt as string) || now(),
    };
}

function transformPolicy(raw: Record<string, unknown>): ExpensePolicy {
    return {
        id: raw.id as string,
        expenseType: raw.expenseType as string,
        dailyLimit: raw.dailyLimit as number,
        receiptRequired: (raw.receiptRequired as boolean) || false,
        description: (raw.description as string) || '',
        severity: 'warning',
        isActive: true,
        rules: [
            {
                id: generateId('RUL'),
                name: `${raw.expenseType} daily limit`,
                conditions: [
                    {
                        field: 'amount',
                        operator: 'greater_than',
                        value: raw.dailyLimit as number,
                    },
                    {
                        field: 'expenseType',
                        operator: 'equals',
                        value: raw.expenseType as string,
                    },
                ],
                logic: 'AND',
                severity: 'warning',
                message: `Exceeds daily limit of ₹${raw.dailyLimit} for ${raw.expenseType}`,
                isActive: true,
            },
        ],
        approvalThresholds: [
            { minAmount: 0, maxAmount: (raw.dailyLimit as number), approvalLevels: ['Manager'] },
            { minAmount: (raw.dailyLimit as number), maxAmount: null, approvalLevels: ['Manager', 'Director'] },
        ],
        createdAt: now(),
        updatedAt: now(),
    };
}

function transformTadaClaim(raw: Record<string, unknown>): TadaClaim {
    return {
        id: raw.id as string,
        salesmanId: raw.salesmanId as string,
        salesmanName: raw.salesmanName as string,
        date: raw.date as string,
        city: raw.city as string,
        travelMode: raw.travelMode as string,
        amount: raw.amount as number,
        attachment: (raw.attachment as string) || null,
        visitId: (raw.visitId as string) || null,
        hasVisit: (raw.hasVisit as boolean) || false,
        hasSpecimenData: (raw.hasSpecimenData as boolean) || false,
        withinLimit: (raw.withinLimit as boolean) || true,
        status: (raw.status as TadaClaim['status']) || 'Pending',
        approvedBy: (raw.approvedBy as string) || null,
        approvedDate: (raw.approvedDate as string) || null,
        comments: (raw.comments as string) || null,
        fraudRiskScore: 0,
        fraudReasons: [],
        createdAt: (raw.date as string) || now(),
        updatedAt: (raw.date as string) || now(),
    };
}

function buildCategorizationMappings(): CategorizationMapping[] {
    const mappings: CategorizationMapping[] = [];
    for (const [category, keywords] of Object.entries(DEFAULT_CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            mappings.push({
                id: generateId('MAP'),
                keyword,
                category,
                isUserDefined: false,
                hitCount: 0,
                createdAt: now(),
            });
        }
    }
    return mappings;
}

// ─── Main Seed Function ──────────────────────────────────────

export function seedStore(force: boolean = false): void {
    const isAlreadySeeded = isSeeded();
    if (!force && isAlreadySeeded) {
        // Even if seeded, ensure essential policies like Food/Other are present
        const currentPolicies = getPolicies();
        const essentialTypes = ['Food', 'Other', 'Travel', 'Hotel', 'Fuel'];
        const missingTypes = essentialTypes.filter(type => !currentPolicies.some((p: ExpensePolicy) => p.expenseType === type));

        if (missingTypes.length > 0) {
            console.log('[ExpenseStore] Adding missing essential policies:', missingTypes);
            const allRawPolicies = rawPolicies as Record<string, unknown>[];
            const newPolicies = allRawPolicies
                .filter(raw => missingTypes.includes(raw.expenseType as string))
                .map(transformPolicy);

            setPolicies([...currentPolicies, ...newPolicies]);
        }
        return;
    }

    // Transform raw data
    const expenses = (rawExpenses as Record<string, unknown>[]).map(transformExpense);
    const reports = (rawReports as Record<string, unknown>[]).map(transformReport);
    const policies = (rawPolicies as Record<string, unknown>[]).map(transformPolicy);
    const tadaClaims = (rawTadaClaims as Record<string, unknown>[]).map(transformTadaClaim);

    // Link expenses to reports via expenseIds
    for (const report of reports) {
        report.expenseIds = expenses
            .filter((e) => e.reportId === report.id)
            .map((e) => e.id);
    }

    const state: ExpenseStoreState = {
        expenses,
        reports,
        policies,
        tadaClaims,
        auditLog: [],
        categorizationMappings: buildCategorizationMappings(),
        fraudAlerts: [],
        pendingActions: [],
        settings: { ...DEFAULT_SETTINGS },
        _version: STORE_VERSION,
        _lastSyncedAt: now(),
    };

    replaceState(state);
    console.log('[ExpenseStore] Seeded with', {
        expenses: expenses.length,
        reports: reports.length,
        policies: policies.length,
        tadaClaims: tadaClaims.length,
    });
}
