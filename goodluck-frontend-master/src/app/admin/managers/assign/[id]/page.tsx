"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, UserCheck, UserX } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Manager, Salesman } from "@/types";
import managersData from "@/lib/mock-data/managers.json";
import salesmenData from "@/lib/mock-data/salesmen.json";

export default function AssignSalesmanPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = params.id as string;

  const [manager, setManager] = useState<Manager | null>(null);
  const [salesmen] = useState<Salesman[]>(salesmenData as Salesman[]);
  const [selectedSalesmen, setSelectedSalesmen] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundManager = (managersData as Manager[]).find((m) => m.id === managerId);
    if (foundManager) {
      setManager(foundManager);
      setSelectedSalesmen(foundManager.assignedSalesmen);
    }
  }, [managerId]);

  const handleToggleSalesman = (salesmanId: string) => {
    setSelectedSalesmen((prev) =>
      prev.includes(salesmanId)
        ? prev.filter((id) => id !== salesmanId)
        : [...prev, salesmanId]
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Salesmen assigned successfully!");
      setIsSubmitting(false);
      router.push("/admin/managers");
    }, 1500);
  };

  if (!manager) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Manager not found</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <PageHeader
          title={`Assign Salesmen to ${manager.name}`}
          description={`Manager State: ${manager.state}`}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manager Details</CardTitle>
            <Badge>{selectedSalesmen.length} salesmen selected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{manager.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{manager.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">State</p>
              <p className="font-medium">{manager.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Salesmen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesmen.map((salesman) => {
              const isSelected = selectedSalesmen.includes(salesman.id);
              const isAlreadyAssigned = manager.assignedSalesmen.includes(salesman.id);

              return (
                <Card
                  key={salesman.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleToggleSalesman(salesman.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={salesman.id}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSalesman(salesman.id)}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <label
                            htmlFor={salesman.id}
                            className="font-medium cursor-pointer"
                          >
                            {salesman.name}
                          </label>
                          {isAlreadyAssigned && (
                            <Badge variant="outline" className="text-xs">
                              Currently Assigned
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span>ID: {salesman.id}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Region: {salesman.region}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>State: {salesman.state}</span>
                        </div>
                      </div>

                      {isSelected ? (
                        <UserCheck className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <UserX className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 mt-6 pb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Assignment"}
        </Button>
      </div>
    </PageContainer>
  );
}
