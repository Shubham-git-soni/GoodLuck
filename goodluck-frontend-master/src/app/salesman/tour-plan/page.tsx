"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Trash2, Save, MapPin } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { School } from "@/types";
import schoolsData from "@/lib/mock-data/schools.json";

interface PlannedVisit {
  id: string;
  schoolId: string;
  schoolName: string;
  city: string;
  address: string;
  objective: string;
  date: string;
}

const visitObjectives = [
  "Book Prescription Discussion",
  "Sample Distribution",
  "Relationship Building",
  "Payment Follow-up",
  "Feedback Collection",
  "New Product Introduction",
  "Specimen Return Collection",
];

export default function TourPlanPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [plannedVisits, setPlannedVisits] = useState<PlannedVisit[]>([]);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);

  // Add school form state
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedObjective, setSelectedObjective] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Get assigned schools for current salesman
  const schools = (schoolsData as School[]).filter(s => s.assignedTo === "SM001");

  const handleAddSchool = () => {
    if (!selectedSchoolId || !selectedObjective || !selectedDate) {
      toast.error("Please fill all fields");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please set tour plan date range first");
      return;
    }

    // Validate date is within range
    if (selectedDate < startDate || selectedDate > endDate) {
      toast.error("Visit date must be within tour plan date range");
      return;
    }

    const school = schools.find(s => s.id === selectedSchoolId);
    if (!school) return;

    // Check if school already added
    if (plannedVisits.some(v => v.schoolId === selectedSchoolId && v.date === selectedDate)) {
      toast.error("This school is already added for this date");
      return;
    }

    const newVisit: PlannedVisit = {
      id: `VISIT-${Date.now()}`,
      schoolId: school.id,
      schoolName: school.name,
      city: school.city,
      address: school.address,
      objective: selectedObjective,
      date: selectedDate,
    };

    setPlannedVisits([...plannedVisits, newVisit]);
    setSelectedSchoolId("");
    setSelectedObjective("");
    setSelectedDate("");
    setIsAddSchoolOpen(false);
    toast.success("School added to tour plan");
  };

  const handleRemoveSchool = (visitId: string) => {
    setPlannedVisits(plannedVisits.filter(v => v.id !== visitId));
    toast.success("School removed from tour plan");
  };

  const handleSubmitPlan = () => {
    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }

    if (plannedVisits.length === 0) {
      toast.error("Please add at least one school to the tour plan");
      return;
    }

    toast.success("Tour plan submitted for approval!");
    // In real app, would navigate or show success state
    setTimeout(() => {
      router.push("/salesman/dashboard");
    }, 1500);
  };

  // Group visits by date
  const visitsByDate = plannedVisits.reduce((acc, visit) => {
    if (!acc[visit.date]) {
      acc[visit.date] = [];
    }
    acc[visit.date].push(visit);
    return acc;
  }, {} as Record<string, PlannedVisit[]>);

  const sortedDates = Object.keys(visitsByDate).sort();

  return (
    <PageContainer>
      <PageHeader
        title="My Tour Plan"
        description="Create and manage your weekly tour plan"
      />

      {/* Date Range Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tour Plan Period</CardTitle>
          <CardDescription>Select the date range for your tour plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add School Button */}
      <div className="mb-6">
        <Dialog open={isAddSchoolOpen} onOpenChange={setIsAddSchoolOpen}>
          <DialogTrigger asChild>
            <Button disabled={!startDate || !endDate}>
              <Plus className="h-4 w-4 mr-2" />
              Add School Visit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add School to Tour Plan</DialogTitle>
              <DialogDescription>
                Select a school, objective, and date for your visit
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Visit Date */}
              <div className="space-y-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={startDate}
                  max={endDate}
                />
              </div>

              {/* School Selection */}
              <div className="space-y-2">
                <Label htmlFor="school">Select School *</Label>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name} - {school.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Objective Selection */}
              <div className="space-y-2">
                <Label htmlFor="objective">Primary Objective *</Label>
                <Select value={selectedObjective} onValueChange={setSelectedObjective}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitObjectives.map((objective) => (
                      <SelectItem key={objective} value={objective}>
                        {objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSchoolOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSchool}>Add to Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Planned Visits */}
      {plannedVisits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No visits planned yet. Add schools to your tour plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6 mb-6">
            {sortedDates.map((date) => (
              <Card key={date}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardTitle>
                    </div>
                    <Badge>{visitsByDate[date].length} visits</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {visitsByDate[date].map((visit) => (
                      <Card key={visit.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{visit.schoolName}</h4>
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{visit.city}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {visit.objective}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSchool(visit.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pb-6">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPlan}>
              <Save className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
