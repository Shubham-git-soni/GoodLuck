/**
 * Dummy in-memory database
 * Simulates localStorage-persisted data for testing before real API is ready.
 * Replace these imports with real API calls when backend is done.
 */

import type { School, BookSeller } from "@/types";
import _schoolsJson from "@/lib/mock-data/schools.json";
import _bookSellersJson from "@/lib/mock-data/book-sellers.json";

const SCHOOLS_KEY = "db_schools";
const BOOKSELLERS_KEY = "db_booksellers";

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function seedSchools(): School[] {
  if (typeof window === "undefined") return _schoolsJson as School[];
  const stored = localStorage.getItem(SCHOOLS_KEY);
  if (stored) return JSON.parse(stored) as School[];
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(_schoolsJson));
  return _schoolsJson as School[];
}

function seedBookSellers(): BookSeller[] {
  if (typeof window === "undefined") return _bookSellersJson as BookSeller[];
  const stored = localStorage.getItem(BOOKSELLERS_KEY);
  if (stored) return JSON.parse(stored) as BookSeller[];
  localStorage.setItem(BOOKSELLERS_KEY, JSON.stringify(_bookSellersJson));
  return _bookSellersJson as BookSeller[];
}

// ─── Persist helpers ──────────────────────────────────────────────────────────

export function persistSchools(data: School[]) {
  if (typeof window !== "undefined") localStorage.setItem(SCHOOLS_KEY, JSON.stringify(data));
}

export function persistBookSellers(data: BookSeller[]) {
  if (typeof window !== "undefined") localStorage.setItem(BOOKSELLERS_KEY, JSON.stringify(data));
}

// ─── Exported raw getters (synchronous, used internally by API fns) ───────────

export function getAllSchools(): School[] {
  return seedSchools();
}

export function getAllBookSellers(): BookSeller[] {
  return seedBookSellers();
}
