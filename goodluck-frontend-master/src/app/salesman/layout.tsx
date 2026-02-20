import MobileNav from "@/components/layouts/MobileNav";

export default function SalesmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <main className="md:pl-64">
        {children}
      </main>
    </div>
  );
}
