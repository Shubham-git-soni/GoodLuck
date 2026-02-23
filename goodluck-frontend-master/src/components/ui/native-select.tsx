"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * NativeSelect — A styled wrapper around a native <select> element.
 * Use this inside mobile sheets / dialogs where Radix portals cause issues.
 * API-compatible with the Radix Select pattern: value + onValueChange.
 */

interface NativeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "default";
  className?: string;
}

export function NativeSelect({
  value,
  onValueChange,
  placeholder,
  size = "default",
  className,
  children,
  disabled,
  ...props
}: NativeSelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          // Base
          "w-full appearance-none cursor-pointer",
          // Typography
          "text-sm font-medium",
          // Height
          size === "sm" ? "h-8" : "h-10",
          // Shape & border — matches SelectTrigger
          "rounded-xl border border-input bg-background px-3 pr-9",
          // Placeholder / empty state color
          !value && "text-muted-foreground",
          value && "text-foreground",
          // Hover
          "hover:border-ring/50",
          // Focus
          "outline-none focus:ring-2 focus:ring-ring focus:border-ring",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transition
          "transition-all duration-150",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {/* Chevron icon — mimics SelectTrigger */}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 text-foreground" />
    </div>
  );
}

/**
 * NativeSelectOption — Use inside NativeSelect instead of SelectItem.
 */
export function NativeSelectOption({
  value,
  children,
  disabled,
}: {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
}
