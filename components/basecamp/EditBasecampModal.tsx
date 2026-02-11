"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { updateBasecamp } from "@/lib/actions/basecamp";
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
        "anonymous",
      );
      onClose();
    } catch (err) {
      console.error("Failed to save basecamp:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Basecamp">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Chalet Name */}
        <Field label="Chalet Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Chalet Les Étoiles"
            className={inputClass}
          />
        </Field>

        {/* Address */}
        <Field label="Address">
          <textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Mountain Rd, Verbier"
            className={inputClass}
            rows={2}
          />
        </Field>

        {/* Coordinates */}
        <Field label="Coordinates" hint="lat, lng (e.g. 46.096, 7.228)">
          <input
            type="text"
            value={form.coordinatesText}
            onChange={(e) => update("coordinatesText", e.target.value)}
            placeholder="46.096, 7.228"
            className={inputClass}
          />
        </Field>

        {/* Maps URL */}
        <Field label="Maps URL">
          <input
            type="text"
            value={form.mapsUrl}
            onChange={(e) => update("mapsUrl", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            className={inputClass}
          />
        </Field>

        {/* WiFi */}
        <Field label="WiFi Network">
          <input
            type="text"
            value={form.wifiNetwork}
            onChange={(e) => update("wifiNetwork", e.target.value)}
            placeholder="Network name"
            className={inputClass}
          />
        </Field>
        <Field label="WiFi Password">
          <input
            type="text"
            value={form.wifiPassword}
            onChange={(e) => update("wifiPassword", e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
        </Field>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in">
            <input
              type="text"
              value={form.checkIn}
              onChange={(e) => update("checkIn", e.target.value)}
              placeholder="16:00"
              className={inputClass}
            />
          </Field>
          <Field label="Check-out">
            <input
              type="text"
              value={form.checkOut}
              onChange={(e) => update("checkOut", e.target.value)}
              placeholder="10:00"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Capacity */}
        <Field label="Capacity" hint="number of beds">
          <input
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
            Access Codes
          </legend>
          <div className="space-y-2">
            {form.accessCodes.map((code, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={code.label}
                  onChange={(e) => updateAccessCode(i, "label", e.target.value)}
                  placeholder="Label"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={code.code}
                  onChange={(e) => updateAccessCode(i, "code", e.target.value)}
                  placeholder="Code"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeAccessCode(i)}
                  className="shrink-0 text-sm text-spritz hover:text-spritz/80 font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addAccessCode}
            className="mt-2 text-sm text-alpine hover:text-alpine/80 font-medium"
          >
            + Add code
          </button>
        </fieldset>

        {/* Emergency Contacts */}
        <fieldset>
          <legend className="block text-sm font-medium text-midnight mb-1.5">
            Emergency Contacts
          </legend>
          <div className="space-y-3">
            {form.emergencyContacts.map((contact, i) => (
              <div key={i} className="space-y-2 rounded-xl bg-white/30 p-3">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(i, "name", e.target.value)}
                  placeholder="Name"
                  className={inputClass}
                />
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(i, "phone", e.target.value)}
                  placeholder="Phone"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => updateContact(i, "role", e.target.value)}
                  placeholder="Role (e.g. Owner, Caretaker)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-sm text-spritz hover:text-spritz/80 font-medium"
                >
                  Remove contact
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addContact}
            className="mt-2 text-sm text-alpine hover:text-alpine/80 font-medium"
          >
            + Add contact
          </button>
        </fieldset>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Parking info, house rules, etc."
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-midnight mb-1.5">
        {label}
        {hint && (
          <span className="font-normal text-mist ml-1">({hint})</span>
        )}
      </label>
      {children}
    </div>
  );
}
