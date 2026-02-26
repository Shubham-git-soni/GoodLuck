// ============================================================
// Expense Module — Hash Utilities
// ============================================================

/**
 * Simple string hash for duplicate detection.
 * NOT cryptographic — used only for fast comparison.
 */
export function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Generate an expense fingerprint for duplicate detection.
 * Combines: amount + date + type → hash
 */
export function expenseFingerprint(amount: number, date: string, type: string): string {
    return simpleHash(`${amount}|${date}|${type.toLowerCase()}`);
}

/**
 * Calculate Levenshtein distance between two strings.
 * Used for fuzzy matching descriptions.
 */
export function levenshteinDistance(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // deletion
                dp[i][j - 1] + 1,       // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return dp[m][n];
}

/**
 * Calculate similarity between two strings (0–1).
 * 1 = identical, 0 = completely different.
 */
export function stringSimilarity(a: string, b: string): number {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();

    if (aLower === bLower) return 1;
    if (aLower.length === 0 || bLower.length === 0) return 0;

    const maxLen = Math.max(aLower.length, bLower.length);
    const distance = levenshteinDistance(aLower, bLower);
    return 1 - distance / maxLen;
}

/**
 * Check if a number is "round" (e.g., 500, 1000, 2000).
 * Round numbers are a fraud signal.
 */
export function isRoundNumber(amount: number): boolean {
    if (amount <= 0) return false;
    if (amount % 1000 === 0) return true;
    if (amount % 500 === 0 && amount >= 500) return true;
    if (amount % 100 === 0 && amount >= 200) return true;
    return false;
}
