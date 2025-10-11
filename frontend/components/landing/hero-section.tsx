import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COMPONENT_CLASSES, DIMENSIONS, SPACING } from "@/constants/ui";

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
              <Button size="lg" className={COMPONENT_CLASSES.BUTTON_PRIMARY}>
                Start free trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={COMPONENT_CLASSES.BUTTON_SECONDARY}
              >
                Book a demo
              </Button>
            </div>
          </div>

          {/* Right Column - Chat Demo */}
          <div className="relative">
            {/* Xero Integration Icon */}
            <div className="absolute top-0 right-8 z-10">
              <div className="bg-card rounded-full p-4 shadow-sample-sm border border-border">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    XERO
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`bg-card ${DIMENSIONS.RADIUS_FULL} shadow-sample ${SPACING.CARD_PADDING} space-y-4 border border-border`}
            >
              {/* Question */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"></div>
                </div>
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-tl-sm px-6 py-4 max-w-xs">
                  <p className="text-sm font-medium">
                    What were the total sales and net profits for the quarter
                    ending December 31, 2024?
                  </p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
                  <div
                    className={`${SPACING.ICON_SIZE_LG} text-primary-foreground font-bold`}
                  >
                    M
                  </div>
                </div>
                <div className="bg-muted border border-border rounded-2xl rounded-tl-sm px-6 py-4 shadow-sample-sm flex-1">
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
              <div className="flex gap-2 pl-13">
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
            <div className="absolute bottom-4 right-0 z-10">
              <div className="bg-card rounded-full p-3 shadow-sample-sm border border-border">
                <div
                  className={`w-12 h-12 bg-muted ${DIMENSIONS.RADIUS_SM} flex items-center justify-center`}
                >
                  <div
                    className={`${SPACING.ICON_SIZE_LG} bg-accent rounded`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
