/**
 * Time-aware helpers for event sorting and grouping.
 * All times are Pacific (America/Los_Angeles).
 */

const TZ = "America/Los_Angeles";

/** Get "now" in Pacific time */
export function pacificNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: TZ }),
  );
}

/** Parse an ISO string into a Pacific-aware Date */
export function toPacific(iso: string): Date {
  return new Date(
    new Date(iso).toLocaleString("en-US", { timeZone: TZ }),
  );
}

export type TimeWindow = "now" | "soon" | "tonight" | "tomorrow" | "weekend" | "week" | "future";

/**
 * Classify an event's start time into a time window relative to now.
 */
export function classifyTimeWindow(startsAt: string | undefined | null): TimeWindow {
  if (!startsAt) return "week"; // no time = generic

  const now = pacificNow();
  const start = toPacific(startsAt);
  const diffMs = start.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Already started (up to 4h ago) = happening now
  if (diffHours >= -4 && diffHours <= 0) return "now";

  // Starting within 2 hours
  if (diffHours > 0 && diffHours <= 2) return "soon";

  // Later today (same calendar day)
  if (isSameDay(now, start)) return "tonight";

  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(tomorrow, start)) return "tomorrow";

  // This weekend (Friday 5pm through Sunday 11:59pm)
  if (isThisWeekend(now, start)) return "weekend";

  // Within 7 days
  if (diffHours > 0 && diffHours <= 168) return "week";

  return "future";
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isThisWeekend(now: Date, target: Date): boolean {
  const day = now.getDay(); // 0=Sun, 5=Fri, 6=Sat

  // Find next Friday 5pm
  let fridayStart: Date;
  if (day === 5 && now.getHours() >= 17) {
    // It's Friday evening already
    fridayStart = new Date(now);
    fridayStart.setHours(17, 0, 0, 0);
  } else if (day === 6 || day === 0) {
    // Already the weekend
    fridayStart = new Date(now);
    fridayStart.setDate(fridayStart.getDate() - ((day === 0) ? 2 : 1));
    fridayStart.setHours(17, 0, 0, 0);
  } else {
    // Weekday before Friday
    const daysUntilFriday = 5 - day;
    fridayStart = new Date(now);
    fridayStart.setDate(fridayStart.getDate() + daysUntilFriday);
    fridayStart.setHours(17, 0, 0, 0);
  }

  // Sunday 11:59pm
  const sundayEnd = new Date(fridayStart);
  sundayEnd.setDate(fridayStart.getDate() + (7 - fridayStart.getDay())); // next Sunday
  sundayEnd.setHours(23, 59, 59, 999);

  return target.getTime() >= fridayStart.getTime() && target.getTime() <= sundayEnd.getTime();
}

/**
 * Get a human-friendly time-of-day greeting.
 */
export function getTimeGreeting(): { greeting: string; period: "morning" | "afternoon" | "evening" | "night" } {
  const hour = pacificNow().getHours();
  if (hour < 12) return { greeting: "Good morning", period: "morning" };
  if (hour < 17) return { greeting: "Good afternoon", period: "afternoon" };
  if (hour < 21) return { greeting: "Good evening", period: "evening" };
  return { greeting: "Tonight", period: "night" };
}

/**
 * Get a smart label for the current time context.
 * E.g. "Friday Evening", "Saturday Afternoon", "Monday"
 */
export function getTimePeriodLabel(): string {
  const now = pacificNow();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const hour = now.getHours();

  if (hour >= 17) return `${dayName} Evening`;
  if (hour >= 12) return `${dayName} Afternoon`;
  if (hour >= 6) return `${dayName} Morning`;
  return `Late Night`;
}

/**
 * Format a start time relative to now.
 * E.g. "Happening now", "Starts in 45 min", "Tonight at 8 PM", "Tomorrow at 7 PM"
 */
export function formatRelativeTime(startsAt: string | undefined | null): string {
  if (!startsAt) return "";

  const now = pacificNow();
  const start = toPacific(startsAt);
  const diffMs = start.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));

  if (diffMin >= -240 && diffMin <= 0) return "Happening now";
  if (diffMin > 0 && diffMin <= 60) return `Starts in ${diffMin} min`;
  if (diffMin > 60 && diffMin <= 120) return `Starts in ${Math.round(diffMin / 60)}h`;

  const timeStr = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: start.getMinutes() > 0 ? "2-digit" : undefined,
    hour12: true,
  });

  if (isSameDay(now, start)) return `Tonight at ${timeStr}`;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(tomorrow, start)) return `Tomorrow at ${timeStr}`;

  const dayName = start.toLocaleDateString("en-US", { weekday: "short" });
  return `${dayName} at ${timeStr}`;
}

/**
 * Sort events by start time (soonest first), nulls last.
 */
export function sortByStartTime<T extends { metadata?: { starts_at?: string } | null }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = a.metadata?.starts_at;
    const bTime = b.metadata?.starts_at;
    if (!aTime && !bTime) return 0;
    if (!aTime) return 1;
    if (!bTime) return -1;
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });
}

/**
 * Filter events happening within a time range from now.
 */
export function filterByTimeRange<T extends { metadata?: { starts_at?: string } | null }>(
  items: T[],
  windows: TimeWindow[],
): T[] {
  return items.filter((item) => {
    const w = classifyTimeWindow(item.metadata?.starts_at);
    return windows.includes(w);
  });
}
