"use client";

import { useEffect, useState } from "react";
import { DollarSign, Calendar, Plus, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { MobileSheet } from "@/components/ui/mobile-sheet";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

import tadaClaimsData from "@/lib/mock-data/tada-claims.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function TadaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Flagged">("All");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isDesktopDialogOpen, setIsDesktopDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    city: "",
    travelMode: "",
    amount: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      const userClaims = tadaClaimsData.filter((c) => c.salesmanId === "SM001");
      setClaims(userClaims);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const validation = {
        hasVisit: Math.random() > 0.3,
        hasSpecimenData: Math.random() > 0.3,
        withinLimit: formData.amount <= 2000,
      };

      if (!validation.hasVisit) {
        toast.error("No visit logged for this date. Please add a visit first.");
        setIsSubmitting(false);
        return;
      }

      if (!validation.withinLimit) {
        toast.warning("Amount exceeds limit. Claim will be flagged for review.");
      }

      toast.success("TA/DA claim submitted successfully!");
      setIsMobileSheetOpen(false);
      setIsDesktopDialogOpen(false);
      setFormData({ date: "", city: "", travelMode: "", amount: 0 });
      setIsSubmitting(false);

      const newClaim = {
        id: `TA${Date.now()}`,
        salesmanId: "SM001",
        salesmanName: "Rajesh Kumar",
        date: formData.date,
        city: formData.city,
        travelMode: formData.travelMode,
        amount: formData.amount,
        status: validation.withinLimit ? "Pending" : "Flagged",
        hasVisit: validation.hasVisit,
        hasSpecimenData: validation.hasSpecimenData,
        withinLimit: validation.withinLimit,
      };
      setClaims((prev) => [newClaim, ...prev]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  const pendingCount = claims.filter((c) => c.status === "Pending").length;
  const approvedCount = claims.filter((c) => c.status === "Approved").length;
  const rejectedCount = claims.filter((c) => c.status === "Rejected" || c.status === "Flagged").length;
  const totalAmount = claims
    .filter((c) => c.status === "Approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredClaims = activeFilter === "All" ? claims : claims.filter((c) => {
    if (activeFilter === "Rejected") return c.status === "Rejected" || c.status === "Flagged";
    return c.status === activeFilter;
  });

  const tabs: { label: string; value: typeof activeFilter; count: number }[] = [
    { label: "All", value: "All", count: claims.length },
    { label: "Pending", value: "Pending", count: pendingCount },
    { label: "Approved", value: "Approved", count: approvedCount },
    { label: "Rejected", value: "Rejected", count: rejectedCount },
  ];

  const commonFields = (
    <>
      <div className="space-y-2">
        <Label>Date *</Label>
        <DatePicker
          value={formData.date}
          onChange={(v) => setFormData({ ...formData, date: v })}
          placeholder="Select date"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-2">
        <Label>Amount (₹) *</Label>
        <Input
          type="number"
          min="0"
          placeholder="Enter amount"
          value={formData.amount || ""}
          onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
          required
        />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Auto-validation will check if you have a visit logged for this date and if the amount is within limits.
        </AlertDescription>
      </Alert>
    </>
  );

  const mobileFormFields = (
    <div className="space-y-4">
      {commonFields}
      <div className="space-y-2">
        <Label>City *</Label>
        <NativeSelect
          value={formData.city}
          onValueChange={(value) => setFormData({ ...formData, city: value })}
          placeholder="Select city"
        >
          {dropdownOptions.cities.map((city) => (
            <NativeSelectOption key={city} value={city}>{city}</NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label>Travel Mode *</Label>
        <NativeSelect
          value={formData.travelMode}
          onValueChange={(value) => setFormData({ ...formData, travelMode: value })}
          placeholder="Select travel mode"
        >
          {dropdownOptions.travelModes.map((mode) => (
            <NativeSelectOption key={mode} value={mode}>{mode}</NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );

  const desktopFormFields = (
    <div className="space-y-4">
      {commonFields}
      <div className="space-y-2">
        <Label>City *</Label>
        <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {dropdownOptions.cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Travel Mode *</Label>
        <Select value={formData.travelMode} onValueChange={(value) => setFormData({ ...formData, travelMode: value })}>
          <SelectTrigger><SelectValue placeholder="Select travel mode" /></SelectTrigger>
          <SelectContent>
            {dropdownOptions.travelModes.map((mode) => (
              <SelectItem key={mode} value={mode}>{mode}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <PageContainer>
      {/* Mobile Bottom Sheet */}
      <MobileSheet
        open={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        title="Submit TA/DA Claim"
        description="Fill in the details of your travel expenses"
        footer={
          <Button
            className="w-full h-12 text-sm font-semibold rounded-2xl"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Claim"}
          </Button>
        }
      >
        {mobileFormFields}
      </MobileSheet>

      {/* Desktop Dialog */}
      <Dialog open={isDesktopDialogOpen} onOpenChange={setIsDesktopDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit TA/DA Claim</DialogTitle>
            <DialogDescription>Fill in the details of your travel expenses</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {desktopFormFields}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDesktopDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Claim"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="TA/DA Claims"
        description="Manage your travel allowance claims"
        action={
          <>
            <Button className="md:hidden" onClick={() => setIsMobileSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Claim
            </Button>
            <Button className="hidden md:flex" onClick={() => setIsDesktopDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Claim
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-3 md:pt-6 md:px-6 md:pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 md:hidden">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground hidden md:block" />
            </div>
            <p className="text-xl md:text-2xl font-bold">{pendingCount}</p>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 leading-tight">Pending<br className="md:hidden" /> Claims</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-3 md:pt-6 md:px-6 md:pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 md:hidden">
                <DollarSign className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground hidden md:block" />
            </div>
            <p className="text-xl md:text-2xl font-bold">{approvedCount}</p>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 leading-tight">Approved<br className="md:hidden" /> Claims</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-3 md:pt-6 md:px-6 md:pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-muted md:hidden">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground hidden md:block" />
            </div>
            <p className="text-xl md:text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 leading-tight">Total<br className="md:hidden" /> Approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="mb-3">Claim History</CardTitle>
          {/* Filter Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
                  ${activeFilter === tab.value
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                    ${activeFilter === tab.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {filteredClaims.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} claims found</p>
            ) : (
              filteredClaims.map((claim) => (
                <Card key={claim.id} className="hover:bg-muted/50 transition-colors" >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{new Date(claim.date).toLocaleDateString()}</p>
                          <Badge
                            variant={
                              claim.status === "Approved" ? "default"
                              : claim.status === "Rejected" ? "destructive"
                              : claim.status === "Flagged" ? "destructive"
                              : "secondary"
                            }
                          >
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>
                            <p className="text-xs">City</p>
                            <p className="font-medium text-foreground">{claim.city}</p>
                          </div>
                          <div>
                            <p className="text-xs">Travel Mode</p>
                            <p className="font-medium text-foreground">{claim.travelMode}</p>
                          </div>
                          <div>
                            <p className="text-xs">Amount</p>
                            <p className="font-medium text-foreground">₹{claim.amount.toLocaleString()}</p>
                          </div>
                          {claim.approvedDate && (
                            <div>
                              <p className="text-xs">Approved On</p>
                              <p className="font-medium text-foreground">
                                {new Date(claim.approvedDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        {claim.comments && (
                          <p className="text-xs text-muted-foreground mt-2">Note: {claim.comments}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
