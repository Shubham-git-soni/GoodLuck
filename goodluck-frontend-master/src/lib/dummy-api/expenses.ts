/**
 * Dummy API — Expenses & Expense Reports & Expense Policies
 * localStorage-persisted, 500ms simulated delay.
 */

import _expensesJson from "@/lib/mock-data/expenses.json";
import _reportsJson from "@/lib/mock-data/expense-reports.json";
import _policiesJson from "@/lib/mock-data/expense-policies.json";

const EXPENSES_KEY   = "db_expenses";
const REPORTS_KEY    = "db_expense_reports";
const POLICIES_KEY   = "db_expense_policies";
const DELAY          = 500;

const delay = (ms = DELAY) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Seed / persist helpers ───────────────────────────────────────────────────

function seed<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored) as T[];
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function persist(key: string, data: unknown[]) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type Expense = typeof _expensesJson[number] & { [k: string]: any };

function getAll(): Expense[] { return seed<Expense>(EXPENSES_KEY, _expensesJson as Expense[]); }

export async function getExpenses(params: { salesmanId?: string; status?: string; reportId?: string } = {}): Promise<Expense[]> {
  await delay();
  let data = getAll();
  if (params.salesmanId) data = data.filter(e => e.salesmanId === params.salesmanId);
  if (params.status)     data = data.filter(e => e.status === params.status);
  if (params.reportId)   data = data.filter(e => e.reportId === params.reportId);
  return data;
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  await delay();
  return getAll().find(e => e.id === id) ?? null;
}

export async function addExpense(payload: Omit<Expense, "id" | "createdAt">): Promise<Expense> {
  await delay();
  const all = getAll();
  const newItem: Expense = {
    ...payload,
    id: "EXP" + String(Date.now()).slice(-6),
    createdAt: new Date().toISOString(),
  } as Expense;
  all.push(newItem);
  persist(EXPENSES_KEY, all);
  return newItem;
}

export async function updateExpense(id: string, patch: Partial<Expense>): Promise<Expense | null> {
  await delay();
  const all = getAll();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch } as Expense;
  persist(EXPENSES_KEY, all);
  return all[idx];
}

export async function deleteExpense(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAll().filter(e => e.id !== id);
  persist(EXPENSES_KEY, all);
  return { success: true };
}

// ─── Expense Reports ──────────────────────────────────────────────────────────

export type ExpenseReport = typeof _reportsJson[number] & { [k: string]: any };

function getAllReports(): ExpenseReport[] { return seed<ExpenseReport>(REPORTS_KEY, _reportsJson as ExpenseReport[]); }

export async function getExpenseReports(params: { salesmanId?: string; status?: string } = {}): Promise<ExpenseReport[]> {
  await delay();
  let data = getAllReports();
  if (params.salesmanId) data = data.filter(r => r.salesmanId === params.salesmanId);
  if (params.status)     data = data.filter(r => r.status === params.status);
  return data;
}

export async function getExpenseReportById(id: string): Promise<ExpenseReport | null> {
  await delay();
  return getAllReports().find(r => r.id === id) ?? null;
}

export async function addExpenseReport(payload: Omit<ExpenseReport, "id" | "createdAt">): Promise<ExpenseReport> {
  await delay();
  const all = getAllReports();
  const newItem: ExpenseReport = {
    ...payload,
    id: "RPT" + String(Date.now()).slice(-6),
    createdAt: new Date().toISOString(),
  } as ExpenseReport;
  all.push(newItem);
  persist(REPORTS_KEY, all);
  return newItem;
}

export async function updateExpenseReport(id: string, patch: Partial<ExpenseReport>): Promise<ExpenseReport | null> {
  await delay();
  const all = getAllReports();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch } as ExpenseReport;
  persist(REPORTS_KEY, all);
  return all[idx];
}

export async function deleteExpenseReport(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllReports().filter(r => r.id !== id);
  persist(REPORTS_KEY, all);
  return { success: true };
}

// ─── Expense Policies ─────────────────────────────────────────────────────────

export type ExpensePolicy = typeof _policiesJson[number] & { [k: string]: any };

function getAllPolicies(): ExpensePolicy[] { return seed<ExpensePolicy>(POLICIES_KEY, _policiesJson as ExpensePolicy[]); }

export async function getExpensePolicies(): Promise<ExpensePolicy[]> {
  await delay();
  return getAllPolicies();
}

export async function getExpensePolicyById(id: string): Promise<ExpensePolicy | null> {
  await delay();
  return getAllPolicies().find(p => p.id === id) ?? null;
}

export async function addExpensePolicy(payload: Omit<ExpensePolicy, "id">): Promise<ExpensePolicy> {
  await delay();
  const all = getAllPolicies();
  const newItem: ExpensePolicy = { ...payload, id: "POL" + String(Date.now()).slice(-6) } as ExpensePolicy;
  all.push(newItem);
  persist(POLICIES_KEY, all);
  return newItem;
}

export async function updateExpensePolicy(id: string, patch: Partial<ExpensePolicy>): Promise<ExpensePolicy | null> {
  await delay();
  const all = getAllPolicies();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch } as ExpensePolicy;
  persist(POLICIES_KEY, all);
  return all[idx];
}

export async function deleteExpensePolicy(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllPolicies().filter(p => p.id !== id);
  persist(POLICIES_KEY, all);
  return { success: true };
}
