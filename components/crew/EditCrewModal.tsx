"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { getInitials } from "@/lib/utils/colors";
import type { Participant } from "@/lib/types";

export function EditCrewModal({
  isOpen,
  onClose,
  participant,
}: {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
}) {
  const [name, setName] = useState(participant.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(participant.name);
    }
  }, [isOpen, participant.name]);

  const initials = getInitials(name);
  const canSubmit = name.trim().length >= 2 && name.trim() !== participant.name && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      const db = getDb();
      const trimmed = name.trim();
      await updateDoc(doc(db, "participants", participant.id), {
        name: trimmed,
        avatar: getInitials(trimmed),
        updatedAt: serverTimestamp(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Crew Member">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="edit-crew-name"
            className="block text-sm font-medium text-midnight mb-1.5"
          >
            Name
          </label>
          <input
            id="edit-crew-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter their name"
            className="w-full rounded-xl border border-mist/30 bg-powder px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50"
            autoFocus
          />
        </div>

        {initials && (
          <div className="flex items-center gap-3">
            <Avatar initials={initials} color={participant.color} size="lg" />
            <span className="text-sm text-mist">Preview</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit} className="flex-1">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
