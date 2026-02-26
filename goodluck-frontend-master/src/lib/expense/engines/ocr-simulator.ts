// ============================================================
// OCR Engine — Production Grade (OCR.space Cloud API)
// ============================================================
// Performs real image-to-data extraction using the OCR.space cloud service.

import type { OCRResult, OCRField } from '../types';
import { generateId, now } from '../utils/formatters';
import { DEFAULT_CATEGORY_KEYWORDS } from '../utils/constants';

// ─── Configuration ───────────────────────────────────────────

const OCR_SPACE_API_KEY = 'K89406319588957';
const OCR_SPACE_ENDPOINT = 'https://api.ocr.space/parse/image';

// ─── Regex Patterns for Financial Data ───────────────────────

// Reordered to prioritize "Total" over the generic "Amount" which often picks up quantities or tax rates
const TOTAL_KEYWORDS_REGEX = /(?:Grand Total|Total Payable|Bill Amount|Total|Net Amount|Final Amount|Paid Amount)\s*[:=-]?\s*(?:₹|Rs\.?|INR|[^\d\s])?\s*([\d,]+\.?\d*)/i;
const FALLBACK_AMOUNT_REGEX = /(?:Amount|Price|Payable)\s*[:=-]?\s*(?:₹|Rs\.?|INR|[^\d\s])?\s*([\d,]+\.?\d*)/i;
const DATE_REGEX = /(\d{1,2}[-\/\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{1,2})[-\/\s]\d{2,4})/i;

// ─── Helper: Clean currency string to number ─────────────────

function parseAmount(text: string): number {
    // Remove everything EXCEPT digits and a single decimal point
    const clean = text.replace(/[^0-9.]/g, '');

    // If the string starts with '7' but is very long, it might be a misread currency symbol.
    // However, we shouldn't blindly remove '7'. Instead, we trust the regex and filtering.
    return parseFloat(clean) || 0;
}

// ─── Helper: Find Amount with robust logic ───────────────────

function findAmountInText(text: string): number {
    console.log('[OCR] Searching for amount in text...');

    // 1. High-Priority Keyword Match (Totals)
    const totalMatch = text.match(TOTAL_KEYWORDS_REGEX);
    if (totalMatch) {
        const val = parseAmount(totalMatch[1]);
        if (val > 1) return val;
    }

    // 2. Medium-Priority Keyword Match (Generic Amount)
    const fallbackMatch = text.match(FALLBACK_AMOUNT_REGEX);
    if (fallbackMatch) {
        const val = parseAmount(fallbackMatch[1]);
        if (val > 1) return val;
    }

    // 3. Scan all numbers and find the largest one (usually the total)
    // We filter out common false positives like years and tax rates
    const allNumbers = text.match(/\d+([.,]\d{1,2})?/g) || [];
    const candidates = allNumbers
        .map(n => parseAmount(n))
        .filter(n => {
            if (n >= 2020 && n <= 2030) return false; // Likely a year
            if (n === 7 || n === 5 || n === 12 || n === 18) {
                // Common tax rates - ignore if they appear alone
                return !text.includes(n + '%') && !text.includes(n + ' %');
            }
            return n > 5; // Ignore very small amounts below ₹5
        });

    if (candidates.length === 0) return 0;

    // Return the maximum value found on the receipt as it's the most likely Total
    return Math.max(...candidates);
}

// ─── Helper: Group words into merchant name ──────────────────

function extractMerchant(text: string): string {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length === 0) return 'Local Merchant';

    const ignoredKeywords = ['tax', 'invoice', 'receipt', 'bill', 'amount', 'total', 'date', 'gst', 'tel', 'phone', 'address', 'www', 'http', 'from:', 'to:'];
    const filtered = lines.filter(l => {
        const lower = l.toLowerCase();
        return !ignoredKeywords.some(w => lower.includes(w)) && !/\d{5,}/.test(l);
    });

    return filtered[0] || lines[0] || 'Unknown Merchant';
}

// ─── Helper: Detect category from extracted text ─────────────

function detectCategoryFromText(text: string, fileName: string): string {
    const lower = (text + ' ' + fileName).toLowerCase();
    for (const [category, keywords] of Object.entries(DEFAULT_CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) return category;
    }
    return 'Other';
}

// ─── Main OCR Scan Function ──────────────────────────────────

export async function scanReceipt(
    file: File,
    onProgress?: (progress: number) => void
): Promise<OCRResult> {
    console.log('[OCR] Starting cloud scan...');
    onProgress?.(10);

    try {
        const formData = new FormData();
        formData.append('apikey', OCR_SPACE_API_KEY);
        formData.append('file', file);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('OCREngine', '2');

        onProgress?.(30);

        const response = await fetch(OCR_SPACE_ENDPOINT, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('OCR API Request Failed');

        onProgress?.(60);
        const data = await response.json();

        if (data.IsErroredOnProcessing) {
            throw new Error(data.ErrorMessage?.[0] || 'OCR.space processing error');
        }

        const text = data.ParsedResults?.[0]?.ParsedText || '';
        console.log('[OCR] OCR Text:', text);

        const merchant = extractMerchant(text);
        const amount = findAmountInText(text);
        const dateMatch = text.match(DATE_REGEX);
        const dateStr = dateMatch ? dateMatch[0] : now().split('T')[0];
        const category = detectCategoryFromText(text, file.name);

        onProgress?.(100);

        return {
            id: generateId('OCR'),
            expenseId: null,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            scannedAt: now(),
            status: 'completed',
            fields: [
                { name: 'merchant', value: merchant, confidence: 0.9, isOverridden: false },
                { name: 'amount', value: amount.toString(), confidence: 0.95, isOverridden: false },
                { name: 'date', value: dateStr, confidence: 0.85, isOverridden: false },
                { name: 'category', value: category, confidence: 0.8, isOverridden: false },
            ],
            rawText: text,
            overallConfidence: 0.92,
        };

    } catch (error) {
        console.error('[OCR] Cloud API Error:', error);
        onProgress?.(100);

        return {
            id: generateId('OCR'),
            expenseId: null,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            scannedAt: now(),
            status: 'completed',
            fields: [
                { name: 'merchant', value: 'Manual Entry Required', confidence: 0.1, isOverridden: false },
                { name: 'amount', value: '0', confidence: 0.1, isOverridden: false },
                { name: 'date', value: now().split('T')[0], confidence: 0.1, isOverridden: false },
                { name: 'category', value: 'Other', confidence: 0.1, isOverridden: false },
            ],
            rawText: 'API Error. Please enter details manually.',
            overallConfidence: 0.1,
        };
    }
}

export function getOCRFieldValue(result: OCRResult, fieldName: string): string | null {
    const field = result.fields.find((f) => f.name === fieldName);
    if (!field) return null;
    return field.isOverridden ? (field.overriddenValue || field.value) : field.value;
}

export function getOCRAutoFillData(result: OCRResult): {
    expenseType: string;
    amount: number;
    date: string;
    description: string;
} {
    return {
        expenseType: getOCRFieldValue(result, 'category') || 'Other',
        amount: parseFloat(getOCRFieldValue(result, 'amount') || '0'),
        date: getOCRFieldValue(result, 'date') || now().split('T')[0],
        description: getOCRFieldValue(result, 'merchant') || '',
    };
}
