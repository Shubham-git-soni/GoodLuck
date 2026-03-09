"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  BarChart2,
  Edit,
  Trash2,
} from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton-loaders";
import { DataGrid } from "@/components/ui/data-grid";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import salesmenData from "@/lib/mock-data/salesmen.json";

// ─── Mock Data matching screenshot exactly ────────────────────────────────────
const MOCK_BOOKSELLERS = [
  { srNo: 1, salesman: "ABHISHEK PATHAK", booksellerName: "AMIN Book Depot", contactNo: "0", email: "", address: "Buxpur, Gorakhpur", city: "Gorakhpur", state: "Uttar Pradesh" },
  { srNo: 2, salesman: "ABHISHEK PATHAK", booksellerName: "Books & Books", contactNo: "0", email: "", address: "Rauta Chauraha", city: "Basti", state: "Uttar Pradesh" },
  { srNo: 3, salesman: "ABHISHEK PATHAK", booksellerName: "Central Book House", contactNo: "0", email: "", address: "Buxpur, Gorakhpur", city: "Gorakhpur", state: "Uttar Pradesh" },
  { srNo: 4, salesman: "ABHISHEK PATHAK", booksellerName: "Children's Books Agency", contactNo: "0", email: "", address: "Raghav Nagar", city: "Deoria", state: "Uttar Pradesh" },
  { srNo: 5, salesman: "ABHISHEK PATHAK", booksellerName: "Friends Book & Company", contactNo: "0", email: "", address: "Buxpur", city: "Gorakhpur", state: "Uttar Pradesh" },
  { srNo: 6, salesman: "ABHISHEK PATHAK", booksellerName: "Rajkamal Book Depot", contactNo: "0", email: "", address: "Buxpur, Gorakhpur", city: "Gorakhpur", state: "Uttar Pradesh" },
  { srNo: 7, salesman: "ABHISHEK PATHAK", booksellerName: "Vidyarthi kendra", contactNo: "0", email: "", address: "Jal Road Gorakhpur", city: "Gorakhpur", state: "Uttar Pradesh" },
  // Adding a few more for charts
  { srNo: 8, salesman: "ABHISHEK PATHAK", booksellerName: "Student Store", contactNo: "9000100020", email: "store@gorakhpur.com", address: "Medical College Rd", city: "Gorakhpur", state: "Uttar Pradesh" },
  { srNo: 9, salesman: "ABHISHEK PATHAK", booksellerName: "Academic Corner", contactNo: "0", email: "", address: "Main Market", city: "Basti", state: "Uttar Pradesh" },
];

// ─── Chart View ──────────────────────────────────────────────────────────────
const CHART_PALETTE = ["#f97316", "#9ca3af", "#10b981", "#3b82f6", "#f59e0b"];

function BooksellerChartView({ data }: { data: any[] }) {
  // Booksellers by City
  const cityMap: Record<string, number> = {};
  data.forEach((r) => {
    cityMap[r.city] = (cityMap[r.city] || 0) + 1;
  });
  const cityBar = Object.entries(cityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Booksellers with vs without contact
  const withContact = data.filter((r) => r.contactNo && r.contactNo !== "0").length;
  const withoutContact = data.length - withContact;
  const contactPie = [
    { name: "Has Contact", value: withContact, fill: "#10b981" },
    { name: "No Contact", value: withoutContact, fill: "#f97316" },
  ];

  return (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Booksellers per City Bar Chart */}
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">Booksellers by City</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cityBar} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" name="Booksellers" radius={[0, 4, 4, 0]}>
                {cityBar.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contact info availability */}
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col">
          <p className="text-sm font-semibold mb-3">Contact Info Availability</p>
          <div className="flex-1 flex items-center justify-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={contactPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value" stroke="none"
                  label={({ name, percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}>
                  {contactPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {contactPie.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm" style={{ background: e.fill }} />
                  <span className="text-sm font-medium">{e.name}: {e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BooksellerListPage() {
  const params = useParams();
  const salesmanId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [salesman, setSalesman] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      const found = salesmenData.find((s) => s.id === salesmanId);
      if (found) {
        setSalesman(found);
        // Add ID to rows for DataGrid rowKey, and map dynamic Salesman Name
        setRows(MOCK_BOOKSELLERS.map((bs, i) => ({ ...bs, salesman: found.name, id: `BS-${i + 1}` })));
      }
      setIsLoading(false);
    }, 400);
  }, [salesmanId]);

  const handleDelete = (item: any) => {
    setRows(rows.filter((r) => r.id !== item.id));
    toast({
      title: "Deleted",
      description: `${item.booksellerName} has been removed.`,
      variant: "destructive",
    });
  };

  if (isLoading) return <PageContainer><PageSkeleton /></PageContainer>;

  if (!salesman) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Salesman Not Found</h2>
          <Link href="/admin/team">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // screenshot columns: Delete, Edit, Sr. No., Salesman, Bookseller Name, Contact No., Email, Address, City, State
  const columns = [
    { key: "srNo", header: "Sr. No.", width: 70, sortable: true },
    { key: "salesman", header: "Salesman", minWidth: 150, sortable: true, filterable: true, render: (v: string) => <span className="text-muted-foreground text-xs uppercase">{v}</span> },
    { key: "booksellerName", header: "Bookseller Name", minWidth: 200, sortable: true, filterable: true, render: (v: string) => <span className="font-medium text-xs">{v}</span> },
    { key: "contactNo", header: "Contact No.", width: 100, sortable: false, render: (v: string) => <span className={v === '0' ? 'text-muted-foreground/50' : ''}>{v}</span> },
    { key: "email", header: "Email", minWidth: 150, sortable: false, render: (v: string) => <span className="text-muted-foreground truncate" title={v}>{v || "—"}</span> },
    { key: "address", header: "Address", minWidth: 180, sortable: false, render: (v: string) => <span className="text-muted-foreground truncate" title={v}>{v}</span> },
    { key: "city", header: "City", width: 120, sortable: true },
    { key: "state", header: "State", width: 120, sortable: true },
    {
      key: "actions",
      header: "Action",
      width: 80,
      sortable: false,
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted">
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(row)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const extraViews = [
    {
      key: "chart",
      icon: <BarChart2 className="h-4 w-4" />,
      label: "Chart View",
      render: (data: any[]) => <BooksellerChartView data={data} />,
    },
  ];

  return (
    <PageContainer>
      <div className="mb-4 md:mb-6">
        <Link href={`/admin/team/${salesmanId}`}>
          <Button variant="ghost" size="sm" className="mb-2 md:mb-4 text-xs md:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <PageHeader
          title={`Bookseller List - ${salesman.name}`}
          description={`Complete bookseller portfolio and details`}
        />
      </div>

      <DataGrid
        data={rows}
        columns={columns}
        rowKey="id"
        title="Bookseller Portfolio"
        description={`${rows.length} booksellers`}
        showStats
        density="compact"
        extraViews={extraViews}
        onExport={(data, format) => console.log("Export", format, data)}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        itemName={deleteTarget?.booksellerName ?? ""}
        contextLabel="from the bookseller list"
        onConfirm={() => handleDelete(deleteTarget!)}
      />
    </PageContainer>
  );
}
