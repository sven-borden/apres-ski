# Product

## Register

product

## Users

A small group of friends (typically 4–12) who rent a chalet together for a few
days of skiing. They are not "users" in a SaaS sense — they're a self-organizing
crew passing one shared link around the group chat. Context of use is split and
demanding:

- **On the mountain**: phone in a gloved hand, bright snow glare, flaky lift-line
  signal, a 10-second glance to check "who's cooking tonight" or "is Léa here
  today."
- **In the chalet**: evening, dim warm light, planning dinner and the next
  supermarket run together, sometimes passing the phone around.

No accounts, no login, no roles. Identity is a name + a color stored on the
device. The job to be done: **keep one ski trip's logistics — countdown,
attendance, meals, shopping, chalet info — effortlessly shared and current**, so
the group spends its energy skiing and eating, not coordinating.

## Product Purpose

Apres-Ski is the single shared brain for one ski trip. It answers the handful of
questions a chalet group asks on repeat (when, who's here, what's the snow,
who's cooking, what to buy, where's the Wi-Fi) without anyone owning a
spreadsheet. Success looks like: the link gets opened daily during the trip
without prompting, nobody asks "wait, who's buying the cheese," and the app feels
like part of the holiday rather than admin. It is deliberately one trip, fully
trust-based, real-time-ish, mobile-first, and installable as a PWA that survives
patchy mountain internet.

## Brand Personality

**Warm · social · alpine.** The brand is the moment in the logo: two glasses
clinking under a mountain. It's the après — the cheer after the effort.

- **Voice**: friendly and present, like a capable friend who's organizing
  without nagging. "Day 2 of 4 — who's pouring tonight?" not "2 of 4 nights have
  no assigned cook." Playful where the spec already leans playful (ski quotes,
  snow-vibe captions), plain and calm where it's logistics (Wi-Fi, emergency
  contacts).
- **3 words**: cheerful, capable, cozy.
- **Emotional goal**: a small hit of anticipation before the trip, easy
  belonging during it. The countdown and the warm orange should feel like
  excitement, never like a task tracker.
- **Grown-up, not cutesy.** Characterful and warm, but it's organizing real
  logistics for adults — no emoji-soup, no toy proportions.

## Anti-references

- **Generic SaaS dashboard** (Linear/Notion-clone, card-grid-everywhere,
  gray-on-white, tiny tracked uppercase eyebrows). This is a holiday, not a B2B
  tool. No KPI hero-metric template.
- **Corporate booking / travel site** (Booking.com / airline chrome: stock
  photography, sterile blue, dense forms, "trust badges"). The crew already chose
  the chalet; this isn't a funnel.
- **Crypto / AI-startup look** (neon gradient meshes, glassmorphism by default,
  glow-on-everything, gradient text). Warmth comes from color, type and copy, not
  from trend effects.

## Design Principles

1. **Glance-first.** Every screen must answer its core question in one gloved,
   sunlit glance before any interaction. Hierarchy serves the 10-second check on
   a chairlift.
2. **The trip is a place, not a project.** Lean into season, mountain, and the
   après moment. It should feel like part of the holiday, not productivity
   software with a ski skin.
3. **Friction only where it protects people.** The single deliberate speed bump
   is the confirmation before actions that affect others or destroy data
   (marking someone absent, deleting an item, shrinking trip dates). Everything
   else is one tap.
4. **Trust shown as ease.** No-login, anyone-can-edit is a feature — surface it
   as warmth and openness, never as a security warning.
5. **Degrade like a mountain hut.** Offline, stale weather, AI unavailable, flaky
   signal are the normal case, not the error case. Last-known data stays useful;
   failures are quiet and recoverable.

## Accessibility & Inclusion

- Target **WCAG 2.2 AA**. Body text ≥ 4.5:1, large text ≥ 3:1 — verified in both
  light and dark themes (the orange accent must never carry body text on its own).
- **Fully bilingual FR/EN** (French default); all strings translated, layouts
  must tolerate French's longer phrasing without overflow.
- **Reduced motion** honored everywhere (countdown, carousel auto-scroll,
  check-off linger) — crossfade or instant fallback, never gated content.
- **Outdoor / one-handed use**: large tap targets (≥ 44px), high contrast usable
  in glare, reachable bottom navigation on phones.
- **Color is never the only signal** (attendance present/absent, over-capacity
  warning, partial-check state) — pair color with icon, label, or shape for
  colorblind users.
