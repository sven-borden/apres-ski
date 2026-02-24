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
          d="M0 900 L0 510 L60 480 L130 430 L200 390 L270 450 L330 500 L400 480 L460 420 L520 330 L580 410 L650 490 L720 510 L780 470 L840 400 L880 360 L940 430 L1010 480 L1080 510 L1140 460 L1200 390 L1250 350 L1310 420 L1370 470 L1440 450 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.25)"
        />
        {/* Mid range — angular medium peaks */}
        <path
          d="M0 900 L0 600 L80 580 L160 560 L250 530 L350 500 L420 540 L500 580 L580 570 L660 530 L750 480 L830 520 L920 590 L1000 570 L1060 530 L1100 490 L1160 520 L1240 570 L1320 560 L1440 540 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.35)"
        />
        {/* Near range — angular foothills */}
        <path
          d="M0 900 L0 710 L100 700 L200 680 L300 640 L370 670 L450 700 L550 690 L680 660 L800 630 L880 660 L960 700 L1060 690 L1150 660 L1200 650 L1280 680 L1360 700 L1440 690 L1440 900 Z"
          fill="rgba(203, 213, 225, 0.45)"
        />
      </svg>
    </div>
  );
}
