/**
 * Dummy API — Approvals
 * Handles master approvals (new schools/booksellers), tour plan approvals, TA/DA approvals.
 * Also manages admin notifications.
 *
 * Replace with real fetch() calls when backend is ready:
 *   GET  /api/approvals/masters          → getMasterApprovals()
 *   PUT  /api/approvals/masters/:id      → updateMasterApproval()
 *   GET  /api/approvals/tour-plans       → getTourPlanApprovals()
 *   PUT  /api/approvals/tour-plans/:id   → updateTourPlanApproval()
 *   GET  /api/approvals/tada             → getTadaApprovals()
 *   PUT  /api/approvals/tada/:id         → updateTadaApproval()
 *   GET  /api/admin/notifications        → getAdminNotifications()
 *   PUT  /api/admin/notifications/:id    → markNotificationRead()
 */

import { mockTourPlans } from "@/lib/mock-data/tour-plans";
import type { TourPlan, TourPlanStatus } from "@/lib/mock-data/tour-plans";
import tadaClaimsData from "@/lib/mock-data/tada-claims.json";
import notificationsJson from "@/lib/mock-data/notifications.json";

const DELAY = 500;

function delay<T>(v: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), DELAY));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface MasterApproval {
  id: string;
  type: "school" | "bookseller";
  entityName: string;
  city: string;
  state: string;
  submittedBy: string; // salesman name
  salesmanId: string;
  submittedOn: string;
  status: ApprovalStatus;
  reviewedOn?: string;
  reviewerNote?: string;
  // Extra info
  address?: string;
  phone?: string;
  board?: string; // for school
  strength?: number; // for school
  ownerName?: string; // for bookseller
  gstNumber?: string; // for bookseller
}

export interface TadaApproval {
  id: string;
  salesmanId: string;
  salesmanName: string;
  date: string;
  city: string;
  travelMode: string;
  amount: number;
  hasVisit: boolean;
  withinLimit: boolean;
  status: "Pending" | "Approved" | "Rejected" | "Flagged";
  approvedBy?: string | null;
  approvedDate?: string | null;
  comments?: string | null;
}

export interface AdminNotification {
  id: string;
  type: "master_approval" | "tour_plan" | "tada" | "visit" | "general";
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: "high" | "medium" | "normal";
  actionUrl?: string;
  salesmanName?: string;
}

// ─── localStorage keys ────────────────────────────────────────────────────────

const MASTER_APPROVALS_KEY = "db_master_approvals";
const ADMIN_NOTIFICATIONS_KEY = "db_admin_notifications";
const TADA_APPROVALS_KEY = "db_tada_approvals";

// ─── Seed data ────────────────────────────────────────────────────────────────

const seedMasterApprovals: MasterApproval[] = [
  {
    id: "MA-001",
    type: "school",
    entityName: "Sunrise Public School",
    city: "Pune",
    state: "Maharashtra",
    submittedBy: "Rajesh Kumar",
    salesmanId: "SM001",
    submittedOn: "2026-02-20",
    status: "pending",
    board: "CBSE",
    strength: 850,
    address: "12 MG Road, Pune",
  },
  {
    id: "MA-002",
    type: "bookseller",
    entityName: "New Age Books",
    city: "Lucknow",
    state: "Uttar Pradesh",
    submittedBy: "Vikram Singh",
    salesmanId: "SM003",
    submittedOn: "2026-02-21",
    status: "pending",
    ownerName: "Ravi Sharma",
    address: "45 Hazratganj, Lucknow",
    phone: "9876543210",
  },
  {
    id: "MA-003",
    type: "school",
    entityName: "Modern Academy",
    city: "Jaipur",
    state: "Rajasthan",
    submittedBy: "Priya Patel",
    salesmanId: "SM004",
    submittedOn: "2026-02-22",
    status: "pending",
    board: "ICSE",
    strength: 620,
    address: "7 Civil Lines, Jaipur",
  },
  {
    id: "MA-004",
    type: "bookseller",
    entityName: "Scholar Books",
    city: "Ahmedabad",
    state: "Gujarat",
    submittedBy: "Amit Verma",
    salesmanId: "SM005",
    submittedOn: "2026-02-18",
    status: "approved",
    reviewedOn: "2026-02-19",
    reviewerNote: "Verified. Good credit history.",
    ownerName: "Meena Shah",
    gstNumber: "24ABCDE1234F1Z5",
  },
  {
    id: "MA-005",
    type: "school",
    entityName: "Holy Cross School",
    city: "Kolkata",
    state: "West Bengal",
    submittedBy: "Suresh Nair",
    salesmanId: "SM006",
    submittedOn: "2026-02-15",
    status: "rejected",
    reviewedOn: "2026-02-16",
    reviewerNote: "Duplicate entry. School already exists in system.",
    board: "CBSE",
    strength: 400,
  },
];

