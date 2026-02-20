// School Types
export interface School {

  id: string;
  name: string;
  city: string;
    station: string;
  state: string;
  board: string;
  strength: number;
  address: string;
  isPattakat: boolean;
  visitCount: number;
  lastVisitDate: string | null;
  assignedTo: string;
  businessHistory: BusinessYear[];
  prescribedBooks: PrescribedBook[];
  salesPlan: SalesPlan;
  discountHistory: DiscountYear[];
  contacts: Contact[];
}

export interface BusinessYear {
  year: number;
  revenue: number;
}

export interface PrescribedBook {
  subject: string;
  class: string;
  book: string;
  status: string;
}

export interface SalesPlan {
  targetRevenue: number;
  subjects: string[];
  expectedConversion: number;
}

export interface DiscountYear {
  year: number;
  percentage: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  email: string;
  contactNo: string;
  schoolId: string;
  schoolName: string;
  schoolCity: string;
  schoolBoard: string;
  schoolStrength: number;
  schoolAddress: string;
  assignedTo: string;
  addedDate: string;
}

// Salesman Types
export interface Salesman {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  state: string;
  cities: string[];
  assignedSchools: number;
  specimenBudget: number;
  specimenUsed: number;
  salesTarget: number;
  salesAchieved: number;
  joinedDate: string;
  managerId: string;
  managerName: string;
  status: string;
}

// Book Seller Types
export interface BookSeller {
  id: string;
  shopName: string;
  ownerName: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  currentOutstanding: number;
  creditLimit: number;
  lastVisitDate: string;
  assignedTo: string;
  businessHistory: BusinessYear[];
  paymentHistory: Payment[];
  paymentDeadlines: PaymentDeadline[];
}

export interface Payment {
  date: string;
  amount: number;
  mode: string;
}

export interface PaymentDeadline {
  amount: number;
  dueDate: string;
  percentage: number;
  status: string;
}

// Specimen Types
export interface Specimen {
  id: string;
  subject: string;
  class: string;
  bookName: string;
  mrp: number;
  stockAvailable: number;
  allocated: Record<string, number>;
}

export interface SpecimenGiven {
  subject: string;
  class: string;
  book: string;
  quantity: number;
  cost: number;
}

export interface SpecimenReturned {
  subject: string;
  class: string;
  book: string;
  quantity: number;
  condition: string;
}

// Visit Types
export interface Visit {
  id: string;
  type: 'school' | 'bookseller';
  schoolId?: string;
  schoolName?: string;
  bookSellerId?: string;
  bookSellerName?: string;
  salesmanId: string;
  salesmanName: string;
  date: string;
  contacts?: Contact[];
  purposes: string[];
  needMappingType?: string | null;
  jointWorking?: JointWorking;
  specimensGiven?: SpecimenGiven[];
  specimensReturned?: SpecimenReturned[];
  totalSpecimenCost?: number;
  feedback?: VisitFeedback | null;
  nextVisit?: NextVisit | null;
  paymentCollected?: number;
  paymentDeadlineSet?: PaymentDeadline[];
  notes?: string;
  status: string;
}

export interface JointWorking {
  hasManager: boolean;
  managerName: string | null;
  managerType: string | null;
}

export interface VisitFeedback {
  category: string;
  comment: string;
}

export interface NextVisit {
  date: string;
  purpose: string;
}

// TA/DA Types
export interface TadaClaim {
  id: string;
  salesmanId: string;
  salesmanName: string;
  date: string;
  city: string;
  travelMode: string;
  amount: number;
  attachment: string | null;
  visitId: string | null;
  hasVisit: boolean;
  hasSpecimenData: boolean;
  withinLimit: boolean;
  status: string;
  approvedBy: string | null;
  approvedDate: string | null;
  comments: string | null;
}

// Feedback Types
export interface Feedback {
  id: string;
  visitId: string | null;
  salesmanId: string;
  salesmanName: string;
  schoolId: string;
  schoolName: string;
  date: string;
  category: string;
  comment: string;
  productManagerId: string;
  productManagerName: string;
  status: string;
  responseDate: string | null;
  response: string | null;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'normal' | 'medium' | 'high';
  actionUrl: string;
}

