"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  School as SchoolIcon,
  User,
  Calendar,
  Store,
  MapPin,
  Plus,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { useToast } from "@/hooks/use-toast";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import bookSellersData from "@/lib/mock-data/book-sellers.json";

export default function ManualReportPage() {
  const params = useParams();
  const salesmanId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);

  // Schools and booksellers data
  const [schools, setSchools] = useState<any[]>([]);
  const [booksellers, setBooksellers] = useState<any[]>([]);

  // Add School Form
  const [schoolForm, setSchoolForm] = useState({
    city: "",
    station: "",
    name: "",
    board: "",
    strength: "",
    email: "",
    contactNo: "",
    address: "",
  });

  // Add Contact Person Form
  const [contactForm, setContactForm] = useState({
    personName: "",
    designation: "",
    personEmail: "",
    personContactNo: "",
    schoolCity: "",
    schoolId: "",
    schoolBoard: "",
    schoolStrength: "",
    schoolAddress: "",
  });

  // Add Visit Form
  const [visitForm, setVisitForm] = useState({
    visitedOn: "",
    schoolCity: "",
    schoolId: "",
    schoolBoard: "",
    schoolStrength: "",
    schoolAddress: "",
    contactPersonId: "",
    contactPersonNo: "",
    supplyThrough: "",
    specimenGiven: "",
    specimenRequired: "",
    schoolComment: "",
    yourComment: "",
  });

  // Add Bookseller Form
  const [booksellerForm, setBooksellerForm] = useState({
    name: "",
    email: "",
    contactNo: "",
    address: "",
    city: "",
  });

  // Add Bookseller Visit Form
  const [booksellerVisitForm, setBooksellerVisitForm] = useState({
    visitedOn: "",
    booksellerCity: "",
    booksellerId: "",
    booksellerNumber: "",
    booksellerEmail: "",
    booksellerAddress: "",
    visitPurpose: "",
    paymentReceivedGL: "",
    paymentReceivedVP: "",
    remarks: "",
  });

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
      if (foundSalesman) {
        setSalesman(foundSalesman);
      }
      setSchools(schoolsData);
      setBooksellers(bookSellersData);
      setIsLoading(false);
    }, 500);
  }, [salesmanId]);

  // Auto-fill Contact Person form when school is selected
  const handleContactSchoolChange = (schoolId: string) => {
    const selectedSchool = schools.find((s) => s.id === schoolId);
    if (selectedSchool) {
      setContactForm({
        ...contactForm,
        schoolId,
        schoolBoard: selectedSchool.board,
        schoolStrength: selectedSchool.strength.toString(),
        schoolAddress: selectedSchool.address,
      });
    }
  };

  // Auto-fill Visit form when school is selected
  const handleVisitSchoolChange = (schoolId: string) => {
    const selectedSchool = schools.find((s) => s.id === schoolId);
    if (selectedSchool) {
      setVisitForm({
        ...visitForm,
        schoolId,
        schoolBoard: selectedSchool.board,
        schoolStrength: selectedSchool.strength.toString(),
        schoolAddress: selectedSchool.address,
        contactPersonId: "",
        contactPersonNo: "",
      });
    }
  };

  // Auto-fill contact person number when contact is selected
  const handleVisitContactChange = (contactId: string) => {
    const selectedSchool = schools.find((s) => s.id === visitForm.schoolId);
    if (selectedSchool) {
      const contact = selectedSchool.contacts.find((c: any) => c.id === contactId);
      if (contact) {
        setVisitForm({
          ...visitForm,
          contactPersonId: contactId,
          contactPersonNo: contact.phone,
        });
      }
    }
  };

  // Auto-fill Bookseller Visit form when bookseller is selected
  const handleBooksellerVisitChange = (booksellerId: string) => {
    const selectedBookseller = booksellers.find((b) => b.id === booksellerId);
    if (selectedBookseller) {
      setBooksellerVisitForm({
        ...booksellerVisitForm,
        booksellerId,
        booksellerNumber: selectedBookseller.phone,
        booksellerEmail: selectedBookseller.email,
        booksellerAddress: selectedBookseller.address,
      });
    }
  };

  // Form Submit Handlers
  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "School Added",
      description: `${schoolForm.name} has been added successfully.`,
    });
    // Reset form
    setSchoolForm({
      city: "",
      station: "",
      name: "",
      board: "",
      strength: "",
      email: "",
      contactNo: "",
      address: "",
    });
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Contact Person Added",
      description: `${contactForm.personName} has been added successfully.`,
    });
    // Reset form
    setContactForm({
      personName: "",
      designation: "",
      personEmail: "",
      personContactNo: "",
      schoolCity: "",
      schoolId: "",
      schoolBoard: "",
      schoolStrength: "",
      schoolAddress: "",
    });
  };

  const handleAddVisit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Visit Added",
      description: "School visit has been recorded successfully.",
    });
    // Reset form
    setVisitForm({
      visitedOn: "",
      schoolCity: "",
      schoolId: "",
      schoolBoard: "",
      schoolStrength: "",
      schoolAddress: "",
      contactPersonId: "",
      contactPersonNo: "",
      supplyThrough: "",
      specimenGiven: "",
      specimenRequired: "",
      schoolComment: "",
      yourComment: "",
    });
  };

  const handleAddBookseller = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Bookseller Added",
      description: `${booksellerForm.name} has been added successfully.`,
    });
    // Reset form
    setBooksellerForm({
      name: "",
      email: "",
      contactNo: "",
      address: "",
      city: "",
    });
  };

  const handleAddBooksellerVisit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Bookseller Visit Added",
      description: "Bookseller visit has been recorded successfully.",
    });
    // Reset form
    setBooksellerVisitForm({
      visitedOn: "",
      booksellerCity: "",
      booksellerId: "",
      booksellerNumber: "",
      booksellerEmail: "",
      booksellerAddress: "",
      visitPurpose: "",
      paymentReceivedGL: "",
      paymentReceivedVP: "",
      remarks: "",
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/team">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Get unique cities for dropdowns
  const schoolCities = Array.from(new Set(schools.map((s) => s.city))).sort();
  const booksellerCities = Array.from(new Set(booksellers.map((b) => b.city))).sort();

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title="Manual Reporting"
          description={`Add and manage data for ${salesman.name}`}
        />
      </div>

      {/* 1. Add School */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SchoolIcon className="h-5 w-5" />
            Add School
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSchool}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="school-city">School City</Label>
                <Input
                  id="school-city"
                  placeholder="Enter city"
                  value={schoolForm.city}
                  onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-station">School Station</Label>
                <Input
                  id="school-station"
                  placeholder="Enter station"
                  value={schoolForm.station}
                  onChange={(e) => setSchoolForm({ ...schoolForm, station: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  placeholder="Enter school name"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-board">School Board</Label>
                <Select
                  value={schoolForm.board}
                  onValueChange={(value) => setSchoolForm({ ...schoolForm, board: value })}
                  required
                >
                  <SelectTrigger id="school-board">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="IB">IB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="school-strength">School Strength</Label>
                <Input
                  id="school-strength"
                  type="number"
                  placeholder="Enter strength"
                  value={schoolForm.strength}
                  onChange={(e) => setSchoolForm({ ...schoolForm, strength: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-email">School Email</Label>
                <Input
                  id="school-email"
                  type="email"
                  placeholder="Enter email"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-contact">School Contact No.</Label>
                <Input
                  id="school-contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={schoolForm.contactNo}
                  onChange={(e) => setSchoolForm({ ...schoolForm, contactNo: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="school-address">School Address</Label>
                <Textarea
                  id="school-address"
                  placeholder="Enter full address"
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 2. Add Contact Person */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Add Contact Person
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddContact}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="person-name">Person Name</Label>
                <Input
                  id="person-name"
                  placeholder="Enter person name"
                  value={contactForm.personName}
                  onChange={(e) => setContactForm({ ...contactForm, personName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="person-designation">Person Designation</Label>
                <Input
                  id="person-designation"
                  placeholder="Enter designation"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="person-email">Person Email</Label>
                <Input
                  id="person-email"
                  type="email"
                  placeholder="Enter email"
                  value={contactForm.personEmail}
                  onChange={(e) => setContactForm({ ...contactForm, personEmail: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="person-contact">Person Contact No.</Label>
                <Input
                  id="person-contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={contactForm.personContactNo}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, personContactNo: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact-school-city">School City</Label>
                <Select
                  value={contactForm.schoolCity}
                  onValueChange={(value) =>
                    setContactForm({ ...contactForm, schoolCity: value, schoolId: "" })
                  }
                  required
                >
                  <SelectTrigger id="contact-school-city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-school">School</Label>
                <Select
                  value={contactForm.schoolId}
                  onValueChange={handleContactSchoolChange}
                  required
                  disabled={!contactForm.schoolCity}
                >
                  <SelectTrigger id="contact-school">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools
                      .filter((s) => s.city === contactForm.schoolCity)
                      .map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contact-school-board">School Board (Auto)</Label>
                <Input
                  id="contact-school-board"
                  value={contactForm.schoolBoard}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="contact-school-strength">School Strength (Auto)</Label>
                <Input
                  id="contact-school-strength"
                  value={contactForm.schoolStrength}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <Label htmlFor="contact-school-address">School Address (Auto)</Label>
                <Input
                  id="contact-school-address"
                  value={contactForm.schoolAddress}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Add Visit */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Visit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddVisit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="visit-date">Visited On</Label>
                <Input
                  id="visit-date"
                  type="date"
                  value={visitForm.visitedOn}
                  onChange={(e) => setVisitForm({ ...visitForm, visitedOn: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="visit-school-city">School City</Label>
                <Select
                  value={visitForm.schoolCity}
                  onValueChange={(value) =>
                    setVisitForm({ ...visitForm, schoolCity: value, schoolId: "" })
                  }
                  required
                >
                  <SelectTrigger id="visit-school-city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit-school">School Name</Label>
                <Select
                  value={visitForm.schoolId}
                  onValueChange={handleVisitSchoolChange}
                  required
                  disabled={!visitForm.schoolCity}
                >
                  <SelectTrigger id="visit-school">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools
                      .filter((s) => s.city === visitForm.schoolCity)
                      .map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit-school-board">School Board (Auto)</Label>
                <Input
                  id="visit-school-board"
                  value={visitForm.schoolBoard}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="visit-school-strength">School Strength (Auto)</Label>
                <Input
                  id="visit-school-strength"
                  value={visitForm.schoolStrength}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="visit-school-address">School Address (Auto)</Label>
                <Input
                  id="visit-school-address"
                  value={visitForm.schoolAddress}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="visit-contact">Contact Person</Label>
                <Select
                  value={visitForm.contactPersonId}
                  onValueChange={handleVisitContactChange}
                  required
                  disabled={!visitForm.schoolId}
                >
                  <SelectTrigger id="visit-contact">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitForm.schoolId &&
                      schools
                        .find((s) => s.id === visitForm.schoolId)
                        ?.contacts.map((contact: any) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} - {contact.role}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit-contact-no">Person Contact No. (Auto)</Label>
                <Input
                  id="visit-contact-no"
                  value={visitForm.contactPersonNo}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="visit-supply">Supply Through</Label>
                <Select
                  value={visitForm.supplyThrough}
                  onValueChange={(value) => setVisitForm({ ...visitForm, supplyThrough: value })}
                  required
                >
                  <SelectTrigger id="visit-supply">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Bookseller">Bookseller</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit-specimen-given">Specimen Given</Label>
                <Input
                  id="visit-specimen-given"
                  placeholder="Enter specimen count"
                  value={visitForm.specimenGiven}
                  onChange={(e) => setVisitForm({ ...visitForm, specimenGiven: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="visit-specimen-required">Specimen Required</Label>
                <Input
                  id="visit-specimen-required"
                  placeholder="Enter specimen required"
                  value={visitForm.specimenRequired}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, specimenRequired: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="visit-school-comment">School Comment</Label>
                <Textarea
                  id="visit-school-comment"
                  placeholder="Enter school's comments"
                  value={visitForm.schoolComment}
                  onChange={(e) => setVisitForm({ ...visitForm, schoolComment: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="visit-your-comment">Your Comment</Label>
                <Textarea
                  id="visit-your-comment"
                  placeholder="Enter your comments"
                  value={visitForm.yourComment}
                  onChange={(e) => setVisitForm({ ...visitForm, yourComment: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Visit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. Add Bookseller */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5" />
            Add Bookseller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBookseller}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bookseller-name">Bookseller Name</Label>
                <Input
                  id="bookseller-name"
                  placeholder="Enter bookseller name"
                  value={booksellerForm.name}
                  onChange={(e) => setBooksellerForm({ ...booksellerForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bookseller-email">Bookseller Email</Label>
                <Input
                  id="bookseller-email"
                  type="email"
                  placeholder="Enter email"
                  value={booksellerForm.email}
                  onChange={(e) => setBooksellerForm({ ...booksellerForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bookseller-contact">Bookseller Contact No.</Label>
                <Input
                  id="bookseller-contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={booksellerForm.contactNo}
                  onChange={(e) =>
                    setBooksellerForm({ ...booksellerForm, contactNo: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="bookseller-city">Bookseller City</Label>
                <Input
                  id="bookseller-city"
                  placeholder="Enter city"
                  value={booksellerForm.city}
                  onChange={(e) => setBooksellerForm({ ...booksellerForm, city: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bookseller-address">Bookseller Address</Label>
                <Textarea
                  id="bookseller-address"
                  placeholder="Enter full address"
                  value={booksellerForm.address}
                  onChange={(e) =>
                    setBooksellerForm({ ...booksellerForm, address: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Bookseller
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 5. Add Bookseller Visit */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Bookseller Visit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBooksellerVisit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bv-date">Visited On</Label>
                <Input
                  id="bv-date"
                  type="date"
                  value={booksellerVisitForm.visitedOn}
                  onChange={(e) =>
                    setBooksellerVisitForm({ ...booksellerVisitForm, visitedOn: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="bv-city">Bookseller City</Label>
                <Select
                  value={booksellerVisitForm.booksellerCity}
                  onValueChange={(value) =>
                    setBooksellerVisitForm({
                      ...booksellerVisitForm,
                      booksellerCity: value,
                      booksellerId: "",
                    })
                  }
                  required
                >
                  <SelectTrigger id="bv-city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {booksellerCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bv-name">Bookseller Name</Label>
                <Select
                  value={booksellerVisitForm.booksellerId}
                  onValueChange={handleBooksellerVisitChange}
                  required
                  disabled={!booksellerVisitForm.booksellerCity}
                >
                  <SelectTrigger id="bv-name">
                    <SelectValue placeholder="Select bookseller" />
                  </SelectTrigger>
                  <SelectContent>
                    {booksellers
                      .filter((b) => b.city === booksellerVisitForm.booksellerCity)
                      .map((bookseller) => (
                        <SelectItem key={bookseller.id} value={bookseller.id}>
                          {bookseller.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bv-number">Bookseller Number (Auto)</Label>
                <Input
                  id="bv-number"
                  value={booksellerVisitForm.booksellerNumber}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="bv-email">Bookseller Email (Auto)</Label>
                <Input
                  id="bv-email"
                  value={booksellerVisitForm.booksellerEmail}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="bv-address">Bookseller Address (Auto)</Label>
                <Input
                  id="bv-address"
                  value={booksellerVisitForm.booksellerAddress}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="bv-purpose">Visit Purpose</Label>
                <Select
                  value={booksellerVisitForm.visitPurpose}
                  onValueChange={(value) =>
                    setBooksellerVisitForm({ ...booksellerVisitForm, visitPurpose: value })
                  }
                  required
                >
                  <SelectTrigger id="bv-purpose">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment Collection">Payment Collection</SelectItem>
                    <SelectItem value="Order Discussion">Order Discussion</SelectItem>
                    <SelectItem value="Stock Update">Stock Update</SelectItem>
                    <SelectItem value="Relationship Building">Relationship Building</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bv-payment-gl">Payment Received GL</Label>
                <Input
                  id="bv-payment-gl"
                  type="number"
                  placeholder="Enter GL amount"
                  value={booksellerVisitForm.paymentReceivedGL}
                  onChange={(e) =>
                    setBooksellerVisitForm({
                      ...booksellerVisitForm,
                      paymentReceivedGL: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="bv-payment-vp">Payment Received VP</Label>
                <Input
                  id="bv-payment-vp"
                  type="number"
                  placeholder="Enter VP amount"
                  value={booksellerVisitForm.paymentReceivedVP}
                  onChange={(e) =>
                    setBooksellerVisitForm({
                      ...booksellerVisitForm,
                      paymentReceivedVP: e.target.value,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="bv-remarks">Remarks</Label>
                <Textarea
                  id="bv-remarks"
                  placeholder="Enter remarks"
                  value={booksellerVisitForm.remarks}
                  onChange={(e) =>
                    setBooksellerVisitForm({ ...booksellerVisitForm, remarks: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Bookseller Visit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