const seedAdminNotifications: AdminNotification[] = [
  {
    id: "AN-001",
    type: "master_approval",
    title: "New School Approval Request",
    message: "Rajesh Kumar submitted Sunrise Public School (Pune) for approval",
    date: "2026-02-20T10:30:00",
    read: false,
    priority: "high",
    actionUrl: "/admin/approvals",
    salesmanName: "Rajesh Kumar",
  },
  {
    id: "AN-002",
    type: "master_approval",
    title: "New Bookseller Approval Request",
    message: "Vikram Singh submitted New Age Books (Lucknow) for approval",
    date: "2026-02-21T09:15:00",
    read: false,
    priority: "high",
    actionUrl: "/admin/approvals",
    salesmanName: "Vikram Singh",
  },
  {
    id: "AN-003",
    type: "tour_plan",
    title: "Tour Plan Awaiting Approval",
    message: "Rajesh Kumar submitted tour plan TP-2026-001 (05 Jan – 15 Jan)",
    date: "2026-01-03T11:00:00",
    read: false,
    priority: "high",
    actionUrl: "/admin/approvals",
    salesmanName: "Rajesh Kumar",
  },
  {
    id: "AN-004",
    type: "tada",
    title: "TA/DA Claim Pending",
    message: "Anita Desai submitted TA/DA claim for ₹1,450 (Feb 24, Nagpur)",
    date: "2026-02-24T16:00:00",
    read: false,
    priority: "medium",
    actionUrl: "/admin/approvals",
    salesmanName: "Anita Desai",
  },
  {
    id: "AN-005",
    type: "master_approval",
    title: "New School Approval Request",
    message: "Priya Patel submitted Modern Academy (Jaipur) for approval",
    date: "2026-02-22T14:30:00",
    read: false,
    priority: "high",
    actionUrl: "/admin/approvals",
    salesmanName: "Priya Patel",
  },
  {
    id: "AN-006",
    type: "tour_plan",
    title: "Tour Plan Awaiting Approval",
    message: "Amit Verma submitted tour plan TP-2026-002 (23 Feb – 05 Mar)",
    date: "2026-02-18T09:00:00",
    read: true,
    priority: "high",
    actionUrl: "/admin/approvals",
    salesmanName: "Amit Verma",
  },
  {
    id: "AN-007",
    type: "tada",
    title: "TA/DA Claim Flagged",
    message: "Suresh Nair's TA/DA claim for ₹2,200 has been auto-flagged (exceeds limit)",
    date: "2026-02-23T10:00:00",
    read: true,
    priority: "medium",
    actionUrl: "/admin/approvals",
    salesmanName: "Suresh Nair",
  },
  {
    id: "AN-008",
    type: "general",
    title: "Monthly Report Ready",
    message: "February 2026 sales performance report is now available",
    date: "2026-02-25T08:00:00",
    read: true,
    priority: "normal",
    actionUrl: "/admin/reports/visits",
  },
];

// ─── Seed / Persist helpers ───────────────────────────────────────────────────

function seedMasters(): MasterApproval[] {
  if (typeof window === "undefined") return seedMasterApprovals;
  const stored = localStorage.getItem(MASTER_APPROVALS_KEY);
  if (stored) return JSON.parse(stored) as MasterApproval[];
  localStorage.setItem(MASTER_APPROVALS_KEY, JSON.stringify(seedMasterApprovals));
  return seedMasterApprovals;
}

function persistMasters(data: MasterApproval[]) {
  if (typeof window !== "undefined") localStorage.setItem(MASTER_APPROVALS_KEY, JSON.stringify(data));
}

