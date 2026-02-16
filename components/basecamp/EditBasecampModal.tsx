"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateBasecamp } from "@/lib/actions/basecamp";
import { useUser } from "@/components/providers/UserProvider";
import { trackBasecampSaved } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Basecamp } from "@/lib/types";
import { inputClass, inputErrorClass } from "@/lib/utils/styles";
import type { Translations } from "@/lib/i18n/locales/fr";

interface FormState {
  name: string;
  address: string;
  coordinatesText: string;
  mapsUrl: string;
  wifiNetwork: string;
  wifiPassword: string;
  checkIn: string;
  checkOut: string;
  capacity: string;
  emergencyContacts: { name: string; phone: string; role: string }[];
  notes: string;
  tricountUrl: string;
}

function basecampToForm(b: Basecamp | null): FormState {
  if (!b) {
    return {
      name: "",
      address: "",
      coordinatesText: "",
      mapsUrl: "",
      wifiNetwork: "",
      wifiPassword: "",
      checkIn: "",
      checkOut: "",
      capacity: "",
      emergencyContacts: [],
      notes: "",
      tricountUrl: "",
    };
  }
  return {
    name: b.name || "",
    address: b.address || "",
    coordinatesText:
      b.coordinates?.lat && b.coordinates?.lng
        ? `${b.coordinates.lat}, ${b.coordinates.lng}`
        : "",
    mapsUrl: b.mapsUrl || "",
    wifiNetwork: b.wifi?.network || "",
    wifiPassword: b.wifi?.password || "",
    checkIn: b.checkIn || "",
    checkOut: b.checkOut || "",
    capacity: b.capacity ? String(b.capacity) : "",
    emergencyContacts: b.emergencyContacts?.length
      ? [...b.emergencyContacts]
      : [],
    notes: b.notes || "",
    tricountUrl: b.tricountUrl || "",
  };
}

