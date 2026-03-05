/**
 * Dummy API — Books & Specimens & Feedback & Contacts
 */

import _booksJson from "@/lib/mock-data/books.json";
import _specimensJson from "@/lib/mock-data/specimens.json";
import _feedbackJson from "@/lib/mock-data/feedback.json";
import _contactsJson from "@/lib/mock-data/contact-persons.json";

const BOOKS_KEY     = "db_books";
const SPECIMENS_KEY = "db_specimens";
const FEEDBACK_KEY  = "db_feedback";
const CONTACTS_KEY  = "db_contacts";
const DELAY         = 500;

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

// ─── Books ────────────────────────────────────────────────────────────────────

export type Book = typeof _booksJson[number] & { [k: string]: any };

function getAllBooks(): Book[] { return seed<Book>(BOOKS_KEY, _booksJson as Book[]); }

export async function getBooks(params: { board?: string; subject?: string; class?: string; search?: string } = {}): Promise<Book[]> {
  await delay();
  let data = getAllBooks();
  if (params.board)   data = data.filter(b => b.board === params.board);
  if (params.subject) data = data.filter(b => b.subject === params.subject);
  if (params.class)   data = data.filter(b => b.class === params.class);
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(b => b.title.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q));
  }
  return data;
}

export async function getBookById(id: string): Promise<Book | null> {
  await delay();
  return getAllBooks().find(b => b.id === id) ?? null;
}

export async function addBook(payload: Omit<Book, "id">): Promise<Book> {
  await delay();
  const all = getAllBooks();
  const newItem: Book = { ...payload, id: "BK" + String(Date.now()).slice(-4), createdDate: new Date().toISOString().split("T")[0], lastUpdated: new Date().toISOString().split("T")[0] } as Book;
  all.push(newItem);
  persist(BOOKS_KEY, all);
  return newItem;
}

export async function updateBook(id: string, patch: Partial<Book>): Promise<Book | null> {
  await delay();
  const all = getAllBooks();
  const idx = all.findIndex(b => b.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, lastUpdated: new Date().toISOString().split("T")[0] };
  persist(BOOKS_KEY, all);
  return all[idx];
}

export async function deleteBook(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllBooks().filter(b => b.id !== id);
  persist(BOOKS_KEY, all);
  return { success: true };
}

// ─── Specimens ────────────────────────────────────────────────────────────────

export type Specimen = typeof _specimensJson[number] & { [k: string]: any };

function getAllSpecimens(): Specimen[] { return seed<Specimen>(SPECIMENS_KEY, _specimensJson as Specimen[]); }

export async function getSpecimens(params: { subject?: string; class?: string; search?: string } = {}): Promise<Specimen[]> {
  await delay();
  let data = getAllSpecimens();
  if (params.subject) data = data.filter(s => s.subject === params.subject);
  if (params.class)   data = data.filter(s => s.class === params.class);
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(s => s.bookName.toLowerCase().includes(q));
  }
  return data;
}

export async function getSpecimenById(id: string): Promise<Specimen | null> {
  await delay();
  return getAllSpecimens().find(s => s.id === id) ?? null;
}

export async function updateSpecimen(id: string, patch: Partial<Specimen>): Promise<Specimen | null> {
  await delay();
  const all = getAllSpecimens();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  persist(SPECIMENS_KEY, all);
  return all[idx];
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type Feedback = typeof _feedbackJson[number] & { [k: string]: any };

function getAllFeedback(): Feedback[] { return seed<Feedback>(FEEDBACK_KEY, _feedbackJson as Feedback[]); }

export async function getFeedback(params: { salesmanId?: string; schoolId?: string; status?: string; category?: string } = {}): Promise<Feedback[]> {
  await delay();
  let data = getAllFeedback();
  if (params.salesmanId) data = data.filter(f => f.salesmanId === params.salesmanId);
  if (params.schoolId)   data = data.filter(f => f.schoolId === params.schoolId);
  if (params.status)     data = data.filter(f => f.status === params.status);
  if (params.category)   data = data.filter(f => f.category === params.category);
  return data;
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  await delay();
  return getAllFeedback().find(f => f.id === id) ?? null;
}

export async function updateFeedback(id: string, patch: Partial<Feedback>): Promise<Feedback | null> {
  await delay();
  const all = getAllFeedback();
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  persist(FEEDBACK_KEY, all);
  return all[idx];
}

export async function deleteFeedback(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllFeedback().filter(f => f.id !== id);
  persist(FEEDBACK_KEY, all);
  return { success: true };
}

// ─── Contact Persons ──────────────────────────────────────────────────────────

export type ContactPerson = typeof _contactsJson[number] & { [k: string]: any };

function getAllContacts(): ContactPerson[] { return seed<ContactPerson>(CONTACTS_KEY, _contactsJson as ContactPerson[]); }

export async function getContacts(params: { schoolId?: string; assignedTo?: string; search?: string } = {}): Promise<ContactPerson[]> {
  await delay();
  let data = getAllContacts();
  if (params.schoolId)  data = data.filter(c => c.schoolId === params.schoolId);
  if (params.assignedTo) data = data.filter(c => c.assignedTo === params.assignedTo);
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(c => c.name.toLowerCase().includes(q) || c.schoolName.toLowerCase().includes(q));
  }
  return data;
}

export async function getContactById(id: string): Promise<ContactPerson | null> {
  await delay();
  return getAllContacts().find(c => c.id === id) ?? null;
}

export async function addContact(payload: Omit<ContactPerson, "id">): Promise<ContactPerson> {
  await delay();
  const all = getAllContacts();
  const newItem: ContactPerson = { ...payload, id: "CP" + String(Date.now()).slice(-4), addedDate: new Date().toISOString().split("T")[0] } as ContactPerson;
  all.push(newItem);
  persist(CONTACTS_KEY, all);
  return newItem;
}

export async function updateContact(id: string, patch: Partial<ContactPerson>): Promise<ContactPerson | null> {
  await delay();
  const all = getAllContacts();
  const idx = all.findIndex(c => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  persist(CONTACTS_KEY, all);
  return all[idx];
}

export async function deleteContact(id: string): Promise<{ success: boolean }> {
  await delay();
  const all = getAllContacts().filter(c => c.id !== id);
  persist(CONTACTS_KEY, all);
  return { success: true };
}
