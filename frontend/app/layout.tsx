"use client";

import { usePathname } from "next/navigation";
import type React from "react";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import "./init";

const publicPages = ["/", "/integrations", "/support"];

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Check if current route is a public page
  const isPublicPage = publicPages.some(
    (route) => route === pathname || pathname.startsWith(`${route}/`)
  );

  if (isPublicPage) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    );
  }
};

export default RootLayout;
