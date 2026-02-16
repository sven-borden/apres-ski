"use client";

import Snowfall from "react-snowfall";

export function SnowOverlay() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <Snowfall
        snowflakeCount={40}
        radius={[0.5, 2.5]}
        speed={[0.3, 1.5]}
        wind={[-0.5, 1]}
        color="rgba(255, 255, 255, 0.7)"
      />
    </div>
  );
}
