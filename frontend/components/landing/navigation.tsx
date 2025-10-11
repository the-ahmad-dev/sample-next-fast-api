"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/app";
import { COMPONENT_CLASSES, LANDING_STYLES, SPACING } from "@/constants/ui";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-muted border-b border-border h-14 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-sample-blue">
                {APP_NAME}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="#security" className={LANDING_STYLES.NAV_LINK}>
                Security
              </Link>
              <Link href="#faqs" className={LANDING_STYLES.NAV_LINK}>
                FAQs
              </Link>
              <button className={LANDING_STYLES.NAV_LINK}>Book a Demo</button>
              <Link href="/support" className={LANDING_STYLES.NAV_LINK}>
                Support
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signup">
              <Button className={COMPONENT_CLASSES.BUTTON_PRIMARY}>
                Start free trial
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className={COMPONENT_CLASSES.BUTTON_SECONDARY}
              >
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className={COMPONENT_CLASSES.BUTTON_GHOST}
            >
              {isOpen ? (
                <X className={SPACING.ICON_SIZE} />
              ) : (
                <Menu className={SPACING.ICON_SIZE} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-muted border-t border-border">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link href="#security" className={LANDING_STYLES.NAV_LINK_MOBILE}>
              Security
            </Link>
            <Link href="#faqs" className={LANDING_STYLES.NAV_LINK_MOBILE}>
              FAQs
            </Link>
            <button
              className={`${LANDING_STYLES.NAV_LINK_MOBILE} w-full text-left`}
            >
              Book a Demo
            </button>
            <Link href="/support" className={LANDING_STYLES.NAV_LINK_MOBILE}>
              Support
            </Link>
            <div className="pt-4 pb-3 border-t border-border space-y-3">
              <Link href="/signup">
                <Button
                  className={`${COMPONENT_CLASSES.BUTTON_PRIMARY} w-full`}
                >
                  Start free trial
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className={`${COMPONENT_CLASSES.BUTTON_SECONDARY} w-full`}
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
