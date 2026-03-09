/**
 * Dummy API — TA/DA Claims
 */

import _tadaJson from "@/lib/mock-data/tada-claims.json";

const TADA_KEY = "db_tada_claims";
const DELAY    = 500;

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

export type TadaClaim = typeof _tadaJson[number] & { [k: string]: any };

function getAll(): TadaClaim[] { return seed<TadaClaim>(TADA_KEY, _tadaJson as TadaClaim[]); }

export async function getTadaClaims(params: { salesmanId?: string; status?: string; search?: string } = {}): Promise<TadaClaim[]> {
  await delay();
  let data = getAll();
  if (params.salesmanId) data = data.filter(t => t.salesmanId === params.salesmanId);
  if (params.status)     data = data.filter(t => t.status === params.status);
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(t => t.salesmanName.toLowerCase().includes(q) || t.city.toLowerCase().includes(q));
  }
  return data;
}

export async function getTadaClaimById(id: string): Promise<TadaClaim | null> {
  await delay();
  return getAll().find(t => t.id === id) ?? null;
}

export async function addTadaClaim(payload: Omit<TadaClaim, "id">): Promise<TadaClaim> {
  await delay();
  const all = getAll();
  const newItem: TadaClaim = { ...payload, id: "TA" + String(Date.now()).slice(-4) } as TadaClaim;
  all.push(newItem);
  persist(TADA_KEY, all);
  return newItem;
}

export async function updateTadaClaim(id: string, patch: Partial<TadaClaim>): Promise<TadaClaim | null> {
  await delay();
  const all = getAll();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch } as TadaClaim;
  persist(TADA_KEY, all);
  return all[idx];
}

export async function deleteTadaClaim(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAll().filter(t => t.id !== id);
  persist(TADA_KEY, all);
  return { success: true };
}
