"use client";

import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { RevealField } from "@/components/ui/RevealField";
import type { Basecamp } from "@/lib/types";

export function EssentialsGrid({ basecamp }: { basecamp: Basecamp }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WifiCard wifi={basecamp.wifi} />
      <ScheduleCard checkIn={basecamp.checkIn} checkOut={basecamp.checkOut} />
      <AccessCodesCard codes={basecamp.accessCodes} />
      <EmergencyCard contacts={basecamp.emergencyContacts} />
    </div>
  );
}

function WifiCard({ wifi }: { wifi?: Basecamp["wifi"] }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">WiFi</h3>
      {wifi?.network ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-midnight/80">{wifi.network}</span>
            <CopyButton text={wifi.network} />
          </div>
          {wifi.password && (
            <RevealField label="Password" value={wifi.password} copyable />
          )}
        </div>
      ) : (
        <p className="text-sm text-mist">Not configured</p>
      )}
    </Card>
  );
}

function ScheduleCard({
  checkIn,
  checkOut,
}: {
  checkIn?: string;
  checkOut?: string;
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">Schedule</h3>
      {checkIn || checkOut ? (
        <div className="space-y-1">
          {checkIn && (
            <p className="text-sm text-midnight/80">
              <span className="font-medium">Check-in:</span> {checkIn}
            </p>
          )}
          {checkOut && (
            <p className="text-sm text-midnight/80">
              <span className="font-medium">Check-out:</span> {checkOut}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-mist">Not configured</p>
      )}
    </Card>
  );
}

function AccessCodesCard({
  codes,
}: {
  codes?: Basecamp["accessCodes"];
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">
        Access Codes
      </h3>
      {codes && codes.length > 0 ? (
        <div className="space-y-2">
          {codes.map((c, i) => (
            <RevealField key={i} label={c.label} value={c.code} copyable />
          ))}
        </div>
      ) : (
        <p className="text-sm text-mist">No access codes</p>
      )}
    </Card>
  );
}

function EmergencyCard({
  contacts,
}: {
  contacts?: Basecamp["emergencyContacts"];
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">
        Emergency Contacts
      </h3>
      {contacts && contacts.length > 0 ? (
        <div className="space-y-2">
          {contacts.map((c, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium text-midnight">{c.name}</p>
              {c.role && <p className="text-mist text-xs">{c.role}</p>}
              <a
                href={`tel:${c.phone}`}
                className="text-alpine hover:text-alpine/80 transition-colors"
              >
                {c.phone}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-mist">No emergency contacts</p>
      )}
    </Card>
  );
}
