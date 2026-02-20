"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 animate-pulse">
          <span className="text-2xl font-bold text-primary-foreground">CRM</span>
        </div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
