/**
 * Utility functions for expense and report statuses
 */

export function getReportStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
        case 'pending':
            return {
                label: 'Pending Review',
                color: 'bg-amber-500',
            };
        case 'approved':
            return {
                label: 'Approved',
                color: 'bg-blue-600',
            };
        case 'paid':
            return {
                label: 'Paid',
                color: 'bg-green-600',
            };
        case 'rejected':
            return {
                label: 'Rejected',
                color: 'bg-red-600',
            };
        case 'draft':
            return {
                label: 'Draft',
                color: 'bg-slate-500',
            };
        default:
            return {
                label: status || 'Unknown',
                color: 'bg-muted',
            };
    }
}

export function getExpenseStatusBadge(status: string) {
    switch (status?.toLowerCase()) {
        case 'draft':
            return {
                label: 'Draft',
                color: 'bg-slate-400',
            };
        case 'pending':
            return {
                label: 'Pending',
                color: 'bg-amber-400',
            };
        case 'reported':
            return {
                label: 'Reported',
                color: 'bg-blue-400',
            };
        case 'approved':
            return {
                label: 'Approved',
                color: 'bg-green-500',
            };
        case 'rejected':
            return {
                label: 'Rejected',
                color: 'bg-red-500',
            };
        default:
            return {
                label: status || 'Unknown',
                color: 'bg-muted',
            };
    }
}
