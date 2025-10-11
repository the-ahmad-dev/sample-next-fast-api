/**
 * Formatting utilities.
 * Functions for formatting dates, strings, and other data for display.
 */

/**
 * Format date string for display.
 * Shows time by default, hides year if current year.
 */
export const formatDate = (
  dateString: string,
  includeTime: boolean = true
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  return new Intl.DateTimeFormat("en-US", {
    year: isCurrentYear ? undefined : "numeric",
    month: "short",
    day: "numeric",
    ...(includeTime && { hour: "numeric", minute: "numeric" }),
  }).format(date);
};

/**
 * Get initials from user name or email.
 * Returns 2-letter initials from name, or from email if no name.
 */
export const getInitials = (name?: string | null, email?: string): string => {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
    return (first + last).toUpperCase();
  }

  if (email) {
    const local = email.split("@")[0] ?? "";
    return local.slice(0, 2).toUpperCase();
  }

  return "U";
};

/**
 * Check if string is a valid UUID (with or without hyphens).
 */
export const isValidUUID = (uuid: string): boolean => {
  const withHyphens =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const withoutHyphens = /^[0-9a-f]{32}$/i;

  return withHyphens.test(uuid) || withoutHyphens.test(uuid);
};
