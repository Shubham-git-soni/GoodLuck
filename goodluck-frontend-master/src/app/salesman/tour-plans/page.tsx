"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, School, Users, CheckCircle2,
  Clock, XCircle, ChevronRight, Plus, Filter, X,
} from "lucide-react";
import { format } from "date-fns";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { type TourPlan, type TourPlanStatus, type TourPlanVisit } from "@/lib/mock-data/tour-plans";
// Dummy API (replace with real API calls when backend is ready)
import { getTourPlans } from "@/lib/dummy-api";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TourPlanStatus, {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  bgClass: string;
  textClass: string;
}> = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return format(new Date(d), "dd MMM yyyy");
}

// ─── Summary stat box ─────────────────────────────────────────────────────────

function StatBox({ label, count, icon: Icon, colorClass }: {
  label: string; count: number; icon: React.ElementType; colorClass: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-4 px-2">
      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-1 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold leading-none">{count}</p>
      <p className="text-xs text-muted-foreground font-medium text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Tour Plan Card ───────────────────────────────────────────────────────────

function TourPlanCard({ plan, onClick }: { plan: TourPlan; onClick: () => void }) {
  const cfg = STATUS_CONFIG[plan.status];
  const StatusIcon = cfg.icon;
  const schoolCount = plan.visits.filter(v => v.type === "school").length;
  const bsCount = plan.visits.filter(v => v.type === "bookseller").length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-150 active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Top row: ID + status badge */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{plan.id}</p>
            <p className="font-bold text-base leading-tight mt-0.5">
              {fmtDate(plan.startDate)} → {fmtDate(plan.endDate)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shrink-0 ${cfg.badgeClass}`}>
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {plan.totalDays} days
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {plan.totalVisits} visits
          </span>
          {schoolCount > 0 && (
            <span className="flex items-center gap-1">
              <School className="h-3.5 w-3.5 shrink-0" />
              {schoolCount} school{schoolCount !== 1 ? "s" : ""}
            </span>
          )}
          {bsCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {bsCount} seller{bsCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Reviewer note if any */}
        {plan.reviewerNote && (
          <div className={`rounded-xl px-3 py-2 text-xs mb-3 ${cfg.bgClass} ${cfg.textClass}`}>
            <span className="font-semibold">Note: </span>{plan.reviewerNote}
          </div>
        )}

        {/* Footer: submitted on + arrow */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Submitted {fmtDate(plan.submittedOn)}
            {plan.reviewedOn && ` · Reviewed ${fmtDate(plan.reviewedOn)}`}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Detail Side Panel (same style as admin approvals) ────────────────────────

function TourPlanDetail({ plan, onClose }: { plan: TourPlan; onClose: () => void }) {
  const cfg = STATUS_CONFIG[plan.status];
  const StatusIcon = cfg.icon;

  // Group visits by date
  const byDate: Record<string, TourPlanVisit[]> = {};
  plan.visits.forEach(v => {
    if (!byDate[v.date]) byDate[v.date] = [];
    byDate[v.date].push(v);
  });
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div className="fixed inset-0 z-[150]" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Side Panel — slides in from right on all screen sizes */}
      <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b bg-muted/30 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{plan.id}</p>
            <h3 className="text-base font-bold leading-snug">
              {fmtDate(plan.startDate)} → {fmtDate(plan.endDate)}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-2 ${cfg.badgeClass}`}>
              <StatusIcon className="h-3 w-3" />{cfg.label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-muted hover:bg-border flex items-center justify-center shrink-0 transition-colors mt-0.5"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Reviewer note */}
          {plan.reviewerNote && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${cfg.bgClass} ${cfg.textClass}`}>
              <p className="font-semibold text-xs uppercase tracking-wider mb-1 opacity-70">Reviewer Note</p>
              <p>{plan.reviewerNote}</p>
            </div>
          )}

          {/* Visits grouped by date */}
          {sortedDates.map(date => (
            <div key={date}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(date), "EEEE, dd MMM yyyy")}
              </p>
              <div className="space-y-2">
                {byDate[date].map((v, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {v.type === "school"
                        ? <School className="h-4 w-4 text-primary" />
                        : <Users className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{v.entityName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />{v.city}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {v.objectives.map(o => (
                          <span key={o} className="inline-flex rounded-md bg-primary/8 text-primary px-2 py-0.5 text-[10px] font-medium">{o}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Meta footer info */}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
            Submitted {fmtDate(plan.submittedOn)}
            {plan.reviewedOn && ` · Reviewed ${fmtDate(plan.reviewedOn)}`}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t bg-background shrink-0">
          <Button variant="outline" className="w-full h-11 rounded-2xl" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | TourPlanStatus;

export default function TourPlansPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [selectedPlan, setSelectedPlan] = useState<TourPlan | null>(null);
  const [allPlans, setAllPlans] = useState<TourPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function loadPlans() {
    getTourPlans().then((data) => {
      setAllPlans(data);
      setIsLoading(false);
    });
  }

  useEffect(() => {
    loadPlans();
    // Re-fetch whenever the tab regains focus so admin approval changes reflect immediately
    const onFocus = () => getTourPlans().then(setAllPlans);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") getTourPlans().then(setAllPlans);
    });
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const pending  = allPlans.filter(p => p.status === "pending").length;
  const approved = allPlans.filter(p => p.status === "approved").length;
  const rejected = allPlans.filter(p => p.status === "rejected").length;

  const filtered = activeFilter === "all"
    ? allPlans
    : allPlans.filter(p => p.status === activeFilter);

  const FILTERS: { id: FilterStatus; label: string }[] = [
    { id: "all",      label: `All (${allPlans.length})` },
    { id: "pending",  label: `Pending (${pending})` },
    { id: "approved", label: `Approved (${approved})` },
    { id: "rejected", label: `Rejected (${rejected})` },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <PageHeader
          title="Tour Plans"
          description="All your submitted tour plans"
        />
        <Button
          onClick={() => router.push("/salesman/tour-plan")}
          className="shrink-0 mt-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Summary stat cards */}
      <Card className="mb-5">
        <CardContent className="p-0">
          <div className="flex divide-x divide-border/60">
            <StatBox
              label="Pending"
              count={pending}
              icon={Clock}
              colorClass="bg-amber-100 text-amber-600"
            />
            <StatBox
              label="Approved"
              count={approved}
              icon={CheckCircle2}
              colorClass="bg-emerald-100 text-emerald-600"
            />
            <StatBox
              label="Rejected"
              count={rejected}
              icon={XCircle}
              colorClass="bg-red-100 text-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex-1 shrink-0 rounded-xl py-2 px-3 text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Plan list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-20 bg-muted rounded-xl" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Filter className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-semibold text-base mb-1">No plans found</p>
            <p className="text-sm text-muted-foreground text-center">No tour plans match the selected filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(plan => (
            <TourPlanCard
              key={plan.id}
              plan={plan}
              onClick={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Detail sheet/dialog */}
      {selectedPlan && (
        <TourPlanDetail plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </PageContainer>
  );
}
