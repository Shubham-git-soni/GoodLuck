"use client";

import { useState } from "react";
import { DataGrid, GridColumn } from "@/components/ui/data-grid";
import { Eye, Edit2, Trash2, UserPlus, Download, Mail, Phone, Star, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Example data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  completion: number;
  joinDate: string;
  isVerified: boolean;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "active",
    completion: 85,
    joinDate: "2024-01-15",
    isVerified: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Manager",
    status: "active",
    completion: 92,
    joinDate: "2024-02-20",
    isVerified: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "inactive",
    completion: 45,
    joinDate: "2024-03-10",
    isVerified: false,
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice@example.com",
    role: "Manager",
    status: "pending",
    completion: 67,
    joinDate: "2024-04-05",
    isVerified: false,
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
    status: "active",
    completion: 78,
    joinDate: "2024-05-12",
    isVerified: true,
  },
];

export default function DataGridExample() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Column definitions
  const columns: GridColumn<User>[] = [
    {
      key: "id",
      header: "ID",
      type: "number",
      width: 80,
      align: "center",
      sortable: true,
      pinned: "left", // Pin to left side
    },
    {
      key: "name",
      header: "Name",
      type: "avatar",
      sortable: true,
      filterable: true,
      tooltip: true, // Show full name on hover
    },
    {
      key: "email",
      header: "Email",
      type: "text",
      sortable: true,
      filterable: true,
      render: (value) => (
        <a href={`mailto:${value}`} className="text-primary hover:underline flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          {value}
        </a>
      ),
    },
    {
      key: "role",
      header: "Role",
      type: "badge",
      sortable: true,
      filterable: true,
      badgeMap: {
        Admin: { label: "Admin", variant: "destructive" },
        Manager: { label: "Manager", variant: "default" },
        User: { label: "User", variant: "secondary" },
      },
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      sortable: true,
      filterable: true,
      badgeMap: {
        active: { label: "Active", variant: "default", color: "bg-green-100 text-green-700" },
        inactive: { label: "Inactive", variant: "secondary" },
        pending: { label: "Pending", variant: "outline", color: "border-orange-300 text-orange-600" },
      },
    },
    {
      key: "completion",
      header: "Progress",
      type: "progress",
      maxValue: 100,
      progressColor: "bg-gradient-to-r from-primary to-blue-500",
      sortable: true,
      aggregate: "avg", // Show average in footer
      align: "center",
    },
    {
      key: "joinDate",
      header: "Join Date",
      type: "date",
      sortable: true,
      filterable: true,
    },
    {
      key: "isVerified",
      header: "Verified",
      type: "boolean",
      sortable: true,
      align: "center",
      render: (value) =>
        value ? (
          <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
        ) : (
          <XCircle className="h-4 w-4 text-rose-400 mx-auto" />
        ),
    },
  ];

  // Row actions (appears on hover)
  const rowActions = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user: User) => {
        toast.info(`Viewing ${user.name}`);
      },
    },
    {
      label: "Edit User",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: (user: User) => {
        toast.info(`Editing ${user.name}`);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user: User) => {
        toast.success(`Deleted ${user.name}`);
        setUsers(users.filter((u) => u.id !== user.id));
      },
      danger: true,
    },
  ];

  // Bulk actions (when rows selected)
  const bulkActions = [
    {
      label: "Export Selected",
      icon: <Download className="h-4 w-4" />,
      onClick: (selected: User[]) => {
        toast.success(`Exporting ${selected.length} users`);
      },
    },
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      onClick: (selected: User[]) => {
        toast.success(`Sending email to ${selected.length} users`);
      },
    },
    {
      label: "Delete All",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (selected: User[]) => {
        toast.success(`Deleted ${selected.length} users`);
        const selectedIds = new Set(selected.map((u) => u.id));
        setUsers(users.filter((u) => !selectedIds.has(u.id)));
      },
      danger: true,
    },
  ];

  // Context menu (right-click)
  const contextMenuItems = (user: User) => [
    {
      label: "View Profile",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => toast.info(`Viewing ${user.name}'s profile`),
    },
    {
      label: "Send Message",
      icon: <Mail className="h-4 w-4" />,
      onClick: () => toast.info(`Messaging ${user.name}`),
    },
    {
      label: "Call",
      icon: <Phone className="h-4 w-4" />,
      onClick: () => toast.info(`Calling ${user.name}`),
    },
    { divider: true } as any,
    {
      label: "Delete User",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => {
        toast.success(`Deleted ${user.name}`);
        setUsers(users.filter((u) => u.id !== user.id));
      },
      danger: true,
    },
  ];

  // Quick filters
  const quickFilters = [
    {
      label: "Active Users",
      key: "status",
      value: "active",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    {
      label: "Managers",
      key: "role",
      value: "Manager",
      icon: <Star className="h-3 w-3" />,
    },
    {
      label: "Verified",
      key: "isVerified",
      value: true,
      icon: <CheckCircle className="h-3 w-3" />,
    },
  ];

  // Expandable row content
  const expandedRowRender = (user: User) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Contact Information</h4>
        <div className="text-sm space-y-1">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>+1 (555) 123-4567</span>
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Account Details</h4>
        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Member since:</span> {user.joinDate}
          </p>
          <p>
            <span className="text-muted-foreground">Last login:</span> 2 hours ago
          </p>
          <p>
            <span className="text-muted-foreground">Completion:</span> {user.completion}%
          </p>
        </div>
      </div>
    </div>
  );

  // Handle refresh
  const handleRefresh = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Refreshing data...",
        success: "Data refreshed!",
        error: "Failed to refresh",
      }
    );
  };

  // Handle export
  const handleExport = (data: User[], format: "csv" | "json") => {
    console.log(`Exporting ${data.length} users as ${format}`);
  };

  // Handle import
  const handleImport = (data: any[]) => {
    console.log("Importing data:", data);
    toast.success(`Imported ${data.length} records`);
  };

  // Handle cell edit
  const handleCellEdit = (user: User, key: string, newValue: any) => {
    setUsers(
      users.map((u) => (u.id === user.id ? { ...u, [key]: newValue } : u))
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced DataGrid Demo</h1>
          <p className="text-muted-foreground mt-1">
            Explore all the premium features of the DataGrid component
          </p>
        </div>
        <Button onClick={() => toast.success("Add user clicked")} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <DataGrid
        // Data
        data={users}
        columns={columns}
        rowKey="id"

        // Metadata
        title="User Management"
        description="Manage all your users with powerful filtering, sorting, and bulk actions"

        // Core Features
        selectable
        enableRowPinning
        enableColumnPinning
        showStats
        striped

        // Quick Filters
        quickFilters={quickFilters}

        // Actions
        rowActions={rowActions}
        bulkActions={bulkActions}
        contextMenuItems={contextMenuItems}

        // Callbacks
        onRefresh={handleRefresh}
        onExport={handleExport}
        onImport={handleImport}
        onSelectionChange={setSelectedUsers}
        onCellEdit={handleCellEdit}

        // Advanced
        expandedRowRender={expandedRowRender}

        // Configuration
        defaultPageSize={10}
        pageSizes={[5, 10, 25, 50]}
        maxHeight={600}
        presetKey="users-table" // Enable view presets

        // Empty state
        emptyMessage="No users found"
        emptyIcon={<UserPlus className="h-7 w-7" />}

        // Custom toolbar
        toolbar={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded">
              💡 Tip: Try Shift+Click on column headers for multi-sort
            </span>
          </div>
        }
      />

      {/* Info Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl border">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Try These Features:
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✅ Click the star icon to pin rows to top</li>
          <li>✅ Use quick filters for instant filtering</li>
          <li>✅ Press Ctrl+F to focus search</li>
          <li>✅ Shift+Click headers for multi-sort</li>
          <li>✅ Right-click rows for context menu</li>
          <li>✅ Hover rows to see quick actions</li>
          <li>✅ Try column pinning from the Columns menu</li>
          <li>✅ Change density from Compact to Comfortable</li>
          <li>✅ Export to CSV or JSON</li>
          <li>✅ Save custom view presets</li>
        </ul>
      </div>
    </div>
  );
}
