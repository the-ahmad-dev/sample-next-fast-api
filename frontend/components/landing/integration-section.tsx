import { DIMENSIONS, SPACING } from "@/constants/ui";
import { Check, FileText, Loader2 } from "lucide-react";

export function IntegrationSection() {
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Upload files or Integrate with your Accounting tool.
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Easily upload your accounting data or seamlessly connect with Xero
              to streamline your financial management.
              <br />
              <br />
              Our team is constantly working on new integrations with popular
              accounting platforms and tools, exciting additions coming soon.
            </p>
          </div>

          {/* Right Column - Visual Demo */}
          <div className="relative">
            {/* File List */}
            <div
              className={`bg-card border border-border ${DIMENSIONS.RADIUS_FILE_DROP} shadow-sample ${SPACING.CARD_PADDING} space-y-4 mb-6`}
            >
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FileText
                    className={`${SPACING.ICON_SIZE} text-foreground`}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Sydney co. 2024 invoices.xls
                  </span>
                </div>
                <Check className={`${SPACING.ICON_SIZE} text-green-500`} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FileText
                    className={`${SPACING.ICON_SIZE} text-foreground`}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Breeze - Sales (Aug 2024).pdf
                  </span>
                </div>
                <Check className={`${SPACING.ICON_SIZE} text-green-500`} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText
                    className={`${SPACING.ICON_SIZE} text-muted-foreground`}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    Fit Bit - Budget (2024).xlsx
                  </span>
                </div>
                <Loader2
                  className={`${SPACING.ICON_SIZE} text-primary animate-spin`}
                />
              </div>
            </div>

            {/* Integration Icons */}
            <div className="flex justify-center items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-sample-sm">
                <span className="text-primary-foreground font-bold text-sm">
                  XERO
                </span>
              </div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div
                className={`w-16 h-16 bg-accent ${DIMENSIONS.RADIUS_SM} flex items-center justify-center shadow-sample-sm`}
              >
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
