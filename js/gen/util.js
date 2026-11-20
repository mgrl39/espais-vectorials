/* ============================================================
   Espais vectorials · Utilitats per als generadors:
   matrius aleatòries controlades + blocs de solució reutilitzables
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S;
  const { m, dm } = H;

  /* ---------- registre de generadors ---------- */
  const REG = {};
  function register(g) { REG[g.tid] = g; }

  /* ---------- números aleatoris en un cos ---------- */
  function rnd(F, rng, lo, hi, opts) {
    opts = opts || {};
    if (F.id === 'Z2') return rng.int(0, 1);
    if (F.id === 'C') {
      const re = rng.int(lo, hi), im = opts.realOnly ? 0 : (rng.bool(opts.pIm === undefined ? 0.45 : opts.pIm) ? rng.nz(-2, 2) : 0);
      return EV.cx(re, im);
    }
    return EV.fr(rng.int(lo, hi));
  }
  const maxAbs = (F, M) => {
    let mx = 0;
    M.forEach((r) => r.forEach((a) => {
      if (F.id === 'Z2') return;
      const w = F.id === 'C' ? Math.abs(a.re.toNumber()) + Math.abs(a.im.toNumber()) : Math.abs(a.toNumber());
      if (w > mx) mx = w;
      if (F.id === 'Q' && a.d !== 1n) mx = Math.max(mx, 99);
      if (F.id === 'C' && (a.re.d !== 1n || a.im.d !== 1n)) mx = Math.max(mx, 99);
    }));
    return mx;
  };

  // Matriu invertible n×n amb inversa "entera" (determinant ±1, o unitat a C)
  function unimodular(F, rng, n, opts) {
    opts = opts || {};
    const bound = opts.bound || 4;
    const ops = opts.ops || (n + 2);
    for (let tries = 0; tries < 200; tries++) {
      let M = L.identity(F, n);
      for (let k = 0; k < ops; k++) {
        const i = rng.int(0, n - 1); let j = rng.int(0, n - 1); if (i === j) j = (i + 1) % n;
        let c;
        if (F.id === 'Z2') c = 1;
        else if (F.id === 'C') c = rng.pick(opts.realOnly ? [EV.cx(1), EV.cx(-1), EV.cx(2)] : [EV.cx(1), EV.cx(-1), EV.cx(0, 1), EV.cx(0, -1), EV.cx(1, 1), EV.cx(2)]);
        else c = EV.fr(rng.pick([1, -1, 1, -1, 2, -2]));
        M[i] = M[i].map((x, t) => F.add(x, F.mul(c, M[j][t])));
      }
      // permutació de files
      M = rng.shuffle(M);
      if (opts.signs && F.id === 'Q') M = M.map((r) => (rng.bool(0.3) ? r.map((a) => a.neg()) : r));
      const isI = L.eqM(F, M, L.identity(F, n));
      const zeroEntries = M.flat().filter((a) => F.isZero(a)).length;
      if (!isI && maxAbs(F, M) <= bound && (opts.allowSparse || zeroEntries <= Math.floor(n * n / 2))) return M;
    }
    return L.identity(F, n);
  }

  // Matriu en forma reduïda r×n aleatòria (pivots en `piv`), entrades petites
  function randomRref(F, rng, r, n, opts) {
    opts = opts || {};
    const piv = opts.pivots || rng.sample(Array.from({ length: n }, (_, i) => i), r).sort((a, b) => a - b);
    const R = L.zeros(F, r, n);
    piv.forEach((pc, k) => {
      R[k][pc] = F.one;
      for (let j = pc + 1; j < n; j++) if (!piv.includes(j)) R[k][j] = rnd(F, rng, opts.lo === undefined ? -2 : opts.lo, opts.hi === undefined ? 2 : opts.hi, { pIm: opts.pIm });
    });
    return { R, piv };
  }

  // Matriu m×n de rang r amb entrades acotades
  function rankMatrix(F, rng, mm, n, r, opts) {
    opts = opts || {};
    const bound = opts.bound || 6;
    for (let t = 0; t < 300; t++) {
      const { R } = randomRref(F, rng, r, n, opts);
      const U = unimodular(F, rng, mm, { bound: opts.ubound || 3, ops: opts.uops || mm + 1, allowSparse: true });
      const Rfull = R.concat(L.zeros(F, mm - r, n));
      const A = L.mul(F, U, Rfull);
      if (maxAbs(F, A) > bound) continue;
      if (opts.noZeroRows && A.some((row) => L.isZeroV(F, row))) continue;
      if (opts.noZeroCols && L.transpose(A).some((c) => L.isZeroV(F, c))) continue;
      if (L.rank(F, A) !== r) continue;
      return A;
    }
    throw new Error('rankMatrix: no s\'ha trobat');
  }

  // família de k vectors de K^n que genera un subespai de dimensió r (k ≥ r)
  function familyRank(F, rng, k, n, r, opts) {
    const A = rankMatrix(F, rng, k, n, r, Object.assign({ noZeroRows: true }, opts || {}));
    return A;
  }

  // Combinació lineal no trivial "bonica" de vectors
  function smallCoefs(F, rng, k, opts) {
    opts = opts || {};
    for (;;) {
      const c = Array.from({ length: k }, () => (F.id === 'Z2' ? rng.int(0, 1) : rnd(F, rng, -2, 2, { pIm: 0.25 })));
      if (opts.allNonzero && c.some((a) => F.isZero(a))) continue;
      if (!c.every((a) => F.isZero(a))) return c;
    }
  }

  /* ---------- blocs de solució ---------- */
  const fieldName = (sp) => sp.K;
  function coordLine(sp, c) {
    if (sp.kind === 'Kn') return '';
    return m(sp.tex(sp.fromC(c)) + '\\ \\longleftrightarrow\\ ' + T.vec(sp.F, c));
  }
  function coordIntro(sp) {
    if (sp.kind === 'Kn') return '';
    return H.P('Treballem en coordenades respecte de la base canònica ' + m(sp.canBasisTex()) + ' de ' + m(sp.name) + '. Cada element correspon al vector de ' + m(sp.K + '^{' + sp.dim + '}') + ' dels seus coeficients.');
  }

  // Tasca 1: u ∈ <gens>? (gens i u en coordenades). Retorna {html, res}
  function membershipSol(sp, gens, u, opts) {
    opts = opts || {};
    const F = sp.F;
    const k = gens.length;
    const names = opts.coefNames || ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, k);
    const res = L.solve(F, L.transpose(gens), u);
    let h = '';
    h += coordIntro(sp);
    if (sp.kind !== 'Kn') h += '<div class="coordlist">' + gens.map((g) => coordLine(sp, g)).join('<br>') + '<br>' + coordLine(sp, u) + '</div>';
    h += H.P('Busquem ' + m(names.join(',') + '\\in ' + sp.K) + ' tals que ' + m(names.map((x, i) => x + 'v_{' + (i + 1) + '}').join('+') + '=u') + '. Posem els generadors <b>en columnes</b> i ' + m('u') + ' com a columna ampliada:');
    h += H.chain(F, res.rr, { aug: 1 });
    if (res.type === 'SI') {
      h += H.P('Surt una fila ' + m('(0\\ \\cdots\\ 0\\mid c)') + ' amb ' + m('c\\neq 0') + ': ' + m('\\operatorname{rang}(A)=' + res.rankA + '\\neq' + res.rankAb + '=\\operatorname{rang}(A|u)') + ', sistema <b>incompatible</b>.');
      h += H.ans(m('u\\notin F'));
    } else {
      const unique = res.type === 'SCD';
      h += H.P(m('\\operatorname{rang}(A)=\\operatorname{rang}(A|u)=' + res.rankA) + (unique ? ' = nombre d\'incògnites ⇒ <b>SCD</b> (una única manera).' : ' &lt; ' + k + ' incògnites ⇒ <b>SCI</b> (infinites maneres; els generadors són LD).'));
      const sol = res.sol;
      h += H.P('Una solució' + (unique ? '' : ' (paràmetres lliures = 0)') + ': ' + m(names.map((x, i) => x + '=' + F.tex(sol[i])).join(',\\ ')) + '.');
      h += H.P('Comprovació: ' + m(T.lincomb(F, sol, gens.map((g) => (sp.kind === 'Kn' ? T.vec(F, g) : (sp.kind === 'Pn' ? '(' + sp.tex(g) + ')' : sp.tex(g))))) + ' = ' + sp.tex(sp.fromC(u))) + ' ✓');
      h += H.ans(m('u\\in F'));
    }
    return { html: h, res };
  }

  // Tasca 3: base del subespai generat (vectors en files)
  function spanBasisSol(sp, gens, opts) {
    opts = opts || {};
    const F = sp.F;
    const rr = L.rref(F, gens);
    let h = coordIntro(sp);
    if (sp.kind !== 'Kn') h += '<div class="coordlist">' + gens.map((g) => coordLine(sp, g)).join('<br>') + '</div>';
    h += H.P('Posem els generadors <b>en files</b> i esglaonem (les transformacions de files no canvien el subespai generat, Lema 3.3):');
    h += H.chain(F, rr, { aug: 0 });
    const basis = rr.R.slice(0, rr.rank);
    h += H.P(m('\\dim F=\\operatorname{rang}=' + rr.rank) + '. Les files no nul·les formen una base (Prop. 3.17): ' + m('\\left(' + basis.map((b) => sp.tex(sp.fromC(b))).join(',\\ ') + '\\right)') + '.');
    const ms = L.maximalSubfamily(F, gens);
    if (opts.showSubfamily !== false && ms.idx.length) {
      h += H.P('Alternativa (també vàlida): una subfamília LI maximal dels generadors originals, ' + m('(' + ms.idx.map((i) => 'v_{' + (i + 1) + '}').join(',') + ')') + ' (columnes pivot quan els posem en columnes).');
    }
    return { html: h, basis, rank: rr.rank, rr, sub: ms.idx };
  }

  // Tasca 5: base de les solucions d'un sistema homogeni A x = 0
  function nullSol(F, A, varNames, opts) {
    opts = opts || {};
    const n = A[0].length;
    const ns = L.nullspace(F, A);
    let h = '';
    h += H.P('Resolem el sistema homogeni per Gauss-Jordan:');
    h += H.chain(F, ns.rr, { aug: 0 });
    const piv = ns.rr.pivots;
    if (!ns.free.length) {
      h += H.P('Rang ' + ns.rr.rank + ' = ' + n + ' incògnites: només la solució trivial. El subespai és ' + m('\\{0\\}') + ' (dimensió 0, base buida).');
      return { html: h, basis: [], ns };
    }
    const eqs = piv.map((pc, k) => {
      const rhs = ns.free.map((fj) => F.neg(ns.rr.R[k][fj]));
      return varNames[pc] + ' = ' + T.lincomb(F, rhs, ns.free.map((fj) => varNames[fj]));
    });
    h += H.P('Variables lliures: ' + m(ns.free.map((j) => varNames[j]).join(',')) + '. Aïllem les pivot: ' + m(eqs.join(',\\quad ')) + '.');
    const genVec = varNames.map((_, j) => {
      if (ns.free.includes(j)) return varNames[j];
      const k = piv.indexOf(j);
      return T.lincomb(F, ns.free.map((fj) => F.neg(ns.rr.R[k][fj])), ns.free.map((fj) => varNames[fj]));
    });
    h += H.P('Forma paramètrica: ' + m('(' + genVec.join(',') + ') = ' + ns.free.map((fj, t) => varNames[fj] + T.vec(F, ns.basis[t])).join(' + ')) + '.');
    h += H.P(m('\\dim = ' + n + ' - \\operatorname{rang} = ' + n + '-' + ns.rr.rank + '=' + ns.free.length) + '. Base (vectors directors): ' + m('\\left(' + ns.basis.map((b) => (opts.sp ? opts.sp.tex(opts.sp.fromC(b)) : T.vec(F, b))).join(',\\ ') + '\\right)') + '.');
    const scaled = ns.basis.map((b) => L.clearDen(F, b));
    if (F.id === 'Q' && scaled.some((b, i) => !L.eqV(F, b, ns.basis[i]))) {
      h += H.tip('Podem multiplicar cada vector per un escalar no nul per treure fraccions: ' + m('\\left(' + scaled.map((b) => (opts.sp ? opts.sp.tex(opts.sp.fromC(b)) : T.vec(F, b))).join(',\\ ') + '\\right)') + ' també és base.');
    }
    return { html: h, basis: ns.basis, scaled, ns };
  }

  // Tasca 2: ampliar família LI de K^n a una base amb vectors canònics
  function extendSol(sp, fam, opts) {
    opts = opts || {};
    const F = sp.F, n = sp.dim;
    const ex = L.extendCanonical(F, fam, n);
    let h = H.P('Posem la base en files i esglaonem. Les columnes <b>sense pivot</b> ens diuen quins vectors de la base canònica cal afegir (Tasca 2):');
    h += H.chain(F, ex.rr, { aug: 0, echelon: true });
    const names = sp.canNames;
    const missing = [];
    for (let j = 0; j < n; j++) if (!ex.rr.pivots.includes(j)) missing.push(j);
    h += H.P('Pivots a les columnes ' + m(ex.rr.pivots.map((j) => j + 1).join(',')) + '; falten les columnes ' + m(missing.map((j) => j + 1).join(',')) + '. Afegim ' + m(missing.map((j) => names[j]).join(',')) + (sp.kind !== 'Kn' ? ' (és a dir, ' + m(ex.add.map((e) => sp.tex(sp.fromC(e))).join(',\\ ')) + ')' : ' ' + m('= ' + ex.add.map((e) => T.vec(F, e)).join(',\\ '))) + '.');
    h += H.P('La matriu amb aquestes files afegides és esglaonada (amb permutació de files) amb ' + n + ' pivots ⇒ són ' + n + ' vectors LI ⇒ base de ' + m(sp.name) + ' (Prop. 3.19 D2).');
    return { html: h, add: ex.add };
  }

  // coordenades de u respecte d'una base
  function coordsSol(sp, basis, u, bname) {
    const F = sp.F;
    const res = L.solve(F, L.transpose(basis), u);
    let h = H.P('Coordenades de ' + m('u') + ' respecte de ' + m(bname || 'B') + ': resolem ' + m(basis.map((_, i) => '\\lambda_{' + (i + 1) + '}w_{' + (i + 1) + '}').join('+') + '=u') + ' (base en columnes, ' + m('u') + ' ampliada):');
    h += H.chain(F, res.rr, { aug: 1 });
    if (res.type !== 'SCD') { h += H.P('El sistema no és compatible determinat: ' + m('u') + ' no pertany al subespai.'); return { html: h, coords: null }; }
    h += H.ans(m('u_{' + (bname || 'B') + '} = ' + T.vec(F, res.sol)));
    return { html: h, coords: res.sol };
  }

  // Base que contingui u: canviem un vector de la base per u (lema de l'intercanvi)
  function basisWithU(F, basis, u) {
    const c = L.coords(F, basis, u);
    if (!c) return null;
    const k = c.findIndex((a) => !F.isZero(a));
    const nb = basis.slice(); nb[k] = u;
    return { basis: nb, k, c };
  }
  function basisWithUSol(sp, basis, u, bname) {
    const F = sp.F;
    const r = basisWithU(F, basis, u);
    let h = H.P('Com que ' + m('u = ' + T.lincomb(F, r.c, basis.map((_, i) => 'w_{' + (i + 1) + '}'))) + ' i el coeficient de ' + m('w_{' + (r.k + 1) + '}') + ' és ' + m(F.tex(r.c[r.k]) + '\\neq 0') + ', podem substituir ' + m('w_{' + (r.k + 1) + '}') + ' per ' + m('u') + ' i continuem tenint una base (la família segueix generant i té el mateix nombre de vectors):');
    h += H.ans(m('\\left(' + r.basis.map((b) => sp.tex(sp.fromC(b))).join(',\\ ') + '\\right)'));
    h += H.tip('Regla: es pot canviar ' + m('w_k') + ' per ' + m('u') + ' sempre que el coeficient de ' + m('w_k') + ' a l\'expressió de ' + m('u') + ' sigui no nul.');
    return { html: h, basis: r.basis };
  }

  // Determinant 2x2/3x3 amb fórmula visible
  function detTex(F, A) {
    const n = A.length;
    const d = L.det(F, A);
    if (n === 2) {
      return m('\\det = ' + paren(F, A[0][0]) + '\\cdot' + paren(F, A[1][1]) + ' - ' + paren(F, A[0][1]) + '\\cdot' + paren(F, A[1][0]) + ' = ' + F.tex(d));
    }
    return m('\\det' + T.matrix(F, A, { env: 'vmatrix' }) + ' = ' + F.tex(d));
  }
  function paren(F, a) { const t = F.tex(a); return (t.startsWith('-') || EV.needsParens(F, a)) ? '(' + t + ')' : t; }

  // llistes d'escalars
  const vecIn = (F, v) => S.vecStr(F, v);

  // opcions Sí/No
  const YN = [{ v: 'si', label: 'Sí' }, { v: 'no', label: 'No' }];

  EV.G = { REG, register, rnd, maxAbs, unimodular, randomRref, rankMatrix, familyRank, smallCoefs, coordLine, coordIntro, membershipSol, spanBasisSol, nullSol, extendSol, coordsSol, basisWithU, basisWithUSol, detTex, paren, vecIn, YN };
})(window.EV = window.EV || {});
