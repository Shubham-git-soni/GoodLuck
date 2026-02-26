// ============================================================
// Policy API Service (Fake)
// ============================================================

import type { ExpensePolicy } from '../types';
import { getPolicies, setPolicies, addAuditEntry } from '../store';
import { generateId, now, randomDelay } from '../utils/formatters';
import { API_DELAY_MIN, API_DELAY_MAX } from '../utils/constants';

// ─── Read ────────────────────────────────────────────────────

export async function fetchPolicies(activeOnly: boolean = false): Promise<ExpensePolicy[]> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    const policies = getPolicies();
    return activeOnly ? policies.filter((p) => p.isActive) : policies;
}

export async function fetchPolicyById(id: string): Promise<ExpensePolicy | null> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    return getPolicies().find((p) => p.id === id) || null;
}

export async function fetchPolicyByType(type: string): Promise<ExpensePolicy | null> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    return getPolicies().find((p) => p.expenseType === type && p.isActive) || null;
}

// ─── Write ───────────────────────────────────────────────────

export async function createPolicy(data: Partial<ExpensePolicy>): Promise<ExpensePolicy> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const policy: ExpensePolicy = {
        id: generateId('POL'),
        expenseType: data.expenseType || 'Other',
        dailyLimit: data.dailyLimit || 500,
        receiptRequired: data.receiptRequired || false,
        description: data.description || '',
        severity: data.severity || 'warning',
        isActive: data.isActive !== undefined ? data.isActive : true,
        rules: data.rules || [
            {
                id: generateId('RUL'),
                name: `${data.expenseType || 'Other'} daily limit`,
                conditions: [
                    { field: 'amount', operator: 'greater_than', value: data.dailyLimit || 500 },
                    { field: 'expenseType', operator: 'equals', value: data.expenseType || 'Other' },
                ],
                logic: 'AND',
                severity: data.severity || 'warning',
                message: `Exceeds daily limit of ₹${data.dailyLimit || 500} for ${data.expenseType || 'Other'}`,
                isActive: true,
            },
        ],
        approvalThresholds: data.approvalThresholds || [
            { minAmount: 0, maxAmount: data.dailyLimit || 500, approvalLevels: ['Manager'] },
            { minAmount: data.dailyLimit || 500, maxAmount: null, approvalLevels: ['Manager', 'Director'] },
        ],
        createdAt: now(),
        updatedAt: now(),
    };

    setPolicies([...getPolicies(), policy]);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'policy',
        entityId: policy.id,
        action: 'created',
        performedBy: 'Admin',
        performedAt: now(),
        details: `Created policy for ${policy.expenseType} with limit ₹${policy.dailyLimit}`,
    });

    return policy;
}

export async function updatePolicy(id: string, updates: Partial<ExpensePolicy>): Promise<ExpensePolicy> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const policies = getPolicies();
    const index = policies.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Policy ${id} not found`);

    const updated: ExpensePolicy = { ...policies[index], ...updates, updatedAt: now() };
    const newPolicies = [...policies];
    newPolicies[index] = updated;
    setPolicies(newPolicies);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'policy',
        entityId: id,
        action: 'updated',
        performedBy: 'Admin',
        performedAt: now(),
        details: `Updated policy for ${updated.expenseType}`,
    });

    return updated;
}

export async function deletePolicy(id: string): Promise<void> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const policies = getPolicies();
    const policy = policies.find((p) => p.id === id);
    if (!policy) throw new Error(`Policy ${id} not found`);

    setPolicies(policies.filter((p) => p.id !== id));

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'policy',
        entityId: id,
        action: 'deleted',
        performedBy: 'Admin',
        performedAt: now(),
        details: `Deleted policy for ${policy.expenseType}`,
    });
}

export async function togglePolicy(id: string): Promise<ExpensePolicy> {
    const policy = getPolicies().find((p) => p.id === id);
    if (!policy) throw new Error(`Policy ${id} not found`);
    return updatePolicy(id, { isActive: !policy.isActive });
}
