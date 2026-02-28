"use client";

import { useState, useEffect } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The item name shown in the dialog */
  itemName: string;
  /** Optional context label e.g. "from Boards" */
  contextLabel?: string;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  contextLabel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [typed, setTyped] = useState("");

  // Reset typed value whenever dialog opens
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const canDelete = typed === "DELETE";

  const handleConfirm = () => {
    if (!canDelete) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setTyped(""); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Warning icon row */}
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
              <TriangleAlert className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-base font-bold leading-tight">
              Delete {itemName ? `"${itemName}"` : "Item"}?
            </AlertDialogTitle>
          </div>

          {/* Description + DELETE input — plain divs, no Radix wrapper to avoid controlled input issues */}
          <div className="space-y-3 mt-1">
            <p className="text-sm text-muted-foreground">
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">&ldquo;{itemName}&rdquo;</span>
              {contextLabel ? <> {contextLabel}</> : null}
              . This action <span className="font-semibold text-destructive">cannot be undone</span>.
            </p>

            {/* Type DELETE confirmation */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 space-y-2">
              <p className="text-xs font-medium text-destructive/80">
                Type <span className="font-bold tracking-widest">DELETE</span> to confirm
              </p>
              <Input
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder="Type DELETE here..."
                className="h-9 text-sm rounded-xl border-destructive/30 focus-visible:ring-destructive/30 bg-background"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 mt-1">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            onClick={() => { onOpenChange(false); setTyped(""); }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-11 rounded-xl"
            disabled={!canDelete}
            onClick={handleConfirm}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Yes, Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
