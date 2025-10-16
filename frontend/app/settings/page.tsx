"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { APP_NAME } from "@/config/app";
import { usePageTitle } from "@/hooks/use-page-title";

import { DeleteAccountSection } from "./_components/delete-account-section";
import { PasswordSection } from "./_components/password-section";
import { ProfileHeaderSection } from "./_components/profile-header-section";
import { ThemeSection } from "./_components/theme-section";
import { TwoFactorSection } from "./_components/two-factor-section";

export default function SettingsPage() {
  usePageTitle(`Settings - ${APP_NAME}`);
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <ProfileHeaderSection />
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Security</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your security settings and authentication methods
            </p>
          </div>
          <TwoFactorSection />
          <PasswordSection />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Preferences
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize how the application looks and behaves
            </p>
          </div>
          <ThemeSection />
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Irreversible actions that affect your account
            </p>
          </div>
          <DeleteAccountSection />
        </div>
      </div>
    </DashboardLayout>
  );
}
