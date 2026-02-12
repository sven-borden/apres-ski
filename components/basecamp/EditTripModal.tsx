"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateTrip } from "@/lib/actions/trip";
import { seedMeals } from "@/lib/actions/meals";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { inputClass, inputErrorClass } from "@/lib/utils/styles";
import type { Trip } from "@/lib/types";

export function EditTripModal({
  isOpen,
  onClose,
  trip,
  existingMealDates,
}: {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  existingMealDates?: string[];
}) {
  const [name, setName] = useState(trip?.name ?? "");
  const [startDate, setStartDate] = useState(trip?.startDate ?? "");
  const [endDate, setEndDate] = useState(trip?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [orphanCount, setOrphanCount] = useState(0);
  const { user } = useUser();
  const { t } = useLocale();

  function setFieldError(field: string, error: string | null) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[field] = error;
      } else {
        delete next[field];
      }
      return next;
    });
  }

  function validateName() {
    if (!name.trim()) {
      setFieldError("name", t.validation.required_field);
    } else {
      setFieldError("name", null);
    }
  }

  function validateStartDate() {
    if (!startDate) {
      setFieldError("startDate", t.validation.required_field);
    } else {
      setFieldError("startDate", null);
    }
  }

  function validateEndDate() {
    if (!endDate) {
      setFieldError("endDate", t.validation.required_field);
    } else if (startDate && endDate < startDate) {
      setFieldError("endDate", t.validation.invalid_date_range);
    } else {
      setFieldError("endDate", null);
    }
  }

  function validateAll(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = t.validation.required_field;
    if (!startDate) errors.startDate = t.validation.required_field;
    if (!endDate) {
      errors.endDate = t.validation.required_field;
    } else if (startDate && endDate < startDate) {
      errors.endDate = t.validation.invalid_date_range;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  async function doSave() {
    setSaving(true);
    setError(null);
    try {
      await updateTrip({ name: name.trim(), startDate, endDate }, user?.id ?? "anonymous");
      await seedMeals(startDate, endDate);
      onClose();
    } catch {
      setError(t.errors.save_failed);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;

    // Check if editing an existing trip would orphan assigned meals
    if (trip && existingMealDates && existingMealDates.length > 0) {
      const orphaned = existingMealDates.filter((d) => d < startDate || d > endDate);
      if (orphaned.length > 0) {
        setOrphanCount(orphaned.length);
        setShowDateWarning(true);
        return;
      }
    }

    await doSave();
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
            onBlur={validateName}
            placeholder={t.trip.placeholder_name}
            maxLength={200}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "trip-name-error" : undefined}
            className={fieldErrors.name ? inputErrorClass : inputClass}
          />
          {fieldErrors.name && (
            <p id="trip-name-error" role="alert" className="mt-1 text-sm text-red-600">
              {fieldErrors.name}
            </p>
          )}
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
              onBlur={validateStartDate}
              aria-invalid={!!fieldErrors.startDate}
              aria-describedby={fieldErrors.startDate ? "trip-start-date-error" : undefined}
              className={fieldErrors.startDate ? inputErrorClass : inputClass}
            />
            {fieldErrors.startDate && (
              <p id="trip-start-date-error" role="alert" className="mt-1 text-sm text-red-600">
                {fieldErrors.startDate}
              </p>
            )}
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
              onBlur={validateEndDate}
              aria-invalid={!!fieldErrors.endDate}
              aria-describedby={fieldErrors.endDate ? "trip-end-date-error" : undefined}
              className={fieldErrors.endDate ? inputErrorClass : inputClass}
            />
            {fieldErrors.endDate && (
              <p id="trip-end-date-error" role="alert" className="mt-1 text-sm text-red-600">
                {fieldErrors.endDate}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t.common.cancel}
          </Button>
          <Button type="submit" disabled={saving || hasFieldErrors} className="flex-1">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDateWarning}
        onClose={() => setShowDateWarning(false)}
        onConfirm={() => doSave()}
        title={t.confirm.trip_dates_title}
        message={t.confirm.trip_dates_message(orphanCount)}
        confirmLabel={t.confirm.confirm_save}
        variant="warn"
      />
    </Modal>
  );
}
