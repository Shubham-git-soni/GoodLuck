"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MonthPickerProps {
    value: string; // "YYYY-MM"
    onChange: (value: string) => void;
    className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthPicker({ value, onChange, className }: MonthPickerProps) {
    const [open, setOpen] = React.useState(false);
    const parsed = value ? value.split("-") : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString().padStart(2, "0")];
    const [year, setYear] = React.useState(parseInt(parsed[0]));
    const selMonth = value ? parseInt(parsed[1]) - 1 : -1;

    const label = value
        ? `${MONTHS[parseInt(value.split("-")[1]) - 1]} ${value.split("-")[0]}`
        : "Pick month";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "h-9 w-full flex items-center gap-2 rounded-lg border border-input bg-background px-3 text-xs hover:bg-muted transition-colors text-left",
                        className
                    )}
                >
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className={cn("truncate flex-1", value ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3 rounded-2xl shadow-xl border-border bg-background" align="start">
                {/* Year nav */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <button
                        type="button"
                        onClick={() => setYear(y => y - 1)}
                        className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors border border-border/40"
                    >
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <span className="text-sm font-bold tracking-tight">{year}</span>
                    <button
                        type="button"
                        onClick={() => setYear(y => y + 1)}
                        className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors border border-border/40"
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Month grid */}
                <div className="grid grid-cols-3 gap-1.5">
                    {MONTHS.map((m, i) => {
                        const isSel = selMonth === i && parseInt(parsed[0]) === year;
                        const isToday = new Date().getMonth() === i && new Date().getFullYear() === year;

                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => {
                                    onChange(`${year}-${String(i + 1).padStart(2, "0")}`);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "text-[11px] py-2.5 rounded-xl font-bold transition-all relative",
                                    isSel
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : isToday
                                            ? "bg-muted/80 text-primary border border-primary/20"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {m}
                                {isToday && !isSel && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
