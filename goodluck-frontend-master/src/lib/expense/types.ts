// ============================================================
// Expense Module — Enterprise Types
// ============================================================

// ─── Core Entities ───────────────────────────────────────────

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
export type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid';
export type TadaStatus = 'Pending' | 'Approved' | 'Rejected' | 'Flagged' | 'Request More Info';
export type PolicySeverity = 'info' | 'warning' | 'violation' | 'block';
export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AuditAction =
  | 'created' | 'updated' | 'deleted'
  | 'submitted' | 'approved' | 'rejected' | 'paid'
  | 'flagged' | 'commented' | 'bulk_action'
  | 'policy_violation' | 'duplicate_detected' | 'ocr_scanned';

export interface Expense {
  id: string;
  salesmanId: string;
  salesmanName: string;
  expenseType: string;
  date: string;            // ISO date
  amount: number;
  description: string;
  receiptUrl: string | null;
  hasReceipt: boolean;
  policyViolation: boolean;
  violationReason?: string;
  status: ExpenseStatus;
  reportId: string | null;

  // ── New Enterprise Fields ──
  currency: string;        // default "INR"
  ocrResult?: OCRResult | null;
  fraudRiskScore: number;  // 0–100
  fraudReasons: string[];
  duplicateOf?: string | null;       // ID of duplicate expense
  duplicateSimilarity?: number;      // 0–1
  categoryConfidence: number;        // 0–1, from categorization engine
  tags: string[];
  approvedBy?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  adminComments?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ExpenseReport {
  id: string;
  salesmanId: string;
  salesmanName: string;
  reportTitle: string;
  dateSubmitted: string;
  startDate: string;
  endDate: string;
  status: ReportStatus;
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  expenseCount: number;
  expenseIds: string[];    // linked expense IDs
  policyViolations: number;
  adminComments: string | null;
  notes: string | null;

  // ── New Enterprise Fields ──
  fraudRiskScore: number;  // average of expenses
  approvalChain: ApprovalStep[];
  currentApprovalLevel: number;

  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePolicy {
  id: string;
  expenseType: string;
  dailyLimit: number;
  receiptRequired: boolean;
  description: string;

  // ── New Enterprise Fields ──
  severity: PolicySeverity;
  isActive: boolean;
  rules: PolicyRule[];
  approvalThresholds: ApprovalThreshold[];
  createdAt: string;
  updatedAt: string;
}

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
  status: TadaStatus;
  approvedBy: string | null;
  approvedDate: string | null;
  comments: string | null;

  // ── New Enterprise Fields ──
  fraudRiskScore: number;
  fraudReasons: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Policy Rule Engine ──────────────────────────────────────

export type RuleConditionField = 'amount' | 'expenseType' | 'dayOfWeek' | 'hasReceipt' | 'description' | 'city';
export type RuleOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
export type RuleLogic = 'AND' | 'OR';

export interface PolicyRule {
  id: string;
  name: string;
  conditions: PolicyCondition[];
  logic: RuleLogic;
  severity: PolicySeverity;
  message: string;
  isActive: boolean;
}

export interface PolicyCondition {
  field: RuleConditionField;
  operator: RuleOperator;
  value: string | number | boolean | string[];
}

export interface PolicyViolationResult {
  ruleId: string;
  ruleName: string;
  severity: PolicySeverity;
  message: string;
  conditions: PolicyCondition[];
}

export interface ApprovalThreshold {
  minAmount: number;
  maxAmount: number | null;  // null = unlimited
  approvalLevels: string[];  // e.g. ["Manager", "Director"]
}

export interface ApprovalStep {
  level: number;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approverName?: string;
  approvedAt?: string;
  comments?: string;
}

// ─── OCR & Receipt Intelligence ──────────────────────────────

export interface OCRResult {
  id: string;
  expenseId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  scannedAt: string;
  status: 'scanning' | 'completed' | 'failed';
  fields: OCRField[];
  rawText: string;
  overallConfidence: number; // 0–1
}

export interface OCRField {
  name: string;       // e.g., "merchant", "amount", "date", "category"
  value: string;
  confidence: number; // 0–1
  isOverridden: boolean;
  overriddenValue?: string;
}

// ─── Smart Categorization ────────────────────────────────────

export interface CategorizationMapping {
  id: string;
  keyword: string;
  category: string;
  isUserDefined: boolean;
  hitCount: number;
  createdAt: string;
}

export interface CategorizationSuggestion {
  category: string;
  confidence: number;
  source: 'keyword' | 'history' | 'ocr';
}

// ─── Duplicate & Fraud Detection ─────────────────────────────

export interface DuplicateMatch {
  expenseId: string;
  matchedExpenseId: string;
  similarity: number;        // 0–1
  matchReasons: string[];    // e.g. ["same amount", "same date", "similar description"]
}

export interface FraudAlert {
  id: string;
  expenseId: string;
  riskScore: number;         // 0–100
  riskLevel: FraudRiskLevel;
  reasons: string[];
  detectedAt: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ─── Audit Trail ─────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  entityType: 'expense' | 'report' | 'policy' | 'tada';
  entityId: string;
  action: AuditAction;
  performedBy: string;
  performedAt: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

// ─── Offline Sync ────────────────────────────────────────────

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entityType: 'expense' | 'report' | 'tada';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  error?: string;
}

// ─── Analytics ───────────────────────────────────────────────

export interface BudgetVsActual {
  salesmanId: string;
  salesmanName: string;
  budget: number;
  actual: number;
  variance: number;         // actual - budget
  variancePercent: number;
}

export interface ExpenseTrend {
  month: string;   // "2025-12"
  total: number;
  byCategory: Record<string, number>;
}

export interface ApprovalTurnaround {
  reportId: string;
  submittedAt: string;
  approvedAt: string | null;
  turnaroundHours: number;
}

export interface PendingAgingBucket {
  label: string;    // "0-3 days", "3-7 days", "7+ days"
  count: number;
  totalAmount: number;
}

// ─── Store State ─────────────────────────────────────────────

export interface ExpenseStoreState {
  expenses: Expense[];
  reports: ExpenseReport[];
  policies: ExpensePolicy[];
  tadaClaims: TadaClaim[];
  auditLog: AuditLogEntry[];
  categorizationMappings: CategorizationMapping[];
  fraudAlerts: FraudAlert[];
  pendingActions: PendingAction[];
  settings: ExpenseSettings;
  _version: number;       // schema version for migrations
  _lastSyncedAt: string;
}

export interface ExpenseSettings {
  defaultCurrency: string;
  autoSaveDraftIntervalMs: number;
  ocrEnabled: boolean;
  duplicateDetectionEnabled: boolean;
  fraudDetectionEnabled: boolean;
  smartDefaultsEnabled: boolean;
}

// ─── Filter / Query Types ────────────────────────────────────

export interface ExpenseFilters {
  salesmanId?: string;
  status?: ExpenseStatus | ExpenseStatus[];
  expenseType?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  hasReceipt?: boolean;
  policyViolation?: boolean;
  reportId?: string | null;
  search?: string;
  fraudRiskMin?: number;
  tags?: string[];
  sortBy?: 'date' | 'amount' | 'createdAt' | 'fraudRiskScore';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ReportFilters {
  salesmanId?: string;
  status?: ReportStatus | ReportStatus[];
  dateFrom?: string;
  dateTo?: string;
  hasViolations?: boolean;
  search?: string;
  sortBy?: 'dateSubmitted' | 'totalAmount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TadaFilters {
  salesmanId?: string;
  status?: TadaStatus | TadaStatus[];
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  search?: string;
}
