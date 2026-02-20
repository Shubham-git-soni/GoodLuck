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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {selectedExpenses.length === draftExpenses.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {draftExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No draft expenses available to create a report
                  </p>
                  <Link href="/salesman/expenses/add">
                    <Button className="mt-4" size="sm">
                      Add Expense First
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftExpenses.map((expense) => (
                      <TableRow
                        key={expense.id}
                        className={
                          selectedExpenses.includes(expense.id)
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : ""
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedExpenses.includes(expense.id)}
                            onCheckedChange={() =>
                              handleSelectExpense(expense.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.expenseType}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description || "-"}
                        </TableCell>
                        <TableCell>
                          {expense.policyViolation ? (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Warning
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500 text-white text-xs">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Summary Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Selected Items
                  </span>
                  <span className="text-lg font-bold">
                    {selectedExpenses.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                {violationCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      Policy Warnings
                    </span>
                    <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                      {violationCount}
                    </span>
                  </div>
                )}
              </div>

              {violationCount > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      This report contains expenses that exceed policy limits.
                      Admin will review before approval.
                    </p>
                  </div>
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

              <p className="text-xs text-muted-foreground text-center">
                Once submitted, you cannot edit the report
              </p>
            </CardContent>
          </Card>

          {/* Date Range Info */}
          {selectedExpensesList.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-medium">
                      {new Date(
                        Math.min(
                          ...selectedExpensesList.map((e) =>
                            new Date(e.date).getTime()
                          )
                        )
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span className="font-medium">
                      {new Date(
                        Math.max(
                          ...selectedExpensesList.map((e) =>
                            new Date(e.date).getTime()
                          )
                        )
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
