// ============================================================
// useAnalytics — React hook for financial insights
// ============================================================

'use client';

import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { BudgetVsActual, ExpenseTrend, ApprovalTurnaround, Expense, ExpenseReport } from '../types';
import { subscribe, getSnapshot } from '../store';
import { seedStore } from '../seed';

export function useAnalytics() {
    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useEffect(() => {
        seedStore();
    }, []);

    const { expenses, reports } = storeState;

    /**
     * Calculate Budget vs Actual for all salesmen
     * In a real app, budgets would come from a 'budgets' table.
     * Here we derive them as 5% of their specimen budget (from salesman data or hardcoded)
     */
    const budgetVsActual = useMemo((): BudgetVsActual[] => {
        const salesmanBudgets: Record<string, { name: string; budget: number; actual: number }> = {
            'SM001': { name: 'Rajesh Kumar', budget: 45000, actual: 0 },
            'SM002': { name: 'Priya Patel', budget: 40000, actual: 0 },
            'SM003': { name: 'Vikram Singh', budget: 35000, actual: 0 },
            'SM004': { name: 'Sneha Reddy', budget: 42000, actual: 0 },
            'SM005': { name: 'Arjun Mehta', budget: 50000, actual: 0 },
        };

        // Calculate actuals from all expenses (even unreported/draft for a full picture)
        expenses.forEach((e) => {
            if (salesmanBudgets[e.salesmanId]) {
                salesmanBudgets[e.salesmanId].actual += e.amount;
            }
        });

        return Object.entries(salesmanBudgets).map(([id, data]) => {
            const variance = data.actual - data.budget;
            return {
                salesmanId: id,
                salesmanName: data.name,
                budget: data.budget,
                actual: data.actual,
                variance,
                variancePercent: (variance / data.budget) * 100,
            };
        });
    }, [expenses]);

    /**
     * Calculate Expense Trend (last 6 months)
     */
    const expenseTrends = useMemo((): ExpenseTrend[] => {
        const trends: Record<string, ExpenseTrend> = {};

        // Sort expenses by date
        const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sorted.forEach((e) => {
            const date = new Date(e.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!trends[monthKey]) {
                trends[monthKey] = {
                    month: monthKey,
                    total: 0,
                    byCategory: {},
                };
            }

            trends[monthKey].total += e.amount;
            if (!trends[monthKey].byCategory[e.expenseType]) {
                trends[monthKey].byCategory[e.expenseType] = 0;
            }
            trends[monthKey].byCategory[e.expenseType] += e.amount;
        });

        return Object.values(trends).slice(-6);
    }, [expenses]);

    /**
     * Calculate Approval Turnaround Times
     */
    const approvalTurnaround = useMemo((): ApprovalTurnaround[] => {
        return reports
            .filter((r) => r.status === 'approved' || r.status === 'paid')
            .map((r) => {
                const submitted = new Date(r.dateSubmitted).getTime();
                const approved = r.approvedAt ? new Date(r.approvedAt).getTime() : 0;

                return {
                    reportId: r.id,
                    submittedAt: r.dateSubmitted,
                    approvedAt: r.approvedAt || null,
                    turnaroundHours: approved > 0 ? (approved - submitted) / (1000 * 60 * 60) : 0,
                };
            })
            .filter((t) => t.turnaroundHours > 0);
    }, [reports]);

    /**
     * Risk Distribution (Fraud Risk Levels)
     */
    const riskDistribution = useMemo(() => {
        const dist = {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
        };

        expenses.forEach(e => {
            if (e.fraudRiskScore < 30) dist.low++;
            else if (e.fraudRiskScore < 60) dist.medium++;
            else if (e.fraudRiskScore < 85) dist.high++;
            else dist.critical++;
        });

        return dist;
    }, [expenses]);

    return {
        budgetVsActual,
        expenseTrends,
        approvalTurnaround,
        riskDistribution,
        avgTurnaroundHours: approvalTurnaround.length > 0
            ? approvalTurnaround.reduce((sum, t) => sum + t.turnaroundHours, 0) / approvalTurnaround.length
            : 0,
        totalSpend: expenses.reduce((sum, e) => sum + e.amount, 0),
        isLoading: false, // Store is synchronous
    };
}
