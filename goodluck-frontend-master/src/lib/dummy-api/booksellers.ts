/**
 * Dummy API — Book Sellers
 * Simulates async REST API calls using localStorage as the data store.
 * All functions return Promises to match real API patterns.
 *
 * Replace with real fetch() calls when backend is ready:
 *   GET    /api/booksellers          → getBookSellers()
 *   GET    /api/booksellers/:id      → getBookSellerById()
 *   POST   /api/booksellers          → addBookSeller()
 *   PUT    /api/booksellers/:id      → updateBookSeller()
 *   DELETE /api/booksellers/:id      → deleteBookSeller()
 */

import type { BookSeller } from "@/types";
import { getAllBookSellers, persistBookSellers } from "./_db";

// Simulate network latency (ms)
const DELAY = 600;

function delay<T>(value: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), DELAY));
}

// ─── GET /api/booksellers ─────────────────────────────────────────────────────

export interface GetBookSellersParams {
  salesmanId?: string;
  city?: string;
  search?: string;
}

export async function getBookSellers(params: GetBookSellersParams = {}): Promise<BookSeller[]> {
  let data = getAllBookSellers();

  if (params.salesmanId) {
    data = data.filter((s) => s.assignedTo === params.salesmanId);
  }
  if (params.city && params.city !== "all") {
    data = data.filter((s) => s.city === params.city);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (s) =>
        s.shopName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }

  return delay(data);
}

// ─── GET /api/booksellers/:id ─────────────────────────────────────────────────

export async function getBookSellerById(id: string): Promise<BookSeller | null> {
  const data = getAllBookSellers();
  const seller = data.find((s) => s.id === id) ?? null;
  return delay(seller);
}

// ─── POST /api/booksellers ────────────────────────────────────────────────────

export interface AddBookSellerPayload {
  shopName: string;
  ownerName: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  creditLimit?: number;
  assignedTo: string;
}

export async function addBookSeller(payload: AddBookSellerPayload): Promise<BookSeller> {
  const data = getAllBookSellers();

  const newSeller: BookSeller = {
    id: `BS${Date.now()}`,
    shopName: payload.shopName,
    ownerName: payload.ownerName,
    city: payload.city,
    address: payload.address ?? "",
    phone: payload.phone ?? "",
    email: payload.email ?? "",
    gstNumber: payload.gstNumber ?? "",
    currentOutstanding: 0,
    creditLimit: payload.creditLimit ?? 0,
    lastVisitDate: null,
    assignedTo: payload.assignedTo,
    businessHistory: [],
    paymentHistory: [],
    paymentDeadlines: [],
  } as unknown as BookSeller;

  const updated = [newSeller, ...data];
  persistBookSellers(updated);
  return delay(newSeller);
}

// ─── PUT /api/booksellers/:id ─────────────────────────────────────────────────

export async function updateBookSeller(id: string, patch: Partial<BookSeller>): Promise<BookSeller | null> {
  const data = getAllBookSellers();
  const idx = data.findIndex((s) => s.id === id);
  if (idx === -1) return delay(null);

  data[idx] = { ...data[idx], ...patch };
  persistBookSellers(data);
  return delay(data[idx]);
}

// ─── DELETE /api/booksellers/:id ──────────────────────────────────────────────

export async function deleteBookSeller(id: string): Promise<{ success: boolean }> {
  const data = getAllBookSellers();
  const updated = data.filter((s) => s.id !== id);
  persistBookSellers(updated);
  return delay({ success: true });
}
