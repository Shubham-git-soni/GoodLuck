"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Trash2,
    RefreshCcw,
    School as SchoolIcon,
    Phone,
    Mail,
    MapPin,
    Search,
    Plus,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from "recharts";
import { BarChart2, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DroppedSchool {
    id: string;
    srNo: number;
    schoolName: string;
    schoolId: string;
    board: string;
    strength: number;
    contactNo: string;
    email: string;
    noOfVisits: number;
    address: string;
    city: string;
    state: string;
}

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateDroppedSchoolData = (salesmanId: string): DroppedSchool[] => {
    const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
    if (!foundSalesman) return [];

    // Simulate dropped schools by taking some schools from the salesman's state
    const stateSchools = schoolsData.filter((s) => s.state === foundSalesman.state);

    return stateSchools.slice(0, 5).map((school, index) => {
        return {
            id: school.id,
            srNo: index + 1,
            schoolName: school.name,
            schoolId: school.id,
            board: school.board,
            strength: school.strength,
            contactNo: school.contacts?.[0]?.phone || "9876543210",
            email: school.contacts?.[0]?.email || "contact@school.com",
            noOfVisits: Math.floor(Math.random() * 3),
            address: school.address,
            city: school.city,
            state: school.state,
        };
    });
};

export default function DropListPage() {
    const params = useParams();
    const salesmanId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [salesman, setSalesman] = useState<any>(null);
    const [reportData, setReportData] = useState<DroppedSchool[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<DroppedSchool | null>(null);

    useEffect(() => {
        setTimeout(() => {
            const found = salesmenData.find((s) => s.id === salesmanId);
            if (found) {
                setSalesman(found);
                setReportData(generateDroppedSchoolData(salesmanId));
            }
            setIsLoading(false);
        }, 500);
    }, [salesmanId]);

    const handlePermanentDelete = (school: DroppedSchool) => {
        setReportData((prev) => prev.filter((s) => s.id !== school.id));
        setDeleteTarget(null);
        toast.error(`School ${school.schoolName} permanently deleted from drop list`);
    };

    const handleRestore = (school: DroppedSchool) => {
        setReportData((prev) => prev.filter((s) => s.id !== school.id));
        toast.success(`School ${school.schoolName} restored to active list`);
    };

    const columns: GridColumn<DroppedSchool>[] = [
        { key: "srNo", header: "Sr. No.", width: 70, align: "center", pinned: "left" },
        {
            key: "schoolName",
            header: "School Name",
            width: 250,
            pinned: "left",
            render: (v) => <span className="font-bold text-sm text-destructive/80">{v}</span>
        },
        { key: "schoolId", header: "School ID", width: 100 },
        { key: "board", header: "School Board", width: 120 },
        { key: "strength", header: "School Strength", width: 130, align: "center" },
        { key: "contactNo", header: "Contact No.", width: 150 },
        { key: "email", header: "Email", width: 200 },
        {
            key: "noOfVisits",
            header: "No. of Visits",
            width: 110,
            align: "center",
            render: (v) => <Badge variant="outline">{v}</Badge>
        },
        { key: "address", header: "School Address", width: 300, render: (v) => <p className="text-[11px] line-clamp-1">{v}</p> },
        { key: "city", header: "School City", width: 120 },
        { key: "state", header: "School State", width: 120 },
    ];

    const extraViews = [
        {
            key: "charts",
            label: "Analytics",
            icon: <BarChart2 className="h-3.5 w-3.5" />,
            render: (data: DroppedSchool[]) => {
                const cityDistrib: Record<string, number> = {};
                data.forEach(v => { cityDistrib[v.city] = (cityDistrib[v.city] || 0) + 1; });
                const barData = Object.entries(cityDistrib).map(([name, count]) => ({ name, count }));

                const boardDistrib: Record<string, number> = {};
                data.forEach(v => { boardDistrib[v.board] = (boardDistrib[v.board] || 0) + 1; });
                const pieData = Object.entries(boardDistrib).map(([name, value]) => ({ name, value }));
                const COLORS = ["#f97316", "#fbbf24", "#10b981", "#3b82f6", "#8b5cf6"];

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl border border-border/50">
                        <Card className="border-0 shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Dropped Schools by City
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                        <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="count" fill="oklch(0.66 0.20 45)" radius={[4, 4, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <PieChartIcon className="h-4 w-4 text-amber-500" />
                                    Board Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                );
            }
        }
    ];

    if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

    if (!salesman) return (
        <PageContainer>
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Salesman Not Found</h2>
                <Button asChild><Link href="/admin/team">Back to Team</Link></Button>
            </div>
        </PageContainer>
    );

    return (
        <PageContainer>
            <div className="mb-6">
                <Link href={`/admin/team/${salesmanId}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <PageHeader
                    title={`Drop School List of ${salesman.name}`}
                    description={`Schools that have been dropped or marked for deletion by ${salesman.name}`}
                />
            </div>

            <DataGrid
                data={reportData}
                columns={columns}
                title="Dropped School Records"
                showStats={true}
                onExport={(data) => toast.success(`Exporting ${data.length} records to Excel`)}
                extraViews={extraViews}
                rowActions={(row) => [
                    {
                        label: "Restore",
                        icon: <RefreshCcw className="h-4 w-4 text-emerald-500" />,
                        onClick: () => handleRestore(row),
                    },
                    {
                        label: "Permanent Delete",
                        icon: <Trash2 className="h-4 w-4 text-rose-500" />,
                        danger: true,
                        onClick: () => setDeleteTarget(row),
                    },
                ]}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                itemName={deleteTarget ? deleteTarget.schoolName : ""}
                onConfirm={() => handlePermanentDelete(deleteTarget!)}
            />
        </PageContainer>
    );
}
