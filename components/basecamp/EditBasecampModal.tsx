"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateBasecamp } from "@/lib/actions/basecamp";
import { useUser } from "@/components/providers/UserProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Basecamp } from "@/lib/types";

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
  accessCodes: { label: string; code: string }[];
  emergencyContacts: { name: string; phone: string; role: string }[];
  notes: string;
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
      accessCodes: [],
      emergencyContacts: [],
      notes: "",
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
    accessCodes: b.accessCodes?.length ? [...b.accessCodes] : [],
    emergencyContacts: b.emergencyContacts?.length
      ? [...b.emergencyContacts]
      : [],
    notes: b.notes || "",
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

const inputClass =
  "w-full rounded-xl border border-mist/30 bg-white/50 px-4 py-2.5 text-midnight placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-alpine/50";

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
  const { user } = useUser();
  const { t } = useLocale();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addAccessCode() {
    setForm((prev) => ({
      ...prev,
      accessCodes: [...prev.accessCodes, { label: "", code: "" }],
    }));
  }

  function removeAccessCode(index: number) {
    setForm((prev) => ({
      ...prev,
      accessCodes: prev.accessCodes.filter((_, i) => i !== index),
    }));
  }

  function updateAccessCode(
    index: number,
    field: "label" | "code",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      accessCodes: prev.accessCodes.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      ),
    }));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const coords = parseCoordinates(form.coordinatesText);
      await updateBasecamp(
        {
          name: form.name,
          address: form.address,
          coordinates: coords ?? { lat: 0, lng: 0 },
          mapsUrl: form.mapsUrl,
          wifi: { network: form.wifiNetwork, password: form.wifiPassword },
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          capacity: form.capacity ? parseInt(form.capacity, 10) : 0,
          accessCodes: form.accessCodes.filter((c) => c.label || c.code),
          emergencyContacts: form.emergencyContacts.filter(
            (c) => c.name || c.phone,
          ),
          notes: form.notes,
        },
        user?.id ?? "anonymous",
      );
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
        <Field id="basecamp-name" label={t.basecamp.chalet_name}>
          <input
            id="basecamp-name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t.basecamp.placeholder_chalet}
            className={inputClass}
          />
        </Field>

        {/* Address */}
        <Field id="basecamp-address" label={t.basecamp.address}>
          <textarea
            id="basecamp-address"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={t.basecamp.placeholder_address}
            className={inputClass}
            rows={2}
          />
        </Field>

        {/* Coordinates */}
        <Field id="basecamp-coordinates" label={t.basecamp.coordinates} hint={t.basecamp.coordinates_hint}>
          <input
            id="basecamp-coordinates"
            type="text"
            value={form.coordinatesText}
            onChange={(e) => update("coordinatesText", e.target.value)}
            placeholder={t.basecamp.placeholder_coordinates_example}
            className={inputClass}
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
            className={inputClass}
          />
        </Field>
        <Field id="basecamp-wifi-password" label={t.basecamp.wifi_password}>
          <input
            id="basecamp-wifi-password"
            type="text"
            value={form.wifiPassword}
            onChange={(e) => update("wifiPassword", e.target.value)}
            placeholder={t.basecamp.placeholder_password}
            className={inputClass}
          />
        </Field>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <Field id="basecamp-check-in" label={t.basecamp.check_in}>
            <input
              id="basecamp-check-in"
              type="text"
              value={form.checkIn}
              onChange={(e) => update("checkIn", e.target.value)}
              placeholder={t.basecamp.placeholder_check_in_time}
              className={inputClass}
            />
          </Field>
          <Field id="basecamp-check-out" label={t.basecamp.check_out}>
            <input
              id="basecamp-check-out"
              type="text"
              value={form.checkOut}
              onChange={(e) => update("checkOut", e.target.value)}
              placeholder={t.basecamp.placeholder_check_out_time}
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

        {/* Access Codes */}
        <fieldset>
          <legend className="block text-sm font-medium text-midnight mb-1.5">
            {t.basecamp.access_codes}
          </legend>
          <div className="space-y-2">
            {form.accessCodes.map((code, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={code.label}
                  onChange={(e) => updateAccessCode(i, "label", e.target.value)}
                  placeholder={t.basecamp.placeholder_label}
                  aria-label={`${t.basecamp.placeholder_label} ${i + 1}`}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={code.code}
                  onChange={(e) => updateAccessCode(i, "code", e.target.value)}
                  placeholder={t.basecamp.placeholder_code}
                  aria-label={`${t.basecamp.placeholder_code} ${i + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeAccessCode(i)}
                  className="shrink-0 text-sm text-spritz hover:text-spritz/80 font-medium"
                >
                  {t.common.remove}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAccessCode}
            className="mt-2 text-sm text-alpine hover:text-alpine/80 font-medium"
          >
            {t.basecamp.add_code}
          </button>
        </fieldset>

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
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(i, "phone", e.target.value)}
                  placeholder={t.basecamp.placeholder_phone}
                  aria-label={`${t.basecamp.placeholder_phone} ${i + 1}`}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => updateContact(i, "role", e.target.value)}
                  placeholder={t.basecamp.placeholder_role}
                  aria-label={`${t.basecamp.placeholder_role} ${i + 1}`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeContact(i)}
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
            className={inputClass}
            rows={3}
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
            disabled={saving}
            className="flex-1"
          >
            {saving ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
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
    </div>
  );
}
