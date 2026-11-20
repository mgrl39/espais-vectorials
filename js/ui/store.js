/* ============================================================
   Progrés i domini (localStorage)
   ============================================================ */
(function (EV) {
  'use strict';
  const KEY = 'ev-progress-v1';
  const blank = () => ({ v: 1, t: {}, o: {}, th: {}, quiz: {}, days: {}, exams: [], created: Date.now() });
  let DB;
  function load() {
    try { DB = JSON.parse(localStorage.getItem(KEY)) || blank(); } catch (e) { DB = blank(); }
    ['t', 'o', 'th', 'quiz', 'days'].forEach((k) => { if (!DB[k]) DB[k] = {}; });
    if (!DB.exams) DB.exams = [];
    return DB;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* ple o bloquejat */ } }
  const today = () => new Date().toISOString().slice(0, 10);

  function tick(n) { const d = today(); DB.days[d] = (DB.days[d] || 0) + (n || 1); save(); }

  // Registra un intent complet d'un exercici generat (score 0..1)
  function recordAttempt(tid, score, info) {
    const t = DB.t[tid] || (DB.t[tid] = { att: [] });
    t.att.push({ d: Date.now(), s: Math.round(score * 100) / 100, k: (info && info.kind) || 'gen' });
    if (t.att.length > 40) t.att = t.att.slice(-40);
    save();
  }
  function recordOriginal(tid, score) {
    DB.o[tid] = { d: Date.now(), s: Math.round(score * 100) / 100, done: true };
    recordAttempt(tid, score, { kind: 'orig' });
  }

  // Domini 0..1 a partir dels darrers intents (ponderats; necessita ≥3 per arribar al màxim)
  function mastery(tid) {
    const t = DB.t[tid];
    if (!t || !t.att.length) return { m: 0, n: 0, level: 0, last: null, due: false };
    const last = t.att.slice(-5);
    let sw = 0, s = 0;
    last.forEach((a, i) => { const w = i + 1; sw += w; s += w * a.s; });
    const avg = s / sw;
    const conf = Math.min(1, t.att.length / 3);
    const m = avg * conf;
    const lastA = t.att[t.att.length - 1];
    let level = 0;
    if (m >= 0.85 && lastA.s >= 0.8) level = 4; else if (m >= 0.6) level = 3; else if (m >= 0.3) level = 2; else level = 1;
    const days = (Date.now() - lastA.d) / 86400000;
    const due = level >= 3 && days > (level === 4 ? 6 : 3);
    return { m, n: t.att.length, level, last: lastA, due, days };
  }
  const LEVELS = ['Nou', 'Iniciat', 'En progrés', 'Gairebé', 'Dominat'];

  function topicMastery(filter) {
    const regs = Object.values(EV.G.REG).filter(filter);
    if (!regs.length) return 0;
    let s = 0; regs.forEach((g) => { s += mastery(g.tid).m; });
    return s / regs.length;
  }

  // Recomanació: primer obligatoris no dominats (menor domini), després repassos, després opcionals
  function recommend(exclude) {
    const regs = Object.values(EV.G.REG).filter((g) => !g.noGen && g.tid !== exclude);
    const star = regs.filter((g) => g.star).sort((a, b) => a.ex - b.ex);
    const notDone = star.filter((g) => mastery(g.tid).level < 4);
    if (notDone.length) {
      // prioritza els començats però fluixos, després els nous en ordre
      const started = notDone.filter((g) => mastery(g.tid).n > 0).sort((a, b) => mastery(a.tid).m - mastery(b.tid).m);
      if (started.length && (mastery(started[0].tid).m < 0.6 || !notDone.some((g) => mastery(g.tid).n === 0))) return { g: started[0], why: 'És un obligatori que encara no domines (domini ' + Math.round(mastery(started[0].tid).m * 100) + '%).' };
      const fresh = notDone.find((g) => mastery(g.tid).n === 0);
      if (fresh) return { g: fresh, why: 'Següent exercici obligatori que encara no has practicat.' };
      return { g: started[0], why: 'Obligatori per acabar de dominar.' };
    }
    const due = star.filter((g) => mastery(g.tid).due).sort((a, b) => mastery(b.tid).days - mastery(a.tid).days);
    if (due.length) return { g: due[0], why: 'Fa dies que no el repasses: toca un repàs per no oblidar-lo.' };
    const opt = regs.filter((g) => !g.star && mastery(g.tid).level < 4).sort((a, b) => a.ex - b.ex);
    if (opt.length) return { g: opt[0], why: 'Ja domines tots els obligatoris! Ara els opcionals t\'ajuden a consolidar.' };
    const any = star[Math.floor(Math.random() * star.length)];
    return { g: any, why: 'Ho domines tot. Repàs aleatori per mantenir-ho.' };
  }

  function exportJSON() { return JSON.stringify(DB, null, 1); }
  function importJSON(s) { const d = JSON.parse(s); if (!d || !d.t) throw new Error('Fitxer no vàlid'); DB = d; save(); }
  function reset() { DB = blank(); save(); }
  function streak() {
    let n = 0; const d = new Date();
    for (;;) { const k = d.toISOString().slice(0, 10); if (DB.days[k]) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  }

  load();
  EV.Store = { get db() { return DB; }, save, tick, recordAttempt, recordOriginal, mastery, LEVELS, topicMastery, recommend, exportJSON, importJSON, reset, streak, today };
})(window.EV = window.EV || {});
