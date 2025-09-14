"use client";

import { OpenAPI } from "@/app/client";

if (typeof window !== "undefined") {
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
  OpenAPI.TOKEN = localStorage.getItem("access_token") || "";
}
