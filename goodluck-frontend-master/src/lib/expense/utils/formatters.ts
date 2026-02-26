// ============================================================
// Expense Module — Formatters
// ============================================================

import { CURRENCY_SYMBOL } from './constants';

/** Format amount with currency symbol */
export function formatCurrency(amount: number): string {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;
}

/** Format date to locale string */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/** Format date + time */
export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Format relative time (e.g., "2 hours ago") */
export function formatRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
}

/** Generate unique ID with prefix */
export function generateId(prefix: string = 'ID'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`.toUpperCase();
}

/** Get current ISO timestamp */
export function now(): string {
    return new Date().toISOString();
}

/** Format percentage */
export function formatPercent(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/** Format file size */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLen: number = 50): string {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen - 3) + '...';
}

/** Get day-of-week name */
export function getDayOfWeek(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long' });
}

/** Check if date is a weekend */
export function isWeekend(dateStr: string): boolean {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
}

/** Delay for simulation */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random delay between min and max */
export function randomDelay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(ms);
}
