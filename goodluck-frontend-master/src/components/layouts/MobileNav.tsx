"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, School, Users, DollarSign, Bell, CheckCircle2, Plus,
  Calendar, UserCircle, BookOpen, X, ClipboardList, MapPinned,
  History, Receipt, FileText, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/salesman/dashboard",         label: "Dashboard",       icon: Home },
  { href: "/salesman/attendance",        label: "Attendance",      icon: CheckCircle2 },
  { href: "/salesman/today-visits",      label: "Today's Visits",  icon: MapPinned },
  { href: "/salesman/tour-plan",         label: "My Tour Plan",    icon: ClipboardList },
  { href: "/salesman/visit-history",     label: "Visit History",   icon: History },
  { type: "separator", label: "Schools" },
  { href: "/salesman/schools",           label: "My Schools",      icon: School },
  { href: "/salesman/schools/add-visit", label: "Add School Visit",icon: Plus },
  { href: "/salesman/next-visits",       label: "My Visits",       icon: Calendar },
  { type: "separator", label: "Question Banks" },
  { href: "/salesman/qbs",               label: "My QBs",          icon: BookOpen },
  { href: "/salesman/qbs/add-visit",     label: "Add QB Visit",    icon: Plus },
  { type: "separator", label: "Book Sellers" },
  { href: "/salesman/booksellers",            label: "Book Sellers",    icon: Users },
  { href: "/salesman/booksellers/add-visit",  label: "Add Seller Visit",icon: Plus },
  { type: "separator", label: "Expenses" },
  { href: "/salesman/expenses",               label: "My Expenses",  icon: Receipt },
  { href: "/salesman/expenses/add",           label: "Add Expense",  icon: Plus },
  { href: "/salesman/expenses/create-report", label: "Create Report",icon: FileText },
  { type: "separator", label: "Other" },
  { href: "/salesman/contacts",      label: "My Contact Persons", icon: UserCircle },
  { href: "/salesman/tada",          label: "TA/DA Claims",       icon: DollarSign },
  { href: "/salesman/notifications", label: "Notifications",      icon: Bell },
] as const;

const bottomTabs = [
  { href: "/salesman/dashboard",         label: "Home",       icon: Home },
  { href: "/salesman/schools",           label: "Schools",    icon: School },
  { href: "/salesman/schools/add-visit", label: "Visit",      icon: Plus, isFab: true },
  { href: "/salesman/attendance",        label: "Attendance", icon: CheckCircle2 },
  { href: "/salesman/tada",              label: "TA/DA",      icon: DollarSign },
] as const;

// ─── Nav list shared by drawer + desktop sidebar ──────────────────────────────
function NavList({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-0.5">
      {navItems.map((item, index) => {
        if ("type" in item && item.type === "separator") {
          return (
            <div key={`sep-${index}`} className="pt-5 pb-2 px-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {item.label}
              </p>
            </div>
          );
        }
        if ("href" in item) {
          const Icon = item.icon;
          const isActive = pathname === item.href;
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
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60 shrink-0" />}
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Side Drawer (mobile) ────────────────────────────────────────────────────
function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] md:hidden flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[280px] bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Branding */}
        <div className="flex items-center justify-between px-5 pt-12 pb-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-xs tracking-tight">CRM</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Field App</p>
              <p className="text-[11px] text-muted-foreground">Enterprise Edition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center transition-colors hover:bg-muted/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavList onItemClick={onClose} />
        </nav>

        <div className="px-5 py-4 border-t border-border/60">
          <p className="text-[11px] text-muted-foreground text-center">v1.0.0 · Enterprise</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ── Mobile Top Header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full md:hidden">
        <div className="bg-background/90 backdrop-blur-xl border-b border-border/50">
          <div className="flex h-14 items-center justify-between px-4">

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="h-9 w-9 rounded-xl bg-muted flex flex-col items-center justify-center gap-[5px]"
            >
              <span className="w-[18px] h-[2px] bg-foreground/70 rounded-full" />
              <span className="w-[13px] h-[2px] bg-foreground/70 rounded-full" />
              <span className="w-[18px] h-[2px] bg-foreground/70 rounded-full" />
            </button>

            {/* Logo — centered */}
            <Link href="/salesman/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-black text-xs">CRM</span>
              </div>
              <span className="font-bold text-[15px] tracking-tight">Field App</span>
            </Link>

            {/* Bell */}
            <Link
              href="/salesman/notifications"
              className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-[7px] w-[7px] rounded-full bg-destructive border border-background" />
            </Link>
          </div>
        </div>
      </header>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Mobile Bottom Tab Bar ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-background/95 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-around px-1 pt-1 pb-safe">
            {bottomTabs.map((tab) => {
              // FAB centre button
              if ("isFab" in tab && tab.isFab) {
                return (
                  <Link key={tab.href} href={tab.href} className="flex flex-col items-center -mt-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center ring-[3px] ring-background">
                      <Plus className="h-6 w-6 text-primary-foreground stroke-[2.5px]" />
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-1">Visit</span>
                  </Link>
                );
              }

              const Icon = tab.icon;
              const isActive =
                pathname === tab.href ||
                (tab.href !== "/salesman/dashboard" &&
                  pathname.startsWith(tab.href + "/") &&
                  !bottomTabs.some((t) => "isFab" in t && t.isFab && pathname.startsWith(t.href)));

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center gap-[3px] px-2 py-2 rounded-xl min-w-[52px] transition-all",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5px]")} />
                  <span className={cn(
                    "text-[10px] leading-none",
                    isActive ? "font-bold" : "font-medium"
                  )}>
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

      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-background">
        <div className="flex h-14 items-center border-b px-4 gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-xs">CRM</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Field App</p>
            <p className="text-[10px] text-muted-foreground">Enterprise Edition</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavList />
        </nav>
      </aside>
    </>
  );
}
