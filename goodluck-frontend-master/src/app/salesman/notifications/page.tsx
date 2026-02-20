"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, AlertCircle, DollarSign, Calendar, Target, MessageSquare } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { Notification } from "@/types";

// Import mock data
import notificationsData from "@/lib/mock-data/notifications.json";

const getIcon = (type: string) => {
  switch (type) {
    case "tada":
      return DollarSign;
    case "deadline":
      return Calendar;
    case "target":
      return Target;
    case "manager":
    case "feedback":
      return MessageSquare;
    default:
      return AlertCircle;
  }
};

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Filter notifications for current user (SM001)
      const userNotifications = notificationsData.filter((n) => n.userId === "SM001");
      setNotifications(userNotifications as Notification[]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "high") return n.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        action={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )
        }
      />

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="high">
            High Priority ({notifications.filter((n) => n.priority === "high").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications to display</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.read ? "bg-primary/5 border-primary/20" : ""
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        notification.priority === "high"
                          ? "bg-red-100"
                          : notification.priority === "medium"
                          ? "bg-orange-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          notification.priority === "high"
                            ? "text-red-600"
                            : notification.priority === "medium"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            notification.priority === "high"
                              ? "destructive"
                              : notification.priority === "medium"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.date).toLocaleString()}
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
