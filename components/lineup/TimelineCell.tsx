"use client";

import { cn } from "@/lib/utils/cn";
import { formatDateShort } from "@/lib/utils/dates";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function TimelineCell({
  isPresent,
  participantColor,
  participantName,
  date,
  isToday,
  onToggle,
}: {
  isPresent: boolean;
  participantColor: string;
  participantName: string;
  date: string;
  isToday: boolean;
  onToggle: () => void;
}) {
  const { locale, t } = useLocale();
  const status = isPresent ? t.lineup.present : t.lineup.absent;
  const dateLabel = formatDateShort(date, locale);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isPresent}
      aria-label={t.lineup.toggle_attendance(participantName, dateLabel, status)}
      className={cn(
        "w-12 h-12 rounded-lg border-2 transition-colors shrink-0",
        !isPresent && isToday && "bg-alpine/5 border-alpine/20",
        !isPresent && !isToday && "bg-white/40 border-mist/20",
      )}
      style={isPresent ? { backgroundColor: participantColor, borderColor: participantColor } : undefined}
    />
  );
}
