# Motion and scroll design

What the site's animation does, why it is built the way it is, and what was
taken from the reference build at `amiruli5.sg-host.com`.

Read this before adding an animation. The short version: **reveals and counters
go through one observer in `Motion.tsx`; everything scroll-linked is CSS scroll
timelines; nothing is allowed to move for a visitor who asked for less motion.**

---

## Part one: what the reference build does

The reference is a hand-written PHP page with one 3,155-line stylesheet and one
inline script, pulling GSAP 3.12, ScrollTrigger and Lenis 1.1 off a CDN. It has
no framework. Everything below was read out of its source rather than guessed at
from watching it.

### The single most important thing in it

**One easing curve, used for almost everything.**

```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

That curve appears 60+ times in the reference stylesheet. It leaves fast and
settles slowly, with no overshoot. Because the same curve drives the header
shrink, the card lift, the image zoom, the button sweep, the nav slide and every
scroll reveal, unrelated parts of the page feel like they belong to one
mechanism. This costs nothing and is most of the perceived quality.

The second half of that discipline is **duration tiering**, which is just as
consistent:

| Range     | Used for               | Examples in the reference                             |
| --------- | ---------------------- | ----------------------------------------------------- |
| 0.2–0.3s  | Colour, small nudges   | link colour, icon `translateX(4px)`, nav bars         |
| 0.35–0.4s | State changes          | header solidify, card lift, badge swap                |
| 0.6–0.9s  | Reveals and image zoom | `data-reveal` (0.9s), card image `scale(1.08)` (0.8s) |
| 1.0s+     | One-off entrances      | hero line masks (1s), preloader curtain (0.85s)       |

The rule behind the table: **the more of the screen a thing occupies, the slower
it moves.** A 6px icon nudge at 0.9s looks broken; a full-width curtain at 0.2s
looks like a glitch.

### Motion inventory

Everything the reference animates, and how:

**Load**

1. **Preloader curtain.** Full-screen navy panel with a pulsing logo, wiping
   upward on `transform: translateY(-100%)` over 0.85s with
   `cubic-bezier(0.76, 0, 0.24, 1)` (a symmetric in-out curve, deliberately
   different from the site's ease-out — a curtain should accelerate).
   Three separate failsafes so it can never trap the user: a 2.2s JS timeout, a
   3s CSS `visibility: hidden` keyframe, and immediate removal under
   reduced-motion.
2. **Hero entrance, staggered on a clock.** Not scroll-linked, because the hero
   is already in view. `rise-in` (opacity 0 → 1, `translateY(26px)` → 0, 0.9s)
   fires at hard-coded delays: eyebrow 0.15s, lead 0.6s, CTAs 0.75s, chips 0.9s,
   scroll cue 1.4s.
3. **Masked line reveal on the h1.** Each line is a `overflow: hidden` block
   containing a span starting at `translateY(110%)`, sliding to 0 over 1s at
   0.25s and 0.4s. This is the best single effect on the page: the text appears
   to rise from behind its own baseline. It is also the cheapest — two elements
   and one keyframe.
4. **Ken Burns on the hero photo.** `scale(1) → scale(1.09)` plus a 1.5% drift
   over **24 seconds**, `ease-in-out`, `infinite alternate`. Long enough that
   you never catch it moving; the still image simply never feels static.

**Scroll-linked (GSAP ScrollTrigger, all `scrub: true`, all `ease: 'none'`)**

5. **Hero scrub-out.** Background scales to 1.18 and drifts 6% down while the
   content moves `-16%` up and fades to 0 across the hero's height. The hero
   dissolves into the page rather than sliding off it.
6. **Media parallax inside card frames.** Every card image is rendered at
   `scale(1.14)` and drifts `yPercent: -5 → 5` across the card's time on screen.
   The image is oversized precisely so the drift never exposes an edge. This is
   the effect most responsible for the page feeling alive while you scroll, and
   almost nobody notices it consciously.
7. **Section titles.** `yPercent: 12 → 0`, `opacity: 0.7 → 1`, scrubbed from
   `top 96%` to `top 52%`. Because it is scrubbed rather than one-shot, the
   heading tracks the scroll wheel — it feels connected to your hand.
8. **Giant chapter numerals.** Oversized section numbers drift `xPercent: 12 →
-12` across the whole section. Pure decoration, and it creates depth.
9. **About image curtain.** `clip-path: inset(12%)` → `inset(0%)`, scrubbed. The
   frame opens as you arrive.
10. **CTA band settle.** Background `scale(1.18) → scale(1)` across the band.
11. **Pinned horizontal services gallery.** Desktop ≥1100px only, and gated
    again on viewport _height_ being at least the section's height, with a
    debounced re-measure on resize, `document.fonts.ready` and `load`. The
    amount of defensive code here is the tell: it is the most fragile thing on
    the page.

**Scroll position (plain listener, rAF-throttled, `{ passive: true }`)**

12. **Header shrink and solidify.** Past 40px: container 84px → 66px, logo 42px
    → 34px, background `rgba(6,26,51,0.72)` → `0.94`, and a shadow appears. The
    header keeps `backdrop-filter: blur(18px) saturate(140%)` throughout.
13. **Scroll progress bar.** 3px gold gradient across the top.
14. **Back-to-top button.** Appears past 700px.
15. **Two parallax elements** via `data-parallax` with a speed multiplier.

**Reveals (IntersectionObserver, `threshold: 0.12`, `rootMargin: 0 0 -60px 0`)**

16. **`[data-reveal]`** — opacity 0 + `translateY(34px)`, with `left`, `right`
    and `zoom` variants. One-shot: `io.unobserve` on first intersection, so
    nothing re-animates or reverses on the way back up.
17. **`[data-stagger]`** — parent attribute; JS writes an incrementing
    `transitionDelay` onto each child (default 110ms step).

**Counters** — 1.8s, eased with `1 - (1-p)³` (cubic ease-out, matching the
site's curve in spirit), triggered at 50% visibility, with `data-prefix` /
`data-suffix` so `£69.99` and `10+` still animate.

**Continuous**

18. **Accreditation marquee.** `translateX(0 → -50%)` over 32s linear on a
    doubled list, `animation-play-state: paused` on hover. The `-50%` on doubled
    content is what makes the loop seamless.
19. **Scroll cue dot.** 1.8s bounce-and-fade inside a mouse outline.
20. **Spinning badge** — 16s linear.

**Pointer**

21. **Smooth scrolling via Lenis.** `lerp: 0.09`, `wheelMultiplier: 1.05`,
    driven off `gsap.ticker` with `lagSmoothing(0)`. This is the thing you
    notice first and can least easily name.
22. **Custom cursor ring.** 42px gold ring, following at `lerp 0.16`, growing to
    66px with a tinted fill over links, buttons and cards. `(pointer: fine)`
    only. Built here and then removed; see the verdict table.
23. **3D card tilt.** `rotateX(±6deg) rotateY(±8deg)` from cursor position
    within the card, `perspective(900px)`, plus an 8px lift.
24. **Button shimmer.** A skewed white gradient sweeping `left: -80% → 130%`
    over 0.6s on hover, clipped by `overflow: hidden`.

### Why it feels expensive

Stripping the effects away, five decisions do the work:

1. **One curve, four durations.** Covered above. This is the whole ballgame.
2. **Layered depth instead of flat cards.** The hero has a photo, a two-stop
   diagonal gradient, a gold radial glow and a grain overlay — four layers
   before any text. Cards have an oversized drifting image, a gradient wash that
   fades in on hover, a floating icon and a badge. Nothing is one flat surface.
3. **Generous, consistent rhythm.** 110px section padding (72px on mobile), a
   1240px container, and a display face at `clamp(2.9rem, 7vw, 5.6rem)` with
   `line-height: 0.99` and `letter-spacing: -0.045em`. Tight, large headings
   against a lot of white space read as editorial rather than corporate.
4. **Every hover moves more than one thing.** Hovering a card lifts it 10px,
   zooms its image to 1.08, lightens its gradient wash, rotates its icon -6°
   and scales that icon to 1.06 — five properties, one gesture, all on the same
   curve. Compare a card that only changes its shadow.
5. **Nothing bounces.** No overshoot, no spring, no elastic. For a letting agent
   that is the correct register: calm and expensive, not playful.

### What is worth taking, and what is not

| Reference feature                        | Verdict                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single ease curve + duration tiers       | **Take.** Free, and the biggest single win.                                                                                                                           |
| Masked line reveal on the h1             | **Take.** Highest impact per line of code on the page.                                                                                                                |
| Ken Burns hero                           | **Take.** 24s, imperceptible, kills the dead-still feeling.                                                                                                           |
| Hero scrub-out                           | **Take.** Pure CSS with scroll timelines.                                                                                                                             |
| Image drift inside card frames           | **Take.** The quiet workhorse.                                                                                                                                        |
| Scrubbed section titles                  | **Take.**                                                                                                                                                             |
| Multi-property hover on cards            | **Take.**                                                                                                                                                             |
| Button shimmer sweep                     | **Take.**                                                                                                                                                             |
| Marquee                                  | **Take.** We have real accreditations to put in it.                                                                                                                   |
| Animated counters                        | **Take.** Our figures come from the CMS as strings, so parse.                                                                                                         |
| Progress bar, header shrink, back-to-top | **Take**, but CSS-driven, not on a scroll listener.                                                                                                                   |
| Smooth scrolling (Lenis)                 | **Take.** This is the "fluid" the brief is about.                                                                                                                     |
| Custom cursor ring                       | **Skip.** Built, tried, and taken back out: the client did not want a second cursor, and it is the one effect that draws attention to itself rather than to the page. |
| 3D card tilt                             | **Adapt.** Kept, but ±3.5°/±5° instead of ±6°/±8°.                                                                                                                    |
| About-image clip-path curtain            | **Skip.** A scrubbed clip-path opening, stacked with image drift, felt theatrical on editorial photos of the office and houses. Those three use the same 24s Ken Burns as the hero instead. |
| Chapter numerals, CTA background settle  | **Skip.** Numerals are an editorial device that needs the rest of that system to mean anything, and our CTA band has no background photo to settle.                   |
| Scroll cue under the hero                | **Skip.** Our hero is not full-height, so a cue would point at content already on screen.                                                                             |
| Pinned horizontal gallery                | **Skip.** See below.                                                                                                                                                  |
| Preloader curtain                        | **Skip.** See below.                                                                                                                                                  |

**The pinned horizontal gallery is skipped** because our services list is
CMS-driven and of unknown length, and pinning needs a known measurement. The
reference needed a viewport-height gate, a debounced resize re-measure, a
`document.fonts.ready` hook and a distance check that silently unpins itself.
That is a lot of moving parts guarding an effect that breaks the browser's find
-in-page and the scrollbar's meaning. Not worth it here.

**The preloader curtain is skipped** on purpose, and this is the one deliberate
departure from "port everything". It holds a navy panel over the page for
250–350ms _after_ `load`, which pushes back Largest Contentful Paint by roughly
that amount on every first visit. For a local letting agent whose enquiries
depend on ranking against national portals, trading Core Web Vitals for a logo
flash is the wrong side of the deal — particularly when the hero entrance
animation already covers the arrival. If it is wanted anyway it is about 25
lines; say so and it goes in.

---

## Part two: how it is built here

The reference ships GSAP (~24KB gzip) + ScrollTrigger (~15KB) + Lenis (~3KB) to
do all of the above. We ship **Lenis only**, because CSS scroll-driven
animations do natively what ScrollTrigger's `scrub: true` was doing, and do it
off the main thread. Same effects, ~42KB less JavaScript, and no rAF loop
recalculating layout while you scroll.

### The split

Two mechanisms, chosen per effect by whether the effect needs to _fire once_ or
_track the scrollbar_:

**CSS scroll timelines — everything scroll-linked.**
`animation-timeline: view()` for "as this element crosses the screen" and
`scroll(root)` for "as the page scrolls". No JavaScript, runs on the compositor,
and it is what already drove the reveal system before this work.

Every one of these lives behind `@supports (animation-timeline: view())`, so a
browser without support renders the element in its final state. That is the
correct fallback: a static page, never a blank one.

**One IntersectionObserver — reveals and counters.**
`src/components/layout/Motion.tsx` is mounted once in the frontend layout. It is
the only client component the motion system adds.

Anything already in the viewport is revealed as soon as the observer starts —
including copy sitting in the bottom of the first screen under a tall photo
header. The root is not inset: an inset of 12% is what the reference used to
time the animation, and it left visible text at `opacity: 0` until the visitor
scrolled. Below-the-fold blocks still wait.

Reveals moved _off_ scroll timelines and onto the observer during this work, and
that was the point of the change. A `view()` timeline is scrubbed, so a revealed
card fades back out when you scroll up past it. The reference's one-shot,
0.9s-eased reveal is calmer and reads as intentional. Scrubbing is right for
parallax and wrong for content.

### Server components stay server components

`Motion.tsx` works off **data attributes and class names in the markup**, never
props. A server component opts in by rendering `className="reveal"` or
`data-count="8"` and stays a server component. Nothing in `src/components/ui`
or `src/blocks` needed `'use client'` for any of this.

Keep it that way. If a new section wants a reveal, give it the class; do not
reach for a hook.

### The classes and attributes

| Hook                                                               | Effect                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `.reveal`                                                          | Fade + rise 34px, one-shot, 0.9s                                         |
| `.reveal-group`                                                    | The same, staggering direct children 110ms apart                         |
| `.drift-media`                                                     | Oversized image drifting inside its frame, scrubbed, plus the hover zoom |
| `.drift-title`                                                     | Heading sliding against the scroll, scrubbed                             |
| `.ken-burns`                                                       | 24s imperceptible zoom on a photo (hero and split-section images)        |
| `.marquee` / `.marquee-track`                                      | Seamless looping strip, pauses on hover and focus                        |
| `.lift-card`                                                       | Hover lift, and the cursor-follow tilt on a fine pointer                 |
| `.sheen`                                                           | Gradient sweep on hover, plus a nudge on a trailing icon                 |
| `.header-shell` / `.header-bar` / `.header-strip` / `.header-logo` | The parts the shrink moves                                               |
| `.scroll-progress` / `.back-to-top`                                | Scroll-driven chrome                                                     |
| `data-count-to` / `data-count-prefix` / `data-count-suffix`        | Animated counter                                                         |

`.reveal` and `.reveal-group` are unchanged names on purpose: every existing
block and page that used them got the upgraded behaviour without an edit.

There is one reveal direction, not four. The reference offers left, right and
zoom as well, but this site never reached for them, and a set of directions
nothing uses is a decision to make on every new section. Adding one back is
four lines of CSS.

Two of these classes own `transform` outright, and that is deliberate.
`.lift-card` composes the hover lift and the pointer tilt into a single
declaration so they cannot overwrite each other, and `.drift-media` keeps its
zoom in a custom property for the same reason. Do not put a Tailwind
`translate-*` or `scale-*` utility on an element carrying either class.

The header classes set `background-color` and `height` in CSS rather than
through utilities, because the scrolled state has to override them. Tailwind's
`utilities` layer beats `components` whatever the specificity, so a
`bg-white/95` left in the markup would silently win and the header would never
solidify.

### Reduced motion

Four layers, because one is not enough:

1. The blanket rule in `@layer base` clamps every `animation-duration` and
   `transition-duration` to 0.01ms.
2. Scroll-driven animations **slip through that clamp**, because a `view()`
   timeline takes its progress from scroll position rather than from a clock.
   So every scroll-timeline block is additionally wrapped in
   `@media (prefers-reduced-motion: no-preference)`.
3. `Motion.tsx`, `CardTilt.tsx` and `SmoothScroll.tsx` check for themselves
   and do nothing at all when it is set — no observer, no Lenis, no tilt, no
   counter animation (the figure renders at its final value immediately,
   because the server rendered it that way).
4. A `prefers-reduced-motion: reduce` block forces every revealable element
   back to `opacity: 1`. The `data-motion` flag is read once before the first
   paint, so it cannot know about a preference that changes afterwards; this
   makes the media query the final word either way. It guards the one failure
   that actually matters here, which is text nobody can read.

If you add a scroll-linked effect and only do (1), it will still animate for
someone who asked it not to. This is the single easiest mistake to make in this
file.

### Smooth scrolling

`SmoothScroll.tsx` runs Lenis at `lerp: 0.09` and `wheelMultiplier: 1.05`,
matching the reference. Four things it has to get right, all of which are easy
to break:

- **It must not run under reduced motion.** Hijacking the scroll is exactly
  what that setting is about.
- **Touch is left alone.** Lenis does not smooth touch by default and it should
  stay that way; mobile momentum scrolling is already good and interfering with
  it feels broken.
- **Route changes must still jump to the top.** Next's scroll reset goes through
  `window.scrollTo`, which Lenis takes over, so the component calls
  `lenis.scrollTo(0, { immediate: true })` on `pathname` change. Without this
  you land on a new page at the previous page's offset — the same class of bug
  that `data-scroll-behavior="smooth"` on `<html>` exists to prevent.
- **But not on first mount**, which that same effect would otherwise do. It
  would undo the position the browser restored on a reload, and overrule
  anyone who started scrolling before hydration finished. Both are covered by
  tests in `tests/e2e/motion.e2e.spec.ts`.
- **Nested scrolling areas opt out explicitly**, with `data-lenis-prevent` on
  the element, as the mobile navigation panel does. Lenis can detect them
  itself, but that guesses from computed `overflow` and would happily mistake
  the header's collapsed contact strip for something you meant to scroll.
- **CSS scroll timelines keep working.** Lenis drives the real scroll position
  rather than faking it with a transform, so `scroll(root)` and `view()` still
  see it. Do not switch it to a wrapper element; that would silently kill every
  scroll-linked effect on the site.

Anchor links go through Lenis with an offset for the sticky header, so
`/#services` lands below the header rather than under it.
