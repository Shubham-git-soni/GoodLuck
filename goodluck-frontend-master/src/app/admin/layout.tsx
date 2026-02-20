import AdminSidebar from "@/components/layouts/AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="pt-16 lg:pt-0 lg:pl-64">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
