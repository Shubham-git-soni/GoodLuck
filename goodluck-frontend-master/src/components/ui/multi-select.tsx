"use client";

import * as React from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelected?: number;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  maxHeight?: number;
}

// ─── Badge chip shown in trigger ─────────────────────────────────────────────

function SelectionBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: (e: React.MouseEvent) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary max-w-[120px]">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-sm p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select options…",
  searchPlaceholder = "Search…",
  maxSelected,
  disabled = false,
  className,
  searchable = false,
  maxHeight = 220,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);



  // Focus search on open — desktop only
  React.useEffect(() => {
    if (open && searchable && searchRef.current && window.innerWidth >= 768) {
      setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 50);
    }
  }, [open, searchable]);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, optValue]);
    }
  };

  const removeAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedOptions = options.filter((o) => value.includes(o.value));
  const hasMax = !!(maxSelected && value.length >= maxSelected);

  const selectableFiltered = filtered.filter((o) => !o.disabled);
  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((o) => value.includes(o.value));

  const handleSelectAll = () => {
    const newVals = selectableFiltered.slice(0, maxSelected ?? Infinity).map((o) => o.value);
    const outside = value.filter((v) => !filtered.some((o) => o.value === v));
    onChange([...outside, ...newVals]);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={(val) => { setOpen(val); if (!val) setSearch(""); }}>
        <PopoverTrigger asChild>
          {/* ── Trigger ── */}
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={(e) => {
              if (disabled) e.preventDefault();
            }}
            className={cn(
              "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-150 cursor-pointer select-none",
              "hover:border-ring/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
              open && "border-ring ring-2 ring-ring rounded-b-none border-b-0",
              disabled && "cursor-not-allowed opacity-50 pointer-events-none"
            )}
          >
            <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              ) : selectedOptions.length <= 3 ? (
                selectedOptions.map((opt) => (
                  <SelectionBadge
                    key={opt.value}
                    label={opt.label}
                    onRemove={(e) => { e.stopPropagation(); toggle(opt.value); }}
                  />
                ))
              ) : (
                <>
                  {selectedOptions.slice(0, 2).map((opt) => (
                    <SelectionBadge
                      key={opt.value}
                      label={opt.label}
                      onRemove={(e) => { e.stopPropagation(); toggle(opt.value); }}
                    />
                  ))}
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    +{selectedOptions.length - 2} more
                  </span>
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 ml-1">
              {selectedOptions.length > 0 && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={removeAll}
                  onKeyDown={(e) => e.key === "Enter" && removeAll(e as any)}
                  className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Clear all"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 opacity-40 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </div>
          </div>
        </PopoverTrigger>

        {/* ── Dropdown ── */}
        <PopoverContent
          align="start"
          sideOffset={0}
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0 z-[9999]",
            "border border-border border-t-0 rounded-b-xl bg-popover shadow-lg",
            "flex-col overflow-hidden",
            "hidden md:flex",
          )}
        >
          {/* Search */}
          <div className="px-3 pt-2.5 pb-1 border-b border-border/40">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Select all / Clear row */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} option{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              {!allFilteredSelected && (
                <button type="button" onClick={handleSelectAll} className="text-[11px] font-medium text-primary hover:text-primary/70 transition-colors">
                  Select all
                </button>
              )}
              {selectedOptions.length > 0 && (
                <>
                  {!allFilteredSelected && <span className="text-[11px] text-muted-foreground/50">·</span>}
                  <button type="button" onClick={() => onChange([])} className="text-[11px] font-medium text-destructive hover:text-destructive/70 transition-colors">
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No options found</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                const isDisabled = opt.disabled || (hasMax && !isSelected);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                      "disabled:pointer-events-none disabled:opacity-40",
                      isSelected
                        ? "bg-primary/8 text-primary font-medium"
                        : "text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                      isSelected ? "bg-primary border-primary" : "border-input bg-background"
                    )}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />}
                    </span>
                    <span className="flex-1 min-w-0 truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 px-3 py-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setSearch(""); }}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:bg-primary/90"
            >
              Done{selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}
            </button>
          </div>
        </PopoverContent>

        {/* ── Mobile: centered modal with backdrop ── */}
        {open && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => { setOpen(false); setSearch(""); }}
            />
            <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[61] rounded-2xl border border-border bg-popover shadow-2xl flex flex-col overflow-hidden max-h-[70dvh]">
              {/* Mobile header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
                <p className="text-sm font-semibold">
                  {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : "Select option(s)"}
                </p>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSearch(""); }}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              {/* Search */}
              <div className="px-3 pt-2.5 pb-1">
                <div className="flex items-center gap-2 rounded-xl bg-muted/60 border border-border/60 px-3 py-2">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                    readOnly
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              {/* Select all / Clear */}
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[11px] text-muted-foreground">{filtered.length} options</span>
                <div className="flex items-center gap-2">
                  {!allFilteredSelected && (
                    <button type="button" onClick={handleSelectAll} className="text-[11px] font-medium text-primary">Select all</button>
                  )}
                  {selectedOptions.length > 0 && (
                    <>
                      {!allFilteredSelected && <span className="text-[11px] text-muted-foreground/50">·</span>}
                      <button type="button" onClick={() => onChange([])} className="text-[11px] font-medium text-destructive">Clear all</button>
                    </>
                  )}
                </div>
              </div>
              {/* Options */}
              <div className="overflow-y-auto flex-1 p-1.5" onTouchMove={(e) => e.stopPropagation()}>
                {filtered.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  const isDisabled = opt.disabled || (hasMax && !isSelected);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors disabled:opacity-40",
                        isSelected ? "bg-primary/8 text-primary font-medium" : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all", isSelected ? "bg-primary border-primary" : "border-input bg-background")}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Done */}
              <div className="border-t border-border/40 px-3 py-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSearch(""); }}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Done{selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
}
