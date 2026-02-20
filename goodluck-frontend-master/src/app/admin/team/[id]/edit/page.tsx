"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

import salesmenData from "@/lib/mock-data/salesmen.json";
import managersData from "@/lib/mock-data/managers.json";

interface SalesmanFormData {
  name: string;
  email: string;
  phone: string;
  region: string;
  state: string;
  cities: string[];
  assignedSchools: number;
  specimenBudget: number;
  salesTarget: number;
  managerId: string;
  managerName: string;
  status: string;
}

const regions = [
  { value: "North", label: "North" },
  { value: "South", label: "South" },
  { value: "East", label: "East" },
  { value: "West", label: "West" },
  { value: "Central", label: "Central" },
];

const states = [
  { value: "Delhi", label: "Delhi" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Telangana", label: "Telangana" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
];

const statuses = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "On Leave", label: "On Leave" },
];

const cityOptions = {
  "Delhi": ["Delhi", "Ghaziabad", "Noida", "Gurgaon"],
  "Maharashtra": ["Mumbai", "Pune", "Nashik", "Nagpur"],
  "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Rajkot"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
};

export default function EditSalesmanProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [salesman, setSalesman] = useState<any>(null);
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [formData, setFormData] = useState<SalesmanFormData>({
    name: "",
    email: "",
    phone: "",
    region: "",
    state: "",
    cities: [],
    assignedSchools: 0,
    specimenBudget: 0,
    salesTarget: 0,
    managerId: "",
    managerName: "",
    status: "Active",
  });
  const [cityInput, setCityInput] = useState("");

  useEffect(() => {
    setTimeout(() => {
      const foundSalesman = salesmenData.find((s) => s.id === params.id);
      if (foundSalesman) {
        setSalesman(foundSalesman);
        setFormData({
          name: foundSalesman.name || "",
          email: foundSalesman.email || "",
          phone: foundSalesman.phone || "",
          region: foundSalesman.region || "",
          state: foundSalesman.state || "",
          cities: foundSalesman.cities || [],
          assignedSchools: foundSalesman.assignedSchools || 0,
          specimenBudget: foundSalesman.specimenBudget || 0,
          salesTarget: foundSalesman.salesTarget || 0,
          managerId: foundSalesman.managerId || "",
          managerName: foundSalesman.managerName || "",
          status: foundSalesman.status || "Active",
        });
      }
      setAvailableManagers(managersData);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const handleInputChange = (field: keyof SalesmanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManagerChange = (managerId: string) => {
    const manager = availableManagers.find(m => m.id === managerId);
    setFormData(prev => ({
      ...prev,
      managerId,
      managerName: manager ? manager.name : "",
    }));
  };

  const addCity = () => {
    if (cityInput.trim() && !formData.cities.includes(cityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cities: [...prev.cities, cityInput.trim()],
      }));
      setCityInput("");
    }
  };

  const removeCity = (cityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.filter(city => city !== cityToRemove),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Here you would normally make an API call to save the data
      console.log("Saving salesman data:", formData);

      toast.success("Salesman profile updated successfully!");
      router.push(`/admin/team/${params.id}`);
    } catch (error) {
      toast.error("Failed to update salesman profile. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/team/${params.id}`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Salesman Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested salesman does not exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/team/${params.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Salesman Profile</h1>
            <p className="text-muted-foreground">
              Update information for {formData.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Current Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Sales Achievement</p>
              <p className="text-2xl font-bold">
                ₹{((formData.salesTarget || 0) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Schools</p>
              <p className="text-2xl font-bold">{formData.assignedSchools}</p>
              <p className="text-xs text-muted-foreground">Current assignment</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specimen Budget</p>
              <p className="text-2xl font-bold">
                ₹{((formData.specimenBudget || 0) / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-muted-foreground">Annual budget</p>
            </div>
          </CardContent>
        </Card>

        {/* Territory Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Territory Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Region *</label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State *</label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cities */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cities Covered</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter city name"
                    onKeyPress={(e) => e.key === "Enter" && addCity()}
                  />
                  <Button type="button" onClick={addCity} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cities.map((city, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {city}
                      <button
                        onClick={() => removeCity(city)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manager Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Reporting Manager</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned Manager *</label>
              <Select value={formData.managerId} onValueChange={handleManagerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {availableManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.managerName && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Current Manager</p>
                <p className="text-sm text-muted-foreground">{formData.managerName}</p>
                <p className="text-xs text-muted-foreground">ID: {formData.managerId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Targets and Budgets */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Targets & Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned Schools</label>
                <Input
                  type="number"
                  value={formData.assignedSchools}
                  onChange={(e) => handleInputChange("assignedSchools", parseInt(e.target.value) || 0)}
                  placeholder="Number of assigned schools"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sales Target (₹)</label>
                <Input
                  type="number"
                  value={formData.salesTarget}
                  onChange={(e) => handleInputChange("salesTarget", parseInt(e.target.value) || 0)}
                  placeholder="Annual sales target"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Specimen Budget (₹)</label>
                <Input
                  type="number"
                  value={formData.specimenBudget}
                  onChange={(e) => handleInputChange("specimenBudget", parseInt(e.target.value) || 0)}
                  placeholder="Annual specimen budget"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}