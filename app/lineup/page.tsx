"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useTrip } from "@/lib/hooks/useTrip";
import { useParticipants } from "@/lib/hooks/useParticipants";
import { useAttendance } from "@/lib/hooks/useAttendance";
import { TimelineMatrix } from "@/components/lineup/TimelineMatrix";

export default function LineupPage() {
  const { trip, loading: tripLoading } = useTrip();
  const { participants, loading: participantsLoading } = useParticipants();
  const { attendance, loading: attendanceLoading } = useAttendance();

  const loading = tripLoading || participantsLoading || attendanceLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Lineup</h1>
        <Card className="animate-pulse h-48"><span /></Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Lineup</h1>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">No trip set up yet</p>
            <Link href="/basecamp" className="text-alpine font-medium hover:underline">
              Set up in Basecamp
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-midnight">Lineup</h1>
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-mist">No participants yet — share the link to invite friends</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-midnight">Lineup</h1>

      <Card>
        <TimelineMatrix
          trip={trip}
          participants={participants}
          attendance={attendance}
        />
      </Card>
    </div>
  );
}
