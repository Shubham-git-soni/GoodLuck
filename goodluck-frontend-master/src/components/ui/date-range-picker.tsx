"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

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
  const [open, setOpen] = React.useState(false);

  const fromDate = from ? new Date(from) : undefined;
  const toDate = to ? new Date(to) : undefined;
  const hasValue = !!(from || to);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromDate,
    to: toDate,
  });

  // Keep local state synced with props if controlled externally
  React.useEffect(() => {
    const f = from ? new Date(from) : undefined;
    const t = to ? new Date(to) : undefined;
    // Prevent infinite loop by checking if values are actually different
    if (date?.from?.getTime() !== f?.getTime() || date?.to?.getTime() !== t?.getTime()) {
      setDate({ from: f, to: t });
    }
  }, [from, to]);

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDate(undefined);
    onFromChange("");
    onToChange("");
    onClear?.();
    setOpen(false);
  };

  const handleApply = () => {
    if (date?.from) {
      onFromChange(format(date.from, "yyyy-MM-dd"));
    } else {
      onFromChange("");
    }

    if (date?.to) {
      onToChange(format(date.to, "yyyy-MM-dd"));
    } else {
      onToChange("");
    }
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-auto min-w-[200px] h-8 justify-start text-left font-normal text-xs gap-1.5 px-3 bg-background",
              !hasValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate flex-1">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range...</span>
              )}
            </span>
            {hasValue && (
              <div
                role="button"
                className="shrink-0 rounded-sm opacity-50 hover:opacity-100 hover:bg-muted p-0.5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-3 w-3" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border overflow-hidden" align="end" sideOffset={8}>
          <div className="px-4 pt-4 pb-3 border-b bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              {date?.from ? (
                date.to ? (
                  `${format(date.from, "MMM dd, yyyy")} - ${format(date.to, "MMM dd, yyyy")}`
                ) : (
                  `${format(date.from, "MMM dd, yyyy")} - Select end date`
                )
              ) : (
                "Select a date range"
              )}
            </p>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            className="p-3"
          />
          <div className="flex gap-2 px-4 pb-4 border-t border-border/50 pt-3 bg-muted/10">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 rounded-xl"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs h-8 rounded-xl"
              onClick={handleApply}
              disabled={!date?.from}
            >
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
