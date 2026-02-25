// ============================================================
// Smart Categorization Engine
// ============================================================
// Auto-categorize expenses based on keywords, user history, and OCR.

import type { CategorizationSuggestion, CategorizationMapping, Expense } from '../types';
import { getCategorizationMappings, getExpenses, setState } from '../store';
import { generateId, now } from '../utils/formatters';
import { DEFAULT_CATEGORY_KEYWORDS } from '../utils/constants';

// ─── Suggest Category ────────────────────────────────────────

export function suggestCategory(description: string): CategorizationSuggestion[] {
    if (!description || description.trim().length < 2) return [];

    const lower = description.toLowerCase().trim();
    const suggestions: CategorizationSuggestion[] = [];

    // 1. Check user-defined mappings first (highest priority)
    const mappings = getCategorizationMappings();
    const userMappings = mappings.filter((m) => m.isUserDefined);
    for (const mapping of userMappings) {
        if (lower.includes(mapping.keyword.toLowerCase())) {
            suggestions.push({
                category: mapping.category,
                confidence: 0.95,
                source: 'keyword',
            });
        }
    }

    // 2. Check built-in keyword mappings
    for (const [category, keywords] of Object.entries(DEFAULT_CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                // Avoid duplicate suggestions
                if (!suggestions.some((s) => s.category === category)) {
                    suggestions.push({
                        category,
                        confidence: 0.8,
                        source: 'keyword',
                    });
                }
                break;
            }
        }
    }

    // 3. Check user history (most common category for similar descriptions)
    const expenses = getExpenses();
    const historySuggestion = getCategoryFromHistory(lower, expenses);
    if (historySuggestion && !suggestions.some((s) => s.category === historySuggestion)) {
        suggestions.push({
            category: historySuggestion,
            confidence: 0.6,
            source: 'history',
        });
    }

    // Sort by confidence (descending)
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions;
}

// ─── History-based suggestion ────────────────────────────────

function getCategoryFromHistory(description: string, expenses: Expense[]): string | null {
    if (expenses.length === 0) return null;

    const words = description.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return null;

    const categoryScores: Record<string, number> = {};

    for (const expense of expenses) {
        const expDesc = expense.description.toLowerCase();
        let matchScore = 0;
        for (const word of words) {
            if (expDesc.includes(word)) matchScore++;
        }
        if (matchScore > 0) {
            categoryScores[expense.expenseType] = (categoryScores[expense.expenseType] || 0) + matchScore;
        }
    }

    const entries = Object.entries(categoryScores);
    if (entries.length === 0) return null;

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

// ─── Get Best Suggestion ─────────────────────────────────────

export function getBestCategory(description: string): { category: string; confidence: number } | null {
    const suggestions = suggestCategory(description);
    return suggestions.length > 0 ? { category: suggestions[0].category, confidence: suggestions[0].confidence } : null;
}

// ─── Mapping Management ──────────────────────────────────────

export function getCategoryMappings(): CategorizationMapping[] {
    return getCategorizationMappings();
}

export function addCategoryMapping(keyword: string, category: string): CategorizationMapping {
    const mappings = getCategorizationMappings();
    // Check if already exists
    const existing = mappings.find((m) => m.keyword.toLowerCase() === keyword.toLowerCase());
    if (existing) {
        // Update existing
        const updated = mappings.map((m) =>
            m.id === existing.id ? { ...m, category, isUserDefined: true } : m
        );
        setState({ categorizationMappings: updated });
        return { ...existing, category, isUserDefined: true };
    }

    // Create new
    const mapping: CategorizationMapping = {
        id: generateId('MAP'),
        keyword: keyword.toLowerCase(),
        category,
        isUserDefined: true,
        hitCount: 0,
        createdAt: now(),
    };
    setState({ categorizationMappings: [...mappings, mapping] });
    return mapping;
}

export function removeCategoryMapping(id: string): void {
    const mappings = getCategorizationMappings().filter((m) => m.id !== id);
    setState({ categorizationMappings: mappings });
}

export function incrementMappingHit(keyword: string): void {
    const mappings = getCategorizationMappings().map((m) =>
        m.keyword.toLowerCase() === keyword.toLowerCase()
            ? { ...m, hitCount: m.hitCount + 1 }
            : m
    );
    setState({ categorizationMappings: mappings });
}
