// ============================================================
// Expense Module — Centralized Store (localStorage + Pub/Sub)
// ============================================================

import type { ExpenseStoreState, Expense, ExpenseReport, ExpensePolicy, TadaClaim, AuditLogEntry, CategorizationMapping, FraudAlert, PendingAction, ExpenseSettings } from './types';
import { STORE_KEY, STORE_VERSION, DEFAULT_SETTINGS } from './utils/constants';

// ─── Default State ───────────────────────────────────────────

const DEFAULT_STATE: ExpenseStoreState = {
    expenses: [],
    reports: [],
    policies: [],
    tadaClaims: [],
    auditLog: [],
    categorizationMappings: [],
    fraudAlerts: [],
    pendingActions: [],
    settings: { ...DEFAULT_SETTINGS },
    _version: STORE_VERSION,
    _lastSyncedAt: new Date().toISOString(),
};

// ─── Listeners ───────────────────────────────────────────────

type Listener = () => void;
let listeners: Set<Listener> = new Set();
let cachedState: ExpenseStoreState | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

// ─── Core Functions ──────────────────────────────────────────

/** Read the full state from localStorage */
export function getState(): ExpenseStoreState {
    if (cachedState) return cachedState;

    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as ExpenseStoreState;
            // Version check — if schema changed, merge defaults
            if (parsed._version !== STORE_VERSION) {
                cachedState = { ...DEFAULT_STATE, ...parsed, _version: STORE_VERSION };
                persistSync(cachedState);
            } else {
                cachedState = parsed;
            }
        } else {
            cachedState = { ...DEFAULT_STATE };
        }
    } catch {
        console.error('[ExpenseStore] Failed to parse localStorage, resetting...');
        cachedState = { ...DEFAULT_STATE };
    }

    return cachedState;
}

/** Update the full state (merges) */
export function setState(partial: Partial<ExpenseStoreState>): void {
    const current = getState();
    cachedState = {
        ...current,
        ...partial,
        _lastSyncedAt: new Date().toISOString(),
    };
    debouncedPersist();
    notify();
}

/** Completely replace the state (used by seed) */
export function replaceState(state: ExpenseStoreState): void {
    cachedState = state;
    persistSync(state);
    notify();
}

/** Subscribe to state changes. Returns unsubscribe fn. */
export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Get a snapshot for React useSyncExternalStore */
export function getSnapshot(): ExpenseStoreState {
    return getState();
}

// ─── Persist Helpers ─────────────────────────────────────────

function persistSync(state: ExpenseStoreState): void {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('[ExpenseStore] Failed to persist state:', e);
    }
}

function debouncedPersist(): void {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (cachedState) persistSync(cachedState);
    }, 200);
}

function notify(): void {
    listeners.forEach((fn) => fn());
}

// ─── Convenience Accessors ───────────────────────────────────

export function getExpenses(): Expense[] {
    return getState().expenses;
}

export function getReports(): ExpenseReport[] {
    return getState().reports;
}

export function getPolicies(): ExpensePolicy[] {
    return getState().policies;
}

export function getTadaClaims(): TadaClaim[] {
    return getState().tadaClaims;
}

export function getAuditLog(): AuditLogEntry[] {
    return getState().auditLog;
}

export function getCategorizationMappings(): CategorizationMapping[] {
    return getState().categorizationMappings;
}

export function getFraudAlerts(): FraudAlert[] {
    return getState().fraudAlerts;
}

export function getPendingActions(): PendingAction[] {
    return getState().pendingActions;
}

export function getSettings(): ExpenseSettings {
    return getState().settings;
}

// ─── Mutation Helpers ────────────────────────────────────────

export function setExpenses(expenses: Expense[]): void {
    setState({ expenses });
}

export function setReports(reports: ExpenseReport[]): void {
    setState({ reports });
}

export function setPolicies(policies: ExpensePolicy[]): void {
    setState({ policies });
}

export function setTadaClaims(claims: TadaClaim[]): void {
    setState({ tadaClaims: claims });
}

export function addAuditEntry(entry: AuditLogEntry): void {
    const log = [...getAuditLog(), entry];
    setState({ auditLog: log });
}

export function addFraudAlert(alert: FraudAlert): void {
    const alerts = [...getFraudAlerts(), alert];
    setState({ fraudAlerts: alerts });
}

export function addPendingAction(action: PendingAction): void {
    const actions = [...getPendingActions(), action];
    setState({ pendingActions: actions });
}

export function removePendingAction(id: string): void {
    const actions = getPendingActions().filter((a) => a.id !== id);
    setState({ pendingActions: actions });
}

export function updateSettings(settings: Partial<ExpenseSettings>): void {
    setState({ settings: { ...getSettings(), ...settings } });
}

// ─── Reset (Dev only) ────────────────────────────────────────

export function resetStore(): void {
    localStorage.removeItem(STORE_KEY);
    cachedState = null;
    notify();
}

/** Check if the store has been seeded */
export function isSeeded(): boolean {
    try {
        return localStorage.getItem(STORE_KEY) !== null;
    } catch {
        return false;
    }
}
