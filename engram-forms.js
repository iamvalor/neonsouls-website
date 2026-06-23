/* ============================================================================
 * engram-forms.js — NEON SOULS · the four PLAYER ENGRAMS
 *
 * Players are ENGRAMS: digital copies of human consciousness uploaded into
 * EREBUS. No body, no anatomy — abstract geometric forms, the working protocols
 * that survived the corruption. Where enemies are BROKEN (jagged, glitching,
 * pixel-disintegrating), engrams are INTACT: clean geometry, crisp glowing
 * edges, fluid motion, dissolve-into-light death.
 *
 * Each form is rendered as a smooth, anti-aliased glowing vector — deliberately
 * NOT the chunky pixel-art of the enemy sheets. That contrast IS the read:
 * the player is the one stable signal in a corrupted system.
 *
 * window.Engrams = { LIST, FPS, render(ctx, eng, anim, p, opts) }
 *   anim ∈ idle | walk | hit | die        (NO attack — the weapon handles that)
 *   p    ∈ [0,1)  loop progress (live) or frame phase f/frames (authored strip)
 *   opts = { scale=1, dx=0, tms=0 }        tms = global ms for decorative motion
 * Draw space is a centred 64×64 cell; forms live in [-32,32].
 * ==========================================================================*/
(function () {
  'use strict';

  // ── math / colour helpers ─────────────────────────────────────────────────
  const TAU = Math.PI * 2, D = Math.PI / 180;
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const hx = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const mix = (a, b, t) => { const A = hx(a), B = hx(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
  const rgba = (h, a) => { const c = hx(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
  function heartbeat(x) { // 0..1 → 0..1 double-thump
    const a = Math.exp(-Math.pow((x - 0.12) / 0.05, 2));
    const b = Math.exp(-Math.pow((x - 0.30) / 0.06, 2)) * 0.72;
    return Math.min(1, a + b);
  }
  function prand(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
  function glow(ctx, col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; }
  function noGlow(ctx) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

  // ══════════════════════════════════════════════════════════════════════════
  // 1 · RIVEN SCAR — crystalline shard (vertical rhombus). Heavy, imposing.
  // ══════════════════════════════════════════════════════════════════════════
  function rivenBody(ctx, e, glowK, white, alpha) {
    const P = e.primary, S = e.secondary, G = e.glow, W = '#FFFFFF';
    const w = 13, h = 20;
    const rh = (sx, sy) => [[0, -h * sy], [w * sx, 0], [0, h * sy], [-w * sx, 0]];
    ctx.globalAlpha = alpha;
    // halo + dark crystalline body
    glow(ctx, P, 14 + 12 * glowK);
    ctx.fillStyle = mix(S, P, 0.12 + 0.10 * glowK);
    poly(ctx, rh(1, 1)); ctx.fill();
    // crisp clean edges
    noGlow(ctx);
    ctx.lineWidth = 1.6; ctx.lineJoin = 'miter';
    ctx.strokeStyle = mix(P, W, 0.15 + white * 0.7);
    poly(ctx, rh(1, 1)); ctx.stroke();
    // internal facet line
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(G, 0.5);
    ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, h); ctx.stroke();
    // pulsing inner core — the heartbeat
    const k = 0.34 + 0.26 * glowK;
    glow(ctx, P, 8 + 10 * glowK);
    ctx.fillStyle = mix(P, W, 0.25 + 0.45 * glowK + white * 0.5);
    poly(ctx, rh(k, k)); ctx.fill();
    // white centre spark
    glow(ctx, W, 6);
    ctx.fillStyle = mix(W, P, 0.05);
    poly(ctx, rh(0.16 + 0.05 * glowK, 0.16 + 0.05 * glowK)); ctx.fill();
    noGlow(ctx); ctx.globalAlpha = 1;
  }
  function drawRiven(ctx, anim, p, tms, e) {
    if (anim === 'die') {
      const G = e.glow, P = e.primary, W = '#FFFFFF';
      const white = Math.min(1, p * 2.2);
      const brk = clamp01((p - 0.16) / 0.84);
      // fading whitening core
      ctx.save(); ctx.scale(1 - brk * 0.25, 1 - brk * 0.25);
      rivenBody(ctx, e, 0.8, Math.min(1, white), (1 - brk) * (1 - brk));
      ctx.restore();
      // large glowing shards float upward
      const rnd = prand(7);
      for (let i = 0; i < 6; i++) {
        const bx = (rnd() - 0.5) * 22, by = (rnd() - 0.5) * 26;
        const vx = (rnd() - 0.5) * 14, vy = -(16 + rnd() * 24);
        const rot = (rnd() - 0.5) * 1.8, sz = 4 + rnd() * 5;
        ctx.save();
        ctx.translate(bx + vx * brk, by + vy * brk);
        ctx.rotate(rot * brk);
        ctx.globalAlpha = (1 - brk);
        glow(ctx, G, 12 * (1 - brk * 0.4));
        ctx.fillStyle = mix(P, W, 0.4 + 0.6 * brk);
        poly(ctx, [[0, -sz], [sz * 0.72, sz * 0.7], [-sz * 0.72, sz * 0.7]]); ctx.fill();
        ctx.restore();
      }
      noGlow(ctx); ctx.globalAlpha = 1;
      return;
    }
    let s = 1, lean = 0, white = 0, glowK = 0.6;
    if (anim === 'idle') glowK = 0.32 + 0.68 * heartbeat((tms % 2000) / 2000);
    else if (anim === 'walk') { lean = Math.sin(p * TAU) * 6 * D; glowK = 0.55 + 0.2 * Math.abs(Math.sin(p * TAU)); }
    else if (anim === 'hit') { s = 1 - 0.18 * Math.sin(p * Math.PI); white = Math.max(0, 1 - p * 1.7); glowK = 0.7 + 0.3 * Math.sin(p * Math.PI); }
    // walk afterimages (footstep markers)
    if (anim === 'walk') {
      for (let i = 1; i <= 2; i++) {
        ctx.save();
        ctx.translate(-Math.sin(p * TAU) * i * 6, i * 2);
        ctx.rotate(lean * 0.5);
        rivenBody(ctx, e, 0.3, 0, 0.16 / i);
        ctx.restore();
      }
    }
    ctx.save(); ctx.rotate(lean); ctx.scale(s, s);
    rivenBody(ctx, e, glowK, white, 1);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2 · BLOOD ARCHITECT — rotating hexagon, layered glowing rings.
  // ══════════════════════════════════════════════════════════════════════════
  function hexPts(r, rot) { const a = []; for (let i = 0; i < 6; i++) { const t = rot + i * TAU / 6; a.push([Math.cos(t) * r, Math.sin(t) * r]); } return a; }
  function bloodBody(ctx, e, rot, glowK, white, alpha, stretch) {
    const P = e.primary, S = e.secondary, G = e.glow, W = '#FFFFFF';
    ctx.save(); ctx.globalAlpha = alpha;
    if (stretch) ctx.scale(1 + stretch * 0.22, 1 - stretch * 0.16);
    // outer halo ring
    glow(ctx, P, 14 + 10 * glowK);
    ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
    ctx.strokeStyle = mix(P, W, 0.1 + white * 0.7);
    poly(ctx, hexPts(18, rot)); ctx.stroke();
    // dark interior
    noGlow(ctx);
    ctx.fillStyle = mix(S, P, 0.18);
    poly(ctx, hexPts(17, rot)); ctx.fill();
    // layered concentric rings — depth through stacking, not glitch
    const rings = [13, 9, 5.5];
    rings.forEach((r, i) => {
      glow(ctx, P, 6 + 6 * glowK);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = rgba(mix(P, W, white * 0.6), 0.45 + 0.4 * glowK - i * 0.08);
      poly(ctx, hexPts(r, rot - i * 0.18)); ctx.stroke();
    });
    // code-shimmer ticks along the outer edge (stable, not glitching)
    noGlow(ctx);
    const op = hexPts(18, rot);
    ctx.strokeStyle = rgba(G, 0.55);
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = op[i], b = op[(i + 1) % 6];
      const ticks = 3;
      for (let t = 1; t <= ticks; t++) {
        const f = t / (ticks + 1);
        const phase = (Math.sin(rot * 3 + i * 1.7 + t) + 1) / 2;
        if (phase < 0.45) continue;
        const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
        const nx = -(b[1] - a[1]), ny = (b[0] - a[0]); const nl = Math.hypot(nx, ny);
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x + nx / nl * 2.4, y + ny / nl * 2.4); ctx.stroke();
      }
    }
    // bright core
    glow(ctx, W, 6 + 6 * glowK);
    ctx.fillStyle = mix(P, W, 0.55 + white * 0.4);
    poly(ctx, hexPts(2.6 + glowK * 1.2, rot)); ctx.fill();
    noGlow(ctx); ctx.restore();
  }
  function drawBlood(ctx, anim, p, tms, e) {
    const baseRot = tms * 0.00055; // slow clockwise
    if (anim === 'die') {
      const fold = clamp01(p);
      const sc = Math.max(0.001, 1 - fold);
      ctx.save(); ctx.rotate(baseRot + fold * 6); ctx.scale(sc, sc);
      bloodBody(ctx, e, 0, 0.6 + fold * 0.4, fold * 0.5, 1 - fold * 0.2, 0);
      ctx.restore();
      // vanishes into a single point of light
      const W = '#FFFFFF';
      ctx.save();
      glow(ctx, e.glow, 10 + 26 * (1 - Math.abs(fold - 0.82) * 5));
      ctx.fillStyle = mix(e.glow, W, 0.7);
      ctx.globalAlpha = fold < 0.92 ? 1 : clamp01((1 - fold) / 0.08);
      ctx.beginPath(); ctx.arc(0, 0, 2 + 4 * Math.max(0, 1 - Math.abs(fold - 0.8) * 6), 0, TAU); ctx.fill();
      ctx.restore(); noGlow(ctx); ctx.globalAlpha = 1;
      return;
    }
    let glowK = 0.5, white = 0, stretch = 0, driftX = 0;
    if (anim === 'idle') glowK = 0.45 + 0.3 * (Math.sin(tms * 0.0022) * 0.5 + 0.5);
    else if (anim === 'walk') { driftX = Math.sin(p * TAU) * 6; glowK = 0.6; }
    else if (anim === 'hit') { white = Math.max(0, 1 - p * 1.6); stretch = Math.sin(p * Math.PI); glowK = 0.8; }
    // walk purple ribbon trail
    if (anim === 'walk') {
      for (let i = 1; i <= 4; i++) {
        ctx.save();
        ctx.translate(-Math.sin((p - i * 0.05) * TAU) * 6 + (driftX - Math.sin((p - i * 0.05) * TAU) * 6) * 0, 0);
        ctx.translate(Math.sin((p - i * 0.06) * TAU) * 6 - driftX, 0);
        ctx.rotate(baseRot - i * 0.12);
        bloodBody(ctx, e, 0, 0.25, 0, 0.18 / i, 0);
        ctx.restore();
      }
    }
    ctx.save(); ctx.translate(driftX, 0); ctx.rotate(baseRot);
    bloodBody(ctx, e, 0, glowK, white, 1, stretch);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3 · PHANTOM NOTE — semi-transparent teardrop with orbiting ghost copies.
  // ══════════════════════════════════════════════════════════════════════════
  function teardrop(ctx, sc) {
    sc = sc || 1;
    ctx.beginPath();
    ctx.moveTo(0, -18 * sc);
    ctx.bezierCurveTo(7 * sc, -12 * sc, 12 * sc, -3 * sc, 12 * sc, 5 * sc);
    ctx.arc(0, 5 * sc, 12 * sc, 0, Math.PI, false);
    ctx.bezierCurveTo(-12 * sc, -3 * sc, -7 * sc, -12 * sc, 0, -18 * sc);
    ctx.closePath();
  }
  function phantomCopy(ctx, e, alpha, glowK, white, sc) {
    const P = e.primary, G = e.glow, W = '#FFFFFF';
    ctx.globalAlpha = alpha;
    glow(ctx, P, 10 + 8 * glowK);
    ctx.fillStyle = rgba(mix(P, W, white * 0.7), 0.5 + 0.3 * glowK);
    teardrop(ctx, sc); ctx.fill();
    noGlow(ctx);
    ctx.lineWidth = 1.3; ctx.strokeStyle = rgba(mix(G, W, white), 0.8);
    teardrop(ctx, sc); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawPhantom(ctx, anim, p, tms, e) {
    const P = e.primary, G = e.glow, W = '#FFFFFF';
    const orbit = tms * 0.0016;
    if (anim === 'die') {
      const f = clamp01(p);
      // ghosts scatter outward and fade
      for (let i = 0; i < 4; i++) {
        const a = orbit + i * TAU / 4;
        const r = 6 + f * (26 + i * 4);
        ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r); ctx.scale(0.8, 0.8);
        phantomCopy(ctx, e, (1 - f) * 0.5, 0.4, 0, 0.8);
        ctx.restore();
      }
      // main fades
      phantomCopy(ctx, e, (1 - f) * (1 - f), 0.5 + f * 0.5, f * 0.4, 1);
      return;
    }
    let breathe = 1, mainGlow = 0.55, white = 0, scatter = 0, trail = 0;
    if (anim === 'idle') { breathe = 1 + 0.06 * Math.sin(tms * 0.003); mainGlow = 0.5 + 0.25 * Math.sin(tms * 0.003); }
    else if (anim === 'walk') { trail = 1; mainGlow = 0.6; }
    else if (anim === 'hit') { white = Math.max(0, 1 - p * 1.6); scatter = Math.sin(p * Math.PI); mainGlow = 0.85; }
    // ghost copies
    if (anim === 'walk') {
      // comet trail — stretched, lagging copies behind
      for (let i = 4; i >= 1; i--) {
        ctx.save();
        ctx.translate(-i * 6.5, Math.sin((p - i * 0.05) * TAU) * 1.5);
        ctx.scale(1 + i * 0.05, 1 - i * 0.06);
        phantomCopy(ctx, e, 0.42 / i, 0.3, 0, 0.92);
        ctx.restore();
      }
    } else {
      // orbiting copies (idle / hit)
      for (let i = 0; i < 3; i++) {
        const a = orbit + i * TAU / 3;
        const r = (5 + scatter * 14);
        ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r * 0.7); ctx.scale(0.82, 0.82);
        phantomCopy(ctx, e, 0.3 - scatter * 0.12, 0.3, 0, 0.9);
        ctx.restore();
      }
    }
    // main form
    ctx.save(); ctx.scale(breathe, breathe);
    phantomCopy(ctx, e, 0.92, mainGlow, white, 1);
    // bright core
    glow(ctx, W, 6); ctx.fillStyle = mix(P, W, 0.5 + white * 0.4);
    ctx.beginPath(); ctx.arc(0, 2, 2.4 + mainGlow * 1.4, 0, TAU); ctx.fill(); noGlow(ctx);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4 · VOID WALKER — two overlapping offset triangles (dual existence).
  // ══════════════════════════════════════════════════════════════════════════
  function triPts() { return [[0, -18], [15, 15], [-15, 15]]; }
  function voidForm(ctx, col, glowCol, glowK, white, alpha, fill) {
    ctx.globalAlpha = alpha;
    glow(ctx, glowCol, 12 + 10 * glowK);
    if (fill) { ctx.fillStyle = rgba(mix(col, '#FFFFFF', white * 0.7), 0.18 + 0.12 * glowK); poly(ctx, triPts()); ctx.fill(); }
    noGlow(ctx);
    ctx.lineWidth = 2; ctx.lineJoin = 'miter';
    glow(ctx, glowCol, 8 + 8 * glowK);
    ctx.strokeStyle = mix(col, '#FFFFFF', 0.1 + white * 0.8);
    poly(ctx, triPts()); ctx.stroke();
    noGlow(ctx); ctx.globalAlpha = 1;
  }
  function drawVoid(ctx, anim, p, tms, e) {
    const P = e.primary, S = e.secondary, G = e.glow, W = '#FFFFFF';
    const phantomCol = G; // cyan phantom
    if (anim === 'die') {
      const f = clamp01(p);
      ctx.save(); ctx.translate(-f * 26, 0); ctx.globalAlpha = 1 - f; voidForm(ctx, P, P, 0.5, f * 0.3, 1 - f, true); ctx.restore();
      ctx.save(); ctx.translate(5 + f * 26, 5); ctx.globalAlpha = 1 - f; voidForm(ctx, phantomCol, phantomCol, 0.5, f * 0.3, 1 - f, false); ctx.restore();
      ctx.globalAlpha = 1; return;
    }
    let off = 5, solidDy = 0, phDy = 0, white = 0, alpha = 1, glowK = 0.55;
    if (anim === 'idle') { solidDy = -Math.sin(tms * 0.0024) * 2.2; phDy = Math.sin(tms * 0.0024) * 2.2; off = 5 + Math.sin(tms * 0.0024) * 1.2; glowK = 0.5; }
    else if (anim === 'walk') {
      // teleport micro-skips: stepped position + brief blink (1-2 frames vanish)
      const steps = 6; const frac = (p * steps) % 1; const step = Math.floor(p * steps);
      solidDy = 0; off = 5; glowK = 0.6;
      ctx.save(); ctx.translate(Math.sin((step / steps) * TAU) * 7, 0);
      alpha = frac < 0.16 ? 0.12 : 1; // blink on skip
      drawVoidPair(ctx, e, off, 0, 0, 0, alpha, glowK);
      ctx.restore(); return;
    }
    else if (anim === 'hit') { white = Math.max(0, 1 - p * 1.6); off = 5 + Math.sin(p * Math.PI) * 9; glowK = 0.85; }
    drawVoidPair(ctx, e, off, solidDy, phDy, white, alpha, glowK);
  }
  function drawVoidPair(ctx, e, off, solidDy, phDy, white, alpha, glowK) {
    const P = e.primary, G = e.glow, W = '#FFFFFF';
    // phantom (cyan) behind, offset diagonally
    ctx.save(); ctx.translate(off, off + phDy); ctx.scale(0.98, 0.98);
    voidForm(ctx, G, G, glowK, white, alpha * 0.85, true);
    ctx.restore();
    // solid body in front
    ctx.save(); ctx.translate(-off * 0.35, solidDy);
    voidForm(ctx, P, P, glowK, white, alpha, true);
    // core
    glow(ctx, W, 6); ctx.fillStyle = mix(P, W, 0.5 + white * 0.4); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(0, 4, 2.4 + glowK, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; noGlow(ctx);
    ctx.restore();
  }

  // ── dispatch ──────────────────────────────────────────────────────────────
  const DRAW = { riven: drawRiven, blood: drawBlood, phantom: drawPhantom, void: drawVoid };
  function render(ctx, eng, anim, p, opts) {
    opts = opts || {};
    const scale = opts.scale || 1, dx = opts.dx || 0, tms = opts.tms || 0;
    ctx.save();
    ctx.translate(dx + 32 * scale, 32 * scale);
    ctx.scale(scale, scale);
    (DRAW[eng.key] || drawRiven)(ctx, anim, clamp01(p), tms, eng);
    ctx.restore();
    noGlow(ctx); ctx.globalAlpha = 1;
  }

  // ── roster data ───────────────────────────────────────────────────────────
  const LIST = [
    {
      key: 'riven', idx: 1, name: 'RIVEN SCAR', role: 'Heavy Enforcer', archetype: 'The Augmented Enforcer',
      former: 'Dr. Maren Vos', weapon: 'Protocol:Hollow', passive: 'Dark Core Shard',
      primary: '#FF3333', secondary: '#0A0A0F', glow: '#FF6666', size: 44,
      formName: 'Crystalline Shard', formShort: 'Standing rhombus · sharp clean edges · heavy, imposing',
      frames: { idle: 4, walk: 6, hit: 3, die: 8 }, fps: 8,
      quote: 'They replaced my flesh with steel. I’ll make them regret.',
      anim: {
        idle: 'Pulsing red glow from within, like a heartbeat. Slow, steady — a double-thump every ~2s.',
        walk: 'Rocks slightly side to side with each step. Leaves faint red afterimages on the ground (footstep markers).',
        hit: 'Flashes bright white, form contracts slightly (~0.82×), then expands back.',
        die: 'Red light fades to white → form breaks into large glowing shards that float upward and fade.'
      }
    },
    {
      key: 'blood', idx: 2, name: 'BLOOD ARCHITECT', role: 'Fluid Caster', archetype: 'The Corrupted Coder',
      former: 'Sable Rhys · blood.hex', weapon: 'Blood.hex (chain lightning)', passive: 'Phantom Impulse',
      primary: '#B300FF', secondary: '#1A0033', glow: '#DD66FF', size: 40,
      formName: 'Layered Hexagon', formShort: 'Six-sided · slow clockwise rotation · depth through stacked rings',
      frames: { idle: 6, walk: 4, hit: 3, die: 8 }, fps: 10,
      quote: 'Magic is reality’s code. Code can be rewritten.',
      anim: {
        idle: 'Rotates clockwise. Hex edges shimmer with code-like tick patterns — stable, never glitching.',
        walk: 'Translates smoothly while continuing to rotate. Leaves a faint purple ribbon trail.',
        hit: 'Flashes purple, hex distorts (stretches on one axis) then snaps back.',
        die: 'Purple glow intensifies → form folds into itself → vanishes into a single point of light.'
      }
    },
    {
      key: 'phantom', idx: 3, name: 'PHANTOM NOTE', role: 'Ghost Echo', archetype: 'The Ghost Operative',
      former: 'Cael · [no record]', weapon: 'Phantom Dagger (thrown)', passive: 'Victim Analyzer',
      primary: '#0088FF', secondary: '#0A0A14', glow: '#44AAFF', size: 40,
      formName: 'Teardrop + Echoes', formShort: 'Semi-transparent wisp · 3–4 ghost copies trailing, alpha-faded',
      frames: { idle: 6, walk: 8, hit: 3, die: 8 }, fps: 10,
      quote: 'Silence kills faster than bullets. I am the echo.',
      anim: {
        idle: 'Ghost copies slowly orbit the main form. Main form breathes (slight scale pulse).',
        walk: 'The form glides. Ghost copies stretch and lag behind, creating a comet-like trail.',
        hit: 'Blue flash, the ghost copies scatter outward briefly then reform.',
        die: 'Main form fades; ghost copies scatter outward and fade.'
      }
    },
    {
      key: 'void', idx: 4, name: 'VOID WALKER', role: 'Dimensional Drifter', archetype: 'The Dimensional Exile',
      former: 'Isak Drev', weapon: 'Echo Wall (ghost aura)', passive: 'Decay Schema',
      primary: '#00FFAA', secondary: '#002A1A', glow: '#33FFCC', size: 44,
      formName: 'Offset Dual-Form', formShort: 'Solid body + cyan phantom, offset 4–6px diagonally — never touching',
      frames: { idle: 6, walk: 6, hit: 3, die: 8 }, fps: 8,
      quote: 'Between strikes lives a dimension you cannot follow.',
      anim: {
        idle: 'The two forms drift independently — one up, one down — creating a breathing effect.',
        walk: 'Appears to teleport: short micro-skips, vanishing for 1–2 frames and reappearing slightly ahead (frame-skipping, not real position change).',
        hit: 'Both forms flash white simultaneously, then separate more (offset increases) before returning.',
        die: 'The two forms drift apart in opposite directions and fade.'
      }
    }
  ];

  // live-preview loop periods (ms) — the *feel*; authored frame counts live on each engram
  const PERIOD = { idle: 2000, walk: 1100, hit: 560, die: 1700 };

  window.Engrams = { LIST, render, PERIOD };
})();
