"use client";

import { useState, useEffect } from "react";
import { Search, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

// Import mock data
import schoolsData from "@/lib/mock-data/schools.json";

interface ContactPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  schoolId: string;
  schoolName: string;
  city: string;
  state: string;
  board: string;
  strength: number;
  address: string;
}

export default function ContactPersonListPage() {
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactPerson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    // Extract all contacts from schools
    const allContacts: ContactPerson[] = [];

    schoolsData.forEach((school: any) => {
      school.contacts.forEach((contact: any) => {
        allContacts.push({
          id: contact.id,
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          email: contact.email,
          schoolId: school.id,
          schoolName: school.name,
          city: school.city,
          state: school.state,
          board: school.board,
          strength: school.strength,
          address: school.address,
        });
      });
    });

    setContacts(allContacts);
    setFilteredContacts(allContacts);
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone.includes(searchQuery) ||
          contact.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((contact) => contact.role === roleFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      filtered = filtered.filter((contact) => contact.city === cityFilter);
    }

    setFilteredContacts(filtered);
  }, [searchQuery, roleFilter, cityFilter, contacts]);

  const handleDelete = (contact: ContactPerson) => {
    const updatedData = contacts.filter((c) => c.id !== contact.id);
    setContacts(updatedData);

    toast({
      title: "Contact Deleted",
      description: `${contact.name} has been removed from the list.`,
      variant: "destructive",
    });
  };

  const handleEdit = (contact: ContactPerson) => {
    toast({
      title: "Edit Contact",
      description: `Opening edit form for ${contact.name}`,
    });
  };

  // Get unique roles and cities for filters
  const roles = Array.from(new Set(contacts.map((c) => c.role))).sort();
  const cities = Array.from(new Set(contacts.map((c) => c.city))).sort();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Contact Person List"
          description={`Complete list of ${contacts.length} contact persons`}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-muted-foreground">
                {filteredContacts.length} contacts found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px] text-center font-semibold">Sr. No.</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Name</TableHead>
                    <TableHead className="min-w-[150px] font-semibold">Designation</TableHead>
                    <TableHead className="min-w-[140px] font-semibold">Contact No.</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">Email</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">School ID</TableHead>
                    <TableHead className="min-w-[220px] font-semibold">School Name</TableHead>
                    <TableHead className="min-w-[100px] font-semibold">Board</TableHead>
                    <TableHead className="text-right min-w-[100px] font-semibold">Strength</TableHead>
                    <TableHead className="min-w-[280px] font-semibold">Address</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">City</TableHead>
                    <TableHead className="min-w-[120px] font-semibold">State</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">Delete</TableHead>
                    <TableHead className="w-[80px] text-center font-semibold">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                        No contacts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact, index) => (
                      <TableRow key={contact.id} className="hover:bg-muted/30">
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold">{contact.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {contact.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm">{contact.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm truncate max-w-[190px]" title={contact.email}>
                              {contact.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {contact.schoolId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{contact.schoolName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {contact.board}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {contact.strength.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-sm line-clamp-2">{contact.address}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{contact.city}</TableCell>
                        <TableCell className="font-medium">{contact.state}</TableCell>
                        <TableCell className="text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{contact.name}</strong> ({contact.role}) from{" "}
                                  <strong>{contact.schoolName}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(contact)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(contact)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
