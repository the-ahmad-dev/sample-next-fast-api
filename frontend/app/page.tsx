import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample project",
  description: " A sample project using Next.js, Tailwind CSS, and TypeScript.",
  keywords: ["Sample", "Project"],
};

export default function HomePage() {
  return <div className="min-h-screen bg-background">hello world</div>;
}
