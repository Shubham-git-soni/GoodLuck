"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Phone, MapPin, Users } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Manager } from "@/types";
import managersData from "@/lib/mock-data/managers.json";

export default function ManagerListPage() {
  const [managers] = useState<Manager[]>(managersData as Manager[]);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter managers based on search
  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="space-y-4 mb-6">
        <PageHeader
          title="Managers"
          description={`${managers.length} managers in system`}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Manager Button */}
          <Link href="/admin/managers/add">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          </Link>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredManagers.length} of {managers.length} managers
        </p>
      </div>

      {/* Manager List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
        {filteredManagers.map((manager) => (
          <Card key={manager.id} className="hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">{manager.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {manager.id}</p>
                  </div>
                  <Badge variant={manager.status === "Active" ? "default" : "secondary"}>
                    {manager.status}
                  </Badge>
                </div>

                {/* Contact Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{manager.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{manager.contactNo}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{manager.state}</span>
                  </div>
                </div>

                {/* Assigned Salesmen */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Salesmen:</span>
                    </div>
                    <span className="font-semibold">{manager.assignedSalesmen.length}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t">
                  <Link href={`/admin/managers/assign/${manager.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Assign Salesmen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredManagers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No managers found</p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
