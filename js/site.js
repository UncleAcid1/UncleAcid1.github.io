/* Brownie Digital: lo-fi type, bubbles, the Bandcamp player and STONE mode.

   Lo-fi type: any element with data-lofi is drawn into a tiny canvas at a fraction
   of its size (data-lofi="0.3" = 30 %), then shown at full size with no smoothing,
   so it comes out jagged and wrongly downsampled. data-sx / data-sy stretch it,
   data-tear adds a few torn scanlines. The real text stays in the page for
   screen readers and search engines; each line is a <span class="ln">. */
(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

  function lofi(el) {
    var k = parseFloat(el.dataset.lofi) || 0.3, sx = parseFloat(el.dataset.sx) || 1, sy = parseFloat(el.dataset.sy) || 1;
    var lines = el.querySelectorAll(".ln");
    if (!lines.length) return;
    var holder = el.querySelector(".lofi-c");
    if (!holder) { holder = document.createElement("span"); holder.className = "lofi-c"; holder.setAttribute("aria-hidden", "true"); el.appendChild(holder); }
    holder.textContent = "";
    el.classList.add("lofi-on");
    var rnd = seeded(85);
    Array.prototype.forEach.call(lines, function (ln) {
      var cs = getComputedStyle(ln), size = parseFloat(cs.fontSize) * k;
      var font = cs.fontStyle + " " + cs.fontWeight + " " + size + "px " + cs.fontFamily;
      var c = document.createElement("canvas"), x = c.getContext("2d");
      x.font = font;
      var w = Math.max(1, Math.ceil(x.measureText(ln.textContent).width) + 2), h = Math.max(1, Math.ceil(size * 1.25));
      c.width = w; c.height = h;
      x.font = font; x.textBaseline = "middle"; x.fillStyle = cs.color;
      x.fillText(ln.textContent, 1, h / 2 + 0.5);
      if (el.hasAttribute("data-tear")) {   // shift a few rows sideways, like a bad VHS frame
        for (var y = 0; y < h; y++) if (rnd() < 0.18) {
          var row = x.getImageData(0, y, w, 1); x.clearRect(0, y, w, 1); x.putImageData(row, Math.round((rnd() - 0.5) * 4), y);
        }
      }
      var cw = w / k * sx, ch = h / k * sy;
      c.style.width = cw + "px"; c.style.aspectRatio = cw + " / " + ch;
      holder.appendChild(c);
    });
  }
  function lofiAll() { Array.prototype.forEach.call(document.querySelectorAll("[data-lofi]"), lofi); }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(lofiAll);
  var lastW = window.innerWidth, t;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth; clearTimeout(t); t = setTimeout(lofiAll, 150);
  });

  // Frutiger Aero bubbles (fewer on phones, none for reduced motion)
  var bub = document.getElementById("aero-bubbles");
  if (bub && !still) {
    var n = window.innerWidth < 700 ? 6 : 12;
    for (var i = 0; i < n; i++) {
      var b = document.createElement("span"), s = 16 + Math.random() * 70;
      b.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (Math.random() * 100) + "%;animation-duration:" + (16 + Math.random() * 18) + "s;animation-delay:-" + (Math.random() * 30) + "s";
      bub.appendChild(b);
    }
  }

  // the menu bar clock, like the old Mac OS one
  var clock = document.getElementById("clock");
  function tickClock() {
    var n = new Date(), h = n.getHours(), m = n.getMinutes();
    clock.textContent = ((h + 11) % 12 + 1) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
  }
  if (clock) { tickClock(); setInterval(tickClock, 15000); }

  // videos (data-src) load and play only while on screen; reduced motion keeps the poster
  var vids = document.querySelectorAll("video[data-src]");
  if (vids.length && !still && "IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: "120px" });
    Array.prototype.forEach.call(vids, function (v) { v.muted = true; vo.observe(v); });
  }

  // Kiki's Homepage window: minimize rolls it up, maximize goes full width, close leaves a taskbar button
  var win = document.getElementById("kiki-win"), task = document.getElementById("kiki-task");
  if (win && task) {
    win.querySelector(".tb.min").addEventListener("click", function () { win.classList.toggle("minimized"); });
    win.querySelector(".tb.max").addEventListener("click", function () { win.classList.remove("minimized"); win.classList.toggle("maximized"); });
    win.querySelector(".tb.close").addEventListener("click", function () { win.hidden = true; task.hidden = false; task.focus(); });
    task.addEventListener("click", function () { win.hidden = false; win.classList.remove("minimized"); task.hidden = true; });
  }

  // camera date stamps show today's date
  var d = new Date(), p = function (v) { return (v < 10 ? "0" : "") + v; };
  var today = "'" + String(d.getFullYear()).slice(2) + " " + p(d.getMonth() + 1) + " " + p(d.getDate());
  Array.prototype.forEach.call(document.querySelectorAll("[data-today]"), function (e) { e.textContent = today; });

  // Bandcamp's player loads only when someone presses play
  var bc = document.querySelector("#bc button");
  if (bc) bc.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var f = document.createElement("iframe");
    f.title = "STONE on Bandcamp";
    f.src = "https://bandcamp.com/EmbeddedPlayer/album=" + bc.dataset.album + "/size=large/bgcol=000000/linkcol=ff9b2e/artwork=small/transparent=true/";
    f.allow = "autoplay";
    bc.replaceWith(f);
  });

  // STONE mode: type "stone" (or the Konami code) to invert everything, like the album covers
  var code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], pos = 0, typed = "";
  window.addEventListener("keydown", function (e) {
    pos = e.key === code[pos] ? pos + 1 : (e.key === code[0] ? 1 : 0);
    typed = (typed + (e.key.length === 1 ? e.key.toLowerCase() : "")).slice(-5);
    if (pos === code.length || typed === "stone") {
      pos = 0; typed = "";
      var on = document.documentElement.classList.toggle("stone-mode");
      var tt = document.createElement("div"); tt.className = "toast"; tt.textContent = on ? "STONE MODE: ON" : "STONE MODE: OFF";
      document.body.appendChild(tt); setTimeout(function () { tt.remove(); }, 1800);
    }
  });
})();
