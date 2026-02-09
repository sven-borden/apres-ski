"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useBasecamp } from "@/lib/hooks/useBasecamp";
import { MapEmbed } from "@/components/basecamp/MapEmbed";
import { AddressBlock } from "@/components/basecamp/AddressBlock";
import { EssentialsGrid } from "@/components/basecamp/EssentialsGrid";
import { EditBasecampModal } from "@/components/basecamp/EditBasecampModal";

export default function BasecampPage() {
  const { basecamp, loading } = useBasecamp();
  const [editOpen, setEditOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Basecamp</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!basecamp) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Basecamp</h1>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">No chalet info yet</p>
            <Button onClick={() => setEditOpen(true)}>Set Up Basecamp</Button>
          </div>
        </Card>
        <EditBasecampModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          basecamp={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-midnight">Basecamp</h1>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
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

      <EditBasecampModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        basecamp={basecamp}
      />
    </div>
  );
}
