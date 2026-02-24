"use client";

import { Plus, X, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const JOINT_PERSONS = [
  // Managers
  { id: "MGR001", name: "Amit Sharma",  role: "Regional Manager" },
  { id: "MGR002", name: "Neha Gupta",   role: "Regional Manager" },
  { id: "MGR003", name: "Ravi Kumar",   role: "State Manager" },
  // Salesmen
  { id: "SM002",  name: "Rahul Verma",  role: "Salesman" },
  { id: "SM003",  name: "Priya Singh",  role: "Salesman" },
  { id: "SM004",  name: "Deepak Joshi", role: "Salesman" },
];

function emptyManagerRow() {
  return { managerId: "", managerName: "", managerType: "" };
}

export default function StepJointWorking({ formData, updateFormData }: StepProps) {
  const managerRows: any[] = formData.managerRows ?? [emptyManagerRow()];

  const setManagerRows = (rows: any[]) => updateFormData({ managerRows: rows });

  const handleManagerSelect = (index: number, personId: string) => {
    const person = JOINT_PERSONS.find((p) => p.id === personId);
    const rows = [...managerRows];
    rows[index] = person
      ? { managerId: person.id, managerName: person.name, managerType: person.role }
      : emptyManagerRow();
    setManagerRows(rows);
  };

  const handleRemoveRow = (index: number) => {
    const rows = managerRows.filter((_: any, i: number) => i !== index);
    setManagerRows(rows.length ? rows : [emptyManagerRow()]);
  };

  return (
    <div className="space-y-5">

      {/* Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Joint Visit?</p>
            <p className="text-xs text-muted-foreground">Was anyone else accompanying you on this visit?</p>
          </div>
        </div>
        <Switch
          checked={formData.hasManager || false}
          onCheckedChange={(checked) =>
            updateFormData({
              hasManager: checked,
              managerRows: checked ? managerRows : [emptyManagerRow()],
            })
          }
        />
      </div>

      {/* Manager rows */}
      {formData.hasManager && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Joint Person(s)
          </p>

          {managerRows.map((row: any, index: number) => (
            <div key={index} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3">

              {/* Row header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Person {index + 1}</span>
                {managerRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Person dropdown — mobile */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Select Person</Label>
                <div className="md:hidden">
                  <NativeSelect
                    value={row.managerId}
                    onValueChange={(v) => handleManagerSelect(index, v)}
                    placeholder="Choose person…"
                  >
                    {JOINT_PERSONS.map((p) => (
                      <NativeSelectOption key={p.id} value={p.id}>
                        {p.name} — {p.role}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                {/* Person dropdown — desktop */}
                <div className="hidden md:block">
                  <Select value={row.managerId} onValueChange={(v) => handleManagerSelect(index, v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose person…" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOINT_PERSONS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {p.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Manager type chip */}
              {row.managerId && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {row.managerType}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Add More */}
          <Button
            type="button"
            onClick={() => setManagerRows([...managerRows, emptyManagerRow()])}
            className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add More
          </Button>
        </div>
      )}

      {!formData.hasManager && (
        <div className="text-center py-6 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/20">
          <Users className="h-7 w-7 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Solo visit — no one accompanied</p>
        </div>
      )}
    </div>
  );
}
