"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PARTICIPANT_COLORS, getInitials } from "@/lib/utils/colors";

export function AddCrewModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(
    PARTICIPANT_COLORS[0].hex,
  );
  const [saving, setSaving] = useState(false);

  const initials = getInitials(name);
  const canSubmit = name.trim().length >= 2 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      const id = crypto.randomUUID();
      const db = getDb();
      await setDoc(doc(db, "participants", id), {
        id,
        name: name.trim(),
        color: selectedColor,
        avatar: getInitials(name.trim()),
        joinedAt: serverTimestamp(),
        tripId: "",
      });
      setName("");
      setSelectedColor(PARTICIPANT_COLORS[0].hex);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Crew Member">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="crew-name"
            className="block text-sm font-medium text-midnight mb-1.5"
          >
            Name
          </label>
          <input
            id="crew-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter their name"
            className="w-full rounded-xl border border-mist/30 bg-white/50 px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50"
            autoFocus
          />
        </div>

        <div>
          <p className="text-sm font-medium text-midnight mb-2">Pick a Color</p>
          <div className="flex flex-wrap gap-2">
            {PARTICIPANT_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColor(c.hex)}
                className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.hex,
                  outline:
                    selectedColor === c.hex
                      ? "3px solid var(--midnight-slate)"
                      : "2px solid transparent",
                  outlineOffset: "2px",
                }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {initials && (
          <div className="flex items-center gap-3">
            <Avatar initials={initials} color={selectedColor} size="lg" />
            <span className="text-sm text-mist">Preview</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="flex-1"
          >
            {saving ? "Adding..." : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
