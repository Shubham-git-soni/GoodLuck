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
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm transition-all duration-150",
          "hover:border-ring/50 hover:bg-accent/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
          open && "border-ring ring-2 ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50"
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
      </button>

      {/* ── Dropdown — fixed on mobile, absolute on desktop ── */}
      {open && (
        <>
          {/* Mobile: full-width bottom sheet style overlay */}
          <div
            className="fixed inset-0 z-[60] md:hidden"
            onClick={() => { setOpen(false); setSearch(""); }}
          />
          <div
            ref={dropdownRef}
            className={cn(
              // Mobile: fixed bottom panel
              "fixed left-0 right-0 bottom-0 z-[61] md:hidden",
              "rounded-t-2xl border-t border-border bg-popover shadow-2xl",
              "animate-in slide-in-from-bottom duration-200",
              "max-h-[75dvh] flex flex-col",
              // Desktop: absolute dropdown
              "md:absolute md:left-0 md:right-auto md:bottom-auto md:top-[calc(100%+6px)] md:w-full md:z-50",
              "md:rounded-xl md:border md:shadow-lg",
              "md:animate-in md:fade-in-0 md:zoom-in-95 md:slide-in-from-top-2 md:duration-150"
            )}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 md:hidden">
              <div className="w-8 h-1 rounded-full bg-border" />
            </div>

            {/* Search */}
            {searchable && (
              <div className="border-b border-border/60 p-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    onFocus={(e) => e.target.removeAttribute("readOnly")}
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
            )}

            {/* Header row: count + select-all/clear */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {selectedOptions.length > 0
                  ? `${selectedOptions.length} selected`
                  : "Select options"}
              </span>
              {selectedOptions.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-[11px] font-medium text-primary hover:text-primary/70 transition-colors"
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

            {/* Footer: max limit hint + close button on mobile */}
            <div className={cn(
              "border-t border-border/40 px-3 py-2 flex items-center",
              maxSelected ? "justify-between" : "justify-end"
            )}>
              {maxSelected && (
                <p className="text-[11px] text-muted-foreground">
                  {value.length} / {maxSelected} selected
                </p>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="md:hidden text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 active:bg-primary/20"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
