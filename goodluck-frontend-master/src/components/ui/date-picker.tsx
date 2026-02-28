"use client";

import * as React from "react";
import {
  format, parse, isValid, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isSameDay, isToday,
  isBefore, isAfter, setYear, setMonth, getYear, getMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;            // "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string;              // "YYYY-MM-DD"
  max?: string;              // "YYYY-MM-DD"
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Calendar Modal ───────────────────────────────────────────────────────────
function CalendarModal({
  value, onChange, onClose, min, max,
}: { value?: string; onChange: (v: string) => void; onClose: () => void; min?: string; max?: string }) {
  const initial = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isInitialValid = initial && isValid(initial);

  const minDate = min ? parse(min, "yyyy-MM-dd", new Date()) : undefined;
  const maxDate = max ? parse(max, "yyyy-MM-dd", new Date()) : undefined;

  const [viewMonth, setViewMonth] = React.useState<Date>(
    isInitialValid ? initial! : minDate ?? new Date()
  );
  const [pending, setPending] = React.useState<Date | undefined>(
    isInitialValid ? initial : undefined
  );
  const [pickerMode, setPickerMode] = React.useState<"days" | "months" | "years">("days");
  const [yearPageStart, setYearPageStart] = React.useState(() => {
    const yr = getYear(isInitialValid ? initial! : new Date());
    return yr - (yr % 12);
  });

  // Build 6-week grid
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isDisabled = (d: Date) => {
    if (minDate && isBefore(d, minDate)) return true;
    if (maxDate && isAfter(d, maxDate)) return true;
    return false;
  };

  const handleApply = () => {
    if (pending) { onChange(format(pending, "yyyy-MM-dd")); onClose(); }
  };

  const handleClear = () => { onChange(""); onClose(); };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 fade-in duration-200">

        {/* ── Top header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Select Date
            </p>
            <p className={cn(
              "text-2xl font-bold leading-tight tracking-tight",
              !pending && "text-muted-foreground font-normal text-lg"
            )}>
              {pending && isValid(pending)
                ? format(pending, "EEE, dd MMM yyyy")
                : "Choose a date"
              }
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 hover:bg-muted/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-border mx-6" />

        {/* ── Month/Year navigator ── */}
        <div className="flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => {
              if (pickerMode === "years") setYearPageStart(y => y - 12);
              else if (pickerMode === "months") setViewMonth(prev => setYear(prev, getYear(prev) - 1));
              else setViewMonth(subMonths(viewMonth, 1));
            }}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (pickerMode === "days") {
                setPickerMode("months");
              } else if (pickerMode === "months") {
                setYearPageStart(getYear(viewMonth) - (getYear(viewMonth) % 12));
                setPickerMode("years");
              } else {
                setPickerMode("days");
              }
            }}
            className="font-bold text-base hover:text-primary transition-colors"
          >
            {pickerMode === "years"
              ? `${yearPageStart} – ${yearPageStart + 11}`
              : pickerMode === "months"
                ? format(viewMonth, "yyyy")
                : format(viewMonth, "MMMM yyyy")
            }
          </button>
          <button
            type="button"
            onClick={() => {
              if (pickerMode === "years") setYearPageStart(y => y + 12);
              else if (pickerMode === "months") setViewMonth(prev => setYear(prev, getYear(prev) + 1));
              else setViewMonth(addMonths(viewMonth, 1));
            }}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ── Year picker grid ── */}
        {pickerMode === "years" && (
          <div className="grid grid-cols-3 gap-2 px-6 pb-4">
            {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map(yr => {
              const isCurrent = yr === getYear(viewMonth);
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setViewMonth(prev => setYear(prev, yr));
                    setPickerMode("months");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  {yr}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Month picker grid ── */}
        {pickerMode === "months" && (
          <div className="grid grid-cols-3 gap-2 px-6 pb-4">
            {MONTHS_SHORT.map((m, i) => {
              const isCurrent = i === getMonth(viewMonth);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setViewMonth(prev => setMonth(prev, i));
                    setPickerMode("days");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Weekday labels ── */}
        {pickerMode === "days" && (
          <div className="grid grid-cols-7 px-4 pb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>
        )}

        {/* ── Day grid ── */}
        {pickerMode === "days" && (
          <div className="grid grid-cols-7 px-4 pb-4 gap-y-1">
            {days.map((day) => {
              const outside = !isSameMonth(day, viewMonth);
              const disabled = isDisabled(day);
              const selected = pending && isSameDay(day, pending);
              const todayDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setPending(day)}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all mx-auto w-9 h-9",
                    outside && "text-muted-foreground/30",
                    disabled && "opacity-25 cursor-not-allowed",
                    !outside && !disabled && !selected && "hover:bg-muted",
                    todayDay && !selected && "text-primary font-bold ring-1 ring-primary/30",
                    selected && "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/30 hover:bg-primary/90",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 pb-6">
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
            disabled={!pending}
            className={cn(
              "flex-1 h-12 rounded-2xl text-sm font-bold transition-all",
              pending
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Exported DatePicker ──────────────────────────────────────────────────────
export function DatePicker({
  value, onChange, placeholder = "Select date",
  disabled = false, min, max, className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isSelectedValid = selected && isValid(selected);

  return (
    <>
      {/* Trigger — same height/border as shadcn Input */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm",
          "ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isSelectedValid ? "text-foreground" : "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left truncate">
          {isSelectedValid ? format(selected!, "dd MMM yyyy") : placeholder}
        </span>
      </button>

      {open && (
        <CalendarModal
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
          min={min}
          max={max}
        />
      )}
    </>
  );
}
