"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, School, BookOpen, Store, Save } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import qbsData from "@/lib/mock-data/qbs.json";
import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";
import { QB } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "school" | "qb" | "seller";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "school", label: "School Visit", icon: School },
  { id: "qb", label: "QB Visit", icon: BookOpen },
  { id: "seller", label: "Book Seller", icon: Store },
];

const SCHOOL_STEPS = [
  { number: 1, title: "School" },
  { number: 2, title: "Contact" },
  { number: 3, title: "Purpose" },
  { number: 4, title: "Joint" },
  { number: 5, title: "Payment" },
  { number: 6, title: "Feedback" },
  { number: 7, title: "Next Visit" },
];

// ─── Step 5: Payment ─────────────────────────────────────────────────────────

function StepPayment({ formData, updateFormData }: { formData: any; updateFormData: (d: any) => void }) {
  const paymentFor: string = formData.paymentFor || "";
  const gl: number = formData.paymentReceivedGL || 0;
  const vp: number = formData.paymentReceivedVP || 0;
  const amount = paymentFor === "GL" ? gl : paymentFor === "VP" ? vp : 0;

  const sanitize = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    return digits === "" ? 0 : parseInt(digits, 10);
  };

  const handlePaymentFor = (val: string) => {
    updateFormData({ paymentFor: val, paymentReceivedGL: 0, paymentReceivedVP: 0 });
  };

  const handleAmount = (val: string) => {
    const num = sanitize(val);
    if (paymentFor === "GL") updateFormData({ paymentReceivedGL: num });
    else if (paymentFor === "VP") updateFormData({ paymentReceivedVP: num });
  };

  return (
    <div className="space-y-4">
      {/* Select company */}
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
              }`}>
                {key}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount input — shown after selection */}
      {paymentFor && (
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            Amount Received (₹) —{" "}
            <span className={paymentFor === "GL" ? "text-blue-600" : "text-violet-600"}>
              {paymentFor === "GL" ? "Goodluck" : "Vidhyapith"}
            </span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter payment amount"
              value={amount || ""}
              onChange={(e) => handleAmount(e.target.value)}
              className="h-12 pl-7 text-base font-semibold"
              autoFocus
            />
          </div>

          {/* Summary chip */}
          {amount > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mt-2">
              <span className="text-sm font-semibold">Total Payment</span>
              <span className="text-base font-bold text-primary">₹{amount.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {!paymentFor && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Select the company for which payment was received. Leave unselected if no payment was collected.
        </p>
      )}
    </div>
  );
}

// ─── School Visit Form ────────────────────────────────────────────────────────

function SchoolVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    city: "", schoolId: "", supplyThrough: "",
    selectedContacts: [] as string[],
    newContacts: [] as { name: string; role: string }[],
    purposes: [] as string[], needMappingType: "",
    hasManager: false, managerId: "", managerType: "",
    specimenRequired: "",
    givenRows: [{ specimenId: "", book: "", subject: "", class: "", mrp: 0, qty: 1, price: 0, amount: 0 }] as any[],
    returnRows: [{ specimenId: "", book: "", subject: "", class: "", qty: 1, condition: "" }] as any[],
    specimensGiven: [] as any[], specimensReturned: [] as any[],
    paymentFor: "", paymentReceivedGL: 0, paymentReceivedVP: 0,
    feedbackCategory: "", feedbackComment: "", schoolFeedback: "", schoolSpecialRequest: "",
    nextVisitDate: "", nextVisitPurpose: "", reminder: "",
  });

  useEffect(() => {
    const schoolId = searchParams.get("schoolId");
    if (schoolId) setFormData((prev) => ({ ...prev, schoolId }));
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
      toast.success("School visit logged successfully!");
      setIsSubmitting(false);
      router.push("/salesman/schools");
    }, 1200);
  };

  const progress = (currentStep / SCHOOL_STEPS.length) * 100;

  const stepDescriptions = [
    "Select the city and school you're visiting",
    "Add or select contact persons you met",
    "Select the purpose(s) of your visit",
    "Was this a joint visit with your manager?",
    "Enter payment received from the school",
    "Share your feedback about the visit",
    "Schedule the next visit (optional)",
  ];

  return (
    <div className="space-y-4">
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

          {/* Mobile: compact dots row */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:hidden">
            {SCHOOL_STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${currentStep > step.number
                    ? "bg-primary border-primary text-white"
                    : currentStep === step.number
                      ? "border-primary text-primary bg-primary/10"
                      : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                >
                  {currentStep > step.number ? <Check className="h-3 w-3" /> : step.number}
                </div>
                {idx < SCHOOL_STEPS.length - 1 && (
                  <div className={`h-px w-4 mx-0.5 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
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
          {currentStep === 5 && <StepPayment formData={formData} updateFormData={updateFormData} />}
          {currentStep === 6 && <StepFeedback formData={formData} updateFormData={updateFormData} />}
          {currentStep === 7 && <StepNextVisit formData={formData} updateFormData={updateFormData} />}
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

// ─── QB Visit Form ────────────────────────────────────────────────────────────

