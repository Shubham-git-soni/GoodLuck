// ============================================================
// TA/DA API Service (Fake)
// ============================================================

import type { TadaClaim, TadaFilters } from '../types';
import { getTadaClaims, setTadaClaims, addAuditEntry } from '../store';
import { generateId, now, randomDelay } from '../utils/formatters';
import { API_DELAY_MIN, API_DELAY_MAX } from '../utils/constants';

// ─── Read ────────────────────────────────────────────────────

export async function fetchTadaClaims(filters?: TadaFilters): Promise<TadaClaim[]> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    let result = [...getTadaClaims()];

    if (!filters) return result;

    if (filters.salesmanId) {
        result = result.filter((c) => c.salesmanId === filters.salesmanId);
    }
    if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        result = result.filter((c) => statuses.includes(c.status));
    }
    if (filters.dateFrom) {
        result = result.filter((c) => c.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
        result = result.filter((c) => c.date <= filters.dateTo!);
    }
    if (filters.city) {
        result = result.filter((c) => c.city === filters.city);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
            (c) =>
                c.salesmanName.toLowerCase().includes(q) ||
                c.city.toLowerCase().includes(q) ||
                c.travelMode.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q)
        );
    }

    return result;
}

export async function fetchTadaClaimById(id: string): Promise<TadaClaim | null> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    return getTadaClaims().find((c) => c.id === id) || null;
}

// ─── Write ───────────────────────────────────────────────────

export async function createTadaClaim(data: Partial<TadaClaim>): Promise<TadaClaim> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const withinLimit = (data.amount || 0) <= 2000;

    const claim: TadaClaim = {
        id: generateId('TA'),
        salesmanId: data.salesmanId || 'SM001',
        salesmanName: data.salesmanName || 'Rajesh Kumar',
        date: data.date || now().split('T')[0],
        city: data.city || '',
        travelMode: data.travelMode || '',
        amount: data.amount || 0,
        attachment: data.attachment || null,
        visitId: data.visitId || null,
        hasVisit: data.hasVisit ?? true,
        hasSpecimenData: data.hasSpecimenData ?? false,
        withinLimit,
        status: data.status || (withinLimit ? 'Pending' : 'Flagged'),
        approvedBy: null,
        approvedDate: null,
        comments: data.comments || null,
        fraudRiskScore: data.fraudRiskScore || 0,
        fraudReasons: data.fraudReasons || [],
        createdAt: now(),
        updatedAt: now(),
    };

    setTadaClaims([claim, ...getTadaClaims()]);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'tada',
        entityId: claim.id,
        action: 'created',
        performedBy: claim.salesmanName,
        performedAt: now(),
        details: `Submitted TA/DA claim for ₹${claim.amount} — ${claim.city} (${claim.travelMode})`,
    });

    return claim;
}

export async function approveTadaClaim(id: string, approvedBy: string = 'Admin'): Promise<TadaClaim> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const claims = getTadaClaims();
    const index = claims.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`TA/DA claim ${id} not found`);

    const updated: TadaClaim = {
        ...claims[index],
        status: 'Approved',
        approvedBy,
        approvedDate: now(),
        updatedAt: now(),
    };

    const newClaims = [...claims];
    newClaims[index] = updated;
    setTadaClaims(newClaims);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'tada',
        entityId: id,
        action: 'approved',
        performedBy: approvedBy,
        performedAt: now(),
        details: `Approved TA/DA claim of ₹${updated.amount} for ${updated.salesmanName}`,
    });

    return updated;
}

export async function rejectTadaClaim(id: string, rejectedBy: string = 'Admin', comments?: string): Promise<TadaClaim> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const claims = getTadaClaims();
    const index = claims.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`TA/DA claim ${id} not found`);

    const updated: TadaClaim = {
        ...claims[index],
        status: 'Rejected',
        approvedBy: rejectedBy,
        approvedDate: now(),
        comments: comments || claims[index].comments,
        updatedAt: now(),
    };

    const newClaims = [...claims];
    newClaims[index] = updated;
    setTadaClaims(newClaims);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'tada',
        entityId: id,
        action: 'rejected',
        performedBy: rejectedBy,
        performedAt: now(),
        details: `Rejected TA/DA claim of ₹${updated.amount} for ${updated.salesmanName}`,
    });

    return updated;
}

// ─── Bulk Operations ─────────────────────────────────────────

export async function bulkApproveTadaClaims(ids: string[], approvedBy: string = 'Admin'): Promise<void> {
    for (const id of ids) {
        await approveTadaClaim(id, approvedBy);
    }
}

export async function bulkRejectTadaClaims(ids: string[], rejectedBy: string = 'Admin', comments?: string): Promise<void> {
    for (const id of ids) {
        await rejectTadaClaim(id, rejectedBy, comments);
    }
}
