"use client";

import * as React from "react";
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    Eye,
    Check,
    Filter,
    RefreshCw,
    Maximize2,
    Minimize2,
    Printer,
    Upload,
    Copy,
    ChevronRight as ExpandIcon,
    Sigma,
    BookmarkPlus,
    Edit2,
    Pin,
    PinOff,
    Rows3,
    FileJson,
    Keyboard,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
    SquareStack,
    Columns3,
    Info,
    Star,
    Settings2,
    MoreVertical,
    LayoutGrid,
    List,
    TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SortDir = "asc" | "desc";
export type CellType = "text" | "number" | "badge" | "progress" | "avatar" | "actions" | "custom" | "boolean" | "date";
export type AggregateType = "sum" | "avg" | "count" | "min" | "max" | "none";
export type DensityType = "compact" | "normal" | "comfortable";
export type ExportFormat = "csv" | "json";

export interface SortState {
    key: string;
    dir: SortDir;
}

export interface GridColumn<T = any> {
    key: string;
    header: string;
    type?: CellType;
    width?: number;
    minWidth?: number;
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    hidden?: boolean;
    pinned?: "left" | "right";
    align?: "left" | "center" | "right";
    aggregate?: AggregateType;
    badgeMap?: Record<
        string,
        { label?: string; variant?: "default" | "secondary" | "destructive" | "outline"; color?: string }
    >;
    maxValue?: number;
    progressColor?: string;
    tooltip?: ((value: any, row: T) => string) | boolean;
    render?: (value: any, row: T, rowIndex: number, onEdit?: (v: any) => void) => React.ReactNode;
    // Quick actions for row hover
    quickAction?: (row: T) => React.ReactNode;
    // Mobile card: span full width instead of half-column
    mobileFullWidth?: boolean;
    // Mobile card: alternate read-only render (replaces render in mobile cards)
    mobileRender?: (value: any, row: T) => React.ReactNode;
}

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any) => void;
    danger?: boolean;
    divider?: boolean;
}

export interface QuickFilter {
    label: string;
    key: string;
    value: any;
    icon?: React.ReactNode;
}

export interface RowAction<T = any> {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    danger?: boolean;
}

export interface DataGridProps<T = any> {
    data: T[];
    columns: GridColumn<T>[];
    rowKey?: string;
    pageSizes?: number[];
    defaultPageSize?: number;
    selectable?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    canExpandRow?: (row: T) => boolean;
    expandedRowRender?: (row: T) => React.ReactNode;
    onCellEdit?: (row: T, key: string, newValue: any) => void;
    contextMenuItems?: ContextMenuItem[] | ((row: T) => ContextMenuItem[]);
    bulkActions?: Array<{ label: string; icon?: React.ReactNode; onClick: (rows: T[]) => void; danger?: boolean }>;
    rowActions?: RowAction<T>[] | ((row: T) => RowAction<T>[]);
    quickFilters?: QuickFilter[];
    toolbar?: React.ReactNode;
    onExport?: (data: T[], format: ExportFormat) => void;
    onImport?: (data: any[]) => void;
    onRefresh?: () => void;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    title?: string;
    description?: string;
    loading?: boolean;
    maxHeight?: number;
    presetKey?: string;
    className?: string;
    showStats?: boolean;
    enableRowPinning?: boolean;
    enableColumnPinning?: boolean;
    striped?: boolean;
    inlineFilters?: boolean; // Show filter inputs directly below column headers
    dateFilterKey?: string; // If provided, adds a date range picker to filter this specific date field/key
    density?: DensityType;
    onMobileRowClick?: (row: T) => (() => void) | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNested(obj: any, key: string): any {
    return key.split(".").reduce((o, k) => (o ?? {})[k], obj);
}

function getInitials(name: string) {
    return String(name ?? "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";
}

function csvExport(data: any[], columns: GridColumn[], filename = "export.csv") {
    try {
        const cols = columns.filter((c) => !c.hidden && c.type !== "actions");
        const rows = [
            cols.map((c) => `"${c.header}"`).join(","),
            ...data.map((row) => cols.map((c) => `"${String(getNested(row, c.key) ?? "").replace(/"/g, '""')}"`).join(",")),
        ];
        const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`✓ Exported ${data.length} rows to CSV`);
    } catch (error) {
        toast.error("Failed to export data");
        console.error("Export error:", error);
    }
}

function jsonExport(data: any[], columns: GridColumn[], filename = "export.json") {
    try {
        const cols = columns.filter((c) => !c.hidden && c.type !== "actions");
        const exportData = data.map((row) => {
            const obj: any = {};
            cols.forEach((c) => {
                obj[c.key] = getNested(row, c.key);
            });
            return obj;
        });
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`✓ Exported ${data.length} rows to JSON`);
    } catch (error) {
        toast.error("Failed to export data");
        console.error("Export error:", error);
    }
}

