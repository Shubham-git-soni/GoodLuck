"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import bookSellersData from "@/lib/mock-data/book-sellers.json";

function AddBookSellerVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const sellerId = searchParams.get("sellerId");
    if (sellerId) {
      setFormData((prev) => ({ ...prev, bookSellerId: sellerId }));
    }
  }, [searchParams]);

  const handlePurposeToggle = (purpose: string) => {
    const purposes = formData.purposes;
    if (purposes.includes(purpose)) {
      setFormData({
        ...formData,
        purposes: purposes.filter((p) => p !== purpose),
      });
    } else {
      setFormData({
        ...formData,
        purposes: [...purposes, purpose],
      });
    }
  };

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

  // Visit purposes relevant to booksellers
  const bookSellerPurposes = [
    "Relationship Building",
    "Payment Collection",
    "Documentation",
    "Inquiry",
    "Sales Return Follow-Up",
  ];

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
          <CardHeader>
            <CardTitle>Purpose of Visit (Multi-select) *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookSellerPurposes.map((purpose) => (
                <Card
                  key={purpose}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={purpose}
                        checked={formData.purposes.includes(purpose)}
                        onCheckedChange={() => handlePurposeToggle(purpose)}
                      />
                      <label htmlFor={purpose} className="font-medium cursor-pointer flex-1">
                        {purpose}
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Collection */}
        {formData.purposes.includes("Payment Collection") && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentReceivedGL">Payment Received GL (₹)</Label>
                  <Input
                    id="paymentReceivedGL"
                    type="number"
                    min="0"
                    placeholder="Enter GL payment amount"
                    value={formData.paymentReceivedGL || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentReceivedGL: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentReceivedVP">Payment Received VP (₹)</Label>
                  <Input
                    id="paymentReceivedVP"
                    type="number"
                    min="0"
                    placeholder="Enter VP payment amount"
                    value={formData.paymentReceivedVP || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentReceivedVP: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
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
                <Label htmlFor="nextVisitDate">Next Visit Date (Optional)</Label>
                <Input
                  id="nextVisitDate"
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
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
        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !formData.bookSellerId || formData.purposes.length === 0}>
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
