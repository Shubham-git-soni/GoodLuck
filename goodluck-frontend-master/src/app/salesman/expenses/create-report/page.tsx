"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, FileText, AlertTriangle, CheckSquare } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CreateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [draftExpenses, setDraftExpenses] = useState<any[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  useEffect(() => {
    const expensesData = require("@/lib/mock-data/expenses.json");
    const drafts = expensesData.filter(
      (e: any) => e.salesmanId === "SM001" && e.status === "draft"
    );
    setDraftExpenses(drafts);
  }, []);

  const handleSelectExpense = (expenseId: string) => {
    setSelectedExpenses((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === draftExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(draftExpenses.map((e) => e.id));
    }
  };

  const selectedExpensesList = draftExpenses.filter((e) =>
    selectedExpenses.includes(e.id)
  );
  const totalAmount = selectedExpensesList.reduce((sum, e) => sum + e.amount, 0);
  const violationCount = selectedExpensesList.filter(
    (e) => e.policyViolation
  ).length;

  const handleSubmit = () => {
    if (selectedExpenses.length === 0) {
      toast({
        title: "No Expenses Selected",
        description: "Please select at least one expense to create a report",
        variant: "destructive",
      });
      return;
    }

    if (!reportTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a report title",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Created",
      description: `Expense report "${reportTitle}" submitted successfully with ${selectedExpenses.length} expenses`,
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
          title="Create Expense Report"
          description="Group multiple expenses into a report for submission"
        />
      </div>

      <div className="space-y-4">
        {/* Report Details */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportTitle">
                Report Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reportTitle"
                placeholder="e.g., Mumbai Trip - Week 50"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportNotes">Report Notes (Optional)</Label>
              <Textarea
                id="reportNotes"
                placeholder="Add any additional context or notes for this report"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Select Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Expenses</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectedExpenses.length === draftExpenses.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {draftExpenses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No draft expenses available to create a report</p>
                <Link href="/salesman/expenses/add">
                  <Button className="mt-4" size="sm">Add Expense First</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {draftExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    onClick={() => handleSelectExpense(expense.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedExpenses.includes(expense.id)
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                        : "bg-background hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedExpenses.includes(expense.id)}
                      onCheckedChange={() => handleSelectExpense(expense.id)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{expense.expenseType}</Badge>
                        <span className="font-bold text-base">₹{expense.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{expense.description || "—"}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {expense.policyViolation ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white text-xs">OK</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5 p-3 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground">Selected Items</span>
                <span className="text-2xl font-bold">{selectedExpenses.length}</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Total Amount</span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {violationCount > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    {violationCount} expense{violationCount > 1 ? "s" : ""} exceed policy limits. Admin will review before approval.
                  </p>
                </div>
              </div>
            )}

            {selectedExpensesList.length > 0 && (
              <div className="flex justify-between text-sm px-1">
                <span className="text-muted-foreground">Date range:</span>
                <span className="font-medium">
                  {new Date(Math.min(...selectedExpensesList.map((e) => new Date(e.date).getTime()))).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" – "}
                  {new Date(Math.max(...selectedExpensesList.map((e) => new Date(e.date).getTime()))).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={selectedExpenses.length === 0 || !reportTitle.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
            <p className="text-xs text-muted-foreground text-center">Once submitted, you cannot edit the report</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
