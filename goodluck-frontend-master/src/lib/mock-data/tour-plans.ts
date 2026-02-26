// Shared mock tour plans data — imported by tour-plans, next-visits, and today-visits pages

export type TourPlanStatus = "pending" | "approved" | "rejected";

export interface TourPlanVisit {
  type: "school" | "bookseller";
  entityName: string;
  city: string;
  date: string;
  objectives: string[];
}

export interface TourPlan {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalVisits: number;
  visits: TourPlanVisit[];
  status: TourPlanStatus;
  submittedOn: string;
  reviewedOn?: string;
  reviewerNote?: string;
}

export const mockTourPlans: TourPlan[] = [
  {
    id: "TP-2025-001",
    startDate: "2025-12-01",
    endDate: "2025-12-10",
    totalDays: 10,
    totalVisits: 6,
    status: "approved",
    submittedOn: "2025-11-25",
    reviewedOn: "2025-11-27",
    reviewerNote: "Approved. Ensure all visits are completed on time.",
    visits: [
      { type: "school",     entityName: "Delhi Public School",       city: "Delhi",     date: "2025-12-01", objectives: ["Relationship Building", "Need Mapping"] },
      { type: "school",     entityName: "St. Xavier's High School",  city: "Mumbai",    date: "2025-12-02", objectives: ["Follow Up"] },
      { type: "bookseller", entityName: "Sharma Book Depot",         city: "Delhi",     date: "2025-12-03", objectives: ["Payment Collection"] },
      { type: "school",     entityName: "Modern School",             city: "Bangalore", date: "2025-12-05", objectives: ["Product Demos", "Given Specimen"] },
      { type: "bookseller", entityName: "Modern Book House",         city: "Mumbai",    date: "2025-12-07", objectives: ["Relationship Building"] },
      { type: "school",     entityName: "Ryan International School", city: "Pune",      date: "2025-12-10", objectives: ["Order Finalization"] },
    ],
  },
  {
    id: "TP-2025-002",
    startDate: "2025-11-15",
    endDate: "2025-11-22",
    totalDays: 8,
    totalVisits: 4,
    status: "rejected",
    submittedOn: "2025-11-10",
    reviewedOn: "2025-11-12",
    reviewerNote: "Rejected. Too many visits in a single day. Please replan.",
    visits: [
      { type: "school",     entityName: "DAV Public School",   city: "Chennai",   date: "2025-11-15", objectives: ["Follow Up"] },
      { type: "school",     entityName: "Kendriya Vidyalaya",  city: "Bangalore", date: "2025-11-17", objectives: ["Marketing Brochures"] },
      { type: "bookseller", entityName: "Academic Publishers", city: "Bangalore", date: "2025-11-19", objectives: ["Order Finalization"] },
      { type: "school",     entityName: "Bloom Dale School",   city: "Delhi",     date: "2025-11-22", objectives: ["Feedback"] },
    ],
  },
  {
    id: "TP-2025-003",
    startDate: "2025-12-15",
    endDate: "2025-12-25",
    totalDays: 11,
    totalVisits: 7,
    status: "pending",
    submittedOn: "2025-12-05",
    visits: [
      { type: "school",     entityName: "Delhi Public School",          city: "Delhi",     date: "2025-12-15", objectives: ["Need Mapping"] },
      { type: "school",     entityName: "Modern School",                city: "Bangalore", date: "2025-12-16", objectives: ["Product Demos"] },
      { type: "bookseller", entityName: "Student Corner",               city: "Pune",      date: "2025-12-17", objectives: ["Payment Collection"] },
      { type: "school",     entityName: "St. Xavier's High School",     city: "Mumbai",    date: "2025-12-19", objectives: ["Given Specimen"] },
      { type: "bookseller", entityName: "Education Books & Stationery", city: "Chennai",   date: "2025-12-20", objectives: ["Relationship Building"] },
      { type: "school",     entityName: "Ryan International School",    city: "Pune",      date: "2025-12-22", objectives: ["Final Pitch"] },
      { type: "school",     entityName: "DAV Public School",            city: "Chennai",   date: "2025-12-25", objectives: ["Order Finalization"] },
    ],
  },
  {
    id: "TP-2026-001",
    startDate: "2026-01-05",
    endDate: "2026-01-15",
    totalDays: 11,
    totalVisits: 5,
    status: "pending",
    submittedOn: "2025-12-28",
    visits: [
      { type: "school",     entityName: "Kendriya Vidyalaya", city: "Bangalore", date: "2026-01-05", objectives: ["Relationship Building"] },
      { type: "bookseller", entityName: "Sharma Book Depot",  city: "Delhi",     date: "2026-01-07", objectives: ["Payment Collection"] },
      { type: "school",     entityName: "Delhi Public School",city: "Delhi",     date: "2026-01-10", objectives: ["Workshop"] },
      { type: "school",     entityName: "Modern School",      city: "Bangalore", date: "2026-01-12", objectives: ["Post Sale Engagement"] },
      { type: "bookseller", entityName: "Modern Book House",  city: "Mumbai",    date: "2026-01-15", objectives: ["Order Finalization"] },
    ],
  },
  // Approved plan with today's visits (2026-02-25) — using SM001 assigned schools
  {
    id: "TP-2026-002",
    startDate: "2026-02-23",
    endDate: "2026-03-05",
    totalDays: 11,
    totalVisits: 6,
    status: "approved",
    submittedOn: "2026-02-18",
    reviewedOn: "2026-02-20",
    reviewerNote: "Approved. Good planning for the month-end visits.",
    visits: [
      { type: "school",     entityName: "Delhi Public School",  city: "Delhi",     date: "2026-02-23", objectives: ["Relationship Building"] },
      { type: "bookseller", entityName: "Sharma Book Depot",    city: "Delhi",     date: "2026-02-24", objectives: ["Payment Collection"] },
      { type: "school",     entityName: "Modern School",        city: "Delhi",     date: "2026-02-25", objectives: ["Need Mapping", "Given Specimen"] },
      { type: "bookseller", entityName: "Academic Books Pvt Ltd", city: "Delhi",   date: "2026-02-25", objectives: ["Order Finalization"] },
      { type: "school",     entityName: "Kendriya Vidyalaya",   city: "Bangalore", date: "2026-02-27", objectives: ["Follow Up"] },
      { type: "school",     entityName: "Delhi Public School",  city: "Delhi",     date: "2026-03-05", objectives: ["Product Demos"] },
    ],
  },
];

// Helper — returns all visits from approved plans, sorted by date (for Scheduled Visits page)
export function getApprovedScheduledVisits() {
  return mockTourPlans
    .filter(p => p.status === "approved")
    .flatMap(p =>
      p.visits.map(v => ({
        ...v,
        planId: p.id,
        day: new Date(v.date).toLocaleDateString("en-US", { weekday: "long" }),
      }))
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Helper — returns only today's visits from approved plans (for Today's Visits page)
export function getTodaysVisits() {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  return mockTourPlans
    .filter(p => p.status === "approved")
    .flatMap(p =>
      p.visits
        .filter(v => v.date === today)
        .map(v => ({
          ...v,
          planId: p.id,
          day: new Date(v.date).toLocaleDateString("en-US", { weekday: "long" }),
        }))
    );
}
