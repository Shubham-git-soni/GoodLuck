"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus, Eye, Pencil, Trash2, Users, UserCog, UserCheck,
    Search, Shield, Save, X, ChevronRight, ArrowLeft,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import managersData from "@/lib/mock-data/managers.json";
import salesmenData from "@/lib/mock-data/salesmen.json";
import dropdownOptions from "@/lib/mock-data/dropdown-options.json";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

// ─── Searchable Select (Combobox) ───────────────────────────────────────────────────
function SearchableSelect({
    value, onChange, options, placeholder = "Select...",
}: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 font-normal text-sm"
                >
                    <span className="truncate">{value || <span className="text-muted-foreground">{placeholder}</span>}</span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[200]" align="start">
                <Command>
                    <CommandInput placeholder="Search..." className="h-8 text-sm" />
                    <CommandList className="max-h-48">
                        <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">No results found</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt}
                                    value={opt}
                                    onSelect={(v) => { onChange(v); setOpen(false); }}
                                    className="text-sm cursor-pointer"
                                >
                                    <Check className={`mr-2 h-3.5 w-3.5 ${value === opt ? "opacity-100" : "opacity-0"}`} />
                                    {opt}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "Salesman" | "Manager" | "Admin";
type UserStatus = "Active" | "Inactive";

interface UserRow {
    id: string;
    name: string;
    username: string;
    email: string;
    contactNo: string;
    role: UserRole;
    state: string;
    status: UserStatus;
    assignedTo?: string; // manager id for salesmen
    createdDate: string;
}

// ─── Module list for authorization tab ───────────────────────────────────────
const MODULES = [
    { module: "Dashboard", subModule: "Overview" },
    { module: "Schools", subModule: "School List" },
    { module: "Schools", subModule: "Contact Persons" },
    { module: "Book Sellers", subModule: "Book Seller List" },
    { module: "Books", subModule: "Books Master" },
    { module: "Visits", subModule: "Visit Reports" },
    { module: "Specimen", subModule: "Specimen Tracking" },
    { module: "TA/DA", subModule: "TA/DA Claims" },
    { module: "Tour Plan", subModule: "Tour Plans" },
    { module: "Feedback", subModule: "Feedback Manager" },
    { module: "Reports", subModule: "Attendance Report" },
    { module: "Reports", subModule: "Visit Analytics" },
    { module: "Reports", subModule: "Year-wise Report" },
    { module: "Year Comparison", subModule: "Year Comparison Report" },
    { module: "Expenses", subModule: "Expense Reports" },
    { module: "Expenses", subModule: "Expense Policies" },
    { module: "Analytics", subModule: "School Analytics" },
    { module: "Analytics", subModule: "Prescribed Books" },
];

type PermLevel = "None" | "View" | "User" | "Admin";
interface ModulePerm {
    permLevel: PermLevel;
    canView: boolean;
    canSave: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canPrint: boolean;
}

const defaultPerm = (): ModulePerm => ({
    permLevel: "None", canView: false, canSave: false,
    canEdit: false, canDelete: false, canExport: false, canPrint: false,
});

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

// ─── Seed initial users from mock data ───────────────────────────────────────
function seedUsers(): UserRow[] {
    const mgrs: UserRow[] = (managersData as any[]).map((m) => ({
        id: m.id, name: m.name, username: m.id.toLowerCase(),
        email: m.email, contactNo: m.contactNo ?? "",
        role: "Manager" as UserRole, state: m.state,
        status: m.status as UserStatus, createdDate: m.createdDate,
    }));
    const sms: UserRow[] = (salesmenData as any[]).map((s) => ({
        id: s.id, name: s.name, username: s.id.toLowerCase(),
        email: s.email, contactNo: s.phone ?? "",
        role: "Salesman" as UserRole, state: s.state,
        status: s.status as UserStatus,
        assignedTo: s.managerId,
        createdDate: s.joinedDate,
    }));
    return [...mgrs, ...sms];
}




function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-xs md:text-sm font-medium rounded-full transition-all whitespace-nowrap ${active
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
        >
            {icon}{label}
        </button>
    );
}

