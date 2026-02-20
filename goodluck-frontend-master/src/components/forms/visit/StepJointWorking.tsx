"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const managers = [
  { id: "MGR001", name: "Amit Sharma", type: "Regional Manager" },
  { id: "MGR002", name: "Neha Gupta", type: "Regional Manager" },
  { id: "MGR003", name: "Ravi Kumar", type: "State Manager" },
];

export default function StepJointWorking({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Toggle for Joint Working */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="hasManager" className="text-base font-medium">
                  Manager Accompanied?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Was this a joint visit with your manager?
                </p>
              </div>
            </div>
            <Switch
              id="hasManager"
              checked={formData.hasManager || false}
              onCheckedChange={(checked) => {
                updateFormData({
                  hasManager: checked,
                  managerId: checked ? formData.managerId : "",
                  managerType: checked ? formData.managerType : "",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Manager Selection */}
      {formData.hasManager && (
        <div className="space-y-4 pl-6 border-l-2 border-primary">
          <div className="space-y-2">
            <Label htmlFor="manager">Select Manager *</Label>
            <Select
              value={formData.managerId}
              onValueChange={(value) => {
                const manager = managers.find((m) => m.id === value);
                updateFormData({
                  managerId: value,
                  managerType: manager?.type || "",
                });
              }}
            >
              <SelectTrigger id="manager">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} - {manager.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.managerId && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Manager Type:</span>{" "}
                  {formData.managerType}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!formData.hasManager && (
        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
          This was a solo visit without manager accompaniment
        </p>
      )}
    </div>
  );
}
