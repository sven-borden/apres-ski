"use client";

export function LiteHero({
  tripName,
  countdownText,
}: {
  tripName: string | null;
  countdownText: string | null;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
      <h1 className="text-xl font-bold text-midnight">
        {tripName ?? "Apres-Ski"}
      </h1>
      {countdownText && (
        <p className="text-sm text-mist">{countdownText}</p>
      )}
    </div>
  );
}
