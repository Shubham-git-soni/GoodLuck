"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Calendar,
  BarChart3,
  DollarSign,
  MessageSquare,
  Settings,
  FileText,
  TrendingUp,
  UserCog,
  Store,
  CalendarCheck,
  Receipt,
  ClipboardList,
  Globe,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAdminUnreadCount } from "@/lib/dummy-api";

// ─── Nav groups ───────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/approvals", label: "Approvals", icon: ClipboardList, badge: "approvals" },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/admin/reports/attendance", label: "Attendance Report", icon: BarChart3 },

      { href: "/admin/reports/visits", label: "Visit Analytics", icon: BarChart3 },
      { href: "/admin/analytics/year-comparison", label: "Year-wise Report", icon: TrendingUp },
      { href: "/admin/analytics/schools", label: "School Analytics", icon: School },
      { href: "/admin/reports/prescribed-books", label: "Prescribed Books", icon: FileText },
      { href: "/admin/reports/specimen", label: "Specimen Tracking", icon: BookOpen },
    ],
  },
  {
    label: "Masters",
    items: [
      { href: "/admin/users", label: "User Master", icon: UserCog },
      { href: "/admin/masters/locations", label: "Location Master", icon: Globe },
      { href: "/admin/lists/schools", label: "Schools", icon: School },
      { href: "/admin/lists/booksellers", label: "Book Sellers", icon: Store },
      { href: "/admin/books", label: "Books", icon: BookOpen },
      { href: "/admin/settings/dropdowns", label: "Dropdown", icon: Settings },

    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/pm-schedule", label: "PM Schedule", icon: CalendarCheck },
      { href: "/admin/pm-calendar", label: "PM Calendar", icon: Calendar },
      { href: "/admin/feedback", label: "Feedback Manager", icon: MessageSquare },
    ],
  },
  {
    label: "Expense Management",
    items: [
      { href: "/admin/expenses", label: "Expenses Reports", icon: Receipt },
      { href: "/admin/expenses/policy", label: "Expense Policies", icon: ClipboardList },
      { href: "/admin/expenses/reports", label: "Expense Analytics", icon: TrendingUp },
    ],
  },
];

// ─── Pending counts ────────────────────────────────────────────────────────────
function usePendingCounts() {
  const [notifCount, setNotifCount] = useState(0);
  useEffect(() => { getAdminUnreadCount().then(setNotifCount); }, []);
  return { notifCount };
}

// ─── Nav List (shared by drawer + desktop) ────────────────────────────────────
function NavList({ onItemClick, notifCount }: { onItemClick?: () => void; notifCount: number }) {
  const pathname = usePathname();

  return (
    <div className="space-y-0.5">
      {navGroups.map((group, gi) => (
        <div key={group.label}>
          <div className={cn("pb-2 px-2", gi === 0 ? "pt-0" : "pt-5")}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {group.label}
            </p>
          </div>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const badgeCount = (item as any).badge === "notifications" ? notifCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/65 hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-primary/15" : "bg-muted"
                  )}>
                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={cn(
                      "inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-[10px] font-bold",
                      isActive ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"
                    )}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Logout Confirmation Dialog ───────────────────────────────────────────────
function LogoutDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-sm">
        <div className="px-6 pt-8 pb-2 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <LogOut className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-1">Logout</h3>
          <p className="text-sm text-muted-foreground">Are you sure you want to logout? You will need to sign in again to continue.</p>
        </div>
        <div className="px-6 pt-3 pb-6 flex flex-col gap-2.5">
          <Button size="lg" variant="destructive" onClick={() => { onConfirm(); onClose(); }} className="w-full h-12 text-sm font-semibold rounded-2xl">
            Yes, Logout
          </Button>
          <Button size="lg" variant="outline" onClick={onClose} className="w-full h-12 text-sm font-semibold rounded-2xl">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Side Drawer ───────────────────────────────────────────────────────
function SideDrawer({
  open,
  onClose,
  onLogout,
  notifCount,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  notifCount: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] lg:hidden flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[280px] bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Branding */}
        <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-border/60">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs tracking-tight">CRM</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Admin Portal</p>
              <p className="text-[11px] text-muted-foreground">Management</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavList onItemClick={onClose} notifCount={notifCount} />
        </nav>

        {/* Logout */}
        <div className="px-3 pb-2 border-t border-border/60 pt-3">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-destructive/10">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-semibold">Logout</span>
          </button>
        </div>
        <div className="px-5 py-3">
          <p className="text-[11px] text-muted-foreground text-center">Admin Portal · v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────
const adminBottomTabs = [
  { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: ClipboardList },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt, isFab: true },
  { href: "/admin/expenses/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/notifications", label: "Alerts", icon: Bell },
] as const;

function AdminBottomNav({ notifCount }: { notifCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around px-1 pt-1 pb-safe">
          {adminBottomTabs.map((tab) => {
            if ("isFab" in tab && tab.isFab) {
              return (
                <Link key={tab.href} href={tab.href} className="flex flex-col items-center -mt-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center ring-[3px] ring-background">
                    <Receipt className="h-6 w-6 text-primary-foreground stroke-[2px]" />
                  </div>
                  <span className="text-[10px] font-bold text-primary mt-1">Expenses</span>
                </Link>
              );
            }

            const Icon = tab.icon;
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/admin/dashboard" && pathname.startsWith(tab.href + "/"));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-[3px] px-2 py-2 rounded-xl min-w-[52px] transition-all relative",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5px]")} />
                  {tab.href === "/admin/notifications" && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-[7px] w-[7px] rounded-full bg-destructive border border-background" />
                  )}
                </div>
                <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-medium")}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="h-[3px] w-5 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const { notifCount } = usePendingCounts();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <>
      <LogoutDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={() => setShowLogoutDialog(true)}
        notifCount={notifCount}
      />

      {/* ── Mobile Top Bar ── */}
      <header className="sticky top-0 z-50 w-full lg:hidden">
        <div className="bg-background/90 backdrop-blur-xl border-b border-border/50">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-black text-xs">CRM</span>
              </div>
              <span className="font-bold text-[15px] tracking-tight">Admin Portal</span>
            </Link>
            <Link
              href="/admin/notifications"
              className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center relative"
            >
              <Bell className="h-4 w-4" />
              {notifCount > 0 && (
                <span className="absolute top-2 right-2 h-[7px] w-[7px] rounded-full bg-destructive border border-background" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <AdminBottomNav notifCount={notifCount} />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4 gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-xs">CRM</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Admin Portal</p>
            <p className="text-[10px] text-muted-foreground">Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavList notifCount={notifCount} />
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-border/60 pt-3 shrink-0">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-destructive/10">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
