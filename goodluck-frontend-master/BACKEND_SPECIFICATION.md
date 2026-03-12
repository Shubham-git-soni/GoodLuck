# GoodLuck DVR - Backend Specification

**Generated:** March 11, 2026
**Architecture:** Clean Architecture + CQRS Pattern
**Framework:** ASP.NET Core (.NET 10) + C# 14
**Database:** Microsoft SQL Server
**ORM:** Dapper + ADO.NET

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [API Endpoints (100+)](#api-endpoints)
3. [Database Schema](#database-schema)
4. [CQRS Structure](#cqrs-structure)
5. [DTOs & Validation](#dtos--validation)
6. [SignalR Hubs](#signalr-hubs)
7. [Push Notifications](#push-notifications)
8. [Background Jobs](#background-jobs)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Storage](#file-storage)

---

## Technology Stack

Following the **Indus DVR Backend Architecture Specification**:

| Layer | Technology |
|-------|------------|
| **API Framework** | ASP.NET Core (.NET 10) |
| **Language** | C# 14 |
| **Architecture** | Clean Architecture + CQRS |
| **Data Access** | Dapper + ADO.NET |
| **Database** | Microsoft SQL Server |
| **Mediator** | MediatR |
| **Validation** | FluentValidation |
| **Real-time** | SignalR |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Migrations** | DbUp (NOT Entity Framework) |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **Authorization** | Role-Based Access Control (RBAC) |
| **Background Jobs** | Hangfire |
| **Caching** | Redis (Future) |
| **File Storage** | Azure Blob Storage / AWS S3 |
| **Logging** | Serilog |

---

## Project Structure

```
backend/
│
├── src/
│   ├── DVR.API/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Hubs/
│   │   │   ├── NotificationHub.cs
│   │   │   └── DashboardHub.cs
│   │   └── Extensions/
│   │
│   ├── DVR.Application/
│   │   ├── Features/
│   │   │   ├── Authentication/
│   │   │   ├── Schools/
│   │   │   ├── Salesmen/
│   │   │   ├── Booksellers/
│   │   │   ├── Visits/
│   │   │   ├── Expenses/
│   │   │   ├── TadaClaims/
│   │   │   ├── Notifications/
│   │   │   ├── Reports/
│   │   │   ├── Dashboard/
│   │   │   ├── Attendance/
│   │   │   ├── TourPlans/
│   │   │   ├── Managers/
│   │   │   ├── Contacts/
│   │   │   ├── Books/
│   │   │   ├── Specimens/
│   │   │   └── Settings/
│   │   │
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   └── Interfaces/
│   │
│   ├── DVR.Domain/
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── ValueObjects/
│   │
│   ├── DVR.Infrastructure/
│   │   ├── Data/
│   │   │   ├── IDbConnectionFactory.cs
│   │   │   └── SqlConnectionFactory.cs
│   │   ├── Repositories/
│   │   ├── Services/
│   │   │   ├── NotificationService.cs
│   │   │   ├── FcmService.cs
│   │   │   ├── FileStorageService.cs
│   │   │   └── OcrService.cs
│   │   └── Integrations/
│   │
│   └── DVR.Persistence/
│       ├── SQL/
│       ├── StoredProcedures/
│       └── Scripts/
│
└── tests/
    ├── DVR.Application.Tests/
    └── DVR.API.Tests/
```

---

## API Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 150,
    "totalPages": 8
  }
}
```

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| **200 OK** | Successful GET, PUT, PATCH |
| **201 Created** | Successful POST (resource created) |
| **204 No Content** | Successful DELETE |
| **400 Bad Request** | Validation errors |
| **401 Unauthorized** | Missing or invalid token |
| **403 Forbidden** | Insufficient permissions |
| **404 Not Found** | Resource not found |
| **409 Conflict** | Duplicate resource |
| **500 Internal Server Error** | Server error |


---

## ✅ Verified Frontend Modules (Source of Truth)

> [!IMPORTANT]
> This section is derived directly from `AdminSidebar.tsx` and `MobileNav.tsx` — the **actual running navigation code**.
> Only modules listed here are visible in the app. Backend APIs must cover ONLY these modules.

---

### 🖥️ Admin Portal — Exact Sidebar Structure

#### OVERVIEW
| Label | Route | Backend Module Needed |
|---|---|---|
| Dashboard | `/admin/dashboard` | `DashboardController` |
| Approvals | `/admin/approvals` | `ApprovalsController` |
| Notifications | `/admin/notifications` | `NotificationsController` |

#### REPORTS
| Label | Route | Backend Module Needed |
|---|---|---|
| Attendance Report | `/admin/reports/attendance` | `Reports/Attendance` |
| Visit Analytics | `/admin/reports/visits` | `Reports/Visits` |
| Year-wise Report | `/admin/analytics/year-comparison` | `Reports/YearComparison` |
| School Analytics | `/admin/analytics/schools` | `Reports/SchoolAnalytics` |
| Prescribed Books | `/admin/reports/prescribed-books` | `Reports/PrescribedBooks` |
| Specimen Tracking | `/admin/reports/specimen` | `Reports/SpecimenTracking` |

> [!NOTE]
> Reports NOT in sidebar (removed from scope): compliance, loyalty, gap-analysis, daily, date-wise, performance/[id].
> These pages exist in the codebase but are NOT exposed in the navigation — do NOT build backend APIs for them in v1.

#### MASTERS
| Label | Route | Backend Module Needed |
|---|---|---|
| User Master | `/admin/users` | `UsersController` |
| Location Master | `/admin/masters/locations` | `LocationsController` (States → Cities → Stations) |
| Schools | `/admin/lists/schools` | `SchoolsController` |
| Book Sellers | `/admin/lists/booksellers` | `BookSellersController` |
| Books | `/admin/books` | `BooksController` |
| Dropdown | `/admin/settings/dropdowns` | `DropdownsController` |

> [!NOTE]
> NOT in sidebar (removed from scope): `/admin/lists/contacts`, `/admin/lists/qbs`, `/admin/erp`, `/admin/grid-demo`,
> `/admin/settings/white-label`, `/admin/tada` (standalone), `/admin/tour-plans` (standalone).

#### MANAGEMENT
| Label | Route | Backend Module Needed |
|---|---|---|
| PM Schedule | `/admin/pm-schedule` | `PmSchedulesController` |
| PM Calendar | `/admin/pm-calendar` | `PmSchedulesController` (calendar view) |
| Feedback Manager | `/admin/feedback` | `FeedbackController` |

#### EXPENSE MANAGEMENT
| Label | Route | Backend Module Needed |
|---|---|---|
| Expenses Reports | `/admin/expenses` | `ExpensesController` |
| Expense Policies | `/admin/expenses/policy` | `ExpensePoliciesController` |
| Expense Analytics | `/admin/expenses/reports` | `ExpensesController` (analytics endpoint) |

#### Admin Team Pages (accessible via `/admin/team`)
> Not in top-level sidebar but accessible from team list.

| Route | Purpose |
|---|---|
| `/admin/team` | Salesman team list |
| `/admin/team/[id]` | Salesman Kundli dashboard |
| `/admin/team/[id]/school-list` | Schools assigned |
| `/admin/team/[id]/bookseller-list` | Booksellers assigned |
| `/admin/team/[id]/school-visit-report` | Visit report |
| `/admin/team/[id]/bookseller-visit-report` | Bookseller visit report |
| `/admin/team/[id]/attendance-report` | Attendance |
| `/admin/team/[id]/school-sales-plan` | Sales plan |
| `/admin/team/[id]/summary-report` | Summary |
| `/admin/team/[id]/ip-report` | IP/Prescribed books |
| `/admin/team/[id]/manual-report` | Manual report |
| `/admin/team/[id]/merge-report` | Merge report |
| `/admin/team/[id]/multiple-visit-report` | Multi-visit |
| `/admin/team/[id]/sales-plan-visit` | Plan vs actual |
| `/admin/team/[id]/drop-list` | Dropped schools |
| `/admin/team/[id]/edit` | Edit salesman |

---

### 📱 Salesman App — Exact Nav Structure

#### Main Items (no group)
| Label | Route | Backend Module |
|---|---|---|
| Dashboard | `/salesman/dashboard` | `DashboardController` (salesman view) |
| Attendance | `/salesman/attendance` | `AttendanceController` |
| Today's Visits | `/salesman/today-visits` | `TourPlansController` (today filter) |
| Tour Plans | `/salesman/tour-plans` | `TourPlansController` |
| Schedule Visits | `/salesman/next-visits` | `TourPlansController` (upcoming) |
| Visit History | `/salesman/visit-history` | `VisitsController` |

#### MASTERS
| Label | Route | Backend Module |
|---|---|---|
| My Schools | `/salesman/schools` | `SchoolsController` (filtered by salesmanId) |
| Book Sellers | `/salesman/booksellers` | `BookSellersController` (filtered by salesmanId) |

#### EXPENSES
| Label | Route | Backend Module |
|---|---|---|
| My Expenses | `/salesman/expenses` | `ExpensesController` |
| Add Expense | `/salesman/expenses/add` | `ExpensesController` (POST) |
| Create Report | `/salesman/expenses/create-report` | `ExpenseReportsController` |

#### OTHER
| Label | Route | Backend Module |
|---|---|---|
| TA/DA Claims | `/salesman/tada` | `TadaController` |
| Notifications | `/salesman/notifications` | `NotificationsController` (salesman view) |

#### Salesman Sub-pages (reachable from school/bookseller cards)
| Route | Purpose |
|---|---|
| `/salesman/schools/[id]` | School Kundli |
| `/salesman/schools/add-visit` | 7-step school visit form |
| `/salesman/schools/replacement` | Specimen replacement |
| `/salesman/booksellers/[id]` | Bookseller Kundli |
| `/salesman/booksellers/add-visit` | Bookseller visit form |
| `/salesman/tour-plan` | Create new tour plan |

---

### 📊 Complete Backend Controller List (Verified)

Based on the sidebar analysis, these are the **ONLY** controllers needed in v1:

| Controller | Handles |
|---|---|
| `AuthController` | Login, Refresh, Logout, ChangePassword, FcmDevice |
| `DashboardController` | Admin + Salesman dashboard stats |
| `ApprovalsController` | Master approvals, Tour plan approvals, TA/DA approvals |
| `NotificationsController` | Admin notifications + Salesman notifications |
| `ReportsController` | Attendance, Visits, YearComparison, SchoolAnalytics, PrescribedBooks, SpecimenTracking |
| `UsersController` | User CRUD (User Master) |
| `LocationsController` | States, Cities, Stations CRUD |
| `SchoolsController` | School CRUD + Salesman-filtered list + School Kundli |
| `BookSellersController` | BookSeller CRUD + Salesman-filtered list + Kundli |
| `BooksController` | Book catalog CRUD |
| `DropdownsController` | Dynamic dropdown options CRUD |
| `PmSchedulesController` | PM schedules + calendar view |
| `FeedbackController` | Feedback inbox + status updates |
| `ExpensesController` | Expense CRUD + analytics |
| `ExpensePoliciesController` | Expense policies CRUD |
| `ExpenseReportsController` | Expense report creation + approval |
| `SalesmenController` | Salesman CRUD + salesman kundli + team reports |
| `VisitsController` | Visit log (school + bookseller) + history |
| `TourPlansController` | Tour plan CRUD + approval + today/upcoming |
| `AttendanceController` | Check-in/out + reports |
| `TadaController` | TA/DA claims CRUD + approval |
| `ContactPersonsController` | School contacts CRUD |
| `SpecimensController` | Specimen inventory |

---

## Roles & Permissions (RBAC)

> [!IMPORTANT]
> System has exactly **3 roles**. BUT permissions are **dynamic per-user per-module** — not hardcoded.
> An Admin configures exactly which modules a Manager/Salesman can see, and what they can do in each module.
> This is implemented in the **User Master → Authorization tab**.

---

### Role Definitions

| Role | Enum | Portal | Base Access |
|---|---|---|---|
| `Admin` | `1` | Admin Web | **Full access** — no module restrictions, no permission table checked |
| `Manager` | `2` | Admin Web | **Module-restricted** — access defined in `UserModulePermissions` table |
| `Salesman` | `3` | Salesman App | **Module-restricted** — access defined in `UserModulePermissions` table |

> [!NOTE]
> **Admin role bypasses all module permission checks** — they always see everything.
> For Manager and Salesman, every API call checks their `UserModulePermissions` record.

---

### Database Tables

```sql
-- Users table
Users (
  Id            UNIQUEIDENTIFIER PRIMARY KEY,
  Name          NVARCHAR(100),
  Username      NVARCHAR(100) UNIQUE,
  Email         NVARCHAR(150) UNIQUE,
  Phone         NVARCHAR(20),
  PasswordHash  NVARCHAR(MAX),
  PhotoUrl      NVARCHAR(500) NULL,
  Role          TINYINT NOT NULL,     -- 1=Admin, 2=Manager, 3=Salesman
  SalesmanId    UNIQUEIDENTIFIER NULL, -- linked when Role=3
  ManagerId     UNIQUEIDENTIFIER NULL, -- linked when Role=2
  State         NVARCHAR(100) NULL,
  City          NVARCHAR(100) NULL,
  Address       NVARCHAR(500) NULL,
  IsActive      BIT DEFAULT 1,
  CreatedAt     DATETIME2,
  ModifiedAt    DATETIME2,
  IsDeleted     BIT DEFAULT 0
)

-- Per-user, per-module permissions (only for Manager & Salesman)
UserModulePermissions (
  Id            UNIQUEIDENTIFIER PRIMARY KEY,
  UserId        UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
  Module        NVARCHAR(100) NOT NULL,   -- e.g. "Schools", "Reports"
  SubModule     NVARCHAR(100) NOT NULL,   -- e.g. "School List", "Attendance Report"
  PermLevel     TINYINT NOT NULL,         -- 0=None, 1=View, 2=User, 3=Admin
  CanView       BIT DEFAULT 0,
  CanSave       BIT DEFAULT 0,
  CanEdit       BIT DEFAULT 0,
  CanDelete     BIT DEFAULT 0,
  CanExport     BIT DEFAULT 0,
  CanPrint      BIT DEFAULT 0,
  CreatedAt     DATETIME2,
  UNIQUE(UserId, Module, SubModule)
)
```

---

### Module List (18 sub-modules)

These are the **exact 18 module/sub-module pairs** defined in the User Master Authorization tab:

| # | Module | Sub-Module |
|---|---|---|
| 1 | Dashboard | Overview |
| 2 | Schools | School List |
| 3 | Schools | Contact Persons |
| 4 | Book Sellers | Book Seller List |
| 5 | Books | Books Master |
| 6 | Visits | Visit Reports |
| 7 | Specimen | Specimen Tracking |
| 8 | TA/DA | TA/DA Claims |
| 9 | Tour Plan | Tour Plans |
| 10 | Feedback | Feedback Manager |
| 11 | Reports | Attendance Report |
| 12 | Reports | Visit Analytics |
| 13 | Reports | Year-wise Report |
| 14 | Year Comparison | Year Comparison Report |
| 15 | Expenses | Expense Reports |
| 16 | Expenses | Expense Policies |
| 17 | Analytics | School Analytics |
| 18 | Analytics | Prescribed Books |

---

### Permission Levels

| Level | Value | Meaning |
|---|---|---|
| `None` | `0` | Module completely hidden from user |
| `View` | `1` | Can open/read only — no create/edit/delete |
| `User` | `2` | Normal user — canView + canSave + canEdit (no delete) |
| `Admin` | `3` | Full access — all 6 flags enabled |

### Permission Flags (per sub-module)

| Flag | Meaning |
|---|---|
| `CanView` | Can open/see the module |
| `CanSave` | Can add/create new records |
| `CanEdit` | Can modify existing records |
| `CanDelete` | Can delete records |
| `CanExport` | Can export data (Excel/CSV) |
| `CanPrint` | Can print reports |

---

### How It Works in Backend

```csharp
// 1. Admin — bypass all permission checks
if (currentUser.Role == Role.Admin)
    return true; // full access always

// 2. Manager scope enforcement (team-only data filter)
if (currentUser.Role == Role.Manager)
    query = query.Where(x => x.Salesman.ManagerId == currentUser.ManagerId);

// 3. Module permission check for Manager/Salesman
var perm = await _db.UserModulePermissions
    .FirstOrDefaultAsync(p =>
        p.UserId == currentUser.Id &&
        p.Module == requiredModule &&
        p.SubModule == requiredSubModule);

if (perm == null || perm.PermLevel == PermLevel.None)
    return Forbid(); // 403

// Then check specific flag
if (requiresEdit && !perm.CanEdit)
    return Forbid();
```

---

### API Endpoint for User Module Permissions

```
GET    /users/{id}/permissions              ← Get all 18 module-perms for a user
PUT    /users/{id}/permissions              ← Bulk update all 18 module-perms (from Authorization tab save)
```

**PUT Request Body:**
```json
{
  "permissions": [
    {
      "module": "Schools",
      "subModule": "School List",
      "permLevel": 2,
      "canView": true,
      "canSave": true,
      "canEdit": true,
      "canDelete": false,
      "canExport": true,
      "canPrint": false
    }
    // ... all 18 rows
  ]
}
```

---



# API Endpoints

Base URL: `https://api.goodluck.com/v1`

---

## 1. Authentication & Authorization

### 1.1 Login (Salesman/Admin)
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "rajesh@goodluck.com",
  "password": "password123",
  "userType": "salesman" // or "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "SM001",
      "name": "Rajesh Kumar",
      "email": "rajesh@goodluck.com",
      "role": "salesman",
      "permissions": ["view_schools", "add_visit", "submit_expense"]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 1800 // 30 minutes
  }
}
```

**Validation Rules:**
- Email: Required, valid email format
- Password: Required, min 6 characters
- UserType: Required, enum (salesman, admin)

---

### 1.2 Refresh Token
```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 1800
  }
}
```

---

### 1.3 Logout
```
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.4 Change Password
```
POST /auth/change-password
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Validation Rules:**
- CurrentPassword: Required
- NewPassword: Required, min 8 characters, must contain uppercase, lowercase, number
- ConfirmPassword: Required, must match newPassword

---

### 1.5 Forgot Password
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "rajesh@goodluck.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.6 Reset Password
```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.7 Get Current User
```
GET /auth/me
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "SM001",
    "name": "Rajesh Kumar",
    "email": "rajesh@goodluck.com",
    "phone": "9876543210",
    "role": "salesman",
    "region": "North Delhi",
    "managerId": "M001",
    "permissions": ["view_schools", "add_visit", "submit_expense"]
  }
}
```

---

### 1.8 Register Device Token (FCM)
```
POST /auth/register-device
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "deviceToken": "fcm-device-token-here",
  "deviceType": "android" // or "ios", "web"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

---

### 1.9 Unregister Device Token
```
DELETE /auth/unregister-device
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "deviceToken": "fcm-device-token-here"
}
```

**Response (204):**
```json
{
  "success": true,
  "message": "Device unregistered successfully"
}
```

---

## 2. Dashboard APIs

### 2.1 Admin Dashboard Stats
```
GET /dashboard/admin
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSales": 45000000,
      "targetSales": 60000000,
      "salesPercentage": 75,
      "totalVisits": 1250,
      "targetVisits": 1500,
      "visitPercentage": 83.33,
      "specimenUsed": 320000,
      "specimenBudget": 500000,
      "specimenPercentage": 64,
      "pendingApprovals": 15,
      "activeSalesmen": 45
    },
    "salesTrend": [
      { "month": "Jan", "sales": 4200000, "target": 5000000 },
      { "month": "Feb", "sales": 4500000, "target": 5000000 },
      { "month": "Mar", "sales": 4800000, "target": 5000000 }
    ],
    "visitAnalytics": {
      "schoolVisits": 850,
      "booksellerVisits": 400,
      "followUps": 320,
      "newAcquisitions": 80
    },
    "topPerformers": [
      {
        "salesmanId": "SM001",
        "name": "Rajesh Kumar",
        "sales": 5200000,
        "target": 5000000,
        "percentage": 104
      }
    ],
    "recentActivity": [
      {
        "id": "V1234",
        "type": "visit",
        "salesmanName": "Rajesh Kumar",
        "schoolName": "DPS Delhi",
        "timestamp": "2026-03-11T10:30:00Z"
      }
    ]
  }
}
```

---

### 2.2 Salesman Dashboard Stats
```
GET /dashboard/salesman
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "salesAchieved": 3200000,
      "salesTarget": 5000000,
      "salesPercentage": 64,
      "visitsCompleted": 98,
      "visitsTarget": 150,
      "visitPercentage": 65.33,
      "specimenUsed": 32000,
      "specimenBudget": 50000,
      "specimenPercentage": 64,
      "todayVisits": 5,
      "pendingExpenses": 3
    },
    "todaySchedule": [
      {
        "visitId": "V5001",
        "type": "school",
        "schoolId": "S001",
        "schoolName": "DPS Delhi",
        "time": "10:00 AM",
        "purpose": "Follow-up",
        "status": "pending"
      }
    ],
    "upcomingVisits": [
      {
        "date": "2026-03-12",
        "count": 4,
        "schools": 3,
        "booksellers": 1
      }
    ],
    "alerts": [
      {
        "type": "low_specimen_budget",
        "message": "Specimen budget running low (36% remaining)",
        "severity": "warning"
      },
      {
        "type": "pending_expense",
        "message": "3 expenses pending submission",
        "severity": "info"
      }
    ]
  }
}
```

---

## 3. School APIs

### 3.1 Get All Schools (Paginated)
```
GET /schools?page=1&pageSize=20&search=&city=&board=&category=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `search` (optional): Search by school name
- `city` (optional): Filter by city
- `board` (optional): Filter by board (CBSE, ICSE, State Board)
- `category` (optional): Filter by category (A+, A, B, C)
- `state` (optional): Filter by state

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "S001",
      "name": "Delhi Public School",
      "city": "Delhi",
      "state": "Delhi",
      "board": "CBSE",
      "strength": 2500,
      "category": "A+",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "totalBusiness": 450000,
      "lastVisitDate": "2026-03-08",
      "nextVisitDate": "2026-03-15"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 150,
    "totalPages": 8
  }
}
```

---

### 3.2 Get School by ID
```
GET /schools/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "S001",
    "name": "Delhi Public School",
    "address": "Mathura Road, Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "board": "CBSE",
    "strength": 2500,
    "category": "A+",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "contacts": [
      {
        "id": "C001",
        "name": "Dr. Sharma",
        "designation": "Principal",
        "phone": "9876543210",
        "email": "sharma@dps.com",
        "isPrimary": true
      }
    ],
    "prescribedBooks": [
      {
        "bookId": "B001",
        "bookName": "Mathematics Class 10",
        "subject": "Mathematics",
        "class": "10",
        "quantity": 200,
        "mrp": 450
      }
    ],
    "businessHistory": [
      {
        "year": "2023-24",
        "totalBusiness": 450000,
        "specimens": 120,
        "discount": 25
      }
    ],
    "salesPlan": {
      "target": 500000,
      "achieved": 320000,
      "percentage": 64,
      "specimens": 150,
      "specimensGiven": 95,
      "visits": 12,
      "visitsCompleted": 8
    }
  }
}
```

---

### 3.3 Create School
```
POST /schools
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "name": "Delhi Public School",
  "address": "Mathura Road, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "board": "CBSE",
  "strength": 2500,
  "category": "A+",
  "salesmanId": "SM001",
  "contacts": [
    {
      "name": "Dr. Sharma",
      "designation": "Principal",
      "phone": "9876543210",
      "email": "sharma@dps.com",
      "isPrimary": true
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "id": "S001"
  }
}
```

**Validation Rules:**
- Name: Required, max 200 characters
- Address: Required, max 500 characters
- City: Required
- State: Required
- Board: Required, enum (CBSE, ICSE, State Board, IB)
- Strength: Required, must be > 0
- Category: Required, enum (A+, A, B, C)
- SalesmanId: Required, must exist
- Contacts: At least one contact required

---

### 3.4 Update School
```
PUT /schools/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "name": "Delhi Public School",
  "address": "Mathura Road, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "board": "CBSE",
  "strength": 2600,
  "category": "A+",
  "salesmanId": "SM001"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "School updated successfully"
}
```

---

### 3.5 Delete School
```
DELETE /schools/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (204):**
```json
{
  "success": true,
  "message": "School deleted successfully"
}
```

