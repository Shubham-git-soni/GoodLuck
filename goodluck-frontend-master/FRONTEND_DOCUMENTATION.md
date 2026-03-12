# GoodLuck Frontend - Complete Documentation
**Last Updated:** March 11, 2026
**Branch:** dev_priyanshu
**Version:** Next.js 16.0.10

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Complete Page Inventory](#complete-page-inventory)
5. [Components Architecture](#components-architecture)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Mock Data System](#mock-data-system)
8. [Dummy API Layer](#dummy-api-layer)
9. [Visit Form Architecture](#visit-form-architecture)
10. [Admin Dashboard Features](#admin-dashboard-features)
11. [Salesman Mobile App Features](#salesman-mobile-app-features)
12. [UI Component Library](#ui-component-library)
13. [Routing & Navigation](#routing--navigation)
14. [State Management](#state-management)
15. [Styling & Theming](#styling--theming)
16. [Key Features](#key-features)

---

## 1. Project Overview

**GoodLuck Frontend** is a Next.js-based CRM system designed for managing school and bookseller relationships through field sales operations. It provides two distinct user experiences:

- **Admin Web Portal** (Desktop-optimized): Analytics, reporting, team management, approvals
- **Salesman Mobile App** (Mobile-first): Field visit tracking, expense management, tour planning

**Key Characteristics:**
- Frontend-only application with **NO backend integration**
- All data is **mock/dummy JSON** stored in `/src/lib/mock-data/`
- LocalStorage used for persistence simulation
- Dual-interface design (Admin desktop + Salesman mobile)
- Multi-step forms with validation
- Real-time chart visualizations

---

## 2. Technology Stack

### Core Framework
```json
{
  "next": "^16.0.10",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "^5"
}
```

### UI & Styling
```json
{
  "@radix-ui/*": "Multiple components",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "lucide-react": "^0.554.0",
  "next-themes": "^0.4.6"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.66.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.13"
}
```

### Data Visualization
```json
{
  "recharts": "^3.5.0"
}
```

### Utilities
```json
{
  "date-fns": "^4.1.0",
  "sonner": "^2.0.7",
  "xlsx": "^0.18.5",
  "pdf-parse": "^2.4.5",
  "mammoth": "^1.11.0"
}
```

### Development
```json
{
  "eslint": "^9",
  "babel-plugin-react-compiler": "1.0.0"
}
```

---

## 3. Project Structure

### Directory Tree
```
src/
├── app/                          # Next.js App Router (56 pages + 3 layouts)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Dual login (Admin/Salesman)
│   ├── admin/                    # 38 admin pages
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── dashboard/
│   │   ├── reports/              # 4 report pages (attendance, visits, prescribed-books, specimen)
│   │   ├── analytics/            # 2 analytics pages (schools, year-comparison)
│   │   ├── lists/                # 2 list pages (schools, booksellers)
│   │   ├── team/                 # 16 team management pages
│   │   ├── expenses/             # 4 expense pages
│   │   ├── approvals/
│   │   ├── notifications/
│   │   ├── pm-schedule/
│   │   ├── pm-calendar/
│   │   ├── feedback/
│   │   ├── books/
│   │   ├── users/
│   │   ├── settings/             # Dropdowns only
│   │   └── masters/              # Locations
│   └── salesman/                 # 18 salesman pages
│       ├── layout.tsx            # Salesman layout with mobile nav
│       ├── dashboard/
│       ├── schools/              # 4 school pages
│       ├── booksellers/          # 3 bookseller pages
│       ├── attendance/
│       ├── expenses/             # 3 expense pages
│       ├── notifications/
│       ├── today-visits/
│       ├── visit-history/
│       ├── my-visits/
│       ├── next-visits/
│       ├── tour-plan/
│       ├── tour-plans/
│       └── tada/
│
├── components/                   # 56 component files
│   ├── ui/                       # 41 Shadcn UI components
│   │   ├── alert.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── data-grid.tsx         # 155KB custom DataGrid
│   │   ├── data-grid-example.tsx
│   │   ├── date-picker.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── delete-confirm-dialog.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty-state.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── mobile-sheet.tsx
│   │   ├── month-picker.tsx
│   │   ├── multi-select.tsx
│   │   ├── native-select.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton-loaders.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── time-picker.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── layouts/                  # 6 layout components
│   │   ├── AdminMainContent.tsx
│   │   ├── AdminMobileNav.tsx
│   │   ├── AdminSidebar.tsx      # 398 lines, desktop nav
│   │   ├── MobileNav.tsx         # Bottom tab bar + drawer
│   │   ├── PageContainer.tsx
│   │   ├── PageHeader.tsx
│   │   └── SidebarContext.tsx
│   ├── forms/
│   │   └── visit/                # 7-step visit form
│   │       ├── StepSchoolSelection.tsx
│   │       ├── StepContactPerson.tsx
│   │       ├── StepPurpose.tsx
│   │       ├── StepJointWorking.tsx
│   │       ├── StepSpecimenAllocation.tsx
│   │       ├── StepFeedback.tsx
│   │       └── StepNextVisit.tsx
│   └── dashboard/                # 2 dashboard widgets
│       ├── ProgressCard.tsx
│       └── StatsCard.tsx
│
├── lib/
│   ├── mock-data/                # 20 JSON/TS data files
│   │   ├── salesmen.json         # 5 salesmen
│   │   ├── schools.json          # 15+ schools
│   │   ├── book-sellers.json
│   │   ├── books.json
│   │   ├── contact-persons.json
│   │   ├── specimens.json
│   │   ├── visits.json
│   │   ├── feedback.json
│   │   ├── expenses.json
│   │   ├── expense-reports.json
│   │   ├── expense-policies.json
│   │   ├── tada-claims.json
│   │   ├── notifications.json
│   │   ├── tour-plans.ts
│   │   ├── managers.json
│   │   ├── locations.json
│   │   ├── product-manager-schedules.json
│   │   └── dropdown-options.json
│   ├── dummy-api/                # 11 API wrapper files
│   │   ├── index.ts
│   │   ├── _db.ts                # LocalStorage utilities
│   │   ├── schools.ts
│   │   ├── booksellers.ts
│   │   ├── tour-plans.ts
│   │   ├── visits.ts
│   │   ├── salesmen.ts
│   │   ├── approvals.ts
│   │   ├── expenses.ts
│   │   ├── books.ts
│   │   └── tada.ts
│   └── utils.ts                  # Utility functions (cn, etc.)
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── hooks/
│   └── use-toast.ts              # Toast hook
│
└── styles/                       # Global styles
```

### File Count Summary
| Directory | Files | Purpose |
|-----------|-------|---------|
| `/app` | 56 | All routing pages + layouts |
| `/components/ui` | 41 | Shadcn UI library |
| `/components/forms` | 7 | Visit form steps |
| `/components/layouts` | 6 | Layout components |
| `/lib/mock-data` | 18 | Mock JSON data |
| `/lib/dummy-api` | 11 | API wrappers |
| **TOTAL** | **139+** | Complete codebase |

---

## 4. Complete Page Inventory

> **Last cleaned:** March 11, 2026. All pages verified against `AdminSidebar.tsx` and `MobileNav.tsx`.

### Root Pages (3)
- `/` - Landing page
- `/login` - Dual login with tabs (Admin/Salesman)
- `/app/layout.tsx` - Root layout

---

### Admin Pages (38 pages)

#### Overview (3)
| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | Main dashboard with KPIs, charts, global filters |
| `/admin/approvals` | Master + Tour Plan + TA/DA approval workflow |
| `/admin/notifications` | Admin notification center |

#### Reports (4) — sidebar: REPORTS group
| Route | Purpose |
|-------|---------|
| `/admin/reports/attendance` | Salesman attendance reports |
| `/admin/reports/visits` | Visit analytics & trends |
| `/admin/reports/prescribed-books` | Prescribed book analysis |
| `/admin/reports/specimen` | Specimen allocation tracking |

#### Analytics (2) — sidebar: REPORTS group
| Route | Purpose |
|-------|---------|
| `/admin/analytics/schools` | School-wise performance analytics |
| `/admin/analytics/year-comparison` | Year-over-year comparison charts |

#### Masters (6) — sidebar: MASTERS group
| Route | Purpose |
|-------|---------|
| `/admin/users` | User management (User Master) |
| `/admin/masters/locations` | Location master (States → Cities → Stations) |
| `/admin/lists/schools` | School master list with DataGrid |
| `/admin/lists/schools/[id]` | School detail view & edit |
| `/admin/lists/booksellers` | Bookseller directory |
| `/admin/books` | Books catalog management |
| `/admin/settings/dropdowns` | Dropdown configuration |

#### Management (3) — sidebar: MANAGEMENT group
| Route | Purpose |
|-------|---------|
| `/admin/pm-schedule` | Product Manager schedule list |
| `/admin/pm-schedule/[id]` | PM schedule detail |
| `/admin/pm-calendar` | PM calendar view |
| `/admin/feedback` | Feedback & complaints management |

#### Expense Management (4) — sidebar: EXPENSE MANAGEMENT group
| Route | Purpose |
|-------|---------|
| `/admin/expenses` | Expense list & approval queue |
| `/admin/expenses/[id]` | Expense detail view |
| `/admin/expenses/policy` | Expense policy configuration |
| `/admin/expenses/reports` | Expense analytics & reports |

#### Team Management (16) — accessible from team list
| Route | Purpose |
|-------|---------|
| `/admin/team` | Sales team overview with cards |
| `/admin/team/[id]` | Salesman profile (Kundli view) |
| `/admin/team/[id]/school-list` | Schools assigned to salesman |
| `/admin/team/[id]/bookseller-list` | Booksellers assigned to salesman |
| `/admin/team/[id]/school-visit-report` | School visit detailed report |
| `/admin/team/[id]/bookseller-visit-report` | Bookseller visit detailed report |
| `/admin/team/[id]/attendance-report` | Attendance tracking for salesman |
| `/admin/team/[id]/school-sales-plan` | School sales planning |
| `/admin/team/[id]/summary-report` | Summary analytics |
| `/admin/team/[id]/ip-report` | IP/Prescribed books report |
| `/admin/team/[id]/manual-report` | Manual data entry report |
| `/admin/team/[id]/merge-report` | Merge report |
| `/admin/team/[id]/multiple-visit-report` | Multiple visit analysis |
| `/admin/team/[id]/sales-plan-visit` | Sales plan vs actual visits |
| `/admin/team/[id]/drop-list` | Dropped schools list |
| `/admin/team/[id]/edit` | Edit salesman profile |

---

### Salesman Pages (18 pages — Mobile-First)

#### Core Navigation
| Route | Purpose |
|-------|---------|
| `/salesman/dashboard` | Mobile dashboard with stats, charts, quick actions |
| `/salesman/attendance` | Check-in/check-out with location tracking |
| `/salesman/today-visits` | Today's approved tour plan visits |
| `/salesman/tour-plans` | My tour plans list |
| `/salesman/next-visits` | Upcoming scheduled visits |
| `/salesman/visit-history` | Past visit records |
| `/salesman/my-visits` | Manual visit history (referenced from add-visit) |

#### School Management
| Route | Purpose |
|-------|---------|
| `/salesman/schools` | My assigned schools list |
| `/salesman/schools/[id]` | School profile (Kundli view) |
| `/salesman/schools/add-visit` | **7-step school visit form** |
| `/salesman/schools/replacement` | Specimen replacement form |

#### Bookseller Management
| Route | Purpose |
|-------|---------|
| `/salesman/booksellers` | My booksellers list |
| `/salesman/booksellers/[id]` | Bookseller profile & history |
| `/salesman/booksellers/add-visit` | Bookseller visit form |

#### Expenses
| Route | Purpose |
|-------|---------|
| `/salesman/expenses` | My expenses list with status |
| `/salesman/expenses/add` | Add expense form with receipt upload |
| `/salesman/expenses/create-report` | Generate expense report |

#### Tour Planning
| Route | Purpose |
|-------|---------|
| `/salesman/tour-plan` | Tour plan builder (weekly planning) |

#### Other
| Route | Purpose |
|-------|---------|
| `/salesman/tada` | TA/DA claims submission |
| `/salesman/notifications` | Notifications inbox |

---

## 5. Components Architecture

### Layout Components (6 files)

#### AdminSidebar.tsx (398 lines)
**Purpose:** Desktop navigation sidebar with collapsible drawer for mobile

**Features:**
- Full-width sidebar on desktop (`md:w-64`)
- Slide-out drawer on mobile
- Active route highlighting
- Badge notifications for approvals/notifications
- Logout confirmation dialog
- Icon-based navigation

**Navigation Groups:**
```typescript
1. Overview
   - Dashboard
   - Approvals (with badge)
   - Notifications (with badge)

2. Reports
   - Attendance, Visits, Year Comparison
   - Analytics (Schools, Prescribed Books)
   - Compliance, Performance, Specimen
   - Loyalty, Gap Analysis, Daily, Date-wise

3. Masters
   - User Master, Locations, Schools
   - Booksellers, Books, Dropdowns

4. Management
   - PM Schedule, PM Calendar, Feedback

5. Expense Management
   - Reports, Policies, Analytics
```

---

#### MobileNav.tsx
**Purpose:** Mobile-first navigation for salesman app

**Features:**
- **Bottom Tab Bar:** Sticky footer with 5 main tabs (Dashboard, Masters, Add Visit FAB, Attendance, TA/DA)
- **Drawer Navigation:** Side slide-out menu for secondary pages
- Active state highlighting
- Icon-based navigation

---

### Form Components (7 files - Visit Form)

#### 1. StepSchoolSelection.tsx
- City & School dropdown
- "Supply Through" selection (Direct/Book Seller)
- Auto-display school details

#### 2. StepContactPerson.tsx
- Multi-select existing contacts
- Add new contact inline (Name, Designation, Phone, Email)

#### 3. StepPurpose.tsx
- Multi-select visit purposes (13+ options)
- Custom "Other" purpose option

#### 4. StepJointWorking.tsx
- Joint Working toggle
- Manager/Salesman selection
- Manager type selection

#### 5. StepSpecimenAllocation.tsx
- Specimens Given/Returned table
- Quantity, MRP, Cost tracking
- Total cost calculation

#### 6. StepFeedback.tsx
- Feedback category (7 types)
- Comments/suggestions

#### 7. StepNextVisit.tsx
- Next visit date picker
- Purpose & notes

---

## 6. TypeScript Interfaces

Located in `/src/types/index.ts`

### Core Entities

#### School
```typescript
interface School {
  id: string
  name: string
  city: string
  state: string
  board: string  // CBSE, ICSE, State Board, IB, IGCSE, NIOS
  strength: {
    primary: number
    secondary: number
    seniorSecondary: number
    total: number
  }
  address: string
  phone: string
  email: string
  assignedTo: string  // Salesman ID
  businessHistory: {
    year: string
    revenue: number
    ordersCount: number
  }[]
  prescribedBooks: {
    subject: string
    class: string
    bookName: string
    publisher: string
    status: string
  }[]
  salesPlan: {
    targetRevenue: number
    subjects: string[]
    expectedConversion: number
  }
  contacts: string[]  // Contact person IDs
}
```

#### Salesman
```typescript
interface Salesman {
  id: string
  name: string
  email: string
  phone: string
  region: string
  state: string
  cities: string[]
  specimenBudget: number
  specimenUsed: number
  salesTarget: number
  salesAchieved: number
  joinedDate: string
  managerId: string
  status: string  // Active, Inactive, On Leave
}
```

#### BookSeller
```typescript
interface BookSeller {
  id: string
  shopName: string
  ownerName: string
  city: string
  address: string
  phone: string
  email: string
  gstNumber: string
  currentOutstanding: number
  creditLimit: number
  lastVisitDate: string
  assignedTo: string
  businessHistory: {
    year: string
    revenue: number
    ordersCount: number
  }[]
  paymentHistory: {
    date: string
    amount: number
    method: string
    status: string
  }[]
}
```

#### Visit
```typescript
interface Visit {
  id: string
  type: string  // "school" | "bookseller"
  date: string
  status: string  // "completed" | "planned" | "cancelled"
  schoolId?: string
  bookSellerId?: string
  salesmanId: string
  contacts: string[]
  purposes: string[]
  jointWorking?: {
    personId: string
    personType: string
    managerType?: string
    notes: string
  }
  feedback?: {
    category: string
    comments: string
  }
  specimensGiven: {
    bookId: string
    quantity: number
    mrp: number
    cost: number
  }[]
  specimensReturned: {
    bookId: string
    quantity: number
    condition: string
    reason: string
  }[]
  totalSpecimenCost: number
  paymentCollected: number
  nextVisit?: {
    date: string
    purpose: string
    notes: string
  }
  notes: string
}
```

#### Specimen
```typescript
interface Specimen {
  id: string
  subject: string
  class: string
  bookName: string
  mrp: number
  stockAvailable: number
  allocated: {
    [salesmanId: string]: number
  }
  specimenCost: number
}
```

#### Expense
```typescript
interface Expense {
  id: string
  salesmanId: string
  date: string
  type: string  // "Travel" | "Food" | "Accommodation"
  category: string
  amount: number
  description: string
  receiptUrl?: string
  status: string  // "pending" | "approved" | "rejected"
  approvedBy?: string
  comments?: string
  policyViolation: boolean
  fraudScore: number  // 0-100
}
```

#### ExpenseReport
```typescript
interface ExpenseReport {
  id: string
  salesmanId: string
  startDate: string
  endDate: string
  expenses: string[]
  totalAmount: number
  status: string  // "draft" | "submitted" | "approved" | "rejected"
  approvedBy?: string
  comments?: string
}
```

#### TadaClaim
```typescript
interface TadaClaim {
  id: string
  salesmanId: string
  date: string
  city: string
  travelMode: string
  distance?: number
  amount: number
  attachment?: string
  visitId?: string
  status: string
  approvedBy?: string
  comments?: string
}
```

#### TourPlan
```typescript
interface TourPlan {
  id: string
  salesmanId: string
  weekStartDate: string
  weekEndDate: string
  plans: DailyPlan[]
  status: string  // "draft" | "submitted" | "approved"
  approvedBy?: string
}

interface DailyPlan {
  date: string
  visits: {
    type: string
    entityId: string
    entityName: string
    plannedTime: string
    purpose: string
  }[]
}
```

#### Manager
```typescript
interface Manager {
  id: string
  name: string
  email: string
  contactNo: string
  type: string  // "Regional" | "State" | "Zonal"
  state: string
  assignedSalesmen: string[]
  status: string
}
```

#### Book
```typescript
interface Book {
  id: string
  title: string
  class: string
  subject: string
  board: string
  author: string
  publisher: string
  mrp: number
  sellingPrice: number
  specimenPrice: number
  isbn: string
  edition: string
  stockAvailable: number
}
```

#### Attendance
```typescript
interface Attendance {
  id: string
  salesmanId: string
  date: string
  startTime: string
  endTime?: string
  startLocation: {
    city: string
    latitude: number
    longitude: number
    address: string
  }
  endLocation?: {
    city: string
    latitude: number
    longitude: number
    address: string
  }
  status: string  // "ongoing" | "completed"
  workingHours?: number
}
```

#### Notification
```typescript
interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}
```

#### ContactPerson
```typescript
interface ContactPerson {
  id: string
  schoolId: string
  name: string
  designation: string
  phone: string
  email?: string
  isPrimary: boolean
}
```

#### Dropdown Options
```typescript
interface DropdownOptions {
  cities: string[]  // 20 cities
  states: string[]  // 28 Indian states
  boards: string[]  // CBSE, ICSE, etc.
  contactRoles: string[]
  visitPurposes: string[]  // 13 purposes
  subjects: string[]  // 15 subjects
  classes: string[]  // 1-12
  managerTypes: string[]
  travelModes: string[]
  specimenConditions: string[]
  feedbackCategories: string[]
  visitStatuses: string[]
  paymentStatuses: string[]
  tadaStatuses: string[]
  complianceStatuses: string[]
}
```

---

## 7. Mock Data System

### Location: `/src/lib/mock-data/`
**Total Files:** 20 (19 JSON + 1 TypeScript)

### Key Files:
- **salesmen.json** (5 records): Vikash, Priya, Vikram, Sneha, Arjun
- **schools.json** (15+ schools): DPS, KV, DAV, etc.
- **dropdown-options.json**: All dropdown master data (20 cities, 28 states, 6 boards, 13 visit purposes, etc.)
- **visits.json** (100+ visits): Complete visit transaction history
- **expenses.json** (50+ expenses): Expense submissions
- **tada-claims.json** (30+ claims): TA/DA claims
- **tour-plans.ts**: Tour planning data
- **notifications.json** (50+): Notification queue

---

## 8. Dummy API Layer

### Location: `/src/lib/dummy-api/`
**Purpose:** Wrapper functions around JSON imports to simulate API calls

### Key Modules:
- **_db.ts**: LocalStorage integration, CRUD helpers
- **schools.ts**: getSchools, addSchool, updateSchool, deleteSchool
- **booksellers.ts**: getAllBookSellers, getBookSellersBySalesman
- **visits.ts**: getVisits, addVisit, getTodayVisits, getUpcomingVisits
- **expenses.ts**: getExpenses, addExpense, updateExpenseStatus
- **tour-plans.ts**: getTourPlans, createTourPlan, approveTourPlan
- **approvals.ts**: getPendingApprovals, approveExpense, rejectExpense

---

## 9. Visit Form Architecture

### 7-Step School Visit Form
**Location:** `/salesman/schools/add-visit`

**Steps:**
1. School Selection (City, School, Supply Through)
2. Contact Person (Select/Add contacts)
3. Purpose (Multi-select 13+ purposes)
4. Joint Working (Manager/Salesman selection)
5. Specimen Allocation (Given/Returned with cost tracking)
6. Feedback (Category & comments)
7. Next Visit (Date, Purpose, Notes)

**Form State:**
```typescript
formData: {
  city, schoolId, supplyThrough,
  contactPersons[], purposes[],
  jointWorking, specimensGiven[], specimensReturned[],
  feedbackCategory, feedbackComment,
  nextVisitDate, nextVisitPurpose
}
```

---

## 10. Admin Dashboard Features

### KPI Cards (8)
- Sales Team, Active Schools, Total Visits, Pending TA/DA
- Specimen Budget, Revenue Target, Monthly Orders, Compliance Score

### Charts
- Sales Performance (Bar Chart)
- Visit Distribution (Pie Chart)
- Specimen Budget (Line Chart)
- Team Performance (Donut Chart)

### Global Filters
- State, Visit Type, Date Range, Month

---

## 11. Salesman Mobile App Features

### Dashboard
- Sales Achievement (Donut Chart 70%)
- Today's Summary (3 visits planned)
- Recent Alerts (Priority-based)
- Next Visits (Date badges)
- Specimen Budget (Progress bar)
- Monthly Performance (Bar chart)
- Quick action buttons

### Bottom Tab Bar (5 tabs)
- Dashboard, Masters, Add Visit (FAB), Attendance, TA/DA

### Attendance
- GPS-based check-in/check-out
- Location tracking (city, lat/long, address)
- Working hours calculation

---

## 12. UI Component Library

### Shadcn UI (41 components)
**Form:** input, textarea, select, multi-select, checkbox, radio, switch, date-picker, time-picker, month-picker, date-range-picker
**Display:** card, badge, avatar, separator, skeleton, progress, alert, empty-state
**Containers:** dialog, sheet, popover, dropdown-menu, tabs, command, mobile-sheet
**Data:** table, data-grid (155KB with sorting, filtering, pagination)
**Feedback:** toast, sonner, alert-dialog, delete-confirm-dialog

---

## 13. Routing & Navigation

### Admin Routes Pattern
- `/admin/dashboard`
- `/admin/lists/*` (Schools, Booksellers, Contacts)
- `/admin/reports/*` (11 report types)
- `/admin/team/[id]/*` (15 salesman pages)
- `/admin/expenses/*`
- `/admin/settings/*`

### Salesman Routes Pattern
- `/salesman/dashboard`
- `/salesman/schools/*` (List, Profile, Add Visit)
- `/salesman/booksellers/*`
- `/salesman/attendance`
- `/salesman/expenses/*`
- `/salesman/tour-plans`

---

## 14. State Management

### Pattern: useState + LocalStorage
- User session in Context
- Component state with `useState`
- Form state with React Hook Form
- LocalStorage for persistence

---

## 15. Styling & Theming

### Tailwind CSS 4.0
- Primary color: #F47B20 (Orange)
- Chart colors: Orange, Teal, Slate, Rose, Indigo, Sky
- Mobile-first responsive design
- Dark mode support (next-themes)
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)

---

## 16. Key Features

### A. Multi-Step Visit Form
- 7 progressive steps with validation
- Specimen budget tracking
- Contact inline creation
- Conditional rendering

### B. DataGrid Component (155KB)
- Sorting, filtering, pagination
- Row selection, custom cells
- Export to Excel/CSV
- Responsive stacking

### C. Dashboard Analytics
- 8 KPI cards with trends
- Multiple chart types (Bar, Line, Pie, Donut)
- Global filters
- Real-time updates

### D. Expense Management
- Receipt upload
- Policy compliance
- Fraud score (0-100)
- Approval workflow

### E. Tour Planning
- Weekly tour plans
- Daily visit scheduling
- Calendar view
- Conflict detection

### F. Attendance System
- GPS-based check-in/out
- Working hours calculation
- Location validation

### G. Specimen Tracking
- Budget allocation
- Real-time usage tracking
- Stock management
- Cost calculation

### H. Notification System
- In-app notifications
- Badge counts
- Real-time updates
- Multiple types (Visit reminders, Approvals, etc.)

### I. Role-Based Access
- Admin: Full access, analytics, approvals
- Salesman: Limited to assigned data, personal performance

### J. Export Functionality
- Excel (XLSX), PDF, CSV
- Filtered data export
- Custom column selection

### K. Responsive Design
- Mobile-first for salesman
- Desktop-optimized for admin
- Adaptive layouts
- Touch-friendly controls

---

## Conclusion

**Statistics:**
- **167+ files** across codebase
- **79 pages** (52 admin + 24 salesman + 3 shared)
- **56 components** (41 UI + 15 custom)
- **20 mock data files** with 500+ records
- **50+ TypeScript interfaces**
- **11 dummy API modules**

**Technology Stack:**
- Next.js 16.0.10 with App Router
- React 19.2.0
- Tailwind CSS 4.0
- Shadcn UI (new-york style)
- React Hook Form + Zod
- Recharts
- Mock JSON + LocalStorage

This documentation represents the **complete current state** of the GoodLuck Frontend as of March 11, 2026 (dev_priyanshu branch).

---
