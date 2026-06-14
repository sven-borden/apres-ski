"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Basecamp } from "@/lib/types";

function buildGoogleMapsUrl(basecamp: Basecamp): string {
  if (basecamp.mapsUrl) return basecamp.mapsUrl;
  if (basecamp.coordinates?.lat && basecamp.coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${basecamp.coordinates.lat},${basecamp.coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(basecamp.address)}`;
}

export function ChaletSnippet({ basecamp }: { basecamp: Basecamp }) {
  const { t } = useLocale();
  const mapsUrl = buildGoogleMapsUrl(basecamp);

  return (
    <div className="bg-glass backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden flex">
      {/* Left side — info */}
      <div className="flex-1 min-w-0 p-5 space-y-1.5">
        <h3 className="text-sm font-bold text-midnight truncate">
          {basecamp.name || t.hub.chalet}
        </h3>

        {basecamp.address && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-1.5 text-xs text-alpine hover:text-alpine/80 transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <path d="M8 1C5.2 1 3 3.2 3 6c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z" />
              <circle cx="8" cy="6" r="1.5" />
            </svg>
            <span className="line-clamp-2">{basecamp.address}</span>
          </a>
        )}

        {basecamp.checkIn && (
          <p className="text-xs text-mist">
            {t.hub.check_in}: <span className="font-medium text-midnight">{basecamp.checkIn}</span>
          </p>
        )}
      </div>

      {/* Right side — chalet photo, edge-to-edge */}
      <div className="shrink-0 w-1/3 relative">
        <Image
          src="/images/chalet.webp"
          alt={t.hub.chalet}
          fill
          className="object-cover"
          sizes="(min-width: 640px) 144px, 112px"
        />
      </div>
    </div>
  );
}
