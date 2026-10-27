/* Brownie Digital: the villagers of Rule the Kingdom, working around the
   RTKContinued section. Sprites are the game's own animation sheets (win8 build),
   cut into strips by a script. Workers stay at their spots sawing, chopping,
   digging; carriers wander between the log piles. Click someone and they answer
   you (with the game's sound); drag someone and you can put them somewhere else. */
(function () {
  "use strict";
  var host = document.querySelector(".rtk");
  if (!host) return;
  var wrap = host.querySelector(".wrap");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DIR = "img/gh/rtk/folk/";

  // name: [w, h, frames, anchorX, anchorY]  (anchor = where the feet are, inside one frame)
  var S = {"saw":[67,85,7,28,83],"chop":[94,90,8,46,74],"tired":[43,50,9,21,48],"smith":[71,93,7,32,90],"fsaw":[75,85,5,33,85],"ftired":[47,51,8,23,48],"dig":[80,85,12,36,83],"dig_rest":[45,43,8,22,42],"carp":[77,81,6,38,78],"bees":[60,76,6,17,67],"chicken":[102,54,12,50,52],"sheep":[105,66,18,50,63],"cow":[86,60,14,38,57],"pigs":[90,54,17,42,53],"wood_E":[72,76,7,30,66],"fwood_E":[59,68,7,24,57],"sack_E":[60,69,8,30,61],"wood_NE":[71,74,7,32,71],"fwood_NE":[59,66,7,24,59],"sack_NE":[58,67,8,30,63],"wood_N":[60,80,7,26,73],"fwood_N":[73,61,7,32,57],"sack_N":[51,68,8,24,64],"wood_SE":[66,78,7,26,71],"fwood_SE":[71,68,7,31,64],"sack_SE":[56,70,8,23,64],"wood_S":[66,75,7,27,72],"fwood_S":[73,69,7,32,66],"sack_S":[61,70,8,26,65],"logs":[58,45,1,29,41],"planks":[56,37,1,28,33],"hay":[70,68,1,35,64],"fl_red":[40,43,1,20,39],"fl_yel":[52,53,1,26,49],"shroom":[25,26,1,12,22],"stones":[55,39,1,27,35],"sacks":[41,38,1,20,34]};

  var YES = ["Yes, my lord?", "At your service!", "Right away!"];
  // Workers that stay put, in the order they get a spot. prop: [sprite, dx, dy] next to them.
  var STATIONS = [
    { work: "saw", rest: "tired", prop: ["logs", 52, 4], snd: "work_lumber_started",
      say: ["Measure twice, saw once.", "This oak fights back.", "Back and forth, all day long."] },
    { work: "carp", prop: ["planks", -56, 8], snd: "work_lumber_started",
      say: ["Bark's off, my lord!", "Nearly smooth now.", "Planks for the new houses."] },
    { work: "chop", rest: "tired", prop: ["logs", -54, 6], snd: "work_lumber_started",
      say: ["Timber!", "One more swing...", "Stand back, my lord."] },
    { work: "dig", rest: "dig_rest", prop: ["stones", 50, 6], snd: "worker_go",
      say: ["Found a turnip. No, a rock.", "Digging the new well.", "This ground is all roots."] },
    { work: "chicken", animal: true, snd: "harvest_animal", say: ["Bawk!", "Bawk bawk."] },
    { work: "smith", snd: "work_stone_started",
      say: ["Hot iron waits for no one.", "New horseshoes, coming up.", "Clang! Clang!"] },
    { work: "fsaw", rest: "ftired", prop: ["planks", 54, 6], snd: "work_lumber_started",
      say: ["Who left all these logs here?", "Almost through!", "My arms, my lord..."] },
    { work: "sheep", animal: true, snd: "harvest_animal", say: ["Baa.", "Baaa!"] },
    { work: "bees", prop: ["fl_yel", 44, 4], snd: "worker_go",
      say: ["Mind the bees, my lord.", "The honey's nearly ready."] },
    { work: "cow", animal: true, prop: ["hay", 62, -4], snd: "harvest_animal", say: ["Moo.", "Mooo."] },
    { work: "pigs", animal: true, snd: "harvest_animal", say: ["Oink!", "Oink oink."] }
  ];
  var WALKERS = [
    { set: "fwood", say: ["Logs for the sawmill!", "Heavy, heavy, heavy...", "Coming through!"] },
    { set: "wood", say: ["Coming through!", "Where do these go again?", "Nearly there!"] },
    { set: "sack", say: ["Flour for the bakery.", "Don't drop it, don't drop it..."] }
  ];
  var DECOR = ["fl_red", "shroom", "fl_yel", "sacks", "fl_red", "shroom"];

  var layer = document.createElement("div");
  layer.className = "rtk-folk";
  layer.setAttribute("aria-hidden", "true");
  host.appendChild(layer);

  var actors = [], zones = [], loaded = false, running = false, lastW = 0;
  var SC = 1;   // villager size: bigger when the gutters beside the text are wide
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  // ---------------------------------------------------------------- sound
  var sounds = {};
  function play(name, vol) {
    try {
      var a = sounds[name] || (sounds[name] = new Audio(DIR + name + ".mp3"));
      a.volume = vol || 0.35; a.currentTime = 0;
      var p = a.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  // ---------------------------------------------------------------- sprites
  function makeEl(cls) {
    var el = document.createElement("div");
    el.className = cls; layer.appendChild(el); return el;
  }
  function setSprite(a, name) {
    if (a.sprite === name) return;
    var s = S[name]; a.sprite = name; a.frame = 0;
    a.el.style.width = s[0] + "px"; a.el.style.height = s[1] + "px";
    if (loaded) a.el.style.backgroundImage = "url(" + DIR + name + ".webp)";
    a.el.style.transformOrigin = s[3] + "px " + s[4] + "px";
    a.el.style.backgroundPosition = "0 0";
  }
  function place(a) {
    var s = S[a.sprite];
    a.el.style.transform = "translate(" + Math.round(a.x - s[3]) + "px," + Math.round(a.y - s[4] - (a.lift || 0)) + "px) scale(" + (a.flip ? -SC : SC) + "," + SC + ")";
    a.el.style.zIndex = Math.round(a.y) + (a.lift ? 5000 : 0);
    if (a.prop) placeProp(a);
  }
  function placeProp(a) {
    var p = a.prop, s = S[p.name];
    p.el.style.transform = "translate(" + Math.round(a.x + p.dx * SC - s[3]) + "px," + Math.round(a.y + p.dy * SC - s[4] - (a.lift || 0)) + "px) scale(" + SC + ")";
    p.el.style.transformOrigin = s[3] + "px " + s[4] + "px";
    p.el.style.zIndex = Math.round(a.y + p.dy) + (a.lift ? 5000 : 0);
  }
  function staticSprite(name, x, y) {
    var el = makeEl("rtk-prop"), s = S[name];
    el.style.width = s[0] + "px"; el.style.height = s[1] + "px";
    el.dataset.src = DIR + name + ".webp";
    if (loaded) el.style.backgroundImage = "url(" + el.dataset.src + ")";
    el.style.transform = "translate(" + Math.round(x - s[3]) + "px," + Math.round(y - s[4]) + "px) scale(" + SC + ")";
    el.style.transformOrigin = s[3] + "px " + s[4] + "px";
    el.style.zIndex = Math.round(y);
    return el;
  }

  // ---------------------------------------------------------------- layout
  // Free ground: the gutters beside the text column (when there's room) and a
  // strip of grass under the button.
  function measure() {
    var H = host.offsetHeight, W = host.offsetWidth;
    var last = wrap.lastElementChild, bottom = last.offsetTop + last.offsetHeight + wrap.offsetTop;
    var left = wrap.offsetLeft + 16, right = wrap.offsetLeft + wrap.offsetWidth - 16;
    // y0..y1 is where feet can go
    var z = [];
    SC = left >= 250 ? 1.5 : left >= 190 ? 1.25 : 1;
    if (left >= 136) {
      z.push({ x0: 14, x1: left - 18, y0: 150, y1: bottom, kind: "side" });
      z.push({ x0: right + 18, x1: W - 14, y0: 150, y1: bottom, kind: "side" });
    }
    if (H - 12 - (bottom + 105) > 30) z.push({ x0: 20, x1: W - 20, y0: bottom + 105, y1: H - 12, kind: "lane" });
    return z;
  }
  function slots(z) {
    // spots for stations: down the middle of a gutter, or along the lane
    var out = [];
    if (z.kind === "side") {
      var cx = (z.x0 + z.x1) / 2;
      for (var y = z.y0 + 10; y < z.y1 - 10; y += 150 * SC) out.push({ x: cx + rand(-20, 20) * (z.x1 - z.x0 > 200 ? 1 : 0.3), y: y + rand(-15, 15), z: z });
    } else {
      var rows = z.y1 - z.y0 > 80 ? 2 : 1;
      for (var r = 0; r < rows; r++) {
        var yy = rows === 1 ? (z.y0 + z.y1) / 2 : z.y0 + 6 + r * (z.y1 - z.y0 - 14);
        var step = z.x1 - z.x0 < 700 ? 120 : 190;
        for (var x = z.x0 + 60 + r * step / 2; x < z.x1 - 50; x += step) out.push({ x: x + rand(-15, 15), y: yy + rand(-8, 8), z: z });
      }
    }
    return out;
  }
  function build() {
    layer.innerHTML = ""; actors = [];
    zones = measure();
    if (!zones.length) return;
    var all = [];
    // interleave the zones' spots so the first stations spread out across the section
    var lists = zones.map(slots), i = 0, more = true;
    while (more) { more = false; lists.forEach(function (l) { if (l[i]) { all.push(l[i]); more = true; } }); i++; }
    var nWalk = Math.min(WALKERS.length, Math.max(2, Math.round(all.length / 3)));
    var nStat = Math.min(STATIONS.length, all.length);
    for (var k = 0; k < nStat && k < all.length; k++) addStation(STATIONS[k], all[k]);
    // a few flowers and mushrooms on whatever spots are left
    for (var d = nStat; d < all.length; d++) staticSprite(DECOR[d % DECOR.length], all[d].x + rand(-30, 30), all[d].y + rand(-10, 20));
    for (var w = 0; w < nWalk; w++) addWalker(WALKERS[w], zones[w % zones.length]);
  }
  function addStation(def, at) {
    var a = { def: def, el: makeEl("rtk-guy"), x: at.x, y: at.y, flip: Math.random() < 0.5 && !def.prop, zone: at.z,
              t: Math.random() * 10, fps: def.animal ? 8 : 10, mode: "work", until: 0 };
    if (def.prop) {
      a.prop = { name: def.prop[0], dx: def.prop[1], dy: def.prop[2], el: makeEl("rtk-prop") };
      var s = S[a.prop.name]; a.prop.el.style.width = s[0] + "px"; a.prop.el.style.height = s[1] + "px";
      a.prop.el.dataset.src = DIR + a.prop.name + ".webp";
      if (loaded) a.prop.el.style.backgroundImage = "url(" + a.prop.el.dataset.src + ")";
    }
    setSprite(a, def.work); a.frame = Math.floor(Math.random() * S[def.work][2]);
    hook(a); place(a); actors.push(a);
  }
  function addWalker(def, z) {
    var a = { def: def, walker: true, el: makeEl("rtk-guy"), zone: z, x: rand(z.x0 + 30, z.x1 - 30), y: rand(z.y0, z.y1),
              t: 0, fps: 10, mode: "walk", until: 0, speed: rand(26, 34) };
    setSprite(a, def.set + "_SE"); target(a); hook(a); place(a); actors.push(a);
  }
  function target(a) {
    // walk to a work spot in this zone (to drop off the load), or just somewhere
    var spots = actors.filter(function (o) { return !o.walker && o.zone === a.zone && o.prop; });
    var z = a.zone;
    if (spots.length && Math.random() < 0.7) {
      var o = pick(spots); a.tx = o.x + (o.prop.dx + (o.prop.dx > 0 ? 40 : -40)) * SC; a.ty = o.y + (o.prop.dy + rand(6, 16)) * SC;
    } else { a.tx = rand(z.x0 + 30, z.x1 - 30); a.ty = rand(z.y0, z.y1); }
    a.tx = Math.max(z.x0 + 20, Math.min(z.x1 - 20, a.tx)); a.ty = Math.max(z.y0, Math.min(z.y1, a.ty));
  }
  function facing(a, dx, dy) {
    // the game draws E, NE, N, SE, S; west-facing ones are mirrored
    var ang = Math.atan2(-dy, Math.abs(dx)) * 180 / Math.PI, d;
    if (ang > 67) d = "N"; else if (ang > 22) d = "NE"; else if (ang > -22) d = "E"; else if (ang > -67) d = "SE"; else d = "S";
    a.flip = dx < 0 && d !== "N" && d !== "S";
    setSprite(a, a.def.set + "_" + d);
  }

  // ---------------------------------------------------------------- talking
  var bubble = null, bubbleTimer = 0;
  function say(a, text) {
    if (!bubble) { bubble = document.createElement("div"); bubble.className = "rtk-say"; layer.appendChild(bubble); }
    bubble.textContent = text;
    bubble.classList.remove("on"); void bubble.offsetWidth;
    var s = S[a.sprite], bw = bubble.offsetWidth, W = host.offsetWidth;
    var x = Math.max(6, Math.min(W - bw - 6, a.x - bw / 2));
    bubble.style.left = x + "px"; bubble.style.top = (a.y - s[4] * SC - bubble.offsetHeight - 8) + "px";
    bubble.style.setProperty("--tail", Math.max(14, Math.min(bw - 14, a.x - x)) + "px");
    bubble.classList.add("on");
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(function () { bubble.classList.remove("on"); }, 2400);
  }
  function poke(a) {
    var now = performance.now();
    play(a.def.animal ? "harvest_animal" : (Math.random() < 0.5 ? "worker_go" : a.def.snd || "worker_go"));
    say(a, a.def.animal || Math.random() < 0.7 ? pick(a.def.say) : pick(YES));
    if (a.walker) { a.mode = "stop"; a.until = now + 2200; }
    else if (a.def.rest) { a.mode = "rest"; a.until = now + 2600; setSprite(a, a.def.rest); place(a); }
  }

  // ---------------------------------------------------------------- dragging
  function hook(a) {
    var sx, sy, ox, oy, dragging = false, id = null;
    a.el.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; ox = a.x; oy = a.y; dragging = false;
      a.el.setPointerCapture(id); e.preventDefault();
    });
    a.el.addEventListener("pointermove", function (e) {
      if (e.pointerId !== id) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!dragging && dx * dx + dy * dy > 25) { dragging = true; a.lift = 14 * SC; a.el.classList.add("held"); if (a.prop) a.prop.el.classList.add("held"); }
      if (dragging) {
        a.x = Math.max(10, Math.min(host.offsetWidth - 10, ox + dx));
        a.y = Math.max(40, Math.min(host.offsetHeight - 6, oy + dy));
        place(a);
      }
    });
    function up(e) {
      if (e.pointerId !== id) return; id = null;
      if (!dragging) { poke(a); return; }
      a.lift = 0; a.el.classList.remove("held"); if (a.prop) a.prop.el.classList.remove("held");
      // land on the nearest bit of free ground
      var best = null, bd = 1e9;
      zones.forEach(function (z) {
        var nx = Math.max(z.x0 + 20, Math.min(z.x1 - 20, a.x)), ny = Math.max(z.y0, Math.min(z.y1, a.y));
        var d = (nx - a.x) * (nx - a.x) + (ny - a.y) * (ny - a.y);
        if (d < bd) { bd = d; best = { z: z, x: nx, y: ny }; }
      });
      a.zone = best.z; a.x = best.x; a.y = best.y; place(a);
      play("collect_farm_item", 0.3);
      if (a.walker) { a.mode = "stop"; a.until = performance.now() + 700; target(a); }
    }
    a.el.addEventListener("pointerup", up);
    a.el.addEventListener("pointercancel", up);
  }

  // ---------------------------------------------------------------- loop
  var prev = 0;
  function tick(now) {
    if (!running) return;
    var dt = Math.min(0.1, (now - (prev || now)) / 1000); prev = now;
    actors.forEach(function (a) {
      if (a.lift) return;
      var moving = false;
      if (a.walker) {
        if (a.mode === "stop" && now > a.until) a.mode = "walk";
        if (a.mode === "walk") {
          var dx = a.tx - a.x, dy = a.ty - a.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 3) { a.mode = "stop"; a.until = now + rand(900, 2600); target(a); }
          else {
            facing(a, dx, dy);
            var st = Math.min(d, a.speed * SC * dt); a.x += dx / d * st; a.y += dy / d * st; moving = true;
          }
        }
      } else if (a.mode === "rest" && now > a.until) { a.mode = "work"; setSprite(a, a.def.work); }
      // walkers hold one frame while standing still
      if (!a.walker || moving) {
        a.t += dt * a.fps;
        var n = S[a.sprite][2], f = Math.floor(a.t) % n;
        if (f !== a.frame) { a.frame = f; a.el.style.backgroundPosition = "0 " + (-f * S[a.sprite][1]) + "px"; }
      }
      place(a);
    });
    requestAnimationFrame(tick);
  }
  function start() { if (running || still) return; running = true; prev = 0; requestAnimationFrame(tick); }
  function stop() { running = false; }

  function loadArt() {
    if (loaded) return; loaded = true;
    actors.forEach(function (a) { a.el.style.backgroundImage = "url(" + DIR + a.sprite + ".webp)"; });
    layer.querySelectorAll(".rtk-prop").forEach(function (el) { if (el.dataset.src) el.style.backgroundImage = "url(" + el.dataset.src + ")"; });
  }

  function init() {
    lastW = host.offsetWidth; build();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { loadArt(); start(); } else stop(); });
      }, { rootMargin: "200px" }).observe(host);
    } else { loadArt(); start(); }
    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (host.offsetWidth !== lastW) { lastW = host.offsetWidth; build(); if (loaded) { loaded = false; loadArt(); } } }, 200);
    });
  }
  // wait for the logo and promo images so the text column has its final height
  if (document.readyState === "complete") init(); else window.addEventListener("load", init);
})();
