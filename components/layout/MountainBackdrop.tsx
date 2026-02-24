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
        {/* Snow caps — far range peaks */}
        <path
          d="M165 418 L180 405 L200 390 L218 402 L238 422 L222 416 L210 410 L200 406 L188 411 L175 417 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M475 395 L495 365 L510 345 L520 330 L535 350 L550 370 L565 395 L548 382 L535 372 L520 364 L505 370 L490 382 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M855 390 L867 376 L880 360 L893 376 L910 396 L895 388 L885 380 L880 377 L870 382 L860 390 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M1222 384 L1235 368 L1250 350 L1265 368 L1284 392 L1268 384 L1258 374 L1250 370 L1240 375 L1230 384 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        {/* Mid range — angular medium peaks */}
        <path
          d="M0 900 L0 600 L80 580 L160 560 L250 530 L350 500 L420 540 L500 580 L580 570 L660 530 L750 480 L830 520 L920 590 L1000 570 L1060 530 L1100 490 L1160 520 L1240 570 L1320 560 L1440 540 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.35)"
        />
        {/* Snow caps — mid range peaks */}
        <path
          d="M710 505 L730 492 L750 480 L770 494 L792 510 L775 505 L762 498 L750 494 L738 498 L724 505 Z"
          fill="rgba(255, 255, 255, 0.7)"
        />
        <path
          d="M1072 518 L1085 505 L1100 490 L1115 504 L1132 522 L1118 516 L1108 508 L1100 504 L1092 508 L1082 516 Z"
          fill="rgba(255, 255, 255, 0.7)"
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
