"use client";

export function HeroHeader({
  tripName,
  countdownText,
}: {
  tripName: string | null;
  countdownText: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-alpine to-midnight p-6 md:p-8 text-white">
      {/* Mountain silhouette */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <polygon points="0,200 100,80 200,150 300,50 400,120 500,30 600,100 700,60 800,140 800,200" fill="white" />
      </svg>
      <div className="relative">
        <h1 className="text-2xl md:text-3xl font-bold">
          {tripName || "Apres-Ski"}
        </h1>
        {countdownText && (
          <p className="mt-1 text-white/80 text-lg">{countdownText}</p>
        )}
      </div>
    </div>
  );
}
