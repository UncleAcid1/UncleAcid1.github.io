/* Brownie Digital: four pixel guinea pigs walking along the top edge of the
   Microsampler section. Every so often the one at the back stops, turns to
   look at you, turns back, notices the others have gone on, panics and runs
   to catch up, then falls back into step. Sometimes the third one does it
   instead, and the two stuck behind it stomp about, fuming. Each pig gets three random coat
   colours on every visit. Drawn on a small canvas, scaled up with no smoothing. */
(function () {
  "use strict";
  var host = document.getElementById("microsampler");
  if (!host) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var COATS = ["#f4efe6", "#e9d3a4", "#d98a3a", "#b4622a", "#7a4a26", "#4a2c19", "#211a17", "#9a948d", "#c9b8a6"];
  var OUT = "#140d0a", EYE = "#0a0606", PINK = "#e8a0a0", NOSE = "#d9777f", SHINE = "#ffffff";
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
    var g = blank(), c = pig.coat, pat = pig.pattern;
    var bob = (pose === "run" ? (step ? -1 : 0) : 0), shake = (pose === "panic" || pose === "angry") ? (step ? 1 : -1) : 0;
    var stretch = pose === "run" ? 1 : 0;
    var by = 8 + bob;                           // body centre row
    function coatAt(x) {                        // the coat pattern along the body
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
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inEllipse(x, y, hx - 0.5, hy, 3.9, 3.6)) g[y][x] = c[pig.headCoat];
      set(g, Math.round(hx - 4), Math.round(hy - 3), PINK); set(g, Math.round(hx + 2), Math.round(hy - 3), PINK);
      set(g, Math.round(hx - 2), Math.round(hy - 0.5), EYE); set(g, Math.round(hx + 0), Math.round(hy - 0.5), EYE);
      set(g, Math.round(hx - 2), Math.round(hy - 1.5), SHINE); set(g, Math.round(hx + 0), Math.round(hy - 1.5), SHINE);
      set(g, Math.round(hx - 1), Math.round(hy + 1), NOSE);
    } else {
      // head in profile, facing right
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (inEllipse(x, y, hx, hy, 3.7, 3.3)) g[y][x] = c[pig.headCoat];
      set(g, Math.round(hx - 1), Math.round(hy - 3.2), PINK);                     // ear
      var ex = Math.round(hx + 1), ey = Math.round(hy - 0.6);
      if (pose === "panic") { set(g, ex, ey, EYE); set(g, ex, ey - 1, EYE); set(g, ex + 1, ey - 1, SHINE); }  // wide eye
      else if (pose === "angry") { set(g, ex, ey, EYE); set(g, ex - 1, ey - 2, OUT); set(g, ex, ey - 1, OUT); set(g, ex + 1, ey - 1, OUT); }  // scowl
      else set(g, ex, ey, EYE);
      set(g, Math.round(hx + 3.4), Math.round(hy + 1), NOSE);
    }
    // feet: little pink nubs, swapping as it walks
    var fy = H - 1, backF = [4, 7], frontF = [12, 15];
    var a = step ? 1 : 0;
    if (pose === "run") { backF = step ? [2, 6] : [4, 8]; frontF = step ? [14, 17] : [11, 15]; fy = H - 1 + bob; }
    if (pose === "look" || pose === "stand") a = 0;
    if (pose === "angry") { a = 0; fy = H - 1 - (step ? 1 : 0); }   // a foot stamped
    [backF[0] + a, backF[1] - a, frontF[0] - a, frontF[1] + a].forEach(function (fx) { set(g, fx + shake, fy, PINK); set(g, fx + shake, fy - 1, PINK); });   // two rows: they reach the body
    return outline(g);
  }
  function set(g, x, y, col) { if (y >= 0 && y < H && x >= 0 && x < W) g[y][x] = col; }
  function outline(g) {
    var o = blank();
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
      if (g[y][x]) { o[y][x] = g[y][x]; continue; }
      var n = (g[y - 1] && g[y - 1][x]) || (g[y + 1] && g[y + 1][x]) || g[y][x - 1] || g[y][x + 1];
      if (n && n !== PINK) o[y][x] = OUT;
    }
    return o;
  }

  // ---------------------------------------------------------------- the line
  var cv = document.createElement("canvas");
  cv.className = "pigs"; cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);
  var g = cv.getContext("2d");
  var px = 3, cssW = 0, cssH = 0;
  var pigs = [0, 1, 2, 3].map(function () { return { coat: pick(3), pattern: Math.floor(Math.random() * 3), headCoat: Math.floor(Math.random() * 3), cache: {} }; });

  function resize() {
    px = innerWidth < 600 ? 2 : 3;
    cssW = host.clientWidth; cssH = (H + 9) * px;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    cv.style.width = cssW + "px"; cv.style.height = cssH + "px"; cv.style.top = -cssH + "px";
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    pigs.forEach(function (p) { p.cache = {}; });
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

  // walking: everyone shares one distance; a pig doing its routine falls behind
  // (usually the back one; sometimes the third, and then the two behind it
  // bump into it, stomp and fume until it gets going again)
  var SPEED = 26, STEP = 9, CLOSE = 0.72;     // css px per second, px per foot swap, how close a blocked pig bunches up
  var dist = 0, lag = [0, 0, 0, 0], who = Math.random() < 0.35 ? 2 : 0, state = "walk", t = 0, nextStop = 6 + Math.random() * 8;
  function spacing() { return (W + 4) * px; }
  function anyLag() { return lag[0] > 0 || lag[1] > 0 || lag[2] > 0; }

  function frame(dt) {
    dist += SPEED * dt;
    t += dt;
    var sp = spacing(), span = cssW + sp * 4.2;      // back on screen soon after leaving
    var lead = (dist % span) - sp;                   // the front pig's left edge
    var whoX = lead - (3 - who) * sp - lag[who];
    // the routine, only while that pig is on screen
    if (state === "walk" && t > nextStop && whoX > cssW * 0.12 && lead < cssW * 0.85 && lead - 3 * sp > cssW * 0.02) { state = "stop"; t = 0; }
    if (state === "stop") { lag[who] += SPEED * dt; if (t > 0.35) { state = "look"; t = 0; } }
    else if (state === "look") { lag[who] += SPEED * dt; if (t > 1.3) { state = "turn"; t = 0; } }
    else if (state === "turn") { lag[who] += SPEED * dt; if (t > 0.5) { state = "panic"; t = 0; } }
    else if (state === "panic") { lag[who] += SPEED * dt; if (t > 0.6) { state = "run"; t = 0; } }
    else if (state === "run") {
      for (var r = 0; r <= who; r++) lag[r] = Math.max(0, lag[r] - SPEED * 2.6 * dt);
      if (!anyLag()) { state = "walk"; t = 0; who = Math.random() < 0.35 ? 2 : 0; nextStop = 9 + Math.random() * 12; }
    }
    // the ones behind can't walk through it: they close up and wait
    for (var b = who - 1; b >= 0; b--) lag[b] = Math.max(lag[b], lag[b + 1] - sp * (1 - CLOSE));
    if (lead > cssW + sp * 0.5 && anyLag() && state !== "run") { state = "run"; t = 0; }   // never get left behind for good
    g.clearRect(0, 0, cssW, cssH);
    var y = cssH - H * px, step = Math.floor(dist / STEP) % 2;
    for (var i = 3; i >= 0; i--) {
      var p = pigs[i], x = lead - (3 - i) * sp - lag[i], pose = "walk", st = step, cross = false;
      if (i === who) {
        if (state === "stop" || state === "turn") { pose = "stand"; st = 0; }
        else if (state === "look") { pose = "look"; st = 0; }
        else if (state === "panic") { pose = "panic"; st = Math.floor(t * 14) % 2; }
        else if (state === "run") { pose = "run"; st = Math.floor(t * 12) % 2; }
      } else if (i < who && lag[i] > 0) {
        cross = true;
        if (state === "run") { pose = "run"; st = Math.floor(t * 12 + i) % 2; }
        else if (lag[i] > 1) { pose = "angry"; st = Math.floor(t * 9 + i) % 2; }   // stuck: stomping
      }
      if (x < -W * px || x > cssW) continue;
      draw(p, pose, st, x, y);
      if (i === who && state === "panic") { mark("!", x + 15 * px, y - 7 * px); mark("!", x + 17 * px, y - 7 * px); }
      if (i === who && state === "turn" && t > 0.25) mark("?", x + 15 * px, y - 7 * px);
      if (cross && lag[i] > 1) mark("#", x + 13 * px, y - 7 * px - (Math.floor(t * 4 + i) % 2) * px);
    }
  }

  resize();
  addEventListener("resize", resize);
  dist = spacing() * 4 + Math.random() * cssW * 0.5;      // already on their way when the page opens
  if (still) {                            // no motion: the four of them, standing in a row
    var y0 = cssH - H * px;
    pigs.forEach(function (p, i) { draw(p, i === 0 ? "look" : "stand", 0, cssW * 0.2 + i * spacing(), y0); });
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