// ─── Add / Edit User Modal ────────────────────────────────────────────────────
function UserModal({
    open, onClose, onSave, mode, initial, allUsers,
}: {
    open: boolean;
    onClose: () => void;
    onSave: (u: Partial<UserRow> & { password?: string; modulePerms?: Record<string, ModulePerm> }) => void;
    mode: "add" | "edit";
    initial?: UserRow;
    allUsers: UserRow[];
}) {
    const [tab, setTab] = useState<"profile" | "other" | "auth" | "email">("profile");

    // Profile
    const [name, setName] = useState(initial?.name ?? "");
    const [username, setUsername] = useState(initial?.username ?? "");
    const [email, setEmail] = useState(initial?.email ?? "");
    const [contact, setContact] = useState(initial?.contactNo ?? "");
    const [password, setPassword] = useState("");
    const [rePass, setRePass] = useState("");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    // Other Details
    const [role, setRole] = useState<UserRole>(initial?.role ?? "Salesman");
    const [state, setState] = useState(initial?.state ?? "");
    const [city, setCity] = useState("");
    const [designation, setDesignation] = useState("");
    const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? "");
    const [status, setStatus] = useState<UserStatus>(initial?.status ?? "Active");

    // Authorization
    const [modulePerms, setModulePerms] = useState<Record<string, ModulePerm>>(
        () => Object.fromEntries(MODULES.map((m) => [`${m.module}__${m.subModule}`, defaultPerm()]))
    );
    const [authSearch, setAuthSearch] = useState("");
    const [selectAll, setSelectAll] = useState(false);

    const managers = allUsers.filter((u) => u.role === "Manager");

    const filteredModules = MODULES.filter(
        (m) => m.module.toLowerCase().includes(authSearch.toLowerCase()) ||
            m.subModule.toLowerCase().includes(authSearch.toLowerCase())
    );

    const toggleSelectAll = () => {
        const newVal = !selectAll;
        setSelectAll(newVal);
        setModulePerms((prev) => {
            const updated = { ...prev };
            MODULES.forEach((m) => {
                const key = `${m.module}__${m.subModule}`;
                updated[key] = {
                    permLevel: newVal ? "User" : "None",
                    canView: newVal, canSave: newVal, canEdit: newVal,
                    canDelete: newVal, canExport: newVal, canPrint: newVal,
                };
            });
            return updated;
        });
    };

    const updatePerm = (key: string, field: keyof ModulePerm, value: any) => {
        setModulePerms((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    };

    const handleSave = () => {
        if (!name || !email || !username) {
            setTab("profile");
            toast.error("Name, Username, Email are required"); return;
        }
        if (mode === "add" && (!password || password !== rePass)) {
            setTab("profile");
            toast.error(password ? "Passwords do not match" : "Password is required"); return;
        }
        onSave({ name, username, email, contactNo: contact, role, state, assignedTo, status, password, modulePerms });
        onClose();
    };

    const handleClose = () => {
        setTab("profile"); setName(""); setUsername(""); setEmail(""); setContact("");
        setPassword(""); setRePass(""); setPhotoUrl(null);
        setRole("Salesman"); setState(""); setCity(""); setDesignation(""); setAssignedTo("");
        setStatus("Active"); setAuthSearch("");
        onClose();
    };

    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const mql = window.matchMedia("(max-width: 767px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const PERM_LEVELS: PermLevel[] = ["None", "View", "User", "Admin"];

    // ── Shared tab content ──
    const tabContent = (
        <>
            {/* ── USER PROFILE ── */}
            {tab === "profile" && (
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* User Photo */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <label htmlFor="photo-upload" className="cursor-pointer group">
                            <div className="h-20 w-20 md:h-28 md:w-28 rounded-full border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center group-hover:border-primary/60 transition-colors bg-muted/20 overflow-hidden relative">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    <>
                                        <Plus className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                                        <span className="text-[10px] text-muted-foreground/60 mt-1">Upload</span>
                                    </>
                                )}
                            </div>
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPhotoUrl(URL.createObjectURL(file));
                            }}
                        />
                        <span className="text-xs text-muted-foreground">User Photo</span>
                        {photoUrl && (
                            <button onClick={() => setPhotoUrl(null)} className="text-[10px] text-destructive hover:underline">Remove</button>
                        )}
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>User Name <span className="text-destructive">*</span></Label>
                            <Input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email <span className="text-destructive">*</span></Label>
                            <Input type="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contact No.</Label>
                            <Input placeholder="Enter contact number" value={contact} onChange={(e) => setContact(e.target.value)} />
                        </div>
                        {mode === "add" && (
                            <>
                                <div className="space-y-1.5">
                                    <Label>Password <span className="text-destructive">*</span></Label>
                                    <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Re-type Password <span className="text-destructive">*</span></Label>
                                    <Input type="password" placeholder="Re-enter password" value={rePass} onChange={(e) => setRePass(e.target.value)} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── OTHER DETAILS ── */}
            {tab === "other" && (
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>Role <span className="text-destructive">*</span></Label>
                            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="max-h-48 overflow-y-auto z-[200]">
                                    <SelectItem value="Salesman">Salesman</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {role === "Salesman" && (
                            <div className="space-y-1.5">
                                <Label>Under Manager</Label>
                                <SearchableSelect
                                    value={managers.find(m => m.id === assignedTo)?.name ?? ""}
                                    onChange={(v) => {
                                        const found = managers.find(m => m.name === v);
                                        setAssignedTo(found?.id ?? "");
                                    }}
                                    options={["— None —", ...managers.map(m => m.name)]}
                                    placeholder="Select manager"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent position="popper" className="max-h-48 overflow-y-auto z-[200]">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>State</Label>
                            <SearchableSelect value={state} onChange={setState} options={dropdownOptions.states} placeholder="Select state" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>City</Label>
                            <SearchableSelect value={city} onChange={setCity} options={dropdownOptions.cities} placeholder="Select city" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Address</Label>
                        <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter full address" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Additional Details</Label>
                        <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Enter any additional details or notes" />
                    </div>
                </div>
            )}

            {/* ── AUTHORIZATION ── */}
            {tab === "auth" && (
                <div className="space-y-3">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">Module Authentication</span>
                        </div>
                        <div className="relative w-full md:max-w-xs md:w-64">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input className="pl-8 h-9 text-sm" placeholder="Search modules..." value={authSearch} onChange={(e) => setAuthSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-auto max-h-[380px]">
                        <table className="w-full text-xs border-collapse">
                            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                                <tr>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider border-b w-36">Module</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider border-b w-44">Sub-Module</th>
                                    <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider border-b w-28">Perm Level</th>
                                    <th className="px-3 py-2.5 text-center border-b">
                                        <div className="flex flex-col items-center gap-1">
                                            <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="h-3.5 w-3.5 accent-primary cursor-pointer" />
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Select All</span>
                                        </div>
                                    </th>
                                    {["Can View", "Can Save", "Can Edit", "Can Delete", "Can Export", "Can Print"].map((h) => (
                                        <th key={h} className="px-2 py-2.5 text-center border-b text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredModules.map((m) => {
                                    const key = `${m.module}__${m.subModule}`;
                                    const p = modulePerms[key];
                                    const allChecked = p.canView && p.canSave && p.canEdit && p.canDelete && p.canExport && p.canPrint;
                                    const toggleRow = () => {
                                        const newVal = !allChecked;
                                        updatePerm(key, "canView", newVal);
                                        updatePerm(key, "canSave", newVal);
                                        updatePerm(key, "canEdit", newVal);
                                        updatePerm(key, "canDelete", newVal);
                                        updatePerm(key, "canExport", newVal);
                                        updatePerm(key, "canPrint", newVal);
                                    };
                                    return (
                                        <tr key={key} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-3 py-2 font-medium text-foreground">{m.module}</td>
                                            <td className="px-3 py-2 text-muted-foreground">{m.subModule}</td>
                                            <td className="px-3 py-2">
                                                <Select value={p.permLevel} onValueChange={(v) => updatePerm(key, "permLevel", v as PermLevel)}>
                                                    <SelectTrigger className="h-6 text-xs border-border/50"><SelectValue /></SelectTrigger>
                                                    <SelectContent position="popper" className="max-h-48 overflow-y-auto z-[200]">
                                                        {PERM_LEVELS.map((l) => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-2 py-1.5 text-center">
                                                <input type="checkbox" checked={allChecked} onChange={toggleRow} className="h-3.5 w-3.5 accent-primary cursor-pointer" />
                                            </td>
                                            {(["canView", "canSave", "canEdit", "canDelete", "canExport", "canPrint"] as (keyof ModulePerm)[]).map((f) => (
                                                <td key={f} className="px-2 py-1.5 text-center">
                                                    <input type="checkbox" checked={p[f] as boolean} onChange={(e) => updatePerm(key, f, e.target.checked)} className="h-3.5 w-3.5 accent-primary cursor-pointer" />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );

    // ── Tab items config ──
    const tabs = [
        { key: "profile" as const, icon: <UserCheck className="h-4 w-4" />, label: "User Profile" },
        { key: "other" as const, icon: <UserCog className="h-4 w-4" />, label: "Other Details" },
        { key: "auth" as const, icon: <Shield className="h-4 w-4" />, label: "Authorization" },
    ];

    // Desktop pill-style tab bar (same as attendance report)
    const desktopTabBar = (
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {t.icon}{t.label}
                </button>
            ))}
        </div>
    );

    // Mobile underline-style tab bar (same as attendance report)
    const mobileTabBar = (
        <div className="flex gap-0 border-b">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors -mb-px flex-1 justify-center whitespace-nowrap ${tab === t.key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {t.icon}{t.label}
                </button>
            ))}
        </div>
    );

    // ── Mobile: Bottom Sheet ──
    if (isMobile) {
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-[100]" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
                <div
                    className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
                    style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1 shrink-0">
                        <div className="w-10 h-1 rounded-full bg-border" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
                        <h2 className="text-lg font-bold tracking-tight">{mode === "add" ? "User Creation" : "Edit User"}</h2>
                        <button onClick={handleClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Tabs — mobile underline style */}
                    <div className="shrink-0">{mobileTabBar}</div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 pb-4">{tabContent}</div>

                    {/* Footer */}
                    <div className="shrink-0 px-5 pb-6 pt-3 border-t flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={handleClose}>
                            <X className="h-4 w-4 mr-1.5" /> Cancel
                        </Button>
                        <Button className="flex-1 h-12 rounded-2xl" onClick={handleSave}>
                            <Save className="h-4 w-4 mr-1.5" /> Save
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Desktop: Centered Dialog ──
    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="!w-[75vw] !max-w-[75vw] h-[80vh] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-5 pb-0">
                    <DialogTitle>{mode === "add" ? "User Creation" : "Edit User"}</DialogTitle>
                </DialogHeader>
                <div className="px-4 pt-3 pb-2 shrink-0">{desktopTabBar}</div>
                <div className="flex-1 overflow-y-auto px-6 py-5">{tabContent}</div>
                <DialogFooter className="gap-2 px-6 py-4 border-t shrink-0">
                    <Button variant="outline" onClick={handleClose}>
                        <X className="h-4 w-4 mr-1.5" /> Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1.5" /> Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Column definitions (built inside page to access callbacks) ──────────────────────────────
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UserMasterPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserRow[]>(seedUsers);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserRow | null>(null);
    const [viewUser, setViewUser] = useState<UserRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Build columns here so we have access to router + state setters
    const USER_COLUMNS: GridColumn<UserRow>[] = [
        { key: "id", header: "ID", width: 90, sortable: true, pinned: "left" },
        {
            key: "name", header: "Name", width: 175, sortable: true, filterable: true,
            render: (v: string, row: UserRow) => {
                if (row.role === "Salesman") {
                    return (
                        <button
                            onClick={() => router.push(`/admin/team/${row.id}`)}
                            className="text-left font-medium whitespace-nowrap hover:underline transition-colors text-orange-600 dark:text-orange-400 cursor-pointer"
                            title={`Click to view ${row.role} profile`}
                        >
                            {v}
                        </button>
                    );
                }
                return (
                    <span
                        className={`font-medium whitespace-nowrap ${row.role === "Manager" ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                            }`}
                    >
                        {v}
                    </span>
                );
            },
        },
        { key: "username", header: "Username", width: 120, sortable: true, filterable: true },
        { key: "email", header: "Email", width: 210, sortable: true, filterable: true },
        { key: "contactNo", header: "Contact", width: 148, sortable: true, filterable: true },
        {
            key: "role", header: "Role", width: 100, sortable: true, filterable: true,
            render: (v: UserRole) => {
                const colors: Record<UserRole, string> = {
                    Manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    Salesman: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                };
                return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${colors[v]}`}>{v}</span>;
            },
        },
        { key: "state", header: "State", width: 125, sortable: true, filterable: true },
        {
            key: "status", header: "Status", width: 88, sortable: true, filterable: true,
            render: (v: UserStatus) => (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${v === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}>{v}</span>
            ),
        },
        { key: "createdDate", header: "Joined", width: 108, sortable: true },
    ];

    const handleSave = (data: Partial<UserRow> & { password?: string; modulePerms?: Record<string, ModulePerm> }) => {
        const newUser: UserRow = {
            id: `USR${String(users.length + 1).padStart(3, "0")}`,
            name: data.name ?? "",
            username: data.username ?? "",
            email: data.email ?? "",
            contactNo: data.contactNo ?? "",
            role: data.role ?? "Salesman",
            state: data.state ?? "",
            status: data.status ?? "Active",
            assignedTo: data.assignedTo,
            createdDate: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
        toast.success(`User "${newUser.name}" (${newUser.role}) created!`);
    };

    const handleUpdate = (data: Partial<UserRow> & { password?: string; modulePerms?: Record<string, ModulePerm> }) => {
        if (!editUser) return;
        const updated: UserRow = { ...editUser, ...data };
        setUsers((prev) => prev.map((u) => u.id === editUser.id ? updated : u));
        toast.success(`"${updated.name}" updated`);
        setEditUser(null);
    };

    const handleDelete = (u: UserRow) => {
        setUsers((prev) => prev.filter((x) => x.id !== u.id));
        toast.success(`"${u.name}" deleted`);
    };

    const rowActions = [
        { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (u: UserRow) => setViewUser(u) },
        { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (u: UserRow) => setEditUser(u) },
        { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (u: UserRow) => setDeleteTarget(u), danger: true },
    ];

    return (
        <PageContainer>

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-5 gap-3">
                <PageHeader title="User Master" description={`${users.length} users — Salesmen, Managers & Admins`} />
                <Button className="shrink-0" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add User
                </Button>
            </div>

            {/* ── Add Modal ── */}
            <UserModal
                open={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleSave}
                mode="add"
                allUsers={users}
            />

            {/* ── Edit Modal ── */}
            {editUser && (
                <UserModal
                    open={!!editUser}
                    onClose={() => setEditUser(null)}
                    onSave={handleUpdate}
                    mode="edit"
                    initial={editUser}
                    allUsers={users}
                />
            )}

            {/* ── View — Mobile Bottom Sheet ── */}
            {isMobile && viewUser && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setViewUser(null)} />
                    <div className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 shrink-0">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0">
                            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                <UserCheck className="h-4 w-4" /> User Details
                            </h2>
                            <button onClick={() => setViewUser(null)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 pb-4">
                            {/* Identity */}
                            <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-2xl">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-bold text-primary">
                                        {viewUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-base">{viewUser.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${viewUser.role === "Manager" ? "bg-blue-100 text-blue-700" : viewUser.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>{viewUser.role}</span>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${viewUser.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{viewUser.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-0 divide-y divide-border/50">
                                {[
                                    { label: "ID", value: viewUser.id },
                                    { label: "Username", value: viewUser.username },
                                    { label: "Email", value: viewUser.email },
                                    { label: "Contact", value: viewUser.contactNo || "—" },
                                    { label: "State", value: viewUser.state || "—" },
                                    { label: "Joined", value: viewUser.createdDate },
                                    ...(viewUser.assignedTo ? [{ label: "Under Manager", value: viewUser.assignedTo }] : []),
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between py-3">
                                        <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                        <p className="text-sm font-semibold text-right max-w-[60%] truncate">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="shrink-0 px-5 pb-6 pt-3 border-t">
                            <Button className="w-full h-12 rounded-2xl" variant="outline" onClick={() => setViewUser(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── View — Desktop Dialog ── */}
            {!isMobile && (
                <Dialog open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4" /> User Details
                            </DialogTitle>
                        </DialogHeader>
                        {viewUser && (
                            <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">ID</p><p className="font-semibold">{viewUser.id}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Role</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${viewUser.role === "Manager" ? "bg-blue-100 text-blue-700" : viewUser.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>{viewUser.role}</span>
                                </div>
                                <div className="col-span-2"><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Full Name</p><p className="font-semibold">{viewUser.name}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Username</p><p>{viewUser.username}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${viewUser.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{viewUser.status}</span>
                                </div>
                                <div className="col-span-2"><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p><p>{viewUser.email}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Contact</p><p>{viewUser.contactNo || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">State</p><p>{viewUser.state || "—"}</p></div>
                                <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Joined</p><p>{viewUser.createdDate}</p></div>
                                {viewUser.assignedTo && (
                                    <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Under Manager</p><p>{viewUser.assignedTo}</p></div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* ── DataGrid ── */}
            <DataGrid
                data={users}
                columns={USER_COLUMNS}
                rowKey="id"
                defaultPageSize={15}
                selectable
                enableRowPinning
                inlineFilters
                striped
                density="compact"
                showStats={false}
                rowActions={rowActions}
                onMobileRowClick={(row: UserRow) => row.role === "Salesman" ? () => router.push(`/admin/team/${row.id}`) : undefined}
                canExpandRow={(row) => row.role === "Manager"}
                expandedRowRender={(row) => {
                    if (row.role !== "Manager") return null;
                    const teamMembers = users.filter((u) => u.assignedTo === row.id && u.role === "Salesman");
                    if (teamMembers.length === 0) {
                        return (
                            <div className="p-3 text-center text-muted-foreground text-xs bg-muted/10">
                                No salesmen assigned to this manager yet.
                            </div>
                        );
                    }
                    return (
                        <div className="bg-[#fafafa] dark:bg-muted/10 p-6 shadow-[inset_0_5px_8px_-4px_rgba(0,0,0,0.05)]">
                            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <Users className="h-4 w-4" />
                                {teamMembers.length} Assigned Salesman{teamMembers.length !== 1 ? "s" : ""}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {teamMembers.map((sm) => (
                                    <button
                                        key={sm.id}
                                        onClick={() => router.push(`/admin/team/${sm.id}`)}
                                        className="flex items-center gap-3 pr-4 py-2 pl-2 border bg-white dark:bg-background rounded-full hover:border-primary/40 hover:shadow-sm transition-all text-left group min-w-[240px]"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400">
                                                {sm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[13px] font-semibold group-hover:text-primary transition-colors truncate">{sm.name}</p>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sm.status === "Active"
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-gray-100 text-gray-500"
                                                    }`}>{sm.status}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate">{sm.id} • {sm.state}</p>
                                        </div>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                }}
            />
            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                itemName={deleteTarget?.name ?? ""}
                contextLabel="from User Master"
                onConfirm={() => handleDelete(deleteTarget!)}
            />
        </PageContainer>
    );
}
