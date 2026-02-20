"use client";

import { useState } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TourPlansPage() {
  const [tourPlans] = useState([
    {
      id: "TP001",
      salesmanId: "SM001",
      salesmanName: "Rajesh Kumar",
      weekStart: "2025-11-25",
      weekEnd: "2025-11-29",
      status: "Pending",
      submittedDate: "2025-11-22",
      plans: [
        { date: "2025-11-25", city: "Delhi", schools: 4, bookSellers: 1 },
        { date: "2025-11-26", city: "Ghaziabad", schools: 5, bookSellers: 0 },
        { date: "2025-11-27", city: "Delhi", schools: 3, bookSellers: 2 },
        { date: "2025-11-28", city: "Noida", schools: 4, bookSellers: 1 },
        { date: "2025-11-29", city: "Delhi", schools: 3, bookSellers: 1 },
      ],
    },
    {
      id: "TP002",
      salesmanId: "SM003",
      salesmanName: "Vikram Singh",
      weekStart: "2025-11-25",
      weekEnd: "2025-11-29",
      status: "Approved",
      submittedDate: "2025-11-21",
      approvedDate: "2025-11-22",
      plans: [
        { date: "2025-11-25", city: "Jaipur", schools: 5, bookSellers: 1 },
        { date: "2025-11-26", city: "Udaipur", schools: 4, bookSellers: 0 },
        { date: "2025-11-27", city: "Jaipur", schools: 4, bookSellers: 2 },
        { date: "2025-11-28", city: "Jodhpur", schools: 3, bookSellers: 1 },
        { date: "2025-11-29", city: "Jaipur", schools: 4, bookSellers: 1 },
      ],
    },
  ]);

  const handleApprove = (id: string) => {
    toast.success("Tour plan approved successfully!");
  };

  const handleReject = (id: string) => {
    toast.error("Tour plan rejected!");
  };

  const pending = tourPlans.filter((tp) => tp.status === "Pending");
  const approved = tourPlans.filter((tp) => tp.status === "Approved");

  return (
    <PageContainer>
      <PageHeader
        title="Tour Plan Manager"
        description="Review and approve weekly tour plans"
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {pending.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{plan.salesmanName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Week: {new Date(plan.weekStart).toLocaleDateString()} -{" "}
                      {new Date(plan.weekEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {plan.plans.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{day.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {day.schools} schools, {day.bookSellers} sellers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(plan.id)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(plan.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {approved.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{plan.salesmanName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Week: {new Date(plan.weekStart).toLocaleDateString()} -{" "}
                      {new Date(plan.weekEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.plans.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm">
                      <span className="text-muted-foreground">{day.city}</span>
                      <span>
                        {day.schools} schools, {day.bookSellers} sellers
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
