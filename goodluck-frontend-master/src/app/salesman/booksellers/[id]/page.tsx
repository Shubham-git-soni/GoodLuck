"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, DollarSign, TrendingUp, Calendar, FileText, Plus, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileSkeleton } from "@/components/ui/skeleton-loaders";
import { BookSeller } from "@/types";
import Link from "next/link";

// Import mock data
import bookSellersData from "@/lib/mock-data/book-sellers.json";

export default function BookSellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<BookSeller | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const sellerData = bookSellersData.find((s) => s.id === params.id);
      if (sellerData) {
        setSeller(sellerData as BookSeller);
      }
      setIsLoading(false);
    }, 800);
  }, [params.id]);

  if (isLoading) {
    return (
      <PageContainer>
        <ProfileSkeleton />
      </PageContainer>
    );
  }

  if (!seller) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Book seller not found</h3>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const outstandingPercentage = (seller.currentOutstanding / seller.creditLimit) * 100;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Book Sellers
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{seller.shopName}</h1>
            <p className="text-muted-foreground mb-2">Owner: {seller.ownerName}</p>
            <Badge
              variant={outstandingPercentage > 80 ? "destructive" : outstandingPercentage > 50 ? "secondary" : "default"}
            >
              {outstandingPercentage.toFixed(0)}% Credit Utilized
            </Badge>
          </div>
          <Link href={`/salesman/booksellers/add-visit?sellerId=${seller.id}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Visit
            </Button>
          </Link>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{seller.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{seller.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{seller.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GST Number</p>
              <p className="font-medium font-mono text-sm">{seller.gstNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Outstanding</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-destructive">
              ₹{(seller.currentOutstanding / 100000).toFixed(2)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Credit Limit</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              ₹{(seller.creditLimit / 100000).toFixed(2)}L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Available Credit</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              ₹{((seller.creditLimit - seller.currentOutstanding) / 100000).toFixed(2)}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Performance (Last 3 Years)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seller.businessHistory.map((year) => (
              <div key={year.year} className="flex items-center justify-between">
                <p className="font-medium">{year.year}</p>
                <p className="font-bold">₹{(year.revenue / 100000).toFixed(2)}L</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {seller.paymentHistory.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">₹{(payment.amount / 100000).toFixed(2)}L</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{payment.mode}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Deadlines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upcoming Payment Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {seller.paymentDeadlines.map((deadline, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium">₹{(deadline.amount / 100000).toFixed(2)}L</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(deadline.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={deadline.status === "Pending" ? "secondary" : "default"}>
                    {deadline.percentage}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{deadline.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
