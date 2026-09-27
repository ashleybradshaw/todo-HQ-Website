# /ui known debt

Documented only — do not apply without an explicit GO.

- Triple source of truth: globals.css, accessibleColorPair.ts brand constants, and hard-coded landing hexes can drift — Colour section flags brand-state CSS ≠ INNER_BRAND_PAIR.
- No --radius, --focus, or spacing CSS tokens yet — conventions only; focus split between ring-[3px] and outline-2.
- No shared Button primitive — CTA class strings are copy-pasted across Book, About, 404, Work.
- SectionTransitionGate still has a hard-coded BRIDGE_FALLBACK instead of always using --page-bridge.
- design-system.mdc still describes body as sans / controls as mono; runtime is Unbounded display + JetBrains body.
- Status online/building lack dedicated --status-* tokens (naming gap called out in Colour).
- PipelineRunner omitted from Components here so /ui does not pull Framer Motion weight onto this route.
