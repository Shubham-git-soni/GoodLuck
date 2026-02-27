"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, School, Store, Save, Plus, X, IndianRupee, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

// Step components (School Visit)
import StepSchoolSelection from "@/components/forms/visit/StepSchoolSelection";
import StepContactPerson from "@/components/forms/visit/StepContactPerson";
import StepPurpose from "@/components/forms/visit/StepPurpose";
import StepJointWorking from "@/components/forms/visit/StepJointWorking";
import StepFeedback from "@/components/forms/visit/StepFeedback";
import StepNextVisit from "@/components/forms/visit/StepNextVisit";

// Mock data
import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";
import specimensData from "@/lib/mock-data/specimens.json";
import schoolsDataRaw from "@/lib/mock-data/schools.json";

// Components
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

// Specimens allocated to current salesman (shared)
const availableSpecimens = (specimensData as any[]).filter(
  (s) => s.allocated?.["SM001"] && s.allocated["SM001"] > 0
);

function halfMrp(mrp: number) { return Math.round(mrp * 0.5); }
function emptyGivenRow() { return { specimenId: "", book: "", subject: "", class: "", mrp: 0, qty: 1, price: 0, amount: 0 }; }
function emptyReturnRow() { return { specimenId: "", book: "", subject: "", class: "", qty: 1, condition: "" }; }

const JOINT_PERSONS = [
  { id: "MGR001", name: "Amit Sharma",  role: "Regional Manager" },
  { id: "MGR002", name: "Neha Gupta",   role: "Regional Manager" },
  { id: "MGR003", name: "Ravi Kumar",   role: "State Manager" },
  { id: "SM002",  name: "Rahul Verma",  role: "Salesman" },
  { id: "SM003",  name: "Priya Singh",  role: "Salesman" },
  { id: "SM004",  name: "Deepak Joshi", role: "Salesman" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "school" | "seller";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "school", label: "School Visit", icon: School },
  { id: "seller", label: "Book Seller", icon: Store },
];

const SCHOOL_STEPS = [
  { number: 1, title: "School" },
  { number: 2, title: "Contact" },
  { number: 3, title: "Purpose" },
  { number: 4, title: "Joint" },
  { number: 5, title: "Feedback" },
  { number: 6, title: "Next Visit" },
];

