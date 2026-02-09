"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { AddCrewModal } from "@/components/crew/AddCrewModal";
import { EditCrewModal } from "@/components/crew/EditCrewModal";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { sortParticipants } from "@/lib/utils/colors";
import type { Participant } from "@/lib/types";

export default function CrewPage() {
  const { participants, loading } = useParticipants();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-midnight">Crew</h1>
          <Button onClick={() => setShowAdd(true)}>+ Add</Button>
        </div>
        <Card className="animate-pulse h-48"><span /></Card>
        <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
      </div>
    );
  }

  const sorted = sortParticipants(participants);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-midnight">Crew</h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-mist">No one has joined yet</p>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-mist/20">
            {sorted.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar initials={p.avatar} color={p.color} />
                <span className="text-sm font-medium text-midnight flex-1">{p.name}</span>
                <button
                  onClick={() => setEditing(p)}
                  className="text-mist hover:text-alpine transition-colors p-1"
                  aria-label={`Edit ${p.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

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
