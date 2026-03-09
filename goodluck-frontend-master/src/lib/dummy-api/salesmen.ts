/**
 * Dummy API — Salesmen & Managers
 */

import _salesmenJson from "@/lib/mock-data/salesmen.json";
import _managersJson from "@/lib/mock-data/managers.json";

const SALESMEN_KEY = "db_salesmen";
const MANAGERS_KEY = "db_managers";
const DELAY        = 500;

const delay = (ms = DELAY) => new Promise<void>((r) => setTimeout(r, ms));

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

// ─── Salesmen ─────────────────────────────────────────────────────────────────

export type Salesman = typeof _salesmenJson[number] & { [k: string]: any };

function getAll(): Salesman[] { return seed<Salesman>(SALESMEN_KEY, _salesmenJson as Salesman[]); }

export async function getSalesmen(params: { status?: string; managerId?: string; search?: string } = {}): Promise<Salesman[]> {
  await delay();
  let data = getAll();
  if (params.status)    data = data.filter(s => s.status?.toLowerCase() === params.status!.toLowerCase());
  if (params.managerId) data = data.filter(s => s.managerId === params.managerId);
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  return data;
}

export async function getSalesmanById(id: string): Promise<Salesman | null> {
  await delay();
  return getAll().find(s => s.id === id) ?? null;
}

export async function addSalesman(payload: Omit<Salesman, "id">): Promise<Salesman> {
  await delay();
  const all = getAll();
  const newItem: Salesman = { ...payload, id: "SM" + String(Date.now()).slice(-4) } as Salesman;
  all.push(newItem);
  persist(SALESMEN_KEY, all);
  return newItem;
}

export async function updateSalesman(id: string, patch: Partial<Salesman>): Promise<Salesman | null> {
  await delay();
  const all = getAll();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  persist(SALESMEN_KEY, all);
  return all[idx];
}

export async function deleteSalesman(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAll().filter(s => s.id !== id);
  persist(SALESMEN_KEY, all);
  return { success: true };
}

// ─── Managers ─────────────────────────────────────────────────────────────────

export type Manager = typeof _managersJson[number] & { [k: string]: any };

function getAllManagers(): Manager[] { return seed<Manager>(MANAGERS_KEY, _managersJson as Manager[]); }

export async function getManagers(params: { status?: string; search?: string } = {}): Promise<Manager[]> {
  await delay();
  let data = getAllManagers();
  if (params.status) data = data.filter(m => m.status?.toLowerCase() === params.status!.toLowerCase());
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }
  return data;
}

export async function getManagerById(id: string): Promise<Manager | null> {
  await delay();
  return getAllManagers().find(m => m.id === id) ?? null;
}

export async function addManager(payload: Omit<Manager, "id">): Promise<Manager> {
  await delay();
  const all = getAllManagers();
  const newItem: Manager = { ...payload, id: "MGR" + String(Date.now()).slice(-4) } as Manager;
  all.push(newItem);
  persist(MANAGERS_KEY, all);
  return newItem;
}

export async function updateManager(id: string, patch: Partial<Manager>): Promise<Manager | null> {
  await delay();
  const all = getAllManagers();
  const idx = all.findIndex(m => m.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  persist(MANAGERS_KEY, all);
  return all[idx];
}

export async function deleteManager(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllManagers().filter(m => m.id !== id);
  persist(MANAGERS_KEY, all);
  return { success: true };
}
