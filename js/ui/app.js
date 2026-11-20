/* ============================================================
   Aplicació: rutes i vistes
   ============================================================ */
(function (EV) {
  'use strict';
  const { h, esc, math, renderExercise, texHTML } = EV.UI;
  const Store = EV.Store;
  const app = document.getElementById('app');
  const REG = EV.G.REG;

  const all = () => Object.values(REG).sort((a, b) => a.ex - b.ex || (a.tid < b.tid ? -1 : 1));
  const stars = () => all().filter((g) => g.star);
  const pct = (x) => Math.round(x * 100) + '%';
  const lvlChip = (tid) => { const ms = Store.mastery(tid); return '<span class="lvl l' + ms.level + '" title="' + ms.n + ' intents · domini ' + pct(ms.m) + '">' + Store.LEVELS[ms.level] + (ms.due ? ' · repassa' : '') + '</span>'; };
  const bar = (x, cls) => '<div class="bar ' + (cls || '') + '"><span style="width:' + Math.round(x * 100) + '%"></span></div>';
  const starB = (g) => (g.star ? '<span class="star" title="Obligatori: es corregeix a classe">★</span>' : '<span class="opt" title="No es fa a classe">opcional</span>');
  function ring(x, label) {
    const r = 34, c = 2 * Math.PI * r, off = c * (1 - x);
    return '<div class="ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="' + r + '" class="rbg"/><circle cx="40" cy="40" r="' + r + '" class="rfg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><div class="rv">' + pct(x) + '</div><div class="rl">' + label + '</div></div>';
  }
  function setTitle(t) { document.title = t + ' · Espais vectorials'; }
  function updateMini() {
    const x = Store.topicMastery((g) => g.star);
    document.getElementById('mini-mastery').innerHTML = '<span class="small muted">★</span> ' + bar(x, 'thin') + ' <b>' + pct(x) + '</b>';
  }

  /* ---------------- Tauler ---------------- */
  function viewHome() {
    setTitle('Tauler');
    const sx = Store.topicMastery((g) => g.star);
    const tx = Store.topicMastery((g) => !g.noGen);
    const t3 = Store.topicMastery((g) => g.star && g.topic === 3), t4 = Store.topicMastery((g) => g.star && g.topic === 4);
    const rec = Store.recommend();
    const db = Store.db;
    const read = EV.THEORY.filter((s) => db.th[s.id]).length;
    const today = db.days[Store.today()] || 0;
    let html = '<section class="hero"><div class="hero-l"><h1>Domina espais vectorials i diagonalització</h1><p>Teoria completa, tots els exercicis de la llista amb solució pas a pas i <b>generadors infinits</b> de variants dels exercicis ★ que es corregeixen a classe. Cada resposta es comprova automàticament i el teu domini es guarda aquí.</p>' +
      '<div class="rec"><div class="rec-t">Següent pas recomanat</div><div class="rec-b"><b>Ex. ' + rec.g.ex + ' · ' + esc(rec.g.title) + '</b> ' + starB(rec.g) + '<div class="small muted">' + esc(rec.why) + '</div></div><div class="rec-a"><a class="btn primary" href="#practica/' + rec.g.tid + '">Practica ara</a> <a class="btn ghost" href="#repas">Repàs guiat</a></div></div></div>' +
      '<div class="hero-r">' + ring(sx, 'Obligatoris ★') + ring(tx, 'Tot (★ + opcionals)') + '</div></section>';
    html += '<section class="stats"><div class="stat"><b>' + Store.streak() + '</b><span>dies seguits</span></div><div class="stat"><b>' + today + '</b><span>respostes avui</span></div><div class="stat"><b>' + pct(t3) + '</b><span>Tema 3 ★</span></div><div class="stat"><b>' + pct(t4) + '</b><span>Tema 4 ★</span></div><div class="stat"><b>' + read + '/' + EV.THEORY.length + '</b><span>seccions de teoria llegides</span></div></section>';
    const block = (topic, title) => {
      const gs = stars().filter((g) => g.topic === topic);
      return '<div class="card"><h2>' + title + '</h2><div class="exgrid">' + gs.map((g) => { const ms = Store.mastery(g.tid); return '<a class="exchip l' + ms.level + '" href="#practica/' + g.tid + '"><span class="exn">' + g.ex + '</span><span class="ext">' + esc(g.title) + '</span>' + bar(ms.m) + '<span class="small">' + Store.LEVELS[ms.level] + (ms.due ? ' · repassa' : '') + '</span></a>'; }).join('') + '</div></div>';
    };
    html += '<section class="cols2">' + block(3, 'Tema 3 · Espais vectorials i aplicacions lineals ★') + block(4, 'Tema 4 · Diagonalització ★') + '</section>';
    html += '<section class="card how"><h2>Com funciona el domini</h2><ul><li>Cada exercici ★ té un <b>generador</b>: cada vegada surt una versió nova del mateix tipus que el del PDF, amb solució calculada exactament.</li><li>Puntuació d\'un apartat: encert a la primera = 100%, a la segona = 70%, més tard = 50%, si mires la solució abans = 0%.</li><li>El <b>domini</b> d\'un exercici és la mitjana ponderada dels 5 últims intents (els recents pesen més) i cal fer-ne almenys 3 per arribar al 100%. <b>Dominat</b> = ≥85% i l\'últim intent ≥80%.</li><li>Si fa dies que no repasses un exercici dominat, et sortirà per repassar (<i>repetició espaiada</i>).</li><li>Ordre recomanat: llegeix la secció de teoria → fes l\'exercici original del PDF (amb la solució de classe) → practica variants fins a <b>Dominat</b> → simulacre.</li></ul></section>';
    app.innerHTML = html;
    math(app);
  }

  /* ---------------- Teoria ---------------- */
  function viewTheory(id) {
    const secs = EV.THEORY;
    const cur = secs.find((s) => s.id === id) || secs[0];
    setTitle(cur.title);
    const db = Store.db;
    let side = '<aside class="tside">';
    let lastCh = -1;
    secs.forEach((s) => {
      if (s.ch !== lastCh) { side += '<div class="tch">' + (s.ch === 3 ? 'Tema 3' : s.ch === 4 ? 'Tema 4' : 'General') + '</div>'; lastCh = s.ch; }
      side += '<a href="#teoria/' + s.id + '" class="' + (s.id === cur.id ? 'cur' : '') + '">' + (db.th[s.id] ? '✓ ' : '') + esc(s.title) + '</a>';
    });
    side += '</aside>';
    const idx = secs.indexOf(cur);
    let main = '<article class="tmain"><h1>' + esc(cur.title) + '</h1>' + cur.body;
    if (cur.quiz && cur.quiz.length) main += '<h2>Comprova\'t</h2><div class="quiz">' + cur.quiz.map((q) => '<details class="qz"><summary>' + q.q + '</summary><div>' + q.a + '</div></details>').join('') + '</div>';
    if (cur.practice && cur.practice.length) main += '<h2>Practica-ho</h2><div class="plinks">' + cur.practice.filter((t) => REG[t]).map((t) => '<a class="btn ' + (REG[t].star ? 'primary' : 'ghost') + '" href="#practica/' + t + '">Ex. ' + REG[t].ex + ' · ' + esc(REG[t].title) + (REG[t].star ? ' ★' : '') + '</a>').join('') + '</div>';
    main += '<div class="tnav">' + (idx > 0 ? '<a class="btn ghost" href="#teoria/' + secs[idx - 1].id + '">← ' + esc(secs[idx - 1].title) + '</a>' : '<span></span>') + '<button class="btn ' + (db.th[cur.id] ? 'ghost' : 'primary') + '" id="markread">' + (db.th[cur.id] ? 'Llegit ✓ (desmarca)' : 'Marca com a llegit') + '</button>' + (idx < secs.length - 1 ? '<a class="btn ghost" href="#teoria/' + secs[idx + 1].id + '">' + esc(secs[idx + 1].title) + ' →</a>' : '<span></span>') + '</div></article>';
    app.innerHTML = '<div class="theory">' + side + main + '</div>';
    document.getElementById('markread').onclick = () => { if (db.th[cur.id]) delete db.th[cur.id]; else db.th[cur.id] = Date.now(); Store.save(); viewTheory(cur.id); };
    math(app);
    window.scrollTo(0, 0);
  }

  /* ---------------- Llista d'exercicis ---------------- */
  function viewList() {
    setTitle('Llista d\'exercicis');
    const card = (g) => {
      const o = Store.db.o[g.tid];
      return '<div class="lcard ' + (g.star ? 'isstar' : 'isopt') + '"><div class="lhead"><span class="exn">' + g.ex + (g.tid === 'e69x' ? '*' : '') + '</span>' + starB(g) + lvlChip(g.tid) + '</div><div class="ltitle">' + esc(g.title) + '</div><div class="small muted">' + esc(g.skill) + ' · apunts ' + esc(g.sec) + '</div><div class="lacts"><a class="btn ghost" href="#ex/' + g.tid + '">Enunciat original' + (o ? ' ✓' : '') + '</a>' + (g.noGen ? '' : '<a class="btn ' + (g.star ? 'primary' : 'ghost') + '" href="#practica/' + g.tid + '">Variants ∞</a>') + '</div></div>';
    };
    const t3s = all().filter((g) => g.topic === 3 && g.star), t4s = all().filter((g) => g.topic === 4 && g.star);
    const t3o = all().filter((g) => g.topic === 3 && !g.star), t4o = all().filter((g) => g.topic === 4 && !g.star);
    app.innerHTML = '<h1>Llista de problemes · temes III i IV</h1><p class="muted">Els exercicis amb <span class="star">★</span> es corregeixen a classe de problemes: són la <b>prioritat absoluta</b>. Els opcionals no es fan a classe però t\'ajuden a consolidar.</p>' +
      '<h2 class="sec-t"><span class="star">★</span> Obligatoris · Tema 3</h2><div class="lgrid">' + t3s.map(card).join('') + '</div>' +
      '<h2 class="sec-t"><span class="star">★</span> Obligatoris · Tema 4</h2><div class="lgrid">' + t4s.map(card).join('') + '</div>' +
      '<details class="optblock"><summary><h2 class="sec-t inline">Opcionals (no es fan a classe) · ' + (t3o.length + t4o.length) + ' exercicis</h2></summary><div class="lgrid">' + t3o.concat(t4o).map(card).join('') + '</div></details>';
    math(app);
  }

  /* ---------------- Exercici original ---------------- */
  function viewOriginal(tid) {
    const g = REG[tid]; if (!g) return viewList();
    setTitle('Ex. ' + g.ex);
    const ex = g.original();
    app.innerHTML = '';
    const head = h('div', { class: 'phead' }, '<div><div class="crumbs"><a href="#llista">Llista</a> › Exercici ' + g.ex + ' (enunciat original)</div><h1>Ex. ' + g.ex + ' · ' + esc(g.title) + ' ' + starB(g) + '</h1><div class="small muted">' + esc(g.skill) + ' · teoria: apunts ' + esc(g.sec) + '</div></div><div class="pacts">' + (g.noGen ? '' : '<a class="btn primary" href="#practica/' + tid + '">Genera variants ∞</a>') + '<a class="btn ghost" href="#teoria/' + secFor(g) + '">Teoria</a></div>');
    app.appendChild(head);
    const box = h('div');
    app.appendChild(box);
    renderExercise(box, ex, { mode: 'orig', tid, onDone: (sc, fin) => { Store.recordOriginal(tid, sc); updateMini(); if (!g.noGen) fin.insertAdjacentHTML('beforeend', ' <a class="btn primary" href="#practica/' + tid + '">Ara practica variants →</a>'); } });
    window.scrollTo(0, 0);
  }
  function secFor(g) { const s = (g.sec || '').match(/\d\.\d/); return s ? s[0] : 'mapa'; }

  /* ---------------- Pràctica ---------------- */
  function viewPracticeHome() {
    setTitle('Pràctica');
    const tile = (g) => { const ms = Store.mastery(g.tid); return '<a class="ptile l' + ms.level + '" href="#practica/' + g.tid + '"><div class="lhead"><span class="exn">' + g.ex + '</span>' + starB(g) + '</div><div class="ltitle">' + esc(g.title) + '</div>' + bar(ms.m) + '<div class="small">' + Store.LEVELS[ms.level] + ' · ' + ms.n + ' intents</div></a>'; };
    const gen = all().filter((g) => !g.noGen);
    app.innerHTML = '<h1>Pràctica amb variants infinites</h1><p class="muted">Tria un tipus d\'exercici. Cada «Nou exercici» genera una versió diferent amb solució pas a pas.</p><h2 class="sec-t"><span class="star">★</span> Obligatoris</h2><div class="pgrid">' + gen.filter((g) => g.star).map(tile).join('') + '</div><h2 class="sec-t">Opcionals</h2><div class="pgrid">' + gen.filter((g) => !g.star).map(tile).join('') + '</div>';
  }
  function viewPractice(tid, variant, opts) {
    opts = opts || {};
    const g = REG[tid]; if (!g || g.noGen) return viewPracticeHome();
    setTitle('Practica ex. ' + g.ex);
    app.innerHTML = '';
    const head = h('div', { class: 'phead' });
    const box = h('div');
    const after = h('div', { class: 'after' });
    app.appendChild(head); app.appendChild(box); app.appendChild(after);
    let seed = EV.newSeed();
    function drawHead() {
      const ms = Store.mastery(tid);
      const vsel = g.variants ? '<select id="vsel"><option value="">Variant aleatòria</option>' + g.variants.map((v) => '<option value="' + v.v + '"' + (v.v === variant ? ' selected' : '') + '>' + esc(v.label) + '</option>').join('') + '</select>' : '';
      head.innerHTML = '<div><div class="crumbs"><a href="#practica">Pràctica</a> › ' + (opts.guided ? 'Repàs guiat › ' : '') + 'Exercici ' + g.ex + '</div><h1>Ex. ' + g.ex + ' · ' + esc(g.title) + ' ' + starB(g) + '</h1><div class="small muted">' + esc(g.skill) + '</div></div><div class="pacts"><div class="mast">' + lvlChip(tid) + bar(ms.m) + '<span class="small">' + pct(ms.m) + ' · ' + ms.n + ' intents</span></div>' + vsel + '<button class="btn primary" id="newex">Nou exercici ↻</button><a class="btn ghost" href="#ex/' + tid + '">Original del PDF</a><a class="btn ghost" href="#teoria/' + secFor(g) + '">Teoria</a></div>';
      const vs = head.querySelector('#vsel'); if (vs) vs.onchange = () => { variant = vs.value || undefined; newEx(); };
      head.querySelector('#newex').onclick = () => newEx();
    }
    function newEx() {
      seed = EV.newSeed();
      let ex;
      try { ex = g.make(EV.makeRng(seed), { variant }); } catch (e) { console.error(e); box.innerHTML = '<p class="badfb">Error generant l\'exercici (' + esc(e.message) + '). Torna-ho a provar.</p>'; return; }
      after.innerHTML = '';
      renderExercise(box, ex, {
        mode: 'gen', tid,
        onDone: (sc, fin) => {
          Store.recordAttempt(tid, sc); updateMini(); drawHead();
          const ms = Store.mastery(tid);
          const rec = Store.recommend(ms.level >= 4 ? tid : undefined);
          let nx = '<div class="nextbox"><button class="btn primary" id="again">Una altra variant ↻</button>';
          if (opts.guided || ms.level >= 4) nx += ' <a class="btn ' + (ms.level >= 4 ? 'primary' : 'ghost') + '" href="#' + (opts.guided ? 'repas' : 'practica/' + rec.g.tid) + '">' + (opts.guided ? 'Següent del repàs →' : 'Següent recomanat: ex. ' + rec.g.ex + ' →') + '</a>';
          nx += '<div class="small muted">' + (ms.level >= 4 ? 'Ja domines aquest exercici! ' : 'Domini actual ' + pct(ms.m) + '. ') + '</div></div>';
          fin.insertAdjacentHTML('afterend', nx);
          const ag = document.getElementById('again'); if (ag) ag.onclick = () => { newEx(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        },
      });
    }
    drawHead(); newEx();
    window.scrollTo(0, 0);
  }

  /* ---------------- Repàs guiat ---------------- */
  function viewGuided() {
    const rec = Store.recommend();
    viewPractice(rec.g.tid, undefined, { guided: true });
    const b = h('div', { class: 'guided-note' }, '<b>Repàs guiat:</b> ' + esc(rec.why) + ' Quan acabis, et proposaré el següent segons el teu domini.');
    app.insertBefore(b, app.children[1]);
  }

  /* ---------------- Simulacre ---------------- */
  const EXAM_POOLS = [
    { name: 'Subespais / teoria', tids: ['e34', 'e35', 'e41', 'e50'] },
    { name: 'Pertinença, LI i bases', tids: ['e37', 'e38', 'e40', 'e42'] },
    { name: 'Bases, dimensió i coordenades', tids: ['e43', 'e44', 'e46', 'e48'] },
    { name: 'Aplicacions lineals', tids: ['e51', 'e55', 'e58', 'e61', 'e63'] },
    { name: 'Matrius i bases', tids: ['e53', 'e66', 'e67'] },
    { name: 'Diagonalització', tids: ['e68', 'e69'] },
  ];
  function viewExam() {
    setTitle('Simulacre');
    const hist = Store.db.exams.slice(-5).reverse();
    app.innerHTML = '<h1>Simulacre d\'examen</h1><p class="muted">Un exercici ★ generat de cada bloc del temari, sense solucions fins que entreguis. Serveix per comprovar si de veritat ho domines.</p>' +
      '<div class="card"><label>Blocs: </label><div class="pills" id="pools">' + EXAM_POOLS.map((p, i) => '<button class="pill sel" data-i="' + i + '">' + esc(p.name) + '</button>').join('') + '</div><p><label>Temps: <select id="tmin"><option value="0">sense límit</option><option value="60">60 min</option><option value="90" selected>90 min</option><option value="120">120 min</option></select></label></p><button class="btn primary" id="start">Comença el simulacre</button></div>' +
      (hist.length ? '<div class="card"><h2>Últims simulacres</h2><table class="tbl">' + hist.map((e) => '<tr><td>' + new Date(e.d).toLocaleString('ca') + '</td><td><b>' + e.nota.toFixed(1) + '</b> / 10</td><td class="small">' + e.parts.map((p) => 'Ex. ' + p.ex + ': ' + pct(p.s)).join(' · ') + '</td></tr>').join('') + '</table></div>' : '');
    app.querySelectorAll('#pools .pill').forEach((b) => { b.onclick = () => b.classList.toggle('sel'); });
    document.getElementById('start').onclick = () => {
      const sel = [...app.querySelectorAll('#pools .pill.sel')].map((b) => EXAM_POOLS[+b.dataset.i]);
      if (!sel.length) return;
      runExam(sel, +document.getElementById('tmin').value);
    };
  }
  function runExam(pools, minutes) {
    app.innerHTML = '';
    const rng = EV.makeRng(EV.newSeed());
    const top = h('div', { class: 'examtop' }, '<h1>Simulacre</h1><div id="timer" class="timer"></div><button class="btn primary" id="submit">Entrega i corregeix</button>');
    app.appendChild(top);
    const ctrls = [];
    pools.forEach((p, i) => {
      // prioritza el menys dominat del bloc, amb una mica d'atzar
      const cand = p.tids.filter((t) => REG[t]).sort((a, b) => Store.mastery(a).m - Store.mastery(b).m + (rng.next() - 0.5) * 0.4);
      const g = REG[cand[0]];
      const ex = g.make(EV.makeRng(EV.newSeed()), {});
      const sec = h('section', { class: 'card examex' }, '<h2>Exercici ' + (i + 1) + ' <span class="small muted">(tipus ex. ' + g.ex + ' · ' + esc(p.name) + ')</span></h2>');
      const box = h('div'); sec.appendChild(box); app.appendChild(sec);
      ctrls.push({ g, c: renderExercise(box, ex, { mode: 'exam', tid: g.tid }), sec });
    });
    let left = minutes * 60, tmr = null;
    const tEl = document.getElementById('timer');
    if (minutes) { const tickT = () => { const mm = Math.floor(left / 60), ss = left % 60; tEl.textContent = '⏱ ' + mm + ':' + String(ss).padStart(2, '0'); if (left <= 0) { submit(); return; } left--; }; tickT(); tmr = setInterval(tickT, 1000); }
    let done = false;
    function submit() {
      if (done) return; done = true; if (tmr) clearInterval(tmr);
      const res = ctrls.map((x) => { const s = x.c.submit(); Store.recordAttempt(x.g.tid, s, { kind: 'exam' }); x.sec.querySelector('h2').insertAdjacentHTML('beforeend', ' <span class="lvl ' + (s >= 0.8 ? 'l4' : s >= 0.5 ? 'l2' : 'l1') + '">' + pct(s) + '</span>'); return { ex: x.g.ex, tid: x.g.tid, s }; });
      const nota = 10 * res.reduce((a, r) => a + r.s, 0) / res.length;
      Store.db.exams.push({ d: Date.now(), nota, parts: res }); Store.save(); updateMini();
      top.innerHTML = '<h1>Resultat: ' + nota.toFixed(1) + ' / 10</h1><div class="small">' + res.map((r) => 'Ex. ' + r.ex + ': <b>' + pct(r.s) + '</b>').join(' · ') + '</div><div><a class="btn primary" href="#examen">Un altre simulacre</a> ' + res.filter((r) => r.s < 0.8).map((r) => '<a class="btn ghost" href="#practica/' + r.tid + '">Practica ex. ' + r.ex + '</a>').join(' ') + '</div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.getElementById('submit').onclick = () => { if (confirm('Segur que vols entregar?')) submit(); };
  }

  /* ---------------- Progrés ---------------- */
  function viewProgress() {
    setTitle('Progrés');
    const rows = all().filter((g) => !g.noGen).map((g) => {
      const ms = Store.mastery(g.tid); const t = Store.db.t[g.tid];
      const hist = t ? t.att.slice(-12).map((a) => '<span class="hb" style="height:' + Math.max(8, a.s * 100) + '%" title="' + pct(a.s) + ' · ' + new Date(a.d).toLocaleDateString('ca') + ' · ' + a.k + '"></span>').join('') : '';
      return '<tr><td>' + g.ex + ' ' + starB(g) + '</td><td><a href="#practica/' + g.tid + '">' + esc(g.title) + '</a></td><td>' + lvlChip(g.tid) + '</td><td style="min-width:120px">' + bar(ms.m) + ' ' + pct(ms.m) + '</td><td>' + ms.n + '</td><td><div class="hist">' + hist + '</div></td><td class="small">' + (ms.last ? new Date(ms.last.d).toLocaleDateString('ca') : '—') + '</td></tr>';
    }).join('');
    const days = Object.entries(Store.db.days).sort().slice(-21);
    const mx = Math.max(1, ...days.map((d) => d[1]));
    app.innerHTML = '<h1>El teu progrés</h1><div class="card"><h2>Activitat (últims dies)</h2><div class="days">' + (days.length ? days.map(([d, n]) => '<div class="day" title="' + d + ': ' + n + ' respostes"><span style="height:' + Math.round(100 * n / mx) + '%"></span><small>' + d.slice(8) + '</small></div>').join('') : '<p class="muted">Encara no hi ha activitat.</p>') + '</div></div>' +
      '<div class="card"><h2>Domini per exercici</h2><div class="tblwrap"><table class="tbl prog"><tr><th>Ex.</th><th>Tipus</th><th>Nivell</th><th>Domini</th><th>Intents</th><th>Últims intents</th><th>Últim</th></tr>' + rows + '</table></div></div>' +
      '<div class="card"><h2>Còpia de seguretat</h2><p class="muted small">El progrés es guarda al navegador (localStorage). Exporta\'l per passar-lo a un altre ordinador o navegador.</p><button class="btn ghost" id="exp">Exporta (JSON)</button> <label class="btn ghost">Importa<input type="file" id="imp" accept=".json" hidden></label> <button class="btn danger" id="rst">Esborra tot el progrés</button></div>';
    document.getElementById('exp').onclick = () => { const b = new Blob([Store.exportJSON()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'progres-espais-vectorials.json'; a.click(); };
    document.getElementById('imp').onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((s) => { try { Store.importJSON(s); alert('Importat!'); viewProgress(); updateMini(); } catch (er) { alert('Error: ' + er.message); } }); };
    document.getElementById('rst').onclick = () => { if (confirm('Segur? S\'esborrarà tot el progrés.')) { Store.reset(); viewProgress(); updateMini(); } };
  }

  /* ---------------- Rutes ---------------- */
  function route() {
    const hsh = (location.hash || '#inici').slice(1).split('/');
    const v = hsh[0];
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('cur', a.dataset.v === v || (v === 'ex' && a.dataset.v === 'llista')));
    document.body.classList.remove('menu-open');
    try {
      if (v === 'teoria') viewTheory(hsh[1]);
      else if (v === 'llista') viewList();
      else if (v === 'ex') viewOriginal(hsh[1]);
      else if (v === 'practica') { if (hsh[1]) viewPractice(hsh[1], hsh[2] || undefined); else viewPracticeHome(); }
      else if (v === 'repas') viewGuided();
      else if (v === 'examen') viewExam();
      else if (v === 'calc') EV.Calc.view(app);
      else if (v === 'progres') viewProgress();
      else viewHome();
    } catch (e) { console.error(e); app.innerHTML = '<p class="badfb">Error: ' + esc(e.message) + '</p>'; }
    updateMini();
  }
  window.addEventListener('hashchange', route);
  document.getElementById('theme').onclick = () => { const d = document.documentElement.classList.toggle('dark'); localStorage.setItem('ev-theme', d ? 'dark' : 'light'); };
  document.getElementById('menu').onclick = () => document.body.classList.toggle('menu-open');
  if (localStorage.getItem('ev-theme') === 'dark' || (!localStorage.getItem('ev-theme') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark');
  route();
})(window.EV = window.EV || {});
