"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { RevealField } from "@/components/ui/RevealField";
import type { Basecamp } from "@/lib/types";

export function QuickInfoCard({ basecamp }: { basecamp: Basecamp }) {
  return (
    <Card>
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-midnight">Chalet Essentials</h3>

        {/* WiFi */}
        {basecamp.wifi?.network && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-midnight">
                WiFi: <span className="font-mono font-medium">{basecamp.wifi.network}</span>
              </span>
              <CopyButton text={basecamp.wifi.network} label="Copy" />
            </div>
            {basecamp.wifi.password && (
              <RevealField
                label="Password"
                value={basecamp.wifi.password}
                copyable
              />
            )}
          </div>
        )}

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {basecamp.checkIn && (
            <div>
              <p className="text-mist text-[11px]">Check-in</p>
              <p className="font-medium text-midnight">{basecamp.checkIn}</p>
            </div>
          )}
          {basecamp.checkOut && (
            <div>
              <p className="text-mist text-[11px]">Check-out</p>
              <p className="font-medium text-midnight">{basecamp.checkOut}</p>
            </div>
          )}
        </div>

        {/* Capacity */}
        {basecamp.capacity > 0 && (
          <div className="text-sm">
            <span className="text-mist">Capacity:</span>{" "}
            <span className="font-medium text-midnight">{basecamp.capacity}</span>
          </div>
        )}

        {/* Footer link */}
        <Link
          href="/basecamp"
          className="block text-xs font-medium text-alpine hover:text-alpine/80 transition-colors"
        >
          More chalet info &rarr;
        </Link>
      </div>
    </Card>
  );
}