function QBVisitForm() {
  const router = useRouter();
  const [qbs] = useState<QB[]>(qbsData as QB[]);
  const [filteredSchools, setFilteredSchools] = useState<QB[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    schoolCity: "", schoolName: "", schoolBoard: "", schoolStrength: "", schoolAddress: "",
    purposeOfVisit: "",
    teacherName: "", teacherDesignation: "", teacherContactNo: "", teacherEmail: "",
    remarks: "",
  });

  const cities = Array.from(new Set(qbs.map((qb) => qb.city))).sort();

  useEffect(() => {
    if (formData.schoolCity) {
      setFilteredSchools(qbs.filter((qb) => qb.city === formData.schoolCity));
    } else {
      setFilteredSchools([]);
    }
    setFormData((prev) => ({
      ...prev, schoolName: "", schoolBoard: "", schoolStrength: "", schoolAddress: "",
    }));
  }, [formData.schoolCity]);

  const handleSchoolSelect = (schoolName: string) => {
    const s = qbs.find((qb) => qb.schoolName === schoolName);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        schoolName: s.schoolName, schoolBoard: s.schoolBoard,
        schoolStrength: s.strength.toString(), schoolAddress: s.address,
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.schoolCity || !formData.schoolName || !formData.purposeOfVisit ||
      !formData.teacherName || !formData.teacherDesignation || !formData.teacherContactNo) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("QB visit recorded successfully!");
      setIsSubmitting(false);
      router.push("/salesman/qbs");
    }, 1200);
  };

  const qbPurposes = [
    ...dropdownOptions.visitPurposes,
    "QB Discussion", "QB Sample Distribution", "Question Paper Review",
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* School Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">School Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">City *</Label>
            <Select value={formData.schoolCity} onValueChange={(v) => setFormData({ ...formData, schoolCity: v })}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent>
                {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">School *</Label>
            <Select
              value={formData.schoolName}
              onValueChange={handleSchoolSelect}
              disabled={!formData.schoolCity}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.schoolCity ? "Select school" : "Select city first"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSchools.map((s) => <SelectItem key={s.id} value={s.schoolName}>{s.schoolName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {formData.schoolName && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Board</Label>
                <Input value={formData.schoolBoard} disabled className="bg-muted text-sm h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Strength</Label>
                <Input value={formData.schoolStrength} disabled className="bg-muted text-sm h-9" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Purpose *</Label>
            <Select value={formData.purposeOfVisit} onValueChange={(v) => setFormData({ ...formData, purposeOfVisit: v })}>
              <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
              <SelectContent>
                {qbPurposes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Any additional notes…"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Teacher / Contact Person</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Name *</Label>
              <Input
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="Teacher name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Designation *</Label>
              <Select value={formData.teacherDesignation} onValueChange={(v) => setFormData({ ...formData, teacherDesignation: v })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {dropdownOptions.contactRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Contact No *</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={formData.teacherContactNo}
                onChange={(e) => setFormData({ ...formData, teacherContactNo: e.target.value.replace(/\D/g, "") })}
                placeholder="10-digit number"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <Input
                type="email"
                value={formData.teacherEmail}
                onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : <><Save className="h-4 w-4 mr-2" />Save QB Visit</>}
      </Button>
    </div>
  );
}

// ─── Book Seller Visit Form ───────────────────────────────────────────────────

const BS_PURPOSES = [
  "Relationship Building",
  "Payment Collection",
  "Documentation",
  "Inquiry",
  "Sales Return Follow-Up",
];

function BookSellerVisitForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const [formData, setFormData] = useState({
    bookSellerId: "",
    purposes: [] as string[],
    paymentReceivedGL: 0,
    paymentReceivedVP: 0,
    remark: "",
    nextVisitDate: "",
    reminder: "",
  });

  const cities = Array.from(
    new Set(bookSellersData.filter((s) => s.assignedTo === "SM001").map((s) => s.city))
  ).sort();

  const filteredSellers = selectedCity
    ? bookSellersData.filter((s) => s.assignedTo === "SM001" && s.city === selectedCity)
    : [];

  const selectedSeller = bookSellersData.find((s) => s.id === formData.bookSellerId);

  const togglePurpose = (p: string) => {
    setFormData((prev) => ({
      ...prev,
      purposes: prev.purposes.includes(p)
        ? prev.purposes.filter((x) => x !== p)
        : [...prev.purposes, p],
    }));
  };

  const handleSubmit = () => {
    if (!formData.bookSellerId || formData.purposes.length === 0) {
      toast.error("Please select a book seller and at least one purpose");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Book seller visit logged successfully!");
      setIsSubmitting(false);
      router.push("/salesman/booksellers");
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
          <div className="space-y-2">
            {BS_PURPOSES.map((p) => (
              <label
                key={p}
                htmlFor={`bsp-${p}`}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 cursor-pointer active:bg-muted/50"
              >
                <Checkbox
                  id={`bsp-${p}`}
                  checked={formData.purposes.includes(p)}
                  onCheckedChange={() => togglePurpose(p)}
                />
                <span className="text-sm font-medium flex-1">{p}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment (conditional) */}
      {formData.purposes.includes("Payment Collection") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">GL Payment (₹)</Label>
                <Input
                  type="number" min="0"
                  placeholder="Amount"
                  value={formData.paymentReceivedGL || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentReceivedGL: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">VP Payment (₹)</Label>
                <Input
                  type="number" min="0"
                  placeholder="Amount"
                  value={formData.paymentReceivedVP || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, paymentReceivedVP: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.bookSellerId || formData.purposes.length === 0}
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

  // Allow pre-selecting a tab via ?tab=qb or ?tab=seller
  const initialTab = (searchParams.get("tab") as TabId) || "school";
  const [activeTab, setActiveTab] = useState<TabId>(
    ["school", "qb", "seller"].includes(initialTab) ? initialTab : "school"
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
          <Button size="sm" onClick={() => router.push("/salesman/next-visits")}>
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
      {activeTab === "qb" && <QBVisitForm />}
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