---

### 3.6 Get My Schools (Salesman)
```
GET /schools/my-schools
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "S001",
      "name": "Delhi Public School",
      "city": "Delhi",
      "board": "CBSE",
      "strength": 2500,
      "category": "A+",
      "lastVisitDate": "2026-03-08",
      "nextVisitDate": "2026-03-15",
      "totalBusiness": 450000,
      "target": 500000
    }
  ]
}
```

---

### 3.7 Add Contact Person to School
```
POST /schools/{schoolId}/contacts
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Request Body:**
```json
{
  "name": "Mr. Verma",
  "designation": "Vice Principal",
  "phone": "9876543211",
  "email": "verma@dps.com",
  "isPrimary": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact person added successfully",
  "data": {
    "id": "C002"
  }
}
```

---

### 3.8 Update Contact Person
```
PUT /schools/{schoolId}/contacts/{contactId}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Request Body:**
```json
{
  "name": "Mr. Verma",
  "designation": "Vice Principal",
  "phone": "9876543211",
  "email": "verma@dps.com",
  "isPrimary": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contact person updated successfully"
}
```

---

### 3.9 Delete Contact Person
```
DELETE /schools/{schoolId}/contacts/{contactId}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (204):**
```json
{
  "success": true,
  "message": "Contact person deleted successfully"
}
```

---

### 3.10 Get School Prescribed Books
```
GET /schools/{schoolId}/prescribed-books
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "bookId": "B001",
      "bookName": "Mathematics Class 10",
      "subject": "Mathematics",
      "class": "10",
      "quantity": 200,
      "mrp": 450,
      "prescribedYear": "2024-25"
    }
  ]
}
```

---

### 3.11 Update School Prescribed Books
```
PUT /schools/{schoolId}/prescribed-books
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "books": [
    {
      "bookId": "B001",
      "class": "10",
      "quantity": 200
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Prescribed books updated successfully"
}
```

---

## 4. Salesman APIs

### 4.1 Get All Salesmen (Paginated)
```
GET /salesmen?page=1&pageSize=20&search=&region=&managerId=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `search` (optional): Search by name
- `region` (optional): Filter by region
- `managerId` (optional): Filter by manager

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "SM001",
      "name": "Rajesh Kumar",
      "email": "rajesh@goodluck.com",
      "phone": "9876543210",
      "region": "North Delhi",
      "city": "Delhi",
      "managerId": "M001",
      "managerName": "Mr. Singh",
      "targets": {
        "sales": 5000000,
        "visits": 150,
        "specimens": 200
      },
      "achievement": {
        "sales": 3200000,
        "salesPercentage": 64,
        "visits": 98,
        "visitPercentage": 65.33,
        "specimens": 145,
        "specimenPercentage": 72.5
      },
      "joiningDate": "2020-01-15",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 45,
    "totalPages": 3
  }
}
```

---

### 4.2 Get Salesman by ID
```
GET /salesmen/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "SM001",
    "name": "Rajesh Kumar",
    "email": "rajesh@goodluck.com",
    "phone": "9876543210",
    "region": "North Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "address": "Karol Bagh, Delhi",
    "joiningDate": "2020-01-15",
    "managerId": "M001",
    "managerName": "Mr. Singh",
    "targets": {
      "sales": 5000000,
      "visits": 150,
      "specimens": 200
    },
    "achievement": {
      "sales": 3200000,
      "visits": 98,
      "specimens": 145
    },
    "budget": {
      "specimen": 50000,
      "used": 32000,
      "remaining": 18000
    },
    "assignedSchools": 25,
    "assignedBooksellers": 10,
    "status": "active"
  }
}
```

---

### 4.3 Create Salesman
```
POST /salesmen
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@goodluck.com",
  "phone": "9876543210",
  "password": "password123",
  "region": "North Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "address": "Karol Bagh, Delhi",
  "managerId": "M001",
  "targets": {
    "sales": 5000000,
    "visits": 150,
    "specimens": 200
  },
  "specimenBudget": 50000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Salesman created successfully",
  "data": {
    "id": "SM001"
  }
}
```

**Validation Rules:**
- Name: Required, max 100 characters
- Email: Required, valid email, unique
- Phone: Required, valid 10-digit number
- Password: Required, min 8 characters
- Region: Required
- City: Required
- State: Required
- ManagerId: Required, must exist
- Targets: Required, all values must be > 0
- SpecimenBudget: Required, must be > 0

---

### 4.4 Update Salesman
```
PUT /salesmen/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "phone": "9876543210",
  "region": "North Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "address": "Karol Bagh, Delhi",
  "managerId": "M001",
  "targets": {
    "sales": 5500000,
    "visits": 160,
    "specimens": 220
  },
  "specimenBudget": 55000,
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Salesman updated successfully"
}
```

---

### 4.5 Delete Salesman
```
DELETE /salesmen/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (204):**
```json
{
  "success": true,
  "message": "Salesman deleted successfully"
}
```

---

### 4.6 Get Salesman Performance (Kundli)
```
GET /salesmen/{id}/performance
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "region": "North Delhi",
    "sales": {
      "target": 5000000,
      "achieved": 3200000,
      "percentage": 64,
      "monthlyTrend": [
        { "month": "Jan", "sales": 1100000 },
        { "month": "Feb", "sales": 1050000 },
        { "month": "Mar", "sales": 1050000 }
      ]
    },
    "visits": {
      "target": 150,
      "completed": 98,
      "percentage": 65.33,
      "schoolVisits": 68,
      "booksellerVisits": 30
    },
    "specimens": {
      "budget": 50000,
      "used": 32000,
      "remaining": 18000,
      "percentage": 64
    },
    "compliance": {
      "visitCompliance": 85,
      "expenseCompliance": 92,
      "specimenCompliance": 88
    },
    "schools": 25,
    "booksellers": 10
  }
}
```

---

## 5. Bookseller APIs

### 5.1 Get All Booksellers (Paginated)
```
GET /booksellers?page=1&pageSize=20&search=&city=&salesmanId=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `search` (optional): Search by name
- `city` (optional): Filter by city
- `salesmanId` (optional): Filter by assigned salesman

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "BS001",
      "name": "Sharma Book Depot",
      "city": "Delhi",
      "state": "Delhi",
      "phone": "9876543210",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "creditLimit": 500000,
      "creditUsed": 320000,
      "creditAvailable": 180000,
      "totalBusiness": 2500000,
      "lastVisitDate": "2026-03-05",
      "nextVisitDate": "2026-03-20"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 85,
    "totalPages": 5
  }
}
```

---

### 5.2 Get Bookseller by ID
```
GET /booksellers/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "BS001",
    "name": "Sharma Book Depot",
    "ownerName": "Mr. Sharma",
    "address": "Connaught Place, Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "9876543210",
    "email": "sharma@bookdepot.com",
    "gstNumber": "07AAACH1234A1Z5",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "creditLimit": 500000,
    "creditUsed": 320000,
    "creditAvailable": 180000,
    "paymentTerms": "Net 30",
    "businessHistory": [
      {
        "year": "2023-24",
        "totalBusiness": 2500000,
        "outstanding": 180000,
        "paymentDelay": 5
      }
    ],
    "lastVisitDate": "2026-03-05",
    "nextVisitDate": "2026-03-20"
  }
}
```

---

