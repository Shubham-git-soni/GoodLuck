"use client";

import * as React from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  /** Show a search box inside the dropdown */
  searchable?: boolean;
  /** Max height of dropdown list */
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
  maxHeight = 240,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click — supports both mouse and touch
  React.useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  // Focus search on open — desktop only, never on mobile (keyboard hides options)
  React.useEffect(() => {
    if (open && searchable && searchRef.current) {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 80);
      }
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

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* ── Trigger ── */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpen((o) => !o); } }}
        className={cn(
          "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-150 cursor-pointer select-none",
          "hover:border-ring/50 hover:bg-accent/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
          open && "border-ring ring-2 ring-ring",
          disabled && "cursor-not-allowed opacity-50 pointer-events-none"
        )}
      >
        {/* Left: chips or placeholder */}
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

        {/* Right: clear + chevron */}
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

      {/* ── Dropdown — centered modal on mobile, absolute on desktop ── */}
      {open && (
        <>
          {/* Mobile: backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            onClick={() => { setOpen(false); setSearch(""); }}
          />
          <div
            ref={dropdownRef}
            className={cn(
              // Mobile: centered modal
              "fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[61] md:hidden",
              "rounded-2xl border border-border bg-popover shadow-2xl",
              "animate-in fade-in zoom-in-95 duration-200",
              "max-h-[70dvh] flex flex-col",
              // Desktop: absolute dropdown
              "md:absolute md:left-0 md:right-auto md:top-[calc(100%+6px)] md:translate-y-0 md:w-full md:z-50",
              "md:rounded-xl md:border md:shadow-lg",
              "md:animate-in md:fade-in-0 md:zoom-in-95 md:slide-in-from-top-2 md:duration-150"
            )}
          >
            {/* Title bar — mobile & desktop */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
              <p className="text-sm font-semibold">
                {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : "Select option(s)"}
              </p>
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Search — always shown, mobile-safe (no auto-focus) */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="flex items-center gap-2 rounded-xl bg-muted/60 border border-border/60 px-3 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  // readOnly on mount so mobile keyboard doesn't pop up automatically;
                  // removed on tap so user can type when they explicitly want to search
                  onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                  readOnly
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Select-all / Clear row */}
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] text-muted-foreground">
                {filtered.length} option{filtered.length !== 1 ? "s" : ""}
              </span>
              {selectedOptions.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[11px] font-medium text-destructive hover:text-destructive/70 transition-colors"
                >
                  Clear all
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      options
                        .filter((o) => !o.disabled)
                        .slice(0, maxSelected ?? Infinity)
                        .map((o) => o.value)
                    )
                  }
                  className="text-[11px] font-medium text-primary hover:text-primary/70 transition-colors"
                >
                  Select all
                </button>
              )}
            </div>

            {/* Options list */}
            <div
              className="overflow-y-auto p-1.5 md:max-h-none flex-1"
              style={{ maxHeight: typeof window !== "undefined" && window.innerWidth >= 768 ? maxHeight : undefined }}
              // Prevent touch scroll from closing the dropdown
              onTouchMove={(e) => e.stopPropagation()}
            >
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  const isDisabledByMax = hasMax && !isSelected;
                  const isDisabled = opt.disabled || isDisabledByMax;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors",
                        "disabled:pointer-events-none disabled:opacity-40",
                        isSelected
                          ? "bg-primary/8 text-primary font-medium"
                          : "text-foreground hover:bg-muted/60 active:bg-muted"
                      )}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-input bg-background"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />
                        )}
                      </span>

                      {/* Label + description */}
                      <span className="flex-1 min-w-0">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block truncate text-xs text-muted-foreground font-normal mt-0.5">
                            {opt.description}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer: Done button */}
            <div className="border-t border-border/40 px-3 py-3">
              {maxSelected && (
                <p className="text-[11px] text-muted-foreground text-center mb-2">
                  {value.length} / {maxSelected} selected
                </p>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold active:bg-primary/90 transition-colors"
              >
                Done{selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
