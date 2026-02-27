"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, DollarSign, Calendar, Target,
  MessageSquare, AlertCircle, School, ClipboardList, BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

// Dummy API (replace with real API calls when backend is ready)
import {
  getSalesmanNotifications,
  markSalesmanNotificationRead,
  markAllSalesmanNotificationsRead,
} from "@/lib/dummy-api";
import type { SalesmanNotification } from "@/lib/dummy-api";

// Also load static notifications for this salesman (seed)
import notificationsData from "@/lib/mock-data/notifications.json";

const SALESMAN_ID = "SM001";

// ─── Icon by type ─────────────────────────────────────────────────────────────

function getIcon(type: string) {
  switch (type) {
    case "tour_plan":   return Calendar;
    case "tada":        return DollarSign;
    case "master":      return School;
    case "visit":       return ClipboardList;
    case "target":      return Target;
    case "manager":
    case "feedback":    return MessageSquare;
    case "deadline":    return Calendar;
    case "specimen":    return AlertCircle;
    case "school":      return School;
    default:            return AlertCircle;
  }
}

function getPriorityColor(priority: string) {
  if (priority === "high")   return "bg-red-100 text-red-600";
  if (priority === "medium") return "bg-orange-100 text-orange-600";
  return "bg-blue-100 text-blue-600";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<SalesmanNotification[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      // Merge: localStorage API notifications + static JSON for this salesman
      const apiNotifs = await getSalesmanNotifications(SALESMAN_ID);

      // Map static JSON to SalesmanNotification shape (so they appear too)
      const staticNotifs: SalesmanNotification[] = (notificationsData as any[])
        .filter((n: any) => n.userId === SALESMAN_ID)
        .map((n: any) => ({
          id: n.id,
          userId: n.userId,
          type: n.type,
          title: n.title,
          message: n.message,
          date: n.date,
          read: n.read,
          priority: n.priority,
          actionUrl: n.actionUrl,
        }));

      // API notifications first (newest), then static (dedup by id)
      const apiIds = new Set(apiNotifs.map(n => n.id));
      const merged = [...apiNotifs, ...staticNotifs.filter(n => !apiIds.has(n.id))];
      // Sort newest first
      merged.sort((a, b) => b.date.localeCompare(a.date));
      setNotifications(merged);
      setIsLoading(false);
    }
    load();

    // Re-fetch on focus so notification from admin approval shows up immediately
    const onFocus = () => getSalesmanNotifications(SALESMAN_ID).then(apiNotifs => {
      setNotifications(prev => {
        const apiIds = new Set(apiNotifs.map(n => n.id));
        const staticOnly = prev.filter(n => !n.id.startsWith("SN-") && !apiIds.has(n.id));
        const merged = [...apiNotifs, ...staticOnly];
        merged.sort((a, b) => b.date.localeCompare(a.date));
        return merged;
      });
    });
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function handleMarkAsRead(id: string) {
    if (id.startsWith("SN-")) {
      await markSalesmanNotificationRead(id);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function handleMarkAllAsRead() {
    await markAllSalesmanNotificationsRead(SALESMAN_ID);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function handleClick(notif: SalesmanNotification) {
    handleMarkAsRead(notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "high")   return n.priority === "high";
    return true;
  });

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex rounded-2xl bg-muted p-1 gap-1 mb-6">
        {[
          { value: "all",    label: `All (${notifications.length})` },
          { value: "unread", label: `Unread (${unreadCount})` },
          { value: "high",   label: `High Priority (${notifications.filter(n => n.priority === "high").length})` },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-1 flex items-center justify-center rounded-xl py-2.5 px-2 text-xs font-semibold transition-all duration-150 ${
              filter === tab.value ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "unread" ? "All notifications have been read" : "Nothing here yet"}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = getIcon(notification.type);
            const iconBg = getPriorityColor(notification.priority);
            const isTourPlan = notification.type === "tour_plan";
            const isApproved = notification.title.includes("Approved");
            const isRejected = notification.title.includes("Rejected");

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? "bg-primary/5 border-primary/20" : ""
                } ${isTourPlan && isApproved ? "border-emerald-200" : ""
                } ${isTourPlan && isRejected ? "border-red-200" : ""}`}
                onClick={() => handleClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-semibold text-sm leading-tight ${
                            isTourPlan && isApproved ? "text-emerald-700" :
                            isTourPlan && isRejected ? "text-red-700" : ""
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-0.5" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            notification.priority === "high" ? "destructive" :
                            notification.priority === "medium" ? "secondary" : "outline"
                          }
                          className="text-[10px]"
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
