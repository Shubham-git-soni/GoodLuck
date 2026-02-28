"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Eye, Pencil, Trash2, Users, UserCheck, Search, Check } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Manager, Salesman } from "@/types";
import managersData from "@/lib/mock-data/managers.json";
import salesmenData from "@/lib/mock-data/salesmen.json";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";

// ─── Column definitions ───────────────────────────────────────────────────────
const MANAGER_COLUMNS: GridColumn<Manager>[] = [
  { key: "id", header: "ID", width: 100, sortable: true, pinned: "left" },
  { key: "name", header: "Name", width: 200, sortable: true, filterable: true },
  { key: "email", header: "Email", width: 220, sortable: true, filterable: true },
  { key: "contactNo", header: "Contact", width: 160, sortable: true, filterable: true },
  { key: "state", header: "State", width: 140, sortable: true, filterable: true },
  {
    key: "status", header: "Status", width: 110, sortable: true, filterable: true,
    render: (v) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v === "Active"
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}>{v}</span>
    ),
  },
  {
    key: "assignedSalesmen", header: "Salesmen", width: 110, sortable: false,
    render: (v: string[]) => (
      <span className="flex items-center gap-1.5 text-sm">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-semibold">{v?.length ?? 0}</span>
      </span>
    ),
  },
  { key: "createdDate", header: "Created", width: 120, sortable: true, filterable: true },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

