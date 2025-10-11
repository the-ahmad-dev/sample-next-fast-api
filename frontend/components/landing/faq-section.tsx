import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APP_NAME } from "@/config/app";
import { DIMENSIONS } from "@/constants/ui";

const faqs = [
  {
    question: `What is ${APP_NAME}?`,
    answer: `${APP_NAME} is your AI-powered accounting assistant, built to make accounting insights instant and effortless. Seamlessly integrated with Xero, ${APP_NAME} lets you ask questions about your finances and get fast, accurate answers—turning complex data into clear, actionable insights for smarter decisions.`,
  },
  {
    question: "How does it work?",
    answer: `${APP_NAME} syncs directly with your accounting data from Xero, transforming numbers into insights on demand. Just ask ${APP_NAME} a question, and our powerful AI dives into your data to deliver fast, accurate answers. It's like having an accounting expert at your fingertips, ready to simplify your financials and keep your business on track.`,
  },
  {
    question: "What type of accounting data can the tool analyze?",
    answer: `${APP_NAME} currently syncs with Xero for instant insights into your financial data. You can also upload PDFs and business docs to unlock insights fast. And we're not stopping there—soon, ${APP_NAME} will support even more accounting platforms to power up your data like never before!`,
  },
  {
    question: "Is there a free trial?",
    answer: `Yes, ${APP_NAME} offers a free 14-day trial, allowing you to experience its full range of features without any commitment.`,
  },
  {
    question: `How does ${APP_NAME} ensure data security and privacy?`,
    answer: `${APP_NAME} is built with enterprise-grade security, delivering robust, industry-standard protection for your data. We prioritize your privacy—our AI provides insights without any training on your data, ensuring that your information stays private, secure, and fully protected at all times.`,
  },
];

export function FAQSection() {
  return (
    <section id="faqs" className="py-16 lg:py-20 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className={`bg-card ${DIMENSIONS.RADIUS_SM} border border-border px-6 py-2`}
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