// ─── PhonePe-style Numpad (used by BSPaymentCard) ────────────────────────────
function AmountNumpad({ amount, onDigit, onBackspace, onClear }: {
  amount: string;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}) {
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return (
    <div className="space-y-2">
      {/* Big amount display */}
      <div className="flex items-center justify-center gap-1 py-6 bg-muted/30 rounded-2xl">
        <span className="text-3xl font-light text-muted-foreground">₹</span>
        <span className={`text-4xl font-bold tracking-tight ${amount && amount !== "0" ? "text-foreground" : "text-muted-foreground"}`}>
          {amount && amount !== "0" ? Number(amount).toLocaleString("en-IN") : "0"}
        </span>
        {amount && amount !== "0" && (
          <button type="button" onClick={onClear} className="ml-2 text-xs text-muted-foreground underline self-end pb-1">
            clear
          </button>
        )}
      </div>
      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : k === "⌫" ? (
            <button
              key={i}
              type="button"
              onClick={onBackspace}
              className="h-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-medium active:scale-95 transition-transform"
            >
              ⌫
            </button>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => onDigit(k)}
              className="h-14 rounded-2xl bg-background border border-border text-xl font-semibold active:bg-muted active:scale-95 transition-all shadow-sm"
            >
              {k}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── School Visit Form ────────────────────────────────────────────────────────

function SchoolVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourPlanInfo, setTourPlanInfo] = useState<{ planId: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    city: "", schoolId: "", prefillSchoolName: "", supplyThrough: "",
    selectedContacts: [] as string[],
    newContacts: [] as { name: string; role: string }[],
    purposes: [] as string[], needMappingType: "",
    hasManager: false, managerId: "", managerType: "", managerRows: [] as { managerId: string; managerName: string; managerType: string }[],
    specimenRequired: "",
    givenRows: [{ specimenId: "", book: "", subject: "", class: "", mrp: 0, qty: 1, price: 0, amount: 0 }] as any[],
    returnRows: [{ specimenId: "", book: "", subject: "", class: "", qty: 1, condition: "" }] as any[],
    specimensGiven: [] as any[], specimensReturned: [] as any[],
    paymentFor: "", paymentReceivedGL: 0, paymentReceivedVP: 0,
    feedbackCategory: "", feedbackComment: "", schoolFeedback: "", schoolSpecialRequest: "",
    nextVisitDate: "", nextVisitPurpose: "", reminder: "",
  });

  useEffect(() => {
    const schoolId  = searchParams.get("schoolId");
    const name      = searchParams.get("name");
    const city      = searchParams.get("city");
    const objectives = searchParams.get("objectives");
    const fromTourPlan = searchParams.get("fromTourPlan");

    if (fromTourPlan && name && city) {
      // Match school by name — exact first, then partial fallback
      const nameLower = name.toLowerCase();
      const matched = (schoolsDataRaw as any[]).find(
        (s: any) => s.name.toLowerCase() === nameLower
      ) || (schoolsDataRaw as any[]).find(
        (s: any) =>
          s.name.toLowerCase().includes(nameLower) ||
          nameLower.includes(s.name.toLowerCase())
      );
      const parsedPurposes = objectives
        ? objectives.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
      setFormData((prev) => ({
        ...prev,
        // Use the matched school's own city so the dropdown list loads correctly
        city: matched ? matched.city : city,
        schoolId: matched ? matched.id : (schoolId || ""),
        // When no JSON match found, store the name so StepSchoolSelection can show it
        prefillSchoolName: matched ? "" : name,
        purposes: parsedPurposes,
      }));
      setTourPlanInfo({ planId: fromTourPlan === "1" ? (searchParams.get("planId") || "") : fromTourPlan, name });
    } else if (schoolId) {
      const school = (schoolsDataRaw as any[]).find((s: any) => s.id === schoolId);
      setFormData((prev) => ({
        ...prev,
        schoolId,
        city: school ? school.city : prev.city,
      }));
    }
  }, [searchParams]);

  const updateFormData = (data: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const handleNext = () => {
    if (currentStep < SCHOOL_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Build visit record for My Visits
      const school = (schoolsDataRaw as any[]).find((s: any) => s.id === formData.schoolId);
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const now = new Date();
      const contactsAll = school ? school.contacts || [] : [];
      const selectedContactObjs = contactsAll.filter((c: any) => (formData.selectedContacts || []).includes(c.id));
      const allContacts = [...selectedContactObjs, ...(formData.newContacts || [])];
      const firstContact = allContacts[0];
      const jointRows: any[] = formData.managerRows || [];
      const jointStr = formData.hasManager && jointRows.some((r: any) => r.managerName)
        ? jointRows.filter((r: any) => r.managerName).map((r: any) => `${r.managerName} (${r.managerType})`).join(", ")
        : "—";
      const givenStr = (formData.givenRows || []).filter((r: any) => r.book).map((r: any) => `${r.book} (×${r.qty})`).join(", ") || "—";
      const newVisit = {
        type: "school",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        day: days[now.getDay()],
        jointWorking: jointStr,
        schoolName: school ? school.name : "",
        purpose: (formData.purposes || []).join(", "),
        schoolCity: formData.city,
        board: school ? school.board : "",
        strength: school ? school.strength : "",
        contactPerson: firstContact ? firstContact.name : "",
        contactNo: firstContact ? (firstContact.phone || firstContact.contactNo || "") : "",
        supplyThrough: formData.supplyThrough,
        specimenGiven: givenStr,
        specimenRequired: formData.specimenRequired || "",
        schoolComment: formData.schoolFeedback || "",
        yourComment: formData.feedbackComment || "",
      };
      const existing = JSON.parse(localStorage.getItem("myVisits_school") || "[]");
      localStorage.setItem("myVisits_school", JSON.stringify([newVisit, ...existing]));

      toast.success("School visit logged successfully!");
      setIsSubmitting(false);
      router.push("/salesman/my-visits");
    }, 1200);
  };

  const progress = (currentStep / SCHOOL_STEPS.length) * 100;

  const stepDescriptions = [
    "Select the city and school you're visiting",
    "Add or select contact persons you met",
    "Select the purpose(s) of your visit",
    "Was this a joint visit with your manager?",
    "Share your feedback about the visit",
    "Schedule the next visit (optional)",
  ];

  return (
    <div className="space-y-4">
      {/* Tour Plan banner */}
      {tourPlanInfo && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800">Auto-filled from Tour Plan</p>
            <p className="text-xs text-emerald-700 truncate">
              {tourPlanInfo.planId && <span className="font-medium">{tourPlanInfo.planId} · </span>}
              School, city &amp; objectives pre-filled. You can edit if needed.
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {SCHOOL_STEPS.length}
            </p>
            <p className="text-xs font-semibold text-primary">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} className="h-1.5 mb-3" />

          {/* Mobile: compact dots row — evenly distributed */}
          <div className="flex items-center w-full md:hidden">
            {SCHOOL_STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors shrink-0 ${
                    currentStep > step.number
                      ? "bg-primary border-primary text-white"
                      : currentStep === step.number
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-3 w-3" /> : step.number}
                </div>
                {idx < SCHOOL_STEPS.length - 1 && (
                  <div className={`h-px flex-1 mx-1 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Desktop: full step indicators with labels */}
          <div className="hidden md:flex items-center justify-between">
            {SCHOOL_STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep > step.number
                      ? "bg-primary border-primary text-white"
                      : currentStep === step.number
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                  >
                    {currentStep > step.number ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{step.number}</span>}
                  </div>
                  <p className="text-[11px] mt-1.5 text-center max-w-[70px] leading-tight font-medium text-muted-foreground">
                    {step.title}
                  </p>
                </div>
                {idx < SCHOOL_STEPS.length - 1 && (
                  <div className={`h-px w-8 mx-1 mb-5 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{SCHOOL_STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription className="text-xs">{stepDescriptions[currentStep - 1]}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <StepSchoolSelection formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <StepContactPerson formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StepPurpose formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <StepJointWorking formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <StepFeedback formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <StepNextVisit formData={formData} updateFormData={updateFormData} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Previous
        </Button>
        {currentStep < SCHOOL_STEPS.length ? (
          <Button onClick={handleNext} size="sm">
            Next <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
            {isSubmitting ? "Submitting…" : "Submit Visit"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Book Seller Visit Form ───────────────────────────────────────────────────

const BS_PURPOSES = [
  "Relationship Building",
  "Follow Up",
  "Need Mapping",
  "Marketing Brochures",
  "Product Demos",
  "Given Specimen",
  "Collect Specimen",
  "Workshop",
  "Feedback",
  "Final Pitch",
  "Order Finalization",
  "Post Sale Engagement",
  "Payment Collection",
  "Documentation",
  "Inquiry",
  "Sales Return Follow-Up",
];

// ─── BSPaymentCard (needs useState — must be a real component) ────────────────
function BSPaymentCard({ paymentFor, paymentReceivedGL, paymentReceivedVP, onChange }: {
  paymentFor: string;
  paymentReceivedGL: number;
  paymentReceivedVP: number;
  onChange: (patch: object) => void;
}) {
  const amount = paymentFor === "GL" ? paymentReceivedGL : paymentFor === "VP" ? paymentReceivedVP : 0;
  const [raw, setRaw] = useState(amount > 0 ? String(amount) : "");

  const handlePaymentFor = (val: string) => {
    onChange({ paymentFor: val, paymentReceivedGL: 0, paymentReceivedVP: 0 });
    setRaw("");
  };

  const commit = (r: string) => {
    const num = r === "" ? 0 : parseInt(r, 10);
    if (paymentFor === "GL") onChange({ paymentReceivedGL: num });
    else if (paymentFor === "VP") onChange({ paymentReceivedVP: num });
  };

  const handleDigit = (d: string) => {
    const next = raw === "0" ? d : raw + d;
    if (next.length > 9) return;
    setRaw(next);
    commit(next);
  };

  const handleBackspace = () => { const next = raw.slice(0, -1); setRaw(next); commit(next); };
  const handleClear = () => { setRaw(""); commit(""); };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Payment Received For</Label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { key: "GL", label: "Goodluck", color: "blue" },
              { key: "VP", label: "Vidhyapith", color: "violet" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePaymentFor(key)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-4 transition-all ${
                  paymentFor === key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-muted-foreground/30"
                }`}
              >
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  color === "blue" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
                }`}>{key}</span>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentFor && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">
              Enter amount for{" "}
              <span className={paymentFor === "GL" ? "text-blue-600" : "text-violet-600"}>
                {paymentFor === "GL" ? "Goodluck" : "Vidhyapith"}
              </span>
            </p>
            <AmountNumpad amount={raw} onDigit={handleDigit} onBackspace={handleBackspace} onClear={handleClear} />
          </div>
        )}

        {!paymentFor && (
          <p className="text-xs text-muted-foreground text-center py-1">
            Select the company for which payment was received.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BookSellerVisitForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const [formData, setFormData] = useState({
    bookSellerId: "",
    purposes: [] as string[],
    givenRows: [emptyGivenRow()] as any[],
    returnRows: [emptyReturnRow()] as any[],
    paymentFor: "",
    paymentReceivedGL: 0,
    paymentReceivedVP: 0,
    hasJoint: false,
    jointRows: [{ personId: "", personName: "", personRole: "" }] as any[],
    remark: "",
    nextVisitDate: "",
    reminder: "",
  });

  const updateFormData = (data: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const cities = Array.from(
    new Set(bookSellersData.filter((s) => s.assignedTo === "SM001").map((s) => s.city))
  ).sort();

  const filteredSellers = selectedCity
    ? bookSellersData.filter((s) => s.assignedTo === "SM001" && s.city === selectedCity)
    : [];

  const selectedSeller = bookSellersData.find((s) => s.id === formData.bookSellerId);

  const showGivenSpecimen = formData.purposes.includes("Given Specimen");
  const showCollectSpecimen = formData.purposes.includes("Collect Specimen");

  // ── Given rows handlers
  const givenRows = formData.givenRows;
  const setGivenRows = (rows: any[]) => updateFormData({ givenRows: rows });

  const handleSpecimenSelect = (index: number, specimenId: string) => {
    const spec = availableSpecimens.find((s) => s.id === specimenId);
    const rows = [...givenRows];
    if (spec) {
      const price = halfMrp(spec.mrp);
      rows[index] = { ...rows[index], specimenId, book: spec.bookName, subject: spec.subject, class: spec.class, mrp: spec.mrp, price, qty: 1, amount: price };
    } else {
      rows[index] = emptyGivenRow();
    }
    setGivenRows(rows);
  };

  const handleQtyChange = (index: number, qty: number) => {
    const rows = [...givenRows];
    const safeQty = Math.max(1, qty);
    rows[index] = { ...rows[index], qty: safeQty, amount: rows[index].price * safeQty };
    setGivenRows(rows);
  };

  const handleRemoveGivenRow = (index: number) => {
    const rows = givenRows.filter((_: any, i: number) => i !== index);
    setGivenRows(rows.length ? rows : [emptyGivenRow()]);
  };

  const totalSpecimenAmount = givenRows.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  // ── Return rows handlers
  const returnRows = formData.returnRows;
  const setReturnRows = (rows: any[]) => updateFormData({ returnRows: rows });

  const handleReturnSpecimenSelect = (index: number, specimenId: string) => {
    const spec = availableSpecimens.find((s) => s.id === specimenId);
    const rows = [...returnRows];
    if (spec) {
      rows[index] = { ...rows[index], specimenId, book: spec.bookName, subject: spec.subject, class: spec.class, qty: 1 };
    } else {
      rows[index] = emptyReturnRow();
    }
    setReturnRows(rows);
  };

  const handleReturnQtyChange = (index: number, qty: number) => {
    const rows = [...returnRows];
    rows[index] = { ...rows[index], qty: Math.max(1, qty) };
    setReturnRows(rows);
  };

  const handleReturnConditionChange = (index: number, condition: string) => {
    const rows = [...returnRows];
    rows[index] = { ...rows[index], condition };
    setReturnRows(rows);
  };

  const handleRemoveReturnRow = (index: number) => {
    const rows = returnRows.filter((_: any, i: number) => i !== index);
    setReturnRows(rows.length ? rows : [emptyReturnRow()]);
  };

  const handleSubmit = () => {
    if (!formData.bookSellerId || formData.purposes.length === 0) {
      toast.error("Please select a book seller and at least one purpose");
      return;
    }
    if (formData.purposes.includes("Payment Collection")) {
      if (!formData.paymentFor) {
        toast.error("Please select GL or VP for payment collection");
        return;
      }
      const amt = formData.paymentFor === "GL" ? formData.paymentReceivedGL : formData.paymentReceivedVP;
      if (!amt || amt <= 0) {
        toast.error("Please enter a payment amount greater than 0");
        return;
      }
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const now = new Date();
      const seller = (bookSellersData as any[]).find((s: any) => s.id === formData.bookSellerId);
      const jointRows: any[] = formData.jointRows || [];
      const jointStr = formData.hasJoint && jointRows.some((r: any) => r.personName)
        ? jointRows.filter((r: any) => r.personName).map((r: any) => `${r.personName} (${r.personRole})`).join(", ")
        : "—";
      const givenStr = (formData.givenRows || []).filter((r: any) => r.book).map((r: any) => `${r.book} (×${r.qty})`).join(", ") || "—";
      const glAmt = formData.paymentReceivedGL ? `₹${Number(formData.paymentReceivedGL).toLocaleString()}` : "—";
      const vpAmt = formData.paymentReceivedVP ? `₹${Number(formData.paymentReceivedVP).toLocaleString()}` : "—";
      const newVisit = {
        type: "bookseller",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        day: days[now.getDay()],
        jointWorking: jointStr,
        name: seller ? seller.shopName : "",
        contactNo: seller ? seller.phone : "",
        email: seller ? seller.email : "",
        address: seller ? seller.address : "",
        city: seller ? seller.city : "",
        purpose: (formData.purposes || []).join(", "),
        specimenGiven: givenStr,
        paymentGL: glAmt,
        paymentVP: vpAmt,
        remarks: formData.remark || "",
      };
      const existing = JSON.parse(localStorage.getItem("myVisits_bookseller") || "[]");
      localStorage.setItem("myVisits_bookseller", JSON.stringify([newVisit, ...existing]));

      toast.success("Book seller visit logged successfully!");
      setIsSubmitting(false);
      router.push("/salesman/my-visits");
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Seller Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Book Seller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">City *</Label>
            <Select
              value={selectedCity}
              onValueChange={(v) => {
                setSelectedCity(v);
                setFormData((prev) => ({ ...prev, bookSellerId: "" }));
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Book Seller *</Label>
            <Select
              value={formData.bookSellerId}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, bookSellerId: v }))}
              disabled={!selectedCity}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCity ? "Select seller" : "Select city first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSellers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.shopName} — {s.ownerName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seller summary chip */}
          {selectedSeller && (
            <div className="rounded-xl bg-muted/60 p-3 space-y-1 text-sm">
              <p className="font-semibold">{selectedSeller.shopName}</p>
              <p className="text-xs text-muted-foreground">{selectedSeller.ownerName} · {selectedSeller.city}</p>
              <div className="flex gap-3 text-xs text-muted-foreground pt-1">
                <span>Outstanding: <span className="font-medium text-destructive">₹{(selectedSeller.currentOutstanding / 100000).toFixed(2)}L</span></span>
                <span>Limit: <span className="font-medium">₹{(selectedSeller.creditLimit / 100000).toFixed(1)}L</span></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purpose */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Purpose of Visit *</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={BS_PURPOSES.map((p) => ({ value: p, label: p }))}
            value={formData.purposes}
            onChange={(selected) => setFormData((prev) => ({ ...prev, purposes: selected }))}
            placeholder="Select visit purpose(s)…"
            searchable={true}
            searchPlaceholder="Search purposes…"
          />
        </CardContent>
      </Card>

      {/* Given Specimen (conditional) */}
      {showGivenSpecimen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Given Specimen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {givenRows.map((row: any, index: number) => (
              <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Book {index + 1}</span>
                  {givenRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGivenRow(index)}
                      className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                  <NativeSelect
                    value={row.specimenId}
                    onValueChange={(v) => handleSpecimenSelect(index, v)}
                    placeholder="Choose allocated specimen…"
                  >
                    {availableSpecimens.map((s) => (
                      <NativeSelectOption key={s.id} value={s.id}>
                        {s.bookName} — Cl.{s.class} ({s.subject})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                {/* Desktop */}
                <div className="hidden md:block">
                  <Select value={row.specimenId} onValueChange={(v) => handleSpecimenSelect(index, v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose allocated specimen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecimens.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.bookName} — Class {s.class} ({s.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {row.specimenId && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <div className="flex items-center h-10 rounded-lg border border-border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(index, row.qty - 1)}
                          disabled={row.qty <= 1}
                          className="h-full w-9 flex items-center justify-center text-lg font-bold bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors shrink-0"
                        >−</button>
                        <span className="flex-1 text-center text-sm font-semibold">{row.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(index, row.qty + 1)}
                          className="h-full w-9 flex items-center justify-center text-lg font-bold bg-muted hover:bg-muted/80 transition-colors shrink-0"
                        >+</button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Price/Unit</Label>
                      <div className="flex h-10 items-center rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground">
                        ₹{row.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <div className="flex h-10 items-center rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm font-bold text-primary">
                        ₹{row.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={() => setGivenRows([...givenRows, emptyGivenRow()])}
              className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-0"
            >
              <Plus className="h-4 w-4" />
              Add More
            </Button>

            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Total Specimen Amount</span>
              </div>
              <span className="text-base font-bold text-primary">₹{totalSpecimenAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collect Specimen (conditional) */}
      {showCollectSpecimen && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Collect Specimen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {returnRows.map((row: any, index: number) => (
              <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Book {index + 1}</span>
                  {returnRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveReturnRow(index)}
                      className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                  <NativeSelect
                    value={row.specimenId}
                    onValueChange={(v) => handleReturnSpecimenSelect(index, v)}
                    placeholder="Choose specimen book…"
                  >
                    {availableSpecimens.map((s) => (
                      <NativeSelectOption key={s.id} value={s.id}>
                        {s.bookName} — Cl.{s.class} ({s.subject})
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                {/* Desktop */}
                <div className="hidden md:block">
                  <Select value={row.specimenId} onValueChange={(v) => handleReturnSpecimenSelect(index, v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose specimen book…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecimens.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.bookName} — Class {s.class} ({s.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {row.specimenId && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Quantity</Label>
                      <div className="flex items-center h-10 rounded-lg border border-border overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleReturnQtyChange(index, row.qty - 1)}
                          disabled={row.qty <= 1}
                          className="h-full w-9 flex items-center justify-center text-lg font-bold bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors shrink-0"
                        >−</button>
                        <span className="flex-1 text-center text-sm font-semibold">{row.qty}</span>
                        <button
                          type="button"
                          onClick={() => handleReturnQtyChange(index, row.qty + 1)}
                          className="h-full w-9 flex items-center justify-center text-lg font-bold bg-muted hover:bg-muted/80 transition-colors shrink-0"
                        >+</button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Condition</Label>
                      <div className="md:hidden">
                        <NativeSelect
                          value={row.condition}
                          onValueChange={(v) => handleReturnConditionChange(index, v)}
                          placeholder="Select condition"
                        >
                          {dropdownOptions.specimenConditions.map((c) => (
                            <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="hidden md:block">
                        <Select value={row.condition} onValueChange={(v) => handleReturnConditionChange(index, v)}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {dropdownOptions.specimenConditions.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={() => setReturnRows([...returnRows, emptyReturnRow()])}
              className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add More
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment (conditional) */}
      {formData.purposes.includes("Payment Collection") && (
        <BSPaymentCard
          paymentFor={formData.paymentFor}
          paymentReceivedGL={formData.paymentReceivedGL}
          paymentReceivedVP={formData.paymentReceivedVP}
          onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
        />
      )}

      {/* Joint Visit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Joint Visit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Joint Visit?</p>
                <p className="text-xs text-muted-foreground">Was anyone else accompanying you?</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.hasJoint}
              onClick={() => setFormData((prev) => ({
                ...prev,
                hasJoint: !prev.hasJoint,
                jointRows: [{ personId: "", personName: "", personRole: "" }],
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.hasJoint ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                formData.hasJoint ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Joint persons list */}
          {formData.hasJoint && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joint Person(s)</p>

              {formData.jointRows.map((row: any, index: number) => (
                <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Person {index + 1}</span>
                    {formData.jointRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const rows = formData.jointRows.filter((_: any, i: number) => i !== index);
                          setFormData((prev) => ({ ...prev, jointRows: rows }));
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  <MultiSelect
                    options={JOINT_PERSONS.map((p) => ({ value: p.id, label: `${p.name} — ${p.role}` }))}
                    value={row.personId ? [row.personId] : []}
                    onChange={(selected) => {
                      const id = selected[selected.length - 1] ?? "";
                      const person = JOINT_PERSONS.find((p) => p.id === id);
                      const rows = [...formData.jointRows];
                      rows[index] = person
                        ? { personId: person.id, personName: person.name, personRole: person.role }
                        : { personId: "", personName: "", personRole: "" };
                      setFormData((prev) => ({ ...prev, jointRows: rows }));
                    }}
                    placeholder="Choose person…"
                    maxSelected={1}
                    searchable={true}
                    searchPlaceholder="Search person…"
                  />

                  {row.personId && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {row.personRole}
                    </span>
                  )}
                </div>
              ))}

              <Button
                type="button"
                onClick={() => setFormData((prev) => ({
                  ...prev,
                  jointRows: [...prev.jointRows, { personId: "", personName: "", personRole: "" }],
                }))}
                className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add More
              </Button>
            </div>
          )}

          {!formData.hasJoint && (
            <div className="text-center py-4 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20">
              <p className="text-sm text-muted-foreground">Solo visit — no one accompanied</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Visit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Next Visit (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Next Visit Date</Label>
            <DatePicker
              value={formData.nextVisitDate}
              onChange={(v) => setFormData((prev) => ({ ...prev, nextVisitDate: v }))}
              placeholder="Select date"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reminder</Label>
            <Input
              placeholder="e.g., Follow up on payment"
              value={formData.reminder}
              onChange={(e) => setFormData((prev) => ({ ...prev, reminder: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Remark */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Remark</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any remarks about this visit…"
            rows={3}
            value={formData.remark}
            onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Payment validation hint */}
      {formData.purposes.includes("Payment Collection") && (() => {
        const missingCompany = !formData.paymentFor;
        const missingAmount = formData.paymentFor === "GL"
          ? !formData.paymentReceivedGL || formData.paymentReceivedGL <= 0
          : formData.paymentFor === "VP"
          ? !formData.paymentReceivedVP || formData.paymentReceivedVP <= 0
          : true;
        if (missingCompany || missingAmount) {
          return (
            <p className="text-xs text-destructive text-center -mt-2">
              {missingCompany
                ? "Please select GL or VP for payment"
                : "Please enter a payment amount greater than 0"}
            </p>
          );
        }
        return null;
      })()}

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          !formData.bookSellerId ||
          formData.purposes.length === 0 ||
          (formData.purposes.includes("Payment Collection") && (
            !formData.paymentFor ||
            (formData.paymentFor === "GL" && (!formData.paymentReceivedGL || formData.paymentReceivedGL <= 0)) ||
            (formData.paymentFor === "VP" && (!formData.paymentReceivedVP || formData.paymentReceivedVP <= 0))
          ))
        }
      >
        {isSubmitting ? "Submitting…" : <><Save className="h-4 w-4 mr-2" />Submit Visit</>}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AddVisitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Allow pre-selecting a tab via ?tab=seller
  const initialTab = (searchParams.get("tab") as TabId) || "school";
  const [activeTab, setActiveTab] = useState<TabId>(
    ["school", "seller"].includes(initialTab) ? initialTab : "school"
  );

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-3 -ml-2 md:hidden">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight">Add Visit</h1>
          <Button size="sm" onClick={() => router.push("/salesman/my-visits")}>
            My Visits
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-2xl bg-muted p-1 mb-5 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all duration-150 ${activeTab === id
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "school" && <SchoolVisitForm />}
      {activeTab === "seller" && <BookSellerVisitForm />}
    </PageContainer>
  );
}

export default function AddVisitPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="mb-4">
          <Button variant="ghost" size="sm" disabled className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <h1 className="text-[22px] font-bold tracking-tight">Add Visit</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </PageContainer>
    }>
      <AddVisitPageContent />
    </Suspense>
  );
}
