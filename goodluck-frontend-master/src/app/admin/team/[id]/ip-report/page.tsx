"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    School as SchoolIcon,
    MapPin,
    TrendingUp,
    TrendingDown,
    BarChart2,
    PieChart as PieChartIcon,
    BookOpen,
    Plus,
    Target,
    Download,
    ClipboardList,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { cn } from "@/lib/utils";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IPReportEntry {
    id: string;
    srNo: number;
    schoolName: string;
    address: string;
    station: string;
    strength: number;
    board: string;
    specimenGiven: number;
    prescribedDetail: string;
    totalBooksQty: number;
    orderValue: number;
    supplyThrough: string;
    remarks: string;
    date: string;
}

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateIPReportData = (salesmanId: string): IPReportEntry[] => {
    const foundSalesman = salesmenData.find((s) => s.id === salesmanId);
    if (!foundSalesman) return [];

    const assignedSchools = schoolsData.filter((s) => s.assignedTo === foundSalesman.id || s.assignedTo === foundSalesman.name);
    const supplyThrough = ["Direct", "Bookseller", "Distributor", "Regional Office"];
    const prescribedDetails = ["Full Set", "Partial Set", "None", "Recommended"];

    return assignedSchools.map((school, index) => {
        const specimenGiven = Math.floor(Math.random() * 30) + 5;
        const totalBooksQty = Math.floor(Math.random() * 500) + 100;
        const orderValue = totalBooksQty * (Math.floor(Math.random() * 200) + 150);

        // Generate a random date within the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        return {
            id: `IP${String(index + 1).padStart(3, "0")}`,
            srNo: index + 1,
            schoolName: school.name,
            address: school.address,
            station: school.city,
            strength: school.strength,
            board: school.board,
            specimenGiven,
            prescribedDetail: prescribedDetails[Math.floor(Math.random() * prescribedDetails.length)],
            totalBooksQty,
            orderValue,
            supplyThrough: supplyThrough[Math.floor(Math.random() * supplyThrough.length)],
            remarks: "Sample report entry for IP tracking.",
            date: date.toISOString().split("T")[0],
        };
    });
};

export default function IPReportPage() {
    const params = useParams();
    const salesmanId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [salesman, setSalesman] = useState<any>(null);
    const [reportData, setReportData] = useState<IPReportEntry[]>([]);

    // Date Filters (if needed by theme)
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        setTimeout(() => {
            const found = salesmenData.find((s) => s.id === salesmanId);
            if (found) {
                setSalesman(found);
                setReportData(generateIPReportData(salesmanId));
            }
            setIsLoading(false);
        }, 500);
    }, [salesmanId]);

    const filteredData = useMemo(() => {
        let data = [...reportData];
        if (dateFrom) data = data.filter((v) => v.date >= dateFrom);
        if (dateTo) data = data.filter((v) => v.date <= dateTo);
        return data;
    }, [reportData, dateFrom, dateTo]);

    const columns: GridColumn<IPReportEntry>[] = [
        { key: "srNo", header: "Sr. No.", width: 70, align: "center", pinned: "left" },
        {
            key: "schoolName",
            header: "School Name",
            width: 250,
            pinned: "left",
            render: (v) => <span className="font-bold text-sm">{v}</span>
        },
        {
            key: "address",
            header: "Address",
            width: 250,
            render: (v) => <p className="text-[11px] text-muted-foreground line-clamp-1">{v}</p>
        },
        { key: "station", header: "Station", width: 120 },
        { key: "strength", header: "Strength", width: 100, align: "center" },
        {
            key: "board",
            header: "Board",
            width: 120,
            render: (v) => <Badge variant="secondary" className="text-[10px]">{v}</Badge>
        },
        {
            key: "specimenGiven",
            header: "Specimen Given",
            width: 130,
            align: "center",
            render: (v) => <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">{v}</Badge>
        },
        {
            key: "prescribedDetail",
            header: "Prescribed Detail",
            width: 150,
            render: (v) => <Badge variant="outline" className="font-normal text-[11px]">{v}</Badge>
        },
        { key: "totalBooksQty", header: "Total Books Qty.", width: 130, align: "center" },
        {
            key: "orderValue",
            header: "Order Value",
            width: 130,
            align: "right",
            render: (v) => <span className="font-bold text-primary">₹{(Number(v) / 1000).toFixed(1)}K</span>
        },
        { key: "supplyThrough", header: "Supply Through", width: 150 },
        {
            key: "remarks",
            header: "Remarks",
            width: 250,
            render: (v) => <p className="text-xs text-muted-foreground italic line-clamp-1">{v}</p>
        },
    ];

    const summaryStats = useMemo(() => {
        const totalSpecimen = filteredData.reduce((sum, d) => sum + d.specimenGiven, 0);
        const totalQty = filteredData.reduce((sum, d) => sum + d.totalBooksQty, 0);
        const totalValue = filteredData.reduce((sum, d) => sum + d.orderValue, 0);
        return { totalSpecimen, totalQty, totalValue };
    }, [filteredData]);

    const extraViews = [
        {
            key: "charts",
            label: "Analytics",
            icon: <BarChart2 className="h-3.5 w-3.5" />,
            render: (data: IPReportEntry[]) => {
                const boardDistrib: Record<string, number> = {};
                data.forEach(v => { boardDistrib[v.board] = (boardDistrib[v.board] || 0) + 1; });
                const pieData = Object.entries(boardDistrib).map(([name, value]) => ({ name, value }));
                const COLORS = ["#f97316", "#fbbf24", "#10b981", "#3b82f6", "#8b5cf6"];

                const specimenByStation: Record<string, number> = {};
                data.forEach(v => { specimenByStation[v.station] = (specimenByStation[v.station] || 0) + v.specimenGiven; });
                const barData = Object.entries(specimenByStation).map(([name, count]) => ({ name, count }));

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl border border-border/50">
                        <Card className="border-0 shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Specimen by Station
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
                    title={`IP Report of ${salesman.name}`}
                    description={`School List with IP Details for ${salesman.name}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
                <Card className="border-0 shadow-sm gradient-card-orange">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <SchoolIcon className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{filteredData.length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Schools</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-amber">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-amber-100">
                                <BookOpen className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{summaryStats.totalSpecimen}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Specimen Given</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-orange">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <ClipboardList className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{summaryStats.totalQty}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Books Qty.</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-neutral">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">₹{(summaryStats.totalValue / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Order Value</p>
                    </CardContent>
                </Card>
            </div>

            <DataGrid
                data={filteredData}
                columns={columns}
                title="IP Interaction Records"
                showStats={true}
                onExport={(data) => toast.success(`Exporting ${data.length} records to Excel`)}
                extraViews={extraViews}
                toolbar={
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase px-1.5">Date Filter:</span>
                            <DateRangePicker
                                from={dateFrom}
                                to={dateTo}
                                onFromChange={setDateFrom}
                                onToChange={setDateTo}
                                className="bg-transparent border-0 shadow-none hover:bg-transparent"
                            />
                        </div>
                    </div>
                }
            />
        </PageContainer>
    );
}
