"use client";

import { useEffect, useState } from "react";

import { Footer } from "@/components/landing/footer";
import { Navigation } from "@/components/landing/navigation";
import { APP_NAME } from "@/config/app";
import { usePageTitle } from "@/hooks/use-page-title";

import { BookDemo } from "./components/book-demo";
import { ChatFiles } from "./components/chat-files";
import { ChatXero } from "./components/chat-xero";
import { ConnectXero } from "./components/connect-xero";
import { ContactSupport } from "./components/contact-support";
import { DataFlow } from "./components/data-flow";
import { FAQs } from "./components/faqs";
import { GettingStarted } from "./components/getting-started";
import { TableOfContents } from "./components/table-of-contents";

export default function SupportPage() {
  usePageTitle(`Support & Documentation - ${APP_NAME}`);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const sections = [
    { id: "getting-started", title: "Getting Started" },
    { id: "connect-xero", title: "Connect to Xero" },
    { id: "chat-xero", title: "Chat with Xero Data" },
    { id: "chat-files", title: "Chat with Files" },
    { id: "data-flow", title: "Data Flow" },
    { id: "faqs", title: "FAQs" },
    { id: "book-demo", title: "Book a Demo" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Support & Documentation
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about using {APP_NAME}
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <TableOfContents
              sections={sections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
            <div className="flex-1 space-y-16">
              <GettingStarted />
              <ConnectXero />
              <ChatXero />
              <ChatFiles />
              <DataFlow />
              <FAQs />
              <BookDemo />
              <ContactSupport />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
