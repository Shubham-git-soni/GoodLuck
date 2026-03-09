"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    LayoutGrid,
    TrendingUp,
    School,
    FileText,
    BarChart,
    PieChart,
    Download,
    Search,
    Calendar,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { toast } from "sonner";

import salesmenData from "@/lib/mock-data/salesmen.json";
import schoolsData from "@/lib/mock-data/schools.json";
import visitsData from "@/lib/mock-data/visits.json";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StationBoardSummary {
    id: string; // for DataGrid
    srNo: number;
    station: string;
    board: string;
    list: number;
    covered: number;
    specGiven: number;
    presSchools: number;
    Sep: number; Oct: number; Nov: number; Dec: number;
    Jan: number; Feb: number; Mar: number; Apr: number;
    May: number; Jun: number; Jul: number; Aug: number;
    "1V": number;
    "2V": number;
    "3V": number;
    "3+V": number;
    "0V": number;
}

// ─── Helper: Get Month Name ──────────────────────────────────────────────────
const getMonthKey = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString("default", { month: "short" });
};

// ─── Data Generation ─────────────────────────────────────────────────────────
const generateSummaryData = (salesmanId: string): StationBoardSummary[] => {
    const salesman = salesmenData.find((s) => s.id === salesmanId);
    if (!salesman) return [];

    const assignedSchools = schoolsData.filter((s) => s.assignedTo === salesman.id || s.assignedTo === salesman.name);
    const salesmanVisits = visitsData.filter((v) => v.salesmanId === salesmanId);

    // Group schools by city and board
    const groups: Record<string, any> = {};

    assignedSchools.forEach((school) => {
        const key = `${school.city}-${school.board}`;
        if (!groups[key]) {
            groups[key] = {
                station: school.city,
                board: school.board,
                list: 0,
                covered: 0,
                specGiven: 0,
                presSchools: 0,
                Sep: 0, Oct: 0, Nov: 0, Dec: 0, Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0,
                "1V": 0, "2V": 0, "3V": 0, "3+V": 0, "0V": 0
            };
        }

        const group = groups[key];
        group.list++;

        const schoolVisits = salesmanVisits.filter(v => v.schoolId === school.id);
        const visitCount = schoolVisits.length;

        if (visitCount > 0) {
            group.covered++;
            if (visitCount === 1) group["1V"]++;
            else if (visitCount === 2) group["2V"]++;
            else if (visitCount === 3) group["3V"]++;
            else group["3+V"]++;

            // Count monthly visits
            schoolVisits.forEach(v => {
                const month = getMonthKey(v.date);
                if (group[month] !== undefined) {
                    group[month]++;
                }
            });

            const hadSpecimen = schoolVisits.some(v => v.type === 'school' && (v as any).specimensGiven?.length > 0);
            if (hadSpecimen) group.specGiven++;
        } else {
            group["0V"]++;
        }
    });

    return Object.values(groups)
        .sort((a: any, b: any) => a.station.localeCompare(b.station))
        .map((item: any, index) => ({
            ...item,
            id: `${item.station}-${item.board}`,
            srNo: index + 1
        }));
};

export default function SummaryReportPage() {
    const params = useParams();
    const salesmanId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [salesman, setSalesman] = useState<any>(null);
    const [reportData, setReportData] = useState<StationBoardSummary[]>([]);

    useEffect(() => {
        setTimeout(() => {
            const found = salesmenData.find((s) => s.id === salesmanId);
            if (found) {
                setSalesman(found);
                setReportData(generateSummaryData(salesmanId));
            }
            setIsLoading(false);
        }, 500);
    }, [salesmanId]);

    const columns: GridColumn<StationBoardSummary>[] = [
        { key: "srNo", header: "Sr. No.", width: 60, align: "center", pinned: "left" },
        { key: "station", header: "STATIONS", width: 130, pinned: "left", render: (v) => <span className="font-bold text-xs">{v}</span> },
        { key: "board", header: "BOARD", width: 80, render: (v) => <Badge variant="outline" className="text-[10px]">{v}</Badge> },
        { key: "list", header: "LIST", width: 70, align: "center" },
        { key: "covered", header: "COVERED", width: 80, align: "center", render: (v) => <span className="text-emerald-600 font-bold">{v}</span> },
        { key: "specGiven", header: "SPEC G", width: 70, align: "center" },

        // Monthly columns
        { key: "Sep", header: "SEP", width: 45, align: "center", type: "number" },
        { key: "Oct", header: "OCT", width: 45, align: "center", type: "number" },
        { key: "Nov", header: "NOV", width: 45, align: "center", type: "number" },
        { key: "Dec", header: "DEC", width: 45, align: "center", type: "number" },
        { key: "Jan", header: "JAN", width: 45, align: "center", type: "number" },
        { key: "Feb", header: "FEB", width: 45, align: "center", type: "number" },
        { key: "Mar", header: "MAR", width: 45, align: "center", type: "number" },
        { key: "Apr", header: "APR", width: 45, align: "center", type: "number" },
        { key: "May", header: "MAY", width: 45, align: "center", type: "number" },
        { key: "Jun", header: "JUN", width: 45, align: "center", type: "number" },
        { key: "Jul", header: "JUL", width: 45, align: "center", type: "number" },
        { key: "Aug", header: "AUG", width: 45, align: "center", type: "number" },

        // Distribution columns
        { key: "1V", header: "1V", width: 45, align: "center", render: (v) => <span className="text-amber-600 font-medium">{v}</span> },
        { key: "2V", header: "2V", width: 45, align: "center", render: (v) => <span className="text-amber-600 font-medium">{v}</span> },
        { key: "3V", header: "3V", width: 45, align: "center", render: (v) => <span className="text-amber-600 font-medium">{v}</span> },
        { key: "3+V", header: "3+V", width: 45, align: "center", render: (v) => <span className="text-amber-600 font-medium">{v}</span> },
        { key: "0V", header: "0V", width: 45, align: "center", render: (v) => <span className="text-rose-500 font-medium">{v}</span> },
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
                    title={`Summary Report of ${salesman.name}`}
                    description="Consolidated performance metrics by station and board."
                />
            </div>

            <DataGrid
                data={reportData}
                columns={columns}
                title="Station-wise Activity Summary"
                showStats={true}
                onExport={(data) => toast.success(`Exporting ${data.length} records to Excel`)}
            />
        </PageContainer>
    );
}
