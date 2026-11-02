/* TurboSwine's page: guinea pigs, the wavefolder toy, and the song players. */
(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  // ---------------------------------------------------------------- the pigs
  // Coats as on the rest of the site; two frames, drawn once to a small canvas and used as a background.
  var COATS = [["#f6f0e4", "#c0672a"], ["#d98a3a", "#f4efe6"], ["#7a4a26", "#e9d3a4"], ["#211a17", "#f4efe6"], ["#9a948d", "#4a2c19"], ["#e9d3a4", "#b4622a"]];
  var W = 22, H = 15, OUT = "#140d0a", PINK = "#e8a0a0";
  var sheets = {};
  function sheet(coat) {
    if (sheets[coat]) return sheets[coat];
    var c = document.createElement("canvas"); c.width = W * 2; c.height = H;
    var g = c.getContext("2d"), cols = COATS[coat % COATS.length];
    function ell(x, y, cx, cy, rx, ry) { var a = (x + .5 - cx) / rx, b = (y + .5 - cy) / ry; return a * a + b * b <= 1; }
    for (var f = 0; f < 2; f++) {
      var art = [], x, y;
      for (y = 0; y < H; y++) { art.push(new Array(W).fill(null)); }
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (ell(x, y, 9.5, 8, 8.2, 4.4)) art[y][x] = x < 8 ? cols[1] : cols[0];
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (ell(x, y, 15.5, 6.6, 3.7, 3.3)) art[y][x] = cols[0];
      art[3][15] = PINK; art[6][17] = "#0a0606"; art[8][19] = "#d9777f";
      var a = f ? 1 : 0;
      [4 + a, 7 - a, 12 - a, 15 + a].forEach(function (fx) { art[14][fx] = PINK; art[14][fx + 1] = PINK; });
      var o = art.map(function (r) { return r.slice(); });
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (!art[y][x]) {
        var n = (art[y - 1] && art[y - 1][x]) || (art[y + 1] && art[y + 1][x]) || art[y][x - 1] || art[y][x + 1];
        if (n && n !== PINK) o[y][x] = OUT;
      }
      for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (o[y][x]) { g.fillStyle = o[y][x]; g.fillRect(x + f * W, y, 1, 1); }
    }
    return (sheets[coat] = c.toDataURL());
  }
  // the pigs in the pipes: one camera, a little above and in front, in eight directions (the three on the left are
  // these, mirrored). A = coat, B = its patch, O = outline, P = pink, E = eye, N = nose; 1 and 2 are the feet of each step
  var TUBE_PIG = {
    E: ["................", "................", "................", "..........OO....", ".....OOOOOPPOO..", "...OOBBBAAAAAAO.", "..OBBBBBAAAAEAO.", ".OBBBBBAAAAAAAAO", ".OBBBBAAAAAAAANO", ".OBBBBAAAAAAAOO.", "..OBBAAAAAAAO...", "...OOOOOOOOO....", "....1..2..1..2..", "................", "................", "................"],
    SE: ["................", "................", "....OOOOOO......", "..OOBBBBAAOO....", ".OBBBBBAAAAAOO..", ".OBBBBAAAAAAOPO.", ".OBBBAAAAAAAAAO.", "..OBAAAAAEAAEAO.", "..OBAAAAAAANNAO.", "...OAAAAAAAAAO..", "....OOAAAAAOO...", "......OOOOO.....", ".....1.2..1.2...", "................", "................", "................"],
    S: ["................", "................", "....OOOOOOOO....", "...OBBBAAAAAO...", "..OBBBBAAAAAAO..", "..OBBBAAAAAAAO..", ".OPPAAAAAAAAPPO.", "..OAAAAAAAAAAO..", "..OAAEAAAAEAAO..", "..OAAAANNAAAAO..", "...OAAAAAAAAO...", "....OOOOOOOO....", ".....1.2.1.2....", "................", "................", "................"],
    NE: ["................", "................", ".........OOOO...", "........OPPAAAO.", ".....OOOOAAAEAO.", "...OOBBAAAAAAAO.", "..OBBBBAAAAAAAO.", ".OBBBBBAAAAAAO..", ".OBBBBBAAAAAAO..", ".OBBBBBBAAAAO...", "..OBBBBBAAOO....", "...OOOOOOO......", "....1.2.1.2.....", "................", "................", "................"],
    N: ["................", "......OOOO......", "....OPOAAOPO....", "....OAAAAAAO....", "...OAAAAAAAAO...", "..OBAAAAAAAAAO..", "..OBBAAAAAAAAO..", ".OBBBAAAAAAAAAO.", ".OBBBBAAAAAAAAO.", ".OBBBBBAAAAAAAO.", "..OBBBBBAAAAAO..", "...OOOOOOOOOO...", "....1..2..1.2...", "................", "................", "................"]
  };
  var tubeSheets = {};
  function tubeSheet(coat, view) {
    var key = coat + view;
    if (tubeSheets[key]) return tubeSheets[key];
    var c = document.createElement("canvas"); c.width = 32; c.height = 16;
    var g = c.getContext("2d"), cols = COATS[coat % COATS.length];
    var ink = { O: OUT, A: cols[0], B: cols[1], P: PINK, E: "#0a0606", N: "#d9777f" };
    for (var f = 0; f < 2; f++) TUBE_PIG[view].forEach(function (row, y) {
      for (var x = 0; x < 16; x++) {
        var ch = row[x], colour = ink[ch];
        if (ch === String(f + 1)) colour = PINK;
        if (colour) { g.fillStyle = colour; g.fillRect(x + f * 16, y, 1, 1); }
      }
    });
    return (tubeSheets[key] = c.toDataURL());
  }
  function dress(el, coat) { el.style.backgroundImage = "url(" + sheet(coat) + ")"; }
  document.querySelectorAll(".pig").forEach(function (el) { dress(el, +el.dataset.coat || 0); });
  // the menu bar clock, as on the rest of the site
  var clock = document.getElementById("clock");
  function tickClock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    clock.textContent = ((h + 11) % 12 + 1) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
  }
  if (clock) { tickClock(); setInterval(tickClock, 15000); }

  // ---------------------------------------------------------------- the pipes
  // Each section measures its own free space (under its content, the margins beside it, the strip above it) and lays
  // its pipes only there: anything that would touch the content is dropped. When a section changes size (a font or
  // an image arriving, a resize), that section's pipes are worked out again. Pigs make their own trips, never to a
  // timetable, and very rarely one noses out of a stub.
  var THICK = 42, R = 28, CLEAR = 6, HALF = THICK / 2, SVG = "http://www.w3.org/2000/svg", COVER = 66, DAY = 1000, BEYOND = 30, HEAD = 34;
  function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }
  function pick(n) { return Math.floor(Math.random() * n); }
  // the layout is irregular but fixed: each section always gets the same pipes, from a number made of its name
  var layoutState = 0;
  function seedLayout(name) { layoutState = 0; for (var i = 0; i < name.length; i++) layoutState = (layoutState * 31 + name.charCodeAt(i)) | 0; }
  function layout() {
    layoutState = (layoutState + 0x6D2B79F5) | 0;
    var t = Math.imul(layoutState ^ (layoutState >>> 15), 1 | layoutState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function layoutBetween(lo, hi) { return lo + layout() * (hi - lo); }
  function bend(x, y, clockwise) { return " A " + R + " " + R + " 0 0 " + (clockwise ? 1 : 0) + " " + x + " " + y; }

  function freeSpace(sec) {
    var box = sec.getBoundingClientRect(), wrap = sec.querySelector(":scope > .wrap");
    var w = wrap.getBoundingClientRect(), bottom = 0, top = sec.clientHeight;
    [].forEach.call(wrap.children, function (el) {
      var r = el.getBoundingClientRect();
      if (r.height) { bottom = Math.max(bottom, r.bottom - box.top + 8); top = Math.min(top, r.top - box.top); }   // (+8: the cards' hard shadows)
    });
    return { w: sec.clientWidth, h: sec.clientHeight, left: w.left - box.left, right: box.right - w.right, top: top, bottom: bottom };
  }
  // the long tube along the bottom: flat lengths, rises and dips, and (with room) a climb up each margin.
  // `runs` are its straight lengths, the only places a pipe has joints
  function tubeLine(f) {
    var base = f.h - 76, runs = [];
    if (base - HALF - CLEAR < f.bottom) return null;
    var riseL = f.left >= 110 && layout() < .6, riseR = f.right >= 110 && layout() < .6;
    var left = riseL ? Math.round(layoutBetween(42, f.left - 30)) : -50, right = riseR ? f.w - Math.round(layoutBetween(42, f.right - 30)) : f.w + 50;
    var d, cx, cy;
    function straight(x, y) { runs.push([cx, cy, x, y]); d += x === cx ? " V " + y : " H " + x; cx = x; cy = y; }
    function arc(x, y, clockwise) { d += bend(x, y, clockwise); cx = x; cy = y; }
    if (riseL) {
      cx = left; cy = Math.round(layoutBetween(Math.max(44, f.h * .12), f.h * .55)); d = "M " + cx + " " + cy;
      straight(left, base - R); arc(left + R, base, false);
    } else { cx = left; cy = base; d = "M " + cx + " " + cy; }
    var stop = (riseR ? right - R : f.w + 20) - 90, x = Math.max(cx, 0) + Math.round(layoutBetween(90, 260));
    while (x + 100 + R < stop) {
      var rise = Math.round(layoutBetween(58, 72)), up = layout() < .65 && base - rise - HALF - CLEAR >= f.bottom;
      var y2 = up ? base - rise : base + 56, x2 = x + Math.round(layoutBetween(100, 240));
      if (x2 + R >= stop) break;
      straight(x - R, base);
      if (up) { arc(x, base - R, false); straight(x, y2 + R); arc(x + R, y2, true); straight(x2 - R, y2); arc(x2, y2 + R, true); straight(x2, base - R); arc(x2 + R, base, false); }
      else { arc(x, base + R, true); arc(x + R, y2, false); straight(x2 - R, y2); arc(x2, y2 - R, false); arc(x2 + R, base, true); }
      x = x2 + R + Math.round(layoutBetween(90, 340));
    }
    if (riseR) { straight(right - R, base); arc(right, base - R, false); straight(right, Math.round(layoutBetween(Math.max(44, f.h * .12), f.h * .55))); }
    else straight(right, base);
    return { d: d, runs: runs, capStart: riseL, capEnd: riseR };
  }
  // short pipes poking through a wall, each ending in a cap; `walk` runs past the cap for a pig's head
  function stubs(f, main) {
    var list = [], used = [];
    function side(onLeft) {
      var room = onLeft ? f.left : f.right, y = Math.round(layoutBetween(f.h * .15, Math.min(f.h * .75, f.h - 190))), length = Math.round(room - HEAD - CLEAR - 8);
      if (length < 26) return;
      if (onLeft) list.push({ d: "M -50 " + y + " H " + length, walk: "M -50 " + y + " H " + (length + BEYOND), runs: [[0, y, length, y]] });
      else list.push({ d: "M " + (f.w + 50) + " " + y + " H " + (f.w - length), walk: "M " + (f.w + 50) + " " + y + " H " + (f.w - length - BEYOND), flip: true, runs: [[f.w, y, f.w - length, y]] });
    }
    if (!main || !main.capStart) if (layout() < .7) side(true);
    if (!main || !main.capEnd) if (layout() < .7) side(false);
    // down from the ceiling, when the strip above the content has room for it and a head
    var low = f.top - HEAD - CLEAR - 8;
    if (low >= 14) for (var i = 0, n = Math.floor(layout() * 3); i < n; i++) {
      var x = Math.round(layoutBetween(f.w * .4, f.w - 40));
      if (used.some(function (u) { return Math.abs(u - x) < 110; })) continue;
      used.push(x);
      var y = Math.round(layoutBetween(14, Math.min(low, 30)));
      list.push({ d: "M " + x + " -50 V " + y, walk: "M " + x + " -50 V " + (y + BEYOND), runs: [] });
    }
    return list;
  }
  // the walls and floor go under the pigs; the blue glass, joints and caps go over them. The glass stops at the
  // mouth, so whatever a pig pokes past the cap is out in the open, in its own colours
  function pipeInto(under, over, d, runs, edge, glass) {
    function one(svg, width, colour, opacity) {
      var p = document.createElementNS(SVG, "path");
      p.setAttribute("d", d); p.setAttribute("fill", "none"); p.setAttribute("stroke", colour); p.setAttribute("stroke-width", width);
      if (opacity) p.setAttribute("stroke-opacity", opacity);
      svg.appendChild(p);
      return p;
    }
    var outer = one(under, THICK, edge);
    one(under, THICK - 6, glass);
    one(over, THICK - 6, "#6fb4ec", ".16");
    var joints = "";
    runs.forEach(function (r) {
      var dx = r[2] - r[0], dy = r[3] - r[1], len = Math.hypot(dx, dy);
      for (var at = layoutBetween(45, 90); at < len - 45; at += layoutBetween(105, 150)) {
        var x = r[0] + dx / len * at, y = r[1] + dy / len * at;
        joints += dy === 0 ? "M " + x.toFixed(1) + " " + (y - HALF) + " V " + (y + HALF) : "M " + (x - HALF) + " " + y.toFixed(1) + " H " + (x + HALF);
      }
    });
    if (joints) {
      var j = document.createElementNS(SVG, "path");
      j.setAttribute("d", joints); j.setAttribute("stroke", edge); j.setAttribute("stroke-width", 3); j.setAttribute("fill", "none");
      over.appendChild(j);
    }
    return outer;
  }
  function rim(svg, at, from, edge) {
    var flat = Math.abs(at.y - from.y) < .5, r = document.createElementNS(SVG, "rect");
    r.setAttribute("x", at.x - (flat ? 7 : HALF + 5)); r.setAttribute("y", at.y - (flat ? HALF + 5 : 7));
    r.setAttribute("width", flat ? 14 : THICK + 10); r.setAttribute("height", flat ? THICK + 10 : 14);
    r.setAttribute("fill", edge);
    svg.appendChild(r);
  }
  function seen(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }
  function newPig(box, d, coat) {
    var p = document.createElement("i");
    p.className = "pig";
    p.style.backgroundImage = "url(" + tubeSheet(coat, "E") + ")";
    p.style.offsetPath = "path('" + d + "')";
    p.coat = coat;
    p.track = document.createElementNS(SVG, "path");
    p.track.setAttribute("d", d);
    box.insertBefore(p, box.lastChild);
    return p;
  }
  // a trip along the main tube: alone or in a little gang, either way, at its own pace; some think better of it halfway
  function trips(sec, gen, box, line, from, to) {
    function again(ms) { setTimeout(function () { if (sec.tubeGen === gen) trips(sec, gen, box, line, from, to); }, ms); }
    if (!seen(sec)) { again(2500); return; }
    var n = 1 + pick(pick(3) ? 2 : 4), speed = rnd(24, 48), back = Math.random() < .35, gap = rnd(52, 80), longest = 0, doubt = Math.random() < .55;
    for (var i = 0; i < n; i++) (function (i) {
      var a = back ? to : from, z = back ? from : to, turn = from + (to - from) * rnd(.3, .7), run = Math.abs(z - a), ms, steps;
      var pig = newPig(box, line, pick(COATS.length));
      pig.style.opacity = 0;
      if (doubt) {
        var there = Math.abs(turn - a) / speed * DAY, TURN = 950;      // (it stops, looks at us, and heads back: see facing)
        ms = there * 2 + TURN;
        steps = [{ offsetDistance: a + "px", opacity: 1, offset: 0 }, { offsetDistance: turn + "px", opacity: 1, offset: there / ms },
                 { offsetDistance: turn + "px", opacity: 1, offset: (there + TURN) / ms }, { offsetDistance: a + "px", opacity: 1, offset: 1 }];
      } else {
        ms = run / speed * DAY;
        steps = [{ offsetDistance: a + "px", opacity: 1 }, { offsetDistance: z + "px", opacity: 1 }];
      }
      longest = Math.max(longest, ms + i * gap / speed * DAY);
      pig.animate(steps, { duration: ms, delay: i * gap / speed * DAY }).onfinish = function () { pig.remove(); };
    })(i);
    again(longest * rnd(.35, 1.1) + rnd(1500, 14000));
  }
  // a rare event for the whole page: one pig creeps up, noses out past the cap, sniffs twice, and bolts backwards
  var mouths = [];
  function peek(m) {
    var reach = Math.max(0, m.len - 28), out = m.len + BEYOND - 14;
    var walk = reach / rnd(28, 40) * DAY, creep = rnd(1500, 2400), sniff = 900, hold = rnd(500, 1100), bolt = Math.max(450, m.len * 4), ms = walk + creep + sniff + hold + bolt;
    var pig = newPig(m.box, m.stub.walk, pick(COATS.length));
    pig.style.opacity = 0;
    function key(d, t) { return { offsetDistance: d + "px", opacity: 1, offset: t / ms }; }
    var t = walk;
    pig.animate([
      key(0, 0), key(reach, t), key(reach + (out - reach) * .55, t + creep * .5), key(reach + (out - reach) * .55, t + creep * .7), key(out, t + creep),
      key(out - 2, t + creep + sniff * .2), key(out, t + creep + sniff * .4), key(out - 2, t + creep + sniff * .6), key(out, t + creep + sniff),
      key(out, t + creep + sniff + hold), key(0, ms)
    ], { duration: ms }).onfinish = function () { pig.remove(); };
  }
  function nextPeek(ms) {
    setTimeout(function () {
      var here = mouths.filter(function (m) { return m.box.isConnected && seen(m.sec); });
      if (here.length) { peek(here[pick(here.length)]); nextPeek(rnd(90000, 240000)); }
      else nextPeek(5000);
    }, ms);
  }
  // pigs never spin round a bend: they stay upright, and step through the eight directions one at a time to the way
  // they're going, so a bend or a turnaround plays out as a walk round; stopped, they look at us
  var DIRS = [["E", 1], ["SE", 1], ["S", 1], ["SE", -1], ["E", -1], ["NE", -1], ["N", 1], ["NE", 1]], STEP = 80, lastFrame = 0;
  function aim(p, dir) {
    p.heading = dir;
    p.style.backgroundImage = "url(" + tubeSheet(p.coat, DIRS[dir][0]) + ")";
    p.style.transform = DIRS[dir][1] < 0 ? "scaleX(-1)" : "none";
  }
  function facing() {
    var now = performance.now(), slow = now - lastFrame > 120;      // (a throttled tab: too few frames to tell stopped from moving)
    lastFrame = now;
    document.querySelectorAll(".tubes .pig").forEach(function (p) {
      if (!p.track) return;
      var d = parseFloat(getComputedStyle(p).offsetDistance) || 0, moved = p.lastD === undefined ? 0 : d - p.lastD;
      p.lastD = d;
      if (Math.abs(moved) > 200) moved = 0;
      if (slow && p.movedAt) p.movedAt = now;
      if (Math.abs(moved) > .01) { p.way = moved > 0 ? 1 : -1; p.movedAt = now; }
      var target;
      if (p.movedAt && now - p.movedAt > 220) target = 2;
      else {
        var way = p.way || 1, q0 = p.track.getPointAtLength(Math.max(0, d - 2)), q1 = p.track.getPointAtLength(d + 2);
        target = (Math.round(Math.atan2((q1.y - q0.y) * way, (q1.x - q0.x) * way) / (Math.PI / 4)) + 8) % 8;
      }
      if (p.heading === undefined || getComputedStyle(p).opacity === "0") { aim(p, target); p.headingAt = now; return; }
      if (target === p.heading || now - p.headingAt < STEP) return;
      var spin = (target - p.heading + 8) % 8;
      // the short way round; right about-face goes by way of facing us
      var step = spin === 4 ? (p.heading === 0 || p.heading === 1 || p.heading === 7 ? 1 : -1) : spin < 4 ? 1 : -1;
      aim(p, (p.heading + step + 8) % 8);
      p.headingAt = now;
    });
    requestAnimationFrame(facing);
  }
  if (!still) requestAnimationFrame(facing);
  function buildTubes(sec) {
    var gen = sec.tubeGen = (sec.tubeGen || 0) + 1;
    var old = sec.querySelector(":scope > .tubes");
    if (old) old.remove();
    mouths = mouths.filter(function (m) { return m.sec !== sec; });
    var f = freeSpace(sec), dark = sec.classList.contains("stage");
    seedLayout(sec.id);
    var box = document.createElement("div");
    box.className = "tubes"; box.setAttribute("aria-hidden", "true");
    var svg = document.createElementNS(SVG, "svg"), cover = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 " + f.w + " " + f.h); cover.setAttribute("viewBox", "0 0 " + f.w + " " + f.h);
    var edge = dark ? "#f7efdc" : "#201810", glass = dark ? "#262019" : "#fffdf7";
    box.appendChild(svg); box.appendChild(cover);
    sec.insertBefore(box, sec.firstChild);       // (in the page first: a path can only be measured there)
    var main = tubeLine(f);
    if (main) {
      var outer = pipeInto(svg, cover, main.d, main.runs, edge, glass), len = outer.getTotalLength();
      // a capped end is a solid length of pipe, drawn over the pigs; an end through the wall needs nothing
      [[main.capStart, 0, COVER, 0], [main.capEnd, len - COVER, len, len]].forEach(function (c) {
        if (!c[0]) return;
        var d = "";
        for (var at = c[1]; at <= c[2]; at += 3) { var q = outer.getPointAtLength(at); d += (d ? " L " : "M ") + q.x.toFixed(1) + " " + q.y.toFixed(1); }
        var solid = document.createElementNS(SVG, "path");
        solid.setAttribute("d", d); solid.setAttribute("fill", "none"); solid.setAttribute("stroke", edge); solid.setAttribute("stroke-width", THICK);
        cover.appendChild(solid);
        rim(cover, outer.getPointAtLength(c[3]), outer.getPointAtLength(c[3] ? len - 2 : 2), edge);
      });
    }
    stubs(f, main).forEach(function (stub) {
      var o = pipeInto(svg, cover, stub.d, stub.runs, edge, glass), l = o.getTotalLength();
      rim(cover, o.getPointAtLength(l), o.getPointAtLength(l - 2), edge);
      mouths.push({ sec: sec, box: box, stub: stub, len: l });
    });
    if (!main) return;
    var from = main.capStart ? COVER / 2 : 0, to = main.capEnd ? len - COVER / 2 : len;
    if (still) { newPig(box, main.d, pick(COATS.length)).style.offsetDistance = rnd(from + 100, to - 100) + "px"; return; }
    setTimeout(function () { if (sec.tubeGen === gen) trips(sec, gen, box, main.d, from, to); }, rnd(0, 4000));
  }
  // (the observer waits for rendering, which a background tab doesn't do: so also at once, and on these events)
  var sections = [].slice.call(document.querySelectorAll("section[data-tubes]"));
  function refit(sec) {
    var size = sec.clientWidth + "x" + sec.clientHeight;
    if (size === sec.tubeSize) return;
    sec.tubeSize = size;
    clearTimeout(sec.tubeWait);
    sec.tubeWait = setTimeout(function () { buildTubes(sec); }, 150);
  }
  function refitAll() { sections.forEach(refit); }
  var watcher = new ResizeObserver(function (entries) { entries.forEach(function (e) { refit(e.target); }); });
  sections.forEach(function (sec) { watcher.observe(sec); });
  refitAll();
  addEventListener("load", refitAll);
  addEventListener("resize", refitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refitAll);
  if (!still) nextPeek(rnd(45000, 120000));
  // two feet at a time
  if (!still) setInterval(function () {
    document.querySelectorAll(".pig").forEach(function (el) { if (!el.classList.contains("runner") || el.dataset.go) el.classList.toggle("f2"); });
  }, 260);

  var toggle = document.getElementById("pigToggle");
  function setPigs(on) {
    document.documentElement.classList.toggle("no-pigs", !on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.textContent = on ? "Pigs: on" : "Pigs: off";
    store("ts-pigs", on ? "1" : "0");
  }
  setPigs(store("ts-pigs") !== "0");
  toggle.addEventListener("click", function () { setPigs(toggle.getAttribute("aria-pressed") !== "true"); });

  document.getElementById("marchBtn").addEventListener("click", function () {
    if (document.documentElement.classList.contains("no-pigs")) setPigs(true);
    var m = document.createElement("div");
    m.className = "march"; m.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 6; i++) {
      var p = document.createElement("i");
      p.className = "pig"; dress(p, i);
      p.style.animationDelay = (i * .42) + "s";
      p.style.setProperty("--still", (8 + i * 12) + "%");
      m.appendChild(p);
    }
    document.body.appendChild(m);
    setTimeout(function () { m.remove(); }, still ? 3000 : 14000);
  });

  // ---------------------------------------------------------------- one sound at a time
  var ctx = null;
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  var stopOthers = [];
  function quietAll(except) { stopOthers.forEach(function (s) { if (s !== except) s(); }); }

  // ---------------------------------------------------------------- the wavefolder toy
  (function () {
    var cv = document.getElementById("foldScope"), g = cv.getContext("2d");
    var drive = document.getElementById("foldDrive"), out = document.getElementById("foldOut"), hear = document.getElementById("foldHear");
    var osc = null, shaper = null, amp = null;
    function fold(x) { return Math.sin(x * Math.PI / 2); }
    function draw() {
      var d = +drive.value, w = cv.width, h = cv.height;
      out.textContent = d.toFixed(1);
      g.fillStyle = "#17120e"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#4a3a2b"; g.fillRect(0, h / 2, w, 2);
      var step = 4;                 // chunky, as the plug-in's screen
      for (var pass = 0; pass < 2; pass++) {
        g.fillStyle = pass ? "#ffad66" : "#6c5a46";
        for (var x = 0; x < w; x += step) {
          var s = Math.sin(x / w * Math.PI * 4), v = pass ? fold(s * d) : s;
          g.fillRect(x, Math.round(h / 2 - v * (h / 2 - 16) - step / 2), step, step);
        }
      }
    }
    function curve(d) {
      var c = new Float32Array(2048);
      for (var i = 0; i < 2048; i++) c[i] = fold((i / 1023.5 - 1) * d);
      return c;
    }
    function stop() {
      if (osc) { amp.gain.setTargetAtTime(0, ctx.currentTime, .02); var o = osc; setTimeout(function () { o.stop(); }, 120); osc = null; }
      hear.setAttribute("aria-pressed", "false"); hear.textContent = "Hear it";
    }
    stopOthers.push(stop);
    hear.addEventListener("click", function () {
      if (osc) { stop(); return; }
      quietAll(stop);
      var a = audio();
      osc = a.createOscillator(); osc.frequency.value = 73.42;
      shaper = a.createWaveShaper(); shaper.curve = curve(+drive.value); shaper.oversample = "4x";
      amp = a.createGain(); amp.gain.value = 0; amp.gain.setTargetAtTime(.22, a.currentTime, .02);
      osc.connect(shaper); shaper.connect(amp); amp.connect(a.destination); osc.start();
      hear.setAttribute("aria-pressed", "true"); hear.textContent = "Stop";
    });
    drive.addEventListener("input", function () { draw(); if (shaper) shaper.curve = curve(+drive.value); });
    draw();
  })();

  // ---------------------------------------------------------------- the players: every version runs together, so a flip is instant
  function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
  document.querySelectorAll("[data-player]").forEach(function (root) {
    var buttons = [].slice.call(root.querySelectorAll(".ab button"));
    var playBtn = root.querySelector(".play"), seek = root.querySelector(".seek"), timeEl = root.querySelector(".time");
    var status = root.querySelector(".status"), cv = root.querySelector(".lane canvas"), runner = root.querySelector(".runner");
    var title = root.dataset.title;
    var buffers = null, sources = [], gains = [], playing = false, startAt = 0, offset = 0, loading = false, raf = 0, dragging = false;
    var dark = !!root.closest(".stage");
    var chapters = [].slice.call(root.querySelectorAll("[data-at]"));
    function current() { var i = buttons.findIndex(function (b) { return b.getAttribute("aria-pressed") === "true"; }); return i < 0 ? 0 : i; }
    function dur() { return buffers ? buffers[0].duration : 0; }
    function pos() { var d = dur(); if (!d) return 0; var p = playing ? offset + ctx.currentTime - startAt : offset; return p % d; }

    var peaks = null;
    function drawLane() {
      var r = cv.parentNode.getBoundingClientRect(), k = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(r.width * k)); cv.height = Math.max(1, Math.round(r.height * k));
      var g = cv.getContext("2d"), w = cv.width, h = cv.height, col = dark ? "#ffad66" : "#201810", dim = dark ? "#6c5a46" : "#a8987a";
      g.clearRect(0, 0, w, h);
      if (!buffers) { g.fillStyle = dim; g.fillRect(0, h / 2 - k, w, 2 * k); return; }
      var bar = 3 * k;
      var at = pos() / (dur() || 1) * w;
      if (!peaks) peaks = {};
      var which = current();
      if (!peaks[which]) {
        var d = buffers[which].getChannelData(0), n = Math.ceil(w / bar), per = Math.floor(d.length / n), list = [];
        for (var i = 0; i < n; i++) { var top = 0; for (var j = 0; j < per; j += 40) top = Math.max(top, Math.abs(d[i * per + j])); list.push(top); }
        peaks[which] = list;
      }
      peaks[which].forEach(function (v, i) {
        var x = i * bar, ht = Math.max(k, v * (h - 6 * k));
        g.fillStyle = x < at ? col : dim;
        g.fillRect(x, (h - ht) / 2, bar - k, ht);
      });
    }
    function show() {
      var d = dur(), p = pos();
      if (!dragging && d) seek.value = Math.round(p / d * 1000);
      if (d) {
        timeEl.textContent = fmt(p) + " / " + fmt(d);
        seek.setAttribute("aria-valuetext", fmt(p) + " of " + fmt(d));
      }
      if (runner && d) { runner.style.left = (p / d * 100) + "%"; }
      if (d) {
        var now = -1;
        chapters.forEach(function (c, i) { if (+c.dataset.at <= p) now = i; });
        chapters.forEach(function (c, i) { if (i === now) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current"); });
      }
      drawLane();
    }
    function tick() { show(); if (playing) raf = requestAnimationFrame(tick); }
    function stopSources() { sources.forEach(function (s) { try { s.stop(); } catch (e) {} }); sources = []; gains = []; }
    function pause() {
      if (!playing) return;
      offset = pos(); playing = false; stopSources(); cancelAnimationFrame(raf);
      playBtn.textContent = "Play"; playBtn.setAttribute("aria-label", "Play " + title);
      if (runner) delete runner.dataset.go;
      show();
    }
    stopOthers.push(pause);
    function begin() {
      var a = audio(), now = a.currentTime + .03;
      stopSources();
      buffers.forEach(function (b, i) {
        var s = a.createBufferSource(), g = a.createGain();
        s.buffer = b; s.loop = true;
        g.gain.value = i === current() ? 1 : 0;
        s.connect(g); g.connect(a.destination);
        s.start(now, offset % b.duration);
        sources.push(s); gains.push(g);
      });
      startAt = now; playing = true;
      playBtn.textContent = "Pause"; playBtn.setAttribute("aria-label", "Pause " + title);
      if (runner) runner.dataset.go = "1";
      tick();
    }
    function load() {
      loading = true;
      status.textContent = "Loading " + title + "...";
      var a = audio();
      return Promise.all(buttons.map(function (b) {
        return fetch(b.dataset.file).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
          .then(function (ab) { return new Promise(function (ok, no) { a.decodeAudioData(ab, ok, no); }); });
      })).then(function (list) { buffers = list; status.textContent = ""; loading = false; })
        .catch(function () { loading = false; status.textContent = "That didn't load. Check your connection and press Play again."; throw 0; });
    }
    playBtn.setAttribute("aria-label", "Play " + title);
    playBtn.addEventListener("click", function () {
      if (playing) { pause(); return; }
      quietAll(pause);
      if (buffers) { begin(); return; }
      if (loading) return;
      load().then(begin).catch(function () {});
    });
    buttons.forEach(function (b, i) {
      if (b.getAttribute("aria-pressed") !== "true") b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        if (playing && gains.length) gains.forEach(function (g, k) { g.gain.setTargetAtTime(k === i ? 1 : 0, ctx.currentTime, .006); });
        status.textContent = "Now: " + b.dataset.label + ".";
        drawLane();
      });
    });
    seek.addEventListener("input", function () {
      if (!buffers) return;
      dragging = true;
      offset = seek.value / 1000 * dur();
      if (playing) begin(); else show();
      dragging = false;
    });
    chapters.forEach(function (c) {
      c.addEventListener("click", function () {
        offset = +c.dataset.at;
        quietAll(pause);
        if (buffers) { begin(); return; }
        if (!loading) load().then(begin).catch(function () {});
      });
    });
    addEventListener("resize", function () { peaks = null; drawLane(); });
    drawLane();
  });
})();