### 5.3 Create Bookseller
```
POST /booksellers
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "name": "Sharma Book Depot",
  "ownerName": "Mr. Sharma",
  "address": "Connaught Place, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "phone": "9876543210",
  "email": "sharma@bookdepot.com",
  "gstNumber": "07AAACH1234A1Z5",
  "salesmanId": "SM001",
  "creditLimit": 500000,
  "paymentTerms": "Net 30"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bookseller created successfully",
  "data": {
    "id": "BS001"
  }
}
```

**Validation Rules:**
- Name: Required, max 200 characters
- OwnerName: Required, max 100 characters
- Address: Required
- City: Required
- State: Required
- Phone: Required, valid 10-digit number
- Email: Valid email format (optional)
- GstNumber: Valid GST format (optional)
- SalesmanId: Required, must exist
- CreditLimit: Required, must be > 0
- PaymentTerms: Required

---

### 5.4 Update Bookseller
```
PUT /booksellers/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "name": "Sharma Book Depot",
  "ownerName": "Mr. Sharma",
  "address": "Connaught Place, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "phone": "9876543210",
  "email": "sharma@bookdepot.com",
  "creditLimit": 600000,
  "paymentTerms": "Net 30"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bookseller updated successfully"
}
```

---

### 5.5 Delete Bookseller
```
DELETE /booksellers/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (204):**
```json
{
  "success": true,
  "message": "Bookseller deleted successfully"
}
```

---

### 5.6 Get My Booksellers (Salesman)
```
GET /booksellers/my-booksellers
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "BS001",
      "name": "Sharma Book Depot",
      "city": "Delhi",
      "ownerName": "Mr. Sharma",
      "phone": "9876543210",
      "creditLimit": 500000,
      "creditUsed": 320000,
      "lastVisitDate": "2026-03-05",
      "nextVisitDate": "2026-03-20"
    }
  ]
}
```

---

## 6. Visit APIs

### 6.1 Get All Visits (Paginated)
```
GET /visits?page=1&pageSize=20&type=&salesmanId=&schoolId=&booksellerId=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `type` (optional): Filter by type (school, bookseller)
- `salesmanId` (optional): Filter by salesman
- `schoolId` (optional): Filter by school
- `booksellerId` (optional): Filter by bookseller
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "V001",
      "type": "school",
      "date": "2026-03-08",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "schoolId": "S001",
      "schoolName": "Delhi Public School",
      "purposes": ["Follow-up", "Specimen Submission"],
      "specimensGiven": 5,
      "specimensReturned": 3,
      "totalCost": 1125,
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 250,
    "totalPages": 13
  }
}
```

---

### 6.2 Get Visit by ID
```
GET /visits/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "V001",
    "type": "school",
    "date": "2026-03-08T10:30:00Z",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "schoolId": "S001",
    "schoolName": "Delhi Public School",
    "contactPersons": [
      {
        "id": "C001",
        "name": "Dr. Sharma",
        "designation": "Principal"
      }
    ],
    "purposes": ["Follow-up", "Specimen Submission"],
    "specimensGiven": [
      {
        "bookId": "B001",
        "bookName": "Mathematics Class 10",
        "quantity": 5,
        "mrp": 450,
        "cost": 1125
      }
    ],
    "specimensReturned": [
      {
        "bookId": "B002",
        "bookName": "Science Class 9",
        "quantity": 3,
        "condition": "Good",
        "reason": "Not Prescribed"
      }
    ],
    "feedback": [
      {
        "bookId": "B001",
        "rating": 4,
        "comments": "Good content, students like it"
      }
    ],
    "jointWorking": {
      "managerId": "M001",
      "managerName": "Mr. Singh",
      "date": "2026-03-08",
      "notes": "Joint visit successful"
    },
    "nextVisit": {
      "date": "2026-03-15",
      "purpose": "Follow-up"
    },
    "notes": "Positive response from principal",
    "status": "completed",
    "createdAt": "2026-03-08T10:30:00Z"
  }
}
```

---

### 6.3 Create Visit (School)
```
POST /visits/school
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "schoolId": "S001",
  "date": "2026-03-08T10:30:00Z",
  "contactPersons": ["C001"],
  "purposes": ["Follow-up", "Specimen Submission"],
  "specimensGiven": [
    {
      "bookId": "B001",
      "quantity": 5,
      "mrp": 450,
      "cost": 1125
    }
  ],
  "specimensReturned": [
    {
      "bookId": "B002",
      "quantity": 3,
      "condition": "Good",
      "reason": "Not Prescribed"
    }
  ],
  "feedback": [
    {
      "bookId": "B001",
      "rating": 4,
      "comments": "Good content"
    }
  ],
  "jointWorking": {
    "managerId": "M001",
    "date": "2026-03-08",
    "notes": "Joint visit"
  },
  "nextVisit": {
    "date": "2026-03-15",
    "purpose": "Follow-up"
  },
  "notes": "Positive response"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Visit created successfully",
  "data": {
    "id": "V001",
    "specimenBudgetUsed": 1125,
    "specimenBudgetRemaining": 48875
  }
}
```

**Validation Rules:**
- SchoolId: Required, must exist
- Date: Required, cannot be future date
- ContactPersons: Required, at least one
- Purposes: Required, at least one
- SpecimensGiven: Optional, valid book IDs, quantity > 0
- SpecimensReturned: Optional, valid book IDs, quantity > 0
- Feedback: Optional, rating 1-5
- NextVisit: Optional, date must be future

---

### 6.4 Create Visit (Bookseller)
```
POST /visits/bookseller
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "booksellerId": "BS001",
  "date": "2026-03-08T14:00:00Z",
  "purpose": "Payment Collection",
  "payment": {
    "amount": 50000,
    "mode": "Cheque",
    "referenceNumber": "CHQ123456",
    "date": "2026-03-08"
  },
  "paymentDeadline": "2026-03-30",
  "notes": "Payment collected"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Visit created successfully",
  "data": {
    "id": "V002"
  }
}
```

**Validation Rules:**
- BooksellerId: Required, must exist
- Date: Required, cannot be future date
- Purpose: Required
- Payment: Optional, if provided: amount > 0, mode required
- Notes: Optional

---

### 6.5 Update Visit
```
PUT /visits/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Request Body:** Same as create visit

**Response (200):**
```json
{
  "success": true,
  "message": "Visit updated successfully"
}
```

---

### 6.6 Delete Visit
```
DELETE /visits/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (204):**
```json
{
  "success": true,
  "message": "Visit deleted successfully"
}
```

---

### 6.7 Get My Visits (Salesman)
```
GET /visits/my-visits?startDate=&endDate=&type=
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "V001",
      "type": "school",
      "date": "2026-03-08",
      "schoolName": "Delhi Public School",
      "purposes": ["Follow-up"],
      "status": "completed"
    }
  ]
}
```

---

### 6.8 Get Today's Visits (Salesman)
```
GET /visits/today
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "V005",
      "type": "school",
      "schoolId": "S001",
      "schoolName": "Delhi Public School",
      "time": "10:00 AM",
      "purpose": "Follow-up",
      "status": "pending"
    }
  ]
}
```

---

### 6.9 Get Upcoming Visits (Salesman)
```
GET /visits/upcoming?days=7
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-03-12",
      "visits": [
        {
          "id": "V010",
          "type": "school",
          "schoolName": "DPS Delhi",
          "time": "10:00 AM",
          "purpose": "Follow-up"
        }
      ]
    }
  ]
}
```

---

## 7. Expense APIs

### 7.1 Get All Expenses (Paginated)
```
GET /expenses?page=1&pageSize=20&salesmanId=&type=&status=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `salesmanId` (optional): Filter by salesman
- `type` (optional): Filter by type (Travel, Food, Accommodation)
- `status` (optional): Filter by status (pending, approved, rejected)
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "E001",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "date": "2026-03-08",
      "type": "Travel",
      "category": "Fuel",
      "amount": 1200,
      "description": "Fuel for school visits",
      "receipt": "https://storage.blob.core.windows.net/receipts/e001.jpg",
      "status": "approved",
      "policyViolation": false,
      "fraudScore": 12,
      "approver": "M001",
      "approvalDate": "2026-03-09"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 120,
    "totalPages": 6
  }
}
```

---

### 7.2 Get Expense by ID
```
GET /expenses/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "E001",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "date": "2026-03-08",
    "type": "Travel",
    "category": "Fuel",
    "amount": 1200,
    "description": "Fuel for school visits",
    "receipt": "https://storage.blob.core.windows.net/receipts/e001.jpg",
    "status": "approved",
    "policyViolation": false,
    "fraudScore": 12,
    "fraudAlerts": [],
    "approver": "M001",
    "approverName": "Mr. Singh",
    "approvalDate": "2026-03-09",
    "approvalComments": "Approved",
    "createdAt": "2026-03-08T18:00:00Z"
  }
}
```

---

### 7.3 Create Expense
```
POST /expenses
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "date": "2026-03-08",
  "type": "Travel",
  "category": "Fuel",
  "amount": 1200,
  "description": "Fuel for school visits",
  "receiptFile": "base64-encoded-image-data"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "E001",
    "policyViolation": false,
    "fraudScore": 12,
    "fraudAlerts": [],
    "ocrResult": {
      "merchant": "HP Petrol Pump",
      "date": "2026-03-08",
      "amount": 1200,
      "confidence": 95
    }
  }
}
```

**Validation Rules:**
- Date: Required, cannot be future date, max 60 days old
- Type: Required, enum (Travel, Food, Accommodation, Other)
- Category: Required
- Amount: Required, must be > 0, max per policy
- Description: Required, max 500 characters
- ReceiptFile: Required if amount > policy threshold

**Business Logic:**
- OCR scan receipt if provided
- Check policy violations
- Calculate fraud score
- Detect duplicates
- Auto-categorize based on description

---

### 7.4 Update Expense
```
PUT /expenses/{id}
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:** Same as create expense

**Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully"
}
```

**Note:** Can only update if status is "pending"

---

### 7.5 Delete Expense
```
DELETE /expenses/{id}
Authorization: Bearer {accessToken}
Roles: Salesman, Admin
```

**Response (204):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

### 7.6 Upload Receipt
```
POST /expenses/{id}/receipt
Authorization: Bearer {accessToken}
Roles: Salesman
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData:
- file: [image file]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Receipt uploaded successfully",
  "data": {
    "receiptUrl": "https://storage.blob.core.windows.net/receipts/e001.jpg",
    "ocrResult": {
      "merchant": "HP Petrol Pump",
      "date": "2026-03-08",
      "amount": 1200,
      "category": "Fuel",
      "confidence": 95
    }
  }
}
```

---

### 7.7 Get My Expenses (Salesman)
```
GET /expenses/my-expenses?startDate=&endDate=&status=
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "E001",
      "date": "2026-03-08",
      "type": "Travel",
      "amount": 1200,
      "status": "approved"
    }
  ]
}
```

---

## 8. Expense Report APIs

### 8.1 Get All Expense Reports (Paginated)
```
GET /expense-reports?page=1&pageSize=20&salesmanId=&status=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ER001",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "startDate": "2026-03-01",
      "endDate": "2026-03-08",
      "totalAmount": 15000,
      "expenseCount": 8,
      "status": "approved",
      "submittedDate": "2026-03-09",
      "approvedDate": "2026-03-10"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 45,
    "totalPages": 3
  }
}
```

---

### 8.2 Get Expense Report by ID
```
GET /expense-reports/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ER001",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "startDate": "2026-03-01",
    "endDate": "2026-03-08",
    "expenses": [
      {
        "id": "E001",
        "date": "2026-03-08",
        "type": "Travel",
        "amount": 1200,
        "description": "Fuel"
      }
    ],
    "totalAmount": 15000,
    "status": "approved",
    "submittedDate": "2026-03-09T10:00:00Z",
    "approvalChain": [
      {
        "approverId": "M001",
        "approverName": "Mr. Singh",
        "approverRole": "Manager",
        "status": "approved",
        "comments": "Approved",
        "date": "2026-03-10T09:00:00Z"
      }
    ],
    "fraudAlerts": [],
    "policyViolations": []
  }
}
```

---

### 8.3 Create Expense Report
```
POST /expense-reports
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-08",
  "expenseIds": ["E001", "E002", "E003"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Expense report created successfully",
  "data": {
    "id": "ER001",
    "totalAmount": 15000,
    "expenseCount": 8
  }
}
```

**Validation Rules:**
- StartDate: Required
- EndDate: Required, must be >= startDate
- ExpenseIds: Required, at least one expense, all must be in "pending" status

---

### 8.4 Submit Expense Report
```
POST /expense-reports/{id}/submit
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expense report submitted for approval"
}
```

---

### 8.5 Approve/Reject Expense Report
```
POST /expense-reports/{id}/approve
Authorization: Bearer {accessToken}
Roles: Manager, Admin
```

**Request Body:**
```json
{
  "action": "approve",
  "comments": "Approved"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expense report approved successfully"
}
```

---

## 9. TA/DA Claim APIs

### 9.1 Get All TA/DA Claims (Paginated)
```
GET /tada-claims?page=1&pageSize=20&salesmanId=&status=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "TD001",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "startDate": "2026-03-01",
      "endDate": "2026-03-05",
      "totalAmount": 8500,
      "status": "approved",
      "submittedDate": "2026-03-06",
      "approvedDate": "2026-03-07"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 35,
    "totalPages": 2
  }
}
```

---

### 9.2 Get TA/DA Claim by ID
```
GET /tada-claims/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "TD001",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "startDate": "2026-03-01",
    "endDate": "2026-03-05",
    "days": [
      {
        "date": "2026-03-01",
        "location": "Delhi",
        "travelMode": "Car",
        "distance": 50,
        "taAmount": 1500,
        "daAmount": 500,
        "hotelExpense": 2000,
        "totalAmount": 4000
      }
    ],
    "totalAmount": 8500,
    "status": "approved",
    "submittedDate": "2026-03-06T10:00:00Z",
    "approver": "M001",
    "approverName": "Mr. Singh",
    "approvedDate": "2026-03-07T09:00:00Z",
    "approvalComments": "Approved"
  }
}
```

---

### 9.3 Create TA/DA Claim
```
POST /tada-claims
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-05",
  "days": [
    {
      "date": "2026-03-01",
      "location": "Delhi",
      "travelMode": "Car",
      "distance": 50,
      "taAmount": 1500,
      "daAmount": 500,
      "hotelExpense": 2000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "TA/DA claim created successfully",
  "data": {
    "id": "TD001",
    "totalAmount": 8500
  }
}
```

**Validation Rules:**
- StartDate: Required
- EndDate: Required, must be >= startDate
- Days: Required, at least one day
- Each day: date, location, travelMode required
- Amounts must be > 0

---

### 9.4 Submit TA/DA Claim
```
POST /tada-claims/{id}/submit
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "message": "TA/DA claim submitted for approval"
}
```

---

### 9.5 Approve/Reject TA/DA Claim
```
POST /tada-claims/{id}/approve
Authorization: Bearer {accessToken}
Roles: Manager, Admin
```

**Request Body:**
```json
{
  "action": "approve",
  "comments": "Approved"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "TA/DA claim approved successfully"
}
```

---

## 10. Notification APIs

### 10.1 Get All Notifications (Paginated)
```
GET /notifications?page=1&pageSize=20&isRead=&type=
Authorization: Bearer {accessToken}
Roles: Admin, Salesman
```

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `isRead` (optional): Filter by read status (true, false)
- `type` (optional): Filter by type (visit_reminder, expense_approval, payment_due, etc.)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "N001",
      "userId": "SM001",
      "type": "visit_reminder",
      "title": "Visit Reminder",
      "message": "Visit scheduled for DPS Delhi today at 10:00 AM",
      "data": {
        "visitId": "V005",
        "schoolId": "S001"
      },
      "isRead": false,
      "createdAt": "2026-03-11T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 25,
    "totalPages": 2
  }
}
```

---

