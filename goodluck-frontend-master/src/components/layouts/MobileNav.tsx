"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  School,
  Users,
  DollarSign,
  Bell,
  CheckCircle2,
  Plus,
  Calendar,
  UserCircle,
  BookOpen,
  Menu,
  X,
  ClipboardList,
  MapPinned,
  History,
  Receipt,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/salesman/dashboard", label: "Dashboard", icon: Home },
  { href: "/salesman/attendance", label: "Attendance", icon: CheckCircle2 },
  { href: "/salesman/today-visits", label: "Today's Visits", icon: MapPinned },
  { href: "/salesman/tour-plan", label: "My Tour Plan", icon: ClipboardList },
  { href: "/salesman/visit-history", label: "Visit History", icon: History },

  { type: "separator", label: "Schools" },
  { href: "/salesman/schools", label: "My Schools", icon: School },
  { href: "/salesman/schools/add-visit", label: "Add School Visit", icon: Plus },
  { href: "/salesman/next-visits", label: "My Visits", icon: Calendar },

  { type: "separator", label: "Question Banks" },
  { href: "/salesman/qbs", label: "My QBs", icon: BookOpen },
  { href: "/salesman/qbs/add-visit", label: "Add QB Visit", icon: Plus },

  { type: "separator", label: "Book Sellers" },
  { href: "/salesman/booksellers", label: "Book Sellers", icon: Users },
  { href: "/salesman/booksellers/add-visit", label: "Add Seller Visit", icon: Plus },

  { type: "separator", label: "Expenses" },
  { href: "/salesman/expenses", label: "My Expenses", icon: Receipt },
  { href: "/salesman/expenses/add", label: "Add Expense", icon: Plus },
  { href: "/salesman/expenses/create-report", label: "Create Report", icon: FileText },

  { type: "separator", label: "Other" },
  { href: "/salesman/contacts", label: "My Contact Persons", icon: UserCircle },
  { href: "/salesman/tada", label: "TA/DA Claims", icon: DollarSign },
  { href: "/salesman/notifications", label: "Notifications", icon: Bell },
] as const;

export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <header className="sticky top-0 z-50 w-full border-b bg-background md:hidden">
        <div className="flex h-14 items-center px-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/salesman/dashboard" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">CRM</span>
                  </div>
                  <span className="font-semibold">Field App</span>
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item, index) => {
                    // Render separator
                    if ('type' in item && item.type === 'separator') {
                      return (
                        <div key={`separator-${index}`} className="pt-4 pb-2">
                          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {item.label}
                          </p>
                        </div>
                      );
                    }

                    // Render nav link
                    if ('href' in item && item.href) {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    }

                    return null;
                  })}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/salesman/dashboard" className="flex items-center space-x-2 ml-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold">Field App</span>
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/salesman/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold">Field App</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              // Render separator
              if ('type' in item && item.type === 'separator') {
                return (
                  <div key={`separator-${index}`} className="pt-4 pb-2">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                );
              }

              // Render nav link
              if ('href' in item && item.href) {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return null;
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
