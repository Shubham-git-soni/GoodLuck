// ============================================================
// Policy Rule Engine — Advanced Policy Evaluation
// ============================================================

import type { Expense, ExpensePolicy, PolicyRule, PolicyViolationResult, PolicyCondition, ApprovalStep } from '../types';
import { getPolicies } from '../store';
import { getDayOfWeek } from '../utils/formatters';

// ─── Evaluate a Single Expense Against All Policies ──────────

export function evaluateExpense(expense: Partial<Expense>): PolicyViolationResult[] {
    const policies = getPolicies().filter((p) => p.isActive);
    const violations: PolicyViolationResult[] = [];

    for (const policy of policies) {
        // Check basic limit first
        if (expense.expenseType === policy.expenseType && expense.amount && expense.amount > policy.dailyLimit) {
            violations.push({
                ruleId: 'basic-limit',
                ruleName: `${policy.expenseType} Daily Limit`,
                severity: policy.severity,
                message: `Exceeds daily limit of ₹${policy.dailyLimit} for ${policy.expenseType}`,
                conditions: [
                    { field: 'amount', operator: 'greater_than', value: policy.dailyLimit },
                ],
            });
        }

        // Check receipt requirement
        if (expense.expenseType === policy.expenseType && policy.receiptRequired && !expense.hasReceipt) {
            violations.push({
                ruleId: 'receipt-required',
                ruleName: `${policy.expenseType} Receipt Required`,
                severity: 'warning',
                message: `Receipt is required for ${policy.expenseType} expenses`,
                conditions: [
                    { field: 'hasReceipt', operator: 'equals', value: false },
                ],
            });
        }

        // Evaluate custom rules
        for (const rule of policy.rules) {
            if (!rule.isActive) continue;
            const ruleResult = evaluateRule(rule, expense);
            if (ruleResult) {
                violations.push(ruleResult);
            }
        }
    }

    // Deduplicate by ruleId
    const seen = new Set<string>();
    return violations.filter((v) => {
        const key = `${v.ruleId}-${v.message}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// ─── Evaluate a Single Rule ──────────────────────────────────

function evaluateRule(rule: PolicyRule, expense: Partial<Expense>): PolicyViolationResult | null {
    const results = rule.conditions.map((condition) =>
        evaluateCondition(condition, expense)
    );

    let triggered: boolean;
    if (rule.logic === 'AND') {
        triggered = results.every(Boolean);
    } else {
        triggered = results.some(Boolean);
    }

    if (triggered) {
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: rule.message,
            conditions: rule.conditions,
        };
    }

    return null;
}

// ─── Evaluate a Single Condition ─────────────────────────────

function evaluateCondition(condition: PolicyCondition, expense: Partial<Expense>): boolean {
    const fieldValue = getFieldValue(condition.field, expense);
    if (fieldValue === undefined || fieldValue === null) return false;

    switch (condition.operator) {
        case 'equals':
            return fieldValue === condition.value;
        case 'not_equals':
            return fieldValue !== condition.value;
        case 'greater_than':
            return typeof fieldValue === 'number' && fieldValue > (condition.value as number);
        case 'less_than':
            return typeof fieldValue === 'number' && fieldValue < (condition.value as number);
        case 'contains':
            return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes((condition.value as string).toLowerCase());
        case 'not_contains':
            return typeof fieldValue === 'string' && !fieldValue.toLowerCase().includes((condition.value as string).toLowerCase());
        case 'in':
            return Array.isArray(condition.value) && condition.value.includes(fieldValue as string);
        case 'not_in':
            return Array.isArray(condition.value) && !condition.value.includes(fieldValue as string);
        default:
            return false;
    }
}

// ─── Field Value Resolver ────────────────────────────────────

function getFieldValue(field: string, expense: Partial<Expense>): string | number | boolean | null {
    switch (field) {
        case 'amount': return expense.amount ?? null;
        case 'expenseType': return expense.expenseType ?? null;
        case 'hasReceipt': return expense.hasReceipt ?? null;
        case 'description': return expense.description ?? null;
        case 'dayOfWeek': return expense.date ? getDayOfWeek(expense.date) : null;
        default: return null;
    }
}

// ─── Get Approval Chain Based on Amount ──────────────────────

export function getApprovalChain(expense: Partial<Expense>): ApprovalStep[] {
    const policies = getPolicies().filter(
        (p) => p.isActive && p.expenseType === expense.expenseType
    );

    if (policies.length === 0) {
        // Default: single manager approval
        return [{ level: 1, role: 'Manager', status: 'pending' }];
    }

    const policy = policies[0];
    const amount = expense.amount || 0;

    for (const threshold of policy.approvalThresholds) {
        const withinMin = amount >= threshold.minAmount;
        const withinMax = threshold.maxAmount === null || amount <= threshold.maxAmount;
        if (withinMin && withinMax) {
            return threshold.approvalLevels.map((role, index) => ({
                level: index + 1,
                role,
                status: 'pending' as const,
            }));
        }
    }

    return [{ level: 1, role: 'Manager', status: 'pending' }];
}

// ─── Check if expense would be blocked ───────────────────────

export function wouldBlock(expense: Partial<Expense>): boolean {
    const violations = evaluateExpense(expense);
    return violations.some((v) => v.severity === 'block');
}

// ─── Get highest severity from violations ────────────────────

export function getHighestSeverity(violations: PolicyViolationResult[]): string {
    const order = ['block', 'violation', 'warning', 'info'];
    for (const level of order) {
        if (violations.some((v) => v.severity === level)) return level;
    }
    return 'info';
}
