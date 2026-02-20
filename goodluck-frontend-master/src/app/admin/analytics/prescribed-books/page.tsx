"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";

import schoolsData from "@/lib/mock-data/schools.json";

export default function PrescribedBooksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookAnalytics, setBookAnalytics] = useState<any>({});

  useEffect(() => {
    setTimeout(() => {
      const allPrescribedBooks = schoolsData.flatMap((s) =>
        s.prescribedBooks.map((b) => ({ ...b, schoolName: s.name, city: s.city }))
      );

      const bySubject = allPrescribedBooks.reduce((acc: any, book) => {
        if (!acc[book.subject]) {
          acc[book.subject] = [];
        }
        acc[book.subject].push(book);
        return acc;
      }, {});

      setBookAnalytics({
        total: allPrescribedBooks.length,
        bySubject,
        allPrescribedBooks,
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Prescribed Book Tracking"
        description="Track which schools have prescribed which books"
      />

      {/* Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Prescriptions</p>
              <p className="text-3xl font-bold">{bookAnalytics.total}</p>
            </div>
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Breakdown */}
      {Object.entries(bookAnalytics.bySubject).map(([subject, books]: [string, any]) => (
        <Card key={subject} className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{subject}</CardTitle>
              <Badge>{books.length} prescriptions</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {books.map((book: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{book.book}</p>
                      <p className="text-sm text-muted-foreground">
                        Class {book.class} • {book.schoolName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{book.city}</p>
                    </div>
                    <Badge variant={book.status === "Prescribed" ? "default" : "secondary"}>
                      {book.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </PageContainer>
  );
}
