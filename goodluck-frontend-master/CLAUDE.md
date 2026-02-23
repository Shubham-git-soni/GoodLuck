# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoodLuck Frontend is a Next.js CRM system for managing school and bookseller relationships. It has two distinct interfaces:
- **Salesman Mobile App** (`/salesman/*`): Mobile-first field operations and visit tracking
- **Admin Web Portal** (`/admin/*`): Desktop-optimized analytics, management, and reporting

This is a **frontend-only** project using mock/dummy JSON data with no backend integration.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## Architecture

### Routing Structure

```
src/app/
├── login/            # Dual login (Salesman + Admin)
├── admin/            # Admin portal (36+ pages, desktop-optimized)
│   ├── layout.tsx    # AdminSidebar + responsive wrapper (pl-64 desktop)
│   ├── dashboard/
│   ├── analytics/    # School & prescribed book analytics
│   ├── lists/        # Booksellers, Contacts, Schools
│   ├── reports/      # Visits, compliance, performance, loyalty, gap analysis
│   ├── team/         # Sales team management
│   ├── managers/
│   ├── tour-plans/
│   ├── expenses/
│   ├── feedback/
│   ├── specimen/
│   ├── tada/
│   ├── pm-schedule/
│   ├── erp/
│   ├── books/
│   └── settings/     # Dropdowns, white-label
└── salesman/         # Salesman app (35+ pages, mobile-first)
    ├── layout.tsx    # MobileNav
    ├── dashboard/
    ├── schools/
    │   ├── [id]/           # School profile (Kundli)
    │   ├── add-visit/      # 7-step visit form
    │   └── replacement/
    ├── booksellers/
    │   ├── [id]/           # Bookseller profile
    │   └── add-visit/
    ├── attendance/
    ├── expenses/
    ├── notifications/
    ├── today-visits/
    ├── visit-history/
    ├── next-visits/
    ├── tour-plan/
    ├── contacts/
    ├── qbs/           # Quick Batch Sellers
    └── tada/
```

### Key Directories

- **`src/lib/mock-data/`** — All data as JSON files (18 files: schools, salesmen, visits, specimens, expenses, etc.). Import directly into components.
- **`src/types/index.ts`** — All TypeScript interfaces (School, Salesman, BookSeller, Visit, Specimen, Expense, etc.)
- **`src/components/ui/`** — Shadcn UI components (30+)
- **`src/components/layouts/`** — AdminSidebar, AdminMobileNav, MobileNav, PageContainer, PageHeader
- **`src/components/forms/visit/`** — 7 step components for the school visit form

### Path Alias

`@/*` maps to `./src/*`

## Development Rules

### Styling
- Use **Tailwind CSS exclusively** for responsive design. No custom hooks like `useMobile()`.
- Salesman pages: mobile-first. Admin pages: desktop-optimized.
- Responsive pattern: `className="flex flex-col md:flex-row"`

### UI Components
- Use **Shadcn UI** (new-york style, neutral base color) for all components.
- Never use `window.alert()` or `window.confirm()` — use `<Dialog>` instead.
- Use `<Sonner>` (toast) for all success/error feedback.
- Use `<Sheet>` for mobile slide-out panels.

### Loading States
- Every data-displaying component needs a **skeleton loader**.
- Simulate loading with `setTimeout(() => setIsLoading(false), 1000)` in `useEffect`.

```tsx
{isLoading ? <Skeleton className="h-12 w-full" /> : <DataComponent />}
```

### Mock Data Pattern

```typescript
import schoolsData from '@/lib/mock-data/schools.json'

const [schools, setSchools] = useState(schoolsData)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  setTimeout(() => setIsLoading(false), 1000)
}, [])
```

### Component Conventions
- One component per file, default export
- Props interfaces defined at top of file
- Components: PascalCase (`SchoolList.tsx`), utilities: kebab-case (`format-date.ts`)

### Dependencies
Do **not** install packages automatically. Provide install commands for the user to run manually.
