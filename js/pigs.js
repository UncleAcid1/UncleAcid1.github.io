/* Brownie Digital: pixel guinea pigs walking along the top edge of the
   Microsampler section, in groups of 3 to 6 (usually 4); now and then a
   second group follows the first. Every so often the one at the back stops,
   turns to look at you, turns back, notices the others have gone on, panics
   and runs to catch up. Sometimes the third one does it instead, and the
   ones stuck behind it stomp about, fuming. Random coats on every visit,
   except one pig on screen at a time: white and ginger, like the owner's
   plush one. Drawn on a small canvas, scaled up with no smoothing. */
(function () {
  "use strict";
  var host = document.getElementById("microsampler");
  if (!host) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var COATS = ["#f4efe6", "#e9d3a4", "#d98a3a", "#b4622a", "#7a4a26", "#4a2c19", "#211a17", "#9a948d", "#c9b8a6"];
  var OUT = "#140d0a", EYE = "#0a0606", PINK = "#e8a0a0", NOSE = "#d9777f", SHINE = "#ffffff";
  // the plush one: cream body, ginger patches round the eyes and ears, a cream blaze, tan paws
  var PLUSH = { cream: "#f6f0e4", ginger: "#c0672a", ear: "#ecbfcb", nose: "#e3a6ae", paw: "#c8a27a" };
  var W = 22, H = 15;                 // sprite cell, in art pixels (feet on the bottom row)

  function pick(n) {
    var a = COATS.slice(), out = [];
    while (out.length < n) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
    return out;
  }

  // ---------------------------------------------------------------- sprites
  // A sprite is a W x H grid of colours (or null). Built from a body mask, then outlined.
  function blank() { var g = []; for (var y = 0; y < H; y++) { g.push(new Array(W).fill(null)); } return g; }
  function inEllipse(x, y, cx, cy, rx, ry) { var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; }

  function sprite(pig, pose, step) {
    var g = blank(), c = pig.coat, pat = pig.pattern, plush = pig.plush;
    var FEET = plush ? PLUSH.paw : PINK, EAR = plush ? PLUSH.ear : PINK, NOSE_C = plush ? PLUSH.nose : NOSE;
    var bob = (pose === "run" ? (step ? -1 : 0) : 0), shake = (pose === "panic" || pose === "angry") ? (step ? 1 : -1) : 0;
    var stretch = pose === "run" ? 1 : 0;
    var by = 8 + bob;                           // body centre row
    function coatAt(x) {                        // the coat pattern along the body
      if (plush) return PLUSH.cream;
      if (pat === 0) return x < 7 ? c[0] : x < 12 ? c[1] : c[2];
      if (pat === 1) return x < 9 ? c[1] : c[0];
      return (x > 5 && x < 10) ? c[2] : c[0];
    }
    // body: a loaf
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (inEllipse(x, y, 9.5 + shake, by, 8.2 + stretch, 4.4 - stretch * 0.4)) g[y][x] = coatAt(x - shake);
    }
    var hx = 15.5 + shake + stretch, hy = by - 1.4;
    if (pose === "look") {
      // head turned to face you: round, two eyes, a pink nose, ears both sides
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inEllipse(x, y, hx - 0.5, hy, 3.9, 3.6))
        g[y][x] = plush ? (Math.abs(x + 0.5 - (hx - 0.5)) < 1.2 || y > hy + 1 ? PLUSH.cream : PLUSH.ginger) : c[pig.headCoat];
      if (plush) { set(g, Math.round(hx - 5), Math.round(hy - 3), PLUSH.ginger); set(g, Math.round(hx + 3), Math.round(hy - 3), PLUSH.ginger); }
      set(g, Math.round(hx - 4), Math.round(hy - 3), EAR); set(g, Math.round(hx + 2), Math.round(hy - 3), EAR);
      set(g, Math.round(hx - 2), Math.round(hy - 0.5), EYE); set(g, Math.round(hx + 0), Math.round(hy - 0.5), EYE);
      set(g, Math.round(hx - 2), Math.round(hy - 1.5), SHINE); set(g, Math.round(hx + 0), Math.round(hy - 1.5), SHINE);
      set(g, Math.round(hx - 1), Math.round(hy + 1), NOSE_C);
    } else {
      // head in profile, facing right
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inEllipse(x, y, hx, hy, 3.7, 3.3))
        g[y][x] = plush ? (x + 0.5 > hx + 2.4 || y > hy + 1.8 ? PLUSH.cream : PLUSH.ginger) : c[pig.headCoat];   // the plush: ginger round the eye, cream muzzle
      if (plush) set(g, Math.round(hx - 2), Math.round(hy - 3.2), PLUSH.ginger);
      set(g, Math.round(hx - 1), Math.round(hy - 3.2), EAR);                      // ear
      var ex = Math.round(hx + 1), ey = Math.round(hy - 0.6);
      if (pose === "panic") { set(g, ex, ey, EYE); set(g, ex, ey - 1, EYE); set(g, ex + 1, ey - 1, SHINE); }  // wide eye
      else if (pose === "angry") { set(g, ex, ey, EYE); set(g, ex - 1, ey - 2, OUT); set(g, ex, ey - 1, OUT); set(g, ex + 1, ey - 1, OUT); }  // scowl
      else set(g, ex, ey, EYE);
      set(g, Math.round(hx + 3.4), Math.round(hy + 1), NOSE_C);
    }
    // feet: little pink nubs, swapping as it walks
    var fy = H - 1, backF = [4, 7], frontF = [12, 15];
    var a = step ? 1 : 0;
    if (pose === "run") { backF = step ? [2, 6] : [4, 8]; frontF = step ? [14, 17] : [11, 15]; fy = H - 1 + bob; }
    if (pose === "look" || pose === "stand") a = 0;
    if (pose === "angry") { a = 0; fy = H - 1 - (step ? 1 : 0); }   // a foot stamped
    [backF[0] + a, backF[1] - a, frontF[0] - a, frontF[1] + a].forEach(function (fx) { set(g, fx + shake, fy, FEET); set(g, fx + shake, fy - 1, FEET); });   // two rows: they reach the body
    return outline(g);
  }
  function set(g, x, y, col) { if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = col; }
  function outline(g) {
    var o = blank();
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (g[y][x]) { o[y][x] = g[y][x]; continue; }
      var n = (g[y - 1] && g[y - 1][x]) || (g[y + 1] && g[y + 1][x]) || g[y][x - 1] || g[y][x + 1];
      if (n && n !== PINK && n !== PLUSH.paw) o[y][x] = OUT;
    }
    return o;
  }

  // ---------------------------------------------------------------- the line
  var cv = document.createElement("canvas");
  cv.className = "pigs"; cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);
  var g = cv.getContext("2d");
  var px = 3, cssW = 0, cssH = 0;
  var groups = [], gap = 0;

  function makePig(plush) {
    return { coat: pick(3), pattern: Math.floor(Math.random() * 3), headCoat: Math.floor(Math.random() * 3), plush: plush, cache: {} };
  }
  function groupSize() { var r = Math.random(); return r < 0.12 ? 3 : r < 0.74 ? 4 : r < 0.9 ? 5 : 6; }
  function spacing() { return (W + 4) * px; }

  function resize() {
    px = innerWidth < 600 ? 2 : 3;
    cssW = host.clientWidth; cssH = (H + 9) * px;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    cv.style.width = cssW + "px"; cv.style.height = cssH + "px"; cv.style.top = -cssH + "px";
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    groups.forEach(function (gp) { gp.pigs.forEach(function (p) { p.cache = {}; }); });
  }
  function draw(p, pose, step, x, y) {
    var k = pose + step, s = p.cache[k];
    if (!s) {
      s = document.createElement("canvas"); s.width = W; s.height = H;
      var sg = s.getContext("2d"), art = sprite(p, pose, step);
      for (var yy = 0; yy < H; yy++) for (var xx = 0; xx < W; xx++) if (art[yy][xx]) { sg.fillStyle = art[yy][xx]; sg.fillRect(xx, yy, 1, 1); }
      p.cache[k] = s;
    }
    g.drawImage(s, Math.round(x), Math.round(y), W * px, H * px);
  }
  function mark(text, x, y) {             // a little pixel "!", "?" or cross anger vein above a head
    var dots = text === "!" ? [[0, 0], [0, 1], [0, 2], [0, 4]]
      : text === "#" ? [[1, 0], [3, 0], [0, 1], [1, 1], [3, 1], [4, 1], [0, 3], [1, 3], [3, 3], [4, 3], [1, 4], [3, 4]]
      : [[0, 0], [1, 0], [2, 1], [1, 2], [1, 4]];
    g.fillStyle = OUT;                    // a dark edge so it reads on the brown
    dots.forEach(function (d) { g.fillRect(Math.round(x + d[0] * px - px * 0.5), Math.round(y + d[1] * px - px * 0.5), px * 2, px * 2); });
    g.fillStyle = text === "#" ? "#ff3b2f" : "#ffe970";
    dots.forEach(function (d) { g.fillRect(Math.round(x + d[0] * px), Math.round(y + d[1] * px), px, px); });
  }

  // ---------------------------------------------------------------- a group
  // Pig 0 is at the back, pig n-1 in front. Everyone walks at one speed; a pig
  // doing its routine falls behind (lag), and the ones behind it can't pass.
  var SPEED = 26, STEP = 9, CLOSE = 0.72;     // css px per second, px per foot swap, how close a blocked pig bunches up
  function pickWho(gp) { return gp.n >= 4 && Math.random() < 0.35 ? 2 : 0; }   // the back one, or sometimes the third
  function spawn(lead, canFollow) {
    var n = groupSize(), sp = spacing();
    var plushAt = groups.some(function (o) { return o.plushAt >= 0; }) ? -1 : Math.floor(Math.random() * n);   // one plush pig on screen at most
    var gp = { n: n, lead: lead, lag: [], pigs: [], state: "walk", t: 0, dist: 0, nextStop: 10 + Math.random() * 10, plushAt: plushAt,
               follow: canFollow && Math.random() < 0.12 ? Math.max(3 * sp, (0.3 + Math.random() * 0.3) * cssW) : -1 };
    for (var i = 0; i < n; i++) { gp.lag.push(0); gp.pigs.push(makePig(i === plushAt)); }
    gp.who = pickWho(gp);
    groups.push(gp);
  }
  function xOf(gp, i) { return gp.lead - (gp.n - 1 - i) * spacing() - gp.lag[i]; }
  function rearX(gp) { var m = Infinity; for (var i = 0; i < gp.n; i++) m = Math.min(m, xOf(gp, i)); return m; }
  function anyLag(gp) { return gp.lag.some(function (v) { return v > 0; }); }

  function step(gp, dt) {
    var sp = spacing(), w = gp.who;
    gp.lead += SPEED * dt; gp.dist += SPEED * dt; gp.t += dt;
    var xw = xOf(gp, w);
    // the routine, only while the whole group is on screen and that pig isn't near the far edge
    if (gp.state === "walk" && gp.t > gp.nextStop && rearX(gp) > cssW * 0.02 && xw > cssW * 0.12 && xw < cssW * 0.8) { gp.state = "stop"; gp.t = 0; }
    var s = gp.state;
    if (s === "stop") { gp.lag[w] += SPEED * dt; if (gp.t > 0.35) { gp.state = "look"; gp.t = 0; } }
    else if (s === "look") { gp.lag[w] += SPEED * dt; if (gp.t > 1.3) { gp.state = "turn"; gp.t = 0; } }
    else if (s === "turn") { gp.lag[w] += SPEED * dt; if (gp.t > 0.5) { gp.state = "panic"; gp.t = 0; } }
    else if (s === "panic") { gp.lag[w] += SPEED * dt; if (gp.t > 0.6) { gp.state = "run"; gp.t = 0; } }
    else if (s === "run") {
      for (var r = 0; r <= w; r++) gp.lag[r] = Math.max(0, gp.lag[r] - SPEED * 2.6 * dt);
      if (!anyLag(gp)) { gp.state = "walk"; gp.t = 0; gp.who = pickWho(gp); gp.nextStop = 14 + Math.random() * 14; }
    }
    // the ones behind can't walk through it: they close up and wait
    for (var b = w - 1; b >= 0; b--) gp.lag[b] = Math.max(gp.lag[b], gp.lag[b + 1] - sp * (1 - CLOSE));
  }

  function paint(gp) {
    var y = cssH - H * px, st0 = Math.floor(gp.dist / STEP) % 2, w = gp.who, s = gp.state, t = gp.t;
    for (var i = gp.n - 1; i >= 0; i--) {
      var p = gp.pigs[i], x = xOf(gp, i), pose = "walk", st = st0, cross = false;
      if (i === w) {
        if (s === "stop" || s === "turn") { pose = "stand"; st = 0; }
        else if (s === "look") { pose = "look"; st = 0; }
        else if (s === "panic") { pose = "panic"; st = Math.floor(t * 14) % 2; }
        else if (s === "run") { pose = "run"; st = Math.floor(t * 12) % 2; }
      } else if (i < w && gp.lag[i] > 0) {
        cross = true;
        if (s === "run") { pose = "run"; st = Math.floor(t * 12 + i) % 2; }
        else if (gp.lag[i] > 1) { pose = "angry"; st = Math.floor(t * 9 + i) % 2; }   // stuck: stomping
      }
      if (x < -W * px || x > cssW) continue;
      draw(p, pose, st, x, y);
      if (i === w && s === "panic") { mark("!", x + 15 * px, y - 7 * px); mark("!", x + 17 * px, y - 7 * px); }
      if (i === w && s === "turn" && t > 0.25) mark("?", x + 15 * px, y - 7 * px);
      if (cross && gp.lag[i] > 1) mark("#", x + 13 * px, y - 7 * px - (Math.floor(t * 4 + i) % 2) * px);
    }
  }

  function frame(dt) {
    var sp = spacing();
    groups.forEach(function (gp) { step(gp, dt); });
    // a group behind another never walks into it
    for (var k = 1; k < groups.length; k++) groups[k].lead = Math.min(groups[k].lead, rearX(groups[k - 1]) - sp * 1.2);
    // now and then a second group sets off behind the first
    groups.slice().forEach(function (gp) { if (gp.follow > 0 && rearX(gp) > gp.follow) { gp.follow = -1; spawn(-W * px, false); } });
    // gone only once every pig, stragglers included, is past the right edge
    groups = groups.filter(function (gp) { return rearX(gp) <= cssW; });
    if (!groups.length) { gap -= dt; if (gap <= 0) { spawn(-W * px, true); gap = 0.5 + Math.random() * 2.5; } }
    g.clearRect(0, 0, cssW, cssH);
    groups.forEach(paint);
  }

  resize();
  addEventListener("resize", resize);
  spawn(cssW * (0.35 + Math.random() * 0.4), true);      // already on their way when the page opens
  if (still) {                            // no motion: one group, standing in a row
    var gp0 = groups[0], y0 = cssH - H * px;
    gp0.pigs.forEach(function (p, i) { draw(p, i === 0 ? "look" : "stand", 0, cssW * 0.2 + i * spacing(), y0); });
    return;
  }
  var visible = true, last = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: "80px" }).observe(cv);
  function loop(ts) {
    var dt = Math.min(0.1, (ts - last) / 1000 || 0); last = ts;
    if (visible && !document.hidden) frame(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
