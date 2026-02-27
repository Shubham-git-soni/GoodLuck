"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, BookOpen } from "lucide-react";

import schoolsData from "@/lib/mock-data/schools.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

// Synthetic ID used when a school name is pre-filled from tour plan but not found in JSON
const PREFILL_ID = "__prefill__";

export default function StepSchoolSelection({ formData, updateFormData }: StepProps) {
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  // Determine if we're in "prefill fallback" mode — name given but no JSON match
  const isPrefillMode = !formData.schoolId && !!formData.prefillSchoolName;
  // The value to pass to <Select> — use synthetic ID when in prefill mode
  const selectValue = formData.schoolId || (isPrefillMode ? PREFILL_ID : "");

  // Get unique cities — SM001 assigned + include pre-filled city from tour plan
  const availableCities = Array.from(
    new Set([
      ...schoolsData.filter((s) => s.assignedTo === "SM001").map((s) => s.city),
      ...(formData.city ? [formData.city] : []),
    ])
  ).sort();

  useEffect(() => {
    if (formData.city) {
      // All schools in the selected city assigned to SM001
      const citySchools = (schoolsData as any[]).filter(
        (s) => s.city === formData.city && s.assignedTo === "SM001"
      );
      // Always include the pre-filled school (different assignee / city mismatch)
      if (formData.schoolId) {
        const preFilledSchool = (schoolsData as any[]).find((s) => s.id === formData.schoolId);
        if (preFilledSchool && !citySchools.find((s: any) => s.id === preFilledSchool.id)) {
          citySchools.unshift(preFilledSchool);
        }
      }
      setSchools(citySchools);
    } else {
      setSchools([]);
    }
  }, [formData.city, formData.schoolId]);

  useEffect(() => {
    if (formData.schoolId) {
      const school = (schoolsData as any[]).find((s) => s.id === formData.schoolId);
      setSelectedSchool(school || null);
      if (school && !formData.city) {
        updateFormData({ city: school.city });
      }
    } else {
      setSelectedSchool(null);
    }
  }, [formData.schoolId, formData.city, updateFormData]);

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Select
          value={formData.city}
          onValueChange={(value) => {
            updateFormData({ city: value, schoolId: "", prefillSchoolName: "" });
            setSelectedSchool(null);
          }}
        >
          <SelectTrigger id="city">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* School Selection */}
      <div className="space-y-2">
        <Label htmlFor="school">School *</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (value === PREFILL_ID) return; // synthetic option — no-op
            updateFormData({ schoolId: value, prefillSchoolName: "" });
            const school = (schoolsData as any[]).find((s) => s.id === value);
            setSelectedSchool(school || null);
          }}
          disabled={!formData.city}
        >
          <SelectTrigger id="school">
            <SelectValue placeholder="Select school" />
          </SelectTrigger>
          <SelectContent>
            {/* Synthetic option when school from tour plan isn't in JSON */}
            {isPrefillMode && (
              <SelectItem value={PREFILL_ID} className="text-muted-foreground italic">
                {formData.prefillSchoolName}
              </SelectItem>
            )}
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!formData.city && (
          <p className="text-xs text-muted-foreground">Please select a city first</p>
        )}
        {isPrefillMode && (
          <p className="text-xs text-amber-600">
            School from tour plan — not in database. You may select a different school above.
          </p>
        )}
      </div>

      {/* Supply Through */}
      <div className="space-y-2">
        <Label htmlFor="supplyThrough">Supply Through *</Label>
        <Select
          value={formData.supplyThrough}
          onValueChange={(value) => updateFormData({ supplyThrough: value })}
        >
          <SelectTrigger id="supplyThrough">
            <SelectValue placeholder="Select supply method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Direct">Direct</SelectItem>
            <SelectItem value="Book Seller">Book Seller</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* School Details (Auto-populated from JSON) */}
      {selectedSchool && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">School Details</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Board:</span>{" "}
                  <span className="font-medium">{selectedSchool.board}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Strength:</span>{" "}
                  <span className="font-medium">{selectedSchool.strength.toLocaleString()}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Address:</span>{" "}
                  <span className="font-medium">{selectedSchool.address}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
