"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddCrewModal } from "@/components/crew/AddCrewModal";
import { EditCrewModal } from "@/components/crew/EditCrewModal";
import { TimelineMatrix } from "@/components/lineup/TimelineMatrix";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useTrip } from "@/lib/hooks/useTrip";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Participant } from "@/lib/types";

export default function CrewPage() {
  const { participants, loading: pLoading } = useParticipants();
  const { trip, loading: tLoading } = useTrip();
  const { attendance, loading: aLoading } = useAttendance();
  const { basecamp, loading: bLoading } = useBasecamp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const { t } = useLocale();

  const loading = pLoading || tLoading || aLoading || bLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-midnight">{t.crew.title}</h1>
          <Button onClick={() => setShowAdd(true)}>+ {t.common.add}</Button>
        </div>
        <Card className="animate-pulse h-48"><span /></Card>
        <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-midnight">{t.crew.title}</h1>
          <Button onClick={() => setShowAdd(true)}>+ {t.common.add}</Button>
        </div>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">{t.crew.no_trip}</p>
            <Link href="/basecamp" className="text-alpine font-medium hover:underline">
              {t.crew.set_up_in_basecamp}
            </Link>
          </div>
        </Card>
        <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-midnight">{t.crew.title}</h1>
          <Button onClick={() => setShowAdd(true)}>+ {t.common.add}</Button>
        </div>
        <Card>
          <p className="text-center py-8 text-mist">
            {t.crew.no_members}
          </p>
        </Card>
        <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-midnight">{t.crew.title}</h1>
        <Button onClick={() => setShowAdd(true)}>+ {t.common.add}</Button>
      </div>

      <Card>
        <TimelineMatrix
          trip={trip}
          participants={participants}
          attendance={attendance}
          capacity={basecamp?.capacity ?? null}
          onEditParticipant={setEditing}
        />
      </Card>

      <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      {editing && (
        <EditCrewModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          participant={editing}
        />
      )}
    </div>
  );
}