### 10.2 Get Unread Count
```
GET /notifications/unread-count
Authorization: Bearer {accessToken}
Roles: Admin, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 10.3 Mark as Read
```
POST /notifications/{id}/mark-read
Authorization: Bearer {accessToken}
Roles: Admin, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 10.4 Mark All as Read
```
POST /notifications/mark-all-read
Authorization: Bearer {accessToken}
Roles: Admin, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 10.5 Delete Notification
```
DELETE /notifications/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Salesman
```

**Response (204):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 11. Book & Specimen APIs

### 11.1 Get All Books (Paginated)
```
GET /books?page=1&pageSize=20&search=&subject=&class=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "B001",
      "name": "Mathematics Class 10",
      "subject": "Mathematics",
      "class": "10",
      "board": "CBSE",
      "author": "R.D. Sharma",
      "publisher": "Dhanpat Rai Publications",
      "mrp": 450,
      "isbn": "978-93-5143-123-4",
      "availableStock": 500
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 150,
    "totalPages": 8
  }
}
```

---

### 11.2 Get Book by ID
```
GET /books/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "B001",
    "name": "Mathematics Class 10",
    "subject": "Mathematics",
    "class": "10",
    "board": "CBSE",
    "author": "R.D. Sharma",
    "publisher": "Dhanpat Rai Publications",
    "mrp": 450,
    "specimenPrice": 225,
    "isbn": "978-93-5143-123-4",
    "edition": "2024",
    "pages": 520,
    "weight": 650,
    "availableStock": 500,
    "description": "Comprehensive mathematics textbook for Class 10 CBSE"
  }
}
```

---

### 11.3 Create Book
```
POST /books
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Mathematics Class 10",
  "subject": "Mathematics",
  "class": "10",
  "board": "CBSE",
  "author": "R.D. Sharma",
  "publisher": "Dhanpat Rai Publications",
  "mrp": 450,
  "isbn": "978-93-5143-123-4",
  "edition": "2024",
  "pages": 520
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": "B001"
  }
}
```

---

### 11.4 Get Specimen Inventory
```
GET /specimens?page=1&pageSize=20&salesmanId=&bookId=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "SP001",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "bookId": "B001",
      "bookName": "Mathematics Class 10",
      "totalAllocated": 50,
      "givenToSchools": 32,
      "returned": 8,
      "available": 26,
      "budgetUsed": 7200,
      "budgetRemaining": 42800
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 45,
    "totalPages": 3
  }
}
```

---

### 11.5 Allocate Specimens to Salesman
```
POST /specimens/allocate
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "salesmanId": "SM001",
  "specimens": [
    {
      "bookId": "B001",
      "quantity": 50
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Specimens allocated successfully"
}
```

---

## 12. Manager APIs

### 12.1 Get All Managers (Paginated)
```
GET /managers?page=1&pageSize=20&search=&region=
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "M001",
      "name": "Mr. Singh",
      "email": "singh@goodluck.com",
      "phone": "9876543210",
      "region": "North Zone",
      "assignedSalesmen": 10,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 8,
    "totalPages": 1
  }
}
```

---

### 12.2 Get Manager by ID
```
GET /managers/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "M001",
    "name": "Mr. Singh",
    "email": "singh@goodluck.com",
    "phone": "9876543210",
    "region": "North Zone",
    "joiningDate": "2018-01-15",
    "status": "active",
    "salesmen": [
      {
        "id": "SM001",
        "name": "Rajesh Kumar",
        "region": "North Delhi"
      }
    ]
  }
}
```

---

### 12.3 Create Manager
```
POST /managers
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Mr. Singh",
  "email": "singh@goodluck.com",
  "phone": "9876543210",
  "password": "password123",
  "region": "North Zone"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Manager created successfully",
  "data": {
    "id": "M001"
  }
}
```

---

### 12.4 Assign Salesmen to Manager
```
POST /managers/{id}/assign-salesmen
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "salesmenIds": ["SM001", "SM002", "SM003"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Salesmen assigned successfully"
}
```

---

## 13. Attendance APIs

### 13.1 Mark Attendance
```
POST /attendance/mark
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "date": "2026-03-11",
  "checkIn": "09:00:00",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, Delhi"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "id": "ATT001"
  }
}
```

---

### 13.2 Mark Check-Out
```
POST /attendance/{id}/checkout
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "checkOut": "18:00:00",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, Delhi"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Check-out marked successfully"
}
```

---

### 13.3 Get My Attendance (Salesman)
```
GET /attendance/my-attendance?month=3&year=2026
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ATT001",
      "date": "2026-03-11",
      "checkIn": "09:00:00",
      "checkOut": "18:00:00",
      "workingHours": 9,
      "status": "present"
    }
  ],
  "summary": {
    "totalDays": 31,
    "present": 22,
    "absent": 4,
    "halfDay": 2,
    "leave": 3
  }
}
```

---

### 13.4 Get Salesman Attendance (Admin/Manager)
```
GET /attendance/salesman/{salesmanId}?month=3&year=2026
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ATT001",
      "salesmanId": "SM001",
      "date": "2026-03-11",
      "checkIn": "09:00:00",
      "checkOut": "18:00:00",
      "workingHours": 9,
      "status": "present"
    }
  ]
}
```

---

## 14. Tour Plan APIs

### 14.1 Get Tour Plans (Paginated)
```
GET /tour-plans?page=1&pageSize=20&salesmanId=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "TP001",
      "salesmanId": "SM001",
      "salesmanName": "Rajesh Kumar",
      "weekStartDate": "2026-03-10",
      "weekEndDate": "2026-03-16",
      "totalVisits": 15,
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 45,
    "totalPages": 3
  }
}
```

---

### 14.2 Get Tour Plan by ID
```
GET /tour-plans/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "TP001",
    "salesmanId": "SM001",
    "salesmanName": "Rajesh Kumar",
    "weekStartDate": "2026-03-10",
    "weekEndDate": "2026-03-16",
    "days": [
      {
        "date": "2026-03-11",
        "visits": [
          {
            "type": "school",
            "schoolId": "S001",
            "schoolName": "DPS Delhi",
            "time": "10:00 AM",
            "purpose": "Follow-up"
          }
        ]
      }
    ],
    "status": "active"
  }
}
```

---

### 14.3 Create Tour Plan
```
POST /tour-plans
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "weekStartDate": "2026-03-10",
  "weekEndDate": "2026-03-16",
  "days": [
    {
      "date": "2026-03-11",
      "visits": [
        {
          "type": "school",
          "schoolId": "S001",
          "time": "10:00 AM",
          "purpose": "Follow-up"
        }
      ]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tour plan created successfully",
  "data": {
    "id": "TP001"
  }
}
```

---

## 15. Report APIs

### 15.1 Visit Report
```
GET /reports/visits?salesmanId=&startDate=&endDate=&type=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalVisits": 150,
      "schoolVisits": 100,
      "booksellerVisits": 50,
      "avgVisitsPerDay": 5.5
    },
    "byType": [
      { "type": "school", "count": 100 },
      { "type": "bookseller", "count": 50 }
    ],
    "byPurpose": [
      { "purpose": "Follow-up", "count": 60 },
      { "purpose": "Specimen Submission", "count": 40 }
    ],
    "trend": [
      { "date": "2026-03-01", "visits": 5 },
      { "date": "2026-03-02", "visits": 6 }
    ]
  }
}
```

---

### 15.2 Sales Report
```
GET /reports/sales?salesmanId=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSales": 45000000,
      "targetSales": 60000000,
      "achievement": 75,
      "growth": 12.5
    },
    "bySalesman": [
      {
        "salesmanId": "SM001",
        "name": "Rajesh Kumar",
        "sales": 3200000,
        "target": 5000000,
        "percentage": 64
      }
    ],
    "byMonth": [
      { "month": "Jan", "sales": 4200000 },
      { "month": "Feb", "sales": 4500000 }
    ]
  }
}
```

---

### 15.3 Specimen Report
```
GET /reports/specimens?salesmanId=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBudget": 500000,
      "budgetUsed": 320000,
      "budgetRemaining": 180000,
      "utilization": 64
    },
    "bySalesman": [
      {
        "salesmanId": "SM001",
        "name": "Rajesh Kumar",
        "budget": 50000,
        "used": 32000,
        "remaining": 18000
      }
    ],
    "byBook": [
      {
        "bookId": "B001",
        "bookName": "Mathematics Class 10",
        "allocated": 500,
        "given": 320,
        "returned": 80,
        "available": 260
      }
    ]
  }
}
```

---

### 15.4 Expense Report
```
GET /reports/expenses?salesmanId=&startDate=&endDate=
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalExpenses": 150000,
      "approved": 120000,
      "pending": 20000,
      "rejected": 10000
    },
    "byType": [
      { "type": "Travel", "amount": 80000 },
      { "type": "Food", "amount": 40000 }
    ],
    "bySalesman": [
      {
        "salesmanId": "SM001",
        "name": "Rajesh Kumar",
        "totalExpenses": 15000
      }
    ]
  }
}
```

---

### 15.5 Compliance Report
```
GET /reports/compliance?salesmanId=&month=3&year=2026
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "visitCompliance": 85,
      "expenseCompliance": 92,
      "specimenCompliance": 88,
      "overallCompliance": 88
    },
    "bySalesman": [
      {
        "salesmanId": "SM001",
        "name": "Rajesh Kumar",
        "visitCompliance": 85,
        "expenseCompliance": 90,
        "specimenCompliance": 88
      }
    ]
  }
}
```

---

## 16. Settings APIs

### 16.1 Get Dropdown Options
```
GET /settings/dropdowns
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "boards": ["CBSE", "ICSE", "State Board", "IB"],
    "subjects": ["Mathematics", "Science", "English", "Social Science"],
    "classes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    "visitPurposes": ["Follow-up", "Specimen Submission", "Payment Collection", "New School"],
    "expenseTypes": ["Travel", "Food", "Accommodation", "Other"],
    "expenseCategories": {
      "Travel": ["Fuel", "Train", "Bus", "Auto"],
      "Food": ["Breakfast", "Lunch", "Dinner"],
      "Accommodation": ["Hotel", "Guest House"]
    },
    "travelModes": ["Car", "Bike", "Train", "Bus"],
    "specimenConditions": ["Good", "Damaged", "Lost"],
    "schoolCategories": ["A+", "A", "B", "C"],
    "designations": ["Principal", "Vice Principal", "Coordinator", "Teacher"]
  }
}
```

---

### 16.2 Update Dropdown Options
```
PUT /settings/dropdowns
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "boards": ["CBSE", "ICSE", "State Board", "IB", "Cambridge"],
  "subjects": ["Mathematics", "Science", "English", "Social Science", "Computer Science"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dropdown options updated successfully"
}
```

---

## 17. PM Schedule (Product Manager Schedule) APIs

### 17.1 Get All PM Schedules
```
GET /pm-schedules
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `managerId` (optional): Filter by manager ID
- `startDate` (optional): Filter by date range start
- `endDate` (optional): Filter by date range end
- `status` (optional): active, completed, cancelled

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "PMS001",
      "managerId": "MGR001",
      "managerName": "Amit Sharma",
      "managerType": "Regional",
      "title": "North Region School Visits",
      "startDate": "2026-03-15",
      "endDate": "2026-03-20",
      "status": "active",
      "cities": ["Delhi", "Gurgaon", "Noida"],
      "plannedVisits": [
        {
          "date": "2026-03-15",
          "schoolId": "SCH001",
          "schoolName": "DPS School",
          "city": "Delhi",
          "purpose": "Joint Working with Salesman",
          "salesmanId": "SM001",
          "salesmanName": "Vikash Sharma"
        }
      ],
      "totalVisits": 12,
      "completedVisits": 5,
      "notes": "Focus on CBSE schools",
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 45,
    "totalPages": 3
  }
}
```

---

### 17.2 Get PM Schedule by ID
```
GET /pm-schedules/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "PMS001",
    "managerId": "MGR001",
    "managerName": "Amit Sharma",
    "managerType": "Regional",
    "title": "North Region School Visits",
    "startDate": "2026-03-15",
    "endDate": "2026-03-20",
    "status": "active",
    "cities": ["Delhi", "Gurgaon", "Noida"],
    "plannedVisits": [
      {
        "id": "PMV001",
        "date": "2026-03-15",
        "schoolId": "SCH001",
        "schoolName": "DPS School",
        "city": "Delhi",
        "address": "Sector 45, Gurgaon",
        "purpose": "Joint Working with Salesman",
        "salesmanId": "SM001",
        "salesmanName": "Vikash Sharma",
        "plannedTime": "10:00 AM",
        "status": "planned",
        "completedAt": null
      },
      {
        "id": "PMV002",
        "date": "2026-03-15",
        "schoolId": "SCH005",
        "schoolName": "KV School",
        "city": "Delhi",
        "address": "Dwarka, Delhi",
        "purpose": "Performance Review",
        "salesmanId": "SM001",
        "salesmanName": "Vikash Sharma",
        "plannedTime": "2:00 PM",
        "status": "completed",
        "completedAt": "2026-03-15T14:30:00Z"
      }
    ],
    "totalVisits": 12,
    "completedVisits": 5,
    "pendingVisits": 7,
    "notes": "Focus on CBSE schools for new book adoption",
    "createdBy": "Admin",
    "createdAt": "2026-03-01T10:00:00Z",
    "modifiedAt": "2026-03-10T15:30:00Z"
  }
}
```

---

### 17.3 Create PM Schedule
```
POST /pm-schedules
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "managerId": "MGR001",
  "title": "South Region School Visits",
  "startDate": "2026-03-20",
  "endDate": "2026-03-25",
  "cities": ["Bangalore", "Hyderabad", "Chennai"],
  "plannedVisits": [
    {
      "date": "2026-03-20",
      "schoolId": "SCH010",
      "purpose": "Joint Working",
      "salesmanId": "SM004",
      "plannedTime": "10:00 AM"
    },
    {
      "date": "2026-03-20",
      "schoolId": "SCH012",
      "purpose": "Performance Review",
      "salesmanId": "SM004",
      "plannedTime": "2:00 PM"
    }
  ],
  "notes": "Focus on ICSE schools"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "PM Schedule created successfully",
  "data": {
    "id": "PMS015",
    "managerId": "MGR001",
    "title": "South Region School Visits",
    "startDate": "2026-03-20",
    "endDate": "2026-03-25",
    "status": "active",
    "totalVisits": 2
  }
}
```

**Validation Rules:**
- managerId: Required
- title: Required, max 200 characters
- startDate: Required, cannot be in past
- endDate: Required, must be >= startDate
- plannedVisits: At least 1 visit required
- Each visit: date, schoolId, purpose, salesmanId required

---

### 17.4 Update PM Schedule
```
PUT /pm-schedules/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "title": "Updated South Region Visits",
  "status": "completed",
  "notes": "All schools covered successfully"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "PM Schedule updated successfully"
}
```

---

### 17.5 Delete PM Schedule
```
DELETE /pm-schedules/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (200):**
```json
{
  "success": true,
  "message": "PM Schedule deleted successfully"
}
```

**Note:** Only schedules with status "planned" can be deleted. Completed/ongoing schedules cannot be deleted.

---

