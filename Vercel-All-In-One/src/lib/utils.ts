// Utility functions for string mappings and date handling

/**
 * Normalizes 'urgency' from AI to perfectly match Notion Select Options
 */
export function normalizeUrgency(urgency: string): 'Urgent' | 'Not Urgent' | 'high' {
    const clean = urgency.toLowerCase().trim();
    if (clean.includes('not urgent')) return 'Not Urgent';
    if (clean === 'high') return 'high';
    if (clean.includes('urgent')) return 'Urgent';
    return 'Not Urgent';
}

/**
 * Normalizes 'importance' from AI to perfectly match Notion Select Options
 */
export function normalizeImportance(importance: string): 'Important' | 'Not Important' | 'high' {
    const clean = importance.toLowerCase().trim();
    if (clean.includes('not important')) return 'Not Important';
    if (clean === 'high') return 'high';
    if (clean.includes('important')) return 'Important';
    return 'Not Important';
}

/**
 * Validates an ISO 8601 string, falls back to today if invalid
 */
export function validateOrProvideDefaultDate(dateStr: string): string {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateStr)) {
        return dateStr;
    }
    return new Date().toISOString().split('T')[0];
}
