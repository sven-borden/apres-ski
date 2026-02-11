"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateTrip } from "@/lib/actions/trip";
import { seedMeals } from "@/lib/actions/meals";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Trip } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-mist/30 bg-white/50 px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50";

export function EditTripModal({
  isOpen,
  onClose,
  trip,
}: {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}) {
  const [name, setName] = useState(trip?.name ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const { t } = useLocale();

  const isValid =
    name.trim().length > 0 && startDate && endDate && startDate <= endDate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    try {
      await updateTrip({ name: name.trim(), startDate, endDate });
      await seedMeals(startDate, endDate);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trip ? t.trip.edit_trip : t.trip.set_up_trip}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="trip-name" className="block text-sm font-medium text-midnight mb-1.5">
            {t.trip.trip_name}
          </label>
          <input
            id="trip-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.trip.placeholder_name}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="trip-start-date" className="block text-sm font-medium text-midnight mb-1.5">
              {t.trip.start_date}
            </label>
            <input
              id="trip-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="trip-end-date" className="block text-sm font-medium text-midnight mb-1.5">
              {t.trip.end_date}
            </label>
            <input
              id="trip-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={saving || !isValid} className="flex-1">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
