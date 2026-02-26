import AdminSidebar from "@/components/layouts/AdminSidebar";
import AdminMainContent from "@/components/layouts/AdminMainContent";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminMainContent>{children}</AdminMainContent>
      <Toaster />
    </div>
  );
}
