"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    School as SchoolIcon,
    Store,
    FileText,
    BarChart2,
    PieChart as PieChartIcon,
    TrendingUp,
    Download,
    Plus,
    User,
    BadgeCheck,
    CheckCircle2,
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
import visitsData from "@/lib/mock-data/visits.json";
import schoolsData from "@/lib/mock-data/schools.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MergeVisitEntry {
    id: string;
    srNo: number;
    visitType: "S.V." | "B.V.";
    date: string;
    day: string;
    time: string;
    jointWorking: string;
    schoolBookseller: string;
    address: string;
    city: string;
    board: string;
    strength: number;
    person: string;
    contactNo: string;
    email: string;
    st: number;
    so: number;
    sr: number;
    pGL: number;
    pVP: number;
    purpose: string;
    schoolBooksellerComment: string;
    yourComment: string;
}

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateMergeVisitData = (salesmanId: string): MergeVisitEntry[] => {
    const salesmanVisits = visitsData.filter((v) => v.salesmanId === salesmanId);
    const purposes = ["Final Pitch", "Order Finalization", "Payment Collection", "Relationship Building", "Follow-up"];
    const types: ("S.V." | "B.V.")[] = ["S.V.", "B.V."];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return salesmanVisits.map((visit, index) => {
        const date = new Date(visit.date);
        const day = days[date.getDay()];
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.floor(Math.random() * 60);
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

        const school = schoolsData[Math.floor(Math.random() * schoolsData.length)];

        return {
            id: `MV${String(index + 1).padStart(3, "0")}`,
            srNo: index + 1,
            visitType: visit.type === "school" ? "S.V." : "B.V.",
            date: visit.date,
            day,
            time,
            jointWorking: Math.random() > 0.8 ? "Yes" : "No",
            schoolBookseller: visit.schoolName || (visit as any).bookSellerName || school.name,
            address: school.address,
            city: school.city,
            board: school.board,
            strength: school.strength,
            person: school.contacts?.[0]?.name || "N/A",
            contactNo: school.contacts?.[0]?.phone || "N/A",
            email: school.contacts?.[0]?.email || "N/A",
            st: Math.floor(Math.random() * 10),
            so: Math.floor(Math.random() * 10),
            sr: Math.floor(Math.random() * 5),
            pGL: Math.floor(Math.random() * 50000),
            pVP: Math.floor(Math.random() * 30000),
            purpose: purposes[Math.floor(Math.random() * purposes.length)],
            schoolBooksellerComment: "Good response, will confirm soon.",
            yourComment: "Promising lead for the next academic year.",
        };
    });
};

