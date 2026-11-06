// Tin Roof page: draggable junk, the red button, the gate, the presets. Nothing plays; it's all pictures.
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  // ransom-note headings, like the plugin's title: each letter a different scrap
  const faces = ['Impact', '"Arial Black"', '"Courier New"', '"Times New Roman"', 'Georgia', 'Arial', '"Comic Sans MS"'];
  const papers = [['#fff', '#000'], ['#ff0', '#000'], ['#000', '#fff'], ['#f00', '#fff'], ['#c0c0c0', '#800000'], ['#000080', '#ff0'], ['#808000', '#fff'], ['#008080', '#fff']];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  document.querySelectorAll('.ransom').forEach(h => {
    const t = h.textContent.toUpperCase(); h.setAttribute('aria-label', h.textContent); h.textContent = '';
    for (const ch of t) {
      const i = document.createElement('i'); i.setAttribute('aria-hidden', 'true');
      if (ch === ' ') { i.className = 'sp'; h.appendChild(i); continue; }
      const p = papers[Math.floor(rnd() * papers.length)];
      i.textContent = ch; i.style.cssText = `background:${p[0]};color:${p[1]};font-family:${faces[Math.floor(rnd() * faces.length)]},sans-serif;font-weight:700;transform:rotate(${(rnd() * 14 - 7).toFixed(1)}deg) translateY(${Math.floor(rnd() * 6 - 3)}px)`;
      h.appendChild(i);
    }
  });

  // the junk: name, default position, what it shows for a position 0..1
  const pct = v => Math.round(v * 100) + ' %';
  const LEN = ['1/16', '1/8', '1/4', '1/2 BAR', '1 BAR', '2 BARS', '4 BARS'];
  const K = [
    { i: 0, n: 'SIZE', d: .75, f: v => Math.round(20 + 80 * v) + ' %', t: 'how big the room is' },
    { i: 1, n: 'TIME', d: .064, f: v => (0.2 + 12.8 * v).toFixed(2) + ' S', t: 'how long the tail rings' },
    { i: 2, n: 'PRE-DELAY', d: .4, f: v => Math.round(250 * v) + ' MS', t: 'a gap before the reverb starts' },
    { i: 3, n: 'LOW', d: .4, f: v => (-15 + 15 * v).toFixed(1) + ' DB', t: 'cuts the lows going in' },
    { i: 4, n: 'HIGH', d: .4, f: v => (-15 + 15 * v).toFixed(1) + ' DB', t: 'cuts the highs going in' },
    { i: 10, n: 'LAYER', d: 0, f: pct, t: 'lets new notes into a held pad' },
    { i: 5, n: 'SHIMMER', d: .5, f: v => Math.abs(v - .5) < .02 ? 'OFF' : (v > .5 ? 'OCTAVE UP ' : 'OCTAVE DOWN ') + Math.round(Math.abs(v - .5) * 200) + ' %', t: 'octaves in the tail: up is bright, down is dark' },
    { i: 6, n: 'DRIFT', d: 0, f: pct, t: 'a slow wobble, so pads breathe' },
    { i: 7, n: 'SMEAR', d: 0, f: pct, t: 'melts notes into a wash' },
    { i: 8, n: 'MIX', d: .25, f: pct, t: 'dry to wet' },
    { i: 9, n: 'SWELL', d: 0, f: v => v < .02 ? 'OFF' : (4 * v).toFixed(1) + ' S', t: 'each note fades in, like a volume pedal' }
  ];
  const G = [
    { i: 11, n: 'LENGTH', d: .667, f: v => LEN[Math.round(v * 6)], t: 'how long one cycle is' },
    { i: 13, n: 'START', d: 0, f: v => Math.round(v * 15) + '/16', t: 'where in the cycle the hold begins' },
    { i: 12, n: 'PORTION', d: .5, f: pct, t: 'how much of the cycle is held' }
  ];
  const state = {};
  function make(def, parent, read, onchange) {
    const f = document.createElement('figure'); f.className = 'obj'; f.tabIndex = 0; f.setAttribute('role', 'slider');
    f.setAttribute('aria-label', def.n); f.setAttribute('aria-valuemin', 0); f.setAttribute('aria-valuemax', 100);
    const img = new Image(); img.alt = ''; img.width = 140; img.height = 140; f.appendChild(img);
    const nm = document.createElement('span'); nm.className = 'name'; nm.textContent = def.n; f.appendChild(nm);
    let v = def.d; state[def.n] = v;
    const set = nv => {
      v = Math.min(1, Math.max(0, nv)); state[def.n] = v;
      img.src = 'img/k' + def.i + '_' + Math.round(v * 4) + '.png';
      f.setAttribute('aria-valuenow', Math.round(v * 100)); f.setAttribute('aria-valuetext', def.f(v));
      read(def.n + '  ' + def.f(v) + '   (' + def.t + ')'); if (onchange) onchange();
    };
    let y0 = null, v0 = 0;
    f.addEventListener('pointerdown', e => { y0 = e.clientY; v0 = v; f.classList.add('drag'); f.setPointerCapture(e.pointerId); e.preventDefault(); });
    f.addEventListener('pointermove', e => { if (y0 !== null) set(v0 + (y0 - e.clientY) / 160); });
    const up = () => { y0 = null; f.classList.remove('drag'); };
    f.addEventListener('pointerup', up); f.addEventListener('pointercancel', up);
    f.addEventListener('dblclick', () => set(def.d));
    f.addEventListener('mouseenter', () => read(def.n + '  ' + def.f(v) + '   (' + def.t + ')'));
    f.addEventListener('keydown', e => { const s = { ArrowUp: .05, ArrowRight: .05, ArrowDown: -.05, ArrowLeft: -.05 }[e.key]; if (s) { set(v + s); e.preventDefault(); } });
    img.src = 'img/k' + def.i + '_' + Math.round(v * 4) + '.png';
    f.setAttribute('aria-valuenow', Math.round(v * 100));
    parent.appendChild(f); return f;
  };
  const grid = $('#grid'), gread = $('#grid-read');
  gread.textContent = 'drag one…';
  K.forEach(k => make(k, grid, s => { gread.textContent = s; }));

  // HOLD button
  const big = $('#bigred');
  big.addEventListener('click', () => {
    const on = big.getAttribute('aria-pressed') !== 'true'; big.setAttribute('aria-pressed', on);
    $('#lcd-hold').textContent = on ? '** HOLDING **  LAYER 0 %' : 'T 1.00 S  MIX 25 %';
  });

  // the gate
  const sw = $('#swc'), steps = $('#steps'), lg = $('#lcd-gate');
  for (let n = 0; n < 16; n++) steps.appendChild(document.createElement('i'));
  const BARNAMES = ['1/16', '1/8', '1/4', '1/2BAR', '1BAR', '2BARS', '4BARS'];
  function gate() {
    const on = sw.getAttribute('aria-pressed') === 'true';
    const len = BARNAMES[Math.round(state.LENGTH * 6)], st = Math.round(state.START * 15), por = state.PORTION;
    steps.classList.toggle('off', !on);
    [...steps.children].forEach((c, n) => {
      const ph = ((n + .5) / 16 - st / 16 + 2) % 1; c.classList.toggle('held', por >= .995 || ph < por);
    });
    lg.textContent = on ? 'HELD ' + len + ' ' + st + '/16 ' + Math.round(por * 100) + '%' : 'SYNC OFF   (press the switch)';
  }
  sw.addEventListener('click', () => { sw.setAttribute('aria-pressed', sw.getAttribute('aria-pressed') !== 'true'); gate(); });
  const gg = $('#gategrid');
  G.forEach(k => make(k, gg, () => {}, gate));
  gate();

  // presets
  const P = [['TIN ROOF', 'the plain plate'], ['RAIN ON TIN', 'bright, medium room, a little drift'], ['THE SHED', 'small and short'], ['BIG BARN', 'large, long, smeared'],
    ['SLOW BLOOM', 'long hall that swells in after each note'], ['FROZEN CHOIR', 'octave-up shimmer, built for HOLD'], ['UNDER THE PIER', 'octave-down, dark and deep'], ['WOBBLE TAPE', 'full drift, long pre-delay'],
    ['STACKER', 'longest time, heavy layer: stack chords'], ['CHURCH OF CORRUGATE', 'big and bright, a touch of shimmer'], ['DUSTY AIR', 'lows and highs cut, octave-down haze'], ['ICE CREAM VAN', 'strong octave-up shimmer with swell']];
  let cur = 0; const list = $('#plist');
  P.forEach((p, n) => { const li = document.createElement('li'); const b = document.createElement('button'); b.textContent = String(n + 1).padStart(2, '0') + ' ' + p[0]; b.onclick = () => show(n); li.appendChild(b); list.appendChild(li); });
  function show(n) {
    cur = (n + P.length) % P.length;
    $('#pname').textContent = String(cur + 1).padStart(2, '0') + ' ' + P[cur][0]; $('#pdesc').textContent = P[cur][1];
    [...list.children].forEach((li, k) => li.classList.toggle('on', k === cur));
  }
  $('#pprev').onclick = () => show(cur - 1); $('#pnext').onclick = () => show(cur + 1); show(0);
})();