### 17.6 Get PM Calendar View
```
GET /pm-schedules/calendar
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Query Parameters:**
- `month` (required): Month (1-12)
- `year` (required): Year (e.g., 2026)
- `managerId` (optional): Filter by manager

**Response (200):**
```json
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2026,
    "schedules": [
      {
        "date": "2026-03-15",
        "events": [
          {
            "scheduleId": "PMS001",
            "managerId": "MGR001",
            "managerName": "Amit Sharma",
            "title": "North Region Visits",
            "visitCount": 3,
            "cities": ["Delhi", "Gurgaon"]
          }
        ]
      },
      {
        "date": "2026-03-20",
        "events": [
          {
            "scheduleId": "PMS002",
            "managerId": "MGR002",
            "managerName": "Priya Singh",
            "title": "West Region Visits",
            "visitCount": 2,
            "cities": ["Mumbai", "Pune"]
          }
        ]
      }
    ]
  }
}
```

---

## 18. Feedback Management APIs

### 18.1 Get All Feedback
```
GET /feedback
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `status` (optional): open, in_progress, resolved, closed
- `category` (optional): Book Quality, Service Quality, Delivery Issues, etc.
- `salesmanId` (optional): Filter by salesman
- `schoolId` (optional): Filter by school
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "FB001",
      "visitId": "VIS123",
      "salesmanId": "SM001",
      "salesmanName": "Vikash Sharma",
      "schoolId": "SCH001",
      "schoolName": "DPS School",
      "category": "Book Quality",
      "priority": "high",
      "comment": "Pages missing in Mathematics textbook Class 10",
      "status": "open",
      "createdAt": "2026-03-10T14:30:00Z",
      "response": null,
      "resolvedBy": null,
      "resolvedAt": null
    },
    {
      "id": "FB002",
      "visitId": "VIS125",
      "salesmanId": "SM002",
      "salesmanName": "Priya Patel",
      "schoolId": "SCH015",
      "schoolName": "Modern School",
      "category": "Delivery Issues",
      "priority": "medium",
      "comment": "Books delivered late by 2 weeks",
      "status": "resolved",
      "createdAt": "2026-03-08T10:00:00Z",
      "response": "We have taken corrective measures. Future deliveries will be on time.",
      "resolvedBy": "Admin",
      "resolvedAt": "2026-03-09T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 87,
    "totalPages": 5
  }
}
```

---

### 18.2 Get Feedback by ID
```
GET /feedback/{id}
Authorization: Bearer {accessToken}
Roles: Admin, Manager, Salesman
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "FB001",
    "visitId": "VIS123",
    "visitDate": "2026-03-10",
    "salesmanId": "SM001",
    "salesmanName": "Vikash Sharma",
    "schoolId": "SCH001",
    "schoolName": "DPS School",
    "schoolCity": "Delhi",
    "category": "Book Quality",
    "priority": "high",
    "comment": "Pages missing in Mathematics textbook Class 10. Total 5 books affected.",
    "status": "in_progress",
    "attachments": [
      "https://storage.goodluck.com/feedback/FB001/photo1.jpg",
      "https://storage.goodluck.com/feedback/FB001/photo2.jpg"
    ],
    "response": "We are investigating this issue. Replacement books will be sent within 3 days.",
    "responseBy": "Admin Team",
    "responseAt": "2026-03-10T18:00:00Z",
    "resolvedBy": null,
    "resolvedAt": null,
    "createdAt": "2026-03-10T14:30:00Z",
    "modifiedAt": "2026-03-10T18:00:00Z",
    "history": [
      {
        "action": "status_changed",
        "from": "open",
        "to": "in_progress",
        "by": "Admin",
        "at": "2026-03-10T17:00:00Z"
      }
    ]
  }
}
```

---

### 18.3 Create Feedback
```
POST /feedback
Authorization: Bearer {accessToken}
Roles: Salesman
```

**Request Body:**
```json
{
  "visitId": "VIS130",
  "schoolId": "SCH020",
  "category": "Service Quality",
  "priority": "low",
  "comment": "Principal requested more frequent visits",
  "attachments": [
    "https://storage.goodluck.com/temp/image1.jpg"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "FB025",
    "status": "open",
    "createdAt": "2026-03-11T10:00:00Z"
  }
}
```

**Validation Rules:**
- category: Required, must be valid category
- priority: Required, enum (low, medium, high, critical)
- comment: Required, max 1000 characters
- visitId: Optional (can create standalone feedback)
- schoolId: Required if visitId not provided

---

### 18.4 Update Feedback Status
```
PUT /feedback/{id}/status
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "status": "resolved",
  "response": "Issue resolved. Replacement books sent. Tracking ID: TR12345",
  "internalNotes": "Coordinated with warehouse team"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Feedback status updated successfully"
}
```

**Status Workflow:**
- open → in_progress → resolved → closed
- Only admins can close feedback
- Status cannot go backwards

---

### 18.5 Respond to Feedback
```
POST /feedback/{id}/respond
Authorization: Bearer {accessToken}
Roles: Admin, Manager
```

**Request Body:**
```json
{
  "response": "Thank you for reporting. We will send replacement books within 2 business days.",
  "notifySalesman": true,
  "notifySchool": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Response added successfully"
}
```

**Actions Triggered:**
- Add response to feedback record
- Send notification to salesman (if notifySalesman = true)
- Send email to school (if notifySchool = true)
- Update modifiedAt timestamp

---

## 19. Location Master APIs

### 19.1 Get All Locations
```
GET /locations
Authorization: Bearer {accessToken}
Roles: Admin
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 50)
- `state` (optional): Filter by state
- `city` (optional): Filter by city
- `type` (optional): city, district, region
- `isActive` (optional): true/false

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "LOC001",
      "name": "Delhi NCR",
      "type": "region",
      "state": "Delhi",
      "cities": ["Delhi", "Gurgaon", "Noida", "Faridabad"],
      "pincode": null,
      "isActive": true,
      "assignedSalesmen": 5,
      "totalSchools": 120,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "LOC002",
      "name": "Gurgaon",
      "type": "city",
      "state": "Haryana",
      "cities": ["Gurgaon"],
      "pincode": "122001",
      "isActive": true,
      "assignedSalesmen": 2,
      "totalSchools": 45,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalRecords": 150,
    "totalPages": 3
  }
}
```

---

### 19.2 Create Location
```
POST /locations
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Mumbai Suburban",
  "type": "region",
  "state": "Maharashtra",
  "cities": ["Mumbai", "Thane", "Navi Mumbai"],
  "pincode": null,
  "isActive": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Location created successfully",
  "data": {
    "id": "LOC050",
    "name": "Mumbai Suburban",
    "type": "region",
    "state": "Maharashtra"
  }
}
```

**Validation Rules:**
- name: Required, max 100 characters, unique
- type: Required, enum (city, district, region)
- state: Required
- cities: Required array, min 1 city
- isActive: Optional, default true

---

### 19.3 Update Location
```
PUT /locations/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Request Body:**
```json
{
  "name": "Delhi NCR Extended",
  "cities": ["Delhi", "Gurgaon", "Noida", "Faridabad", "Ghaziabad"],
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

### 19.4 Delete Location
```
DELETE /locations/{id}
Authorization: Bearer {accessToken}
Roles: Admin
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location deleted successfully"
}
```

**Validation:**
- Cannot delete location if salesmen are assigned
- Cannot delete location if schools exist in that location
- Returns 400 error with details if validation fails

---

# Database Schema

This section defines the complete database schema for Microsoft SQL Server following the **Indus DVR architecture**.

## Multi-Tenant Design

All tables include these standard columns for multi-tenancy and audit:

```sql
TenantId NVARCHAR(50) NOT NULL,
CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
CreatedBy NVARCHAR(50) NOT NULL,
ModifiedAt DATETIME2 NULL,
ModifiedBy NVARCHAR(50) NULL,
IsDeleted BIT NOT NULL DEFAULT 0
```

---

## Table Definitions

### Users Table
```sql
CREATE TABLE Users (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Role NVARCHAR(20) NOT NULL, -- Admin, Manager, Salesman
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE INDEX IX_Users_TenantId ON Users(TenantId);
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Role ON Users(Role);
```

---

### RefreshTokens Table
```sql
CREATE TABLE RefreshTokens (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    Token NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_RefreshTokens_UserId ON RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
```

---

### UserDevices Table
```sql
CREATE TABLE UserDevices (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    DeviceToken NVARCHAR(500) NOT NULL,
    DeviceType NVARCHAR(20) NOT NULL, -- android, ios, web
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_UserDevices_UserId ON UserDevices(UserId);
```

---

### Salesmen Table
```sql
CREATE TABLE Salesmen (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    ManagerId NVARCHAR(50) NULL,
    Region NVARCHAR(100) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Address NVARCHAR(500) NULL,
    JoiningDate DATE NOT NULL,
    SalesTarget DECIMAL(18,2) NOT NULL,
    VisitTarget INT NOT NULL,
    SpecimenTarget INT NOT NULL,
    SpecimenBudget DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (ManagerId) REFERENCES Managers(Id)
);

CREATE INDEX IX_Salesmen_TenantId ON Salesmen(TenantId);
CREATE INDEX IX_Salesmen_ManagerId ON Salesmen(ManagerId);
CREATE INDEX IX_Salesmen_Region ON Salesmen(Region);
```

---

### Managers Table
```sql
CREATE TABLE Managers (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    Region NVARCHAR(100) NOT NULL,
    JoiningDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_Managers_TenantId ON Managers(TenantId);
```

---

### Schools Table
```sql
CREATE TABLE Schools (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Pincode NVARCHAR(10) NULL,
    Board NVARCHAR(50) NOT NULL,
    Strength INT NOT NULL,
    Category NVARCHAR(10) NOT NULL, -- A+, A, B, C
    SalesmanId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_Schools_TenantId ON Schools(TenantId);
CREATE INDEX IX_Schools_SalesmanId ON Schools(SalesmanId);
CREATE INDEX IX_Schools_City ON Schools(City);
CREATE INDEX IX_Schools_Board ON Schools(Board);
```

---

### ContactPersons Table
```sql
CREATE TABLE ContactPersons (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SchoolId NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Designation NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(255) NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SchoolId) REFERENCES Schools(Id)
);

CREATE INDEX IX_ContactPersons_SchoolId ON ContactPersons(SchoolId);
```

---

### BookSellers Table
```sql
CREATE TABLE BookSellers (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    OwnerName NVARCHAR(100) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Pincode NVARCHAR(10) NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(255) NULL,
    GstNumber NVARCHAR(20) NULL,
    CreditLimit DECIMAL(18,2) NOT NULL,
    PaymentTerms NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_BookSellers_TenantId ON BookSellers(TenantId);
CREATE INDEX IX_BookSellers_SalesmanId ON BookSellers(SalesmanId);
CREATE INDEX IX_BookSellers_City ON BookSellers(City);
```

---

### Books Table
```sql
CREATE TABLE Books (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Subject NVARCHAR(100) NOT NULL,
    Class NVARCHAR(10) NOT NULL,
    Board NVARCHAR(50) NOT NULL,
    Author NVARCHAR(200) NULL,
    Publisher NVARCHAR(200) NULL,
    MRP DECIMAL(18,2) NOT NULL,
    ISBN NVARCHAR(20) NULL,
    Edition NVARCHAR(50) NULL,
    Pages INT NULL,
    Weight INT NULL,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE INDEX IX_Books_TenantId ON Books(TenantId);
CREATE INDEX IX_Books_Subject ON Books(Subject);
CREATE INDEX IX_Books_Class ON Books(Class);
```

---

### Visits Table
```sql
CREATE TABLE Visits (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- school, bookseller
    SalesmanId NVARCHAR(50) NOT NULL,
    SchoolId NVARCHAR(50) NULL,
    BookSellerId NVARCHAR(50) NULL,
    VisitDate DATETIME2 NOT NULL,
    Purposes NVARCHAR(MAX) NOT NULL, -- JSON array
    Notes NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'completed',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id),
    FOREIGN KEY (SchoolId) REFERENCES Schools(Id),
    FOREIGN KEY (BookSellerId) REFERENCES BookSellers(Id)
);

CREATE INDEX IX_Visits_TenantId ON Visits(TenantId);
CREATE INDEX IX_Visits_SalesmanId ON Visits(SalesmanId);
CREATE INDEX IX_Visits_SchoolId ON Visits(SchoolId);
CREATE INDEX IX_Visits_VisitDate ON Visits(VisitDate);
```

---

### VisitContactPersons Table
```sql
CREATE TABLE VisitContactPersons (
    Id NVARCHAR(50) PRIMARY KEY,
    VisitId NVARCHAR(50) NOT NULL,
    ContactPersonId NVARCHAR(50) NOT NULL,
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (ContactPersonId) REFERENCES ContactPersons(Id)
);

CREATE INDEX IX_VisitContactPersons_VisitId ON VisitContactPersons(VisitId);
```

---

### SpecimensGiven Table
```sql
CREATE TABLE SpecimensGiven (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NOT NULL,
    BookId NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    MRP DECIMAL(18,2) NOT NULL,
    Cost DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (BookId) REFERENCES Books(Id)
);

CREATE INDEX IX_SpecimensGiven_VisitId ON SpecimensGiven(VisitId);
```

---

### SpecimensReturned Table
```sql
CREATE TABLE SpecimensReturned (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NOT NULL,
    BookId NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    Condition NVARCHAR(20) NOT NULL, -- Good, Damaged, Lost
    Reason NVARCHAR(200) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (BookId) REFERENCES Books(Id)
);

CREATE INDEX IX_SpecimensReturned_VisitId ON SpecimensReturned(VisitId);
```

---

### VisitFeedback Table
```sql
CREATE TABLE VisitFeedback (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NOT NULL,
    BookId NVARCHAR(50) NULL,
    Rating INT NULL,
    Comments NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (BookId) REFERENCES Books(Id)
);

CREATE INDEX IX_VisitFeedback_VisitId ON VisitFeedback(VisitId);
```

---

### JointWorking Table
```sql
CREATE TABLE JointWorking (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NOT NULL,
    ManagerId NVARCHAR(50) NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (ManagerId) REFERENCES Managers(Id)
);

CREATE INDEX IX_JointWorking_VisitId ON JointWorking(VisitId);
```

---

### NextVisits Table
```sql
CREATE TABLE NextVisits (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NOT NULL,
    ScheduledDate DATE NOT NULL,
    Purpose NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (VisitId) REFERENCES Visits(Id)
);

CREATE INDEX IX_NextVisits_VisitId ON NextVisits(VisitId);
CREATE INDEX IX_NextVisits_ScheduledDate ON NextVisits(ScheduledDate);
```

---

### Expenses Table
```sql
CREATE TABLE Expenses (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    ExpenseDate DATE NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- Travel, Food, Accommodation
    Category NVARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    ReceiptUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    PolicyViolation BIT NOT NULL DEFAULT 0,
    FraudScore INT NOT NULL DEFAULT 0,
    ApproverId NVARCHAR(50) NULL,
    ApprovalDate DATETIME2 NULL,
    ApprovalComments NVARCHAR(500) NULL,
    RejectionReason NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_Expenses_TenantId ON Expenses(TenantId);
CREATE INDEX IX_Expenses_SalesmanId ON Expenses(SalesmanId);
CREATE INDEX IX_Expenses_ExpenseDate ON Expenses(ExpenseDate);
CREATE INDEX IX_Expenses_Status ON Expenses(Status);
```

---

### ExpenseReports Table
```sql
CREATE TABLE ExpenseReports (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'draft',
    SubmittedDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_ExpenseReports_TenantId ON ExpenseReports(TenantId);
CREATE INDEX IX_ExpenseReports_SalesmanId ON ExpenseReports(SalesmanId);
```

---

### ExpenseReportItems Table
```sql
CREATE TABLE ExpenseReportItems (
    Id NVARCHAR(50) PRIMARY KEY,
    ExpenseReportId NVARCHAR(50) NOT NULL,
    ExpenseId NVARCHAR(50) NOT NULL,
    FOREIGN KEY (ExpenseReportId) REFERENCES ExpenseReports(Id),
    FOREIGN KEY (ExpenseId) REFERENCES Expenses(Id)
);

CREATE INDEX IX_ExpenseReportItems_ExpenseReportId ON ExpenseReportItems(ExpenseReportId);
```

---

### TadaClaims Table
```sql
CREATE TABLE TadaClaims (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'draft',
    SubmittedDate DATETIME2 NULL,
    ApproverId NVARCHAR(50) NULL,
    ApprovalDate DATETIME2 NULL,
    ApprovalComments NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_TadaClaims_TenantId ON TadaClaims(TenantId);
CREATE INDEX IX_TadaClaims_SalesmanId ON TadaClaims(SalesmanId);
```

---

### TadaClaimDays Table
```sql
CREATE TABLE TadaClaimDays (
    Id NVARCHAR(50) PRIMARY KEY,
    TadaClaimId NVARCHAR(50) NOT NULL,
    ClaimDate DATE NOT NULL,
    Location NVARCHAR(100) NOT NULL,
    TravelMode NVARCHAR(50) NOT NULL,
    Distance INT NULL,
    TaAmount DECIMAL(18,2) NOT NULL,
    DaAmount DECIMAL(18,2) NOT NULL,
    HotelExpense DECIMAL(18,2) NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (TadaClaimId) REFERENCES TadaClaims(Id)
);

CREATE INDEX IX_TadaClaimDays_TadaClaimId ON TadaClaimDays(TadaClaimId);
```

---

### Notifications Table
```sql
CREATE TABLE Notifications (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Data NVARCHAR(MAX) NULL, -- JSON
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE INDEX IX_Notifications_TenantId ON Notifications(TenantId);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
```

---

### Attendance Table
```sql
CREATE TABLE Attendance (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    AttendanceDate DATE NOT NULL,
    CheckIn TIME NOT NULL,
    CheckOut TIME NULL,
    CheckInLatitude DECIMAL(10,7) NULL,
    CheckInLongitude DECIMAL(10,7) NULL,
    CheckInAddress NVARCHAR(500) NULL,
    CheckOutLatitude DECIMAL(10,7) NULL,
    CheckOutLongitude DECIMAL(10,7) NULL,
    CheckOutAddress NVARCHAR(500) NULL,
    WorkingHours DECIMAL(5,2) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'present',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ModifiedAt DATETIME2 NULL,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_Attendance_TenantId ON Attendance(TenantId);
CREATE INDEX IX_Attendance_SalesmanId ON Attendance(SalesmanId);
CREATE INDEX IX_Attendance_AttendanceDate ON Attendance(AttendanceDate);
```

---

### TourPlans Table
```sql
CREATE TABLE TourPlans (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    WeekStartDate DATE NOT NULL,
    WeekEndDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_TourPlans_TenantId ON TourPlans(TenantId);
CREATE INDEX IX_TourPlans_SalesmanId ON TourPlans(SalesmanId);
```

---

### TourPlanVisits Table
```sql
CREATE TABLE TourPlanVisits (
    Id NVARCHAR(50) PRIMARY KEY,
    TourPlanId NVARCHAR(50) NOT NULL,
    PlannedDate DATE NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- school, bookseller
    SchoolId NVARCHAR(50) NULL,
    BookSellerId NVARCHAR(50) NULL,
    PlannedTime TIME NULL,
    Purpose NVARCHAR(200) NOT NULL,
    FOREIGN KEY (TourPlanId) REFERENCES TourPlans(Id),
    FOREIGN KEY (SchoolId) REFERENCES Schools(Id),
    FOREIGN KEY (BookSellerId) REFERENCES BookSellers(Id)
);

CREATE INDEX IX_TourPlanVisits_TourPlanId ON TourPlanVisits(TourPlanId);
```

---

### AuditLogs Table
```sql
CREATE TABLE AuditLogs (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    UserId NVARCHAR(50) NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(50) NOT NULL,
    Action NVARCHAR(50) NOT NULL, -- Create, Update, Delete
    OldValues NVARCHAR(MAX) NULL, -- JSON
    NewValues NVARCHAR(MAX) NULL, -- JSON
    Timestamp DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AuditLogs_TenantId ON AuditLogs(TenantId);
CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId);
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs(Timestamp);
```

---

### PMSchedules Table
```sql
CREATE TABLE PMSchedules (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    ManagerId NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'active', -- active, completed, cancelled
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (ManagerId) REFERENCES Managers(Id)
);

CREATE INDEX IX_PMSchedules_TenantId ON PMSchedules(TenantId);
CREATE INDEX IX_PMSchedules_ManagerId ON PMSchedules(ManagerId);
CREATE INDEX IX_PMSchedules_StartDate ON PMSchedules(StartDate);
CREATE INDEX IX_PMSchedules_Status ON PMSchedules(Status);
```

---

### PMScheduleVisits Table
```sql
CREATE TABLE PMScheduleVisits (
    Id NVARCHAR(50) PRIMARY KEY,
    PMScheduleId NVARCHAR(50) NOT NULL,
    Date DATE NOT NULL,
    SchoolId NVARCHAR(50) NOT NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    Purpose NVARCHAR(200) NOT NULL,
    PlannedTime TIME NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'planned', -- planned, completed, cancelled
    CompletedAt DATETIME2 NULL,
    Notes NVARCHAR(500) NULL,
    FOREIGN KEY (PMScheduleId) REFERENCES PMSchedules(Id),
    FOREIGN KEY (SchoolId) REFERENCES Schools(Id),
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id)
);

CREATE INDEX IX_PMScheduleVisits_PMScheduleId ON PMScheduleVisits(PMScheduleId);
CREATE INDEX IX_PMScheduleVisits_Date ON PMScheduleVisits(Date);
CREATE INDEX IX_PMScheduleVisits_SchoolId ON PMScheduleVisits(SchoolId);
CREATE INDEX IX_PMScheduleVisits_SalesmanId ON PMScheduleVisits(SalesmanId);
```

---

### Feedback Table
```sql
CREATE TABLE Feedback (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    VisitId NVARCHAR(50) NULL,
    SalesmanId NVARCHAR(50) NOT NULL,
    SchoolId NVARCHAR(50) NULL,
    BookSellerId NVARCHAR(50) NULL,
    Category NVARCHAR(100) NOT NULL, -- Book Quality, Service Quality, Delivery Issues, etc.
    Priority NVARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    Comment NVARCHAR(MAX) NOT NULL,
    Attachments NVARCHAR(MAX) NULL, -- JSON array of URLs
    Status NVARCHAR(20) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
    Response NVARCHAR(MAX) NULL,
    ResponseBy NVARCHAR(50) NULL,
    ResponseAt DATETIME2 NULL,
    ResolvedBy NVARCHAR(50) NULL,
    ResolvedAt DATETIME2 NULL,
    InternalNotes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (VisitId) REFERENCES Visits(Id),
    FOREIGN KEY (SalesmanId) REFERENCES Salesmen(Id),
    FOREIGN KEY (SchoolId) REFERENCES Schools(Id),
    FOREIGN KEY (BookSellerId) REFERENCES BookSellers(Id)
);

CREATE INDEX IX_Feedback_TenantId ON Feedback(TenantId);
CREATE INDEX IX_Feedback_SalesmanId ON Feedback(SalesmanId);
CREATE INDEX IX_Feedback_SchoolId ON Feedback(SchoolId);
CREATE INDEX IX_Feedback_Status ON Feedback(Status);
CREATE INDEX IX_Feedback_Category ON Feedback(Category);
CREATE INDEX IX_Feedback_Priority ON Feedback(Priority);
CREATE INDEX IX_Feedback_CreatedAt ON Feedback(CreatedAt);
```

---

### Locations Table
```sql
CREATE TABLE Locations (
    Id NVARCHAR(50) PRIMARY KEY,
    TenantId NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(20) NOT NULL, -- city, district, region
    State NVARCHAR(100) NOT NULL,
    Cities NVARCHAR(MAX) NOT NULL, -- JSON array
    Pincode NVARCHAR(10) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy NVARCHAR(50) NOT NULL,
    ModifiedAt DATETIME2 NULL,
    ModifiedBy NVARCHAR(50) NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);

CREATE INDEX IX_Locations_TenantId ON Locations(TenantId);
CREATE INDEX IX_Locations_State ON Locations(State);
CREATE INDEX IX_Locations_Type ON Locations(Type);
CREATE INDEX IX_Locations_IsActive ON Locations(IsActive);
CREATE UNIQUE INDEX IX_Locations_Name ON Locations(Name, TenantId) WHERE IsDeleted = 0;
```

---

## Database Migration Scripts (DbUp)

### Script 001: Create Core Tables
```sql
-- Script: 001_CreateCoreTables.sql
-- Creates Users, RefreshTokens, UserDevices, Salesmen, Managers
```

### Script 002: Create Master Tables
```sql
-- Script: 002_CreateMasterTables.sql
-- Creates Schools, ContactPersons, BookSellers, Books, Locations
```

### Script 003: Create Transactional Tables
```sql
-- Script: 003_CreateTransactionalTables.sql
-- Creates Visits, SpecimensGiven, SpecimensReturned, etc.
```

### Script 004: Create Expense Tables
```sql
-- Script: 004_CreateExpenseTables.sql
-- Creates Expenses, ExpenseReports, TadaClaims
```

### Script 005: Create Support Tables
```sql
-- Script: 005_CreateSupportTables.sql
-- Creates Notifications, Attendance, TourPlans, PMSchedules, PMScheduleVisits, Feedback, AuditLogs
```

### Script 006: Create Indexes
```sql
-- Script: 006_CreateIndexes.sql
-- All indexes for performance optimization
```

---

## Part 6: CQRS Architecture with MediatR

### Command Example - Create School
```csharp
// Domain/Commands/Schools/CreateSchoolCommand.cs
public class CreateSchoolCommand : IRequest<Result<SchoolDto>>
{
    public string Name { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Pincode { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Board { get; set; }
    public string Category { get; set; }
    public int StrengthPrimary { get; set; }
    public int StrengthSecondary { get; set; }
    public int StrengthSeniorSecondary { get; set; }
    public string SalesmanId { get; set; }
}

// Application/Validators/CreateSchoolValidator.cs
public class CreateSchoolValidator : AbstractValidator<CreateSchoolCommand>
{
    public CreateSchoolValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^\d{10}$").WithMessage("Phone must be 10 digits");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format");

        RuleFor(x => x.SalesmanId)
            .NotEmpty().WithMessage("SalesmanId is required");
    }
}

// Application/Handlers/Schools/CreateSchoolHandler.cs
public class CreateSchoolHandler : IRequestHandler<CreateSchoolCommand, Result<SchoolDto>>
{
    private readonly IDbConnection _connection;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public CreateSchoolHandler(
        IDbConnection connection,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _connection = connection;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<SchoolDto>> Handle(
        CreateSchoolCommand request,
        CancellationToken cancellationToken)
    {
        var schoolId = Guid.NewGuid().ToString();
        var tenantId = _currentUser.TenantId;
        var userId = _currentUser.UserId;

        var sql = @"
            INSERT INTO Schools (
                Id, TenantId, Name, Address, City, State, Pincode, Phone, Email,
                Board, Category, StrengthPrimary, StrengthSecondary,
                StrengthSeniorSecondary, SalesmanId, CreatedAt, CreatedBy
            )
            VALUES (
                @Id, @TenantId, @Name, @Address, @City, @State, @Pincode, @Phone, @Email,
                @Board, @Category, @StrengthPrimary, @StrengthSecondary,
                @StrengthSeniorSecondary, @SalesmanId, @CreatedAt, @CreatedBy
            );

            SELECT * FROM Schools WHERE Id = @Id AND TenantId = @TenantId;
        ";

        var school = await _connection.QueryFirstOrDefaultAsync<School>(sql, new
        {
            Id = schoolId,
            TenantId = tenantId,
            request.Name,
            request.Address,
            request.City,
            request.State,
            request.Pincode,
            request.Phone,
            request.Email,
            request.Board,
            request.Category,
            request.StrengthPrimary,
            request.StrengthSecondary,
            request.StrengthSeniorSecondary,
            request.SalesmanId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        });

        var dto = _mapper.Map<SchoolDto>(school);
        return Result<SchoolDto>.Success(dto);
    }
}
```

---

### Query Example - Get Schools
```csharp
// Domain/Queries/Schools/GetSchoolsQuery.cs
public class GetSchoolsQuery : IRequest<Result<PagedList<SchoolDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SalesmanId { get; set; }
    public string City { get; set; }
    public string Board { get; set; }
    public string SearchTerm { get; set; }
}

// Application/Handlers/Schools/GetSchoolsHandler.cs
public class GetSchoolsHandler : IRequestHandler<GetSchoolsQuery, Result<PagedList<SchoolDto>>>
{
    private readonly IDbConnection _connection;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public GetSchoolsHandler(
        IDbConnection connection,
        ICurrentUserService currentUser,
        IMapper mapper)
    {
        _connection = connection;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<Result<PagedList<SchoolDto>>> Handle(
        GetSchoolsQuery request,
        CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;
        var offset = (request.Page - 1) * request.PageSize;

        var whereClauses = new List<string> { "TenantId = @TenantId", "IsDeleted = 0" };
        var parameters = new DynamicParameters();
        parameters.Add("TenantId", tenantId);
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", request.PageSize);

        if (!string.IsNullOrEmpty(request.SalesmanId))
        {
            whereClauses.Add("SalesmanId = @SalesmanId");
            parameters.Add("SalesmanId", request.SalesmanId);
        }

        if (!string.IsNullOrEmpty(request.City))
        {
            whereClauses.Add("City = @City");
            parameters.Add("City", request.City);
        }

        if (!string.IsNullOrEmpty(request.Board))
        {
            whereClauses.Add("Board = @Board");
            parameters.Add("Board", request.Board);
        }

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            whereClauses.Add("(Name LIKE @SearchTerm OR Phone LIKE @SearchTerm)");
            parameters.Add("SearchTerm", $"%{request.SearchTerm}%");
        }

        var whereClause = string.Join(" AND ", whereClauses);

        var countSql = $"SELECT COUNT(*) FROM Schools WHERE {whereClause}";
        var totalCount = await _connection.ExecuteScalarAsync<int>(countSql, parameters);

        var dataSql = $@"
            SELECT * FROM Schools
            WHERE {whereClause}
            ORDER BY Name
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
        ";

        var schools = await _connection.QueryAsync<School>(dataSql, parameters);
        var dtos = _mapper.Map<List<SchoolDto>>(schools);

        var pagedList = new PagedList<SchoolDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };

        return Result<PagedList<SchoolDto>>.Success(pagedList);
    }
}
```

---

## Part 7: Dapper Query Examples

### Simple Query
```csharp
// Get single record
var school = await _connection.QueryFirstOrDefaultAsync<School>(
    "SELECT * FROM Schools WHERE Id = @Id AND TenantId = @TenantId",
    new { Id = schoolId, TenantId = tenantId }
);

// Get multiple records
var schools = await _connection.QueryAsync<School>(
    "SELECT * FROM Schools WHERE TenantId = @TenantId AND IsDeleted = 0",
    new { TenantId = tenantId }
);
```

---

### Multi-Mapping (Join Queries)
```csharp
// Get School with Salesman
var sql = @"
    SELECT
        s.*,
        sm.Id, sm.Name, sm.Phone, sm.Email, sm.Region, sm.Territory
    FROM Schools s
    INNER JOIN Salesmen sm ON s.SalesmanId = sm.Id
    WHERE s.Id = @SchoolId AND s.TenantId = @TenantId
";

var schoolDict = new Dictionary<string, School>();

var result = await _connection.QueryAsync<School, Salesman, School>(
    sql,
    (school, salesman) =>
    {
        if (!schoolDict.TryGetValue(school.Id, out var schoolEntry))
        {
            schoolEntry = school;
            schoolEntry.Salesman = salesman;
            schoolDict.Add(school.Id, schoolEntry);
        }
        return schoolEntry;
    },
    new { SchoolId = schoolId, TenantId = tenantId },
    splitOn: "Id"
);

var school = result.FirstOrDefault();
```

---

### Multi-Mapping with One-to-Many
```csharp
// Get Visit with ContactPersons and Specimens
var sql = @"
    SELECT
        v.*,
        cp.Id, cp.Name, cp.Designation, cp.Phone,
        sg.Id, sg.BookId, sg.Quantity, sg.MRP, sg.Cost
    FROM Visits v
    LEFT JOIN VisitContactPersons vcp ON v.Id = vcp.VisitId
    LEFT JOIN ContactPersons cp ON vcp.ContactPersonId = cp.Id
    LEFT JOIN SpecimensGiven sg ON v.Id = sg.VisitId
    WHERE v.Id = @VisitId AND v.TenantId = @TenantId
";

var visitDict = new Dictionary<string, Visit>();

var result = await _connection.QueryAsync<Visit, ContactPerson, SpecimenGiven, Visit>(
    sql,
    (visit, contact, specimen) =>
    {
        if (!visitDict.TryGetValue(visit.Id, out var visitEntry))
        {
            visitEntry = visit;
            visitEntry.ContactPersons = new List<ContactPerson>();
            visitEntry.SpecimensGiven = new List<SpecimenGiven>();
            visitDict.Add(visit.Id, visitEntry);
        }

        if (contact != null && !visitEntry.ContactPersons.Any(c => c.Id == contact.Id))
        {
            visitEntry.ContactPersons.Add(contact);
        }

        if (specimen != null && !visitEntry.SpecimensGiven.Any(s => s.Id == specimen.Id))
        {
            visitEntry.SpecimensGiven.Add(specimen);
        }

        return visitEntry;
    },
    new { VisitId = visitId, TenantId = tenantId },
    splitOn: "Id,Id"
);

var visit = visitDict.Values.FirstOrDefault();
```

---

### Transaction Example
```csharp
public async Task<Result> CreateVisitWithDetails(CreateVisitCommand command)
{
    using var transaction = _connection.BeginTransaction();

    try
    {
        // 1. Insert Visit
        var visitId = Guid.NewGuid().ToString();
        var insertVisitSql = @"
            INSERT INTO Visits (Id, TenantId, Type, SalesmanId, SchoolId, VisitDate,
                Purposes, Notes, Status, CreatedAt, CreatedBy)
            VALUES (@Id, @TenantId, @Type, @SalesmanId, @SchoolId, @VisitDate,
                @Purposes, @Notes, @Status, @CreatedAt, @CreatedBy)
        ";

        await _connection.ExecuteAsync(insertVisitSql, new
        {
            Id = visitId,
            TenantId = _currentUser.TenantId,
            command.Type,
            command.SalesmanId,
            command.SchoolId,
            command.VisitDate,
            Purposes = JsonSerializer.Serialize(command.Purposes),
            command.Notes,
            Status = "completed",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId
        }, transaction);

        // 2. Insert VisitContactPersons
        if (command.ContactPersonIds?.Any() == true)
        {
            var contactSql = @"
                INSERT INTO VisitContactPersons (Id, VisitId, ContactPersonId)
                VALUES (@Id, @VisitId, @ContactPersonId)
            ";

            foreach (var contactId in command.ContactPersonIds)
            {
                await _connection.ExecuteAsync(contactSql, new
                {
                    Id = Guid.NewGuid().ToString(),
                    VisitId = visitId,
                    ContactPersonId = contactId
                }, transaction);
            }
        }

        // 3. Insert SpecimensGiven
        if (command.SpecimensGiven?.Any() == true)
        {
            var specimenSql = @"
                INSERT INTO SpecimensGiven (Id, TenantId, VisitId, BookId, Quantity, MRP, Cost, CreatedAt)
                VALUES (@Id, @TenantId, @VisitId, @BookId, @Quantity, @MRP, @Cost, @CreatedAt)
            ";

            foreach (var specimen in command.SpecimensGiven)
            {
                await _connection.ExecuteAsync(specimenSql, new
                {
                    Id = Guid.NewGuid().ToString(),
                    TenantId = _currentUser.TenantId,
                    VisitId = visitId,
                    specimen.BookId,
                    specimen.Quantity,
                    specimen.MRP,
                    specimen.Cost,
                    CreatedAt = DateTime.UtcNow
                }, transaction);
            }
        }

        transaction.Commit();
        return Result.Success();
    }
    catch (Exception ex)
    {
        transaction.Rollback();
        return Result.Failure($"Failed to create visit: {ex.Message}");
    }
}
```

---

### Stored Procedure Execution
```csharp
// Execute stored procedure with parameters
var result = await _connection.QueryAsync<VisitReport>(
    "usp_GetVisitReport",
    new
    {
        TenantId = tenantId,
        StartDate = startDate,
        EndDate = endDate,
        SalesmanId = salesmanId
    },
    commandType: CommandType.StoredProcedure
);

// Execute with output parameters
var parameters = new DynamicParameters();
parameters.Add("@TenantId", tenantId);
parameters.Add("@StartDate", startDate);
parameters.Add("@EndDate", endDate);
parameters.Add("@TotalVisits", dbType: DbType.Int32, direction: ParameterDirection.Output);

await _connection.ExecuteAsync(
    "usp_CalculateVisitStats",
    parameters,
    commandType: CommandType.StoredProcedure
);

var totalVisits = parameters.Get<int>("@TotalVisits");
```

---

### Bulk Insert
```csharp
// Bulk insert using Dapper
public async Task BulkInsertSchools(List<School> schools)
{
    var sql = @"
        INSERT INTO Schools (
            Id, TenantId, Name, Address, City, State, Pincode, Phone, Email,
            Board, Category, StrengthPrimary, StrengthSecondary,
            StrengthSeniorSecondary, SalesmanId, CreatedAt, CreatedBy
        )
        VALUES (
            @Id, @TenantId, @Name, @Address, @City, @State, @Pincode, @Phone, @Email,
            @Board, @Category, @StrengthPrimary, @StrengthSecondary,
            @StrengthSeniorSecondary, @SalesmanId, @CreatedAt, @CreatedBy
        )
    ";

    await _connection.ExecuteAsync(sql, schools);
}
```

---

## Part 8: DTOs & FluentValidation

### DTOs
```csharp
// Application/DTOs/SchoolDto.cs
public class SchoolDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string Pincode { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
    public string Board { get; set; }
    public string Category { get; set; }
    public int StrengthPrimary { get; set; }
    public int StrengthSecondary { get; set; }
    public int StrengthSeniorSecondary { get; set; }
    public int TotalStrength { get; set; }
    public string SalesmanId { get; set; }
    public string SalesmanName { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Application/DTOs/VisitDto.cs
public class VisitDto
{
    public string Id { get; set; }
    public string Type { get; set; }
    public string SalesmanId { get; set; }
    public string SalesmanName { get; set; }
    public string SchoolId { get; set; }
    public string SchoolName { get; set; }
    public string BookSellerId { get; set; }
    public string BookSellerName { get; set; }
    public DateTime VisitDate { get; set; }
    public List<string> Purposes { get; set; }
    public string Notes { get; set; }
    public string Status { get; set; }
    public List<ContactPersonDto> ContactPersons { get; set; }
    public List<SpecimenGivenDto> SpecimensGiven { get; set; }
    public List<SpecimenReturnedDto> SpecimensReturned { get; set; }
    public VisitFeedbackDto Feedback { get; set; }
    public JointWorkingDto JointWorking { get; set; }
    public NextVisitDto NextVisit { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Application/DTOs/LoginResponseDto.cs
public class LoginResponseDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; }
}

// Application/DTOs/DashboardDto.cs
public class AdminDashboardDto
{
    public int TotalSalesmen { get; set; }
    public int ActiveSalesmen { get; set; }
    public int TotalSchools { get; set; }
    public int TotalBookSellers { get; set; }
    public int TodayVisits { get; set; }
    public int WeekVisits { get; set; }
    public int MonthVisits { get; set; }
    public decimal PendingExpenses { get; set; }
    public int PendingExpenseReports { get; set; }
    public List<RecentVisitDto> RecentVisits { get; set; }
    public List<TopPerformerDto> TopPerformers { get; set; }
}

public class SalesmanDashboardDto
{
    public int TodayVisits { get; set; }
    public int PendingVisits { get; set; }
    public int CompletedVisitsThisWeek { get; set; }
    public int CompletedVisitsThisMonth { get; set; }
    public decimal PendingExpenses { get; set; }
    public List<UpcomingVisitDto> UpcomingVisits { get; set; }
    public List<RecentVisitDto> RecentVisits { get; set; }
    public AttendanceStatusDto TodayAttendance { get; set; }
}
```

---

### FluentValidation Validators
```csharp
// Application/Validators/CreateVisitValidator.cs
public class CreateVisitValidator : AbstractValidator<CreateVisitCommand>
{
    public CreateVisitValidator()
    {
        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required")
            .Must(x => x == "school" || x == "bookseller")
            .WithMessage("Type must be 'school' or 'bookseller'");

        RuleFor(x => x.SalesmanId)
            .NotEmpty().WithMessage("SalesmanId is required");

        RuleFor(x => x.SchoolId)
            .NotEmpty()
            .When(x => x.Type == "school")
            .WithMessage("SchoolId is required for school visits");

        RuleFor(x => x.BookSellerId)
            .NotEmpty()
            .When(x => x.Type == "bookseller")
            .WithMessage("BookSellerId is required for bookseller visits");

        RuleFor(x => x.VisitDate)
            .NotEmpty().WithMessage("VisitDate is required")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("VisitDate cannot be in the future");

        RuleFor(x => x.Purposes)
            .NotEmpty().WithMessage("At least one purpose is required");

        RuleForEach(x => x.SpecimensGiven)
            .SetValidator(new SpecimenGivenValidator());
    }
}

public class SpecimenGivenValidator : AbstractValidator<SpecimenGivenDto>
{
    public SpecimenGivenValidator()
    {
        RuleFor(x => x.BookId)
            .NotEmpty().WithMessage("BookId is required");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.MRP)
            .GreaterThan(0).WithMessage("MRP must be greater than 0");

        RuleFor(x => x.Cost)
            .GreaterThanOrEqualTo(0).WithMessage("Cost must be non-negative");
    }
}

// Application/Validators/CreateExpenseValidator.cs
public class CreateExpenseValidator : AbstractValidator<CreateExpenseCommand>
{
    public CreateExpenseValidator()
    {
        RuleFor(x => x.ExpenseDate)
            .NotEmpty().WithMessage("ExpenseDate is required")
            .LessThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("ExpenseDate cannot be in the future");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Type is required")
            .Must(x => new[] { "Travel", "Food", "Accommodation" }.Contains(x))
            .WithMessage("Invalid expense type");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0")
            .LessThan(50000).WithMessage("Amount exceeds limit");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");
    }
}

// Application/Validators/LoginValidator.cs
public class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone is required")
            .Matches(@"^\d{10}$").WithMessage("Phone must be 10 digits");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters");
    }
}
```

---

### Validation Pipeline Behavior
```csharp
// Application/Behaviors/ValidationBehavior.cs
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken))
        );

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
        {
            throw new ValidationException(failures);
        }

        return await next();
    }
}

// Register in Program.cs
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
```

---

## Part 9: SignalR Real-Time Notifications

### NotificationHub
```csharp
// Infrastructure/Hubs/NotificationHub.cs
[Authorize]
public class NotificationHub : Hub
{
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public NotificationHub(
        ICurrentUserService currentUser,
        INotificationService notificationService)
    {
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = _currentUser.UserId;
        var tenantId = _currentUser.TenantId;

        // Add to tenant group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");

        // Add to user group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var userId = _currentUser.UserId;
        var tenantId = _currentUser.TenantId;

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"tenant_{tenantId}");
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

        await base.OnDisconnectedAsync(exception);
    }

    public async Task MarkAsRead(string notificationId)
    {
        await _notificationService.MarkAsReadAsync(notificationId);
        await Clients.Caller.SendAsync("NotificationRead", notificationId);
    }
}
```

---

### NotificationService
```csharp
// Application/Services/NotificationService.cs
public interface INotificationService
{
    Task SendToUserAsync(string userId, NotificationDto notification);
    Task SendToTenantAsync(string tenantId, NotificationDto notification);
    Task SendToRoleAsync(string tenantId, string role, NotificationDto notification);
    Task MarkAsReadAsync(string notificationId);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IDbConnection _connection;
    private readonly ICurrentUserService _currentUser;

    public NotificationService(
        IHubContext<NotificationHub> hubContext,
        IDbConnection connection,
        ICurrentUserService currentUser)
    {
        _hubContext = hubContext;
        _connection = connection;
        _currentUser = currentUser;
    }

    public async Task SendToUserAsync(string userId, NotificationDto notification)
    {
        // Save to database
        await SaveNotificationAsync(userId, notification);

        // Send via SignalR
        await _hubContext.Clients
            .Group($"user_{userId}")
            .SendAsync("ReceiveNotification", notification);
    }

    public async Task SendToTenantAsync(string tenantId, NotificationDto notification)
    {
        // Get all users in tenant
        var users = await _connection.QueryAsync<string>(
            "SELECT Id FROM Users WHERE TenantId = @TenantId",
            new { TenantId = tenantId }
        );

        // Save to database for each user
        foreach (var userId in users)
        {
            await SaveNotificationAsync(userId, notification);
        }

        // Broadcast to tenant group
        await _hubContext.Clients
            .Group($"tenant_{tenantId}")
            .SendAsync("ReceiveNotification", notification);
    }

    public async Task SendToRoleAsync(string tenantId, string role, NotificationDto notification)
    {
        var users = await _connection.QueryAsync<string>(
            "SELECT Id FROM Users WHERE TenantId = @TenantId AND Role = @Role",
            new { TenantId = tenantId, Role = role }
        );

        foreach (var userId in users)
        {
            await SendToUserAsync(userId, notification);
        }
    }

    public async Task MarkAsReadAsync(string notificationId)
    {
        await _connection.ExecuteAsync(
            "UPDATE Notifications SET IsRead = 1 WHERE Id = @Id",
            new { Id = notificationId }
        );
    }

    private async Task SaveNotificationAsync(string userId, NotificationDto notification)
    {
        var sql = @"
            INSERT INTO Notifications (
                Id, TenantId, UserId, Type, Title, Message, Data, IsRead, CreatedAt
            )
            VALUES (
                @Id, @TenantId, @UserId, @Type, @Title, @Message, @Data, 0, @CreatedAt
            )
        ";

        await _connection.ExecuteAsync(sql, new
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = _currentUser.TenantId,
            UserId = userId,
            notification.Type,
            notification.Title,
            notification.Message,
            Data = JsonSerializer.Serialize(notification.Data),
            CreatedAt = DateTime.UtcNow
        });
    }
}
```

---

### Register SignalR in Program.cs
```csharp
// Program.cs
builder.Services.AddSignalR();

app.MapHub<NotificationHub>("/hubs/notifications");
```

---

## Part 10: Firebase Cloud Messaging (FCM)

### FCM Service
```csharp
// Application/Services/IFcmService.cs
public interface IFcmService
{
    Task SendPushNotificationAsync(string deviceToken, string title, string body, Dictionary<string, string> data = null);
    Task SendToMultipleDevicesAsync(List<string> deviceTokens, string title, string body, Dictionary<string, string> data = null);
    Task SendToTopicAsync(string topic, string title, string body, Dictionary<string, string> data = null);
}

// Infrastructure/Services/FcmService.cs
public class FcmService : IFcmService
{
    private readonly FirebaseMessaging _messaging;
    private readonly ILogger<FcmService> _logger;

    public FcmService(ILogger<FcmService> logger)
    {
        _logger = logger;

        // Initialize Firebase Admin SDK
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
        });

        _messaging = FirebaseMessaging.DefaultInstance;
    }

    public async Task SendPushNotificationAsync(
        string deviceToken,
        string title,
        string body,
        Dictionary<string, string> data = null)
    {
        try
        {
            var message = new Message
            {
                Token = deviceToken,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data,
                Android = new AndroidConfig
                {
                    Priority = Priority.High,
                    Notification = new AndroidNotification
                    {
                        Sound = "default",
                        ChannelId = "goodluck_notifications"
                    }
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Sound = "default",
                        Badge = 1
                    }
                }
            };

            var response = await _messaging.SendAsync(message);
            _logger.LogInformation($"FCM message sent successfully: {response}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending FCM notification");
            throw;
        }
    }

    public async Task SendToMultipleDevicesAsync(
        List<string> deviceTokens,
        string title,
        string body,
        Dictionary<string, string> data = null)
    {
        if (!deviceTokens.Any()) return;

        try
        {
            var message = new MulticastMessage
            {
                Tokens = deviceTokens,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data
            };

            var response = await _messaging.SendEachForMulticastAsync(message);
            _logger.LogInformation($"FCM multicast sent. Success: {response.SuccessCount}, Failure: {response.FailureCount}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending FCM multicast");
            throw;
        }
    }

    public async Task SendToTopicAsync(
        string topic,
        string title,
        string body,
        Dictionary<string, string> data = null)
    {
        try
        {
            var message = new Message
            {
                Topic = topic,
                Notification = new Notification
                {
                    Title = title,
                    Body = body
                },
                Data = data
            };

            var response = await _messaging.SendAsync(message);
            _logger.LogInformation($"FCM topic message sent: {response}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending FCM topic notification");
            throw;
        }
    }
}
```

---

### Push Notification Types
```csharp
// Application/Services/PushNotificationService.cs
public class PushNotificationService
{
    private readonly IFcmService _fcmService;
    private readonly IDbConnection _connection;

