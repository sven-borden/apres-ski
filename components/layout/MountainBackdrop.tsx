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
        {/* Far range — soft, tallest peaks */}
        <path
          d="M0 900 L0 620 C60 600 120 520 200 490 C280 460 330 530 400 510 C470 490 510 420 580 400 C650 380 700 440 760 430 C820 420 870 370 940 360 C1010 350 1060 410 1120 400 C1180 390 1220 340 1280 370 C1340 400 1400 450 1440 430 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.25)"
        />
        {/* Mid range — clearly defined */}
        <path
          d="M0 900 L0 680 C80 660 140 600 220 580 C300 560 360 620 440 600 C520 580 570 530 650 520 C730 510 790 560 860 540 C930 520 980 480 1060 490 C1140 500 1190 540 1260 520 C1330 500 1380 550 1440 530 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.35)"
        />
        {/* Near range — most prominent */}
        <path
          d="M0 900 L0 740 C90 730 160 680 250 670 C340 660 400 710 480 690 C560 670 620 640 710 650 C800 660 860 690 940 670 C1020 650 1080 620 1160 640 C1240 660 1300 700 1380 680 L1440 690 L1440 900 Z"
          fill="rgba(203, 213, 225, 0.45)"
        />
      </svg>
    </div>
  );
}
