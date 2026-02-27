export default function AdminMainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="lg:pl-64 min-h-screen">
      {children}
    </main>
  );
}
