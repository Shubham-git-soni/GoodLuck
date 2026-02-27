"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, MapPin, Users, BookOpen, Phone, Mail, Building2,
    UserCheck, TrendingUp, TrendingDown, Minus, Plus, Pencil, Trash2, Save, X
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

import schoolsData from "@/lib/mock-data/schools.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    isEditing?: boolean;
}

interface School {
    id: string;
    name: string;
    city: string;
    state: string;
    board: string;
    strength: number;
    address: string;
    isBlocked: boolean;
    visitCount: number;
    lastVisitDate: string | null;
    assignedTo: string;
    contacts: Contact[];
    businessHistory: { year: number; revenue: number }[];
}

const emptyContact = (): Contact => ({
    id: "new_" + Date.now(),
    name: "",
    role: "",
    phone: "",
    email: "",
    isEditing: true,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function SchoolDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [school, setSchool] = useState<School | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [addingContact, setAddingContact] = useState(false);
    const [newContact, setNewContact] = useState<Contact>(emptyContact());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Contact>>({});

    useEffect(() => {
        setTimeout(() => {
            const found = (schoolsData as any[]).find((s) => s.id === params.id);
            if (found) setSchool(found);
            setIsLoading(false);
        }, 500);
    }, [params.id]);

    if (isLoading) return <PageContainer><DashboardSkeleton /></PageContainer>;
    if (!school) return <PageContainer><p className="text-center py-20 text-muted-foreground">School not found.</p></PageContainer>;

    // ── Derived ─────────────────────────────────────────────────────────────────
    const latestRevenue = school.businessHistory.find((h) => h.year === 2025)?.revenue || 0;
    const prevRevenue = school.businessHistory.find((h) => h.year === 2024)?.revenue || 0;
    const growthPct = prevRevenue > 0 ? ((latestRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // ── Contact Handlers ────────────────────────────────────────────────────────
    const handleSaveNew = () => {
        if (!newContact.name) { toast.error("Contact name is required"); return; }
        setSchool((prev) => prev ? { ...prev, contacts: [...prev.contacts, { ...newContact, id: "C" + Date.now() }] } : prev);
        toast.success(`${newContact.name} added`);
        setNewContact(emptyContact());
        setAddingContact(false);
    };

    const handleStartEdit = (c: Contact) => {
        setEditingId(c.id);
        setEditData({ name: c.name, role: c.role, phone: c.phone, email: c.email });
    };

    const handleSaveEdit = (id: string) => {
        setSchool((prev) => prev ? {
            ...prev,
            contacts: prev.contacts.map((c) => c.id === id ? { ...c, ...editData } : c)
        } : prev);
        toast.success("Contact updated");
        setEditingId(null);
    };

    const handleDelete = (id: string, name: string) => {
        setSchool((prev) => prev ? { ...prev, contacts: prev.contacts.filter((c) => c.id !== id) } : prev);
        toast.success(`${name} removed`);
    };

    return (
        <PageContainer>
            {/* ── Back + Title ── */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{school.name}</h1>
                    <p className="text-xs text-muted-foreground">{school.id} · {school.city}</p>
                </div>
                <div className="ml-auto flex gap-2 flex-wrap justify-end">
                    <Badge variant="secondary">{school.board}</Badge>
                    {school.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                    <Badge variant={school.visitCount >= 2 ? "default" : "outline"}>{school.visitCount} visits</Badge>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                {/* ── Left Column: School Info ── */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" /> School Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{school.address}, {school.city}, {school.state}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4 shrink-0" />
                                <span>{school.strength.toLocaleString()} students</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4 shrink-0" />
                                <span>Board: <span className="font-medium text-foreground">{school.board}</span></span>
                            </div>
                            {school.lastVisitDate && (
                                <div className="text-xs text-muted-foreground border-t pt-2">
                                    Last visit: {new Date(school.lastVisitDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {school.businessHistory.map((h) => (
                                <div key={h.year} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{h.year - 1}–{String(h.year).slice(2)}</span>
                                    <span className="font-medium">{h.revenue > 0 ? `₹${h.revenue.toLocaleString()}` : "—"}</span>
                                </div>
                            ))}
                            {prevRevenue > 0 && (
                                <div className="border-t pt-2 flex items-center gap-1">
                                    {growthPct > 0
                                        ? <><TrendingUp className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-600 text-xs font-semibold">+{growthPct.toFixed(1)}% YoY</span></>
                                        : growthPct < 0
                                            ? <><TrendingDown className="h-3.5 w-3.5 text-rose-600" /><span className="text-rose-600 text-xs font-semibold">{growthPct.toFixed(1)}% YoY</span></>
                                            : <><Minus className="h-3.5 w-3.5 text-slate-400" /><span className="text-slate-500 text-xs">Stable</span></>
                                    }
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Contact Persons ── */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                    Contact Persons
                                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">{school.contacts.length}</Badge>
                                </CardTitle>
                                {!addingContact && (
                                    <Button size="sm" variant="outline" onClick={() => { setAddingContact(true); setNewContact(emptyContact()); }}>
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Contact
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* ── Add New Contact Form ── */}
                            {addingContact && (
                                <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Contact</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Name *</Label>
                                            <Input className="h-8 text-sm" placeholder="Full name" value={newContact.name}
                                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Designation</Label>
                                            <Select value={newContact.role} onValueChange={(v) => setNewContact({ ...newContact, role: v })}>
                                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {dropdownOptions.contactRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Phone</Label>
                                            <Input className="h-8 text-sm" placeholder="+91 XXXXX XXXXX" value={newContact.phone}
                                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Email</Label>
                                            <Input className="h-8 text-sm" type="email" placeholder="email@school.edu" value={newContact.email}
                                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-1">
                                        <Button size="sm" variant="ghost" onClick={() => setAddingContact(false)}>
                                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleSaveNew}>
                                            <Save className="h-3.5 w-3.5 mr-1" /> Save Contact
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Contact List ── */}
                            {school.contacts.length === 0 && !addingContact ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    No contact persons yet. Click "Add Contact" to get started.
                                </div>
                            ) : (
                                school.contacts.map((contact) => (
                                    <div key={contact.id} className="border rounded-xl p-4">
                                        {editingId === contact.id ? (
                                            /* ── Edit Mode ── */
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Name *</Label>
                                                        <Input className="h-8 text-sm" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Designation</Label>
                                                        <Select value={editData.role || ""} onValueChange={(v) => setEditData({ ...editData, role: v })}>
                                                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {dropdownOptions.contactRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Phone</Label>
                                                        <Input className="h-8 text-sm" value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                                                    </div>
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-xs">Email</Label>
                                                        <Input className="h-8 text-sm" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                        <X className="h-3.5 w-3.5 mr-1" /> Cancel
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleSaveEdit(contact.id)}>
                                                        <Save className="h-3.5 w-3.5 mr-1" /> Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── View Mode ── */
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">{contact.name}</span>
                                                        {contact.role && <Badge variant="secondary" className="text-[10px]">{contact.role}</Badge>}
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                        {contact.phone && (
                                                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                                                                <Phone className="h-3.5 w-3.5 shrink-0" />{contact.phone}
                                                            </a>
                                                        )}
                                                        {contact.email && (
                                                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-primary truncate">
                                                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{contact.email}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleStartEdit(contact)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(contact.id, contact.name)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
