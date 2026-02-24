"use client";

export function MountainBackdrop() {
  return (
    <div
      className="fixed inset-0 -z-5 pointer-events-none"
      aria-hidden="true"
    >
      <svg
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far range — tall, dramatic alpine peaks */}
        <path
          d="M0 900 L0 580 L90 520 L150 400 L210 500 L280 440 L340 330 L400 470 L470 410 L530 350 L580 430 L650 370 L700 330 L760 450 L830 390 L890 360 L960 430 L1030 350 L1100 420 L1170 380 L1240 340 L1310 410 L1380 440 L1440 390 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.25)"
        />
        {/* Mid range — angular medium peaks */}
        <path
          d="M0 900 L0 660 L80 630 L150 550 L220 610 L300 530 L370 580 L440 500 L510 560 L580 490 L650 540 L720 480 L790 530 L860 500 L940 520 L1010 480 L1080 530 L1150 490 L1230 540 L1300 510 L1370 550 L1440 520 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.35)"
        />
        {/* Near range — angular foothills */}
        <path
          d="M0 900 L0 730 L100 710 L170 660 L240 700 L320 650 L400 690 L470 640 L550 680 L630 640 L710 660 L790 630 L870 670 L950 650 L1030 680 L1110 640 L1190 670 L1270 650 L1350 680 L1440 660 L1440 900 Z"
          fill="rgba(203, 213, 225, 0.45)"
        />
      </svg>
    </div>
  );
}
