/**
 * Dummy API — Visit History
 * Merges static seed data + localStorage manual visits + approved tour plan visits.
 *
 * Replace with real fetch() calls when backend is ready:
 *   GET  /api/visits          → getVisitHistory()
 *   POST /api/visits/school   → saveSchoolVisit()
 *   POST /api/visits/seller   → saveBookSellerVisit()
 */

import { mockTourPlans } from "@/lib/mock-data/tour-plans";
import type { TourPlan } from "@/lib/mock-data/tour-plans";

const SCHOOL_KEY   = "myVisits_school";
const SELLER_KEY   = "myVisits_bookseller";
const DELAY = 500;

function delay<T>(v: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), DELAY));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VisitRecord {
  id: string;
  type: "school" | "bookseller";
  entityName: string;
  city: string;
  date: string;
  time: string;
  purposes: string[];
  contactPerson: string;
  notes: string;
  source: "manual" | string; // "manual" or tour plan ID
}

// ─── Static seed visits (from visits.json — maps to VisitRecord shape) ────────

const staticVisits: VisitRecord[] = [
  {
    id: "V001",
    type: "school",
    entityName: "Delhi Public School",
    city: "Delhi",
    date: "2025-11-15",
    time: "10:00 AM",
    purposes: ["Need Mapping", "Specimen Distribution"],
    contactPerson: "Dr. Rajesh Sharma",
    notes: "Principal very cooperative, follow up next month",
    source: "manual",
  },
  {
    id: "V002",
    type: "school",
    entityName: "Ryan International School",
    city: "Mumbai",
    date: "2025-11-18",
    time: "11:30 AM",
    purposes: ["Post-Sales Engagement", "Relationship Building"],
    contactPerson: "Mrs. Pooja Mehta",
    notes: "Needs pricing discussion on next visit",
    source: "manual",
  },
  {
    id: "V003",
    type: "school",
    entityName: "DAV Public School",
    city: "Delhi",
    date: "2025-11-10",
    time: "09:30 AM",
    purposes: ["Specimen Distribution", "Need Mapping"],
    contactPerson: "Dr. Ramesh Chand",
    notes: "Large potential, needs follow up in January",
    source: "manual",
  },
  {
    id: "V004",
    type: "school",
    entityName: "Oakridge International School",
    city: "Bangalore",
    date: "2025-11-05",
    time: "02:00 PM",
    purposes: ["Relationship Building", "Specimen Distribution"],
    contactPerson: "Ms. Sarah Williams",
    notes: "Positive visit, schedule need mapping next",
    source: "manual",
  },
  {
    id: "V005",
    type: "school",
    entityName: "Cathedral School",
    city: "Mumbai",
    date: "2025-11-20",
    time: "03:30 PM",
    purposes: ["Need Mapping", "Post-Sales Engagement"],
    contactPerson: "Mrs. Linda Fernandes",
    notes: "Strong follow up needed for conversion",
    source: "manual",
  },
  {
    id: "V006",
    type: "bookseller",
    entityName: "Academic Books Pvt Ltd",
    city: "Delhi",
    date: "2025-11-19",
    time: "03:00 PM",
    purposes: ["Payment Collection", "Relationship Building"],
    contactPerson: "Mr. Suresh Kapoor",
    notes: "Owner agreed to clear 50% outstanding by mid-December",
    source: "manual",
  },
  {
    id: "V007",
    type: "bookseller",
    entityName: "Education Corner",
    city: "Mumbai",
    date: "2025-11-20",
    time: "11:00 AM",
    purposes: ["Payment Collection", "Documentation"],
    contactPerson: "Mr. Ramesh Gupta",
    notes: "Agreement renewed for next year, payment plan finalized",
    source: "manual",
  },
  {
    id: "V008",
    type: "bookseller",
    entityName: "Scholar's Choice",
    city: "Ahmedabad",
    date: "2025-11-17",
    time: "02:30 PM",
    purposes: ["Follow Up"],
    contactPerson: "Ms. Meena Shah",
    notes: "Discussed upcoming season requirements",
    source: "manual",
  },
];

