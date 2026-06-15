"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { CopyButton } from "@/components/copy-button";
import { TripEditor, type TripDraft } from "@/components/basecamp/trip-editor";
import { BasecampEditor } from "@/components/basecamp/basecamp-editor";
import { osmEmbedUrl, type Basecamp } from "@/lib/basecamp";
import { useTrip, useBasecamp, useMeals } from "@/lib/hooks/data";
import { saveTrip, saveBasecamp } from "@/lib/actions";
import { useLocalUser } from "@/lib/user";
import type { BasecampRecord } from "@/lib/pb/types";

const fmtDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const arr = <T,>(v: T[] | "" | undefined | null): T[] => (Array.isArray(v) ? v : []);

function formatRange(startISO: string, endISO: string) {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  return `${fmtDate.format(start)} – ${fmtDate.format(end)} ${end.getFullYear()}`;
}

function emptyBasecamp(): Basecamp {
  return {
    name: "",
    address: "",
    coordinates: { lat: 46.0817, lng: 7.2336 },
    mapsUrl: "",
    wifi: { network: "", password: "" },
    checkIn: "",
    checkOut: "",
    capacity: 0,
    emergencyContacts: [],
    notes: "",
    tricountUrl: "",
  };
}

function toBasecamp(rec: BasecampRecord): Basecamp {
  return {
    name: rec.name ?? "",
    address: rec.address ?? "",
    coordinates: rec.coordinates || { lat: 46.0817, lng: 7.2336 },
    mapsUrl: rec.mapsUrl ?? "",
    wifi: rec.wifi || { network: "", password: "" },
    checkIn: rec.checkIn ?? "",
    checkOut: rec.checkOut ?? "",
    capacity: rec.capacity ?? 0,
    emergencyContacts: arr(rec.emergencyContacts),
    notes: rec.notes ?? "",
    tricountUrl: rec.tricountUrl ?? "",
  };
}