// ─── Add Manager Modal ────────────────────────────────────────────────────────
function AddManagerModal({
  open, onClose, onAdd, allSalesmen,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; email: string; contactNo: string; state: string; status: string; assignedSalesmen: string[] }) => void;
  allSalesmen: Salesman[];
}) {
  const [activeTab, setActiveTab] = useState<"basic" | "allocation">("basic");
  const [formData, setFormData] = useState({
    name: "", email: "", contactNo: "", state: "", status: "Active",
  });
  const [selectedSalesmen, setSelectedSalesmen] = useState<string[]>([]);
  const [smSearch, setSmSearch] = useState("");

  const filteredSalesmen = allSalesmen.filter(
    (sm) =>
      sm.name.toLowerCase().includes(smSearch.toLowerCase()) ||
      sm.id.toLowerCase().includes(smSearch.toLowerCase()) ||
      sm.state.toLowerCase().includes(smSearch.toLowerCase()) ||
      sm.region.toLowerCase().includes(smSearch.toLowerCase())
  );

  const toggleSalesman = (id: string) => {
    setSelectedSalesmen((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.contactNo || !formData.state) {
      setActiveTab("basic");
      toast.error("Please fill all required fields in Basic Info"); return;
    }
    onAdd({ ...formData, assignedSalesmen: selectedSalesmen });
    // reset
    setFormData({ name: "", email: "", contactNo: "", state: "", status: "Active" });
    setSelectedSalesmen([]);
    setSmSearch("");
    setActiveTab("basic");
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", contactNo: "", state: "", status: "Active" });
    setSelectedSalesmen([]);
    setSmSearch("");
    setActiveTab("basic");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Manager</DialogTitle>
          <DialogDescription>Fill basic info and optionally assign salespeople</DialogDescription>
        </DialogHeader>

        {/* ── Tab Switcher ── */}
        <div className="flex border-b mt-1">
          <button
            onClick={() => setActiveTab("basic")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "basic"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab("allocation")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "allocation"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Allocation
            {selectedSalesmen.length > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {selectedSalesmen.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4 py-4 px-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., Rajesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact No <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>State <span className="text-destructive">*</span></Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setActiveTab("allocation")}>
                  Next: Allocation →
                </Button>
              </div>
            </div>
          )}

          {/* Allocation Tab */}
          {activeTab === "allocation" && (
            <div className="py-4 px-1 flex flex-col gap-3 h-full">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 h-9"
                    placeholder="Search by name, ID, state, region..."
                    value={smSearch}
                    onChange={(e) => setSmSearch(e.target.value)}
                  />
                </div>
                {selectedSalesmen.length > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    {selectedSalesmen.length} selected
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Select salespersons to assign to this manager. Click a row to toggle selection.
              </p>

              <div className="overflow-y-auto rounded-lg border divide-y max-h-[340px]">
                {filteredSalesmen.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No salesperson found</div>
                ) : (
                  filteredSalesmen.map((sm) => {
                    const isSelected = selectedSalesmen.includes(sm.id);
                    return (
                      <button
                        key={sm.id}
                        onClick={() => toggleSalesman(sm.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                          ? "bg-primary/5 hover:bg-primary/8"
                          : "hover:bg-muted/60"
                          }`}
                      >
                        {/* Checkbox */}
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                          }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>

                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {sm.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{sm.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{sm.email}</p>
                        </div>

                        {/* Right badges */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-semibold text-muted-foreground">{sm.id}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{sm.state}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">{sm.region}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sm.status === "Active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-gray-100 text-gray-500"
                              }`}>{sm.status}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Manager
            {selectedSalesmen.length > 0 && ` (${selectedSalesmen.length} salesmen)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManagerListPage() {
  const [managers, setManagers] = useState<Manager[]>(managersData as Manager[]);
  const [salesmen] = useState<Salesman[]>(salesmenData as Salesman[]);
  const [viewMgr, setViewMgr] = useState<Manager | null>(null);
  const [editMgr, setEditMgr] = useState<Manager | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDelete = (mgr: Manager) => {
    setManagers((prev) => prev.filter((m) => m.id !== mgr.id));
    toast.success(`"${mgr.name}" deleted`);
  };

  const handleAdd = (data: { name: string; email: string; contactNo: string; state: string; status: string; assignedSalesmen: string[] }) => {
    const newMgr: Manager = {
      id: `MGR${String(managers.length + 1).padStart(3, "0")}`,
      name: data.name, email: data.email,
      contactNo: data.contactNo, state: data.state,
      status: data.status as "Active" | "Inactive",
      assignedSalesmen: data.assignedSalesmen,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setManagers((prev) => [...prev, newMgr]);
    toast.success(`Manager "${data.name}" added${data.assignedSalesmen.length > 0 ? ` with ${data.assignedSalesmen.length} salesmen` : ""}!`);
  };

  const handleSaveEdit = () => {
    if (!editMgr) return;
    setManagers((prev) => prev.map((m) => m.id === editMgr.id ? editMgr : m));
    toast.success(`"${editMgr.name}" updated`);
    setEditMgr(null);
  };

  // ── Row actions ──────────────────────────────────────────────────────────────
  const rowActions = [
    { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (m: Manager) => setViewMgr(m) },
    { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (m: Manager) => setEditMgr(m) },
    { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: handleDelete, danger: true },
  ];

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <PageContainer>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <PageHeader title="Managers" description={`${managers.length} managers in system`} />
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Manager
          </Button>
        </div>
      </div>

      {/* ── Add Manager Modal ── */}
      <AddManagerModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAdd}
        allSalesmen={salesmen}
      />

      {/* ── View Dialog ── */}
      <Dialog open={!!viewMgr} onOpenChange={(o) => !o && setViewMgr(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Manager Details
            </DialogTitle>
          </DialogHeader>
          {viewMgr && (
            <div className="grid grid-cols-2 gap-4 py-2 text-sm">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">ID</p>
                <p className="font-semibold">{viewMgr.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${viewMgr.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewMgr.status}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Name</p>
                <p className="font-semibold">{viewMgr.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                <p>{viewMgr.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Contact</p>
                <p>{viewMgr.contactNo}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">State</p>
                <p>{viewMgr.state}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Salesmen</p>
                <p className="font-semibold">{viewMgr.assignedSalesmen.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Created</p>
                <p>{viewMgr.createdDate}</p>
              </div>
              {viewMgr.assignedSalesmen.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Assigned Salesmen</p>
                  <div className="flex flex-wrap gap-1">
                    {viewMgr.assignedSalesmen.map((sm) => (
                      <span key={sm} className="text-xs bg-muted px-2 py-0.5 rounded">{sm}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Link href={viewMgr ? `/admin/managers/assign/${viewMgr.id}` : "#"}>
              <Button variant="outline" size="sm"><Users className="h-3.5 w-3.5 mr-1.5" />Assign Salesmen</Button>
            </Link>
            <Button variant="outline" onClick={() => setViewMgr(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editMgr} onOpenChange={(o) => !o && setEditMgr(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
            <DialogDescription>Update manager details</DialogDescription>
          </DialogHeader>
          {editMgr && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={editMgr.name} onChange={(e) => setEditMgr((p) => p ? { ...p, name: e.target.value } : p)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={editMgr.email} onChange={(e) => setEditMgr((p) => p ? { ...p, email: e.target.value } : p)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact No *</Label>
                  <Input value={editMgr.contactNo} onChange={(e) => setEditMgr((p) => p ? { ...p, contactNo: e.target.value } : p)} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editMgr.status} onValueChange={(v) => setEditMgr((p) => p ? { ...p, status: v as "Active" | "Inactive" } : p)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={editMgr.state} onValueChange={(v) => setEditMgr((p) => p ? { ...p, state: v } : p)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditMgr(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DataGrid ── */}
      <DataGrid
        data={managers}
        columns={MANAGER_COLUMNS}
        rowKey="id"
        defaultPageSize={15}
        selectable
        enableRowPinning
        enableColumnPinning
        inlineFilters
        striped
        rowActions={rowActions}
        quickFilters={[
          { key: "status", label: "Active Only", value: "Active", icon: <UserCheck className="h-3 w-3" /> },
          { key: "status", label: "Inactive Only", value: "Inactive", icon: <Users className="h-3 w-3" /> },
        ]}
      />
    </PageContainer>
  );
}