// Dropdown Options Types
export interface DropdownOptions {
  cities: string[];
  boards: string[];
  contactRoles: string[];
  visitPurposes: string[];
  needMappingTypes: string[];
  subjects: string[];
  classes: string[];
  managerTypes: string[];
  travelModes: string[];
  specimenConditions: string[];
  feedbackCategories: string[];
  discountCategories: string[];
  paymentStatuses: string[];
  visitStatuses: string[];
  tadaStatuses: string[];
  approvalStatuses: string[];
  complianceStatuses: string[];
}

// Dashboard Types
export interface DashboardStats {
  salesTarget: number;
  salesAchieved: number;
  specimenBudget: number;
  specimenUsed: number;
  schoolVisitsToday: number;
  bookSellerVisitsToday: number;
  pendingNextVisits: number;
  schoolsVisitedTwice: number;
  schoolsYetToVisit: number;
  totalSchools: number;
}

// Form Types
export interface SchoolVisitForm {
  schoolId: string;
  city: string;
  contacts: string[];
  newContacts: { name: string; role: string }[];
  purposes: string[];
  needMappingType?: string;
  hasManager: boolean;
  managerId?: string;
  managerType?: string;
  specimensGiven: SpecimenGiven[];
  specimensReturned: SpecimenReturned[];
  feedbackCategory?: string;
  feedbackComment?: string;
  nextVisitDate?: string;
  nextVisitPurpose?: string;
}

export interface BookSellerVisitForm {
  bookSellerId: string;
  purposes: string[];
  paymentCollected: number;
  paymentDeadlines: PaymentDeadline[];
  notes: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  salesmanId: string;
  date: string;
  startTime: string;
  endTime: string | null;
  startLocation: {
    city: string;
    latitude?: number;
    longitude?: number;
  };
  endLocation?: {
    city: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'ongoing' | 'completed';
}

// Tour Plan Types
export interface TourPlan {
  id: string;
  salesmanId: string;
  salesmanName: string;
  weekStartDate: string;
  weekEndDate: string;
  plans: DailyPlan[];
  status: string;
  submittedDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
  comments: string | null;
}

export interface DailyPlan {
  date: string;
  city: string;
  schools: string[];
  bookSellers: string[];
  notes: string;
}

// Report Types
export interface ComplianceReport {
  salesmanId: string;
  salesmanName: string;
  policies: PolicyCompliance[];
  overallScore: number;
}

export interface PolicyCompliance {
  policyName: string;
  status: 'Followed' | 'Partially Followed' | 'Missed';
  details: string;
}

export interface PerformanceKundli {
  salesmanId: string;
  salesmanName: string;
  yearsOfService: number;
  yearlyPerformance: YearlyPerformance[];
  cityWisePerformance: CityPerformance[];
  metrics: {
    salesVsExpenseRatio: number;
    salesReturnRatio: number;
    specimenUtilizationRatio: number;
    jointWorkingImpact: number;
  };
}

export interface YearlyPerformance {
  year: number;
  sales: number;
  target: number;
  achievement: number;
}

export interface CityPerformance {
  city: string;
  sales: number;
  visits: number;
  conversionRate: number;
}

// QB (Question Bank) Types
export interface QB {
  id: string;
  schoolName: string;
  schoolBoard: string;
  address: string;
  city: string;
  state: string;
  strength: number;
  createdDate: string;
  lastUpdated: string;
  status: "Active" | "Pending" | "Inactive";
}

export interface QBVisit {
  id: string;
  qbId: string;
  schoolCity: string;
  schoolName: string;
  schoolBoard: string;
  schoolStrength: number;
  schoolAddress: string;
  purposeOfVisit: string;
  teacherName: string;
  teacherDesignation: string;
  teacherContactNo: string;
  teacherEmail: string;
  remarks: string;
  visitDate: string;
  salesmanId: string;
  salesmanName: string;
}

// Book Types
export interface Book {
  id: string;
  title: string;
  class: string;
  mrp: number;
  sellingPrice: number;
  specimenPrice: number;
  publishedUnder: "Goodluck Publications" | "Vidhyarthi Prakashan";
  subject?: string;
  board?: string;
  isbn?: string;
  stockAvailable?: number;
  createdDate: string;
  lastUpdated: string;
}

// Manager Types
export interface Manager {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  state: string;
  assignedSalesmen: string[];
  createdDate: string;
  status: "Active" | "Inactive";
}
