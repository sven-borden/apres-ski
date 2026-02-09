"use client";

import type { Basecamp } from "@/lib/types";

export function MapEmbed({
  coordinates,
  mapsUrl,
}: {
  coordinates?: Basecamp["coordinates"];
  mapsUrl?: string;
}) {
  if (!coordinates?.lat || !coordinates?.lng) {
    return (
      <div className="w-full h-48 rounded-2xl bg-mist/20 flex items-center justify-center">
        <p className="text-sm text-mist">No location set</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full h-48 rounded-2xl overflow-hidden">
        <iframe
          title="Chalet location"
          src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-alpine hover:text-alpine/80 font-medium transition-colors"
        >
          Open in Maps
        </a>
      )}
    </div>
  );
}
