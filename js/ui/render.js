/* ============================================================
   Component d'exercici interactiu (apartats, comprovació,
   previsualització de la resposta, solucions pas a pas)
   ============================================================ */
(function (EV) {
  'use strict';
  const T = EV.T;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function math(el) {
    if (!el || !window.renderMathInElement) return;
    window.renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false, strict: 'ignore' });
  }
  function texHTML(t, display) {
    try { return window.katex.renderToString(t, { throwOnError: false, displayMode: !!display, strict: 'ignore' }); } catch (e) { return esc(t); }
  }
  function h(tag, attrs, html) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => { if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  const HINT = {
    int: 'un enter, p. ex. 2', scalar: 'p. ex. -3/2', scalars: 'p. ex. -1, 2, 1/2', vector: 'p. ex. (1, -2, 3/4)', vectors: 'p. ex. (1, 0, 2), (0, 1, -1)', matrix: 'p. ex. [1 2; 3 4]  (files separades per ;)', poly: 'p. ex. x^2 - 3x + 2  o  (x-1)(x+2)',
  };
  function hintFor(p) {
    const F = p.F || (p.space && p.space.F);
    let s = p.kind === 'elems' ? p.space.fmt : p.kind === 'elem' ? p.space.fmt1 : HINT[p.kind] || '';
    if (F && F.id === 'C' && ['scalar', 'scalars', 'vector', 'vectors', 'matrix'].includes(p.kind)) s += '  ·  complexos: 2-3i, (1+i)/2';
    if (F && F.id === 'Z2') s += '  ·  a ℤ₂ només 0 i 1';
    return s;
  }

  // TeX de previsualització d'un valor llegit
  function previewTex(p, val) {
    const F = p.F || (p.space && p.space.F) || EV.QQ;
    switch (p.kind) {
      case 'int': return String(val);
      case 'scalar': return F.tex(val);
      case 'scalars': return val.length ? val.map((a) => F.tex(a)).join(',\\ ') : '\\text{(cap)}';
      case 'vector': return T.vec(F, val);
      case 'vectors': return val.length ? val.map((v) => T.vec(F, v)).join(',\\ ') : '\\text{(cap vector)}';
      case 'matrix': return T.matrix(F, val);
      case 'poly': return T.poly(F, val);
      case 'elem': return p.space.tex(p.space.fromC(val));
      case 'elems': return val.length ? val.map((c) => p.space.tex(p.space.fromC(c))).join(',\\ ') : '\\text{(cap)}';
      default: return '';
    }
  }

  function textInput(p, ph, onEnter) {
    const big = ['vectors', 'elems', 'matrix'].includes(p.kind);
    const el = big ? h('textarea', { rows: '1', spellcheck: 'false', autocomplete: 'off', placeholder: ph || hintFor(p) }) : h('input', { type: 'text', spellcheck: 'false', autocomplete: 'off', placeholder: ph || hintFor(p) });
    el.className = 'ans';
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (!big || e.ctrlKey || e.metaKey)) { e.preventDefault(); onEnter(); } });
    if (big) el.addEventListener('input', () => { el.style.height = 'auto'; el.style.height = Math.min(200, el.scrollHeight) + 'px'; });
    return el;
  }

  /**
   * opts: { mode: 'gen'|'orig'|'exam', tid, onDone(score), onProgress() }
   */
  function renderExercise(host, ex, opts) {
    opts = opts || {};
    const exam = opts.mode === 'exam';
    host.innerHTML = '';
    const root = h('div', { class: 'exercise' });
    if (ex.statement) root.appendChild(h('div', { class: 'statement' }, ex.statement));
    if (ex.intro && !exam) {
      const d = h('details', { class: 'intro' }, '<summary>Com es resol aquest tipus d\'exercici</summary>');
      d.appendChild(h('div', null, ex.intro));
      root.appendChild(d);
    }
    if (ex.notes && !exam) {
      const d = h('details', { class: 'intro' }, '<summary>Notes de classe</summary>');
      d.appendChild(h('div', null, ex.notes));
      root.appendChild(d);
    }
    const ctx = { answers: {} };
    const state = {};
    const cards = {};
    const partsBox = h('div', { class: 'parts' });
    root.appendChild(partsBox);

    function resolved(id) { const s = state[id]; return s && (s.ok || s.revealed); }
    function updateLocks() {
      ex.parts.forEach((p) => {
        if (!p.after || exam) return;
        const c = cards[p.id];
        const locked = !resolved(p.after);
        c.classList.toggle('locked', locked);
        c.querySelectorAll('input,textarea,button').forEach((b) => { b.disabled = locked && !b.classList.contains('nolock'); });
      });
    }
    function partScore(s) {
      if (s.ok && !s.revealedBefore) return s.tries <= 1 ? 1 : s.tries === 2 ? 0.7 : 0.5;
      return 0;
    }
    function maybeDone() {
      if (exam) return;
      if (ex.parts.every((p) => resolved(p.id)) && !root._done) {
        root._done = true;
        const sc = ex.parts.reduce((a, p) => a + partScore(state[p.id]), 0) / ex.parts.length;
        const fin = h('div', { class: 'done-banner ' + (sc >= 0.8 ? 'good' : sc >= 0.5 ? 'mid' : 'low') }, 'Exercici acabat · puntuació <b>' + Math.round(sc * 100) + '%</b>' + (sc >= 0.8 ? ' — molt bé!' : sc >= 0.5 ? ' — repassa els apartats en vermell.' : ' — mira les solucions i torna-ho a provar amb una altra variant.'));
        root.appendChild(fin);
        if (opts.onDone) opts.onDone(sc, fin);
      }
    }

    ex.parts.forEach((p, idx) => {
      state[p.id] = { tries: 0, ok: false, revealed: false };
      const card = h('div', { class: 'part', 'data-id': p.id });
      cards[p.id] = card;
      card.appendChild(h('div', { class: 'plabel' }, '<span class="pnum">' + (idx + 1) + '</span><div>' + p.label + '</div>'));
      const body = h('div', { class: 'pbody' });
      const preview = h('div', { class: 'preview' });
      const fb = h('div', { class: 'fb' });
      const sol = h('div', { class: 'sol hidden' });
      let getRaw;
      const doCheck = () => check();

      if (p.kind === 'choice') {
        let sel = null;
        const g = h('div', { class: 'pills' });
        p.options.forEach((o) => {
          const b = h('button', { class: 'pill', type: 'button' }, o.label);
          b.addEventListener('click', () => { sel = o.v; g.querySelectorAll('.pill').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); if (!exam) check(); });
          g.appendChild(b);
        });
        body.appendChild(g);
        getRaw = () => sel;
      } else if (p.kind === 'yesplus') {
        let sel = null;
        const g = h('div', { class: 'pills' });
        const when = p.textWhen || 'si';
        const wrap = h('div', { class: 'yp-text hidden' });
        wrap.appendChild(h('div', { class: 'small muted' }, esc(p.textLabel || 'Detalls') + ':'));
        const sub = Object.assign({ F: p.F }, p.text);
        const ta = textInput(sub, p.text.placeholder ? p.text.placeholder : hintFor(sub), doCheck);
        wrap.appendChild(ta);
        wrap.appendChild(h('div', { class: 'hint' }, esc(hintFor(sub))));
        (p.options || EV.G.YN).forEach((o) => {
          const b = h('button', { class: 'pill', type: 'button' }, o.label);
          b.addEventListener('click', () => { sel = o.v; g.querySelectorAll('.pill').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); wrap.classList.toggle('hidden', sel !== when); if (sel === when) ta.focus(); });
          g.appendChild(b);
        });
        ta.addEventListener('input', () => livePreview(sub, ta.value));
        body.appendChild(g); body.appendChild(wrap);
        getRaw = () => ({ yes: sel, text: ta.value });
      } else if (p.kind === 'multi') {
        const ins = {};
        p.fields.forEach((f) => {
          const row = h('div', { class: 'mrow' });
          row.appendChild(h('span', { class: 'mlabel' }, texHTML(f.label) + ' ='));
          const sub = Object.assign({ F: p.F }, f);
          const ta = textInput(sub, f.placeholder, doCheck);
          ta.addEventListener('input', () => livePreviewMulti());
          ins[f.key] = { ta, sub };
          row.appendChild(ta);
          body.appendChild(row);
        });
        body.appendChild(h('div', { class: 'hint' }, esc(HINT.matrix)));
        getRaw = () => { const o = {}; Object.keys(ins).forEach((k) => { o[k] = ins[k].ta.value; }); return o; };
        function livePreviewMulti() {
          const parts = [];
          for (const k of Object.keys(ins)) {
            const v = ins[k].ta.value.trim(); if (!v) continue;
            try { parts.push(texHTML(k + '=' + previewTex(ins[k].sub, EV.parseAnswer(ins[k].sub, v)))); } catch (e) { parts.push('<span class="perr">' + esc(k) + ': ' + esc(e.message) + '</span>'); }
          }
          preview.innerHTML = parts.join(' &nbsp; ');
        }
      } else {
        const inp = textInput(p, p.placeholder, doCheck);
        inp.addEventListener('input', () => livePreview(p, inp.value));
        body.appendChild(inp);
        body.appendChild(h('div', { class: 'hint' }, esc(hintFor(p))));
        getRaw = () => inp.value;
      }
      function livePreview(pp, v) {
        if (!String(v).trim()) { preview.innerHTML = ''; return; }
        try { const val = EV.parseAnswer(pp, v); preview.innerHTML = '<span class="pv-l">Llegeixo:</span> ' + texHTML(previewTex(pp, val)); } catch (e) { preview.innerHTML = '<span class="perr">' + esc(e.message) + '</span>'; }
      }

      card.appendChild(body);
      card.appendChild(preview);
      const actions = h('div', { class: 'actions' });
      if (!exam) {
        if (p.kind !== 'choice') actions.appendChild(h('button', { class: 'btn primary', type: 'button', onclick: () => check() }, 'Comprova'));
        actions.appendChild(h('button', { class: 'btn ghost nolock', type: 'button', onclick: () => toggleSol() }, 'Solució'));
      }
      card.appendChild(actions);
      card.appendChild(fb);
      card.appendChild(sol);
      if (p.after && !exam) card.appendChild(h('div', { class: 'lockmsg' }, 'Resol (o mira la solució de) l\'apartat anterior per desbloquejar aquest.'));
      partsBox.appendChild(card);

      function check(silent) {
        const st = state[p.id];
        const r = EV.checkAnswer(p, getRaw(), ctx);
        if (r.parseError) { fb.className = 'fb warnfb'; fb.innerHTML = '⚠ ' + esc(r.msg); return r; }
        if (!silent) st.tries++;
        if (r.ok) {
          if (!st.ok) { st.ok = true; st.revealedBefore = st.revealed; }
          ctx.answers[p.id] = r.value;
          fb.className = 'fb okfb'; fb.innerHTML = '✔ Correcte' + (r.msg ? ' · ' + esc(r.msg) : '');
          card.classList.add('ok'); card.classList.remove('bad');
        } else {
          fb.className = 'fb badfb'; fb.innerHTML = '✘ ' + (r.msg ? esc(r.msg) : 'No és correcte.') + (exam ? '' : ' <span class="muted small">(intent ' + st.tries + ')</span>');
          card.classList.add('bad'); card.classList.remove('ok');
        }
        if (!silent) { EV.Store.tick(1); if (opts.onProgress) opts.onProgress(); }
        updateLocks(); maybeDone();
        return r;
      }
      function toggleSol(force) {
        const st = state[p.id];
        const show = force !== undefined ? force : sol.classList.contains('hidden');
        if (show && !sol._filled) { sol.innerHTML = p.sol || '<p>(Sense solució detallada.)</p>'; math(sol); sol._filled = true; }
        sol.classList.toggle('hidden', !show);
        if (show && !st.ok) st.revealed = true;
        updateLocks(); maybeDone();
      }
      card._check = check; card._sol = toggleSol;
    });

    const foot = h('div', { class: 'exfoot' });
    if (!exam) foot.appendChild(h('button', { class: 'btn ghost', type: 'button', onclick: () => ex.parts.forEach((p) => cards[p.id]._sol(true)) }, 'Mostra totes les solucions'));
    root.appendChild(foot);
    host.appendChild(root);
    math(root);
    updateLocks();

    return {
      root, foot,
      submit() {
        // mode examen: corregeix-ho tot i mostra solucions
        let sc = 0;
        ex.parts.forEach((p) => { const r = cards[p.id]._check(true); state[p.id].tries = 1; if (r && r.ok) sc += 1; else if (!r.ok && !r.parseError) cards[p.id].classList.add('bad'); else if (r.parseError) cards[p.id].classList.add('bad'); cards[p.id]._sol(true); });
        root.querySelectorAll('input,textarea,.pill').forEach((x) => { x.disabled = true; });
        return sc / ex.parts.length;
      },
    };
  }

  EV.UI = { renderExercise, math, texHTML, h, esc };
})(window.EV = window.EV || {});
