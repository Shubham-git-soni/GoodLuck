"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, BookOpen, Target, TrendingUp, Calendar, Plus, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileSkeleton } from "@/components/ui/skeleton-loaders";
import { School } from "@/types";
import Link from "next/link";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

export default function SchoolProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const schoolData = schoolsData.find((s) => s.id === params.id);
      if (schoolData) {
        setSchool(schoolData as School);
        // Get visit history for this school
        const schoolVisits = visitsData.filter(
          (v) => v.type === "school" && v.schoolId === params.id
        );
        setVisits(schoolVisits);
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

  if (!school) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">School not found</h3>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Calculate revenue trend
  const revenueTrend =
    school.businessHistory.length >= 2
      ? ((school.businessHistory[school.businessHistory.length - 1].revenue -
          school.businessHistory[school.businessHistory.length - 2].revenue) /
          school.businessHistory[school.businessHistory.length - 2].revenue) *
        100
      : 0;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{school.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{school.board}</Badge>
              {school.isPattakat && (
                <Badge variant="destructive">Pattakat</Badge>
              )}
              <Badge variant="outline">{school.visitCount} visits</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/salesman/schools/add-visit?schoolId=${school.id}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Visit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{school.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Student Strength</p>
                <p className="font-medium">{school.strength.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Board</p>
                <p className="font-medium">{school.board}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Last Visit</p>
                <p className="font-medium">
                  {school.lastVisitDate
                    ? new Date(school.lastVisitDate).toLocaleDateString()
                    : "Not visited yet"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {school.businessHistory.map((year) => (
              <div key={year.year} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{year.year}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{(year.revenue / 100000).toFixed(2)}L</p>
                </div>
              </div>
            ))}
            {revenueTrend !== 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Revenue Trend:{" "}
                  <span
                    className={`font-medium ${
                      revenueTrend > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {revenueTrend > 0 ? "+" : ""}
                    {revenueTrend.toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prescribed Books */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prescribed Books (Current Year)</CardTitle>
        </CardHeader>
        <CardContent>
          {school.prescribedBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No books prescribed yet
            </p>
          ) : (
            <div className="space-y-3">
              {school.prescribedBooks.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{book.book}</p>
                    <p className="text-sm text-muted-foreground">
                      {book.subject} - Class {book.class}
                    </p>
                  </div>
                  <Badge
                    variant={book.status === "Prescribed" ? "default" : "secondary"}
                  >
                    {book.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sales Plan (This Season)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Target Revenue</p>
              <p className="text-lg font-bold">
                ₹{(school.salesPlan.targetRevenue / 100000).toFixed(2)}L
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Target Subjects</p>
              <div className="flex flex-wrap gap-2">
                {school.salesPlan.subjects.map((subject) => (
                  <Badge key={subject} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Expected Conversion</p>
              <p className="font-medium">{school.salesPlan.expectedConversion}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Discount History</CardTitle>
        </CardHeader>
        <CardContent>
          {school.discountHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No discount history available
            </p>
          ) : (
            <div className="space-y-3">
              {school.discountHistory.map((discount) => (
                <div
                  key={discount.year}
                  className="flex items-center justify-between"
                >
                  <p className="font-medium">{discount.year}</p>
                  <Badge variant="secondary">{discount.percentage}% discount</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Persons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {school.contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {contact.phone}
                      </p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-muted-foreground">
                        {contact.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No visit history available
            </p>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3 rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {new Date(visit.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={visit.status === "Completed" ? "default" : "secondary"}>
                      {visit.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {visit.purposes.map((purpose: string) => (
                      <Badge key={purpose} variant="outline" className="text-xs">
                        {purpose}
                      </Badge>
                    ))}
                  </div>
                  {visit.specimensGiven && visit.specimensGiven.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Specimens given: {visit.specimensGiven.length} books
                      (₹{visit.totalSpecimenCost?.toLocaleString()})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
