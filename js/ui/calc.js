/* ============================================================
   Calculadora amb passos (per comprovar càlculs fets a mà)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S;
  const { m, dm } = H;

  function view(app) {
    document.title = 'Calculadora · Espais vectorials';
    const saved = JSON.parse(localStorage.getItem('ev-calc') || '{}');
    app.innerHTML = '<h1>Calculadora amb passos</h1><p class="muted">Escriu una matriu (files separades per <code>;</code> o per salts de línia, entrades per espais o comes). Tots els càlculs són exactes i es mostren els passos de Gauss-Jordan, per comprovar els teus exercicis fets a mà.</p>' +
      '<div class="calc"><div class="card"><label>Cos: <select id="cf"><option value="Q">ℚ / ℝ</option><option value="C">ℂ</option><option value="Z2">ℤ₂</option></select></label>' +
      '<label class="blk">Matriu <code>A</code> (o generadors de F, un per fila):<textarea id="cA" rows="4" spellcheck="false" placeholder="1 2 3\n4 5 6\n7 8 10"></textarea></label><div id="pA" class="preview"></div>' +
      '<label class="blk">Vector <code>b</code> / matriu <code>B</code> (opcional: per a Ax = b, o generadors de G per a F+G i F∩G):<textarea id="cB" rows="2" spellcheck="false" placeholder="(1, 0, 2)   o   1 0 1; 0 1 1"></textarea></label>' +
      '<div class="calcbtns">' + [['gj', 'Gauss-Jordan'], ['esg', 'Esglaonar'], ['rang', 'Rang'], ['det', 'Determinant'], ['inv', 'Inversa'], ['ker', 'Nucli (Ax=0)'], ['im', 'Imatge (columnes)'], ['rows', 'Base del generat per les files'], ['solve', 'Resol Ax = b'], ['diag', 'Valors propis i diagonalització'], ['zas', 'F+G i F∩G (A i B)']].map(([k, l]) => '<button class="btn ghost" data-op="' + k + '">' + l + '</button>').join('') + '</div></div>' +
      '<div class="card" id="cout"><p class="muted">El resultat sortirà aquí.</p></div></div>';
    const cf = app.querySelector('#cf'), cA = app.querySelector('#cA'), cB = app.querySelector('#cB'), out = app.querySelector('#cout'), pA = app.querySelector('#pA');
    cf.value = saved.f || 'Q'; cA.value = saved.A || ''; cB.value = saved.B || '';
    const F = () => EV.fieldById[cf.value];
    function readM(txt) { return EV.parseMatrix(txt, F()); }
    function prev() { try { pA.innerHTML = cA.value.trim() ? EV.UI.texHTML('A=' + T.matrix(F(), readM(cA.value))) : ''; } catch (e) { pA.innerHTML = '<span class="perr">' + EV.UI.esc(e.message) + '</span>'; } }
    cA.addEventListener('input', prev); cf.addEventListener('change', prev); prev();
    app.querySelectorAll('[data-op]').forEach((b) => b.onclick = () => {
      localStorage.setItem('ev-calc', JSON.stringify({ f: cf.value, A: cA.value, B: cB.value }));
      try { out.innerHTML = run(b.dataset.op, F(), readM(cA.value), cB.value.trim()); } catch (e) { out.innerHTML = '<p class="badfb">' + EV.UI.esc(e.message) + '</p>'; }
      EV.UI.math(out);
    });
  }

  function run(op, F, A, Btxt) {
    const n = A[0].length, mm = A.length;
    const vars = n <= 5 ? ['x', 'y', 'z', 't', 'u'].slice(0, n) : Array.from({ length: n }, (_, i) => 'x_{' + (i + 1) + '}');
    if (op === 'gj' || op === 'esg' || op === 'rang') {
      const rr = L.rref(F, A, { echelon: op !== 'gj' });
      return H.chain(F, rr, { aug: 0, echelon: op !== 'gj' }) + H.ans(m('\\operatorname{rang}A=' + rr.rank) + ' · pivots a les columnes ' + m(rr.pivots.map((j) => j + 1).join(',') || '\\text{cap}'));
    }
    if (op === 'det') {
      if (n !== mm) throw new Error('Cal una matriu quadrada.');
      const d = L.det(F, A);
      return H.P(n <= 2 ? EV.G.detTex(F, A) : 'Per esglaonament (cada intercanvi de files canvia el signe; ' + m('aF_i-bF_p') + ' multiplica el determinant per ' + m('a') + ', compte!).') + H.ans(m('\\det A=' + F.tex(d)));
    }
    if (op === 'inv') {
      if (n !== mm) throw new Error('Cal una matriu quadrada.');
      const r = L.inverse(F, A);
      return H.P('Esglaonem ' + m('(A\\mid I)') + ':') + H.chain(F, r.rr, { aug: n }) + (r.inv ? H.ans(m('A^{-1}=' + T.matrix(F, r.inv))) : H.ans('No és invertible (rang ' + r.rr.rank + ' < ' + n + ').'));
    }
    if (op === 'ker') return EV.G.nullSol(F, A, vars).html;
    if (op === 'im') {
      const rr = L.rref(F, A); const cols = L.transpose(A);
      return H.chain(F, rr, { aug: 0 }) + H.ans(m('\\operatorname{Im}=' + T.span(rr.pivots.map((j) => T.vec(F, cols[j])))) + ' · dimensió ' + rr.rank);
    }
    if (op === 'rows') {
      const sp = EV.Sp.Kn(F.id === 'Q' ? 'Q' : F.id, n);
      return EV.G.spanBasisSol(sp, A).html;
    }
    if (op === 'solve') {
      if (!Btxt) throw new Error('Escriu el vector b.');
      const b = EV.parseVector(Btxt, F, mm);
      const s = L.solve(F, A, b);
      let h = H.chain(F, s.rr, { aug: 1 });
      if (s.type === 'SI') return h + H.ans('Sistema incompatible (rang ' + s.rankA + ' ≠ rang ampliada).');
      h += H.ans(s.type + ': ' + m(T.vec(F, s.sol) + (s.dirs.length ? '+' + T.span(s.dirs.map((d) => T.vec(F, d))) : '')));
      return h;
    }
    if (op === 'diag') {
      if (F.id !== 'Q') throw new Error('La diagonalització es calcula a ℚ/ℝ (si hi ha valors propis complexos també s\'estudia ℂ).');
      if (n !== mm) throw new Error('Cal una matriu quadrada.');
      const parts = EV.T4.diagTasks(A, { overC: true }).parts;
      return parts.map((p) => '<div class="calcpart"><div class="small muted">' + p.label + '</div>' + p.sol + '</div>').join('');
    }
    if (op === 'zas') {
      if (!Btxt) throw new Error('Escriu els generadors de G a la segona caixa (un per fila).');
      const B = EV.parseMatrix(Btxt, F, undefined, undefined);
      if (B[0].length !== n) throw new Error('F i G han de viure al mateix espai.');
      const sp = EV.Sp.Kn(F.id === 'Q' ? 'Q' : F.id, n);
      const parts = EV.T3D.sumInterTasks(F, sp, A, B, { bases: true });
      return parts.map((p) => '<div class="calcpart"><div class="small muted">' + p.label + ' <b>' + EV.UI.esc(typeof p.ref === 'string' ? p.ref : '') + '</b></div>' + p.sol + '</div>').join('');
    }
    return '';
  }

  EV.Calc = { view, run };
})(window.EV = window.EV || {});
