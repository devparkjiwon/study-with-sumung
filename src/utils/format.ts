/**
 * Format total seconds into HH:MM:SS
 */
export function formatTimeHMS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format total seconds into Korean text: e.g. "1시간 23분 45초" or "5분 20초" or "18초"
 */
export function formatKoreanDuration(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}초`);

  return parts.join(' ');
}

/**
 * Get local date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display: "2026.10.12 (월)"
 */
export function formatDateKorean(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = days[date.getDay()];
    return `${y}.${m.toString().padStart(2, '0')}.${d.toString().padStart(2, '0')} (${dayName})`;
  } catch {
    return dateStr;
  }
}

/**
 * Format ISO timestamp to HH:mm:ss
 */
export function formatTimestampTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  } catch {
    return '--:--:--';
  }
}