// ─── Read from localStorage (manual visits submitted via add-visit forms) ──────

function getLocalSchoolVisits(): VisitRecord[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(SCHOOL_KEY) || "[]").map(
    (v: Record<string, unknown>, i: number) => ({
      id: `LS-S-${i}`,
      type: "school" as const,
      entityName: String(v.schoolName || v.entityName || ""),
      city: String(v.schoolCity || v.city || ""),
      date: String(v.date || ""),
      time: String(v.time || "—"),
      purposes: Array.isArray(v.purposes) ? v.purposes : [String(v.purpose || "")],
      contactPerson: String(v.contactPerson || "—"),
      notes: String(v.yourComment || v.notes || ""),
      source: "manual" as const,
    })
  );
}

function getLocalBookSellerVisits(): VisitRecord[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(SELLER_KEY) || "[]").map(
    (v: Record<string, unknown>, i: number) => ({
      id: `LS-B-${i}`,
      type: "bookseller" as const,
      entityName: String(v.name || v.entityName || ""),
      city: String(v.city || ""),
      date: String(v.date || ""),
      time: String(v.time || "—"),
      purposes: Array.isArray(v.purposes) ? v.purposes : [String(v.purpose || "")],
      contactPerson: String(v.contactPerson || "—"),
      notes: String(v.remarks || v.notes || ""),
      source: "manual" as const,
    })
  );
}

// ─── Read approved tour plan visits (reads from localStorage if available) ─────

function getTourPlanVisits(): VisitRecord[] {
  let plans: TourPlan[] = mockTourPlans;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("db_tourplans");
    if (stored) plans = JSON.parse(stored) as TourPlan[];
  }
  return plans
    .filter((p) => p.status === "approved")
    .flatMap((p, pi) =>
      p.visits.map((v, vi) => ({
        id: `TP-${p.id}-${vi}`,
        type: v.type,
        entityName: v.entityName,
        city: v.city,
        date: v.date,
        time: "—",
        purposes: v.objectives,
        contactPerson: "—",
        notes: `Tour plan visit — ${p.id}`,
        source: p.id,
      }))
    );
}

// ─── GET /api/visits ──────────────────────────────────────────────────────────

export interface GetVisitHistoryParams {
  salesmanId?: string;
  type?: "school" | "bookseller" | "all";
  source?: "manual" | "tourplan" | "all";
  month?: string; // "YYYY-MM"
  search?: string;
}

export async function getVisitHistory(params: GetVisitHistoryParams = {}): Promise<VisitRecord[]> {
  const all = [
    ...getLocalSchoolVisits(),
    ...getLocalBookSellerVisits(),
    ...staticVisits,
    ...getTourPlanVisits(),
  ].sort((a, b) => b.date.localeCompare(a.date));

  let filtered = all;

  if (params.type && params.type !== "all") {
    filtered = filtered.filter((v) => v.type === params.type);
  }
  if (params.source === "manual") {
    filtered = filtered.filter((v) => v.source === "manual");
  } else if (params.source === "tourplan") {
    filtered = filtered.filter((v) => v.source !== "manual");
  }
  if (params.month) {
    filtered = filtered.filter((v) => v.date.startsWith(params.month!));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.entityName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
    );
  }

  return delay(filtered);
}

// ─── POST /api/visits/school ──────────────────────────────────────────────────
// (Add-visit forms already save to localStorage directly; this is a wrapper for consistency)

export async function saveSchoolVisit(visit: Record<string, unknown>): Promise<{ success: boolean }> {
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(SCHOOL_KEY) || "[]");
    localStorage.setItem(SCHOOL_KEY, JSON.stringify([visit, ...existing]));
  }
  return delay({ success: true });
}

// ─── POST /api/visits/seller ──────────────────────────────────────────────────

export async function saveBookSellerVisit(visit: Record<string, unknown>): Promise<{ success: boolean }> {
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(SELLER_KEY) || "[]");
    localStorage.setItem(SELLER_KEY, JSON.stringify([visit, ...existing]));
  }
  return delay({ success: true });
}
