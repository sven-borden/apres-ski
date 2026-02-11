"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { useTrip } from "@/lib/hooks/useTrip";
import { MapEmbed } from "@/components/basecamp/MapEmbed";
import { AddressBlock } from "@/components/basecamp/AddressBlock";
import { EssentialsGrid } from "@/components/basecamp/EssentialsGrid";
import { EditBasecampModal } from "@/components/basecamp/EditBasecampModal";
import { EditTripModal } from "@/components/basecamp/EditTripModal";
import { formatDateShort } from "@/lib/utils/dates";

export default function BasecampPage() {
  const { basecamp, loading: basecampLoading } = useBasecamp();
  const { trip, loading: tripLoading } = useTrip();
  const [editBasecampOpen, setEditBasecampOpen] = useState(false);
  const [editTripOpen, setEditTripOpen] = useState(false);

  const loading = basecampLoading || tripLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Basecamp</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">Basecamp</h1>

      {/* Trip section */}
      {trip ? (
        <Card>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-midnight">Trip</h2>
            <button
              onClick={() => setEditTripOpen(true)}
              className="text-xs text-alpine font-medium hover:underline"
            >
              Edit
            </button>
          </div>
          <p className="text-lg font-semibold text-midnight">{trip.name}</p>
          <p className="text-sm text-mist">
            {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-4 space-y-3">
            <p className="text-mist">No trip set up yet</p>
            <Button onClick={() => setEditTripOpen(true)}>Set Up Trip</Button>
          </div>
        </Card>
      )}

      {/* Chalet section */}
      {basecamp ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-midnight">{basecamp.name || "Chalet"}</h2>
            <Button variant="secondary" onClick={() => setEditBasecampOpen(true)}>
              Edit
            </Button>
          </div>

          <MapEmbed coordinates={basecamp.coordinates} mapsUrl={basecamp.mapsUrl} />

          {basecamp.address && (
            <Card>
              <h2 className="text-sm font-semibold text-midnight mb-2">Address</h2>
              <AddressBlock address={basecamp.address} />
            </Card>
          )}

          <EssentialsGrid basecamp={basecamp} />

          {basecamp.notes && (
            <Card>
              <h2 className="text-sm font-semibold text-midnight mb-2">Notes</h2>
              <p className="text-sm text-midnight/80 whitespace-pre-line">
                {basecamp.notes}
              </p>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-4 space-y-3">
            <p className="text-mist">No chalet info yet</p>
            <Button onClick={() => setEditBasecampOpen(true)}>Set Up Basecamp</Button>
          </div>
        </Card>
      )}

      <EditTripModal
        isOpen={editTripOpen}
        onClose={() => setEditTripOpen(false)}
        trip={trip ?? null}
      />
      <EditBasecampModal
        isOpen={editBasecampOpen}
        onClose={() => setEditBasecampOpen(false)}
        basecamp={basecamp ?? null}
      />
    </div>
  );
}