function parseCSV(text: string): any[] {
    const [headerLine, ...lines] = text.trim().split("\n");
    const headers = headerLine.split(",").map((h) => h.replace(/"/g, "").trim());
    return lines.map((line) => {
        const vals = line.split(",").map((v) => v.replace(/"/g, "").trim());
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
    });
}

function aggregate(values: number[], type: AggregateType): string {
    if (!values.length) return "—";
    switch (type) {
        case "sum":
            return values.reduce((a, b) => a + b, 0).toLocaleString();
        case "avg":
            return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
        case "count":
            return values.length.toString();
        case "min":
            return Math.min(...values).toLocaleString();
        case "max":
            return Math.max(...values).toLocaleString();
        default:
            return "";
    }
}

function highlightText(text: string, search: string) {
    if (!search.trim()) return text;
    const parts = String(text).split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
        part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
                {part}
            </mark>
        ) : (
            part
        )
    );
}

// ─── Cell Renderer ────────────────────────────────────────────────────────────
const Cell = React.memo(function Cell({
    col,
    value,
    row,
    rowIndex,
    onEdit,
    searchTerm = "",
}: {
    col: GridColumn;
    value: any;
    row: any;
    rowIndex: number;
    onEdit?: (v: any) => void;
    searchTerm?: string;
}) {
    if (col.render) return <>{col.render(value, row, rowIndex, onEdit)}</>;

    switch (col.type) {
        case "badge": {
            const cfg = col.badgeMap?.[value] ?? {};
            return (
                <Badge variant={cfg.variant ?? "secondary"} className={cn("text-[11px] font-semibold px-2 py-0.5", cfg.color)}>
                    {cfg.label ?? value ?? "—"}
                </Badge>
            );
        }
        case "progress": {
            const pct = Math.min(100, Math.round(((value ?? 0) / (col.maxValue ?? 100)) * 100));
            return (
                <div className="flex items-center gap-2 min-w-[80px]">
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", col.progressColor ?? "bg-primary")}
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground w-8">{pct}%</span>
                </div>
            );
        }
        case "avatar":
            return (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                        {getInitials(String(value ?? ""))}
                    </div>
                    <span className="text-sm font-medium truncate">{highlightText(String(value ?? ""), searchTerm)}</span>
                </div>
            );
        case "boolean":
            return value ? (
                <Check className="h-4 w-4 text-emerald-600 mx-auto" aria-label="Yes" />
            ) : (
                <X className="h-4 w-4 text-rose-400 mx-auto" aria-label="No" />
            );
        case "number":
            return (
                <span className="tabular-nums font-medium">
                    {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
                </span>
            );
        case "date":
            return (
                <span className="text-sm">
                    {value ? new Date(value).toLocaleDateString() : "—"}
                </span>
            );
        default:
            return (
                <span className="truncate max-w-[200px] block">
                    {value != null && value !== "" ? highlightText(String(value), searchTerm) : <span className="text-muted-foreground/30">—</span>}
                </span>
            );
    }
});

// ─── Inline Edit Cell ─────────────────────────────────────────────────────────
const EditableCell = React.memo(function EditableCell({
    col,
    value,
    row,
    rowIndex,
    onCommit,
}: {
    col: GridColumn;
    value: any;
    row: any;
    rowIndex: number;
    onCommit: (v: any) => void;
}) {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(value);
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (editing) ref.current?.focus();
    }, [editing]);

    const handleCommit = React.useCallback(() => {
        if (draft !== value) {
            onCommit(draft);
            toast.success("✓ Cell updated");
        }
        setEditing(false);
    }, [draft, value, onCommit]);

    if (!editing) {
        return (
            <div
                className="flex items-center gap-1 group/edit cursor-pointer"
                onDoubleClick={() => {
                    setDraft(value);
                    setEditing(true);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Edit ${col.header}`}
            >
                <Cell col={col} value={value} row={row} rowIndex={rowIndex} />
                {col.editable && (
                    <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0" />
                )}
            </div>
        );
    }

    return (
        <input
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleCommit();
                if (e.key === "Escape") setEditing(false);
            }}
            className="w-full h-7 px-2 text-sm border border-primary rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Editing ${col.header}`}
        />
    );
});

// ─── Context Menu ─────────────────────────────────────────────────────────────
const CtxMenu = React.memo(function CtxMenu({
    x,
    y,
    items,
    onClose,
}: {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}) {
    React.useEffect(() => {
        const h = (e: Event) => {
            if (e.type === "keydown" && (e as KeyboardEvent).key !== "Escape") return;
            onClose();
        };
        document.addEventListener("click", h);
        document.addEventListener("keydown", h);
        return () => {
            document.removeEventListener("click", h);
            document.removeEventListener("keydown", h);
        };
    }, [onClose]);

    return (
        <div
            className="fixed z-[9999] bg-background border rounded-xl shadow-2xl py-1.5 w-52 animate-in zoom-in-95 fade-in duration-100"
            style={{ left: x, top: y }}
            role="menu"
            aria-label="Context menu"
        >
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    {item.divider && <div className="h-px bg-border my-1 mx-2" role="separator" />}
                    <button
                        className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left",
                            item.danger && "text-destructive hover:bg-destructive/10"
                        )}
                        onClick={() => {
                            item.onClick(null);
                            onClose();
                        }}
                        role="menuitem"
                    >
                        {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                        {item.label}
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
});

// ─── Mobile Card ──────────────────────────────────────────────────────────────
function MobileCard<T>({
    row,
    columns,
    rowIndex,
    selected,
    onSelect,
    selectable,
    canExpandRow,
    expandedRowRender,
    onCellEdit,
    isPinned,
    onTogglePin,
    rowActions,
    onRowClick,
}: {
    row: T;
    columns: GridColumn<T>[];
    rowIndex: number;
    selected: boolean;
    onSelect: () => void;
    selectable: boolean;
    canExpandRow?: (row: T) => boolean;
    expandedRowRender?: (row: T) => React.ReactNode;
    onCellEdit?: (row: T, key: string, val: any) => void;
    isPinned?: boolean;
    onTogglePin?: () => void;
    rowActions?: RowAction<T>[] | ((row: T) => RowAction<T>[]);
    onRowClick?: (row: T) => (() => void) | undefined;
}) {
    const [expanded, setExpanded] = React.useState(false);
    const rowClickHandler = onRowClick ? onRowClick(row) : undefined;
    const visibleCols = columns.filter((c) => !c.hidden && c.type !== "actions");
    const actionCol = columns.find((c) => c.type === "actions");
    const [primary, ...rest] = visibleCols;

    return (
        <div
            className={cn(
                "bg-card border rounded-2xl p-4 shadow-sm transition-all",
                selected && "border-primary/40 bg-primary/5",
                isPinned && "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    {primary && (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                                {primary.header}
                            </p>
                            <div className="text-sm font-semibold">
                                <Cell col={primary} value={getNested(row, primary.key)} row={row} rowIndex={rowIndex} />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    {onTogglePin && (
                        <button
                            onClick={onTogglePin}
                            className={cn(
                                "h-6 w-6 rounded-full items-center justify-center transition-colors hidden md:flex",
                                isPinned ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600" : "bg-muted hover:bg-muted/80"
                            )}
                            aria-label={isPinned ? "Unpin row" : "Pin row"}
                        >
                            {isPinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
                        </button>
                    )}
                    {expandedRowRender && (!canExpandRow || canExpandRow(row)) && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                            aria-label={expanded ? "Collapse" : "Expand"}
                            aria-expanded={expanded}
                        >
                            <ExpandIcon className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} />
                        </button>
                    )}
                    {rowClickHandler && (
                        <button
                            onClick={rowClickHandler}
                            className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                            aria-label="Open details"
                        >
                            <ChevronRight className="h-4 w-4 text-primary" />
                        </button>
                    )}
                    {selectable && (
                        <button
                            onClick={onSelect}
                            className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                selected ? "bg-primary border-primary" : "border-muted-foreground/30 hover:border-primary"
                            )}
                            aria-label={selected ? "Deselect row" : "Select row"}
                            aria-checked={selected}
                            role="checkbox"
                        >
                            {selected && <Check className="h-3 w-3 text-white" />}
                        </button>
                    )}
                </div>
            </div>
            <div className="h-px bg-border/50 mb-3" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {rest.map((col) => (
                    <div key={col.key} className={cn("min-w-0 overflow-hidden", col.mobileFullWidth && "col-span-2")}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                            {col.header}
                        </p>
                        <div className="text-xs flex flex-wrap gap-1">
                            {col.mobileRender ? (
                                col.mobileRender(getNested(row, col.key), row)
                            ) : col.editable && onCellEdit ? (
                                <EditableCell
                                    col={col}
                                    value={getNested(row, col.key)}
                                    row={row}
                                    rowIndex={rowIndex}
                                    onCommit={(v) => onCellEdit(row, col.key, v)}
                                />
                            ) : (
                                <Cell col={col} value={getNested(row, col.key)} row={row} rowIndex={rowIndex} />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {actionCol?.render && <div className="mt-3 pt-3 border-t flex justify-end">{actionCol.render(null, row, rowIndex)}</div>}
            {rowActions && (() => {
                const actions = typeof rowActions === "function" ? rowActions(row) : rowActions;
                if (!actions.length) return null;
                return (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                        {actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-colors",
                                    action.danger
                                        ? "bg-destructive/8 text-destructive hover:bg-destructive/15 border border-destructive/20"
                                        : "bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                                )}
                                aria-label={action.label}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                );
            })()}
            {expanded && expandedRowRender && <div className="mt-3 pt-3 border-t">{expandedRowRender(row)}</div>}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="p-4 space-y-2" role="status" aria-label="Loading data">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    {Array.from({ length: cols }).map((_, j) => (
                        <div
                            key={j}
                            className="h-10 flex-1 rounded-lg bg-muted animate-pulse"
                            style={{ animationDelay: `${(i * cols + j) * 25}ms` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Keyboard Shortcuts Dialog ────────────────────────────────────────────────
function KeyboardShortcutsDialog({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
    const shortcuts = [
        { keys: ["Shift", "Click"], description: "Multi-column sort" },
        { keys: ["Ctrl", "A"], description: "Select all rows (on page)" },
        { keys: ["Esc"], description: "Clear selection / Close dialogs" },
        { keys: ["Ctrl", "F"], description: "Focus search" },
        { keys: ["Ctrl", "E"], description: "Export data" },
        { keys: ["Ctrl", "R"], description: "Refresh data" },
        { keys: ["→"], description: "Next page" },
        { keys: ["←"], description: "Previous page" },
        { keys: ["Double Click"], description: "Edit cell (if editable)" },
        { keys: ["Enter"], description: "Save cell edit" },
        { keys: ["Esc"], description: "Cancel cell edit" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>Quick actions to boost your productivity</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {shortcuts.map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                            <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, j) => (
                                    <React.Fragment key={j}>
                                        <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                                            {key}
                                        </kbd>
                                        {j < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Stats Display ────────────────────────────────────────────────────────────
function QuickStats({ data, filtered }: { data: any[]; filtered: any[] }) {
    return (
        <div className="flex items-center gap-4 px-3 py-2 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
                <SquareStack className="h-4 w-4 text-muted-foreground" />
                <div className="text-xs">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold ml-1">{data.length.toLocaleString()}</span>
                </div>
            </div>
            {filtered.length !== data.length && (
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <div className="text-xs">
                        <span className="text-muted-foreground">Filtered:</span>
                        <span className="font-bold ml-1 text-primary">{filtered.length.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main DataGrid ─────────────────────────────────────────────────────────────
export function DataGrid<T extends object>({
    data,
    columns: initialColumns,
    rowKey = "id",
    pageSizes = [10, 25, 50, 100],
    defaultPageSize = 25,
    selectable = false,
    onSelectionChange,
    canExpandRow,
    expandedRowRender,
    onCellEdit,
    contextMenuItems,
    bulkActions,
    rowActions,
    quickFilters = [],
    toolbar,
    onExport,
    onImport,
    onRefresh,
    emptyMessage = "No data found.",
    emptyIcon,
    title,
    description,
    loading = false,
    maxHeight = 520,
    presetKey,
    className,
    showStats = true,
    enableRowPinning = false,
    enableColumnPinning = false,
    striped = true,
    inlineFilters = true,
    dateFilterKey,
    density: initialDensity = "normal",
    onMobileRowClick,
}: DataGridProps<T>) {
    // ─── State ────────────────────────────────────────────────────────────────────
    const [columns, setColumns] = React.useState<GridColumn<T>[]>(initialColumns);
    const [search, setSearch] = React.useState("");
    const [sorts, setSorts] = React.useState<SortState[]>([]);
    const [colFilters, setColFilters] = React.useState<Record<string, string>>({});
    const [showColFilters, setShowColFilters] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);
    const [selected, setSelected] = React.useState<Set<any>>(new Set());
    const [expanded, setExpanded] = React.useState<Set<any>>(new Set());
    const [pinnedRows, setPinnedRows] = React.useState<Set<any>>(new Set());
    const [colMenuOpen, setColMenuOpen] = React.useState(false);
    const [presetMenuOpen, setPresetMenuOpen] = React.useState(false);
    const [density, setDensity] = React.useState<DensityType>(initialDensity);
    const [viewMode, setViewMode] = React.useState<"list" | "card" | "grid">("list");
    const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false);
    const [fullscreen, setFullscreen] = React.useState(false);
    const [stripedRows, setStripedRows] = React.useState(striped);
    const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
    const [ctx, setCtx] = React.useState<{ x: number; y: number; row: any; items: ContextMenuItem[] } | null>(null);
    const [colWidths, setColWidths] = React.useState<Record<string, number>>({});
    const [presets, setPresets] = React.useState<Record<string, any>>({});
    const [activeQuickFilters, setActiveQuickFilters] = React.useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = React.useState<{ from: string; to: string }>({ from: "", to: "" });
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile viewport
    React.useEffect(() => {
        const mql = window.matchMedia("(max-width: 767px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const importRef = React.useRef<HTMLInputElement>(null);
    const gridRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);

    // ─── Load presets from localStorage ────────────────────────────────────────────
    React.useEffect(() => {
        if (!presetKey) return;
        try {
            const stored = localStorage.getItem(`dg_presets_${presetKey}`);
            if (stored) setPresets(JSON.parse(stored));
        } catch (error) {
            console.error("Failed to load presets:", error);
        }
    }, [presetKey]);


    // ─── Notify selection changes ────────────────────────────────────────────────
    React.useEffect(() => {
        onSelectionChange?.(data.filter((r) => selected.has(getNested(r, rowKey))));
    }, [selected, data, rowKey, onSelectionChange]);

    // ─── Keyboard shortcuts ────────────────────────────────────────────────────
    React.useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === "a") {
                    e.preventDefault();
                    toggleAll();
                }
                if (e.key === "f") {
                    e.preventDefault();
                    searchRef.current?.focus();
                }
                if (e.key === "e") {
                    e.preventDefault();
                    csvExport(processed, visibleCols);
                }
                if (e.key === "r" && onRefresh) {
                    e.preventDefault();
                    onRefresh();
                }
            }
            if (e.key === "ArrowRight" && page < totalPages) setPage((p) => p + 1);
            if (e.key === "ArrowLeft" && page > 1) setPage((p) => p - 1);
            if (e.key === "Escape") {
                setSelected(new Set());
                setCtx(null);
            }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [page, onRefresh]);

    // ─── Process data (filter, sort) ────────────────────────────────────────────
    const processed = React.useMemo(() => {
        let arr = [...data];

        // Quick filters
        if (activeQuickFilters.size > 0) {
            activeQuickFilters.forEach((filterKey) => {
                const filter = quickFilters.find((f) => f.key === filterKey);
                if (filter) {
                    arr = arr.filter((row) => getNested(row, filter.key) === filter.value);
                }
            });
        }

        // Global search
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            arr = arr.filter((row) =>
                columns.some((c) => c.type !== "actions" && String(getNested(row, c.key) ?? "").toLowerCase().includes(q))
            );
        }

        // Date Range
        if (dateFilterKey && (dateRange.from || dateRange.to)) {
            arr = arr.filter((row) => {
                const rowDateRaw = getNested(row, dateFilterKey);
                if (!rowDateRaw) return false;

                const rowDate = new Date(rowDateRaw);
                if (isNaN(rowDate.getTime())) return true; // fallback if invalid date string

                // Match `YYYY-MM-DD` exactly without timezone issues
                const rStr = rowDate.toISOString().split("T")[0];
                if (dateRange.from && rStr < dateRange.from) return false;
                if (dateRange.to && rStr > dateRange.to) return false;
                return true;
            });
        }

        // Column filters
        Object.entries(colFilters).forEach(([key, val]) => {
            if (!val.trim()) return;
            arr = arr.filter((row) => String(getNested(row, key) ?? "").toLowerCase().includes(val.toLowerCase()));
        });

        // Multi-sort
        if (sorts.length) {
            arr.sort((a, b) => {
                for (const s of sorts) {
                    const av = getNested(a, s.key);
                    const bv = getNested(b, s.key);
                    if (av == null) return 1;
                    if (bv == null) return -1;
                    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
                    if (cmp !== 0) return s.dir === "asc" ? cmp : -cmp;
                }
                return 0;
            });
        }

        return arr;
    }, [data, search, colFilters, sorts, columns, activeQuickFilters, quickFilters, dateRange, dateFilterKey]);

    const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
    const paginated = React.useMemo(() => {
        // Separate pinned and regular rows
        const pinned = processed.filter((r) => pinnedRows.has(getNested(r, rowKey)));
        const regular = processed.filter((r) => !pinnedRows.has(getNested(r, rowKey)));
        const regularSlice = regular.slice((page - 1) * pageSize, page * pageSize);
        return [...pinned, ...regularSlice];
    }, [processed, page, pageSize, pinnedRows, rowKey]);

    const visibleCols = React.useMemo(() => columns.filter((c) => !c.hidden), [columns]);

    // ─── Handlers ────────────────────────────────────────────────────────────────
    const handleSort = React.useCallback(
        (key: string, multi: boolean) => {
            setSorts((prev) => {
                const existing = prev.find((s) => s.key === key);
                if (!multi) {
                    if (!existing) return [{ key, dir: "asc" }];
                    if (existing.dir === "asc") return [{ key, dir: "desc" }];
                    return [];
                }
                // Multi-sort with shift
                if (!existing) return [...prev, { key, dir: "asc" }];
                if (existing.dir === "asc") return prev.map((s) => (s.key === key ? { ...s, dir: "desc" as SortDir } : s));
                return prev.filter((s) => s.key !== key);
            });
            setPage(1);
        },
        []
    );

    const toggleRow = React.useCallback(
        (id: any) => {
            setSelected((prev) => {
                const n = new Set(prev);
                n.has(id) ? n.delete(id) : n.add(id);
                return n;
            });
        },
        []
    );

    const toggleAll = React.useCallback(() => {
        if (selected.size === paginated.length && paginated.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(paginated.map((r) => getNested(r, rowKey))));
        }
    }, [selected.size, paginated, rowKey]);

    const toggleExpand = React.useCallback((id: any) => {
        setExpanded((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    }, []);

    const togglePinRow = React.useCallback((id: any) => {
        setPinnedRows((prev) => {
            const n = new Set(prev);
            if (n.has(id)) {
                n.delete(id);
                toast.success("Row unpinned");
            } else {
                n.add(id);
                toast.success("Row pinned to top");
            }
            return n;
        });
    }, []);

    const toggleCol = React.useCallback((key: string) => {
        setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, hidden: !c.hidden } : c)));
    }, []);

    const toggleColPin = React.useCallback((key: string, pin: "left" | "right" | undefined) => {
        setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, pinned: pin } : c)));
        toast.success(pin ? `Column pinned to ${pin}` : "Column unpinned");
    }, []);

    const handleCellEdit = React.useCallback(
        (row: T, key: string, val: any) => {
            onCellEdit?.(row, key, val);
        },
        [onCellEdit]
    );

    const handleRightClick = React.useCallback(
        (e: React.MouseEvent, row: T) => {
            if (!contextMenuItems) return;
            e.preventDefault();
            const items = typeof contextMenuItems === "function" ? contextMenuItems(row) : contextMenuItems;
            setCtx({
                x: e.clientX,
                y: e.clientY,
                row,
                items: items.map((i) => ({ ...i, onClick: () => i.onClick(row) })),
            });
        },
        [contextMenuItems]
    );

    // Column resize
    const startResize = React.useCallback((e: React.MouseEvent, key: string) => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = 150;
        const onMove = (ev: MouseEvent) => {
            setColWidths((w) => ({ ...w, [key]: Math.max(60, startW + ev.clientX - startX) }));
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
    }, []);

    // Import CSV
    const handleImport = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const rows = parseCSV(ev.target?.result as string);
                    onImport?.(rows);
                    toast.success(`✓ Imported ${rows.length} rows`);
                } catch (error) {
                    toast.error("Failed to import CSV");
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
            e.target.value = "";
        },
        [onImport]
    );

    // Presets
    const savePreset = React.useCallback(
        (name: string) => {
            const preset = {
                search,
                sorts,
                colFilters,
                page,
                pageSize,
                hiddenCols: columns.filter((c) => c.hidden).map((c) => c.key),
            };
            const updated = { ...presets, [name]: preset };
            setPresets(updated);
            if (presetKey) localStorage.setItem(`dg_presets_${presetKey}`, JSON.stringify(updated));
            toast.success(`✓ Preset "${name}" saved`);
        },
        [search, sorts, colFilters, page, pageSize, columns, presets, presetKey]
    );

    const loadPreset = React.useCallback(
        (name: string) => {
            const p = presets[name];
            if (!p) return;
            setSearch(p.search ?? "");
            setSorts(p.sorts ?? []);
            setColFilters(p.colFilters ?? {});
            setPage(p.page ?? 1);
            setPageSize(p.pageSize ?? defaultPageSize);
            setColumns((prev) => prev.map((c) => ({ ...c, hidden: (p.hiddenCols ?? []).includes(c.key) })));
            setPresetMenuOpen(false);
            toast.success(`✓ Preset "${name}" loaded`);
        },
        [presets, defaultPageSize]
    );

    const deletePreset = React.useCallback(
        (name: string) => {
            const updated = { ...presets };
            delete updated[name];
            setPresets(updated);
            if (presetKey) localStorage.setItem(`dg_presets_${presetKey}`, JSON.stringify(updated));
            toast.success(`✓ Preset "${name}" deleted`);
        },
        [presets, presetKey]
    );

    // Print
    const handlePrint = React.useCallback(() => {
        const cols = visibleCols.filter((c) => c.type !== "actions");
        const header = cols
            .map(
                (c) =>
                    `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">${c.header}</th>`
            )
            .join("");
        const rows = processed
            .map((row) => {
                const cells = cols
                    .map((c) => `<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${getNested(row, c.key) ?? "—"}</td>`)
                    .join("");
                return `<tr>${cells}</tr>`;
            })
            .join("");
        const win = window.open("", "_blank");
        win?.document.write(
            `<html><head><title>${title ?? "Export"}</title><style>body{font-family:system-ui;margin:24px}table{width:100%;border-collapse:collapse}h2{margin-bottom:16px;font-size:18px}</style></head><body><h2>${title ?? "Data Export"}</h2><p style="color:#6b7280;margin-bottom:16px">${processed.length} records · ${new Date().toLocaleString()}</p><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></body></html>`
        );
        win?.document.close();
        win?.print();
    }, [visibleCols, processed, title]);

    // Copy to clipboard
    const copyToClipboard = React.useCallback(() => {
        const cols = visibleCols.filter((c) => c.type !== "actions");
        const rows = data.filter((r) => selected.has(getNested(r, rowKey)));
        const text = [
            cols.map((c) => c.header).join("\t"),
            ...rows.map((r) => cols.map((c) => getNested(r, c.key) ?? "").join("\t")),
        ].join("\n");
        navigator.clipboard.writeText(text);
        toast.success(`✓ Copied ${rows.length} rows to clipboard`);
    }, [visibleCols, data, selected, rowKey]);

    const toggleQuickFilter = React.useCallback((key: string) => {
        setActiveQuickFilters((prev) => {
            const n = new Set(prev);
            if (n.has(key)) {
                n.delete(key);
            } else {
                n.add(key);
            }
            return n;
        });
        setPage(1);
    }, []);

    const rowPadding = density === "compact" ? "py-1" : density === "comfortable" ? "py-3" : "py-1.5";
    const activeFilterCount =
        Object.values(colFilters).filter((v) => v.trim()).length + (search.trim() ? 1 : 0) + activeQuickFilters.size;

    const sortBadge = React.useCallback(
        (key: string) => {
            const s = sorts.find((s) => s.key === key);
            if (!s) return null;
            const idx = sorts.indexOf(s);
            return (
                <span className="inline-flex items-center gap-0.5 text-primary">
                    {s.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {sorts.length > 1 && <sup className="text-[9px] font-bold">{idx + 1}</sup>}
                </span>
            );
        },
        [sorts]
    );

    const container = cn(
        "flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden",
        fullscreen && "fixed inset-0 z-50 rounded-none",
        className
    );

    return (
        <div className={container} ref={gridRef} role="region" aria-label={title ?? "Data grid"}>
            {/* ── Toolbar ── */}
            <div className="flex flex-col gap-1.5 px-4 py-2 border-b bg-gradient-to-r from-muted/30 to-muted/10 shrink-0">
                {/* Main Header Row */}
                <div className="flex flex-wrap items-center gap-3 justify-between">
                    {/* Title & Description */}
                    {(title || description) && (
                        <div className="flex-1 min-w-[150px] max-w-[25%]">
                            {title && (
                                <h3 className="text-base font-bold text-foreground truncate" title={title}>
                                    {title}
                                </h3>
                            )}
                            {description && <p className="text-xs text-muted-foreground mt-0.5 truncate" title={description}>{description}</p>}
                        </div>
                    )}

                    {/* Date Picker */}
                    {dateFilterKey && (
                        <div className="flex-shrink-0">
                            <DateRangePicker
                                from={dateRange.from}
                                to={dateRange.to}
                                onFromChange={(from) => { setDateRange(prev => ({ ...prev, from })); setPage(1); }}
                                onToChange={(to) => { setDateRange(prev => ({ ...prev, to })); setPage(1); }}
                            />
                        </div>
                    )}

                    {/* Search & Stats */}
                    <div className="flex items-center gap-2 flex-1 min-w-[250px] justify-end">
                        {showStats && <div className="hidden md:block"><QuickStats data={data} filtered={processed} /></div>}
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                className="h-8 pl-8 pr-8 text-sm focus:border-primary"
                                placeholder="Search all columns... (Ctrl+F)"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                aria-label="Search data"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                            {/* Show filter count for inline filters */}
                            {inlineFilters && Object.values(colFilters).filter((v) => v.trim()).length > 0 && (
                                <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] font-bold">
                                    {Object.values(colFilters).filter((v) => v.trim()).length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 shrink-0 ml-auto">

                        {/* Copy Selected - Show when rows selected */}
                        {selected.size > 0 && (
                            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-8 gap-1.5" title="Copy to clipboard">
                                <Copy className="h-3.5 w-3.5" />
                                <span className="hidden md:inline text-xs">Copy</span>
                            </Button>
                        )}

                        {/* More Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="More actions">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                {/* Refresh */}
                                {onRefresh && (
                                    <DropdownMenuItem onClick={() => { onRefresh(); toast.success("Data refreshed"); }}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh Data
                                    </DropdownMenuItem>
                                )}

                                {/* Column Visibility */}
                                <DropdownMenuItem onClick={() => setColMenuOpen(!colMenuOpen)}>
                                    <Columns3 className="h-4 w-4 mr-2" />
                                    Manage Columns
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Layout & View Submenu (desktop only) */}
                                {!isMobile && (
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <LayoutGrid className="h-4 w-4 mr-2" />
                                            Layout & View
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="w-56">
                                                {/* View Options */}
                                                <div className="px-2 py-1.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">View Mode</p>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        <button onClick={() => setViewMode("list")} className={cn("flex flex-col items-center gap-1 py-1.5 rounded-lg transition-colors text-[10px]", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                                                            <List className="h-3.5 w-3.5" /> List
                                                        </button>
                                                        <button onClick={() => setViewMode("card")} className={cn("flex flex-col items-center gap-1 py-1.5 rounded-lg transition-colors text-[10px]", viewMode === "card" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                                                            <LayoutGrid className="h-3.5 w-3.5" /> Card
                                                        </button>
                                                        <button onClick={() => setViewMode("grid")} className={cn("flex flex-col items-center gap-1 py-1.5 rounded-lg transition-colors text-[10px]", viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                                                            <TableIcon className="h-3.5 w-3.5" /> Grid
                                                        </button>
                                                    </div>
                                                </div>
                                                <DropdownMenuSeparator />
                                                {/* Density Options */}
                                                <div className="px-2 py-1.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Density</p>
                                                    <div className="flex flex-col gap-1">
                                                        <button onClick={() => setDensity("compact")} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left", density === "compact" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
                                                            <Minus className="h-3.5 w-3.5" /> Compact
                                                            {density === "compact" && <Check className="h-3.5 w-3.5 ml-auto" />}
                                                        </button>
                                                        <button onClick={() => setDensity("normal")} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left", density === "normal" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
                                                            <Rows3 className="h-3.5 w-3.5" /> Normal
                                                            {density === "normal" && <Check className="h-3.5 w-3.5 ml-auto" />}
                                                        </button>
                                                        <button onClick={() => setDensity("comfortable")} className={cn("flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left", density === "comfortable" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted")}>
                                                            <SquareStack className="h-3.5 w-3.5" /> Comfortable
                                                            {density === "comfortable" && <Check className="h-3.5 w-3.5 ml-auto" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => setFullscreen(!fullscreen)} className="text-xs">
                                                    {fullscreen ? <Minimize2 className="h-3.5 w-3.5 mr-2" /> : <Maximize2 className="h-3.5 w-3.5 mr-2" />}
                                                    {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                )}

                                {/* Export / Import Submenu */}
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export & Data
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="w-48">
                                            <DropdownMenuItem onClick={() => (onExport ? onExport(processed, "csv") : csvExport(processed, visibleCols))} className="text-xs">
                                                <Download className="h-3.5 w-3.5 mr-2" /> Export CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => (onExport ? onExport(processed, "json") : jsonExport(processed, visibleCols))} className="text-xs">
                                                <FileJson className="h-3.5 w-3.5 mr-2" /> Export JSON
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handlePrint} className="text-xs">
                                                <Printer className="h-3.5 w-3.5 mr-2" /> Print
                                            </DropdownMenuItem>
                                            {onImport && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => importRef.current?.click()} className="text-xs">
                                                        <Upload className="h-3.5 w-3.5 mr-2" /> Import CSV
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>

                                {!isMobile && (
                                    <>
                                        <DropdownMenuSeparator />

                                        {/* Keyboard Shortcuts */}
                                        <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
                                            <Keyboard className="h-4 w-4 mr-2" />
                                            Keyboard Shortcuts
                                        </DropdownMenuItem>
                                    </>
                                )}

                                {/* Presets */}
                                {presetKey && (
                                    <DropdownMenuItem onClick={() => setPresetMenuOpen(!presetMenuOpen)}>
                                        <Settings2 className="h-4 w-4 mr-2" />
                                        View Presets
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Column Visibility Menu (Hidden, triggered from More menu) */}
                        {colMenuOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setColMenuOpen(false)}>
                                <div className="relative w-96 max-w-[90vw] bg-background border rounded-xl shadow-2xl py-2 animate-in zoom-in-95 fade-in duration-100 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Columns3 className="h-3.5 w-3.5" />
                                        Manage Columns
                                    </p>
                                    {columns.map((col) => (
                                        <div key={col.key} className="group hover:bg-muted">
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => toggleCol(col.key)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left cursor-pointer"
                                            >
                                                <div
                                                    className={cn(
                                                        "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0",
                                                        !col.hidden ? "bg-primary border-primary" : "border-muted-foreground/30"
                                                    )}
                                                >
                                                    {!col.hidden && <Check className="h-2.5 w-2.5 text-white" />}
                                                </div>
                                                <span className="truncate flex-1">{col.header}</span>
                                                {enableColumnPinning && !col.hidden && (
                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleColPin(col.key, col.pinned === "left" ? undefined : "left");
                                                            }}
                                                            className={cn(
                                                                "p-1 rounded hover:bg-background",
                                                                col.pinned === "left" && "text-primary"
                                                            )}
                                                            title="Pin left"
                                                        >
                                                            <Pin className="h-3 w-3 rotate-[-45deg]" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleColPin(col.key, col.pinned === "right" ? undefined : "right");
                                                            }}
                                                            className={cn(
                                                                "p-1 rounded hover:bg-background",
                                                                col.pinned === "right" && "text-primary"
                                                            )}
                                                            title="Pin right"
                                                        >
                                                            <Pin className="h-3 w-3 rotate-[45deg]" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Import File Input (Hidden) */}
                        {onImport && <input ref={importRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />}

                        {/* Presets Menu (Hidden, triggered from More menu) */}
                        {presetKey && presetMenuOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPresetMenuOpen(false)}>
                                <div className="relative w-96 max-w-[90vw] bg-background border rounded-xl shadow-2xl py-2 animate-in zoom-in-95 fade-in duration-100 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        View Presets
                                    </p>
                                    <button
                                        onClick={() => {
                                            const name = prompt("Enter preset name:");
                                            if (name?.trim()) savePreset(name.trim());
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                                    >
                                        <BookmarkPlus className="h-4 w-4" />
                                        Save Current View
                                    </button>
                                    {Object.keys(presets).length > 0 && <div className="h-px bg-border my-1 mx-2" />}
                                    {Object.keys(presets).map((name) => (
                                        <div key={name} className="flex items-center gap-1 px-3 py-1 hover:bg-muted group">
                                            <button onClick={() => loadPreset(name)} className="flex-1 text-left text-sm py-1">
                                                {name}
                                            </button>
                                            <button
                                                onClick={() => deletePreset(name)}
                                                className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 p-1"
                                                aria-label={`Delete preset ${name}`}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Filters */}
                {quickFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Quick Filters:
                        </span>
                        {quickFilters.map((filter) => (
                            <Badge
                                key={filter.key}
                                variant={activeQuickFilters.has(filter.key) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/80 transition-colors gap-1 h-6 text-xs"
                                onClick={() => toggleQuickFilter(filter.key)}
                            >
                                {filter.icon}
                                {filter.label}
                                {activeQuickFilters.has(filter.key) && <Check className="h-3 w-3" />}
                            </Badge>
                        ))}
                        {activeQuickFilters.size > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setActiveQuickFilters(new Set());
                                    toast.success("Quick filters cleared");
                                }}
                                className="h-6 px-2 text-[10px]"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                )}

                {/* Custom Toolbar */}
                {toolbar && <div className="pt-1.5 border-t mt-1">{toolbar}</div>}
            </div>

            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />

            {/* ── Column Filters ── Only show when NOT using inline filters */}
            {
                !inlineFilters && showColFilters && (
                    <div className="px-4 py-3 border-b bg-muted/10 space-y-2 animate-in slide-in-from-top duration-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5" />
                                Column Filters
                            </p>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setColFilters({});
                                    setPage(1);
                                    toast.success("Column filters cleared");
                                }}
                                className="h-6 text-xs"
                            >
                                Clear All
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {columns
                                .filter((c) => !c.hidden && c.filterable !== false && c.type !== "actions")
                                .map((col) => (
                                    <div key={col.key} className="relative">
                                        <label className="text-[10px] font-semibold text-muted-foreground mb-1 block">
                                            {col.header}
                                        </label>
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder={`Filter ${col.header}...`}
                                            value={colFilters[col.key] ?? ""}
                                            onChange={(e) => {
                                                setColFilters((prev) => ({ ...prev, [col.key]: e.target.value }));
                                                setPage(1);
                                            }}
                                        />
                                        {colFilters[col.key] && (
                                            <button
                                                onClick={() => {
                                                    setColFilters((prev) => {
                                                        const updated = { ...prev };
                                                        delete updated[col.key];
                                                        return updated;
                                                    });
                                                    setPage(1);
                                                }}
                                                className="absolute right-2 top-[26px] text-muted-foreground hover:text-foreground"
                                                aria-label={`Clear ${col.header} filter`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )
            }

            {/* ── Loading State ── */}
            {loading && <Skeleton rows={6} cols={visibleCols.length} />}

            {/* ── Desktop Table ── */}
            {
                !loading && (
                    <div className="hidden md:block overflow-hidden">
                        <div
                            className="overflow-auto"
                            style={{ maxHeight: fullscreen ? "calc(100vh - 220px)" : `${maxHeight}px` }}
                        >
                            <table className="w-full border-collapse">
                                {/* Header */}
                                <thead className="sticky top-0 z-[15] bg-gradient-to-r from-muted/90 to-muted/70 backdrop-blur-sm border-b-2 border-primary/20">
                                    <tr>
                                        {selectable && (
                                            <th className="px-3 py-3 text-center w-12 bg-muted/90 backdrop-blur-sm">
                                                <button
                                                    onClick={toggleAll}
                                                    className={cn(
                                                        "h-4 w-4 rounded border-2 flex items-center justify-center mx-auto transition-all",
                                                        selected.size === paginated.length && paginated.length > 0
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground/30 hover:border-primary"
                                                    )}
                                                    aria-label="Select all rows"
                                                    aria-checked={selected.size === paginated.length && paginated.length > 0}
                                                    role="checkbox"
                                                >
                                                    {selected.size === paginated.length && paginated.length > 0 && (
                                                        <Check className="h-2.5 w-2.5 text-white" />
                                                    )}
                                                </button>
                                            </th>
                                        )}
                                        {expandedRowRender && <th className="px-1 w-10 bg-muted/90 backdrop-blur-sm" />}
                                        {enableRowPinning && <th className="px-1 w-10 bg-muted/90 backdrop-blur-sm" />}
                                        {visibleCols.map((col) => (
                                            <th
                                                key={col.key}
                                                className={cn(
                                                    "px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b group relative",
                                                    col.align === "center" && "text-center",
                                                    col.align === "right" && "text-right",
                                                    col.pinned === "left" && "sticky left-0 bg-muted/90 backdrop-blur-sm z-[25]",
                                                    col.pinned === "right" && "sticky right-0 bg-muted/90 backdrop-blur-sm z-[25]"
                                                )}
                                                style={colWidths[col.key] ? { width: colWidths[col.key] } : {}}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.effectAllowed = "move";
                                                    e.dataTransfer.setData("text/plain", col.key);
                                                }}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = "move";
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const draggedKey = e.dataTransfer.getData("text/plain");
                                                    const targetKey = col.key;
                                                    if (draggedKey !== targetKey) {
                                                        setColumns((prev) => {
                                                            const draggedIdx = prev.findIndex((c) => c.key === draggedKey);
                                                            const targetIdx = prev.findIndex((c) => c.key === targetKey);
                                                            if (draggedIdx === -1 || targetIdx === -1) return prev;
                                                            const newCols = [...prev];
                                                            const [draggedCol] = newCols.splice(draggedIdx, 1);
                                                            newCols.splice(targetIdx, 0, draggedCol);
                                                            return newCols;
                                                        });
                                                        toast.success("Column reordered");
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5 relative">
                                                    {col.sortable !== false ? (
                                                        <button
                                                            onClick={(e) => handleSort(col.key, e.shiftKey)}
                                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors flex-1"
                                                            title={`Sort by ${col.header} (Shift+Click for multi-sort)`}
                                                        >
                                                            <span className="truncate">{col.header}</span>
                                                            {sortBadge(col.key) ?? (
                                                                <ChevronsUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="truncate flex-1">{col.header}</span>
                                                    )}
                                                    {col.pinned && (
                                                        <Pin className={cn("h-3 w-3 text-primary", col.pinned === "right" && "rotate-180")} />
                                                    )}
                                                    <div
                                                        className="absolute -right-1 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onMouseDown={(e) => startResize(e, col.key)}
                                                        aria-label={`Resize ${col.header} column`}
                                                    />
                                                </div>
                                            </th>
                                        ))}
                                        {rowActions && (
                                            <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground sticky right-0 bg-muted/80 backdrop-blur-sm z-[25] border-l w-28">
                                                Actions
                                            </th>
                                        )}
                                    </tr>

                                    {/* Inline Filter Row */}
                                    {inlineFilters && (
                                        <tr className="bg-muted/30 border-b">
                                            {selectable && <th className="px-1 py-1 bg-muted/30 backdrop-blur-sm" />}
                                            {expandedRowRender && <th className="px-1 py-1 bg-muted/30 backdrop-blur-sm" />}
                                            {enableRowPinning && <th className="px-1 py-1 bg-muted/30 backdrop-blur-sm" />}
                                            {visibleCols.map((col) => (
                                                <th
                                                    key={col.key}
                                                    className={cn(
                                                        "px-2 py-1.5",
                                                        col.pinned === "left" && "sticky left-0 bg-muted/30 backdrop-blur-sm z-[25]",
                                                        col.pinned === "right" && "sticky right-0 bg-muted/30 backdrop-blur-sm z-[25]"
                                                    )}
                                                    style={colWidths[col.key] ? { width: colWidths[col.key] } : {}}
                                                >
                                                    {col.filterable !== false && col.type !== "actions" ? (
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
                                                            <Input
                                                                className="h-7 text-xs pl-7 pr-7 border-border/50 bg-background/80 focus:bg-background placeholder:text-muted-foreground/40"
                                                                placeholder={`Search`}
                                                                value={colFilters[col.key] ?? ""}
                                                                onChange={(e) => {
                                                                    setColFilters((prev) => ({ ...prev, [col.key]: e.target.value }));
                                                                    setPage(1);
                                                                }}
                                                            />
                                                            {colFilters[col.key] && (
                                                                <button
                                                                    onClick={() => {
                                                                        setColFilters((prev) => {
                                                                            const updated = { ...prev };
                                                                            delete updated[col.key];
                                                                            return updated;
                                                                        });
                                                                        setPage(1);
                                                                        toast.success(`Filter cleared for ${col.header}`);
                                                                    }}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                                    aria-label={`Clear ${col.header} filter`}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-7" />
                                                    )}
                                                </th>
                                            ))}
                                            {rowActions && <th className="px-1 py-1 sticky right-0 bg-muted/30 backdrop-blur-sm z-[25] border-l" />}
                                        </tr>
                                    )}
                                </thead>

                                {/* Body */}
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    visibleCols.length +
                                                    (selectable ? 1 : 0) +
                                                    (expandedRowRender != null ? 1 : 0) +
                                                    (enableRowPinning ? 1 : 0) +
                                                    (rowActions ? 1 : 0)
                                                }
                                                className="text-center py-20"
                                            >
                                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                                        {emptyIcon ?? <Filter className="h-7 w-7 opacity-40" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{emptyMessage}</p>
                                                        <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                                                    </div>
                                                    {(search || Object.values(colFilters).some((v) => v) || activeQuickFilters.size > 0) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSearch("");
                                                                setColFilters({});
                                                                setActiveQuickFilters(new Set());
                                                                toast.success("All filters cleared");
                                                            }}
                                                            className="mt-2"
                                                        >
                                                            <X className="h-3.5 w-3.5 mr-1.5" />
                                                            Clear all filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((row, ri) => {
                                            const id = getNested(row, rowKey);
                                            const isSel = selected.has(id);
                                            const isExp = expanded.has(id);
                                            const isPinned = pinnedRows.has(id);
                                            const actions = rowActions ? (typeof rowActions === "function" ? rowActions(row) : rowActions) : [];
                                            return (
                                                <React.Fragment key={id ?? ri}>
                                                    <tr
                                                        className={cn(
                                                            "border-b border-border/40 transition-all duration-200 group",
                                                            "hover:bg-muted/50 hover:shadow-sm",
                                                            isSel && "bg-primary/5 hover:bg-primary/8 border-primary/20",
                                                            stripedRows && ri % 2 !== 0 && "bg-muted/5",
                                                            isPinned && "bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900 sticky top-[49px] z-10"
                                                        )}
                                                        onContextMenu={(e) => handleRightClick(e, row)}
                                                        onMouseEnter={() => setHoveredRow(ri)}
                                                        onMouseLeave={() => setHoveredRow(null)}
                                                    >
                                                        {selectable && (
                                                            <td className="px-3" onClick={() => toggleRow(id)}>
                                                                <button
                                                                    className={cn(
                                                                        "h-4 w-4 rounded border-2 flex items-center justify-center mx-auto transition-all",
                                                                        isSel ? "bg-primary border-primary scale-110" : "border-muted-foreground/30 hover:border-primary hover:scale-110"
                                                                    )}
                                                                    aria-label={isSel ? "Deselect row" : "Select row"}
                                                                    aria-checked={isSel}
                                                                    role="checkbox"
                                                                >
                                                                    {isSel && <Check className="h-2.5 w-2.5 text-white" />}
                                                                </button>
                                                            </td>
                                                        )}
                                                        {expandedRowRender && (
                                                            <td className="px-1 text-center">
                                                                {(!canExpandRow || canExpandRow(row)) && (
                                                                    <button
                                                                        onClick={() => toggleExpand(id)}
                                                                        className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-muted mx-auto transition-colors"
                                                                        aria-label={isExp ? "Collapse row" : "Expand row"}
                                                                        aria-expanded={isExp}
                                                                    >
                                                                        <ExpandIcon
                                                                            className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExp && "rotate-90")}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                        {enableRowPinning && (
                                                            <td className="px-1 text-center">
                                                                <button
                                                                    onClick={() => togglePinRow(id)}
                                                                    className={cn(
                                                                        "h-6 w-6 flex items-center justify-center rounded-lg mx-auto transition-all",
                                                                        isPinned
                                                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200"
                                                                            : "opacity-0 group-hover:opacity-100 hover:bg-muted"
                                                                    )}
                                                                    aria-label={isPinned ? "Unpin row" : "Pin row"}
                                                                    title={isPinned ? "Unpin from top" : "Pin to top"}
                                                                >
                                                                    {isPinned ? <Star className="h-3.5 w-3.5 fill-current" /> : <Star className="h-3.5 w-3.5" />}
                                                                </button>
                                                            </td>
                                                        )}
                                                        {visibleCols.map((col) => {
                                                            const value = getNested(row, col.key);
                                                            const tooltip =
                                                                col.tooltip === true
                                                                    ? String(value ?? "")
                                                                    : typeof col.tooltip === "function"
                                                                        ? col.tooltip(value, row)
                                                                        : undefined;
                                                            return (
                                                                <td
                                                                    key={col.key}
                                                                    className={cn(
                                                                        "px-3 text-sm",
                                                                        rowPadding,
                                                                        col.align === "center" && "text-center",
                                                                        col.align === "right" && "text-right",
                                                                        col.width && "overflow-hidden",
                                                                        col.pinned === "left" && "sticky left-0 bg-background group-hover:bg-muted/50 z-[5]",
                                                                        col.pinned === "left" && isSel && "bg-primary/5 group-hover:bg-primary/8",
                                                                        col.pinned === "right" && "sticky right-0 bg-background group-hover:bg-muted/50 z-[5]",
                                                                        col.pinned === "right" && isSel && "bg-primary/5 group-hover:bg-primary/8",
                                                                        isPinned && col.pinned === "left" && "bg-amber-50/50 dark:bg-amber-950/10",
                                                                        isPinned && col.pinned === "right" && "bg-amber-50/50 dark:bg-amber-950/10"
                                                                    )}
                                                                    style={colWidths[col.key] ? { width: colWidths[col.key] } : {}}
                                                                    title={tooltip}
                                                                >
                                                                    {col.editable ? (
                                                                        <EditableCell
                                                                            col={col}
                                                                            value={value}
                                                                            row={row}
                                                                            rowIndex={ri}
                                                                            onCommit={(v) => handleCellEdit(row, col.key, v)}
                                                                        />
                                                                    ) : (
                                                                        <Cell col={col} value={value} row={row} rowIndex={ri} searchTerm={search} />
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        {rowActions && actions.length > 0 && (
                                                            <td className={cn(
                                                                "px-2 text-center sticky right-0 z-[5] border-l bg-background group-hover:bg-muted/30",
                                                                isPinned && "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50"
                                                            )}>
                                                                <div className="flex items-center justify-center gap-0.5">
                                                                    {actions.map((action, i) => (
                                                                        <button
                                                                            key={i}
                                                                            onClick={() => action.onClick(row)}
                                                                            title={action.label}
                                                                            className={cn(
                                                                                "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                                                                                action.danger
                                                                                    ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                            )}
                                                                            aria-label={action.label}
                                                                        >
                                                                            {action.icon ?? <MoreVertical className="h-3.5 w-3.5" />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                    {isExp && expandedRowRender && (!canExpandRow || canExpandRow(row)) && (
                                                        <tr className="bg-muted/5 animate-in slide-in-from-top duration-200">
                                                            <td
                                                                colSpan={
                                                                    visibleCols.length +
                                                                    (selectable ? 1 : 0) +
                                                                    (expandedRowRender != null ? 1 : 0) +
                                                                    (enableRowPinning ? 1 : 0) +
                                                                    (rowActions ? 1 : 0)
                                                                }
                                                                className="p-0 border-b bg-background sticky left-0 z-10"
                                                                style={{
                                                                    position: "sticky",
                                                                    left: 0,
                                                                    width: "fit-content",
                                                                    maxWidth: "100%",
                                                                    display: "table-cell",
                                                                }}
                                                            >
                                                                <div className="w-[calc(100vw-360px)] md:w-[calc(100vw-360px)] lg:w-[calc(100vw-360px)]">
                                                                    {expandedRowRender?.(row)}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>

                                {/* Aggregate Footer */}
                                {visibleCols.some((c) => c.aggregate && c.aggregate !== "none") && processed.length > 0 && (
                                    <tfoot className="sticky bottom-0 z-[15] bg-gradient-to-r from-muted/90 to-muted/70 backdrop-blur-sm border-t-2 border-primary/20">
                                        <tr>
                                            {selectable && <td className="bg-muted/90 backdrop-blur-sm" />}
                                            {expandedRowRender && <td className="bg-muted/90 backdrop-blur-sm" />}
                                            {enableRowPinning && <td className="bg-muted/90 backdrop-blur-sm" />}
                                            {visibleCols.map((col) => {
                                                if (!col.aggregate || col.aggregate === "none")
                                                    return (
                                                        <td
                                                            key={col.key}
                                                            className={cn(
                                                                "px-3 py-2",
                                                                col.pinned === "left" && "sticky left-0 bg-muted/90 backdrop-blur-sm z-[25]",
                                                                col.pinned === "right" && "sticky right-0 bg-muted/90 backdrop-blur-sm z-[25]"
                                                            )}
                                                        />
                                                    );
                                                const values = processed.map((r) => Number(getNested(r, col.key))).filter((v) => !isNaN(v));
                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={cn(
                                                            "px-3 py-2 text-xs font-bold",
                                                            col.align === "center" && "text-center",
                                                            col.align === "right" && "text-right",
                                                            col.pinned === "left" && "sticky left-0 bg-muted/90 backdrop-blur-sm z-[25]",
                                                            col.pinned === "right" && "sticky right-0 bg-muted/90 backdrop-blur-sm z-[25]"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-1.5 text-primary">
                                                            <Sigma className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-0.5">
                                                                {col.aggregate}:
                                                            </span>
                                                            <span className="font-bold">{aggregate(values, col.aggregate)}</span>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            {rowActions && <td className="bg-muted/90 backdrop-blur-sm" />}
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )
            }

            {/* ── Mobile Cards ── */}
            {
                !loading && (
                    <div
                        className="md:hidden overflow-y-auto p-3 space-y-3"
                        style={{ maxHeight: fullscreen ? "calc(100vh - 260px)" : `${maxHeight}px` }}
                    >
                        {paginated.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                    {emptyIcon ?? <Filter className="h-7 w-7 opacity-40" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{emptyMessage}</p>
                                    <p className="text-xs mt-1">Try adjusting your filters</p>
                                </div>
                            </div>
                        ) : (
                            paginated.map((row, ri) => (
                                <MobileCard
                                    key={getNested(row, rowKey) ?? ri}
                                    row={row}
                                    columns={columns}
                                    rowIndex={ri}
                                    selected={selected.has(getNested(row, rowKey))}
                                    onSelect={() => toggleRow(getNested(row, rowKey))}
                                    selectable={selectable}
                                    canExpandRow={canExpandRow}
                                    expandedRowRender={expandedRowRender}
                                    onCellEdit={onCellEdit ? handleCellEdit : undefined}
                                    isPinned={enableRowPinning && pinnedRows.has(getNested(row, rowKey))}
                                    onTogglePin={enableRowPinning ? () => togglePinRow(getNested(row, rowKey)) : undefined}
                                    rowActions={rowActions}
                                    onRowClick={onMobileRowClick}
                                />
                            ))
                        )}
                    </div>
                )
            }

            {/* ── Status Bar ── */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t bg-gradient-to-r from-muted/20 to-muted/10 text-[11px] text-muted-foreground shrink-0">
                <span className="hidden md:flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Total: <strong className="text-foreground">{data.length.toLocaleString()}</strong>
                </span>
                {processed.length !== data.length && (
                    <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-primary" />
                        Filtered: <strong className="text-primary">{processed.length.toLocaleString()}</strong>
                    </span>
                )}
                {selected.size > 0 && (
                    <span className="flex items-center gap-1 text-primary font-semibold">
                        <Check className="h-3 w-3" />
                        {selected.size} selected
                    </span>
                )}
                {pinnedRows.size > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="h-3 w-3 fill-current" />
                        {pinnedRows.size} pinned
                    </span>
                )}
                {sorts.length > 0 && (
                    <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Sorted: <strong className="text-foreground">{sorts.map((s) => `${s.key} ${s.dir}`).join(", ")}</strong>
                    </span>
                )}
                <span className="ml-auto flex items-center gap-1">
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
            </div>

            {/* ── Pagination ── */}
            {
                !loading && processed.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t shrink-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="hidden sm:inline">Rows per page:</span>
                            <div className="flex items-center border rounded-lg overflow-hidden shadow-sm" role="group" aria-label="Rows per page">
                                {pageSizes.map((sz) => (
                                    <button
                                        key={sz}
                                        onClick={() => {
                                            setPageSize(sz);
                                            setPage(1);
                                            toast.success(`Showing ${sz} rows per page`);
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium transition-all",
                                            pageSize === sz
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "hover:bg-muted text-muted-foreground"
                                        )}
                                        aria-label={`${sz} rows per page`}
                                        aria-pressed={pageSize === sz}
                                    >
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                                {Math.min((page - 1) * pageSize + 1, processed.length)}–{Math.min(page * pageSize, processed.length)}
                            </span>{" "}
                            of <span className="font-semibold text-foreground">{processed.length.toLocaleString()}</span>
                        </p>
                        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="First page"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 1}
                                className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p =
                                    totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "h-8 min-w-[32px] px-2 rounded-lg border text-xs font-medium transition-all",
                                            page === p
                                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-110"
                                                : "hover:bg-muted text-muted-foreground hover:border-primary hover:scale-105"
                                        )}
                                        aria-label={`Page ${p}`}
                                        aria-current={page === p ? "page" : undefined}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page === totalPages}
                                className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="h-8 w-8 rounded-lg border flex items-center justify-center text-muted-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                aria-label="Last page"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* ── Floating Bulk Action Bar ── */}
            {
                selected.size > 0 && bulkActions && (
                    <div
                        className={cn(
                            "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-2xl shadow-2xl border-2 border-primary animate-in slide-in-from-bottom-4 duration-300"
                        )}
                        role="toolbar"
                        aria-label="Bulk actions"
                    >
                        <span className="text-sm font-bold mr-2 flex items-center gap-1.5">
                            <Check className="h-4 w-4" />
                            {selected.size} selected
                        </span>
                        <div className="w-px h-6 bg-background/20" />
                        {bulkActions.map((action, i) => (
                            <Button
                                key={i}
                                size="sm"
                                variant="ghost"
                                className={cn(
                                    "h-8 text-xs text-background hover:bg-background/10 gap-1.5",
                                    action.danger && "text-red-300 hover:text-red-200 hover:bg-red-500/20"
                                )}
                                onClick={() => action.onClick(data.filter((r) => selected.has(getNested(r, rowKey))))}
                            >
                                {action.icon}
                                {action.label}
                            </Button>
                        ))}
                        <div className="w-px h-6 bg-background/20" />
                        <button
                            onClick={() => {
                                setSelected(new Set());
                                toast.success("Selection cleared");
                            }}
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-background/10 transition-colors"
                            aria-label="Clear selection"
                        >
                            <X className="h-4 w-4 text-background" />
                        </button>
                    </div>
                )
            }

            {/* ── Context Menu ── */}
            {ctx && <CtxMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} />}
        </div >
    );
}
