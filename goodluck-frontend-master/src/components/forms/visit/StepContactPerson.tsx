"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

interface StepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function StepContactPerson({ formData, updateFormData }: StepProps) {
  const [existingContacts, setExistingContacts] = useState<any[]>([]);
  const [newContactName, setNewContactName] = useState("");
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
      updateFormData({
        selectedContacts: selected.filter((id: string) => id !== contactId),
      });
    } else {
      updateFormData({
        selectedContacts: [...selected, contactId],
      });
    }
  };

  const handleAddNewContact = () => {
    if (newContactName && newContactRole) {
      const newContacts = formData.newContacts || [];
      updateFormData({
        newContacts: [...newContacts, { name: newContactName, role: newContactRole }],
      });
      setNewContactName("");
      setNewContactRole("");
    }
  };

  const handleRemoveNewContact = (index: number) => {
    const newContacts = formData.newContacts || [];
    updateFormData({
      newContacts: newContacts.filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing Contacts */}
      {existingContacts.length > 0 && (
        <div className="space-y-3">
          <Label>Select Existing Contacts</Label>
          <div className="space-y-2">
            {existingContacts.map((contact) => (
              <Card key={contact.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={contact.id}
                      checked={formData.selectedContacts?.includes(contact.id) || false}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={contact.id}
                        className="font-medium cursor-pointer"
                      >
                        {contact.name}
                      </label>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Contacts */}
      <div className="space-y-3">
        <Label>Add New Contact</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Input
              placeholder="Contact name"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select value={newContactRole} onValueChange={setNewContactRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddNewContact}
          disabled={!newContactName || !newContactRole}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Added New Contacts List */}
      {formData.newContacts && formData.newContacts.length > 0 && (
        <div className="space-y-2">
          <Label>New Contacts Added</Label>
          {formData.newContacts.map((contact: any, index: number) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNewContact(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!formData.selectedContacts?.length && !formData.newContacts?.length && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Please select at least one contact or add a new contact
        </p>
      )}
    </div>
  );
}
