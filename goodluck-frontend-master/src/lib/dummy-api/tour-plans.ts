/**
 * Dummy API — Tour Plans
 * Simulates async REST API calls using localStorage as the data store.
 *
 * Replace with real fetch() calls when backend is ready:
 *   GET    /api/tour-plans              → getTourPlans()
 *   GET    /api/tour-plans/:id          → getTourPlanById()
 *   POST   /api/tour-plans              → addTourPlan()
 *   PUT    /api/tour-plans/:id/status   → updateTourPlanStatus()
 *   DELETE /api/tour-plans/:id          → deleteTourPlan()
 */

import { mockTourPlans } from "@/lib/mock-data/tour-plans";
import type { TourPlan, TourPlanStatus, TourPlanVisit } from "@/lib/mock-data/tour-plans";

const KEY = "db_tourplans";
const VERSION_KEY = "db_tourplans_v";
const DATA_VERSION = "2"; // bump this whenever mockTourPlans changes to force re-seed
const DELAY = 500;

function delay<T>(v: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), DELAY));
}

// ─── Seed / Persist ───────────────────────────────────────────────────────────

function seed(): TourPlan[] {
  if (typeof window === "undefined") return mockTourPlans;
  // Re-seed if version mismatch (mock data was updated)
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    localStorage.setItem(KEY, JSON.stringify(mockTourPlans));
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    return mockTourPlans;
  }
  const stored = localStorage.getItem(KEY);
  if (stored) return JSON.parse(stored) as TourPlan[];
  localStorage.setItem(KEY, JSON.stringify(mockTourPlans));
  return mockTourPlans;
}

function persist(data: TourPlan[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(data));
}

// ─── GET /api/tour-plans ──────────────────────────────────────────────────────

export interface GetTourPlansParams {
  salesmanId?: string;
  status?: TourPlanStatus | "all";
}

export async function getTourPlans(params: GetTourPlansParams = {}): Promise<TourPlan[]> {
  let data = seed();
  if (params.status && params.status !== "all") {
    data = data.filter((p) => p.status === params.status);
  }
  // Sort newest first
  return delay([...data].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)));
}

// ─── GET /api/tour-plans/:id ──────────────────────────────────────────────────

export async function getTourPlanById(id: string): Promise<TourPlan | null> {
  const data = seed();
  return delay(data.find((p) => p.id === id) ?? null);
}

// ─── POST /api/tour-plans ─────────────────────────────────────────────────────

export interface AddTourPlanPayload {
  startDate: string;
  endDate: string;
  visits: TourPlanVisit[];
  salesmanId?: string;
}

export async function addTourPlan(payload: AddTourPlanPayload): Promise<TourPlan> {
  const data = seed();
  const year = new Date().getFullYear();
  const seq = data.filter((p) => p.id.startsWith(`TP-${year}`)).length + 1;

  const newPlan: TourPlan = {
    id: `TP-${year}-${String(seq).padStart(3, "0")}`,
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalDays: Math.round(
      (new Date(payload.endDate).getTime() - new Date(payload.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1,
    totalVisits: payload.visits.length,
    visits: payload.visits,
    status: "pending",
    submittedOn: new Date().toISOString().split("T")[0],
  };

  persist([newPlan, ...data]);
  return delay(newPlan);
}

// ─── PUT /api/tour-plans/:id/status ──────────────────────────────────────────

export async function updateTourPlanStatus(
  id: string,
  status: TourPlanStatus,
  reviewerNote?: string
): Promise<TourPlan | null> {
  const data = seed();
  const idx = data.findIndex((p) => p.id === id);
  if (idx === -1) return delay(null);

  data[idx] = {
    ...data[idx],
    status,
    reviewedOn: new Date().toISOString().split("T")[0],
    ...(reviewerNote ? { reviewerNote } : {}),
  };
  persist(data);
  return delay(data[idx]);
}

// ─── DELETE /api/tour-plans/:id ───────────────────────────────────────────────

export async function deleteTourPlan(id: string): Promise<{ success: boolean }> {
  const data = seed();
  persist(data.filter((p) => p.id !== id));
  return delay({ success: true });
}

// ─── Helpers (replaces mock-data/tour-plans helper functions) ─────────────────

export async function getApprovedScheduledVisitsAsync() {
  const data = seed();
  return delay(
    data
      .filter((p) => p.status === "approved")
      .flatMap((p) =>
        p.visits.map((v) => ({
          ...v,
          planId: p.id,
          day: new Date(v.date).toLocaleDateString("en-US", { weekday: "long" }),
        }))
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  );
}

export async function getTodaysVisitsAsync() {
  const today = new Date().toISOString().split("T")[0];
  const data = seed();
  return delay(
    data
      .filter((p) => p.status === "approved")
      .flatMap((p) =>
        p.visits
          .filter((v) => v.date === today)
          .map((v) => ({
            ...v,
            planId: p.id,
            day: new Date(v.date).toLocaleDateString("en-US", { weekday: "long" }),
          }))
      )
  );
}
