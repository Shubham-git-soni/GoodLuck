"use client";

import { useState, useEffect } from "react";
import {
  Bell, CheckCircle2, School, Calendar, DollarSign,
  ClipboardList, Info, ChevronRight, Check, BellOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/lib/dummy-api";
import type { AdminNotification } from "@/lib/dummy-api";

// ─── Notification type config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<AdminNotification["type"], {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
}> = {
  master_approval: {
    icon: School,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    label: "Master Approval",
  },
  tour_plan: {
    icon: Calendar,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "Tour Plan",
  },
  tada: {
    icon: DollarSign,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    label: "TA/DA",
  },
  visit: {
    icon: ClipboardList,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Visit",
  },
  general: {
    icon: Info,
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    label: "General",
  },
};

const PRIORITY_COLORS = {
  high:   "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  normal: "bg-muted text-muted-foreground border-border",
};

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onRead,
  onClick,
}: {
  notif: AdminNotification;
  onRead: (id: string) => void;
  onClick: (notif: AdminNotification) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.general;
  const Icon = cfg.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        !notif.read && "border-primary/30 bg-primary/[0.02]"
      )}
      onClick={() => onClick(notif)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.iconBg)}>
            <Icon className={cn("h-5 w-5", cfg.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={cn("text-sm font-semibold leading-tight", !notif.read && "text-foreground")}>
                  {notif.title}
                </p>
                {!notif.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-0.5" />
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold", PRIORITY_COLORS[notif.priority])}>
                  {notif.priority}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{notif.message}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] py-0">{cfg.label}</Badge>
                {notif.salesmanName && (
                  <span className="text-[10px] text-muted-foreground">{notif.salesmanName}</span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(notif.date), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Mark as read button for unread */}
        {!notif.read && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); onRead(notif.id); }}
            >
              <Check className="h-3 w-3" />
              Mark as read
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterType = "all" | AdminNotification["type"];

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    getAdminNotifications().then((data) => {
      setNotifications(data);
      setIsLoading(false);
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function handleRead(id: string) {
    await markAdminNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function handleMarkAllRead() {
    await markAllAdminNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  function handleNotifClick(notif: AdminNotification) {
    handleRead(notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  }

  const filtered = notifications.filter(n => {
    if (showUnreadOnly && n.read) return false;
    if (activeFilter !== "all" && n.type !== activeFilter) return false;
    return true;
  });

  const FILTER_TABS: { id: FilterType; label: string }[] = [
    { id: "all",             label: `All (${notifications.length})` },
    { id: "master_approval", label: `Masters (${notifications.filter(n => n.type === "master_approval").length})` },
    { id: "tour_plan",       label: `Tour Plans (${notifications.filter(n => n.type === "tour_plan").length})` },
    { id: "tada",            label: `TA/DA (${notifications.filter(n => n.type === "tada").length})` },
    { id: "general",         label: `General (${notifications.filter(n => n.type === "general").length})` },
  ];

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Notifications" description="Admin activity and approval alerts" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4"><div className="h-20 bg-muted rounded-xl" /></CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-3 mb-4">
        <PageHeader
          title="Notifications"
          description={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
        />
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border",
              showUnreadOnly
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{showUnreadOnly ? "Unread only" : "Unread only"}</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="text-xs h-8 hidden sm:flex" onClick={handleMarkAllRead}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Mark all read — mobile only */}
      {unreadCount > 0 && (
        <div className="flex justify-end mb-3 sm:hidden">
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleMarkAllRead}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Mark all read
          </Button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1 overflow-x-auto no-scrollbar">
        {FILTER_TABS.map(f => (
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

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BellOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No notifications</p>
          <p className="text-xs text-muted-foreground mt-1">
            {showUnreadOnly ? "All notifications have been read" : "Nothing here yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <NotifCard
              key={n.id}
              notif={n}
              onRead={handleRead}
              onClick={handleNotifClick}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
