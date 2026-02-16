"use client";

import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { RevealField } from "@/components/ui/RevealField";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Basecamp } from "@/lib/types";

export function EssentialsGrid({ basecamp }: { basecamp: Basecamp }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <WifiCard wifi={basecamp.wifi} />
      <ScheduleCard checkIn={basecamp.checkIn} checkOut={basecamp.checkOut} capacity={basecamp.capacity} />
      <TricountCard tricountUrl={basecamp.tricountUrl} />
      <EmergencyCard contacts={basecamp.emergencyContacts} />
    </div>
  );
}

function WifiCard({ wifi }: { wifi?: Basecamp["wifi"] }) {
  const { t } = useLocale();
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">{t.basecamp.wifi}</h3>
      {wifi?.network ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-midnight/80">{wifi.network}</span>
            <CopyButton text={wifi.network} />
          </div>
          {wifi.password && (
            <RevealField label={t.basecamp.password} value={wifi.password} copyable />
          )}
        </div>
      ) : (
        <p className="text-sm text-mist">{t.basecamp.not_configured}</p>
      )}
    </Card>
  );
}

function ScheduleCard({
  checkIn,
  checkOut,
  capacity,
}: {
  checkIn?: string;
  checkOut?: string;
  capacity?: number;
}) {
  const { t } = useLocale();
  const hasInfo = checkIn || checkOut || (capacity && capacity > 0);
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">{t.basecamp.schedule}</h3>
      {hasInfo ? (
        <div className="space-y-1">
          {checkIn && (
            <p className="text-sm text-midnight/80">
              <span className="font-medium">{t.basecamp.check_in}:</span> {checkIn}
            </p>
          )}
          {checkOut && (
            <p className="text-sm text-midnight/80">
              <span className="font-medium">{t.basecamp.check_out}:</span> {checkOut}
            </p>
          )}
          {capacity != null && capacity > 0 && (
            <p className="text-sm text-midnight/80">
              <span className="font-medium">{t.basecamp.capacity}:</span> {t.basecamp.capacity_beds(capacity)}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-mist">{t.basecamp.not_configured}</p>
      )}
    </Card>
  );
}

function TricountCard({ tricountUrl }: { tricountUrl?: string }) {
  const { t } = useLocale();
  if (!tricountUrl) return null;
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">Tricount</h3>
      <a
        href={tricountUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-alpine hover:text-alpine/80 font-medium transition-colors"
      >
        {t.basecamp.open_tricount}
        <span aria-hidden="true">&rarr;</span>
      </a>
    </Card>
  );
}

function EmergencyCard({
  contacts,
}: {
  contacts?: Basecamp["emergencyContacts"];
}) {
  const { t } = useLocale();
  return (
    <Card>
      <h3 className="text-sm font-semibold text-midnight mb-2">
        {t.basecamp.emergency_contacts}
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
        <p className="text-sm text-mist">{t.basecamp.no_emergency_contacts}</p>
      )}
    </Card>
  );
}
