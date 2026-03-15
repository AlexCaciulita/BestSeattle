/**
 * Purely decorative animated SVG map of greater Seattle area roads & water.
 * No labels, no text — just abstract line geometry.
 * Zoomed out to show Everett → Tacoma region.
 * Server component (no interactivity).
 */
export default function SeattleMapBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div className="animate-map-pan w-full h-full">
        <svg
          viewBox="0 0 1600 1200"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Water bodies ─────────────────────────────────── */}
          <g opacity="0.06">
            {/* Puget Sound — large western water body */}
            <path
              d="M0 0 L180 0 Q200 100 190 200 Q180 320 200 440 Q210 520 190 600 Q170 700 160 800 Q150 900 140 1000 Q130 1100 120 1200 L0 1200 Z"
              fill="var(--map-water)"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.1s" }}
            />
            {/* Elliott Bay */}
            <path
              d="M180 520 Q240 500 300 520 Q340 540 320 580 Q300 620 260 630 Q220 640 190 620 Q170 600 180 560 Z"
              fill="var(--map-water)"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.15s" }}
            />
            {/* Lake Union */}
            <path
              d="M560 380 Q590 360 620 370 Q650 380 660 410 Q665 440 650 460 Q630 480 600 475 Q570 470 555 450 Q540 430 545 405 Q550 390 560 380 Z"
              fill="var(--map-water)"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.2s" }}
            />
            {/* Lake Washington */}
            <path
              d="M900 200 Q920 260 930 340 Q940 420 935 500 Q930 580 940 660 Q950 740 955 820 Q960 900 965 980 Q968 1060 970 1140 L1020 1140 Q1015 1060 1010 980 Q1005 900 1000 820 Q995 740 990 660 Q985 580 980 500 Q975 420 970 340 Q965 260 950 200 Z"
              fill="var(--map-water)"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.2s" }}
            />
            {/* Commencement Bay (Tacoma) */}
            <path
              d="M200 1000 Q260 980 320 1000 Q360 1020 340 1060 Q310 1090 260 1090 Q210 1080 200 1040 Z"
              fill="var(--map-water)"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.25s" }}
            />
          </g>

          {/* ── Highways (thicker) ───────────────────────────── */}
          <g
            stroke="var(--map-stroke)"
            strokeWidth="2.2"
            opacity="0.14"
            strokeLinecap="round"
          >
            {/* I-5 — main N-S spine, Everett to Tacoma */}
            <path
              d="M580 0 Q570 80 560 160 Q550 240 530 320 Q510 400 490 480 Q475 560 470 640 Q465 720 460 800 Q455 880 450 960 Q445 1040 440 1120 Q435 1160 430 1200"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.2s" }}
            />
            {/* I-405 — Eastside N-S */}
            <path
              d="M820 100 Q830 180 840 260 Q845 340 850 420 Q855 500 860 580 Q865 660 870 740 Q875 820 880 900 Q885 960 890 1020"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.35s" }}
            />
            {/* I-90 — E-W across Seattle to Eastside */}
            <path
              d="M240 620 Q360 610 480 600 Q600 595 720 600 Q840 605 960 610 Q1080 615 1200 620"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.4s" }}
            />
            {/* SR-99 / Aurora — parallel to I-5, west */}
            <path
              d="M420 80 Q415 180 410 280 Q405 380 390 480 Q380 560 370 640 Q360 720 355 800 Q350 880 345 960"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.5s" }}
            />
            {/* SR-520 — E-W bridge */}
            <path
              d="M600 480 Q720 475 840 480 Q920 484 1000 490"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.55s" }}
            />
            {/* I-5 approach from north (Everett area) */}
            <path
              d="M620 0 Q610 40 600 80 Q590 120 580 160"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.3s" }}
            />
            {/* SR-167 — south to Tacoma */}
            <path
              d="M860 900 Q840 940 800 980 Q760 1020 720 1060 Q680 1100 640 1140 Q620 1170 600 1200"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.6s" }}
            />
          </g>

          {/* ── Arterial roads (thinner) ─────────────────────── */}
          <g
            stroke="var(--map-stroke)"
            strokeWidth="1.0"
            opacity="0.09"
            strokeLinecap="round"
          >
            {/* 15th Ave NW / Ballard corridor */}
            <path
              d="M320 200 Q318 300 316 400 Q314 500 312 600"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.8s" }}
            />
            {/* Rainier Ave — diagonal SE */}
            <path
              d="M500 620 Q540 680 580 740 Q620 800 660 860 Q700 920 740 980"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.9s" }}
            />
            {/* MLK Way */}
            <path
              d="M560 620 Q590 680 620 740 Q650 800 680 860 Q710 920 740 1000"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "0.95s" }}
            />
            {/* Broadway / Capitol Hill */}
            <path
              d="M610 300 Q605 380 600 460 Q595 540 590 620 Q585 680 582 740"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.0s" }}
            />
            {/* Madison St — E-W */}
            <path
              d="M280 530 Q400 525 520 520 Q640 518 760 520 Q880 522 1000 525"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.05s" }}
            />
            {/* Mercer St — E-W */}
            <path
              d="M280 420 Q400 415 520 412 Q600 410 680 415"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.1s" }}
            />
            {/* NE 45th — U-District E-W */}
            <path
              d="M480 260 Q580 258 680 260 Q780 262 880 265"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.1s" }}
            />
            {/* Denny Way */}
            <path
              d="M280 450 Q380 445 480 442 Q560 440 640 444"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.15s" }}
            />
            {/* 23rd Ave — N-S */}
            <path
              d="M680 200 Q678 300 675 400 Q672 500 670 600 Q668 700 665 800"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.2s" }}
            />
            {/* Bellevue Way */}
            <path
              d="M880 380 Q875 460 870 540 Q868 620 865 700 Q862 780 860 860"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.2s" }}
            />
            {/* Market St / Ballard E-W */}
            <path
              d="M220 300 Q340 295 460 292 Q540 290 620 294"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.25s" }}
            />
            {/* West Seattle Bridge */}
            <path
              d="M240 680 Q320 675 400 678 Q460 682 490 660"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.25s" }}
            />
            {/* Eastside — NE 8th Bellevue */}
            <path
              d="M820 500 Q900 498 980 500 Q1060 502 1140 505"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.3s" }}
            />
            {/* Woodinville-Redmond Rd */}
            <path
              d="M1000 200 Q980 280 960 360 Q950 420 940 480"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.3s" }}
            />
            {/* Pacific Hwy / Federal Way */}
            <path
              d="M400 900 Q395 960 390 1020 Q385 1080 380 1140 Q378 1170 375 1200"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.35s" }}
            />
            {/* Mukilteo Speedway / north */}
            <path
              d="M200 120 Q320 115 440 112 Q520 110 600 114"
              className="animate-map-draw"
              pathLength="1"
              style={{ animationDelay: "1.35s" }}
            />
          </g>

          {/* ── Minor grid lines (very faint) ────────────────── */}
          <g
            stroke="var(--map-stroke)"
            strokeWidth="0.5"
            opacity="0.05"
            strokeLinecap="round"
          >
            {/* Horizontal */}
            <path d="M300 360 Q500 358 700 360" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.5s" }} />
            <path d="M350 560 Q550 558 750 560" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.5s" }} />
            <path d="M300 760 Q500 758 700 760" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.55s" }} />
            <path d="M400 860 Q600 858 800 860" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.55s" }} />
            <path d="M250 180 Q450 178 650 180" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.6s" }} />
            <path d="M350 1060 Q550 1058 750 1060" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.6s" }} />
            {/* Vertical */}
            <path d="M760 200 Q758 450 760 700" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.6s" }} />
            <path d="M1100 300 Q1098 550 1100 800" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.65s" }} />
            <path d="M1200 250 Q1198 500 1200 750" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.65s" }} />
            <path d="M240 700 Q238 850 240 1000" className="animate-map-draw" pathLength="1" style={{ animationDelay: "1.7s" }} />
          </g>
        </svg>
      </div>
    </div>
  );
}
