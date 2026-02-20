"use client";

import { useEffect, useState } from "react";
import { DollarSign, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { toast } from "sonner";

import tadaClaimsData from "@/lib/mock-data/tada-claims.json";

export default function TadaAdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setClaims(tadaClaimsData);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleApprove = (id: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Approved", approvedDate: new Date().toISOString() } : c))
    );
    toast.success("TA/DA claim approved!");
  };

  const handleReject = (id: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c))
    );
    toast.error("TA/DA claim rejected!");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageSkeleton />
      </PageContainer>
    );
  }

  const pending = claims.filter((c) => c.status === "Pending");
  const flagged = claims.filter((c) => c.status === "Flagged");
  const approved = claims.filter((c) => c.status === "Approved");

  return (
    <PageContainer>
      <PageHeader
        title="TA/DA Approval"
        description="Manage travel allowance claims"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard
          title="Pending"
          value={pending.length}
          icon={DollarSign}
        />
        <StatsCard
          title="Flagged"
          value={flagged.length}
          description="Needs review"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Approved"
          value={approved.length}
          icon={CheckCircle}
        />
        <StatsCard
          title="Total Approved Amount"
          value={`₹${(approved.reduce((sum, c) => sum + c.amount, 0) / 1000).toFixed(0)}K`}
          icon={DollarSign}
        />
      </div>

      {/* Claims Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flagged.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-3">
          {pending.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{claim.salesmanName}</h3>
                      <Badge variant="secondary">{claim.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(claim.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">City</p>
                        <p className="font-medium">{claim.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Travel Mode</p>
                        <p className="font-medium">{claim.travelMode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{claim.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(claim.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(claim.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="flagged" className="mt-6 space-y-3">
          {flagged.map((claim) => (
            <Card key={claim.id} className="border-destructive/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{claim.salesmanName}</h3>
                      <Badge variant="destructive">{claim.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(claim.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-medium text-destructive">₹{claim.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    {claim.comments && (
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {claim.comments}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(claim.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(claim.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-3">
          {approved.map((claim) => (
            <Card key={claim.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{claim.salesmanName}</h3>
                      <Badge>{claim.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(claim.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{claim.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Approved By</p>
                        <p className="font-medium">{claim.approvedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Approved On</p>
                        <p className="font-medium">
                          {claim.approvedDate && new Date(claim.approvedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
