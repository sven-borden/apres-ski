"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DietaryTag } from "@/components/ui/DietaryTag";
import { claimApero, claimDinner } from "@/lib/actions/meals";

const DIETARY_PRESETS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Pescatarian",
];

const inputClass =
  "w-full rounded-xl border border-mist/30 bg-powder px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50";

export function ClaimModal({
  isOpen,
  onClose,
  section,
  date,
}: {
  isOpen: boolean;
  onClose: () => void;
  section: "apero" | "dinner";
  date: string;
}) {
  const [notes, setNotes] = useState("");
  const [menu, setMenu] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleTag(tag: string) {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function resetForm() {
    setNotes("");
    setMenu("");
    setDietaryTags([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (section === "apero") {
        await claimApero(date, { id: "", name: "anonymous" }, notes.trim());
      } else {
        await claimDinner(
          date,
          { id: "", name: "anonymous" },
          menu.trim(),
          dietaryTags,
        );
      }
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const title = section === "apero" ? "Claim Apero" : "Claim Dinner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {section === "apero" ? (
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What are you bringing?"
              rows={3}
              className={inputClass}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-midnight mb-1.5">
                Menu (optional)
              </label>
              <textarea
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                placeholder="What's on the menu?"
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight mb-1.5">
                Dietary Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_PRESETS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                  >
                    <DietaryTag
                      label={tag}
                      removable={dietaryTags.includes(tag)}
                      onRemove={() => toggleTag(tag)}
                    />
                  </button>
                ))}
              </div>
              {dietaryTags.length > 0 && (
                <p className="mt-2 text-xs text-mist">
                  Selected: {dietaryTags.join(", ")}
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Claiming\u2026" : "Claim"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
