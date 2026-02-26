// ============================================================
// Expense Module — Constants
// ============================================================

export const STORE_KEY = 'goodluck_expense_store';
export const STORE_VERSION = 1;

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// API simulation delays (ms)
export const API_DELAY_MIN = 300;
export const API_DELAY_MAX = 800;

// Auto-save interval
export const AUTO_SAVE_INTERVAL_MS = 5000;

// OCR simulation delay
export const OCR_SCAN_DELAY_MS = 2500;

// Fraud risk thresholds
export const FRAUD_RISK_THRESHOLDS = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90,
} as const;

// Fraud scoring weights
export const FRAUD_SCORING = {
    roundNumber: 10,
    weekendExpense: 15,
    noReceipt: 20,
    abovePolicyLimit: 25,
    duplicateDetected: 30,
    unusualAmount: 15,
    consecutiveSameAmount: 20,
} as const;

// Duplicate detection thresholds
export const DUPLICATE_THRESHOLD = {
    similarity: 0.7,         // 70% similarity triggers warning
    dayRange: 2,             // check expenses ±2 days
    descriptionMinLength: 5, // min chars to compare descriptions
} as const;

// Default expense settings
export const DEFAULT_SETTINGS = {
    defaultCurrency: DEFAULT_CURRENCY,
    autoSaveDraftIntervalMs: AUTO_SAVE_INTERVAL_MS,
    ocrEnabled: true,
    duplicateDetectionEnabled: true,
    fraudDetectionEnabled: true,
    smartDefaultsEnabled: true,
} as const;

// Built-in categorization keywords
export const DEFAULT_CATEGORY_KEYWORDS: Record<string, string[]> = {
    Food: ['lunch', 'dinner', 'breakfast', 'meal', 'food', 'restaurant', 'cafe', 'tea', 'coffee', 'snack', 'canteen', 'tiffin', 'dhaba'],
    Travel: ['uber', 'ola', 'cab', 'taxi', 'auto', 'rickshaw', 'bus', 'train', 'metro', 'flight', 'fare', 'commute', 'ride'],
    Hotel: ['hotel', 'lodge', 'stay', 'accommodation', 'room', 'oyo', 'resort', 'check-in', 'check-out', 'night'],
    Fuel: ['petrol', 'diesel', 'fuel', 'gas', 'cng', 'filling', 'pump', 'mileage'],
    Other: ['stationery', 'print', 'photocopy', 'courier', 'phone', 'recharge', 'internet', 'toll', 'parking'],
};

// Expense types with icons (for UI mapping)
export const EXPENSE_TYPE_ICONS: Record<string, string> = {
    Food: '🍽️',
    Travel: '🚗',
    Hotel: '🏨',
    Fuel: '⛽',
    Other: '📦',
};

// Status color mapping (matches existing design)
export const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-500',
    pending: 'bg-yellow-500',
    submitted: 'bg-yellow-500',
    approved: 'bg-blue-500',
    paid: 'bg-green-500',
    rejected: 'bg-red-500',
    Pending: 'bg-yellow-500',
    Approved: 'bg-blue-500',
    Rejected: 'bg-red-500',
    Flagged: 'bg-red-500',
    'Request More Info': 'bg-orange-500',
};

// Severity colors
export const SEVERITY_COLORS: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
    violation: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
    block: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
};

// Risk level colors
export const RISK_LEVEL_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
};
