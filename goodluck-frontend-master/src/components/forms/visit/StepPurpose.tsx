"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function StepPurpose({ formData, updateFormData }: StepProps) {
  const handlePurposeToggle = (purpose: string) => {
    const purposes = formData.purposes || [];
    if (purposes.includes(purpose)) {
      updateFormData({
        purposes: purposes.filter((p: string) => p !== purpose),
      });
      // Reset need mapping type if unchecking Need Mapping
      if (purpose === "Need Mapping") {
        updateFormData({ needMappingType: "" });
      }
    } else {
      updateFormData({
        purposes: [...purposes, purpose],
      });
    }
  };

  const showNeedMappingOptions = formData.purposes?.includes("Need Mapping");

  return (
    <div className="space-y-6">
      {/* Purpose Selection */}
      <div className="space-y-3">
        <Label>Select Purpose(s) of Visit (Multi-select) *</Label>
        <div className="space-y-2">
          {dropdownOptions.visitPurposes.map((purpose) => (
            <Card
              key={purpose}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={purpose}
                    checked={formData.purposes?.includes(purpose) || false}
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
      </div>

      {/* Need Mapping Sub-options */}
      {showNeedMappingOptions && (
        <div className="space-y-3 pl-6 border-l-2 border-primary">
          <Label>Need Mapping Type *</Label>
          <RadioGroup
            value={formData.needMappingType}
            onValueChange={(value) => updateFormData({ needMappingType: value })}
          >
            {dropdownOptions.needMappingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={type} />
                <Label htmlFor={type} className="font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {formData.needMappingType === "Changing specific subjects" && (
            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              Note: You'll specify which subjects in the specimen allocation step
            </p>
          )}
        </div>
      )}

      {!formData.purposes?.length && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Please select at least one purpose for this visit
        </p>
      )}
    </div>
  );
}
