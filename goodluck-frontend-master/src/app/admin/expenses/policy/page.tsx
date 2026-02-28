"use client";

import { useState, useEffect } from "react";
import {
  Save, Plus, Edit2, Trash2, AlertCircle, CheckCircle2,
  Wallet, FileText, IndianRupee, TrendingUp, Receipt, Percent
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataGrid, GridColumn, RowAction } from "@/components/ui/data-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Predefined expense types
const EXPENSE_TYPES = [
  "Food",
  "Travel",
  "Hotel",
  "Fuel",
  "Conveyance",
  "Internet",
  "Mobile",
  "Stationery",
  "Courier",
  "Gift",
  "Entertainment",
  "Medical",
  "Other",
];

export default function AdminExpensePolicyPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    expenseType: "",
    dailyLimit: "",
    description: "",
    receiptRequired: false,
  });
  const [showCustomType, setShowCustomType] = useState(false);

  useEffect(() => {
    const policiesData = require("@/lib/mock-data/expense-policies.json");
    setPolicies(policiesData);
  }, []);

  const resetForm = () => {
    setFormData({
      expenseType: "",
      dailyLimit: "",
      description: "",
      receiptRequired: false,
    });
    setShowCustomType(false);
    setEditingPolicy(null);
    setIsAddingNew(false);
  };

  const handleEdit = (policy: any) => {
    const isCustomType = !EXPENSE_TYPES.includes(policy.expenseType);
    setFormData({
      expenseType: policy.expenseType,
      dailyLimit: policy.dailyLimit.toString(),
      description: policy.description,
      receiptRequired: policy.receiptRequired,
    });
    setShowCustomType(isCustomType);
    setEditingPolicy(policy);
    setIsAddingNew(false);
  };

  const handleDelete = (policyId: string, expenseType: string) => {
    toast.error(`"${expenseType}" policy has been removed`);
    // Delete logic here
  };

  const handleSave = () => {
    if (!formData.expenseType || !formData.dailyLimit) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingPolicy) {
      toast.success(`"${formData.expenseType}" policy has been updated`);
    } else {
      toast.success(`"${formData.expenseType}" policy has been created`);
    }

    resetForm();
  };

  const handleAddNew = () => {
    setEditingPolicy(null);
    setFormData({
      expenseType: "",
      dailyLimit: "",
      description: "",
      receiptRequired: false,
    });
    setIsAddingNew(true);
  };

  // Calculate stats
  const totalPolicies = policies.length;
  const receiptRequiredCount = policies.filter((p) => p.receiptRequired).length;
  const totalDailyLimit = policies.reduce((sum, p) => sum + p.dailyLimit, 0);
  const avgDailyLimit = totalPolicies > 0 ? Math.round(totalDailyLimit / totalPolicies) : 0;
  const maxLimit = totalPolicies > 0 ? Math.max(...policies.map(p => p.dailyLimit)) : 0;

  return (
    <PageContainer>
      <div className="mb-6">
        <PageHeader
          title="Expense Policy Setup"
          description="Configure expense policies, daily limits, and receipt requirements"
        />
      </div>

      {/* KPI Cards — dashboard style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Total Policies */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{totalPolicies}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Policies</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Active configurations</p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Required */}
        <Card className="border-0 shadow-sm gradient-card-neutral">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-green-100">
                <Receipt className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">{receiptRequiredCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Receipt Required</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <Progress
                value={totalPolicies > 0 ? Math.round((receiptRequiredCount / totalPolicies) * 100) : 0}
                className="h-1.5"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {totalPolicies > 0 ? Math.round((receiptRequiredCount / totalPolicies) * 100) : 0}% of policies
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Daily Limit */}
        <Card className="border-0 shadow-sm gradient-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <IndianRupee className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">₹{avgDailyLimit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg. Daily Limit</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Per expense type</p>
            </div>
          </CardContent>
        </Card>

        {/* Highest Limit */}
        <Card className="border-0 shadow-sm gradient-card-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold tracking-tight">₹{maxLimit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Highest Limit</p>
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Maximum allowed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Policies</CardTitle>
              <CardDescription className="mt-1">
                Manage all expense types, limits, and requirements
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={policies}
            columns={[
              {
                key: "expenseType",
                header: "Expense Type",
                sortable: true,
                filterable: true,
                width: 200,
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold">{value}</span>
                  </div>
                ),
              },
              {
                key: "dailyLimit",
                header: "Daily Limit",
                type: "number",
                sortable: true,
                width: 150,
                render: (value) => (
                  <Badge variant="secondary" className="text-sm font-semibold">
                    ₹{value.toLocaleString()}
                  </Badge>
                ),
              },
              {
                key: "receiptRequired",
                header: "Receipt Required",
                type: "boolean",
                sortable: true,
                width: 160,
                render: (value) =>
                  value ? (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  ),
              },
              {
                key: "description",
                header: "Description",
                sortable: false,
                render: (value) => (
                  <span className="text-sm text-muted-foreground line-clamp-2">
                    {value}
                  </span>
                ),
              },
            ]}
            rowActions={[
              {
                label: "Edit Policy",
                icon: <Edit2 className="h-3.5 w-3.5" />,
                onClick: (policy) => handleEdit(policy),
              },
              {
                label: "Delete Policy",
                icon: <Trash2 className="h-3.5 w-3.5" />,
                onClick: (policy) => handleDelete(policy.id, policy.expenseType),
                danger: true,
              },
            ]}
            density="comfortable"
            striped={true}
            emptyMessage="No expense policies found. Create your first policy to get started."
            emptyIcon={<Wallet className="h-12 w-12" />}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Policy Guidelines */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Policy Guidelines
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Daily limits are per expense type, not total per day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Expenses exceeding limits can still be submitted but will be flagged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Receipt requirements are enforced during expense creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Changes apply immediately to all new expenses</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Total Daily Budget
                  </p>
                  <p className="text-2xl font-bold text-primary mb-1">
                    ₹{totalDailyLimit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Combined limit across all expense types
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={editingPolicy !== null || isAddingNew} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              {editingPolicy ? "Edit Expense Policy" : "Add New Expense Policy"}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy
                ? "Update the expense policy details below"
                : "Configure a new expense type with daily limits and receipt requirements"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expenseType" className="text-sm font-medium">
                Expense Type <span className="text-red-500">*</span>
              </Label>
              {editingPolicy ? (
                <>
                  <Input
                    id="expenseType"
                    value={formData.expenseType}
                    disabled={true}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Expense type cannot be changed after creation
                  </p>
                </>
              ) : showCustomType ? (
                <div className="space-y-2">
                  <Input
                    id="expenseType"
                    placeholder="Enter custom expense type"
                    value={formData.expenseType}
                    onChange={(e) =>
                      setFormData({ ...formData, expenseType: e.target.value })
                    }
                    className="h-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCustomType(false);
                      setFormData({ ...formData, expenseType: "" });
                    }}
                    className="text-xs h-7"
                  >
                    ← Back to predefined types
                  </Button>
                </div>
              ) : (
                <Select
                  value={formData.expenseType}
                  onValueChange={(value) => {
                    if (value === "Other") {
                      setShowCustomType(true);
                      setFormData({ ...formData, expenseType: "" });
                    } else {
                      setFormData({ ...formData, expenseType: value });
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyLimit" className="text-sm font-medium">
                Daily Limit (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dailyLimit"
                  type="number"
                  placeholder="0"
                  value={formData.dailyLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyLimit: e.target.value })
                  }
                  min="0"
                  className="pl-9 h-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount allowed per day for this expense type
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of this expense type and its purpose..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/30">
              <Checkbox
                id="receiptRequired"
                checked={formData.receiptRequired}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    receiptRequired: checked as boolean,
                  })
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="receiptRequired"
                  className="text-sm font-medium cursor-pointer"
                >
                  Receipt Required
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Employees must upload receipt proof for this expense type
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingPolicy ? "Update Policy" : "Create Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
