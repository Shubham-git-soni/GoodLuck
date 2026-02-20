"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QB } from "@/types";
import qbsData from "@/lib/mock-data/qbs.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function AddQBVisitPage() {
  const router = useRouter();
  const [qbs] = useState<QB[]>(qbsData as QB[]);
  const [filteredSchools, setFilteredSchools] = useState<QB[]>([]);

  const [formData, setFormData] = useState({
    schoolCity: "",
    schoolName: "",
    schoolBoard: "",
    schoolStrength: "",
    schoolAddress: "",
    purposeOfVisit: "",
    teacherName: "",
    teacherDesignation: "",
    teacherContactNo: "",
    teacherEmail: "",
    remarks: "",
  });

  // Get unique cities from QBs
  const cities = Array.from(new Set(qbs.map(qb => qb.city))).sort();

  // Filter schools by selected city
  useEffect(() => {
    if (formData.schoolCity) {
      const filtered = qbs.filter(qb => qb.city === formData.schoolCity);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
    // Reset school selection when city changes
    if (formData.schoolName) {
      setFormData(prev => ({
        ...prev,
        schoolName: "",
        schoolBoard: "",
        schoolStrength: "",
        schoolAddress: "",
      }));
    }
  }, [formData.schoolCity, qbs]);

  // Auto-fill school details when school is selected
  const handleSchoolSelect = (schoolName: string) => {
    const selectedSchool = qbs.find(qb => qb.schoolName === schoolName);

    if (selectedSchool) {
      setFormData(prev => ({
        ...prev,
        schoolName: selectedSchool.schoolName,
        schoolBoard: selectedSchool.schoolBoard,
        schoolStrength: selectedSchool.strength.toString(),
        schoolAddress: selectedSchool.address,
      }));
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.schoolCity || !formData.schoolName || !formData.purposeOfVisit ||
        !formData.teacherName || !formData.teacherDesignation || !formData.teacherContactNo) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate email format if provided
    if (formData.teacherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.teacherEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number format
    if (!/^[+]?[0-9\s-()]+$/.test(formData.teacherContactNo)) {
      toast.error("Please enter a valid contact number");
      return;
    }

    toast.success("QB Visit recorded successfully!");
    router.push("/salesman/qbs");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Add QB Visit"
        description="Record a new Question Bank visit"
        action={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        {/* School Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>School Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* School City */}
            <div className="grid gap-2">
              <Label htmlFor="schoolCity">School City *</Label>
              <Select
                value={formData.schoolCity}
                onValueChange={(value) => setFormData({ ...formData, schoolCity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
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

            {/* School Name */}
            <div className="grid gap-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Select
                value={formData.schoolName}
                onValueChange={handleSchoolSelect}
                disabled={!formData.schoolCity}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.schoolCity ? "Select school" : "Select city first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSchools.map((school) => (
                    <SelectItem key={school.id} value={school.schoolName}>
                      {school.schoolName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.schoolCity && filteredSchools.length === 0 && (
                <p className="text-xs text-muted-foreground">No schools found in this city</p>
              )}
            </div>

            {/* Auto-filled fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schoolBoard">School Board</Label>
                <Input
                  id="schoolBoard"
                  value={formData.schoolBoard}
                  disabled
                  placeholder="Auto-filled"
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schoolStrength">School Strength</Label>
                <Input
                  id="schoolStrength"
                  value={formData.schoolStrength}
                  disabled
                  placeholder="Auto-filled"
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="schoolAddress">School Address</Label>
              <Textarea
                id="schoolAddress"
                value={formData.schoolAddress}
                disabled
                placeholder="Auto-filled"
                rows={2}
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visit Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="purposeOfVisit">Purpose of Visit *</Label>
              <Select
                value={formData.purposeOfVisit}
                onValueChange={(value) => setFormData({ ...formData, purposeOfVisit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownOptions.visitPurposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose}
                    </SelectItem>
                  ))}
                  <SelectItem value="QB Discussion">QB Discussion</SelectItem>
                  <SelectItem value="QB Sample Distribution">QB Sample Distribution</SelectItem>
                  <SelectItem value="Question Paper Review">Question Paper Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Enter any additional notes or comments"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Teacher/Contact Person Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher/Contact Person Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teacherName">Teacher Name *</Label>
                <Input
                  id="teacherName"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacherDesignation">Teacher Designation *</Label>
                <Select
                  value={formData.teacherDesignation}
                  onValueChange={(value) => setFormData({ ...formData, teacherDesignation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.contactRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teacherContactNo">Teacher Contact No *</Label>
                <Input
                  id="teacherContactNo"
                  value={formData.teacherContactNo}
                  onChange={(e) => setFormData({ ...formData, teacherContactNo: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacherEmail">Teacher Email</Label>
                <Input
                  id="teacherEmail"
                  type="email"
                  value={formData.teacherEmail}
                  onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                  placeholder="teacher@school.edu"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            Save Visit
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
