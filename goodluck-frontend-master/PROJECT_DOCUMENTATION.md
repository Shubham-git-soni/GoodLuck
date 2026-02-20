# CRM System - Project Documentation
**School + Bookseller CRM Extension of DVR**

## Project Overview
A comprehensive CRM system for managing school and bookseller relationships through a dual-interface platform:
- **Salesman Mobile App**: Field operations and visit tracking
- **Admin Web Portal**: Analytics, management, and reporting

### Technology Stack
- **Framework**: Next.js (Frontend Only)
- **Data**: Mock/Dummy data (No backend integration)
- **UI Approach**: Responsive design (Mobile-first for salesman, Desktop for admin)

---

## Development Guidelines & Technical Requirements

### 1. Styling & Responsiveness
- **Use Tailwind CSS exclusively** for all responsive design
- NO custom hooks like `useMobile()` or device detection hooks
- Leverage Tailwind's responsive utilities (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- Mobile-first approach for salesman pages
- Desktop-optimized for admin portal

**Example Pattern**:
```jsx
<div className="flex flex-col md:flex-row gap-4">
  <Card className="w-full md:w-1/2 lg:w-1/3">
    {/* Mobile: full width, Tablet: half, Desktop: one-third */}
  </Card>
</div>
```

---

### 2. UI Component Library
- **Shadcn UI** (Latest version) - Primary component library
- Reference: [https://ui.shadcn.com/](https://ui.shadcn.com/)

**Required Shadcn Components**:
- `dialog` - For modals and confirmations (NO simple alerts)
- `sonner` - For toast notifications
- `skeleton` - Loading states throughout the app
- `select` - Dropdown menus
- `button` - All interactive buttons
- `card` - Content containers
- `table` - Data tables
- `form` - Form handling
- `input` - Text inputs
- `calendar` - Date pickers
- `badge` - Status indicators
- `tabs` - Tab navigation
- `sheet` - Mobile slide-out panels
- `command` - Search/command palette
- `dropdown-menu` - Action menus
- `alert` - Informational alerts (use sparingly)
- `progress` - Progress bars
- `switch` - Toggle switches
- `checkbox` - Multi-select options
- `radio-group` - Single select options
- `textarea` - Multi-line inputs
- `separator` - Visual dividers
- `avatar` - User/profile images

**Component Usage Rules**:
- Use `<Dialog>` instead of `window.alert()` or `window.confirm()`
- Use `<Sonner>` (toast) for success/error messages
- Use `<Sheet>` for mobile navigation menus
- Use `<Command>` for search functionality

---

### 3. Loading States
- **Skeleton loaders MUST be used throughout the application**
- Every data-fetching component needs a skeleton loading state
- Use `<Skeleton>` from Shadcn UI

**Implementation Pattern**:
```jsx
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
) : (
  <DataComponent data={data} />
)}
```

**Required Skeleton Patterns**:
- Card skeletons for dashboard widgets
- Table row skeletons for lists
- Form field skeletons
- Chart/graph skeletons
- Profile page skeletons

---

### 4. Dependency Management
- **DO NOT install dependencies automatically**
- User will manually install all required packages
- Provide clear dependency lists when needed

**Expected Manual Installations**:
```bash
# User will run these commands themselves
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sonner
npx shadcn-ui@latest add skeleton
# ... and other components as needed
```

**Note**: Only provide installation commands in comments or documentation, never execute them.

---

### 5. Professional Design Standards

#### Visual Design Requirements:
- **Clean & Modern**: Minimalist design with ample whitespace
- **Consistent Color Palette**:
  - Primary color for actions (e.g., blue for CTAs)
  - Success (green), Warning (yellow), Danger (red) states
  - Neutral grays for backgrounds and borders
- **Typography Hierarchy**: Clear heading sizes and weights
- **Proper Spacing**: Consistent padding and margins using Tailwind scale
- **Iconography**: Use Lucide React icons (included with Shadcn)

#### UX Requirements:
- **Clear Navigation**: Intuitive menu structure
- **Feedback on Actions**: Toast notifications for all user actions
- **Form Validation**: Inline error messages with clear guidance
- **Empty States**: Meaningful empty state messages with CTAs
- **Confirmation Dialogs**: For destructive actions (delete, remove, etc.)
- **Search & Filters**: Clear, accessible filtering options
- **Responsive Tables**: Horizontal scroll on mobile, full table on desktop
- **Loading Indicators**: Never leave users waiting without feedback

#### Accessibility:
- Proper color contrast ratios
- Keyboard navigation support
- ARIA labels where needed
- Focus states on interactive elements

#### Professional Polish:
- Smooth transitions and animations (use Tailwind's `transition-*` utilities)
- Hover states on all interactive elements
- Consistent button sizes and styles
- Professional data visualizations (use libraries like Recharts or Chart.js)
- Proper error boundaries
- Print-friendly styles for reports (optional)

---

### 6. Code Organization Standards

#### File Structure:
```
src/
├── app/                    # Next.js app directory
│   ├── salesman/          # Salesman routes
│   ├── admin/             # Admin routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Shadcn components
│   ├── dashboard/        # Dashboard widgets
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Utilities
│   ├── mock-data/        # All mock data JSON files
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
```

#### Component Patterns:
- One component per file
- Use TypeScript for all components
- Props interfaces defined at top of file
- Export components as default
- Keep components focused and single-purpose

#### Naming Conventions:
- Components: PascalCase (e.g., `SchoolList.tsx`)
- Files: kebab-case for utilities (e.g., `format-date.ts`)
- Mock data files: kebab-case (e.g., `schools-data.json`)

---

### 7. Mock Data Strategy

#### Data Files:
- Store all mock data in `src/lib/mock-data/` directory
- Use JSON format for easy manipulation
- Realistic data that represents actual use cases

#### Data Files Needed:
```
src/lib/mock-data/
├── schools.json
├── book-sellers.json
├── salesmen.json
├── specimens.json
├── visits.json
├── tada-claims.json
├── feedback.json
├── notifications.json
└── dropdown-options.json
```

#### Data Usage Pattern:
```typescript
// In components
import schoolsData from '@/lib/mock-data/schools.json'

export default function SchoolList() {
  const [schools, setSchools] = useState(schoolsData)
  // Simulate loading
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  // Component logic
}
```

---

### 8. Component Development Workflow

When creating each page:

1. **Start with Layout**: Mobile-first responsive layout with Tailwind
2. **Add Skeleton**: Implement loading state with `<Skeleton>`
3. **Build UI**: Use Shadcn components for all interactive elements
4. **Connect Mock Data**: Import and display mock data
5. **Add Interactions**:
   - Use `<Dialog>` for confirmations
   - Use `<Sonner>` for feedback
   - Handle form submissions
6. **Polish**: Add transitions, hover states, empty states
7. **Test Responsiveness**: Check on mobile, tablet, desktop breakpoints

---

## Summary of Key Rules

| Requirement | Implementation |
|-------------|----------------|
| Responsiveness | Tailwind CSS only (no custom hooks) |
| UI Components | Shadcn UI (latest docs) |
| Alerts/Notifications | Sonner, Dialog (NO simple alerts) |
| Loading States | Skeleton loaders everywhere |
| Dependencies | User installs manually |
| Design Quality | Professional, clean, modern |
| Data | Mock JSON files |
| TypeScript | Use throughout |

---

## Total Pages Required

### 📱 SALESMAN MOBILE APP (13 Pages)

#### 1. Mobile Dashboard (`/salesman/dashboard`)
**Purpose**: Overview of daily operations and key metrics

**Key Components**:
- Sales Target Card (Current season target & achievement)
- Specimen Budget Meter (Circular progress indicator)
- Visit Summary Strip
  - Today's School Visits (count)
  - Today's Book Seller Visits
  - Pending Next Visits
- School List Progress Bar
- Alerts Section (TA/DA, Return deadlines, Payment follow-ups, Manager feedback)

**Mock Data Needed**:
- Sales targets
- Specimen budget allocation
- Visit counts
- Alert notifications

---

#### 2. Attendance Page (`/salesman/attendance`)
**Purpose**: Daily check-in/check-out tracking

**Key Components**:
- "Start Day" button
- Timer display
- "End Day" button
- Auto-capture display: Timestamp, GPS, City

**Mock Data Needed**:
- Current attendance status
- Attendance history

---

#### 3. School List (`/salesman/schools`)
**Purpose**: View and manage assigned schools

**Key Components**:
- Search bar
- Filters:
  - Board
  - City
  - Visit Status (0/1/2/3 times)
  - Pattakat status
- School cards showing:
  - School Name
  - City
  - Last visited date
  - Number of contacts
- Row Actions:
  - View Profile
  - Add Visit
  - Mark Pattakat
  - Replace School

**Mock Data Needed**:
- 120 schools with details
- Visit history per school
- Contact counts

---

#### 4. School Profile / Kundli (`/salesman/schools/[id]`)
**Purpose**: Detailed school information and history

**Key Sections**:
1. Basic Info (Name, City, Board, Strength, Address)
2. Business Last 3 Years (Revenue graph)
3. Prescribed Books (Current Year with subject-wise status)
4. Sales Plan Targets (This Season)
5. Discount & Return History (Last 3 years)
6. Contacts List (Principals, VP, Librarian)
7. Visit History

**Actions Available**:
- Add New Visit
- Schedule Next Visit
- Mark Pattakat

**Mock Data Needed**:
- Complete school profiles (20-30 detailed entries)
- 3-year business history
- Contact person details
- Visit logs

---

#### 5. Add School Visit (`/salesman/schools/add-visit`)
**Purpose**: Log new school visit (Core module)

**7-Step Flow**:

**Step 1: School Selection**
- City dropdown
- School dropdown
- Auto-populate: Board, Strength, Address

**Step 2: Contact Person**
- Dropdown of existing contacts
- Add New Contact option (Name + Role)
- Support multiple contacts per visit

**Step 3: Purpose of Visit (Multi-select)**
- Need Mapping
- Post-Sales Engagement
- Relationship
- Reminder/Follow-Up
- Specimen Distribution
- If "Need Mapping" → show sub-options:
  - No change
  - Implementing NCERT
  - Changing specific subjects

**Step 4: Joint Working**
- Toggle: "Manager accompanied?"
- If YES → Select: Regional Manager / State Manager

**Step 5: Specimen Allocation (Mandatory)**
- Table: Subject | Class | Book | Qty | Cost
- Auto-calculate specimen cost (MRP × 50%)
- Running total meter
- Specimen Return section:
  - Book dropdown
  - Qty returned
  - Condition: Good / Damaged

**Step 6: Feedback Box**
- Structured dropdown:
  - Book Quality
  - Content Issue
  - Pricing
  - Competitive feedback
- Free text optional

**Step 7: Next Visit Scheduling**
- Date picker
- Purpose picker

**Mock Data Needed**:
- Cities list
- Schools per city
- Contact roles
- Visit purposes
- Specimen inventory (Subject, Class, Book, MRP)
- Manager list

---

#### 6. School Replacement Pool (`/salesman/schools/replacement`)
**Purpose**: Request school replacement

**Mock Data Needed**:
- Available schools for replacement
- Replacement history

---

#### 7. Next Visit List (`/salesman/next-visits`)
**Purpose**: Upcoming scheduled visits

**Key Components**:
- List of scheduled visits
- Date
- School name
- Purpose

**Mock Data Needed**:
- Scheduled visits (10-15 entries)

---

#### 8. Book Seller List (`/salesman/booksellers`)
**Purpose**: View and manage book seller relationships

**Key Components**:
- Search & filter
- Book seller cards showing:
  - Shop Name
  - Owner Name
  - Outstanding Amount
  - Last Visit Date

**Mock Data Needed**:
- 30-40 book seller entries

---

#### 9. Book Seller Profile / Kundli (`/salesman/booksellers/[id]`)
**Purpose**: Detailed book seller information

**Key Sections**:
1. Business Summary (3 years)
2. Invoices List
3. Credit Notes
4. Sales Return
5. Discount History
6. Payment History
7. Current Outstanding
8. Documents (agreements, ID)
9. Payment Deadlines

**Mock Data Needed**:
- Complete book seller profiles (10-15 detailed entries)
- Invoice history
- Payment records

---

#### 10. Add Book Seller Visit (`/salesman/booksellers/add-visit`)
**Purpose**: Log book seller visit

**Key Components**:
- Book seller selection
- Multi-purpose visit dropdown (multi-select):
  - Relationship Building
  - Payment Collection
  - Documentation
  - Inquiry
  - Sales Return Follow-Up
- Payment Follow-Up Section:
  - Set multiple deadlines
  - Example: "50% by 15th March"
- Notes field

**Mock Data Needed**:
- Visit purpose options
- Payment deadline templates

---

#### 11. Add New Book Seller (`/salesman/booksellers/add`)
**Purpose**: Register new book seller

**Key Components**:
- Shop Name
- Owner Name
- Contact Details
- Address
- Agreement upload
- Approval status display

**Mock Data Needed**:
- Form fields
- Pending approval queue

---

#### 12. TA/DA Submission (`/salesman/tada`)
**Purpose**: Submit travel allowance claims

**Key Components**:
- Date selector
- City dropdown
- Travel Mode dropdown
- Amount input
- Attachment upload (optional)
- Auto-validation messages:
  - Visit existence check
  - Specimen data logged check
  - Amount within limit check

**Mock Data Needed**:
- TA/DA history
- Validation rules
- Approval status

---

#### 13. Notifications (`/salesman/notifications`)
**Purpose**: System alerts and messages

**Key Components**:
- Notification list
- Categories: TA/DA, Deadlines, Feedback, Manager alerts
- Read/Unread status

**Mock Data Needed**:
- 20-30 notification entries

---

### 🖥 ADMIN WEB PORTAL (15 Pages)

#### 1. Admin Dashboard (`/admin/dashboard`)
**Purpose**: Overview of all operations

**Key Sections**:
- Visits Today (School / Bookseller)
- TA/DA Pending Approvals
- Specimen Budget Overview
- Policy Compliance Scorecard
- Schools Pattakat Count
- Pending Feedback for Product Managers
- Data Import Status (ERP)

**Graphs**:
- Weekly Visits Trend
- Specimen Usage Trend
- Collection Trend

**Mock Data Needed**:
- Aggregate statistics
- Graph data points

---

#### 2. Dynamic Dropdown Manager (`/admin/settings/dropdowns`)
**Purpose**: Manage all dropdown options system-wide

**Editable Categories**:
- Visit Purposes
- Book List
- Prescribed Books
- Discount categories
- TA/DA Rules
- Contact Roles
- Cities/Boards

**UI**: Table + Add/Delete/Edit modals

**Mock Data Needed**:
- All dropdown values for each category

---

#### 3. Sales Team Management (`/admin/team`)
**Purpose**: Manage salesmen and assignments

**Key Features**:
- Add/Remove Salesmen
- Assign 120-school lists
- Reassign schools
- View individual salesman dashboard

**Mock Data Needed**:
- Salesman profiles (10-15)
- School assignments
- Performance metrics per salesman

---

#### 4. Tour Plan Manager (`/admin/tour-plans`)
**Purpose**: Weekly tour planning and approval

**Key Components**:
- Weekly tour plan submissions
- Manager approval workflow
- Station-wise travel routes
- Checklist:
  - Planned schools
  - Actual visits comparison

**Mock Data Needed**:
- Tour plans (weekly)
- Approval history

---

#### 5. School List Analytics (`/admin/analytics/schools`)
**Purpose**: Analyze school portfolio

**Key Metrics**:
- Pattakat schools count per salesman
- Replacement history
- Performance ratios
- Visit frequency heat-map

**Mock Data Needed**:
- School analytics data
- Historical trends

---

#### 6. Prescribed Book Tracking (`/admin/analytics/prescribed-books`)
**Purpose**: IP Report - Track book prescriptions

**Key Features**:
- Which school prescribed which books
- By class + subject
- Cross-year comparison

**Mock Data Needed**:
- Prescription data (3 years)
- Subject-wise breakdown

---

#### 7. Visit Reports (`/admin/reports/visits`)
**Purpose**: Detailed visit analytics

**Key Features**:
- Per Salesman view
- Zero-visit days
- Total visits
- Regional comparison
- Export functionality

**Mock Data Needed**:
- Visit logs (comprehensive)
- Regional data

---

#### 8. Policy Compliance Reports (`/admin/reports/compliance`)
**Purpose**: Monitor policy adherence

**Color-coded Display**:
- Green → Followed
- Yellow → Partially followed
- Red → Missed (e.g., Need Mapping in wrong month)

**Mock Data Needed**:
- Policy rules
- Compliance scores per salesman

---

#### 9. Performance Kundli (`/admin/reports/performance/[salesman-id]`)
**Purpose**: Comprehensive salesman performance profile

**Key Sections**:
- 5-6 years performance history
- City-wise performance
- Sales vs Expense ratio
- Sales Return ratio
- Specimen utilization ratio
- Joint Working impact
- Trend graphs

**Mock Data Needed**:
- Multi-year performance data
- Detailed metrics

---

#### 10. Loyalty Reports (`/admin/reports/loyalty`)
**Purpose**: Customer loyalty analysis

**Filters**:
- 3-year loyal schools
- 2-year loyal schools
- 1-year churn risk schools

**Mock Data Needed**:
- School loyalty classification
- Retention trends

---

#### 11. Pre/Post-Visit Gap Analysis (`/admin/reports/gap-analysis`)
**Purpose**: Damage control identification

**Key Metrics**:
- Sales plan vs specimens actually given
- Highlight potential issues

**Mock Data Needed**:
- Sales plan data
- Actual specimen distribution

---

#### 12. Specimen Tracking (`/admin/specimen`)
**Purpose**: Monitor specimen inventory and usage

**Key Features**:
- Specimen allocation per salesman
- Usage tracking
- Return monitoring
- Budget overview

**Mock Data Needed**:
- Specimen inventory
- Distribution records
- Return records

---

#### 13. TA/DA Admin Module (`/admin/tada`)
**Purpose**: Approve/reject TA/DA claims

**Key Features**:
- Auto-checker:
  - Over-claimed → "Flagged"
  - No visit → auto rejected
- Manager workflow:
  - Approve
  - Reject
  - Request More Info

**Mock Data Needed**:
- Pending TA/DA claims
- Approval history
- Validation rules

---

#### 14. Feedback Manager (`/admin/feedback`)
**Purpose**: Product manager feedback inbox

**Key Features**:
- Inbox-style interface
- Feedback from salesmen
- Product Manager actions:
  - Acknowledged
  - Work in progress
  - Resolved
- Analytics: unacknowledged count

**Mock Data Needed**:
- Feedback entries (30-40)
- Status tracking

---

#### 15. ERP Integration Console (`/admin/erp`)
**Purpose**: Mock ERP data import interface

**Key Features**:
- Upload daily files (simulated)
- Validate data
- Sync specimens received
- Sync payments, returns, credit notes
- Import status logs

**Mock Data Needed**:
- Sample import logs
- Sync status

---

#### 16. White Label Settings (`/admin/settings/white-label`)
**Purpose**: Customize app branding

**Key Features**:
- Logo upload
- Color theme picker
- Subdomain configuration
- Activate/Deactivate modules

**Mock Data Needed**:
- Current branding settings

---

## Additional Shared Pages

#### Auth Pages
1. Login (`/login`)
2. Forgot Password (`/forgot-password`)

---

## Data Flow & Relationships

### Key Integrations:
1. **Salesman Dashboard** → Pulls from: Targets, Specimen Budget, School List, Next Visits, TA/DA
2. **Add Visit** → Updates: Specimen budget, School visit count, Need mapping analytics, Policy compliance, Joint working stats, Feedback, Next Visit
3. **Admin Reports** → Read: Visit Data, Specimen Ledger, Prescribed Books, ERP data
4. **TA/DA** ↔ Validated using: Attendance + Visit logs
5. **Book Seller Visit** → Updates: Payment tracking + Collection targets

---

## Mock Data Requirements Summary

### Core Data Sets Needed:
1. **Schools** (120 entries)
   - Basic info, contacts, 3-year history, prescribed books
2. **Book Sellers** (30-40 entries)
   - Business details, payment history, invoices
3. **Salesmen** (10-15 profiles)
   - Assignments, performance metrics
4. **Specimens** (50-100 books)
   - Subject, Class, MRP, inventory
5. **Visits** (200+ entries)
   - School & bookseller visits with all details
6. **TA/DA Claims** (50+ entries)
7. **Feedback** (30-40 entries)
8. **Notifications** (20-30 entries)
9. **Dropdown Options**
   - Cities, Boards, Contact Roles, Visit Purposes, etc.

---

## Page Count Summary

| Category | Count |
|----------|-------|
| Salesman Mobile App | 13 pages |
| Admin Web Portal | 16 pages |
| Auth Pages | 2 pages |
| **Total** | **31 pages** |

---

## Implementation Roadmap

### Phase 1: Setup & Foundation
1. **User**: Install Shadcn UI and required components
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card dialog sonner skeleton select input table form calendar badge tabs sheet command dropdown-menu alert progress switch checkbox radio-group textarea separator avatar
   ```

2. Create folder structure:
   - `src/components/ui/` (Shadcn components)
   - `src/components/dashboard/`
   - `src/components/forms/`
   - `src/components/layouts/`
   - `src/lib/mock-data/`
   - `src/types/`

3. Create mock data JSON files (9 files total)

### Phase 2: Core Components
1. Build reusable layout components:
   - Mobile navigation header
   - Admin sidebar navigation
   - Page wrappers with breadcrumbs
   - Loading skeleton templates

2. Create shared UI components:
   - Stats cards
   - Data tables with filters
   - Form builders
   - Chart wrappers

### Phase 3: Salesman Mobile App (13 Pages)
Build pages in this order:
1. Login page
2. Mobile Dashboard
3. School List → School Profile → Add School Visit
4. Book Seller List → Book Seller Profile → Add Book Seller Visit
5. Attendance, TA/DA, Notifications
6. Next Visit List, School Replacement Pool

### Phase 4: Admin Web Portal (16 Pages)
Build pages in this order:
1. Admin Dashboard
2. Sales Team Management
3. School List Analytics
4. Visit Reports
5. TA/DA Admin Module
6. Remaining analytics & settings pages

### Phase 5: Polish & Refinement
1. Add smooth transitions and animations
2. Implement all empty states
3. Test all responsive breakpoints
4. Add error boundaries
5. Final UX/UI polish

---

## Quick Reference Checklist

Before starting development, ensure:
- [ ] Shadcn UI initialized
- [ ] All required Shadcn components added
- [ ] Tailwind CSS configured
- [ ] Mock data folder structure created
- [ ] TypeScript configured
- [ ] Lucide React icons available (comes with Shadcn)

For each page you build:
- [ ] Mobile-first responsive layout (Tailwind only)
- [ ] Skeleton loading state implemented
- [ ] Shadcn components used (no custom alerts)
- [ ] Mock data connected
- [ ] Sonner toasts for user feedback
- [ ] Dialog for confirmations
- [ ] Professional styling applied
- [ ] Tested on mobile, tablet, desktop

---

**Last Updated**: 2025-11-22
**Version**: 1.0
