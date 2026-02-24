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
          fill="rgba(148, 163, 184, 0.40)"
        />
        {/* Snow caps — far range peaks */}
        <path
          d="M145 421 L170 407 L200 390 L230 416 L255 437 L242 435 L225 424 L210 415 L200 410 L190 417 L175 426 L158 433 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M470 405 L490 375 L520 330 L550 370 L575 397 L562 393 L545 378 L530 362 L520 355 L510 362 L498 378 L485 395 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M848 392 L865 376 L880 360 L900 378 L925 413 L915 410 L900 396 L890 382 L880 378 L870 385 L860 395 L852 400 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        <path
          d="M1210 382 L1230 366 L1250 350 L1275 380 L1300 408 L1288 404 L1275 390 L1262 376 L1250 370 L1238 378 L1225 390 L1215 398 Z"
          fill="rgba(255, 255, 255, 0.85)"
        />
        {/* Mid range — angular medium peaks */}
        <path
          d="M0 900 L0 600 L80 580 L160 560 L250 530 L350 500 L420 540 L500 580 L580 570 L660 530 L750 480 L830 520 L920 590 L1000 570 L1060 530 L1100 490 L1160 520 L1240 570 L1320 560 L1440 540 L1440 900 Z"
          fill="rgba(148, 163, 184, 0.50)"
        />
        {/* Snow caps — mid range peaks */}
        <path
          d="M700 508 L725 494 L750 480 L775 493 L800 505 L790 503 L775 496 L762 490 L750 487 L738 492 L725 498 L712 506 Z"
          fill="rgba(255, 255, 255, 0.7)"
        />
        <path
          d="M1070 520 L1085 505 L1100 490 L1120 500 L1140 510 L1130 508 L1118 502 L1108 497 L1100 495 L1092 498 L1082 505 L1075 514 Z"
          fill="rgba(255, 255, 255, 0.7)"
        />
        {/* Near range — angular foothills */}
        <path
          d="M0 900 L0 710 L100 700 L200 680 L300 640 L370 670 L450 700 L550 690 L680 660 L800 630 L880 660 L960 700 L1060 690 L1150 660 L1200 650 L1280 680 L1360 700 L1440 690 L1440 900 Z"
          fill="rgba(203, 213, 225, 0.60)"
        />
      </svg>
    </div>
  );
}