    public PushNotificationService(IFcmService fcmService, IDbConnection connection)
    {
        _fcmService = fcmService;
        _connection = connection;
    }

    public async Task SendVisitReminderAsync(string salesmanId, Visit visit)
    {
        var devices = await GetUserDevicesAsync(salesmanId);

        var title = "Visit Reminder";
        var body = $"You have a visit scheduled at {visit.SchoolName} today";
        var data = new Dictionary<string, string>
        {
            { "type", "visit_reminder" },
            { "visitId", visit.Id },
            { "schoolId", visit.SchoolId }
        };

        await _fcmService.SendToMultipleDevicesAsync(devices, title, body, data);
    }

    public async Task SendExpenseApprovedAsync(string salesmanId, Expense expense)
    {
        var devices = await GetUserDevicesAsync(salesmanId);

        var title = "Expense Approved";
        var body = $"Your expense of ₹{expense.Amount} has been approved";
        var data = new Dictionary<string, string>
        {
            { "type", "expense_approved" },
            { "expenseId", expense.Id }
        };

        await _fcmService.SendToMultipleDevicesAsync(devices, title, body, data);
    }

    public async Task SendExpenseRejectedAsync(string salesmanId, Expense expense, string reason)
    {
        var devices = await GetUserDevicesAsync(salesmanId);

        var title = "Expense Rejected";
        var body = $"Your expense of ₹{expense.Amount} was rejected: {reason}";
        var data = new Dictionary<string, string>
        {
            { "type", "expense_rejected" },
            { "expenseId", expense.Id },
            { "reason", reason }
        };

        await _fcmService.SendToMultipleDevicesAsync(devices, title, body, data);
    }

