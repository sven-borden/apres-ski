"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MemberDialog, type MemberDraft } from "@/components/crew/member-dialog";
import { useTrip, useParticipants, useAttendance, useBasecamp } from "@/lib/hooks/data";
import { addParticipant, editParticipant, setAttendance } from "@/lib/actions";
import { useLocalUser, makeAvatar } from "@/lib/user";
import { tripDays, todayISO } from "@/lib/trip-utils";
import type { ParticipantRecord } from "@/lib/pb/types";

const fmtWeekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const fmtDayNum = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const key = (pid: string, date: string) => `${pid}__${date}`;

function CheckIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function AlertIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M12 9v4m0 3.5h.01M10.3 4.3 2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PlusIcon({ className = "size-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function CapacityBadge({ count, capacity, today }: { count: number; capacity: number; today: boolean }) {
  const over = capacity > 0 && count > capacity;
  const full = capacity > 0 && count === capacity;
  const tone = over ? "bg-danger/15 text-danger" : full ? "bg-warn/15 text-warn" : "text-ink-muted";
  return (
    <span className={`nums inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone} ${today ? "ring-1 ring-accent/40" : ""}`}>
      {over && <AlertIcon className="size-3.5" />}
      {count}/{capacity || "–"}
    </span>
  );
}

export function CrewBoard() {
  const trip = useTrip();
  const participantsQ = useParticipants();
  const attendanceQ = useAttendance();
  const basecamp = useBasecamp();
  const me = useLocalUser();

  const [memberOpen, setMemberOpen] = useState(false);
  const [editing, setEditing] = useState<ParticipantRecord | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [confirm, setConfirm] = useState<{ p: ParticipantRecord; date: string } | null>(null);
  const [overlay, setOverlay] = useState<Map<string, boolean>>(new Map());

  const roster = participantsQ.data ?? [];
  const days = trip.data ? tripDays(trip.data.startDate, trip.data.endDate) : [];
  const today = todayISO();
  const capacity = basecamp.data?.capacity || roster.length || 0;

  const serverPresent = useMemo(() => {
    const s = new Set<string>();
    for (const a of attendanceQ.data ?? []) if (a.present) s.add(key(a.participantId, a.date));
    return s;
  }, [attendanceQ.data]);

  function isPresent(pid: string, date: string) {
    const k = key(pid, date);
    return overlay.has(k) ? overlay.get(k)! : serverPresent.has(k);
  }
  function headcount(date: string) {
    return roster.reduce((n, p) => n + (isPresent(p.id, date) ? 1 : 0), 0);
  }

  async function applyToggle(p: ParticipantRecord, date: string, present: boolean) {
    const k = key(p.id, date);
    setOverlay((m) => new Map(m).set(k, present));
    try {
      await setAttendance(p.id, date, present);
    } finally {
      await attendanceQ.refresh();
      setOverlay((m) => {
        const n = new Map(m);
        n.delete(k);
        return n;
      });
    }
  }

  function onToggle(p: ParticipantRecord, date: string, present: boolean) {
    if (!present) return applyToggle(p, date, true); // marking present is instant
    if (p.id === me?.id) return applyToggle(p, date, false); // toggling yourself: no friction
    setConfirm({ p, date }); // marking someone else absent: confirm
  }

  function openMember(p: ParticipantRecord | null) {
    setEditing(p);
    setDialogKey((k) => k + 1);
    setMemberOpen(true);
  }

  async function saveMember(draft: MemberDraft, editingId: string | null) {
    if (editingId) {
      await editParticipant(editingId, { name: draft.name, color: draft.color, avatar: makeAvatar(draft.name) });
    } else {
      await addParticipant({ name: draft.name, color: draft.color, avatar: makeAvatar(draft.name), tripId: trip.data?.id });
    }
    setMemberOpen(false);
    setEditing(null);
    participantsQ.refresh();
  }

  if (!trip.data && !trip.loading) {
    return (
      <EmptyState title="Pas encore de séjour" body="Crée d’abord le séjour : il définit les jours du tableau de présence." action={<Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-on-accent shadow-sm hover:brightness-105">Configurer le séjour</Link>} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Équipe</h1>
          <p className="text-ink-muted">Qui est là, jour par jour. Touche une case pour basculer la présence.</p>
        </div>
        <Button onClick={() => openMember(null)}><PlusIcon /> Ajouter</Button>
      </header>

      {roster.length === 0 ? (
        <EmptyState title="Aucun membre pour l’instant" body="Ajoute l’équipe du chalet — chacun choisit son prénom et sa couleur." action={<Button onClick={() => openMember(null)}><PlusIcon /> Ajouter un membre</Button>} />
      ) : (
        <>
          <section className="w-fit max-w-full overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface" role="region" aria-label="Tableau de présence" tabIndex={0}>
            <table className="table-fixed border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 top-0 z-30 w-[6.5rem] border-b border-r border-border bg-surface-2 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] sm:w-44 sm:px-4">Équipe</th>
                  {days.map((d) => {
                    const date = new Date(d + "T00:00:00");
                    const isToday = d === today;
                    return (
                      <th key={d} scope="col" className={`sticky top-0 z-20 w-14 border-b border-border px-1 py-2.5 text-center sm:w-20 ${isToday ? "bg-accent/12 text-accent-ink" : "bg-surface-2 text-ink"}`}>
                        <span className="block text-[11px] font-medium capitalize text-ink-muted">{fmtWeekday.format(date).replace(".", "")}</span>
                        <span className="nums block font-[family-name:var(--font-display)] text-base font-bold">{fmtDayNum.format(date)}</span>
                        {isToday && <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide text-accent-ink">Auj.</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="sticky left-0 z-10 w-[6.5rem] border-b-2 border-r border-border bg-surface px-3 py-2.5 text-xs font-semibold text-ink-muted shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] sm:w-44 sm:px-4">Présents</th>
                  {days.map((d) => (
                    <td key={d} className={`border-b-2 border-border px-2 py-2.5 text-center ${d === today ? "bg-accent/[0.06]" : ""}`}>
                      <CapacityBadge count={headcount(d)} capacity={capacity} today={d === today} />
                    </td>
                  ))}
                </tr>
                {roster.map((p) => {
                  const you = p.id === me?.id;
                  return (
                    <tr key={p.id} className="group/row">
                      <th scope="row" className="sticky left-0 z-10 w-[6.5rem] border-b border-r border-border bg-surface px-2.5 py-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] group-hover/row:bg-surface-2 sm:w-44 sm:px-3">
                        <button onClick={() => openMember(p)} className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] py-1 pr-2 text-left transition-colors duration-[var(--t-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={`Modifier ${p.name}`}>
                          <Avatar name={p.name} color={p.color} size={28} you={you} />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold leading-tight">{p.name}</span>
                            {you && <span className="text-[11px] font-medium text-accent-ink">vous</span>}
                          </span>
                        </button>
                      </th>
                      {days.map((d) => {
                        const present = isPresent(p.id, d);
                        const long = fmtLong.format(new Date(d + "T00:00:00"));
                        return (
                          <td key={d} className={`border-b border-border text-center ${d === today ? "bg-accent/[0.06]" : ""}`}>
                            <button onClick={() => onToggle(p, d, present)} aria-pressed={present} aria-label={`${p.name}, ${long} : ${present ? "présent·e" : "absent·e"}. ${present ? "Marquer absent·e" : "Marquer présent·e"}`} className="group/cell grid size-11 place-items-center">
                              <span className={`grid size-7 place-items-center rounded-[var(--radius-sm)] transition-all duration-[var(--t-fast)] ease-[var(--ease-out)] group-active/cell:scale-90 ${present ? "text-on-accent shadow-sm" : "border-2 border-dashed border-border group-hover/cell:border-accent/60 group-hover/cell:bg-accent/5"}`} style={present ? { background: p.color } : undefined}>
                                {present && <CheckIcon className="size-4" />}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
          <Legend capacity={capacity} />
        </>
      )}

      <MemberDialog key={dialogKey} open={memberOpen} editing={editing} onClose={() => { setMemberOpen(false); setEditing(null); }} onSave={saveMember} />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm ? `Marquer ${confirm.p.name} comme absent·e ?` : ""}
        body={confirm ? `${fmtLong.format(new Date(confirm.date + "T00:00:00"))} — tu modifies la présence de quelqu’un d’autre.` : ""}
        confirmLabel="Marquer absent·e"
        onConfirm={() => { if (confirm) applyToggle(confirm.p, confirm.date, false); setConfirm(null); }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function Legend({ capacity }: { capacity: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-ink-muted">
      <span className="flex items-center gap-1.5"><span className="grid size-5 place-items-center rounded-[var(--radius-sm)] bg-ink-muted text-bg"><CheckIcon className="size-3" /></span>présent·e (couleur du membre)</span>
      <span className="flex items-center gap-1.5"><span className="size-5 rounded-[var(--radius-sm)] border-2 border-dashed border-border" />absent·e</span>
      <span className="flex items-center gap-1.5"><AlertIcon className="size-3.5 text-danger" />au-delà de {capacity || "?"} couchages</span>
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Équipe</h1>
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-accent/12 text-accent-ink"><PlusIcon className="size-6" /></span>
        <div className="flex max-w-sm flex-col gap-1.5"><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-ink-muted">{body}</p></div>
        {action}
      </div>
    </div>
  );
}
