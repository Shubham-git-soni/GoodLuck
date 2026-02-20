"use client";

import { useEffect, useState } from "react";
import { Search, User, Mail, Phone, School, MapPin, Users, Plus, Calendar } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import EmptyState from "@/components/ui/empty-state";
import { ContactPerson, School as SchoolType } from "@/types";
import { toast } from "sonner";

// Import mock data
import contactPersonsData from "@/lib/mock-data/contact-persons.json";
import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

export default function ContactPersonsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Schools data for dropdowns
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);

  // Add Contact Person Form State
  const [newContact, setNewContact] = useState({
    name: "",
    designation: "",
    email: "",
    contactNo: "",
    schoolCity: "",
    schoolId: "",
  });

  // Selected school details (auto-filled)
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Filter contacts for current salesman (SM001)
      const assigned = contactPersonsData.filter((c) => c.assignedTo === "SM001");
      setContactPersons(assigned as ContactPerson[]);
      setFilteredContacts(assigned as ContactPerson[]);

      // Load schools data
      const assignedSchools = schoolsData.filter((s) => s.assignedTo === "SM001");
      setSchools(assignedSchools as SchoolType[]);

      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    // Apply search filter
    if (searchQuery) {
      const filtered = contactPersons.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.schoolCity.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contactPersons);
    }
  }, [searchQuery, contactPersons]);

  // Filter schools when city is selected
  useEffect(() => {
    if (newContact.schoolCity) {
      const citySchools = schools.filter((s) => s.city === newContact.schoolCity);
      setFilteredSchools(citySchools);
    } else {
      setFilteredSchools([]);
    }
  }, [newContact.schoolCity, schools]);

  // Auto-fill school details when school is selected
  useEffect(() => {
    if (newContact.schoolId) {
      const school = schools.find((s) => s.id === newContact.schoolId);
      setSelectedSchool(school || null);
    } else {
      setSelectedSchool(null);
    }
  }, [newContact.schoolId, schools]);

  // Handle Add Contact Person Submit
  const handleAddContact = () => {
    if (!newContact.name || !newContact.designation || !newContact.email || !newContact.contactNo || !newContact.schoolCity || !newContact.schoolId) {
      toast.error("Please fill all required fields");
      return;
    }

    toast.success("Contact person added successfully!");
    setIsAddModalOpen(false);
    setNewContact({
      name: "",
      designation: "",
      email: "",
      contactNo: "",
      schoolCity: "",
      schoolId: "",
    });
    setSelectedSchool(null);
  };

  // Group contacts by school
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const schoolName = contact.schoolName;
    if (!acc[schoolName]) {
      acc[schoolName] = [];
    }
    acc[schoolName].push(contact);
    return acc;
  }, {} as Record<string, ContactPerson[]>);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="My Contact Persons" description="Manage your school contacts" />
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="My Contact Persons"
        description={`${contactPersons.length} contacts across ${Object.keys(groupedContacts).length} schools`}
        action={
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Contact Person</DialogTitle>
                <DialogDescription>
                  Add a new contact person from your assigned schools.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>

                {/* Designation */}
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <Select value={newContact.designation} onValueChange={(value) => setNewContact({ ...newContact, designation: value })}>
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

                {/* Email and Contact No */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactNo">Contact No. *</Label>
                    <Input
                      id="contactNo"
                      value={newContact.contactNo}
                      onChange={(e) => setNewContact({ ...newContact, contactNo: e.target.value })}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>

                {/* School City */}
                <div className="grid gap-2">
                  <Label htmlFor="schoolCity">School City *</Label>
                  <Select
                    value={newContact.schoolCity}
                    onValueChange={(value) => {
                      setNewContact({ ...newContact, schoolCity: value, schoolId: "" });
                      setSelectedSchool(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school city" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(schools.map(s => s.city))).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* School Name */}
                <div className="grid gap-2">
                  <Label htmlFor="schoolId">School Name *</Label>
                  <Select
                    value={newContact.schoolId}
                    onValueChange={(value) => setNewContact({ ...newContact, schoolId: value })}
                    disabled={!newContact.schoolCity}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={newContact.schoolCity ? "Select school" : "Select city first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSchools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-filled School Details */}
                {selectedSchool && (
                  <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                    <h4 className="font-semibold text-sm">School Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Board</Label>
                        <p className="font-medium">{selectedSchool.board}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Student Strength</Label>
                        <p className="font-medium">{selectedSchool.strength}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="font-medium text-sm">{selectedSchool.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddModalOpen(false);
                  setNewContact({
                    name: "",
                    designation: "",
                    email: "",
                    contactNo: "",
                    schoolCity: "",
                    schoolId: "",
                  });
                  setSelectedSchool(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddContact}>Add Contact Person</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, designation, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredContacts.length} of {contactPersons.length} contact persons
        </p>
      </div>

      {/* Contact Persons List - Grouped by School */}
      {filteredContacts.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No contact persons found"
          description="Try adjusting your search criteria or add a new contact person"
          action={{
            label: "Clear Search",
            onClick: () => setSearchQuery(""),
          }}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContacts).map(([schoolName, contacts]) => (
            <div key={schoolName}>
              {/* School Header */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  {schoolName}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{contacts[0].schoolCity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {contacts[0].schoolBoard}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{contacts[0].schoolStrength} students</span>
                  </div>
                </div>
              </div>

              {/* Contacts for this school */}
              <div className="grid gap-3 md:grid-cols-2 mb-4">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{contact.name}</h4>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {contact.designation}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{contact.contactNo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="text-xs">
                            Added on {new Date(contact.addedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
