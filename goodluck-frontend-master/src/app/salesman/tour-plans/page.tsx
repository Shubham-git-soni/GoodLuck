"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, School, Users, CheckCircle2,
  Clock, XCircle, ChevronRight, Plus, Filter,
} from "lucide-react";
import { format } from "date-fns";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { mockTourPlans, type TourPlan, type TourPlanStatus } from "@/lib/mock-data/tour-plans";

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

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

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
    <>
      <div className="fixed inset-0 z-[100] bg-black/50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-3xl shadow-2xl flex flex-col md:hidden"
        style={{ maxHeight: "92dvh" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b shrink-0">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{plan.id}</p>
            <p className="font-bold text-base">{fmtDate(plan.startDate)} → {fmtDate(plan.endDate)}</p>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-2 ${cfg.badgeClass}`}>
              <StatusIcon className="h-3 w-3" />{cfg.label}
            </span>
          </div>
          <button type="button" onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mt-1 shrink-0">
            <span className="text-base text-muted-foreground font-medium">✕</span>
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {plan.reviewerNote && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${cfg.bgClass} ${cfg.textClass}`}>
              <p className="font-semibold text-xs uppercase tracking-wider mb-1 opacity-70">Reviewer Note</p>
              <p>{plan.reviewerNote}</p>
            </div>
          )}
          {sortedDates.map(date => (
            <div key={date}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(date), "EEE, dd MMM yyyy")}
              </p>
              <div className="space-y-2 pl-1">
                {byDate[date].map((v, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
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
        </div>
        <div className="px-5 py-4 border-t shrink-0">
          <Button variant="outline" className="w-full h-11 rounded-2xl" onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Desktop: centered dialog */}
      <div className="fixed inset-0 z-[100] hidden md:flex items-center justify-center p-6">
        <div className="bg-background rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[88dvh]">
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b shrink-0">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{plan.id}</p>
              <p className="font-bold text-lg">{fmtDate(plan.startDate)} → {fmtDate(plan.endDate)}</p>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-2 ${cfg.badgeClass}`}>
                <StatusIcon className="h-3 w-3" />{cfg.label}
              </span>
            </div>
            <button type="button" onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-base text-muted-foreground font-medium">✕</span>
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {plan.reviewerNote && (
              <div className={`rounded-2xl px-4 py-3 text-sm ${cfg.bgClass} ${cfg.textClass}`}>
                <p className="font-semibold text-xs uppercase tracking-wider mb-1 opacity-70">Reviewer Note</p>
                <p>{plan.reviewerNote}</p>
              </div>
            )}
            {sortedDates.map(date => (
              <div key={date}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(date), "EEEE, dd MMM yyyy")}
                </p>
                <div className="grid grid-cols-2 gap-2 pl-1">
                  {byDate[date].map((v, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
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
          </div>
          <div className="px-6 py-4 border-t shrink-0 flex justify-end">
            <Button variant="outline" className="rounded-xl" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | TourPlanStatus;

export default function TourPlansPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const [selectedPlan, setSelectedPlan] = useState<TourPlan | null>(null);

  const pending  = mockTourPlans.filter(p => p.status === "pending").length;
  const approved = mockTourPlans.filter(p => p.status === "approved").length;
  const rejected = mockTourPlans.filter(p => p.status === "rejected").length;

  const filtered = activeFilter === "all"
    ? mockTourPlans
    : mockTourPlans.filter(p => p.status === activeFilter);

  const FILTERS: { id: FilterStatus; label: string }[] = [
    { id: "all",      label: `All (${mockTourPlans.length})` },
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
      {filtered.length === 0 ? (
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
