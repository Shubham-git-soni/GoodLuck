"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, Clock, School, Users, MapPin,
  Calendar, ChevronRight, AlertTriangle, DollarSign,
  ClipboardList, Search, X, MessageSquare, BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  getMasterApprovals, updateMasterApproval,
  getTourPlanApprovals, updateTourPlanApproval,
  getTadaApprovals, updateTadaApproval,
  pushSalesmanNotification,
} from "@/lib/dummy-api";
import type { MasterApproval, TadaApproval } from "@/lib/dummy-api";
import type { TourPlan } from "@/lib/mock-data/tour-plans";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = "masters" | "tourplans" | "tada";

const STATUS_COLORS = {
  pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
  Pending:  "bg-amber-50 text-amber-700 border border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
  Flagged:  "bg-orange-50 text-orange-700 border border-orange-200",
};

// ─── Shared ReviewPanel content (used in both sheet + dialog) ─────────────────

function ReviewActions({
  note,
  setNote,
  onApprove,
  onReject,
  onClose,
  isLoading,
  reviewerNote,
  status,
  isPending,
}: {
  note: string;
  setNote: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  isLoading: boolean;
  reviewerNote?: string;
  status?: string;
  isPending: boolean;
}) {
  const [confirmApprove, setConfirmApprove] = useState(false);

  function handleApproveClick() {
    if (!confirmApprove) { setConfirmApprove(true); return; }
    setConfirmApprove(false);
    onApprove();
  }

  return (
    <div className="space-y-3">
      {reviewerNote && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${status === "approved" || status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          <p className="font-semibold text-xs mb-0.5">Reviewer Note</p>
          <p>{reviewerNote}</p>
        </div>
      )}
      {isPending ? (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">
              Note&nbsp;<span className="text-destructive font-normal">*required for rejection</span>
            </p>
            <Textarea
              placeholder="Add a note (required for rejection, optional for approval)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none text-sm rounded-2xl"
            />
          </div>

          {/* Approve confirm banner */}
          {confirmApprove && (
            <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />
              <p className="text-sm font-semibold text-[#15803D] flex-1">Confirm approval?</p>
              <button
                onClick={() => setConfirmApprove(false)}
                className="text-xs text-[#16A34A] underline font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setConfirmApprove(false); onClose(); }}
              disabled={isLoading}
              className="h-11 rounded-2xl text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { setConfirmApprove(false); onReject(); }}
              disabled={isLoading}
              className="h-11 rounded-2xl text-sm font-semibold"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={handleApproveClick}
              disabled={isLoading}
              className={`h-11 rounded-2xl text-sm font-semibold transition-all ${
                confirmApprove
                  ? "bg-[#15803D] hover:bg-[#166534] text-white ring-2 ring-[#86EFAC] ring-offset-1 scale-105"
                  : "bg-[#16A34A] hover:bg-[#15803D] text-white"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              {confirmApprove ? "Confirm" : "Approve"}
            </Button>
          </div>
        </>
      ) : (
        <Button variant="outline" className="w-full h-11 rounded-2xl text-sm font-semibold" onClick={onClose}>
          Close
        </Button>
      )}
    </div>
  );
}

// ─── Mobile Bottom Sheet ──────────────────────────────────────────────────────

function MobileReviewSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
      <div
        className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col"
        style={{ maxHeight: "92dvh" }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-[17px] font-bold tracking-tight leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {children}
        </div>
        {/* Footer */}
        <div className="px-5 pt-3 pb-7 border-t bg-background shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Side Panel (fixed right drawer, does not compress table) ─────────

function DesktopReviewPanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="hidden md:block fixed inset-0 z-[150]" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="absolute top-0 right-0 h-full w-[420px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b bg-muted/30 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Review Details</p>
            <h3 className="text-[16px] font-bold leading-snug text-foreground">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-muted hover:bg-border flex items-center justify-center shrink-0 transition-colors mt-0.5"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {children}
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t bg-background shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}


// ─── Tour Plan Visit Detail Body ──────────────────────────────────────────────

function TourPlanVisitBody({ plan }: { plan: TourPlan }) {
  const visitsByDate = plan.visits.reduce<Record<string, typeof plan.visits>>((acc, v) => {
    (acc[v.date] ??= []).push(v);
    return acc;
  }, {});
  const sortedDates = Object.keys(visitsByDate).sort();

  return (
    <div className="space-y-5">
      {sortedDates.map(date => (
        <div key={date}>
          {/* Day header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary leading-tight">
                {format(new Date(date), "EEEE")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {format(new Date(date), "dd MMM yyyy")}
              </p>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {visitsByDate[date].length} visit{visitsByDate[date].length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Visits */}
          <div className="space-y-2 pl-2.5 ml-3.5 border-l-2 border-primary/10">
            {visitsByDate[date].map((visit, idx) => {
              const VisitIcon = visit.type === "school" ? School : BookOpen;
              const isSchool = visit.type === "school";
              return (
                <div key={idx} className="bg-muted/40 rounded-2xl p-3.5">
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${isSchool ? "bg-blue-100" : "bg-emerald-100"}`}>
                      <VisitIcon className={`h-4 w-4 ${isSchool ? "text-blue-600" : "text-emerald-600"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{visit.entityName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">{visit.city}</span>
                        <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isSchool ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {visit.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {visit.objectives.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {visit.objectives.map((obj, oi) => (
                        <span key={oi} className="inline-flex items-center rounded-full bg-background border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {obj}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Masters Tab ──────────────────────────────────────────────────────────────

function MastersTab({ search }: { search: string }) {
  const [masters, setMasters] = useState<MasterApproval[]>([]);
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<MasterApproval | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    getMasterApprovals().then((data) => { setMasters(data); setIsLoading(false); });
  }, []);

  const counts = {
    all: masters.length,
    pending: masters.filter(m => m.status === "pending").length,
    approved: masters.filter(m => m.status === "approved").length,
    rejected: masters.filter(m => m.status === "rejected").length,
  };

  const filtered = masters.filter(m => {
    if (activeStatus !== "all" && m.status !== activeStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.entityName.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) || m.submittedBy.toLowerCase().includes(q);
    }
    return true;
  });

  function closePanel() { setSelected(null); setNote(""); }

  async function handleApprove() {
    if (!selected) return;
    setIsReviewing(true);
    await updateMasterApproval(selected.id, "approved", note || undefined);
    setMasters(prev => prev.map(m => m.id === selected.id
      ? { ...m, status: "approved", reviewedOn: new Date().toISOString().split("T")[0], reviewerNote: note || undefined }
      : m));
    toast.success(`${selected.entityName} approved!`);
    closePanel();
    setIsReviewing(false);
  }

  async function handleReject() {
    if (!selected) return;
    if (!note.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setIsReviewing(true);
    await updateMasterApproval(selected.id, "rejected", note);
    setMasters(prev => prev.map(m => m.id === selected.id
      ? { ...m, status: "rejected", reviewedOn: new Date().toISOString().split("T")[0], reviewerNote: note }
      : m));
    toast.error(`${selected.entityName} rejected`);
    closePanel();
    setIsReviewing(false);
  }

  const STATUS_TABS = [
    { id: "pending" as const,  label: "Pending",  count: counts.pending },
    { id: "approved" as const, label: "Approved", count: counts.approved },
    { id: "rejected" as const, label: "Rejected", count: counts.rejected },
    { id: "all" as const,      label: "All",      count: counts.all },
  ];

  if (isLoading) return (
    <div className="space-y-3 mt-4">
      {[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-20 bg-muted rounded-2xl" /></CardContent></Card>)}
    </div>
  );

  const masterBody = selected ? (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Type</p>
          <p className="font-semibold capitalize">{selected.type}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Submitted By</p>
          <p className="font-semibold">{selected.submittedBy}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Location</p>
          <p className="font-semibold">{selected.city}, {selected.state}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Date</p>
          <p className="font-semibold">{format(new Date(selected.submittedOn), "dd MMM yyyy")}</p>
        </div>
        {selected.board && (
          <div className="bg-muted/40 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Board</p>
            <p className="font-semibold">{selected.board}</p>
          </div>
        )}
        {selected.strength && (
          <div className="bg-muted/40 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Strength</p>
            <p className="font-semibold">{selected.strength}</p>
          </div>
        )}
        {selected.ownerName && (
          <div className="bg-muted/40 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Owner</p>
            <p className="font-semibold">{selected.ownerName}</p>
          </div>
        )}
        {selected.phone && (
          <div className="bg-muted/40 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
            <p className="font-semibold">{selected.phone}</p>
          </div>
        )}
      </div>
      {selected.address && (
        <div className="bg-muted/40 rounded-2xl p-3 text-sm">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Address</p>
          <p className="font-semibold">{selected.address}</p>
        </div>
      )}
    </div>
  ) : null;

  const masterFooter = selected ? (
    <ReviewActions
      note={note} setNote={setNote}
      onApprove={handleApprove} onReject={handleReject}
      onClose={closePanel} isLoading={isReviewing}
      reviewerNote={selected.reviewerNote} status={selected.status}
      isPending={selected.status === "pending"}
    />
  ) : null;

  const masterCards = (
    <>
      {/* Mobile status filter */}
      <div className="flex md:hidden rounded-2xl bg-muted p-1 mb-4 gap-1 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`flex-1 shrink-0 rounded-xl py-2 px-3 text-xs font-semibold transition-all whitespace-nowrap ${
              activeStatus === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      {/* Desktop status filter */}
      <div className="hidden md:flex items-center gap-1 mb-3">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeStatus === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No requests found</p>
          <p className="text-xs text-muted-foreground mt-1">No master approvals match the current filter</p>
        </div>
      ) : (
        <>
          {/* ── Mobile cards (unchanged) ── */}
          <div className="space-y-3 md:hidden">
            {filtered.map(m => {
              const TypeIcon = m.type === "school" ? School : Users;
              const statusColor = STATUS_COLORS[m.status] ?? "";
              const isSelected = selected?.id === m.id;
              return (
                <Card key={m.id} className={`rounded-2xl cursor-pointer transition-all ${m.status === "pending" ? "border-amber-200" : ""} ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{m.entityName}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">{m.type} · {m.submittedBy}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${statusColor}`}>
                        {m.status === "pending" && <Clock className="h-2.5 w-2.5" />}
                        {m.status === "approved" && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {m.status === "rejected" && <XCircle className="h-2.5 w-2.5" />}
                        <span className="capitalize">{m.status}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                        <MapPin className="h-3 w-3" />{m.city}, {m.state}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                        <Calendar className="h-3 w-3" />{format(new Date(m.submittedOn), "dd MMM yyyy")}
                      </span>
                    </div>
                    {m.reviewerNote && (
                      <div className={`rounded-2xl px-3 py-2 text-xs mb-3 ${m.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        <span className="font-bold">Note: </span>{m.reviewerNote}
                      </div>
                    )}
                    <Button size="sm" variant="outline"
                      className={`w-full h-10 rounded-xl text-sm font-semibold ${m.status === "pending" ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : m.status === "approved" ? "border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10" : "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"}`}
                      onClick={() => { setSelected(m); setNote(""); }}>
                      {m.status === "pending" ? "Review Request" : "View Details"}
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Desktop compact rows ── */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            {/* Table header */}
            <div className="grid bg-muted/50 border-b px-4 py-2.5" style={{gridTemplateColumns:"minmax(0,1fr) 120px 100px 96px"}}>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Entity</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Location</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Date</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</span>
            </div>
            {filtered.map((m) => {
              const TypeIcon = m.type === "school" ? School : Users;
              const statusColor = STATUS_COLORS[m.status] ?? "";
              const isSelected = selected?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => { setSelected(m); setNote(""); }}
                  className={`grid items-center px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                  style={{gridTemplateColumns:"minmax(0,1fr) 120px 100px 96px"}}
                >
                  {/* Entity info */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{m.entityName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusColor}`}>
                          <span className="capitalize">{m.status}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">· {m.type} · {m.submittedBy}</span>
                      </div>
                    </div>
                  </div>
                  {/* Location */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{m.city}</p>
                    <p className="text-[10px] text-muted-foreground/60">{m.state}</p>
                  </div>
                  {/* Date */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(m.submittedOn), "dd MMM yyyy")}</p>
                  </div>
                  {/* Action */}
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg ${
                      m.status === "pending" ? "bg-primary text-primary-foreground" :
                      m.status === "approved" ? "bg-primary/10 text-primary" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {m.status === "pending" ? "Review" : "View"}
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {masterCards}
      <DesktopReviewPanel
        open={!!selected}
        onClose={closePanel}
        title={selected?.entityName ?? ""}
        subtitle={selected ? `${selected.type} · Submitted ${format(new Date(selected.submittedOn), "dd MMM yyyy")}` : undefined}
        footer={masterFooter ?? <></>}
      >
        {masterBody}
      </DesktopReviewPanel>
      <MobileReviewSheet
        open={!!selected}
        onClose={closePanel}
        title={selected?.entityName ?? ""}
        subtitle={selected ? `${selected.type} · Submitted ${format(new Date(selected.submittedOn), "dd MMM yyyy")}` : undefined}
        footer={masterFooter ?? <></>}
      >
        {masterBody}
      </MobileReviewSheet>
    </>
  );
}

// ─── Tour Plans Tab ───────────────────────────────────────────────────────────

function TourPlansTab({ search }: { search: string }) {
  const [plans, setPlans] = useState<TourPlan[]>([]);
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<TourPlan | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    getTourPlanApprovals().then((data) => { setPlans(data); setIsLoading(false); });
  }, []);

  const counts = {
    all: plans.length,
    pending: plans.filter(p => p.status === "pending").length,
    approved: plans.filter(p => p.status === "approved").length,
    rejected: plans.filter(p => p.status === "rejected").length,
  };

  const filtered = plans.filter(p => {
    if (activeStatus !== "all" && p.status !== activeStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.id.toLowerCase().includes(q) || p.visits.some(v => v.entityName.toLowerCase().includes(q) || v.city.toLowerCase().includes(q));
    }
    return true;
  });

  function closePanel() { setSelected(null); setNote(""); }

  async function handleApprove() {
    if (!selected) return;
    setIsReviewing(true);
    await updateTourPlanApproval(selected.id, "approved", note || undefined);
    setPlans(prev => prev.map(p => p.id === selected.id
      ? { ...p, status: "approved", reviewedOn: new Date().toISOString().split("T")[0], reviewerNote: note || undefined }
      : p));
    pushSalesmanNotification({
      userId: "SM001", type: "tour_plan", title: "Tour Plan Approved ✓",
      message: `Your tour plan ${selected.id} (${format(new Date(selected.startDate), "dd MMM")} – ${format(new Date(selected.endDate), "dd MMM yyyy")}) has been approved.${note ? ` Note: ${note}` : ""}`,
      priority: "high", actionUrl: "/salesman/tour-plans",
    });
    toast.success(`Tour plan ${selected.id} approved!`);
    closePanel();
    setIsReviewing(false);
  }

  async function handleReject() {
    if (!selected) return;
    if (!note.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setIsReviewing(true);
    await updateTourPlanApproval(selected.id, "rejected", note);
    setPlans(prev => prev.map(p => p.id === selected.id
      ? { ...p, status: "rejected", reviewedOn: new Date().toISOString().split("T")[0], reviewerNote: note }
      : p));
    pushSalesmanNotification({
      userId: "SM001", type: "tour_plan", title: "Tour Plan Rejected",
      message: `Your tour plan ${selected.id} (${format(new Date(selected.startDate), "dd MMM")} – ${format(new Date(selected.endDate), "dd MMM yyyy")}) has been rejected. Reason: ${note}`,
      priority: "high", actionUrl: "/salesman/tour-plans",
    });
    toast.error(`Tour plan ${selected.id} rejected`);
    closePanel();
    setIsReviewing(false);
  }

  const STATUS_TABS = [
    { id: "pending" as const,  label: "Pending",  count: counts.pending },
    { id: "approved" as const, label: "Approved", count: counts.approved },
    { id: "rejected" as const, label: "Rejected", count: counts.rejected },
    { id: "all" as const,      label: "All",      count: counts.all },
  ];

  if (isLoading) return (
    <div className="space-y-3 mt-4">
      {[1,2,3].map(i => <Card key={i} className="animate-pulse rounded-2xl"><CardContent className="p-4"><div className="h-20 bg-muted rounded-2xl" /></CardContent></Card>)}
    </div>
  );

  const tourPlanBody = selected ? <TourPlanVisitBody plan={selected} /> : null;

  const tourPlanFooter = selected ? (
    <ReviewActions
      note={note} setNote={setNote}
      onApprove={handleApprove} onReject={handleReject}
      onClose={closePanel} isLoading={isReviewing}
      reviewerNote={selected.reviewerNote} status={selected.status}
      isPending={selected.status === "pending"}
    />
  ) : null;

  const tourPlanCards = (
    <>
      {/* Mobile status filter */}
      <div className="flex md:hidden rounded-2xl bg-muted p-1 mb-4 gap-1 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`flex-1 shrink-0 rounded-xl py-2 px-3 text-xs font-semibold transition-all whitespace-nowrap ${
              activeStatus === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      {/* Desktop status filter */}
      <div className="hidden md:flex items-center gap-1 mb-3">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeStatus === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No tour plans found</p>
          <p className="text-xs text-muted-foreground mt-1">No tour plans match the current filter</p>
        </div>
      ) : (
        <>
          {/* ── Mobile cards (unchanged) ── */}
          <div className="space-y-3 md:hidden">
            {filtered.map(plan => {
              const statusColor = STATUS_COLORS[plan.status] ?? "";
              const schoolCount = plan.visits.filter(v => v.type === "school").length;
              const bsCount = plan.visits.filter(v => v.type === "bookseller").length;
              const cities = [...new Set(plan.visits.map(v => v.city))];
              const isSelected = selected?.id === plan.id;
              return (
                <Card key={plan.id} className={`rounded-2xl cursor-pointer transition-all ${plan.status === "pending" ? "border-amber-200" : ""} ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{plan.id}</p>
                        <p className="font-bold text-sm">{format(new Date(plan.startDate), "dd MMM")} → {format(new Date(plan.endDate), "dd MMM yyyy")}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${statusColor}`}>
                        {plan.status === "pending" && <Clock className="h-2.5 w-2.5" />}
                        {plan.status === "approved" && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {plan.status === "rejected" && <XCircle className="h-2.5 w-2.5" />}
                        <span className="capitalize">{plan.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { icon: Calendar, label: `${plan.totalDays}d` },
                        { icon: School, label: `${schoolCount} school${schoolCount !== 1 ? "s" : ""}` },
                        { icon: Users, label: `${bsCount} seller${bsCount !== 1 ? "s" : ""}` },
                        { icon: MapPin, label: cities.length > 2 ? `${cities.slice(0,2).join(", ")} +${cities.length-2}` : cities.join(", ") },
                      ].map(({ icon: Icon, label }, i) => (
                        <div key={i} className="bg-muted/50 rounded-xl p-2 text-center">
                          <Icon className="h-3 w-3 text-muted-foreground mx-auto mb-1" />
                          <p className="text-[10px] font-semibold text-muted-foreground leading-tight">{label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Submitted {format(new Date(plan.submittedOn), "dd MMM yyyy")}{plan.reviewedOn && ` · Reviewed ${format(new Date(plan.reviewedOn), "dd MMM yyyy")}`}</p>
                    {plan.reviewerNote && (
                      <div className={`rounded-2xl px-3 py-2 text-xs mb-3 ${plan.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        <span className="font-bold">Note: </span>{plan.reviewerNote}
                      </div>
                    )}
                    <Button size="sm" variant="outline"
                      className={`w-full h-10 rounded-xl text-sm font-semibold ${plan.status === "pending" ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : plan.status === "approved" ? "border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10" : "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"}`}
                      onClick={() => { setSelected(plan); setNote(""); }}>
                      {plan.status === "pending" ? "Review Plan" : "View Details"}
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Desktop compact rows ── */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <div className="grid bg-muted/50 border-b px-4 py-2.5" style={{gridTemplateColumns:"minmax(0,1fr) 60px 80px 110px 96px"}}>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Plan</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Days</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Visits</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Submitted</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</span>
            </div>
            {filtered.map(plan => {
              const statusColor = STATUS_COLORS[plan.status] ?? "";
              const schoolCount = plan.visits.filter(v => v.type === "school").length;
              const bsCount = plan.visits.filter(v => v.type === "bookseller").length;
              const cities = [...new Set(plan.visits.map(v => v.city))];
              const isSelected = selected?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => { setSelected(plan); setNote(""); }}
                  className={`grid items-center px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                  style={{gridTemplateColumns:"minmax(0,1fr) 60px 80px 110px 96px"}}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold whitespace-nowrap">{format(new Date(plan.startDate), "dd MMM")} → {format(new Date(plan.endDate), "dd MMM yy")}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold capitalize ${statusColor}`}>{plan.status}</span>
                        <span className="text-[10px] text-muted-foreground truncate">· {cities.length > 2 ? `${cities.slice(0,2).join(", ")} +${cities.length-2}` : cities.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{plan.totalDays}</p>
                    <p className="text-[10px] text-muted-foreground">days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{schoolCount}s · {bsCount}b</p>
                    <p className="text-[10px] text-muted-foreground">{plan.visits.length} tot</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(plan.submittedOn), "dd MMM yyyy")}</p>
                  </div>
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg ${plan.status === "pending" ? "bg-primary text-primary-foreground" : plan.status === "approved" ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600"}`}>
                      {plan.status === "pending" ? "Review" : "View"}
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {tourPlanCards}
      <DesktopReviewPanel
        open={!!selected}
        onClose={closePanel}
        title={selected ? `Tour Plan: ${selected.id}` : ""}
        subtitle={selected ? `${format(new Date(selected.startDate), "dd MMM")} → ${format(new Date(selected.endDate), "dd MMM yyyy")} · ${selected.visits.length} visits` : undefined}
        footer={tourPlanFooter ?? <></>}
      >
        {tourPlanBody}
      </DesktopReviewPanel>
      <MobileReviewSheet
        open={!!selected}
        onClose={closePanel}
        title={selected ? `Tour Plan: ${selected.id}` : ""}
        subtitle={selected ? `${format(new Date(selected.startDate), "dd MMM")} → ${format(new Date(selected.endDate), "dd MMM yyyy")} · ${selected.visits.length} visits` : undefined}
        footer={tourPlanFooter ?? <></>}
      >
        {tourPlanBody}
      </MobileReviewSheet>
    </>
  );
}

// ─── TA/DA Tab ────────────────────────────────────────────────────────────────

function TadaTab({ search }: { search: string }) {
  const [claims, setClaims] = useState<TadaApproval[]>([]);
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "approved" | "rejected" | "flagged">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<TadaApproval | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    getTadaApprovals().then((data) => { setClaims(data); setIsLoading(false); });
  }, []);

  const counts = {
    all: claims.length,
    pending: claims.filter(c => c.status === "Pending").length,
    approved: claims.filter(c => c.status === "Approved").length,
    rejected: claims.filter(c => c.status === "Rejected").length,
    flagged: claims.filter(c => c.status === "Flagged").length,
  };

  const filtered = claims.filter(c => {
    if (activeStatus !== "all" && c.status.toLowerCase() !== activeStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.salesmanName.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    }
    return true;
  });

  const totalApprovedAmount = claims.filter(c => c.status === "Approved").reduce((s, c) => s + c.amount, 0);
  const totalPendingAmount = claims.filter(c => c.status === "Pending" || c.status === "Flagged").reduce((s, c) => s + c.amount, 0);

  function closePanel() { setSelected(null); setNote(""); }

  async function handleApprove() {
    if (!selected) return;
    setIsReviewing(true);
    await updateTadaApproval(selected.id, "Approved", note || undefined);
    setClaims(prev => prev.map(c => c.id === selected.id
      ? { ...c, status: "Approved" as const, approvedBy: "Admin", approvedDate: new Date().toISOString() }
      : c));
    pushSalesmanNotification({
      userId: selected.salesmanId || "SM001", type: "tada", title: "TA/DA Claim Approved ✓",
      message: `Your TA/DA claim of ₹${selected.amount.toLocaleString()} for ${format(new Date(selected.date), "dd MMM yyyy")} (${selected.city}) has been approved.`,
      priority: "normal", actionUrl: "/salesman/tada",
    });
    toast.success(`TA/DA claim approved — ₹${selected.amount.toLocaleString()}`);
    closePanel();
    setIsReviewing(false);
  }

  async function handleReject() {
    if (!selected) return;
    if (!note.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setIsReviewing(true);
    await updateTadaApproval(selected.id, "Rejected", note);
    setClaims(prev => prev.map(c => c.id === selected.id
      ? { ...c, status: "Rejected" as const, comments: note }
      : c));
    pushSalesmanNotification({
      userId: selected.salesmanId || "SM001", type: "tada", title: "TA/DA Claim Rejected",
      message: `Your TA/DA claim of ₹${selected.amount.toLocaleString()} for ${format(new Date(selected.date), "dd MMM yyyy")} has been rejected. Reason: ${note}`,
      priority: "high", actionUrl: "/salesman/tada",
    });
    toast.error(`TA/DA claim rejected`);
    closePanel();
    setIsReviewing(false);
  }

  const STATUS_TABS = [
    { id: "pending" as const,  label: "Pending",  count: counts.pending },
    { id: "flagged" as const,  label: "Flagged",  count: counts.flagged },
    { id: "approved" as const, label: "Approved", count: counts.approved },
    { id: "rejected" as const, label: "Rejected", count: counts.rejected },
    { id: "all" as const,      label: "All",      count: counts.all },
  ];

  if (isLoading) return (
    <div className="space-y-3 mt-4">
      {[1,2,3].map(i => <Card key={i} className="animate-pulse rounded-2xl"><CardContent className="p-4"><div className="h-20 bg-muted rounded-2xl" /></CardContent></Card>)}
    </div>
  );

  const tadaBody = selected ? (
    <div className="space-y-3">
      <div className="bg-muted/40 rounded-2xl p-4 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Claim Amount</p>
        <p className="text-3xl font-bold">₹{selected.amount.toLocaleString()}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Salesman</p>
          <p className="font-semibold">{selected.salesmanName}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Date</p>
          <p className="font-semibold">{format(new Date(selected.date), "dd MMM yyyy")}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">City</p>
          <p className="font-semibold">{selected.city}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Travel Mode</p>
          <p className="font-semibold">{selected.travelMode}</p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Has Visit</p>
          <p className={`font-bold ${selected.hasVisit ? "text-emerald-600" : "text-red-500"}`}>
            {selected.hasVisit ? "Yes" : "No"}
          </p>
        </div>
        <div className="bg-muted/40 rounded-2xl p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Within Limit</p>
          <p className={`font-bold ${selected.withinLimit ? "text-emerald-600" : "text-orange-600"}`}>
            {selected.withinLimit ? "Yes ✓" : "Exceeds ⚠"}
          </p>
        </div>
      </div>
      {selected.comments && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${selected.status === "Flagged" ? "bg-orange-50 text-orange-700" : selected.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-muted"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1">Comments</p>
          <p>{selected.comments}</p>
        </div>
      )}
    </div>
  ) : null;

  const tadaFooter = selected ? (
    <ReviewActions
      note={note} setNote={setNote}
      onApprove={handleApprove} onReject={handleReject}
      onClose={closePanel} isLoading={isReviewing}
      reviewerNote={selected.comments ?? undefined} status={selected.status}
      isPending={selected.status === "Pending" || selected.status === "Flagged"}
    />
  ) : null;

  const tadaSummary = (
    <div className="grid grid-cols-2 gap-3 mb-4 md:hidden">
      <div className="bg-amber-50 rounded-2xl p-4">
        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Pending</p>
        <p className="text-xl font-bold text-amber-700">₹{(totalPendingAmount / 1000).toFixed(1)}K</p>
        <p className="text-[10px] text-amber-600 mt-0.5">{counts.pending + counts.flagged} claims</p>
      </div>
      <div className="bg-emerald-50 rounded-2xl p-4">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1">Approved</p>
        <p className="text-xl font-bold text-emerald-700">₹{(totalApprovedAmount / 1000).toFixed(1)}K</p>
        <p className="text-[10px] text-emerald-600 mt-0.5">{counts.approved} claims</p>
      </div>
    </div>
  );

  const tadaCards = (
    <>
      {tadaSummary}

      {/* Mobile status filter */}
      <div className="flex md:hidden rounded-2xl bg-muted p-1 mb-4 gap-1 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`flex-1 shrink-0 rounded-xl py-2 px-3 text-xs font-semibold transition-all whitespace-nowrap ${
              activeStatus === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      {/* Desktop status filter */}
      <div className="hidden md:flex items-center gap-1 mb-3">
        {STATUS_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveStatus(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeStatus === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No claims found</p>
          <p className="text-xs text-muted-foreground mt-1">No TA/DA claims match the current filter</p>
        </div>
      ) : (
        <>
          {/* ── Mobile cards (unchanged) ── */}
          <div className="space-y-3 md:hidden">
            {filtered.map(claim => {
              const statusColor = STATUS_COLORS[claim.status] ?? "";
              const isFlagged = claim.status === "Flagged";
              const isPending = claim.status === "Pending" || isFlagged;
              const isSelected = selected?.id === claim.id;
              return (
                <Card key={claim.id} className={`rounded-2xl cursor-pointer transition-all ${isFlagged ? "border-orange-300" : claim.status === "Pending" ? "border-amber-200" : ""} ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{claim.salesmanName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(claim.date), "dd MMM yyyy")} · {claim.city}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColor}`}>
                          {isFlagged && <AlertTriangle className="h-2.5 w-2.5" />}
                          {claim.status === "Approved" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {claim.status === "Rejected" && <XCircle className="h-2.5 w-2.5" />}
                          {claim.status === "Pending" && <Clock className="h-2.5 w-2.5" />}
                          {claim.status}
                        </span>
                        <p className="text-base font-bold">₹{claim.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">{claim.travelMode}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${claim.hasVisit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>Visit: {claim.hasVisit ? "Yes" : "No"}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${claim.withinLimit ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{claim.withinLimit ? "Within Limit" : "Exceeds Limit"}</span>
                    </div>
                    {claim.comments && (
                      <div className={`rounded-2xl px-3 py-2 text-xs mb-3 ${isFlagged ? "bg-orange-50 text-orange-700" : claim.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-muted"}`}>
                        <MessageSquare className="h-3 w-3 inline mr-1" />{claim.comments}
                      </div>
                    )}
                    <Button size="sm" variant="outline"
                      className={`w-full h-10 rounded-2xl text-sm font-semibold ${isPending ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : claim.status === "Approved" ? "border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10" : "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"}`}
                      onClick={() => { setSelected(claim); setNote(""); }}>
                      {isPending ? "Review Claim" : "View Details"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    {claim.status === "Approved" && claim.approvedBy && (
                      <p className="text-[11px] text-muted-foreground mt-2 text-center">Approved by {claim.approvedBy}{claim.approvedDate && ` · ${format(new Date(claim.approvedDate), "dd MMM yyyy")}`}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Desktop compact rows ── */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <div className="grid bg-muted/50 border-b px-4 py-2.5" style={{gridTemplateColumns:"minmax(0,1fr) 100px 80px 110px 80px 96px"}}>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Salesman</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Date</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Amount</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Travel</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Flags</span>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</span>
            </div>
            {filtered.map(claim => {
              const statusColor = STATUS_COLORS[claim.status] ?? "";
              const isFlagged = claim.status === "Flagged";
              const isPending = claim.status === "Pending" || isFlagged;
              const isSelected = selected?.id === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => { setSelected(claim); setNote(""); }}
                  className={`grid items-center px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0 ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                  style={{gridTemplateColumns:"minmax(0,1fr) 100px 80px 110px 80px 96px"}}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{claim.salesmanName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusColor}`}>{claim.status}</span>
                        <span className="text-[10px] text-muted-foreground truncate">· {claim.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(claim.date), "dd MMM yyyy")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">₹{(claim.amount/1000).toFixed(1)}K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{claim.travelMode}</p>
                  </div>
                  <div className="text-center flex justify-center gap-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${claim.hasVisit ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{claim.hasVisit ? "V✓" : "V✗"}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${claim.withinLimit ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"}`}>{claim.withinLimit ? "L✓" : "L⚠"}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg ${isPending ? "bg-primary text-primary-foreground" : claim.status === "Approved" ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600"}`}>
                      {isPending ? "Review" : "View"}
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {tadaCards}
      <DesktopReviewPanel
        open={!!selected}
        onClose={closePanel}
        title={selected ? `TA/DA: ${selected.salesmanName}` : ""}
        subtitle={selected ? `₹${selected.amount.toLocaleString()} · ${format(new Date(selected.date), "dd MMM yyyy")} · ${selected.city}` : undefined}
        footer={tadaFooter ?? <></>}
      >
        {tadaBody}
      </DesktopReviewPanel>
      <MobileReviewSheet
        open={!!selected}
        onClose={closePanel}
        title={selected ? `₹${selected.amount.toLocaleString()} — ${selected.salesmanName}` : ""}
        subtitle={selected ? `${format(new Date(selected.date), "dd MMM yyyy")} · ${selected.city}` : undefined}
        footer={tadaFooter ?? <></>}
      >
        {tadaBody}
      </MobileReviewSheet>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("masters");
  const [searchQuery, setSearchQuery] = useState("");

  const TABS: { id: TabType; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "masters",   label: "Masters",    icon: School,      desc: "Schools & booksellers" },
    { id: "tourplans", label: "Tour Plans", icon: Calendar,    desc: "Salesman travel plans" },
    { id: "tada",      label: "TA/DA",      icon: DollarSign,  desc: "Travel & daily allowance" },
  ];

  return (
    <PageContainer>
      {/* ── Desktop header ── */}
      <div className="hidden md:flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and action pending requests across all categories</p>
        </div>
      </div>

      {/* ── Mobile header ── */}
      <div className="md:hidden mb-5">
        <PageHeader title="Approvals" description="Review master requests, tour plans & TA/DA claims" />
      </div>

      {/* ── Desktop tab bar + search row ── */}
      <div className="hidden md:flex items-center justify-between gap-4 mb-5">
        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "masters" ? "Search name, city, salesman..." :
              activeTab === "tourplans" ? "Search plan ID, city, school..." :
              "Search salesman or city..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 rounded-xl text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile tab bar ── */}
      <div className="flex gap-0 mb-4 border-b md:hidden">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSearchQuery(""); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px flex-1 justify-center ${
                activeTab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mobile search ── */}
      <div className="relative mb-4 md:hidden">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            activeTab === "masters" ? "Search name, city, or salesman..." :
            activeTab === "tourplans" ? "Search plan ID, city, or school..." :
            "Search salesman or city..."
          }
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 pr-9 h-11 rounded-2xl"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "masters"   && <MastersTab   search={searchQuery} />}
      {activeTab === "tourplans" && <TourPlansTab search={searchQuery} />}
      {activeTab === "tada"      && <TadaTab      search={searchQuery} />}
    </PageContainer>
  );
}
