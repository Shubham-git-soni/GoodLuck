"use client";

import { useState } from "react";
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
  Award,
  TrendingUp,
  Database,
  Palette,
  UserCog,
  Store,
  User,
  Menu,
  CalendarCheck,
  Receipt,
  ClipboardList,

  Globe,

  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],

  },

  {
    label: "Reports",
    items: [
      { href: "/admin/reports/attendance", label: "Attendance Report", icon: BarChart3 },
      { href: "/admin/reports/visits", label: "Visit Analytics", icon: BarChart3 },
      // { href: "/admin/reports/compliance", label: "Policy Compliance", icon: Award },
      // { href: "/admin/reports/loyalty", label: "Loyalty Reports", icon: TrendingUp },
      // { href: "/admin/reports/gap-analysis", label: "Gap Analysis", icon: BarChart3 },
    ],
  },

  {
    label: "Year Comparison",
    items: [
      { href: "/admin/analytics/year-comparison", label: "Year-wise Report", icon: TrendingUp },
    ]
  },
  {
    label: "Masters",
    items: [
      { href: "/admin/team", label: "Sales Person", icon: Users },
      { href: "/admin/managers", label: "Managers", icon: UserCog },
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
      { href: "/admin/tour-plans", label: "Tour Plans", icon: Calendar },
      { href: "/admin/tada", label: "TA/DA Approval", icon: DollarSign },
      { href: "/admin/feedback", label: "Feedback Manager", icon: MessageSquare },
    ],
  },
  {
    label: "Expense Management",
    items: [
      { href: "/admin/expenses", label: "All Expense Reports", icon: Receipt },
      { href: "/admin/expenses/policy", label: "Expense Policies", icon: ClipboardList },
      { href: "/admin/expenses/reports", label: "Expense Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/analytics/schools", label: "School Analytics", icon: School },
      { href: "/admin/analytics/prescribed-books", label: "Prescribed Books", icon: FileText },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/admin/specimen", label: "Specimen Tracking", icon: BookOpen },],
  },

  // Settings group hidden (White Label removed, ERP Integration hidden)
  // { href: "/admin/erp", label: "ERP Integration", icon: Database },
];

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
          <Button
            size="lg"
            variant="destructive"
            onClick={() => { onConfirm(); onClose(); }}
            className="w-full h-12 text-sm font-semibold rounded-2xl"
          >
            Yes, Logout
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

// Sidebar content component to be reused
function SidebarContent({ onLinkClick, onLogout }: { onLinkClick?: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      < div className="flex h-16 items-center border-b px-6" >
        <Link href="/admin/dashboard" className="flex items-center space-x-2" onClick={onLinkClick}>
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CRM</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Admin Portal</span>
            <span className="text-xs text-muted-foreground">Management</span>
          </div>
        </Link>
      </div >

      {/* Navigation */}
      < nav className="flex-1 overflow-y-auto p-4 space-y-6" >
        {
          navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:translate-x-1",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        }
      </nav >


      {/* User Info + Logout */}
      <div className="border-t p-4 space-y-1">

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">GM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">GM Sales</p>
            <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
          </div>
        </div>

        <button
          onClick={() => { onLinkClick?.(); onLogout(); }}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>

    </>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

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

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-background px-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CRM</span>
          </div>
          <span className="font-semibold text-sm">Admin Portal</span>
        </Link>
      </div>

      {/* Mobile Sidebar (Sheet/Drawer) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-full flex-col">
            <SidebarContent onLinkClick={() => setOpen(false)} onLogout={() => setShowLogoutDialog(true)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        <SidebarContent onLogout={() => setShowLogoutDialog(true)} />
      </aside>
    </>
  );
}
