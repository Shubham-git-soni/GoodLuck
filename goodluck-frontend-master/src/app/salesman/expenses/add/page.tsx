"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertTriangle, Save, Send, ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AddExpensePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    expenseType: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    receipt: null as File | null,
  });

  const [policyWarning, setPolicyWarning] = useState("");

  // Load expense policies
  const expensePolicies = require("@/lib/mock-data/expense-policies.json");

  const handleAmountChange = (amount: string) => {
    setFormData({ ...formData, amount });

    // Check policy violation
    if (formData.expenseType && amount) {
      const policy = expensePolicies.find(
        (p: any) => p.expenseType === formData.expenseType
      );
      if (policy && parseFloat(amount) > policy.dailyLimit) {
        setPolicyWarning(
          `⚠️ Amount exceeds daily limit of ₹${policy.dailyLimit} – Policy Violation`
        );
      } else {
        setPolicyWarning("");
      }
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, expenseType: type });

    // Recheck policy if amount exists
    if (formData.amount) {
      const policy = expensePolicies.find((p: any) => p.expenseType === type);
      if (policy && parseFloat(formData.amount) > policy.dailyLimit) {
        setPolicyWarning(
          `⚠️ Amount exceeds daily limit of ₹${policy.dailyLimit} – Policy Violation`
        );
      } else {
        setPolicyWarning("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receipt: e.target.files[0] });
    }
  };

  const handleSaveDraft = () => {
    if (!formData.expenseType || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in expense type and amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Draft Saved",
      description: "Expense saved as draft successfully",
    });

    router.push("/salesman/expenses");
  };

  const handleSubmit = () => {
    if (!formData.expenseType || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const policy = expensePolicies.find(
      (p: any) => p.expenseType === formData.expenseType
    );

    if (policy?.receiptRequired && !formData.receipt) {
      toast({
        title: "Receipt Required",
        description: `Receipt is mandatory for ${formData.expenseType} expenses`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Expense Added",
      description: "Expense saved successfully. You can submit it in a report.",
    });

    router.push("/salesman/expenses");
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/salesman/expenses">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Expenses
          </Button>
        </Link>
        <PageHeader
          title="Add Expense"
          description="Record a new expense with receipt upload"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expense Type */}
              <div className="space-y-2">
                <Label htmlFor="expenseType">
                  Expense Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.expenseType}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    {expensePolicies.map((policy: any) => (
                      <SelectItem key={policy.id} value={policy.expenseType}>
                        {policy.expenseType} (Limit: ₹{policy.dailyLimit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expense Date */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Expense Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {policyWarning && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{policyWarning}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the expense"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Receipt</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="receipt"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      {formData.receipt ? (
                        <span className="text-green-600 font-medium">
                          ✓ {formData.receipt.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-primary font-medium">
                            Click to upload
                          </span>{" "}
                          <span className="text-muted-foreground">
                            or drag and drop
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF (max. 5MB)
                    </p>
                  </label>
                </div>
                {formData.expenseType && (
                  <p className="text-xs text-muted-foreground">
                    {expensePolicies.find(
                      (p: any) => p.expenseType === formData.expenseType
                    )?.receiptRequired
                      ? "⚠️ Receipt required for this expense type"
                      : "Receipt is optional for this expense type"}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Information Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expensePolicies.map((policy: any) => (
                <div
                  key={policy.id}
                  className={`p-3 rounded-lg border ${
                    formData.expenseType === policy.expenseType
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {policy.expenseType}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      ₹{policy.dailyLimit}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {policy.description}
                  </p>
                  {policy.receiptRequired && (
                    <Badge variant="outline" className="text-[10px]">
                      Receipt Required
                    </Badge>
                  )}
                </div>
              ))}

              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Note:</strong> Expenses exceeding limits are allowed
                  but will be flagged for admin review.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
