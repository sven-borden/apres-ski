"use client";

import { useState, useEffect } from "react";
import { getCountdownData, type CountdownData } from "@/lib/utils/countdown";

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-spritz text-white text-5xl font-black px-5 py-3 rounded-lg shadow-lg min-w-[5rem] text-center tabular-nums">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs font-bold text-white/80 mt-2 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <div className="text-4xl font-black text-white/60 self-start pt-3">:</div>
  );
}

export function LiteHero({
  tripName,
  startDate,
  endDate,
}: {
  tripName: string | null;
  startDate: string | null;
  endDate: string | null;
}) {
  const [data, setData] = useState<CountdownData | null>(() =>
    startDate && endDate ? getCountdownData(startDate, endDate) : null,
  );

  useEffect(() => {
    if (!startDate || !endDate) return;
    const id = setInterval(() => {
      setData(getCountdownData(startDate, endDate));
    }, 60_000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <h1 className="text-xl font-bold text-white drop-shadow-sm">
        {tripName ?? "Apres-Ski"}
      </h1>

      {data?.state === "before" && (
        <>
          <span className="uppercase tracking-widest text-xs font-black text-white/70">
            Launching In
          </span>
          <div className="flex items-start gap-3">
            <CountdownBlock value={data.days} label="Days" />
            <CountdownSeparator />
            <CountdownBlock value={data.hours} label="Hrs" />
          </div>
        </>
      )}

      {data?.state === "during" && (
        <>
          <span className="uppercase tracking-widest text-xs font-black text-white/70">
            On The Mountain
          </span>
          <div className="flex items-start gap-3">
            <CountdownBlock value={data.dayNum} label="Day" />
            <div className="text-4xl font-black text-white/60 self-start pt-3">
              /
            </div>
            <CountdownBlock value={data.totalDays} label="Total" />
          </div>
        </>
      )}

      {data?.state === "after" && (
        <p className="text-sm font-semibold text-white/80">
          Hope you had fun!
        </p>
      )}
    </div>
  );
}
