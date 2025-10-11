"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, Settings } from "lucide-react";

import { useUser } from "@/contexts/user-context";
import { clearToken } from "@/lib/token";

export function ProfileDropdown() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-accent rounded-sm px-2 py-2 transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-sm shadow-sample z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-base font-medium text-foreground truncate">
              {user.full_name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <div className="py-2">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
