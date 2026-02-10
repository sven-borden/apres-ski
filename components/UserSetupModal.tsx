"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PARTICIPANT_COLORS, getInitials } from "@/lib/utils/colors";

export function UserSetupModal({
  onSave,
}: {
  onSave: (user: { name: string; color: string; avatar: string }) => void;
}) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(PARTICIPANT_COLORS[0].hex);

  const initials = getInitials(name);
  const canSubmit = name.trim().length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSave({ name: name.trim(), color: selectedColor, avatar: initials });
  }

  return (
    <Modal isOpen title="Join the Trip">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="user-name"
            className="block text-sm font-medium text-midnight mb-1.5"
          >
            Your Name
          </label>
          <input
            id="user-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
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

        <Button type="submit" disabled={!canSubmit} className="w-full">
          Join Trip
        </Button>
      </form>
    </Modal>
  );
}
