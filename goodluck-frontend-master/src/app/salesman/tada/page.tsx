"use client";

import { useEffect, useState } from "react";
import { DollarSign, Calendar, Plus, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

import tadaClaimsData from "@/lib/mock-data/tada-claims.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function TadaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate validation
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
      setIsDialogOpen(false);
      setFormData({ date: "", city: "", travelMode: "", amount: 0 });
      setIsSubmitting(false);

      // Add new claim to list
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
      setClaims([newClaim, ...claims]);
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
  const totalAmount = claims
    .filter((c) => c.status === "Approved")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <PageContainer>
      <PageHeader
        title="TA/DA Claims"
        description="Manage your travel allowance claims"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Submit TA/DA Claim</DialogTitle>
                <DialogDescription>
                  Fill in the details of your travel expenses
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    required
                  >
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownOptions.cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelMode">Travel Mode *</Label>
                  <Select
                    value={formData.travelMode}
                    onValueChange={(value) => setFormData({ ...formData, travelMode: value })}
                    required
                  >
                    <SelectTrigger id="travelMode">
                      <SelectValue placeholder="Select travel mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownOptions.travelModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Auto-validation will check if you have a visit logged for this date and if the amount is within limits.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Pending Claims</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Approved Claims</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Approved</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card>
        <CardHeader>
          <CardTitle>Claim History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {claims.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No claims submitted yet
              </p>
            ) : (
              claims.map((claim) => (
                <Card key={claim.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {new Date(claim.date).toLocaleDateString()}
                          </p>
                          <Badge
                            variant={
                              claim.status === "Approved"
                                ? "default"
                                : claim.status === "Rejected"
                                ? "destructive"
                                : claim.status === "Flagged"
                                ? "destructive"
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
                            <p className="font-medium text-foreground">
                              ₹{claim.amount.toLocaleString()}
                            </p>
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
                          <p className="text-xs text-muted-foreground mt-2">
                            Note: {claim.comments}
                          </p>
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
