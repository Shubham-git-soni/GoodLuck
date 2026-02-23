"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, MapPin, Target, TrendingUp, ChevronRight, X } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton, ListItemSkeleton } from "@/components/ui/skeleton-loaders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "sonner";

import salesmenData from "@/lib/mock-data/salesmen.json";

export default function TeamManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    state: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setSalesmen(salesmenData);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contactNo: "",
      state: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!formData.name || !formData.email || !formData.state) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newSalesman = {
      id: `SM${Math.floor(Math.random() * 1000)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.contactNo,
      region: "North",
      state: formData.state,
      managerName: "System Admin",
      joinedDate: new Date().toISOString(),
      assignedSchools: 0,
      salesTarget: 500000,
      salesAchieved: 0,
      specimenBudget: 50000,
      specimenUsed: 0,
    };

    setSalesmen((prev) => [newSalesman, ...prev]);
    toast.success("Salesman added successfully!");
    resetForm();
    setIsAddDialogOpen(false);
    setIsMobileSheetOpen(false);
  };

  // Shared form fields
  const formFields = (isMobile: boolean) => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={isMobile ? "m-name" : "name"}>Full Name *</Label>
        <Input
          id={isMobile ? "m-name" : "name"}
          name="name"
          placeholder="e.g. Rahul Verma"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className={`grid ${isMobile ? "gap-3" : "grid-cols-2 gap-4"}`}>
        <div className="grid gap-2">
          <Label htmlFor={isMobile ? "m-email" : "email"}>Email *</Label>
          <Input
            id={isMobile ? "m-email" : "email"}
            name="email"
            type="email"
            placeholder="rahul@example.com"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={isMobile ? "m-contactNo" : "contactNo"}>Contact No. *</Label>
          <Input
            id={isMobile ? "m-contactNo" : "contactNo"}
            name="contactNo"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="9876543210"
            value={formData.contactNo}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                contactNo: e.target.value.replace(/\D/g, ""),
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>School State *</Label>
        {isMobile ? (
          <NativeSelect
            value={formData.state}
            onValueChange={handleSelectChange}
            placeholder="Select State"
          >
            <NativeSelectOption value="Delhi">Delhi</NativeSelectOption>
            <NativeSelectOption value="Uttar Pradesh">Uttar Pradesh</NativeSelectOption>
            <NativeSelectOption value="Haryana">Haryana</NativeSelectOption>
            <NativeSelectOption value="Punjab">Punjab</NativeSelectOption>
            <NativeSelectOption value="Rajasthan">Rajasthan</NativeSelectOption>
            <NativeSelectOption value="Maharashtra">Maharashtra</NativeSelectOption>
            <NativeSelectOption value="Bihar">Bihar</NativeSelectOption>
          </NativeSelect>
        ) : (
          <Select onValueChange={handleSelectChange} value={formData.state}>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
              <SelectItem value="Haryana">Haryana</SelectItem>
              <SelectItem value="Punjab">Punjab</SelectItem>
              <SelectItem value="Rajasthan">Rajasthan</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Bihar">Bihar</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className={`grid ${isMobile ? "gap-3" : "grid-cols-2 gap-4"}`}>
        <div className="grid gap-2">
          <Label htmlFor={isMobile ? "m-password" : "password"}>Password *</Label>
          <Input
            id={isMobile ? "m-password" : "password"}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={isMobile ? "m-confirmPassword" : "confirmPassword"}>Confirm Password *</Label>
          <Input
            id={isMobile ? "m-confirmPassword" : "confirmPassword"}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <PageContainer>
        {/* Mobile loading */}
        <div className="md:hidden">
          <div className="mb-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse mb-1" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            <ListItemSkeleton /><ListItemSkeleton /><ListItemSkeleton />
          </div>
        </div>
        {/* Desktop loading */}
        <div className="hidden md:block">
          <PageSkeleton />
        </div>
      </PageContainer>
    );
  }

  const totalSchools = salesmen.reduce((sum, s) => sum + s.assignedSchools, 0);
  const avgAchievement = salesmen.length > 0
    ? Math.round(salesmen.reduce((sum, s) => sum + (s.salesAchieved / s.salesTarget) * 100, 0) / salesmen.length)
    : 0;
  const totalSpecimenBudget = salesmen.reduce((sum, s) => sum + s.specimenBudget, 0);

  return (
    <PageContainer>
      {/* ── Mobile Bottom Sheet ── */}
      {isMobileSheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-[100]"
          style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => { setIsMobileSheetOpen(false); resetForm(); }} />
          <div
            className="relative bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300"
            style={{ maxHeight: "85dvh", display: "flex", flexDirection: "column" }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Add New Salesman</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Create a sales representative account</p>
              </div>
              <button
                onClick={() => { setIsMobileSheetOpen(false); resetForm(); }}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {formFields(true)}
            </div>
            <div className="shrink-0 px-5 pb-6 pt-3 border-t">
              <Button className="w-full h-12 text-sm font-semibold rounded-2xl" onClick={() => handleSubmit()}>
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Salesman</DialogTitle>
            <DialogDescription>Create a new account for a field sales representative.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-2">
            {formFields(false)}
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Desktop Header ── */}
      <div className="hidden md:block">
        <PageHeader
          title="Sales Team Management"
          description="Manage your sales team and assignments"
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Salesman
            </Button>
          }
        />
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sales Team Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your sales team and assignments</p>
          </div>
          <Button size="sm" className="h-9 px-3" onClick={() => setIsMobileSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Salesman
          </Button>
        </div>
      </div>

      {/* ── KPI Cards — matching admin dashboard style ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{salesmen.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Team</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground truncate">Active members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{totalSchools}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Schools</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Assigned schools</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{avgAchievement}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Achievement</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-primary font-semibold">Sales target</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-muted">
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">₹{(totalSpecimenBudget / 100000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground mt-0.5">Specimen Budget</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Total allocation</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Team Members — Desktop Table View ── */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesmen.map((salesman) => {
                const achievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
                const specimenUsage = Math.round((salesman.specimenUsed / salesman.specimenBudget) * 100);

                return (
                  <Card key={salesman.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-sm">
                                {salesman.name.split(" ").map((n: string) => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{salesman.name}</h3>
                              <p className="text-sm text-muted-foreground">{salesman.id} • {salesman.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Region</p>
                              <p className="text-sm font-medium">{salesman.region} - {salesman.state}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Manager</p>
                              <p className="text-sm font-medium">{salesman.managerName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Schools</p>
                              <p className="text-sm font-medium">{salesman.assignedSchools}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Joined</p>
                              <p className="text-sm font-medium">{new Date(salesman.joinedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-72 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">Sales Achievement</p>
                              <Badge variant={achievement >= 75 ? "default" : achievement >= 50 ? "secondary" : "destructive"}>
                                {achievement}%
                              </Badge>
                            </div>
                            <Progress value={achievement} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{(salesman.salesAchieved / 100000).toFixed(1)}L / ₹{(salesman.salesTarget / 100000).toFixed(1)}L
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">Specimen Usage</p>
                              <span className="text-xs">{specimenUsage}%</span>
                            </div>
                            <Progress value={specimenUsage} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{(salesman.specimenUsed / 100000).toFixed(1)}L / ₹{(salesman.specimenBudget / 100000).toFixed(1)}L
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Link href={`/admin/team/${salesman.id}`}>
                          <Button variant="outline" size="sm">View Dashboard</Button>
                        </Link>
                        <Button variant="outline" size="sm">Reassign Schools</Button>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Team Members — Mobile Card View ── */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold tracking-tight">Team Members</h2>
          <p className="text-xs text-muted-foreground">{salesmen.length} members</p>
        </div>
        <div className="space-y-3">
          {salesmen.map((salesman) => {
            const achievement = Math.round((salesman.salesAchieved / salesman.salesTarget) * 100);
            const specimenUsage = Math.round((salesman.specimenUsed / salesman.specimenBudget) * 100);

            return (
              <Link key={salesman.id} href={`/admin/team/${salesman.id}`}>
                <Card className="hover:shadow-md transition-all active:scale-[0.99] cursor-pointer mb-3">
                  <CardContent className="p-4">
                    {/* Name + Avatar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm text-primary">
                          {salesman.name.split(" ").map((n: string) => n[0]).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{salesman.name}</h3>
                        <p className="text-xs text-muted-foreground">{salesman.region} - {salesman.state}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Schools</p>
                        <p className="text-sm font-bold">{salesman.assignedSchools}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Target</p>
                        <p className="text-sm font-bold">₹{(salesman.salesTarget / 100000).toFixed(0)}L</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Specimen</p>
                        <p className="text-sm font-bold">₹{(salesman.specimenBudget / 100000).toFixed(0)}L</p>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] text-muted-foreground">Sales Achievement</p>
                          <Badge
                            variant={achievement >= 75 ? "default" : achievement >= 50 ? "secondary" : "destructive"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {achievement}%
                          </Badge>
                        </div>
                        <Progress value={achievement} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] text-muted-foreground">Specimen Used</p>
                          <span className="text-[11px] font-medium">{specimenUsage}%</span>
                        </div>
                        <Progress value={specimenUsage} className="h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}