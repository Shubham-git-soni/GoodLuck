"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import schoolsData from "@/lib/mock-data/schools.json";

export default function SchoolReplacementPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "request">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState("");
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pattakat schools that can be replaced
  const pattakatSchools = schoolsData.filter(
    (s) => s.assignedTo === "SM001" && s.isPattakat
  );

  // Available schools from the replacement pool (not assigned to current salesman)
  const availableSchools = schoolsData.filter(
    (s) => s.assignedTo !== "SM001" && !s.isPattakat
  );

  const filteredAvailable = availableSchools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Replacement request submitted successfully!");
      console.log("Replacement request:", { selectedSchool, reason });
      setIsSubmitting(false);
      router.push("/salesman/schools");
    }, 1500);
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>

        <PageHeader
          title="School Replacement"
          description="Request to replace a Pattakat school"
        />
      </div>

      {step === "select" && (
        <>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can request replacement for Pattakat schools. Select a school below to initiate the replacement process.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Select School to Replace</CardTitle>
            </CardHeader>
            <CardContent>
              {pattakatSchools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You don't have any Pattakat schools to replace
                  </p>
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pattakatSchools.map((school) => (
                    <Card
                      key={school.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSelectedSchool(school.id);
                        setStep("request");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{school.name}</h3>
                              <Badge variant="destructive">Pattakat</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {school.city} • {school.board}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Visit Count: {school.visitCount}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {step === "request" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected School */}
          <Card>
            <CardHeader>
              <CardTitle>School to Replace</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const school = schoolsData.find((s) => s.id === selectedSchool);
                return school ? (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{school.name}</h3>
                      <Badge variant="destructive">Pattakat</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {school.city} • {school.board} • {school.strength} students
                    </p>
                  </div>
                ) : null;
              })()}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setStep("select")}
              >
                Change School
              </Button>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle>Replacement Reason *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="reason">Explain why you want to replace this school</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter detailed reason for replacement..."
                  rows={6}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This request will be reviewed by the GM Sales
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Browse Replacement Pool */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Replacement Pool (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search available schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {filteredAvailable.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No schools found in the replacement pool
                    </p>
                  ) : (
                    filteredAvailable.slice(0, 10).map((school) => (
                      <div
                        key={school.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium">{school.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {school.city} • {school.board} • {school.strength} students
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-6">
            <Button type="button" variant="outline" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      )}
    </PageContainer>
  );
}
