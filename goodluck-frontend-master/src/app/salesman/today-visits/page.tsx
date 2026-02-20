"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, CheckCircle, AlertCircle, Navigation, Phone, Mail } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface TodayVisit {
  id: string;
  schoolId: string;
  schoolName: string;
  city: string;
  address: string;
  objective: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: "pending" | "checked-in" | "completed";
  checkInTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

export default function TodayVisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<TodayVisit[]>([
    {
      id: "TV001",
      schoolId: "SCH001",
      schoolName: "Delhi Public School",
      city: "Delhi",
      address: "Mathura Road, New Delhi - 110025",
      objective: "Book Prescription Discussion",
      contactPerson: "Dr. Rajesh Sharma",
      contactPhone: "+91 11 2634 5678",
      contactEmail: "principal@dps.edu",
      status: "pending",
    },
    {
      id: "TV002",
      schoolId: "SCH003",
      schoolName: "St. Xavier's High School",
      city: "Delhi",
      address: "Raj Nagar, New Delhi - 110017",
      objective: "Sample Distribution",
      contactPerson: "Mrs. Priya Mehta",
      contactPhone: "+91 11 2845 6789",
      contactEmail: "contact@stxaviers.edu",
      status: "pending",
    },
    {
      id: "TV003",
      schoolId: "SCH005",
      schoolName: "Modern Public School",
      city: "Delhi",
      address: "Vasant Vihar, New Delhi - 110057",
      objective: "Relationship Building",
      contactPerson: "Mr. Arun Kumar",
      contactPhone: "+91 11 2614 3456",
      contactEmail: "admin@modern.edu",
      status: "pending",
    },
  ]);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "pending">("pending");

  useEffect(() => {
    // Request location permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationPermission("granted");
        },
        (error) => {
          console.error("Location error:", error);
          setLocationPermission("denied");
          toast.error("Location access denied. Please enable location services.");
        }
      );
    }
  }, []);

  const handleCheckIn = (visitId: string) => {
    if (!currentLocation) {
      toast.error("Unable to get your location. Please enable location services.");
      return;
    }

    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    // Simulate check-in
    const updatedVisits = visits.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: "checked-in" as const,
          checkInTime: new Date().toISOString(),
          checkInLocation: {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            city: v.city,
          },
        };
      }
      return v;
    });

    setVisits(updatedVisits);
    toast.success(`Checked in at ${visit.schoolName}`);

    // Navigate to add visit page
    setTimeout(() => {
      router.push("/salesman/schools/add-visit");
    }, 1000);
  };

  const handleStartVisit = (visitId: string) => {
    router.push("/salesman/schools/add-visit");
  };

  const pendingVisits = visits.filter(v => v.status === "pending");
  const checkedInVisits = visits.filter(v => v.status === "checked-in");
  const completedVisits = visits.filter(v => v.status === "completed");

  const getStatusBadge = (status: TodayVisit["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "checked-in":
        return <Badge variant="default" className="bg-blue-500">Checked In</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Today's Visits"
        description={`${visits.length} visits scheduled for ${new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })}`}
      />

      {/* Location Status Alert */}
      {locationPermission === "denied" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is required for check-in. Please enable location services in your browser settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{pendingVisits.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{checkedInVisits.length}</p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{completedVisits.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map((visit) => (
          <Card key={visit.id} className={visit.status === "checked-in" ? "border-blue-500" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{visit.schoolName}</CardTitle>
                    {getStatusBadge(visit.status)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {visit.objective}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{visit.city}</p>
                    <p className="text-muted-foreground text-xs">{visit.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Contact Person</p>
                <div className="space-y-1">
                  <p className="text-sm">{visit.contactPerson}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{visit.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{visit.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* Check-in Info */}
              {visit.status === "checked-in" && visit.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Checked in at {new Date(visit.checkInTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {visit.status === "pending" && (
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={() => handleCheckIn(visit.id)}
                    disabled={locationPermission !== "granted"}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                )}
                {visit.status === "checked-in" && (
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={() => handleStartVisit(visit.id)}
                  >
                    Start Visit
                  </Button>
                )}
                {visit.status === "completed" && (
                  <Button
                    className="flex-1"
                    size="lg"
                    variant="outline"
                    disabled
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No visits scheduled for today.
            </p>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
