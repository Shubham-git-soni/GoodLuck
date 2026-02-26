/**
 * Dummy API — Schools
 * Simulates async REST API calls using localStorage as the data store.
 * All functions return Promises to match real API patterns.
 *
 * Replace with real fetch() calls when backend is ready:
 *   GET    /api/schools          → getSchools()
 *   GET    /api/schools/:id      → getSchoolById()
 *   POST   /api/schools          → addSchool()
 *   PUT    /api/schools/:id      → updateSchool()
 *   DELETE /api/schools/:id      → deleteSchool()
 */

import type { School } from "@/types";
import { getAllSchools, persistSchools } from "./_db";

// Simulate network latency (ms)
const DELAY = 600;

function delay<T>(value: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), DELAY));
}

// ─── GET /api/schools ─────────────────────────────────────────────────────────

export interface GetSchoolsParams {
  salesmanId?: string;
  city?: string;
  board?: string;
  search?: string;
}

export async function getSchools(params: GetSchoolsParams = {}): Promise<School[]> {
  let data = getAllSchools();

  if (params.salesmanId) {
    data = data.filter((s) => s.assignedTo === params.salesmanId);
  }
  if (params.city && params.city !== "all") {
    data = data.filter((s) => s.city === params.city);
  }
  if (params.board && params.board !== "all") {
    data = data.filter((s) => s.board === params.board);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }

  return delay(data);
}

// ─── GET /api/schools/:id ─────────────────────────────────────────────────────

export async function getSchoolById(id: string): Promise<School | null> {
  const data = getAllSchools();
  const school = data.find((s) => s.id === id) ?? null;
  return delay(school);
}

// ─── POST /api/schools ────────────────────────────────────────────────────────

export interface AddSchoolPayload {
  name: string;
  city: string;
  board: string;
  strength?: number;
  address?: string;
  state?: string;
  station?: string;
  assignedTo: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonMobile?: string;
}

export async function addSchool(payload: AddSchoolPayload): Promise<School> {
  const data = getAllSchools();

  const newSchool: School = {
    id: `SCH${Date.now()}`,
    name: payload.name,
    city: payload.city,
    state: payload.state ?? payload.city,
    station: payload.station ?? payload.city,
    board: payload.board,
    strength: payload.strength ?? 0,
    address: payload.address ?? "",
    isPattakat: false,
    visitCount: 0,
    lastVisitDate: null,
    assignedTo: payload.assignedTo,
    businessHistory: [],
    prescribedBooks: [],
    salesPlan: { targetRevenue: 0, subjects: [], expectedConversion: 0 },
    discountHistory: [],
    contacts: payload.contactPersonName
      ? [
          {
            id: `C${Date.now()}`,
            name: payload.contactPersonName,
            role: payload.contactPersonDesignation ?? "Contact",
            phone: payload.contactPersonMobile ?? "",
            email: "",
          },
        ]
      : [],
  } as unknown as School;

  const updated = [newSchool, ...data];
  persistSchools(updated);
  return delay(newSchool);
}

// ─── PUT /api/schools/:id ─────────────────────────────────────────────────────

export async function updateSchool(id: string, patch: Partial<School>): Promise<School | null> {
  const data = getAllSchools();
  const idx = data.findIndex((s) => s.id === id);
  if (idx === -1) return delay(null);

  data[idx] = { ...data[idx], ...patch };
  persistSchools(data);
  return delay(data[idx]);
}

// ─── DELETE /api/schools/:id ──────────────────────────────────────────────────

export async function deleteSchool(id: string): Promise<{ success: boolean }> {
  const data = getAllSchools();
  const updated = data.filter((s) => s.id !== id);
  persistSchools(updated);
  return delay({ success: true });
}
