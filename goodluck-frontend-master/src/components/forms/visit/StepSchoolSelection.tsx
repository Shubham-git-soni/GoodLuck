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

export default function StepSchoolSelection({ formData, updateFormData }: StepProps) {
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  // Get unique cities that have schools assigned to SM001
  const availableCities = Array.from(
    new Set(
      schoolsData
        .filter((s) => s.assignedTo === "SM001")
        .map((s) => s.city)
    )
  ).sort();

  useEffect(() => {
    if (formData.city) {
      // Filter schools by city
      const citySchools = schoolsData.filter((s) => s.city === formData.city && s.assignedTo === "SM001");
      setSchools(citySchools);
    } else {
      setSchools([]);
    }
  }, [formData.city]);

  useEffect(() => {
    if (formData.schoolId) {
      const school = schoolsData.find((s) => s.id === formData.schoolId);
      setSelectedSchool(school || null);
      if (school) {
        updateFormData({ city: school.city });
      }
    }
  }, [formData.schoolId, updateFormData]);

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Select
          value={formData.city}
          onValueChange={(value) => {
            updateFormData({ city: value, schoolId: "" });
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
          value={formData.schoolId}
          onValueChange={(value) => {
            updateFormData({ schoolId: value });
            const school = schoolsData.find((s) => s.id === value);
            setSelectedSchool(school || null);
          }}
          disabled={!formData.city}
        >
          <SelectTrigger id="school">
            <SelectValue placeholder="Select school" />
          </SelectTrigger>
          <SelectContent>
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

      {/* School Details (Auto-populated) */}
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
