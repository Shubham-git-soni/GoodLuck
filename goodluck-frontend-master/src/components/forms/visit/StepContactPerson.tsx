"use client";

import { useState, useEffect } from "react";
import { Plus, X, User, Phone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function StepContactPerson({ formData, updateFormData }: StepProps) {
  const [existingContacts, setExistingContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRole, setNewContactRole] = useState("");

  useEffect(() => {
    if (formData.schoolId) {
      const school = schoolsData.find((s) => s.id === formData.schoolId);
      if (school) {
        setExistingContacts(school.contacts || []);
      }
    }
  }, [formData.schoolId]);

  const handleContactToggle = (contactId: string) => {
    const selected = formData.selectedContacts || [];
    if (selected.includes(contactId)) {
      updateFormData({ selectedContacts: selected.filter((id: string) => id !== contactId) });
    } else {
      updateFormData({ selectedContacts: [...selected, contactId] });
    }
  };

  const handleAddNewContact = () => {
    if (newContactName && newContactRole) {
      const newContacts = formData.newContacts || [];
      updateFormData({
        newContacts: [...newContacts, { name: newContactName, phone: newContactPhone, role: newContactRole }],
      });
      setNewContactName("");
      setNewContactPhone("");
      setNewContactRole("");
    }
  };

  const handleRemoveNewContact = (index: number) => {
    const newContacts = formData.newContacts || [];
    updateFormData({ newContacts: newContacts.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-5">

      {/* ── Existing Contacts ── */}
      {existingContacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Existing Contacts
          </p>
          <div className="space-y-2">
            {existingContacts.map((contact) => {
              const isSelected = formData.selectedContacts?.includes(contact.id) || false;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleContactToggle(contact.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:bg-muted/40"
                  }`}
                >
                  {/* Checkbox indicator */}
                  <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                  }`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>
                    {contact.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add New Contact ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Add New Contact
        </p>

        {/* Name input */}
        <div className="space-y-1.5">
          <Label className="text-sm">Contact Name</Label>
          <Input
            placeholder="Enter contact name"
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Contact Number */}
        <div className="space-y-1.5">
          <Label className="text-sm">Contact Number</Label>
          <Input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value.replace(/\D/g, ""))}
            className="h-11"
          />
        </div>

        {/* Role — NativeSelect on mobile, Radix on desktop */}
        <div className="space-y-1.5">
          <Label className="text-sm">Role</Label>
          <div className="md:hidden">
            <NativeSelect
              value={newContactRole}
              onValueChange={setNewContactRole}
              placeholder="Select role"
            >
              {dropdownOptions.contactRoles.map((role) => (
                <NativeSelectOption key={role} value={role}>{role}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="hidden md:block">
            <Select value={newContactRole} onValueChange={setNewContactRole}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.contactRoles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add button — full width on mobile */}
        <Button
          type="button"
          onClick={handleAddNewContact}
          disabled={!newContactName || !newContactPhone || !newContactRole}
          className="w-full h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* ── Newly Added Contacts ── */}
      {formData.newContacts && formData.newContacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Added Contacts
          </p>
          {formData.newContacts.map((contact: any, index: number) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.role}</p>
                {contact.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveNewContact(index)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-background border hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!formData.selectedContacts?.length && !formData.newContacts?.length && (
        <div className="text-center py-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20">
          <User className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Select an existing contact or add a new one</p>
        </div>
      )}
    </div>
  );
}