export default function MergeVisitReportPage() {
    const params = useParams();
    const salesmanId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [salesman, setSalesman] = useState<any>(null);
    const [reportData, setReportData] = useState<MergeVisitEntry[]>([]);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    useEffect(() => {
        setTimeout(() => {
            const found = salesmenData.find((s) => s.id === salesmanId);
            if (found) {
                setSalesman(found);
                setReportData(generateMergeVisitData(salesmanId));
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

    const stats = useMemo(() => {
        const totalVisits = filteredData.length;
        const svCount = filteredData.filter(d => d.visitType === "S.V.").length;
        const bvCount = filteredData.filter(d => d.visitType === "B.V.").length;
        const totalPayment = filteredData.reduce((sum, d) => sum + d.pGL + d.pVP, 0);
        return { totalVisits, svCount, bvCount, totalPayment };
    }, [filteredData]);

    const columns: GridColumn<MergeVisitEntry>[] = [
        { key: "srNo", header: "Sr. No.", width: 70, align: "center", pinned: "left" },
        {
            key: "visitType",
            header: "Visit",
            width: 70,
            align: "center",
            render: (v) => <Badge variant={v === "S.V." ? "default" : "secondary"} className="text-[9px] px-1">{v as string}</Badge>
        },
        {
            key: "date",
            header: "Date",
            width: 110,
            render: (v) => <span className="text-[11px] font-medium">{new Date(v as string).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        },
        { key: "day", header: "Day", width: 90, render: (v) => <span className="text-[11px] font-medium">{v}</span> },
        { key: "time", header: "Time", width: 80, render: (v) => <span className="text-[11px] opacity-70 tabular-nums">{v}</span> },
        {
            key: "jointWorking",
            header: "Joint Working",
            width: 100,
            align: "center",
            render: (v) => v === "Yes" ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0 h-5 text-[9px]">Joint</Badge> : null
        },
        {
            key: "schoolBookseller",
            header: "School/Bookseller",
            width: 220,
            pinned: "left",
            render: (v) => <span className="font-bold text-[12px] truncate block">{v}</span>
        },
        { key: "address", header: "Address", width: 220, render: (v) => <p className="text-[10px] text-muted-foreground line-clamp-1">{v}</p> },
        { key: "city", header: "City", width: 100 },
        { key: "board", header: "Board", width: 80, render: (v) => <Badge variant="outline" className="text-[9px]">{v}</Badge> },
        { key: "strength", header: "Strength", width: 80, align: "center" },
        { key: "person", header: "Person", width: 150 },
        { key: "contactNo", header: "Contact No.", width: 130 },
        { key: "email", header: "Email", width: 180 },
        { key: "st", header: "S.T.", width: 50, align: "center" },
        { key: "so", header: "S.O.", width: 50, align: "center" },
        { key: "sr", header: "S.R.", width: 50, align: "center" },
        {
            key: "pGL",
            header: "P.GL",
            width: 90,
            align: "right",
            render: (v) => <span className="font-bold text-primary text-[11px]">₹{(Number(v) / 1000).toFixed(1)}K</span>
        },
        {
            key: "pVP",
            header: "P.VP",
            width: 90,
            align: "right",
            render: (v) => <span className="font-bold text-muted-foreground text-[11px]">₹{(Number(v) / 1000).toFixed(1)}K</span>
        },
        { key: "purpose", header: "Purpose", width: 150, render: (v) => <Badge variant="secondary" className="font-normal text-[10px]">{v}</Badge> },
        { key: "schoolBooksellerComment", header: "School/Bookseller Comment", width: 250, render: (v) => <p className="text-[10px] text-muted-foreground italic line-clamp-1">"{v}"</p> },
        { key: "yourComment", header: "Your Comment", width: 250, render: (v) => <p className="text-[10px] text-primary italic line-clamp-1">"{v}"</p> },
    ];

    const extraViews = [
        {
            key: "charts",
            label: "Analytics",
            icon: <BarChart2 className="h-3.5 w-3.5" />,
            render: (data: MergeVisitEntry[]) => {
                const visitTypeData = [
                    { name: "School Visits", value: data.filter(d => d.visitType === "S.V.").length },
                    { name: "Bookseller Visits", value: data.filter(d => d.visitType === "B.V.").length },
                ];
                const COLORS = ["#f97316", "#fbbf24"];

                const visitsByDay: Record<string, number> = {};
                data.forEach(v => { visitsByDay[v.day] = (visitsByDay[v.day] || 0) + 1; });
                const barData = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    .map(day => ({ name: day.slice(0, 3), count: visitsByDay[day] || 0 }));

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-2xl border border-border/50">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Visits by Day of Week
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

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <PieChartIcon className="h-4 w-4 text-amber-500" />
                                    Visit Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={visitTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {visitTypeData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
            <div className="text-center py-12 text-sm font-medium">Salesman not found.</div>
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
                    title={`Merge Visit Report of ${salesman.name}`}
                    description={`Unified view of all school and bookseller interactions.`}
                />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-0 shadow-sm gradient-card-orange">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <BadgeCheck className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{stats.totalVisits}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Visits</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-amber">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-amber-100">
                                <SchoolIcon className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{stats.svCount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">School Visits</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-orange">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Store className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">{stats.bvCount}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Bookseller Visits</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm gradient-card-neutral">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-1.5 rounded-lg bg-muted">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xl font-bold tracking-tight">₹{(stats.totalPayment / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Payment Coll.</p>
                    </CardContent>
                </Card>
            </div>

            <DataGrid
                data={filteredData}
                columns={columns}
                title="Consolidated Interaction Log"
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
