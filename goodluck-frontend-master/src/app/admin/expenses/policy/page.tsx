"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminExpensePolicyPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<any[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formData, setFormData] = useState({
    expenseType: "",
    dailyLimit: "",
    description: "",
    receiptRequired: false,
  });

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
    setEditingPolicy(null);
    setIsAddingNew(false);
  };

  const handleEdit = (policy: any) => {
    setFormData({
      expenseType: policy.expenseType,
      dailyLimit: policy.dailyLimit.toString(),
      description: policy.description,
      receiptRequired: policy.receiptRequired,
    });
    setEditingPolicy(policy);
    setIsAddingNew(false);
  };

  const handleDelete = (policyId: string, expenseType: string) => {
    toast({
      title: "Policy Deleted",
      description: `"${expenseType}" policy has been removed`,
      variant: "destructive",
    });
    // Delete logic here
  };

  const handleSave = () => {
    if (!formData.expenseType || !formData.dailyLimit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingPolicy) {
      toast({
        title: "Policy Updated",
        description: `"${formData.expenseType}" policy has been updated`,
      });
    } else {
      toast({
        title: "Policy Created",
        description: `"${formData.expenseType}" policy has been created`,
      });
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

  return (
    <PageContainer>
      <div className="mb-6">
        <PageHeader
          title="Expense Policy Setup"
          description="Configure expense policies, daily limits, and receipt requirements"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Policies</CardTitle>
                <Button onClick={handleAddNew} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Type</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Receipt Required</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-semibold">
                        {policy.expenseType}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-sm">
                          ₹{policy.dailyLimit.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.receiptRequired ? (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {policy.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(policy)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(policy.id, policy.expenseType)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Policy Guidelines
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Daily limits are per expense type, not total per day</li>
                      <li>• Expenses exceeding limits can still be submitted but will be flagged</li>
                      <li>• Receipt requirements are enforced during expense creation</li>
                      <li>• Changes apply immediately to all new expenses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit/Add Form */}
        <div>
          {(editingPolicy || isAddingNew) ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingPolicy ? "Edit Policy" : "Add New Policy"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expenseType">
                    Expense Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expenseType"
                    placeholder="e.g., Food, Travel"
                    value={formData.expenseType}
                    onChange={(e) =>
                      setFormData({ ...formData, expenseType: e.target.value })
                    }
                    disabled={!!editingPolicy}
                  />
                  {editingPolicy && (
                    <p className="text-xs text-muted-foreground">
                      Expense type cannot be changed
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">
                    Daily Limit (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    placeholder="0"
                    value={formData.dailyLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyLimit: e.target.value })
                    }
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this expense type"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receiptRequired"
                    checked={formData.receiptRequired}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        receiptRequired: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="receiptRequired"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Receipt required for this expense type
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleAddNew} className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Policy
                </Button>

                <div className="pt-4 space-y-2">
                  <p className="text-sm font-medium">Policy Summary</p>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Total Policies
                      </span>
                      <span className="text-lg font-bold">{policies.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Receipt Required
                      </span>
                      <span className="text-sm font-semibold">
                        {policies.filter((p) => p.receiptRequired).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Average Daily Limit
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹
                    {Math.round(
                      policies.reduce((sum, p) => sum + p.dailyLimit, 0) /
                        policies.length
                    ).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