function seedAdminNotifs(): AdminNotification[] {
  if (typeof window === "undefined") return seedAdminNotifications;
  const stored = localStorage.getItem(ADMIN_NOTIFICATIONS_KEY);
  if (stored) return JSON.parse(stored) as AdminNotification[];
  localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(seedAdminNotifications));
  return seedAdminNotifications;
}

function persistAdminNotifs(data: AdminNotification[]) {
  if (typeof window !== "undefined") localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(data));
}

function seedTada(): TadaApproval[] {
  if (typeof window === "undefined") return tadaClaimsData as TadaApproval[];
  const stored = localStorage.getItem(TADA_APPROVALS_KEY);
  if (stored) return JSON.parse(stored) as TadaApproval[];
  localStorage.setItem(TADA_APPROVALS_KEY, JSON.stringify(tadaClaimsData));
  return tadaClaimsData as TadaApproval[];
}

function persistTada(data: TadaApproval[]) {
  if (typeof window !== "undefined") localStorage.setItem(TADA_APPROVALS_KEY, JSON.stringify(data));
}

// ─── Tour Plans ───────────────────────────────────────────────────────────────
// Reuse db_tourplans from tour-plans dummy API

function getTourPlansData(): TourPlan[] {
  if (typeof window === "undefined") return mockTourPlans;
  const stored = localStorage.getItem("db_tourplans");
  if (stored) return JSON.parse(stored) as TourPlan[];
  return mockTourPlans;
}

function persistTourPlansData(data: TourPlan[]) {
  if (typeof window !== "undefined") localStorage.setItem("db_tourplans", JSON.stringify(data));
}

// ─── GET /api/approvals/masters ───────────────────────────────────────────────

export async function getMasterApprovals(status?: ApprovalStatus | "all"): Promise<MasterApproval[]> {
  let data = seedMasters();
  if (status && status !== "all") {
    data = data.filter((m) => m.status === status);
  }
  return delay([...data].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)));
}

// ─── PUT /api/approvals/masters/:id ──────────────────────────────────────────

export async function updateMasterApproval(
  id: string,
  status: ApprovalStatus,
  reviewerNote?: string
): Promise<MasterApproval | null> {
  const data = seedMasters();
  const idx = data.findIndex((m) => m.id === id);
  if (idx === -1) return delay(null);
  data[idx] = {
    ...data[idx],
    status,
    reviewedOn: new Date().toISOString().split("T")[0],
    ...(reviewerNote ? { reviewerNote } : {}),
  };
  persistMasters(data);
  return delay(data[idx]);
}

// ─── GET /api/approvals/tour-plans ───────────────────────────────────────────

export async function getTourPlanApprovals(status?: TourPlanStatus | "all"): Promise<TourPlan[]> {
  let data = getTourPlansData();
  if (status && status !== "all") {
    data = data.filter((p) => p.status === status);
  }
  return delay([...data].sort((a, b) => b.submittedOn.localeCompare(a.submittedOn)));
}

// ─── PUT /api/approvals/tour-plans/:id ───────────────────────────────────────

export async function updateTourPlanApproval(
  id: string,
  status: TourPlanStatus,
  reviewerNote?: string
): Promise<TourPlan | null> {
  const data = getTourPlansData();
  const idx = data.findIndex((p) => p.id === id);
  if (idx === -1) return delay(null);
  data[idx] = {
    ...data[idx],
    status,
    reviewedOn: new Date().toISOString().split("T")[0],
    ...(reviewerNote ? { reviewerNote } : {}),
  };
  persistTourPlansData(data);
  return delay(data[idx]);
}

// ─── GET /api/approvals/tada ─────────────────────────────────────────────────

export async function getTadaApprovals(status?: string): Promise<TadaApproval[]> {
  let data = seedTada();
  if (status && status !== "all") {
    data = data.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }
  return delay([...data].sort((a, b) => b.date.localeCompare(a.date)));
}

// ─── PUT /api/approvals/tada/:id ─────────────────────────────────────────────

export async function updateTadaApproval(
  id: string,
  status: "Approved" | "Rejected",
  reviewerNote?: string
): Promise<TadaApproval | null> {
  const data = seedTada();
  const idx = data.findIndex((c) => c.id === id);
  if (idx === -1) return delay(null);
  data[idx] = {
    ...data[idx],
    status,
    approvedBy: status === "Approved" ? "Admin" : null,
    approvedDate: status === "Approved" ? new Date().toISOString() : null,
    ...(reviewerNote ? { comments: reviewerNote } : {}),
  };
  persistTada(data);
  return delay(data[idx]);
}

