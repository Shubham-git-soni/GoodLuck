"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

import bookSellersData from "@/lib/mock-data/book-sellers.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

// ─── Numpad ───────────────────────────────────────────────────────────────────
function AmountNumpad({ amount, onDigit, onBackspace, onClear }: {
  amount: string;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}) {
  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1 py-5 bg-muted/30 rounded-2xl">
        <span className="text-3xl font-light text-muted-foreground">₹</span>
        <span className={`text-4xl font-bold tracking-tight ${amount ? "text-foreground" : "text-muted-foreground"}`}>
          {amount ? Number(amount).toLocaleString("en-IN") : "0"}
        </span>
        {amount && (
          <button type="button" onClick={onClear} className="ml-2 text-xs text-muted-foreground underline self-end pb-1">clear</button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k, i) =>
          k === "" ? <div key={i} /> :
          k === "⌫" ? (
            <button key={i} type="button" onClick={onBackspace}
              className="h-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-medium active:scale-95 transition-transform">⌫</button>
          ) : (
            <button key={i} type="button" onClick={() => onDigit(k)}
              className="h-14 rounded-2xl bg-background border border-border text-xl font-semibold active:bg-muted active:scale-95 transition-all shadow-sm">{k}</button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Payment Section (GL / VP selector + numpad) ──────────────────────────────
function PaymentSection({ formData, setFormData }: { formData: any; setFormData: (d: any) => void }) {
  const paymentFor: string = formData.paymentFor || "";
  const existing = paymentFor === "GL" ? formData.paymentReceivedGL : paymentFor === "VP" ? formData.paymentReceivedVP : 0;
  const [raw, setRaw] = useState(existing > 0 ? String(existing) : "");

  const handlePaymentFor = (val: string) => {
    setFormData({ ...formData, paymentFor: val, paymentReceivedGL: 0, paymentReceivedVP: 0 });
    setRaw("");
  };

  const commit = (r: string) => {
    const num = r === "" ? 0 : parseInt(r, 10);
    if (paymentFor === "GL") setFormData((prev: any) => ({ ...prev, paymentReceivedGL: num }));
    else if (paymentFor === "VP") setFormData((prev: any) => ({ ...prev, paymentReceivedVP: num }));
  };

  const handleDigit = (d: string) => {
    const next = raw === "0" ? d : raw + d;
    if (next.length > 9) return;
    setRaw(next); commit(next);
  };
  const handleBackspace = () => { const next = raw.slice(0, -1); setRaw(next); commit(next); };
  const handleClear = () => { setRaw(""); commit(""); };

  return (
    <div className="space-y-4">
      {/* GL / VP selector */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Payment Received For</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { key: "GL", label: "Goodluck",   color: "blue" },
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

      {/* Numpad */}
      {paymentFor ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">
            Enter amount for{" "}
            <span className={paymentFor === "GL" ? "text-blue-600" : "text-violet-600"}>
              {paymentFor === "GL" ? "Goodluck" : "Vidhyapith"}
            </span>
          </p>
          <AmountNumpad amount={raw} onDigit={handleDigit} onBackspace={handleBackspace} onClear={handleClear} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-1">
          Select the company for which payment was received.
        </p>
      )}
    </div>
  );
}

function AddBookSellerVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCity, setSelectedCity] = useState("");
  const [tourPlanInfo, setTourPlanInfo] = useState<{ planId: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    bookSellerId: "",
    purposes: [] as string[],
    paymentFor: "",
    paymentReceivedGL: 0,
    paymentReceivedVP: 0,
    remark: "",
    nextVisitDate: "",
    reminder: "",
  });

  useEffect(() => {
    const fromTourPlan = searchParams.get("fromTourPlan");
    const name        = searchParams.get("name");
    const city        = searchParams.get("city");
    const objectives  = searchParams.get("objectives");
    const planId      = searchParams.get("planId");
    const sellerId    = searchParams.get("sellerId");

    if (fromTourPlan && name && city) {
      // Match bookseller by shop name from mock data
      const matched = bookSellersData.find(
        (s) => s.shopName.toLowerCase() === name.toLowerCase()
      );
      const parsedPurposes = objectives
        ? objectives.split(",").map((o) => o.trim()).filter(Boolean)
        : [];
      setSelectedCity(city);
      setFormData((prev) => ({
        ...prev,
        bookSellerId: matched ? matched.id : "",
        purposes: parsedPurposes,
      }));
      setTourPlanInfo({ planId: planId || "", name });
    } else if (sellerId) {
      setFormData((prev) => ({ ...prev, bookSellerId: sellerId }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Book seller visit logged successfully!");
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      router.push("/salesman/booksellers");
    }, 1500);
  };

  const selectedSeller = bookSellersData.find((s) => s.id === formData.bookSellerId);

  // Get unique cities from book sellers assigned to current salesman
  const cities = Array.from(
    new Set(
      bookSellersData
        .filter((s) => s.assignedTo === "SM001")
        .map((s) => s.city)
    )
  ).sort();

  // Filter book sellers by selected city
  const filteredSellers = selectedCity
    ? bookSellersData.filter((s) => s.assignedTo === "SM001" && s.city === selectedCity)
    : [];

  const purposeOptions = dropdownOptions.bookSellerVisitPurposes.map((p) => ({
    value: p,
    label: p,
  }));

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <PageHeader
          title="Add Book Seller Visit"
          description="Log your visit to a book seller"
        />
      </div>

      {/* Tour Plan banner */}
      {tourPlanInfo && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800">Auto-filled from Tour Plan</p>
            <p className="text-xs text-emerald-700 truncate">
              {tourPlanInfo.planId && <span className="font-medium">{tourPlanInfo.planId} · </span>}
              Seller, city &amp; objectives pre-filled. You can edit if needed.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* City and Book Seller Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Book Seller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* City Selection */}
            <div className="space-y-2">
              <Label htmlFor="city">Select City *</Label>
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setFormData({ ...formData, bookSellerId: "" }); // Reset book seller when city changes
                }}
                required
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city first" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Seller Selection */}
            <div className="space-y-2">
              <Label htmlFor="bookSeller">Book Seller *</Label>
              <Select
                value={formData.bookSellerId}
                onValueChange={(value) => setFormData({ ...formData, bookSellerId: value })}
                disabled={!selectedCity}
                required
              >
                <SelectTrigger id="bookSeller">
                  <SelectValue placeholder={selectedCity ? "Select book seller" : "Select city first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.shopName} - {seller.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Seller Details */}
            {selectedSeller && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Shop Name</span>
                        <span className="font-medium">{selectedSeller.shopName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Owner</span>
                        <span className="font-medium">{selectedSeller.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Contact Number</span>
                        <span className="font-medium">{selectedSeller.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">City</span>
                        <span className="font-medium">{selectedSeller.city}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Outstanding</span>
                        <span className="font-medium text-destructive">
                          ₹{(selectedSeller.currentOutstanding / 100000).toFixed(2)}L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Credit Limit</span>
                        <span className="font-medium">
                          ₹{(selectedSeller.creditLimit / 100000).toFixed(2)}L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">GST Number</span>
                        <span className="font-medium text-xs">{selectedSeller.gstNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium text-xs">{selectedSeller.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="font-medium text-sm">{selectedSeller.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Purpose of Visit */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Purpose of Visit *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {purposeOptions.map((opt) => {
              const isSelected = formData.purposes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = isSelected
                      ? formData.purposes.filter((p) => p !== opt.value)
                      : [...formData.purposes, opt.value];
                    setFormData({ ...formData, purposes: next });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                    isSelected ? "bg-primary border-primary" : "border-input bg-background"
                  }`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-primary-foreground stroke-[3]" viewBox="0 0 12 12" fill="none">
                        <polyline points="1.5,6 4.5,9 10.5,3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
            {formData.purposes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">Select at least one purpose to continue</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Collection */}
        {formData.purposes.includes("Payment Collection") && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentSection formData={formData} setFormData={setFormData} />
            </CardContent>
          </Card>
        )}

        {/* Remark */}
        <Card>
          <CardHeader>
            <CardTitle>Remark</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="remark">Remark (Optional)</Label>
              <Textarea
                id="remark"
                placeholder="Add any remarks about the visit..."
                rows={4}
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Next Visit */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Next Visit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Next Visit Date (Optional)</Label>
                <DatePicker
                  value={formData.nextVisitDate}
                  onChange={(v) => setFormData({ ...formData, nextVisitDate: v })}
                  placeholder="Select next visit date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder">Reminder (Optional)</Label>
                <Input
                  id="reminder"
                  type="text"
                  placeholder="e.g., Follow up on payment"
                  value={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {/* Payment validation hint */}
        {formData.purposes.includes("Payment Collection") && (
          (() => {
            const missingCompany = !formData.paymentFor;
            const missingAmount = formData.paymentFor === "GL"
              ? !formData.paymentReceivedGL || formData.paymentReceivedGL <= 0
              : formData.paymentFor === "VP"
              ? !formData.paymentReceivedVP || formData.paymentReceivedVP <= 0
              : true;
            if (missingCompany || missingAmount) {
              return (
                <p className="text-xs text-destructive text-center -mt-3">
                  {missingCompany
                    ? "Please select GL or VP for payment"
                    : "Please enter a payment amount greater than 0"}
                </p>
              );
            }
            return null;
          })()
        )}

        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
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
            {isSubmitting ? "Submitting..." : "Submit Visit"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

export default function AddBookSellerVisitPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" size="sm" disabled className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title="Add Book Seller Visit"
            description="Log your visit to a book seller"
          />
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </PageContainer>
    }>
      <AddBookSellerVisitForm />
    </Suspense>
  );
}
