import { Suspense } from "react";
import { FeastsScreen } from "@/components/feasts/feasts-screen";

export default function FeastsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-surface" />}>
      <FeastsScreen />
    </Suspense>
  );
}