// ─── GET /api/admin/notifications ────────────────────────────────────────────

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const data = seedAdminNotifs();
  return delay([...data].sort((a, b) => b.date.localeCompare(a.date)));
}

export async function getAdminUnreadCount(): Promise<number> {
  const data = seedAdminNotifs();
  return delay(data.filter((n) => !n.read).length);
}

// ─── PUT /api/admin/notifications/:id/read ───────────────────────────────────

export async function markAdminNotificationRead(id: string): Promise<void> {
  const data = seedAdminNotifs();
  const idx = data.findIndex((n) => n.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], read: true };
    persistAdminNotifs(data);
  }
  return delay(undefined);
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  const data = seedAdminNotifs();
  persistAdminNotifs(data.map((n) => ({ ...n, read: true })));
  return delay(undefined);
}

// ─── Helper: push a new admin notification (called after approval actions) ───

export function pushAdminNotification(notif: Omit<AdminNotification, "id" | "read" | "date">) {
  if (typeof window === "undefined") return;
  const data = seedAdminNotifs();
  const newNotif: AdminNotification = {
    ...notif,
    id: `AN-${Date.now()}`,
    read: false,
    date: new Date().toISOString(),
  };
  persistAdminNotifs([newNotif, ...data]);
}

// ─── Salesman Notifications ───────────────────────────────────────────────────
// Separate localStorage key for salesman-facing notifications
// Admin approval actions push here; salesman notifications page reads from here

const SALESMAN_NOTIFICATIONS_KEY = "db_salesman_notifications";

export interface SalesmanNotification {
  id: string;
  userId: string; // salesmanId e.g. "SM001"
  type: "tour_plan" | "tada" | "master" | "general" | "deadline" | "visit" | "target" | "specimen" | "school" | "manager" | "feedback";
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: "high" | "medium" | "normal";
  actionUrl?: string;
}

function seedSalesmanNotifs(): SalesmanNotification[] {
  if (typeof window === "undefined") return notificationsJson as SalesmanNotification[];
  const stored = localStorage.getItem(SALESMAN_NOTIFICATIONS_KEY);
  if (stored) return JSON.parse(stored) as SalesmanNotification[];
  // Seed from notifications.json on first load
  const seeded = notificationsJson as SalesmanNotification[];
  localStorage.setItem(SALESMAN_NOTIFICATIONS_KEY, JSON.stringify(seeded));
  return seeded;
}

function persistSalesmanNotifs(data: SalesmanNotification[]) {
  if (typeof window !== "undefined") localStorage.setItem(SALESMAN_NOTIFICATIONS_KEY, JSON.stringify(data));
}

// GET /api/salesman/notifications
export async function getSalesmanNotifications(salesmanId: string): Promise<SalesmanNotification[]> {
  const data = seedSalesmanNotifs();
  const filtered = data.filter(n => n.userId === salesmanId);
  return delay([...filtered].sort((a, b) => b.date.localeCompare(a.date)));
}

export async function getSalesmanUnreadCount(salesmanId: string): Promise<number> {
  const data = seedSalesmanNotifs();
  return delay(data.filter(n => n.userId === salesmanId && !n.read).length);
}

// PUT mark read
export async function markSalesmanNotificationRead(id: string): Promise<void> {
  const data = seedSalesmanNotifs();
  const idx = data.findIndex(n => n.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], read: true };
    persistSalesmanNotifs(data);
  }
  return delay(undefined);
}

export async function markAllSalesmanNotificationsRead(salesmanId: string): Promise<void> {
  const data = seedSalesmanNotifs();
  persistSalesmanNotifs(data.map(n => n.userId === salesmanId ? { ...n, read: true } : n));
  return delay(undefined);
}

// Push a notification to a salesman (called by admin after approval/rejection)
export function pushSalesmanNotification(notif: Omit<SalesmanNotification, "id" | "read" | "date">) {
  if (typeof window === "undefined") return;
  const data = seedSalesmanNotifs();
  const newNotif: SalesmanNotification = {
    ...notif,
    id: `SN-${Date.now()}`,
    read: false,
    date: new Date().toISOString(),
  };
  persistSalesmanNotifs([newNotif, ...data]);
}