    public async Task BroadcastAnnouncementAsync(string tenantId, string message)
    {
        await _fcmService.SendToTopicAsync($"tenant_{tenantId}", "Announcement", message);
    }

    private async Task<List<string>> GetUserDevicesAsync(string userId)
    {
        var tokens = await _connection.QueryAsync<string>(
            "SELECT DeviceToken FROM UserDevices WHERE UserId = @UserId AND IsActive = 1",
            new { UserId = userId }
        );

        return tokens.ToList();
    }
}
```

---

## Part 11: Hangfire Background Jobs

### Hangfire Configuration
```csharp
// Program.cs
builder.Services.AddHangfire(config =>
{
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddHangfireServer();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});
```

---

### Background Job Service
```csharp
// Application/Services/BackgroundJobService.cs
public interface IBackgroundJobService
{
    void ScheduleDailyVisitReminders();
    void ScheduleWeeklyReports();
    void ScheduleMonthlyExpenseReportReminders();
    void EnqueueVisitReminder(string visitId);
    void EnqueueExpenseApprovalNotification(string expenseId);
}

public class BackgroundJobService : IBackgroundJobService
{
    private readonly IDbConnection _connection;
    private readonly PushNotificationService _pushNotificationService;
    private readonly INotificationService _notificationService;

