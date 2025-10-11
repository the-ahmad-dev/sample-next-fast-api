"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useUser } from "@/contexts/user-context";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
