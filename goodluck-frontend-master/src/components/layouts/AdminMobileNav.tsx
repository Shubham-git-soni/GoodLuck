"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  User,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";

const adminNavGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Salesmen",
    items: [
      { href: "/admin/team", label: "Sales Team", icon: Users }
    ]
  },
  {
    label: "Reports",
    items: [
      { href: "/admin/reports/attendance", label: "Attendance Report", icon: BarChart3 },
      { href: "/admin/reports/daily", label: "Daily Report", icon: FileText },
      { href: "/admin/reports/date-wise", label: "Date-wise Report", icon: TrendingUp },
      { href: "/admin/reports/visits", label: "Visit Reports", icon: BarChart3 },
      { href: "/admin/reports/loyalty", label: "Loyalty Reports", icon: TrendingUp },
    ],
  },
  {
    label: "Year Comparison",
    items: [
      { href: "/admin/analytics/year-comparison", label: "Year Comparison", icon: TrendingUp },
    ]
  },
  {
    label: "Lists",
    items: [
      { href: "/admin/lists/schools", label: "School List", icon: School },
      { href: "/admin/lists/contacts", label: "Contact Persons", icon: User },
      { href: "/admin/lists/booksellers", label: "Bookseller List", icon: Store },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/managers", label: "Managers", icon: UserCog },
      { href: "/admin/tour-plans", label: "Tour Plans", icon: Calendar },
      { href: "/admin/tada", label: "TA/DA Approval", icon: DollarSign },
      { href: "/admin/feedback", label: "Feedback Manager", icon: MessageSquare },
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
    label: "Books & Resources",
    items: [
      { href: "/admin/books", label: "Books", icon: BookOpen },
      { href: "/admin/specimen", label: "Specimen Tracking", icon: BookOpen },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings/dropdowns", label: "Dropdown Manager", icon: Settings },
    ],
  },
];

export default function AdminMobileNav() {
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
  <SheetHeader className="border-b p-4">
                <Link href="/admin/dashboard" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">CRM</span>
                  </div>
                  <span className="font-semibold">Admin Portal</span>
                </Link>
              </SheetHeader>

              <nav className="flex-1 overflow-y-auto p-4">
                {adminNavGroups.map((group) => (
                  <div key={group.label}>
                    <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </h3>
                    <div className="space-y-1 mb-4">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
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
                ))}
              </nav>

              {/* User Info */}
              <div className="border-t p-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">GM</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">GM Sales</p>
                    <p className="text-xs text-muted-foreground truncate">admin@company.com</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/admin/dashboard" className="flex items-center space-x-2 ml-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold">Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Spacer for mobile to prevent content from being hidden under fixed header */}
      <div className="h-14 md:hidden"></div>
    </>
  );
}