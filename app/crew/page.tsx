"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { AddCrewModal } from "@/components/crew/AddCrewModal";
import { useParticipants } from "@/lib/hooks/useParticipants";

export default function CrewPage() {
  const { participants, loading } = useParticipants();
  const [showAdd, setShowAdd] = useState(false);

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

  const sorted = [...participants].sort((a, b) => {
    const aTime = a.joinedAt?.toMillis?.() ?? 0;
    const bTime = b.joinedAt?.toMillis?.() ?? 0;
    return aTime - bTime;
  });

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
                <span className="text-sm font-medium text-midnight">{p.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AddCrewModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
