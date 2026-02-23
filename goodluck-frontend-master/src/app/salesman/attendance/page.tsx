"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Play, Square, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Confirmation Sheet (mobile-friendly) ─────────────────────────────────────

function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative bg-background rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-sm"
      >
        {/* Content */}
        <div className="px-6 pt-8 pb-2 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
            <AlertTriangle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pt-3 pb-6 flex flex-col gap-2.5">
          <Button
            size="lg"
            variant={confirmVariant}
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full h-12 text-sm font-semibold rounded-2xl"
          >
            {confirmLabel}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
            className="w-full h-12 text-sm font-semibold rounded-2xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [city, setCity] = useState("Delhi");
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStartDay = () => {
    const now = new Date();
    setStartTime(now);
    setIsActive(true);
    toast.success("Day started successfully!");
    console.log("Day started at:", now.toLocaleTimeString());
  };

  const handleEndDay = () => {
    setIsActive(false);
    const endTime = new Date();
    toast.success("Day ended successfully!");
    console.log("Day ended at:", endTime.toLocaleTimeString());
    console.log("Total duration:", formatTime(elapsedTime));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Mark your daily attendance"
      />

      {/* Start Day Confirmation */}
      <ConfirmSheet
        open={showStartConfirm}
        onClose={() => setShowStartConfirm(false)}
        onConfirm={handleStartDay}
        title="Start Your Day?"
        description="Are you sure you want to start your day? Your attendance and location will be recorded."
        confirmLabel="Yes, Start Day"
      />

      {/* End Day Confirmation */}
      <ConfirmSheet
        open={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleEndDay}
        title="End Your Day?"
        description="Are you sure you want to end your day? This action cannot be undone."
        confirmLabel="Yes, End Day"
        confirmVariant="destructive"
      />

      {/* Current Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {!isActive && !startTime ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-2">Ready to start your day?</p>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to mark your attendance
                  </p>
                </div>
                <Button size="lg" onClick={() => setShowStartConfirm(true)} className="min-w-[200px]">
                  <Play className="h-5 w-5 mr-2" />
                  Start Day
                </Button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <Badge variant={isActive ? "default" : "secondary"} className="mb-4 text-sm px-4 py-2">
                    {isActive ? "Day in Progress" : "Day Ended"}
                  </Badge>
                  <div className="text-4xl font-bold font-mono mb-4">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div>
                      <p className="mb-1">Started at</p>
                      <p className="font-medium text-foreground">
                        {startTime?.toLocaleTimeString()}
                      </p>
                    </div>
                    {!isActive && (
                      <div>
                        <p className="mb-1">Ended at</p>
                        <p className="font-medium text-foreground">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {isActive && (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => setShowEndConfirm(true)}
                    className="min-w-[200px]"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    End Day
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{city}</p>
                <p className="text-sm text-muted-foreground">Current location</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2025-11-21", start: "09:15 AM", end: "06:30 PM", duration: "9h 15m", city: "Delhi" },
              { date: "2025-11-20", start: "09:00 AM", end: "06:45 PM", duration: "9h 45m", city: "Ghaziabad" },
              { date: "2025-11-19", start: "08:45 AM", end: "06:20 PM", duration: "9h 35m", city: "Delhi" },
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{record.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.start} - {record.end}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{record.duration}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{record.city}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
