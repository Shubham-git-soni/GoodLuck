"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
}

export function MobileSheet({ open, onClose, title, description, children, footer }: MobileSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const backdrop = backdropRef.current;
    if (!backdrop) return;

    const handleTouch = (e: TouchEvent) => {
      // Only close if the touch target is the backdrop itself, not the sheet
      if (sheetRef.current && sheetRef.current.contains(e.target as Node)) return;
      e.stopPropagation();
      onClose();
    };

    backdrop.addEventListener("touchend", handleTouch, { passive: true });
    return () => backdrop.removeEventListener("touchend", handleTouch);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-[100]"
      style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "85dvh", display: "flex", flexDirection: "column" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}
          className="px-5 py-4"
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-5 pt-3 pb-6 border-t bg-background shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}
