"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Clock, CheckCircle, AlertCircle, Navigation,
  School, Users, CalendarX, CheckCircle2,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getTodaysVisits } from "@/lib/mock-data/tour-plans";

// ─── Types ────────────────────────────────────────────────────────────────────

type VisitStatus = "pending" | "checked-in" | "completed";

interface TodayVisit {
  id: string;
  type: "school" | "bookseller";
  entityName: string;
  city: string;
  objectives: string[];
  planId: string;
  status: VisitStatus;
  checkInTime?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodayVisitsPage() {
  const router = useRouter();

  const [visits, setVisits] = useState<TodayVisit[]>([]);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "pending">("pending");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Load today's visits from approved tour plans
  useEffect(() => {
    const todayVisits = getTodaysVisits().map((v, i) => ({
      id: `TV-${i}`,
      type: v.type,
      entityName: v.entityName,
      city: v.city,
      objectives: v.objectives,
      planId: v.planId,
      status: "pending" as VisitStatus,
    }));
    setVisits(todayVisits);
  }, []);

  // Request location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationPermission("granted");
      },
      () => {
        setLocationPermission("denied");
        toast.error("Location access denied. Please enable location services.");
      }
    );
  }, []);

  const handleCheckIn = (visitId: string) => {
    if (!currentLocation) {
      toast.error("Unable to get your location. Please enable location services.");
      return;
    }
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    setVisits(prev =>
      prev.map(v =>
        v.id === visitId
          ? { ...v, status: "checked-in", checkInTime: new Date().toISOString() }
          : v
      )
    );
    toast.success(`Checked in at ${visit.entityName}`);

    // Navigate to add-visit form pre-filled with tour plan data
    const route = visit.type === "school"
      ? `/salesman/schools/add-visit?fromTourPlan=1&name=${encodeURIComponent(visit.entityName)}&city=${encodeURIComponent(visit.city)}&objectives=${encodeURIComponent(visit.objectives.join(","))}&planId=${visit.planId}`
      : `/salesman/booksellers/add-visit?fromTourPlan=1&name=${encodeURIComponent(visit.entityName)}&city=${encodeURIComponent(visit.city)}&objectives=${encodeURIComponent(visit.objectives.join(","))}&planId=${visit.planId}`;

    setTimeout(() => router.push(route), 800);
  };

  const handleStartVisit = (visit: TodayVisit) => {
    const route = visit.type === "school"
      ? `/salesman/schools/add-visit?fromTourPlan=1&name=${encodeURIComponent(visit.entityName)}&city=${encodeURIComponent(visit.city)}&objectives=${encodeURIComponent(visit.objectives.join(","))}&planId=${visit.planId}`
      : `/salesman/booksellers/add-visit?fromTourPlan=1&name=${encodeURIComponent(visit.entityName)}&city=${encodeURIComponent(visit.city)}&objectives=${encodeURIComponent(visit.objectives.join(","))}&planId=${visit.planId}`;
    router.push(route);
  };

  const pending   = visits.filter(v => v.status === "pending");
  const checkedIn = visits.filter(v => v.status === "checked-in");
  const completed = visits.filter(v => v.status === "completed");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <PageContainer>
      <PageHeader
        title="Today's Visits"
        description={`${visits.length} visit${visits.length !== 1 ? "s" : ""} scheduled for ${today}`}
      />

      {/* Location denied alert */}
      {locationPermission === "denied" && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is required for check-in. Please enable location services in your browser settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary stats */}
      {visits.length > 0 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <p className="text-xl md:text-2xl font-bold">{pending.length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <p className="text-xl md:text-2xl font-bold text-amber-600">{checkedIn.length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Checked In</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 md:p-5">
              <p className="text-xl md:text-2xl font-bold text-emerald-600">{completed.length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {visits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <CalendarX className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No visits scheduled for today</p>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            Visits from approved tour plans will appear here automatically on their scheduled date.
          </p>
        </div>
      )}

      {/* Visit cards */}
      <div className="space-y-4">
        {visits.map(visit => {
          const TypeIcon = visit.type === "school" ? School : Users;
          return (
            <Card
              key={visit.id}
              className={
                visit.status === "checked-in" ? "border-amber-400" :
                visit.status === "completed"  ? "border-emerald-300 bg-emerald-50/30" : ""
              }
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TypeIcon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{visit.entityName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{visit.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {/* Status badge */}
                    {visit.status === "pending"    && <Badge variant="secondary" className="text-[10px]">Pending</Badge>}
                    {visit.status === "checked-in" && <Badge className="text-[10px] bg-amber-500 hover:bg-amber-500">Checked In</Badge>}
                    {visit.status === "completed"  && <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-600">Completed</Badge>}
                    {/* Tour plan source */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {visit.planId}
                    </span>
                  </div>
                </div>

                {/* Objectives */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {visit.objectives.map((obj, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{obj}</Badge>
                  ))}
                </div>

                {/* Check-in time */}
                {visit.status === "checked-in" && visit.checkInTime && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mb-3">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Checked in at {new Date(visit.checkInTime).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {visit.status === "pending" && (
                    <Button
                      className="flex-1"
                      onClick={() => handleCheckIn(visit.id)}
                      disabled={locationPermission !== "granted"}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {visit.status === "checked-in" && (
                    <Button className="flex-1" onClick={() => handleStartVisit(visit)}>
                      Start Visit
                    </Button>
                  )}
                  {visit.status === "completed" && (
                    <Button className="flex-1" variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