    public BackgroundJobService(
        IDbConnection connection,
        PushNotificationService pushNotificationService,
        INotificationService notificationService)
    {
        _connection = connection;
        _pushNotificationService = pushNotificationService;
        _notificationService = notificationService;
    }

    public void ScheduleDailyVisitReminders()
    {
        RecurringJob.AddOrUpdate(
            "daily-visit-reminders",
            () => SendDailyVisitRemindersAsync(),
            Cron.Daily(8) // Every day at 8 AM
        );
    }

    public void ScheduleWeeklyReports()
    {
        RecurringJob.AddOrUpdate(
            "weekly-performance-reports",
            () => GenerateWeeklyReportsAsync(),
            Cron.Weekly(DayOfWeek.Monday, 9) // Every Monday at 9 AM
        );
    }

    public void ScheduleMonthlyExpenseReportReminders()
    {
        RecurringJob.AddOrUpdate(
            "monthly-expense-reminders",
            () => SendExpenseReportRemindersAsync(),
            Cron.Monthly(25, 10) // 25th of every month at 10 AM
        );
    }

    public void EnqueueVisitReminder(string visitId)
    {
        BackgroundJob.Enqueue(() => SendVisitReminderAsync(visitId));
    }

    public void EnqueueExpenseApprovalNotification(string expenseId)
    {
        BackgroundJob.Enqueue(() => SendExpenseApprovalNotificationAsync(expenseId));
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task SendDailyVisitRemindersAsync()
    {
        var today = DateTime.UtcNow.Date;

        var visits = await _connection.QueryAsync<dynamic>(
            @"SELECT
                nv.Id, nv.ScheduledDate, nv.Purpose,
                s.Id AS SchoolId, s.Name AS SchoolName,
                sm.Id AS SalesmanId, sm.UserId
              FROM NextVisits nv
              INNER JOIN Visits v ON nv.VisitId = v.Id
              INNER JOIN Schools s ON v.SchoolId = s.Id
              INNER JOIN Salesmen sm ON v.SalesmanId = sm.Id
              WHERE nv.ScheduledDate = @Today",
            new { Today = today }
        );

        foreach (var visit in visits)
        {
            await _pushNotificationService.SendVisitReminderAsync(
                visit.SalesmanId,
                new Visit
                {
                    Id = visit.Id,
                    SchoolId = visit.SchoolId,
                    SchoolName = visit.SchoolName
                }
            );

            await _notificationService.SendToUserAsync(
                visit.UserId,
                new NotificationDto
                {
                    Type = "visit_reminder",
                    Title = "Visit Reminder",
                    Message = $"You have a visit scheduled at {visit.SchoolName} today",
                    Data = new { visitId = visit.Id, schoolId = visit.SchoolId }
                }
            );
        }
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateWeeklyReportsAsync()
    {
        var tenants = await _connection.QueryAsync<string>(
            "SELECT DISTINCT TenantId FROM Users"
        );

        foreach (var tenantId in tenants)
        {
            // Generate weekly performance report
            var startDate = DateTime.UtcNow.AddDays(-7);
            var endDate = DateTime.UtcNow;

            var stats = await _connection.QueryFirstOrDefaultAsync<dynamic>(
                @"SELECT
                    COUNT(*) AS TotalVisits,
                    COUNT(DISTINCT SalesmanId) AS ActiveSalesmen,
                    COUNT(DISTINCT SchoolId) AS SchoolsVisited
                  FROM Visits
                  WHERE TenantId = @TenantId
                    AND VisitDate BETWEEN @StartDate AND @EndDate",
                new { TenantId = tenantId, StartDate = startDate, EndDate = endDate }
            );

            // Send to all admins in tenant
            await _notificationService.SendToRoleAsync(
                tenantId,
                "admin",
                new NotificationDto
                {
                    Type = "weekly_report",
                    Title = "Weekly Performance Report",
                    Message = $"Total Visits: {stats.TotalVisits}, Active Salesmen: {stats.ActiveSalesmen}",
                    Data = new { startDate, endDate, stats }
                }
            );
        }
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task SendExpenseReportRemindersAsync()
    {
        var salesmen = await _connection.QueryAsync<dynamic>(
            @"SELECT s.Id, s.UserId, u.TenantId
              FROM Salesmen s
              INNER JOIN Users u ON s.UserId = u.Id
              WHERE u.IsActive = 1"
        );

        foreach (var salesman in salesmen)
        {
            await _notificationService.SendToUserAsync(
                salesman.UserId,
                new NotificationDto
                {
                    Type = "expense_reminder",
                    Title = "Expense Report Reminder",
                    Message = "Please submit your monthly expense report",
                    Data = new { salesmanId = salesman.Id }
                }
            );
        }
    }

    public async Task SendVisitReminderAsync(string visitId)
    {
        var visit = await _connection.QueryFirstOrDefaultAsync<dynamic>(
            @"SELECT v.*, s.Name AS SchoolName, sm.UserId
              FROM Visits v
              INNER JOIN Schools s ON v.SchoolId = s.Id
              INNER JOIN Salesmen sm ON v.SalesmanId = sm.Id
              WHERE v.Id = @VisitId",
            new { VisitId = visitId }
        );

        if (visit != null)
        {
            await _pushNotificationService.SendVisitReminderAsync(
                visit.SalesmanId,
                new Visit
                {
                    Id = visit.Id,
                    SchoolId = visit.SchoolId,
                    SchoolName = visit.SchoolName
                }
            );
        }
    }

    public async Task SendExpenseApprovalNotificationAsync(string expenseId)
    {
        var expense = await _connection.QueryFirstOrDefaultAsync<Expense>(
            "SELECT * FROM Expenses WHERE Id = @Id",
            new { Id = expenseId }
        );

        if (expense != null && expense.Status == "approved")
        {
            await _pushNotificationService.SendExpenseApprovedAsync(
                expense.SalesmanId,
                expense
            );
        }
    }
}
```

---

### Initialize Background Jobs
```csharp
// Program.cs - After app is built
var jobService = app.Services.GetRequiredService<IBackgroundJobService>();
jobService.ScheduleDailyVisitReminders();
jobService.ScheduleWeeklyReports();
jobService.ScheduleMonthlyExpenseReportReminders();
```

---

## Part 12: File Upload / Azure Blob Storage

### File Storage Service
```csharp
// Application/Services/IFileStorageService.cs
public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<string> UploadReceiptAsync(Stream fileStream, string fileName, string salesmanId);
    Task DeleteFileAsync(string fileUrl);
    Task<Stream> DownloadFileAsync(string fileUrl);
}

// Infrastructure/Services/AzureBlobStorageService.cs
public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IConfiguration configuration,
        ILogger<AzureBlobStorageService> logger)
    {
        _logger = logger;
        var connectionString = configuration["AzureStorage:ConnectionString"];
        _containerName = configuration["AzureStorage:ContainerName"];
        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var blobClient = containerClient.GetBlobClient(uniqueFileName);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders
            });

            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage");
            throw;
        }
    }

    public async Task<string> UploadReceiptAsync(Stream fileStream, string fileName, string salesmanId)
    {
        var folder = $"receipts/{salesmanId}/{DateTime.UtcNow:yyyy/MM}";
        var fullFileName = $"{folder}/{fileName}";

        return await UploadFileAsync(fileStream, fullFileName, "image/jpeg");
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var blobName = uri.Segments.Last();

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.DeleteIfExistsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob Storage");
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var blobName = uri.Segments.Last();

            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var response = await blobClient.DownloadAsync();
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from Azure Blob Storage");
            throw;
        }
    }
}
```

---

### Upload Receipt Endpoint
```csharp
// API/Controllers/ExpensesController.cs
[HttpPost("upload-receipt")]
[Authorize(Roles = "salesman")]
public async Task<IActionResult> UploadReceipt(
    [FromForm] IFormFile file,
    [FromForm] string expenseId)
{
    if (file == null || file.Length == 0)
        return BadRequest("No file uploaded");

    // Validate file type
    var allowedTypes = new[] { "image/jpeg", "image/png", "image/jpg", "application/pdf" };
    if (!allowedTypes.Contains(file.ContentType.ToLower()))
        return BadRequest("Invalid file type. Only JPEG, PNG, and PDF are allowed");

    // Validate file size (5MB max)
    if (file.Length > 5 * 1024 * 1024)
        return BadRequest("File size exceeds 5MB limit");

    var salesmanId = _currentUser.SalesmanId;

    using var stream = file.OpenReadStream();
    var fileUrl = await _fileStorageService.UploadReceiptAsync(
        stream,
        file.FileName,
        salesmanId
    );

    // Update expense with receipt URL
    await _connection.ExecuteAsync(
        @"UPDATE Expenses
          SET ReceiptUrl = @ReceiptUrl, ModifiedAt = @ModifiedAt, ModifiedBy = @ModifiedBy
          WHERE Id = @ExpenseId AND SalesmanId = @SalesmanId",
        new
        {
            ReceiptUrl = fileUrl,
            ExpenseId = expenseId,
            SalesmanId = salesmanId,
            ModifiedAt = DateTime.UtcNow,
            ModifiedBy = _currentUser.UserId
        }
    );

    return Ok(new { receiptUrl = fileUrl });
}
```

---

### AWS S3 Alternative
```csharp
// Infrastructure/Services/AwsS3StorageService.cs
public class AwsS3StorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<AwsS3StorageService> _logger;

    public AwsS3StorageService(
        IConfiguration configuration,
        ILogger<AwsS3StorageService> logger)
    {
        _logger = logger;
        _bucketName = configuration["AWS:S3:BucketName"];

        var awsOptions = new AmazonS3Config
        {
            RegionEndpoint = RegionEndpoint.GetBySystemName(configuration["AWS:Region"])
        };

        _s3Client = new AmazonS3Client(
            configuration["AWS:AccessKey"],
            configuration["AWS:SecretKey"],
            awsOptions
        );
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = uniqueFileName,
                InputStream = fileStream,
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            };

            await _s3Client.PutObjectAsync(request);

            return $"https://{_bucketName}.s3.amazonaws.com/{uniqueFileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to AWS S3");
            throw;
        }
    }

    public async Task<string> UploadReceiptAsync(Stream fileStream, string fileName, string salesmanId)
    {
        var folder = $"receipts/{salesmanId}/{DateTime.UtcNow:yyyy/MM}";
        var fullFileName = $"{folder}/{fileName}";

        return await UploadFileAsync(fileStream, fullFileName, "image/jpeg");
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var key = uri.AbsolutePath.TrimStart('/');

            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from AWS S3");
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var key = uri.AbsolutePath.TrimStart('/');

            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectAsync(request);
            return response.ResponseStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from AWS S3");
            throw;
        }
    }
}
```

---

## Conclusion

This completes the **Indus DVR Backend Specification** for the GoodLuck CRM system. The specification covers:

✅ **88 REST API Endpoints** (Authentication, Dashboard, Schools, Salesmen, Booksellers, Visits, Expenses, Reports, Notifications, etc.)
✅ **20+ Database Tables** with multi-tenant design and audit trails
✅ **CQRS Architecture** with MediatR for command/query separation
✅ **Dapper + ADO.NET** for data access (NOT Entity Framework)
✅ **FluentValidation** for request validation
✅ **SignalR** for real-time notifications
✅ **Firebase Cloud Messaging (FCM)** for push notifications
✅ **Hangfire** for background job processing
✅ **Azure Blob Storage / AWS S3** for file uploads
✅ **Clean Architecture** with proper separation of concerns
✅ **JWT Authentication** with refresh tokens
✅ **Role-Based Access Control (RBAC)**
✅ **DbUp** for database migrations

This specification is ready for backend development using **ASP.NET Core (.NET 10)** and **C# 14**.

---

