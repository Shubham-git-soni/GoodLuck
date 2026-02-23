"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";

import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function StepPurpose({ formData, updateFormData }: StepProps) {
  const purposeOptions = dropdownOptions.visitPurposes.map((p) => ({
    value: p,
    label: p,
  }));

  const handleChange = (selected: string[]) => {
    updateFormData({ purposes: selected });
    // If "Need Mapping" was deselected, clear its sub-option
    if (!selected.includes("Need Mapping")) {
      updateFormData({ needMappingType: "" });
    }
  };

  const showNeedMapping = (formData.purposes as string[] | undefined)?.includes("Need Mapping");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Purpose(s) of Visit
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Select one or more purposes for this visit</p>

        <MultiSelect
          options={purposeOptions}
          value={formData.purposes ?? []}
          onChange={handleChange}
          placeholder="Select visit purpose(s)…"
          searchable={purposeOptions.length > 6}
          searchPlaceholder="Search purposes…"
        />
      </div>

      {/* Need Mapping sub-options */}
      {showNeedMapping && (
        <div className="space-y-3 pl-4 border-l-2 border-primary/40 animate-in fade-in slide-in-from-top-1 duration-200">
          <Label className="text-sm font-semibold">Need Mapping Type <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={formData.needMappingType}
            onValueChange={(value) => updateFormData({ needMappingType: value })}
            className="space-y-1"
          >
            {dropdownOptions.needMappingTypes.map((type) => (
              <div key={type} className="flex items-center space-x-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={type} id={`nm-${type}`} />
                <Label htmlFor={`nm-${type}`} className="font-normal cursor-pointer text-sm">
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {formData.needMappingType === "Changing specific subjects" && (
            <p className="text-xs text-muted-foreground bg-muted/60 p-3 rounded-lg">
              You'll specify which subjects in the specimen allocation step.
            </p>
          )}
        </div>
      )}

      {!(formData.purposes?.length > 0) && (
        <p className="text-xs text-muted-foreground text-center py-1">
          Select at least one purpose to continue
        </p>
      )}
    </div>
  );
}
