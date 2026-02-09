export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCountdownText(startDate: string, endDate: string): string {
  const today = new Date(`${getTodayString()}T00:00:00`);
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (today < start) {
    const diff = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff === 1 ? "1 day until the trip!" : `${diff} days until the trip!`;
  }

  if (today > end) {
    return "Hope you had fun!";
  }

  const dayNum =
    Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  const totalDays =
    Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return `Day ${dayNum} of ${totalDays}`;
}