function parseCoordinates(
  text: string,
): { lat: number; lng: number } | null {
  const parts = text.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

function validateCoordinates(
  text: string,
  v: Translations["validation"],
): string | null {
  if (!text.trim()) return null; // optional field
  const parsed = parseCoordinates(text);
  if (!parsed) return v.invalid_coordinates;
  if (parsed.lat < -90 || parsed.lat > 90) return v.latitude_range;
  if (parsed.lng < -180 || parsed.lng > 180) return v.longitude_range;
  return null;
}

export function EditBasecampModal({
  isOpen,
  onClose,
  basecamp,
}: {
  isOpen: boolean;
  onClose: () => void;
  basecamp: Basecamp | null;
}) {
  const [form, setForm] = useState<FormState>(() => basecampToForm(basecamp));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingRemoveContactIndex, setPendingRemoveContactIndex] = useState<number | null>(null);
  const { user } = useUser();
  const { t } = useLocale();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
    if (!form.name.trim()) {
      setFieldError("name", t.validation.required_field);
    } else {
      setFieldError("name", null);
    }
  }

  function validateCoords() {
    const err = validateCoordinates(form.coordinatesText, t.validation);
    setFieldError("coordinates", err);
  }

  function validateAll(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) {
      errors.name = t.validation.required_field;
    }
    const coordErr = validateCoordinates(form.coordinatesText, t.validation);
    if (coordErr) {
      errors.coordinates = coordErr;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function addContact() {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: "", phone: "", role: "" },
      ],
    }));
  }

  function removeContact(index: number) {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  }

  function updateContact(
    index: number,
    field: "name" | "phone" | "role",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      ),
    }));
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;

    setSaving(true);
    setError(null);
    try {
      const coords = parseCoordinates(form.coordinatesText);
      await updateBasecamp(
        {
          name: form.name.trim(),
          address: form.address,
          coordinates: coords ?? { lat: 0, lng: 0 },
          mapsUrl: form.mapsUrl,
          wifi: { network: form.wifiNetwork, password: form.wifiPassword },
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          capacity: form.capacity ? parseInt(form.capacity, 10) : 0,
          emergencyContacts: form.emergencyContacts.filter(
            (c) => c.name || c.phone,
          ),
          notes: form.notes,
          tricountUrl: form.tricountUrl.trim(),
        },
        user?.id ?? "anonymous",
      );
      trackBasecampSaved(!basecamp);
      onClose();
    } catch {
      setError(t.errors.save_failed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.basecamp.edit_basecamp}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chalet Name */}
        <Field id="basecamp-name" label={t.basecamp.chalet_name} error={fieldErrors.name}>
          <input
            id="basecamp-name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={validateName}
            placeholder={t.basecamp.placeholder_chalet}
            maxLength={200}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "basecamp-name-error" : undefined}
            className={fieldErrors.name ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Address */}
        <Field id="basecamp-address" label={t.basecamp.address}>
          <textarea
            id="basecamp-address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={t.basecamp.placeholder_address}
            maxLength={500}
            className={inputClass}
            rows={2}
          />
        </Field>

        {/* Coordinates */}
        <Field id="basecamp-coordinates" label={t.basecamp.coordinates} hint={t.basecamp.coordinates_hint} error={fieldErrors.coordinates}>
          <input
            id="basecamp-coordinates"
            type="text"
            value={form.coordinatesText}
            onChange={(e) => update("coordinatesText", e.target.value)}
            onBlur={validateCoords}
            placeholder={t.basecamp.placeholder_coordinates_example}
            maxLength={200}
            aria-invalid={!!fieldErrors.coordinates}
            aria-describedby={fieldErrors.coordinates ? "basecamp-coordinates-error" : undefined}
            className={fieldErrors.coordinates ? inputErrorClass : inputClass}
          />
        </Field>

        {/* Maps URL */}
        <Field id="basecamp-maps-url" label={t.basecamp.maps_url}>
          <input
            id="basecamp-maps-url"
            type="text"
            value={form.mapsUrl}
            onChange={(e) => update("mapsUrl", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            maxLength={500}
            className={inputClass}
          />
        </Field>

        {/* WiFi */}
        <Field id="basecamp-wifi-network" label={t.basecamp.wifi_network}>
          <input
            id="basecamp-wifi-network"
            type="text"
            value={form.wifiNetwork}
            onChange={(e) => update("wifiNetwork", e.target.value)}
            placeholder={t.basecamp.placeholder_network}
            maxLength={200}
            className={inputClass}
          />
        </Field>
        <Field id="basecamp-wifi-password" label={t.basecamp.wifi_password}>
          <input
            id="basecamp-wifi-password"
            type="password"
            value={form.wifiPassword}
            onChange={(e) => update("wifiPassword", e.target.value)}
            placeholder={t.basecamp.placeholder_password}
            maxLength={200}
            className={inputClass}
          />
        </Field>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="basecamp-check-in" label={t.basecamp.check_in}>
            <input
              id="basecamp-check-in"
              type="time"
              value={form.checkIn}
              onChange={(e) => update("checkIn", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="basecamp-check-out" label={t.basecamp.check_out}>
            <input
              id="basecamp-check-out"
              type="time"
              value={form.checkOut}
              onChange={(e) => update("checkOut", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Capacity */}
        <Field id="basecamp-capacity" label={t.basecamp.capacity} hint={t.basecamp.capacity_hint}>
          <input
            id="basecamp-capacity"
            type="number"
            min="0"
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            placeholder="8"
            className={inputClass}
          />
        </Field>

        {/* Emergency Contacts */}
        <fieldset>
          <legend className="block text-sm font-medium text-midnight mb-1.5">
            {t.basecamp.emergency_contacts}
          </legend>
          <div className="space-y-3">
            {form.emergencyContacts.map((contact, i) => (
              <div key={i} className="space-y-2 rounded-xl bg-white/30 p-3">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(i, "name", e.target.value)}
                  placeholder={t.basecamp.placeholder_contact_name}
                  aria-label={`${t.basecamp.placeholder_contact_name} ${i + 1}`}
                  maxLength={200}
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(i, "phone", e.target.value)}
                  placeholder={t.basecamp.placeholder_phone}
                  aria-label={`${t.basecamp.placeholder_phone} ${i + 1}`}
                  maxLength={50}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => updateContact(i, "role", e.target.value)}
                  placeholder={t.basecamp.placeholder_role}
                  aria-label={`${t.basecamp.placeholder_role} ${i + 1}`}
                  maxLength={200}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setPendingRemoveContactIndex(i)}
                  className="text-sm text-spritz hover:text-spritz/80 font-medium"
                >
                  {t.basecamp.remove_contact}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addContact}
            className="mt-2 text-sm text-alpine hover:text-alpine/80 font-medium"
          >
            {t.basecamp.add_contact}
          </button>
        </fieldset>

        {/* Notes */}
        <Field id="basecamp-notes" label={t.basecamp.notes}>
          <textarea
            id="basecamp-notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder={t.basecamp.placeholder_notes}
            maxLength={1000}
            className={inputClass}
            rows={3}
          />
        </Field>

        {/* Tricount URL */}
        <Field id="basecamp-tricount-url" label={t.basecamp.tricount_url}>
          <input
            id="basecamp-tricount-url"
            type="url"
            value={form.tricountUrl}
            onChange={(e) => update("tricountUrl", e.target.value)}
            placeholder={t.basecamp.placeholder_tricount_url}
            maxLength={500}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            disabled={saving || hasFieldErrors}
            className="flex-1"
          >
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={pendingRemoveContactIndex !== null}
        onClose={() => setPendingRemoveContactIndex(null)}
        onConfirm={() => {
          if (pendingRemoveContactIndex !== null) removeContact(pendingRemoveContactIndex);
        }}
        title={t.confirm.remove_contact_title}
        message={t.confirm.remove_contact_message}
        confirmLabel={t.confirm.confirm_remove}
      />
    </Modal>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-midnight mb-1.5">
        {label}
        {hint && (
          <span className="font-normal text-mist ml-1">({hint})</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
