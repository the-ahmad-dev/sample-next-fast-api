import { Brain, FileText, Search, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { APP_NAME } from "@/config/app";
import { ANIMATIONS, DIMENSIONS } from "@/constants/ui";

const features = [
  {
    icon: Search,
    title: "Analyze with AI",
    description: `${APP_NAME} analyzes complex accounting data with AI to make information business decisions and drive growth.`,
  },
  {
    icon: TrendingUp,
    title: "Actionable insight",
    description:
      "Get actionable insights, identify trends and forecast future performance by harnessing the power of machine learning.",
  },
  {
    icon: FileText,
    title: "Any dataset",
    description:
      "Integrate with your current accounting systems like Xero, use any dataset you have or upload files.",
  },
  {
    icon: Brain,
    title: "Domain Specific Models",
    description:
      "Accounting specific trained language models that accurately interpret and analyze financial data, identify errors and provide expert-level insights.",
  },
];

export function FeatureCards() {
  return (
    <section className="py-16 lg:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`border-border bg-card ${ANIMATIONS.HOVER_SHADOW} ${ANIMATIONS.TRANSITION_DEFAULT}`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto w-16 h-16 bg-primary/10 ${DIMENSIONS.RADIUS_SM} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
