import { format, isToday, isYesterday, isThisYear } from "date-fns";

/** WhatsApp-style: Today = time only, Yesterday = "Yesterday, 2:34 PM", older = "15/02/24, 2:34 PM" */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const timeStr = format(date, "h:mm a");
  if (isToday(date)) return timeStr;
  if (isYesterday(date)) return `Yesterday, ${timeStr}`;
  if (isThisYear(date)) return `${format(date, "dd/MM/yy")}, ${timeStr}`;
  return `${format(date, "dd/MM/yyyy")}, ${timeStr}`;
}

export function formatShortTime(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isThisYear(date)) return format(date, "dd/MM/yy");
  return format(date, "dd/MM/yyyy");
}

export function shouldShowDateSeparator(
  currentTs: number,
  previousTs?: number
): boolean {
  if (!previousTs) return true;
  const curr = new Date(currentTs);
  const prev = new Date(previousTs);
  return (
    curr.getDate() !== prev.getDate() ||
    curr.getMonth() !== prev.getMonth() ||
    curr.getFullYear() !== prev.getFullYear()
  );
}

/** WhatsApp-style date separators: Today, Yesterday, or date */
export function formatDateSeparator(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisYear(date)) return format(date, "dd MMMM");
  return format(date, "dd MMMM, yyyy");
}
