"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

import { PasswordSection } from "./_components/password-section";
import { ProfileSection } from "./_components/profile-section";
import { ThemeSection } from "./_components/theme-section";
import { TwoFactorSection } from "./_components/two-factor-section";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <ProfileSection />
        <TwoFactorSection />
        <PasswordSection />
        <ThemeSection />
      </div>
    </DashboardLayout>
  );
}
