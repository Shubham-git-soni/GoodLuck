"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function StepNextVisit({ formData, updateFormData }: StepProps) {
  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Schedule Next Visit</h4>
              <p className="text-sm text-muted-foreground">
                Set a reminder for your next visit to this school (optional)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Next Visit Date */}
            <div className="space-y-2">
              <Label htmlFor="nextVisitDate">Next Visit Date (Optional)</Label>
              <Input
                id="nextVisitDate"
                type="date"
                min={minDate}
                value={formData.nextVisitDate}
                onChange={(e) => updateFormData({ nextVisitDate: e.target.value })}
              />
            </div>

            {/* Next Visit Purpose */}
            {formData.nextVisitDate && (
              <div className="space-y-2">
                <Label htmlFor="nextVisitPurpose">Purpose of Next Visit</Label>
                <Select
                  value={formData.nextVisitPurpose}
                  onValueChange={(value) => updateFormData({ nextVisitPurpose: value })}
                >
                  <SelectTrigger id="nextVisitPurpose">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownOptions.visitPurposes.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reminder */}
            <div className="space-y-2">
              <Label htmlFor="reminder">Reminder (Optional)</Label>
              <Input
                id="reminder"
                type="text"
                placeholder="e.g., Follow up on payment, Check new book requirements"
                value={formData.reminder}
                onChange={(e) => updateFormData({ reminder: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Set a reminder note for this school
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {formData.nextVisitDate && formData.nextVisitPurpose && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Next Visit Scheduled
            </p>
            <p className="text-sm text-blue-700">
              {new Date(formData.nextVisitDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Purpose: {formData.nextVisitPurpose}
            </p>
          </CardContent>
        </Card>
      )}

      {!formData.nextVisitDate && (
        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
          Scheduling a next visit is optional. You can skip this step if not needed.
        </p>
      )}
    </div>
  );
}
