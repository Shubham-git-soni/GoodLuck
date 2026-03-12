"use client";

import * as React from "react";
import { Clock, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";


interface TimePickerProps {
    value?: string;          // "HH:MM" in 24h format
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n: number) {
    return String(n).padStart(2, "0");
}

function parse24(val?: string): { h: number; m: number } {
    if (!val) return { h: 9, m: 0 };
    const [h, m] = val.split(":").map(Number);
    return { h: isNaN(h) ? 9 : h, m: isNaN(m) ? 0 : m };
}

function to24(h: number, m: number, ampm: "AM" | "PM"): string {
    let hour = h % 12;
    if (ampm === "PM") hour += 12;
    return `${pad(hour)}:${pad(m)}`;
}

function from24(val?: string): { h12: number; m: number; ampm: "AM" | "PM" } {
    const { h, m } = parse24(val);
    const ampm: "AM" | "PM" = h < 12 ? "AM" : "PM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { h12, m, ampm };
}

// ─── Scroll Column ────────────────────────────────────────────────────────────
function ScrollColumn<T extends string | number>({
    items,
    selected,
    onSelect,
    label,
    display,
}: {
    items: T[];
    selected: T;
    onSelect: (v: T) => void;
    label: string;
    display?: (v: T) => string;
}) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const isProgrammaticRef = React.useRef(false);
    const itemHeight = 44;
    const fmt = display ?? ((v: T) => String(v));

    // Scroll to selected on mount only (not on every change — buttons handle their own scroll)
    React.useEffect(() => {
        const idx = items.indexOf(selected);
        if (idx >= 0 && scrollRef.current) {
            scrollRef.current.scrollTop = idx * itemHeight;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollToIndex = (idx: number, smooth = true) => {
        if (!scrollRef.current) return;
        isProgrammaticRef.current = true;
        scrollRef.current.scrollTo({ top: idx * itemHeight, behavior: smooth ? "smooth" : "instant" });
        // Release lock after animation completes
        setTimeout(() => { isProgrammaticRef.current = false; }, 350);
    };

    const handleScroll = React.useCallback(() => {
        if (isProgrammaticRef.current || !scrollRef.current) return;
        const idx = Math.round(scrollRef.current.scrollTop / itemHeight);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        if (items[clamped] !== selected) onSelect(items[clamped]);
    }, [items, selected, onSelect]);

    const step = (dir: 1 | -1) => {
        const idx = items.indexOf(selected);
        const next = Math.max(0, Math.min(idx + dir, items.length - 1));
        if (next === idx) return;
        onSelect(items[next]);
        scrollToIndex(next);
    };

    return (
        <div className="flex flex-col items-center gap-1 select-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-1">{label}</span>

            <button
                type="button"
                onClick={() => step(-1)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition-all text-muted-foreground"
            >
                <ChevronUp className="h-4 w-4" />
            </button>

            {/* Scroll container */}
            <div className="relative w-[64px]">
                {/* Selection highlight */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[44px] bg-primary/10 rounded-xl border border-primary/20 pointer-events-none z-10" />

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto h-[132px] no-scrollbar"
                    style={{ scrollbarWidth: "none" }}
                >
                    {/* top padding spacer */}
                    <div className="h-[44px]" />
                    {items.map((item) => (
                        <button
                            key={String(item)}
                            type="button"
                            onClick={() => {
                                const idx = items.indexOf(item);
                                onSelect(item);
                                scrollToIndex(idx);
                            }}
                            className={cn(
                                "w-full h-[44px] flex items-center justify-center rounded-lg transition-all font-mono text-lg font-semibold",
                                item === selected
                                    ? "text-primary scale-110"
                                    : "text-muted-foreground/50 hover:text-muted-foreground hover:scale-105"
                            )}
                        >
                            {fmt(item)}
                        </button>
                    ))}
                    {/* bottom padding spacer */}
                    <div className="h-[44px]" />
                </div>
            </div>

            <button
                type="button"
                onClick={() => step(1)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-95 transition-all text-muted-foreground"
            >
                <ChevronDown className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── TimePickerModal ──────────────────────────────────────────────────────────
function TimePickerModal({
    value,
    onChange,
    onClose,
}: {
    value?: string;
    onChange: (v: string) => void;
    onClose: () => void;
}) {
    const { h12, m, ampm } = from24(value);
    const [selH, setSelH] = React.useState(h12);
    const [selM, setSelM] = React.useState(m);
    const [selAMPM, setSelAMPM] = React.useState<"AM" | "PM">(ampm);

    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleApply = () => {
        onChange(to24(selH, selM, selAMPM));
        onClose();
    };

    const handleClear = () => {
        onChange("");
        onClose();
    };

    const displayTime = `${pad(selH)}:${pad(selM)} ${selAMPM}`;

    return (
        <div className="relative bg-background rounded-3xl w-[320px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-3">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Select Time
                    </p>
                    <p className="text-2xl font-bold leading-tight tracking-tight font-mono">
                        {displayTime}
                    </p>
                </div>
            </div>

            <div className="h-px bg-border mx-6" />

            {/* Scroll wheels */}
            <div className="flex items-start justify-center gap-3 px-6 py-4">
                <ScrollColumn
                    items={hours}
                    selected={selH}
                    onSelect={setSelH}
                    label="Hour"
                    display={(v) => pad(v as number)}
                />

                {/* Colon separator */}
                <div className="flex flex-col items-center justify-center h-full pt-8 pb-4 text-2xl font-bold text-muted-foreground/50 select-none self-center">
                    :
                </div>

                <ScrollColumn
                    items={minutes}
                    selected={selM}
                    onSelect={setSelM}
                    label="Min"
                    display={(v) => pad(v as number)}
                />

                {/* AM/PM */}
                <div className="flex flex-col items-center gap-1 select-none pt-7">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-1">—</span>
                    <button
                        type="button"
                        onClick={() => setSelAMPM("AM")}
                        className={cn(
                            "h-[44px] w-[48px] rounded-xl text-sm font-bold transition-all",
                            selAMPM === "AM"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        AM
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelAMPM("PM")}
                        className={cn(
                            "h-[44px] w-[48px] rounded-xl text-sm font-bold transition-all",
                            selAMPM === "PM"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted"
                        )}
                    >
                        PM
                    </button>
                </div>
            </div>

            <div className="h-px bg-border mx-6" />

            {/* Footer */}
            <div className="flex gap-3 px-6 py-5 bg-muted/10">
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 h-12 rounded-2xl border border-input bg-background text-sm font-semibold hover:bg-muted transition-colors"
                >
                    Clear
                </button>
                <button
                    type="button"
                    onClick={handleApply}
                    className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}

// ─── Exported TimePicker ──────────────────────────────────────────────────────
export function TimePicker({
    value,
    onChange,
    placeholder = "Select time",
    disabled = false,
    className,
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const mql = window.matchMedia("(max-width: 767px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const displayValue = React.useMemo(() => {
        if (!value) return null;
        const { h12, m, ampm } = from24(value);
        return `${pad(h12)}:${pad(m)} ${ampm}`;
    }, [value]);

    return (
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={cn(
                    "flex h-10 w-full items-center justify-start text-left rounded-md border border-input bg-background px-3 text-sm",
                    "ring-offset-background transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    displayValue ? "text-foreground" : "text-muted-foreground",
                    className
                )}
            >
                <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left">{displayValue ?? placeholder}</span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[600] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={() => setOpen(false)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <TimePickerModal
                            value={value}
                            onChange={onChange}
                            onClose={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
