"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { TimelineMatrix } from "@/components/rostrum/TimelineMatrix";
import { EditTripModal } from "@/components/rostrum/EditTripModal";

export default function RostrumPage() {
  const { trip, loading: tripLoading } = useTrip();
  const { participants, loading: participantsLoading } = useParticipants();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const [editOpen, setEditOpen] = useState(false);

  const loading = tripLoading || participantsLoading || attendanceLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Rostrum</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Rostrum</h1>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">No trip set up yet</p>
            <Button onClick={() => setEditOpen(true)}>Set Up Trip</Button>
          </div>
        </Card>
        <EditTripModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          trip={null}
        />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-midnight">Rostrum</h1>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit Trip
          </Button>
        </div>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">No participants yet — share the link to invite friends</p>
          </div>
        </Card>
        <EditTripModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          trip={trip}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-midnight">Rostrum</h1>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          Edit Trip
        </Button>
      </div>

      <Card>
        <TimelineMatrix
          trip={trip}
          participants={participants}
          attendance={attendance}
        />
      </Card>

      <EditTripModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        trip={trip}
      />
    </div>
  );
}
