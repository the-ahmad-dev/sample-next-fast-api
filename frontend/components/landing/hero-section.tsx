import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { COMPONENT_CLASSES, DIMENSIONS } from "@/constants/ui";

export function HeroSection() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Analyze & Manage accounting data with{" "}
              <span className={COMPONENT_CLASSES.TEXT_GRADIENT}>
                Powerful AI
              </span>
              .
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              AI-powered SaaS application designed to revolutionize the way you
              manage and analyze your accounting data. AI empowers businesses by
              providing accurate, timely, and insightful financial analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className={`${COMPONENT_CLASSES.BUTTON_PRIMARY} w-full sm:w-auto`}
                >
                  Start free trial
                </Button>
              </Link>
              <Link href="/support#book-demo">
                <Button
                  variant="outline"
                  size="lg"
                  className={`${COMPONENT_CLASSES.BUTTON_SECONDARY} w-full sm:w-auto`}
                >
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Chat Demo */}
          <div className="relative mt-8 lg:mt-0">
            {/* Xero Integration Icon */}
            <div className="absolute -top-6 right-4 sm:right-8 z-10 hidden sm:block">
              <div className="bg-card rounded-full p-2 sm:p-3 lg:p-4 shadow-sample-sm border border-border">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs sm:text-sm lg:text-base">
                    XERO
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`bg-card ${DIMENSIONS.RADIUS_FULL} shadow-sample p-4 sm:p-5 lg:p-6 space-y-4 border border-border`}
            >
              {/* Question */}
              <div className="flex gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent rounded-full flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
                </div>
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tl-sm px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 max-w-[280px] sm:max-w-xs">
                  <p className="text-sm font-medium">
                    What were the total sales and net profits for the quarter
                    ending December 31, 2024?
                  </p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-base sm:text-lg">
                    M
                  </span>
                </div>
                <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-4 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 shadow-sample-sm flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    According to our financial records, the total sales for the
                    quarter ending December 31, 2024, were{" "}
                    <span className="font-semibold">$1,200,000</span>.
                    <br />
                    <br />
                    As for net profits, we saw a significant improvement, with a
                    net profit of{" "}
                    <span className="font-semibold">$250,000</span> for the
                    quarter ending December 31, 2024.
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col sm:flex-row gap-2 pl-12 sm:pl-12 lg:pl-13">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-muted hover:bg-accent text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Compare to Q4 2023
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-muted hover:bg-accent text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Monthly Cashflow QoQ
                </Button>
              </div>
            </div>

            {/* File Integration Icon */}
            <div className="absolute -bottom-4 right-2 sm:right-0 sm:bottom-4 z-10 hidden sm:block">
              <div className="bg-card rounded-full p-2 sm:p-3 shadow-sample-sm border border-border">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-muted ${DIMENSIONS.RADIUS_SM} flex items-center justify-center`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-accent rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
