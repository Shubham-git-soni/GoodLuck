// ============================================================
// Fraud Scoring Engine
// ============================================================

import type { Expense, FraudAlert, FraudRiskLevel } from '../types';
import { getExpenses, addFraudAlert } from '../store';
import { isRoundNumber } from '../utils/hash';
import { isWeekend, generateId, now } from '../utils/formatters';
import { FRAUD_SCORING, FRAUD_RISK_THRESHOLDS } from '../utils/constants';
import { detectDuplicates } from './duplicate-detection';

// ─── Score a Single Expense ──────────────────────────────────

export function calculateFraudRisk(expense: Partial<Expense>, policyLimit?: number): {
    score: number;
    level: FraudRiskLevel;
    reasons: string[];
} {
    let score = 0;
    const reasons: string[] = [];

    // 1. Round number check
    if (expense.amount && isRoundNumber(expense.amount)) {
        score += FRAUD_SCORING.roundNumber;
        reasons.push(`Round amount (₹${expense.amount})`);
    }

    // 2. Weekend expense
    if (expense.date && isWeekend(expense.date)) {
        score += FRAUD_SCORING.weekendExpense;
        reasons.push('Weekend expense');
    }

    // 3. No receipt
    if (!expense.hasReceipt) {
        score += FRAUD_SCORING.noReceipt;
        reasons.push('No receipt attached');
    }

    // 4. Above policy limit
    if (policyLimit && expense.amount && expense.amount > policyLimit) {
        score += FRAUD_SCORING.abovePolicyLimit;
        reasons.push(`Exceeds policy limit of ₹${policyLimit}`);
    }

    // 5. Duplicate detected
    if (expense.amount && expense.date && expense.expenseType) {
        const duplicates = detectDuplicates(expense, expense.id);
        if (duplicates.length > 0) {
            score += FRAUD_SCORING.duplicateDetected;
            reasons.push(`Potential duplicate (${duplicates.length} match${duplicates.length > 1 ? 'es' : ''})`);
        }
    }

    // 6. Unusually high amount (>3x category average)
    if (expense.amount && expense.expenseType) {
        const allExpenses = getExpenses();
        const categoryExpenses = allExpenses.filter((e) => e.expenseType === expense.expenseType);
        if (categoryExpenses.length >= 3) {
            const avg = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
            if (expense.amount > avg * 3) {
                score += FRAUD_SCORING.unusualAmount;
                reasons.push(`Amount is ${(expense.amount / avg).toFixed(1)}x category average`);
            }
        }
    }

    // 7. Consecutive same-amount expenses (gaming pattern)
    if (expense.amount && expense.salesmanId) {
        const recent = getExpenses()
            .filter((e) => e.salesmanId === expense.salesmanId && e.id !== expense.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        const sameAmountCount = recent.filter((e) => e.amount === expense.amount).length;
        if (sameAmountCount >= 3) {
            score += FRAUD_SCORING.consecutiveSameAmount;
            reasons.push(`Same amount (₹${expense.amount}) in ${sameAmountCount} recent expenses`);
        }
    }

    // Clamp score 0-100
    score = Math.min(score, 100);

    // Determine level
    let level: FraudRiskLevel = 'low';
    if (score >= FRAUD_RISK_THRESHOLDS.critical) level = 'critical';
    else if (score >= FRAUD_RISK_THRESHOLDS.high) level = 'high';
    else if (score >= FRAUD_RISK_THRESHOLDS.medium) level = 'medium';

    return { score, level, reasons };
}

// ─── Score Expense and Create Alert if High ──────────────────

export function scoreAndAlert(expense: Expense, policyLimit?: number): {
    score: number;
    level: FraudRiskLevel;
    reasons: string[];
    alert?: FraudAlert;
} {
    const result = calculateFraudRisk(expense, policyLimit);

    if (result.score >= FRAUD_RISK_THRESHOLDS.medium) {
        const alert: FraudAlert = {
            id: generateId('FRA'),
            expenseId: expense.id,
            riskScore: result.score,
            riskLevel: result.level,
            reasons: result.reasons,
            detectedAt: now(),
            isReviewed: false,
        };
        addFraudAlert(alert);
        return { ...result, alert };
    }

    return result;
}

// ─── Batch Score ─────────────────────────────────────────────

export function batchFraudScore(expenses: Expense[], policyLimits: Record<string, number>): Map<string, {
    score: number;
    level: FraudRiskLevel;
    reasons: string[];
}> {
    const results = new Map();
    for (const expense of expenses) {
        const limit = policyLimits[expense.expenseType];
        results.set(expense.id, calculateFraudRisk(expense, limit));
    }
    return results;
}

// ─── Get Risk Level Label ────────────────────────────────────

export function getRiskLabel(score: number): FraudRiskLevel {
    if (score >= FRAUD_RISK_THRESHOLDS.critical) return 'critical';
    if (score >= FRAUD_RISK_THRESHOLDS.high) return 'high';
    if (score >= FRAUD_RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
}
