"use client";

import type { Basecamp } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function MapEmbed({
  coordinates,
  mapsUrl,
}: {
  coordinates?: Basecamp["coordinates"];
  mapsUrl?: string;
}) {
  const { t } = useLocale();

  if (!coordinates?.lat || !coordinates?.lng) {
    return (
      <div className="w-full h-48 rounded-2xl bg-mist/20 flex items-center justify-center">
        <p className="text-sm text-mist">{t.basecamp.no_location}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full h-48 rounded-2xl overflow-hidden">
        <iframe
          title={t.basecamp.chalet_location}
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
          {t.basecamp.open_in_maps}
        </a>
      )}
    </div>
  );
}