export function BasecampScreen() {
  const tripQ = useTrip();
  const basecampQ = useBasecamp();
  const mealsQ = useMeals();
  const me = useLocalUser();
  const [tripOpen, setTripOpen] = useState(false);
  const [campOpen, setCampOpen] = useState(false);
  const [tripKey, setTripKey] = useState(0);
  const [campKey, setCampKey] = useState(0);

  function openTrip() {
    setTripKey((k) => k + 1);
    setTripOpen(true);
  }
  function openCamp() {
    setCampKey((k) => k + 1);
    setCampOpen(true);
  }

  const trip: TripDraft | null = tripQ.data
    ? { name: tripQ.data.name, startISO: tripQ.data.startDate, endISO: tripQ.data.endDate }
    : null;
  const basecamp: Basecamp | null = basecampQ.data ? toBasecamp(basecampQ.data) : null;
  const assignedMealDates = arr(mealsQ.data)
    .filter((m) => arr(m.responsibleIds).length > 0)
    .map((m) => m.date);

  const blankTrip: TripDraft = trip ?? { name: "", startISO: "", endISO: "" };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Le chalet</h1>

      {/* Séjour */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Séjour</SectionHeading>
        {trip ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-surface px-5 py-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold">{trip.name}</p>
              <p className="nums text-ink-muted">{formatRange(trip.startISO, trip.endISO)}</p>
            </div>
            <Button variant="secondary" onClick={openTrip}>
              <EditIcon /> Modifier
            </Button>
          </div>
        ) : (
          <Setup label="Configurer le séjour" onClick={openTrip} />
        )}
      </section>

      {/* Chalet */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionHeading>Chalet</SectionHeading>
          {basecamp && (
            <Button variant="secondary" onClick={openCamp}>
              <EditIcon /> Modifier
            </Button>
          )}
        </div>

        {!basecamp ? (
          <Setup label="Configurer le chalet" onClick={openCamp} />
        ) : (
          <div className="flex flex-col gap-5">
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">{basecamp.name}</p>

            {/* Map */}
            <figure className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface-2">
                <iframe
                  title={`Carte — ${basecamp.name}`}
                  src={osmEmbedUrl(basecamp.coordinates)}
                  loading="lazy"
                  className="block aspect-[16/10] w-full sm:aspect-[21/9]"
                />
              </div>
              <figcaption className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex items-start gap-2 whitespace-pre-line text-sm text-ink-muted">
                  <PinIcon className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                  {basecamp.address || "non renseigné"}
                </p>
                <a
                  href={basecamp.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-accent-ink hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ouvrir dans Plans <ExternalIcon className="size-3.5" />
                </a>
              </figcaption>
            </figure>

            {/* Essentials */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Panel title="Wi-Fi" icon={<WifiIcon />}>
                <WifiBody wifi={basecamp.wifi} />
              </Panel>
              <Panel title="Horaires" icon={<ClockIcon />}>
                <dl className="flex flex-col gap-2 text-sm">
                  <Row term="Arrivée" desc={basecamp.checkIn} />
                  <Row term="Départ" desc={basecamp.checkOut} />
                  <Row term="Couchages" desc={`${basecamp.capacity}`} />
                </dl>
              </Panel>
            </div>

            {/* Emergency contacts */}
            <Panel title="Contacts d’urgence" icon={<PhoneIcon />}>
              {basecamp.emergencyContacts.length === 0 ? (
                <NotConfigured />
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {basecamp.emergencyContacts.map((c, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{c.name}</span>
                        {c.role && <span className="text-xs text-ink-muted">{c.role}</span>}
                      </span>
                      <a
                        href={`tel:${c.phone.replace(/\s+/g, "")}`}
                        className="nums inline-flex shrink-0 items-center gap-2 rounded-full bg-accent/12 px-3.5 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <PhoneIcon className="size-4" />
                        {c.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Tricount — only when set */}
            {basecamp.tricountUrl && (
              <a
                href={basecamp.tricountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex items-center gap-3">
                  <SplitIcon className="size-5 text-accent-ink" />
                  <span>
                    <span className="block font-semibold">Dépenses partagées</span>
                    <span className="block text-sm text-ink-muted">Régler les comptes sur Tricount</span>
                  </span>
                </span>
                <ExternalIcon className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
              </a>
            )}

            {/* Notes */}
            <Panel title="Notes" icon={<NoteIcon />}>
              {basecamp.notes ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{basecamp.notes}</p>
              ) : (
                <NotConfigured />
              )}
            </Panel>
          </div>
        )}
      </section>

      <TripEditor
        key={`trip-${tripKey}`}
        open={tripOpen}
        initial={blankTrip}
        assignedMealDates={assignedMealDates}
        onClose={() => setTripOpen(false)}
        onSave={async (d) => {
          await saveTrip({ name: d.name, startDate: d.startISO, endDate: d.endISO, updatedBy: me?.id });
          setTripOpen(false);
          tripQ.refresh();
          mealsQ.refresh();
        }}
      />
      <BasecampEditor
        key={`camp-${campKey}`}
        open={campOpen}
        initial={basecamp ?? emptyBasecamp()}
        onClose={() => setCampOpen(false)}
        onSave={async (b) => {
          await saveBasecamp({ ...b, updatedBy: me?.id });
          setCampOpen(false);
          basecampQ.refresh();
        }}
      />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
        <span className="text-accent-ink">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ term, desc }: { term: string; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{term}</dt>
      <dd className={desc ? "font-medium" : "text-ink-muted"}>{desc || "non renseigné"}</dd>
    </div>
  );
}

function WifiBody({ wifi }: { wifi: { network: string; password: string } }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-ink-muted">Réseau</p>
          <p className="truncate font-medium">{wifi.network || "non renseigné"}</p>
        </div>
        {wifi.network && <CopyButton value={wifi.network} label="le réseau" />}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-ink-muted">Mot de passe</p>
          <p className="truncate font-medium font-mono tracking-tight">
            {wifi.password ? (show ? wifi.password : "•".repeat(Math.min(wifi.password.length, 12))) : "non renseigné"}
          </p>
        </div>
        {wifi.password && (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              aria-pressed={show}
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <CopyButton value={wifi.password} label="le mot de passe" />
          </div>
        )}
      </div>
    </div>
  );
}

function NotConfigured() {
  return <p className="text-sm text-ink-muted">non renseigné</p>;
}

function Setup({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-12 text-center">
      <p className="text-sm text-ink-muted">Rien ici pour l’instant.</p>
      <Button onClick={onClick}>{label}</Button>
    </div>
  );
}

/* Icons */
const ic = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
type IP = { className?: string };
function EditIcon({ className = "size-4" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z" /><path d="M13.5 6.5l3 3" /></svg>;
}
function PinIcon({ className }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}
function WifiIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10 10 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="0.6" fill="currentColor" /></svg>;
}
function ClockIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
}
function PhoneIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 6a2 2 0 0 1 2-2Z" /></svg>;
}
function NoteIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h5" /></svg>;
}
function SplitIcon({ className }: IP) {
  return <svg {...ic} className={className} aria-hidden><circle cx="7" cy="7" r="3" /><circle cx="17" cy="17" r="3" /><path d="M14 7h6M4 17h6" /></svg>;
}
function ExternalIcon({ className }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M14 5h5v5M19 5l-8 8M11 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" /></svg>;
}
function EyeIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function EyeOffIcon({ className = "size-[18px]" }: IP) {
  return <svg {...ic} className={className} aria-hidden><path d="M4 4l16 16M9.5 9.6A3 3 0 0 0 14.4 14.5M6.5 6.7C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4-.9M10 5.7A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.3 3.1" /></svg>;
}
