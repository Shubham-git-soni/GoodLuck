"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  from?: string;          // "YYYY-MM-DD"
  to?: string;            // "YYYY-MM-DD"
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear?: () => void;
  className?: string;
  /** ignored — kept for backward compat */
  placeholder?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  className,
}: DateRangePickerProps) {
  const [fromOpen, setFromOpen] = React.useState(false);
  const [toOpen, setToOpen] = React.useState(false);

  const fromDate = from ? new Date(from) : undefined;
  const toDate   = to   ? new Date(to)   : undefined;
  const hasValue = !!(from || to);

  const handleClear = () => {
    onFromChange("");
    onToChange("");
    onClear?.();
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>

      {/* ── Start Date ── */}
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 h-9 justify-start text-left font-normal text-xs gap-1.5 min-w-0",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {fromDate ? format(fromDate, "dd MMM yyyy") : "Start date"}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl shadow-xl border overflow-hidden"
          align="start"
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              Start Date
            </p>
            <p className="text-sm font-semibold text-foreground">
              {fromDate ? format(fromDate, "EEE, dd MMM yyyy") : "Select start date"}
            </p>
          </div>

          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={(d) => {
              onFromChange(d ? format(d, "yyyy-MM-dd") : "");
              if (d && toDate && d > toDate) onToChange("");
              setFromOpen(false);
              setTimeout(() => setToOpen(true), 120);
            }}
            defaultMonth={fromDate ?? new Date()}
            captionLayout="dropdown"
            fromYear={CURRENT_YEAR - 5}
            toYear={CURRENT_YEAR + 2}
            disabled={toDate ? { after: toDate } : undefined}
            className="p-3"
          />

          <div className="flex gap-2 px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => { onFromChange(""); setFromOpen(false); }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs h-8"
              disabled={!from}
              onClick={() => setFromOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Arrow ── */}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

      {/* ── End Date ── */}
      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 h-9 justify-start text-left font-normal text-xs gap-1.5 min-w-0",
              !to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {toDate ? format(toDate, "dd MMM yyyy") : "End date"}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl shadow-xl border overflow-hidden"
          align="start"
          sideOffset={8}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              End Date
            </p>
            <p className="text-sm font-semibold text-foreground">
              {toDate ? format(toDate, "EEE, dd MMM yyyy") : "Select end date"}
            </p>
          </div>

          <Calendar
            mode="single"
            selected={toDate}
            onSelect={(d) => {
              onToChange(d ? format(d, "yyyy-MM-dd") : "");
              setToOpen(false);
            }}
            defaultMonth={toDate ?? fromDate ?? new Date()}
            captionLayout="dropdown"
            fromYear={CURRENT_YEAR - 5}
            toYear={CURRENT_YEAR + 2}
            disabled={fromDate ? { before: fromDate } : undefined}
            className="p-3"
          />

          <div className="flex gap-2 px-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => { onToChange(""); setToOpen(false); }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs h-8"
              disabled={!to}
              onClick={() => setToOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Clear both ── */}
      {hasValue && (
        <button
          onClick={handleClear}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-input bg-background hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
