"use client";

import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import type { Basecamp } from "@/lib/types";

export function QuickActions({
  basecamp,
}: {
  basecamp: Basecamp | null;
}) {
  if (!basecamp) return null;

  const hasNavigate = !!basecamp.mapsUrl;
  const hasWifi = !!basecamp.wifi?.network;

  if (!hasNavigate && !hasWifi) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {hasNavigate && (
        <Card>
          <a
            href={basecamp.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-alpine/10 flex items-center justify-center text-alpine shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z" />
                  <circle cx="10" cy="8" r="2" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-midnight">
                  Navigate to Chalet
                </p>
                {basecamp.address && (
                  <p className="text-xs text-mist truncate">
                    {basecamp.address}
                  </p>
                )}
              </div>
            </div>
          </a>
        </Card>
      )}
      {hasWifi && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pine/10 flex items-center justify-center text-pine shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7a14 14 0 0 1 16 0M5 10.5a9 9 0 0 1 10 0M8 14a4 4 0 0 1 4 0" />
                <circle cx="10" cy="17" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-midnight">WiFi</p>
              <p className="text-xs text-mist">{basecamp.wifi.network}</p>
              {basecamp.wifi.password && (
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-powder px-1.5 py-0.5 rounded text-midnight">
                    {basecamp.wifi.password}
                  </code>
                  <CopyButton text={basecamp.wifi.password} label="Copy" />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
