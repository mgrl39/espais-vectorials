/* ============================================================
   Espais vectorials · Espais (K^n, K_n[x], M_mxn), subespais,
   comprovadors de respostes, RNG i ajudes d'HTML per a solucions
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, S = EV.S;

  /* ---------------- RNG amb llavor ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    const r = mulberry32(seed >>> 0);
    const R = {
      seed,
      next: r,
      int: (a, b) => a + Math.floor(r() * (b - a + 1)),
      nz: (a, b) => { let x; do { x = a + Math.floor(r() * (b - a + 1)); } while (x === 0); return x; },
      pick: (arr) => arr[Math.floor(r() * arr.length)],
      bool: (p) => r() < (p === undefined ? 0.5 : p),
      shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      sample: (arr, k) => R.shuffle(arr).slice(0, k),
    };
    return R;
  }
  const newSeed = () => (Math.floor(Math.random() * 2 ** 31) ^ Date.now()) >>> 0;

  /* ---------------- Espais vectorials ---------------- */
  const CAN = { Q: '\\mathbb{Q}', R: '\\mathbb{R}', C: '\\mathbb{C}', Z2: '\\mathbb{Z}_2' };
  function fieldOfSym(sym) { return sym === 'C' ? EV.CC : sym === 'Z2' ? EV.Z2 : EV.QQ; }

  function Kn(sym, n) {
    const F = fieldOfSym(sym);
    const K = CAN[sym];
    return {
      kind: 'Kn', F, sym, K, n, dim: n,
      name: sym === 'Z2' ? '(\\mathbb{Z}_2)^{' + n + '}' : K + '^{' + n + '}',
      tex: (v) => T.vec(F, v),
      str: (v) => S.vecStr(F, v),
      toC: (v) => v, fromC: (c) => c,
      parse: (s) => EV.parseVector(s, F, n),
      parseList: (s) => EV.parseVectorList(s, F, n),
      fmt: 'vectors entre parèntesis, separats per comes: (1, 0, 2), (0, 1, -1/2)',
      fmt1: 'un vector: (1, 0, -2/3)',
      canBasisTex: () => '\\mathcal{C}=(e_1,\\dots,e_{' + n + '})',
      canNames: Array.from({ length: n }, (_, i) => 'e_{' + (i + 1) + '}'),
    };
  }
  function Pn(sym, deg) {
    const F = fieldOfSym(sym);
    const K = CAN[sym];
    const pad = (p) => EV.P.pad(F, p, deg + 1);
    return {
      kind: 'Pn', F, sym, K, deg, dim: deg + 1,
      name: K + '_{' + deg + '}[x]',
      tex: (c) => T.poly(F, c),
      str: (c) => S.polyStr(F, c),
      toC: (c) => pad(c), fromC: (c) => c.slice(),
      parse: (s) => {
        const p = EV.parsePolyExpr(s, F);
        if (p.length - 1 > deg && !(p.length === 1)) throw new EV.ParseError('El grau ha de ser ≤ ' + deg);
        return pad(p);
      },
      parseList: (s) => EV.splitTop(s, ',;').map((t) => {
        const p = EV.parsePolyExpr(t, F);
        if (p.length - 1 > deg) throw new EV.ParseError('El grau ha de ser ≤ ' + deg + ' (' + t + ')');
        return pad(p);
      }),
      fmt: 'polinomis separats per comes: x^2 - 1, x - 1, 3x^3 + x',
      fmt1: 'un polinomi: x^3 - 2x + 1/2',
      canBasisTex: () => '\\mathcal{C}=(1,x' + (deg >= 2 ? ',x^2' : '') + (deg >= 3 ? ',\\dots,x^{' + deg + '}' : '') + ')',
      canNames: Array.from({ length: deg + 1 }, (_, i) => (i === 0 ? '1' : i === 1 ? 'x' : 'x^{' + i + '}')),
    };
  }
  function Mmn(sym, m, n) {
    const F = fieldOfSym(sym);
    const K = CAN[sym];
    const toM = (c) => Array.from({ length: m }, (_, i) => c.slice(i * n, i * n + n));
    return {
      kind: 'Mmn', F, sym, K, m, n, dim: m * n,
      name: m === n ? 'M_{' + n + '}(' + K + ')' : 'M_{' + m + '\\times ' + n + '}(' + K + ')',
      tex: (c) => T.matrix(F, toM(c)),
      str: (c) => S.matStr(F, toM(c)),
      toC: (c) => c, fromC: (c) => c,
      toM, flat: (M) => M.flat(),
      parse: (s) => EV.parseMatrix(s, F, m, n).flat(),
      parseList: (s) => EV.parseMatrixList(s, F, m, n).map((M) => M.flat()),
      fmt: 'matrius entre claudàtors, files separades per ";": [1 0; 0 -1], [0 1; 1 0]',
      fmt1: 'una matriu: [1 2; 3 4]',
      canBasisTex: () => '\\mathcal{C}=(E_{11},E_{12},\\dots,E_{' + m + n + '})',
      canNames: Array.from({ length: m * n }, (_, k) => 'E_{' + (Math.floor(k / n) + 1) + (k % n + 1) + '}'),
    };
  }

  /* ---------------- Subespais (en coordenades) ---------------- */
  function subFromGens(F, gens, ambientDim) {
    const rb = L.rowBasis(F, gens);
    return { F, gens, basis: rb.basis, dim: rb.rank, n: ambientDim, contains: (v) => L.inSpan(F, rb.basis, v) };
  }
  function subFromEqs(F, A, n) {
    if (!A.length) return subFromGens(F, L.identity(F, n), n);
    const ns = L.nullspace(F, A);
    return { F, eqs: A, basis: ns.basis, dim: ns.basis.length, n, contains: (v) => L.isZeroV(F, L.mulVec(F, A, v)) };
  }

  /* ---------------- Comprovadors ---------------- */
  const ok = (msg) => ({ ok: true, msg: msg || '' });
  const bad = (msg) => ({ ok: false, msg: msg || '' });

  const C = {
    // llista és base del subespai W
    basisOf(F, W, list, opts) {
      opts = opts || {};
      if (list.length !== W.dim) return bad('Una base d\'aquest subespai té ' + W.dim + ' vector' + (W.dim === 1 ? '' : 's') + ' (n\'has donat ' + list.length + ').');
      const out = list.findIndex((v) => !W.contains(v));
      if (out >= 0) return bad('El vector núm. ' + (out + 1) + ' no pertany al subespai.');
      if (!L.isLI(F, list)) return bad('Els vectors són linealment dependents.');
      if (opts.mustContain && !list.some((v) => L.eqV(F, v, opts.mustContain))) return bad('La base ha de contenir el vector demanat.');
      return ok();
    },
    gensOf(F, W, list) {
      if (W.dim === 0) return list.every((v) => L.isZeroV(F, v)) ? ok() : bad('El subespai és {0}.');
      const out = list.findIndex((v) => !W.contains(v));
      if (out >= 0) return bad('El vector núm. ' + (out + 1) + ' no pertany al subespai.');
      if (L.rank(F, list) < W.dim) return bad('Aquests vectors no generen tot el subespai (generen un subespai de dimensió ' + L.rank(F, list) + ' < ' + W.dim + ').');
      return ok();
    },
    // vectors a afegir a `base` (LI, dins W) per obtenir una base de W
    extension(F, W, base, list) {
      const need = W.dim - base.length;
      if (list.length !== need) return bad('Has d\'afegir exactament ' + need + ' vector' + (need === 1 ? '' : 's') + '.');
      const out = list.findIndex((v) => !W.contains(v));
      if (out >= 0) return bad('El vector núm. ' + (out + 1) + ' no és de l\'espai on cal ampliar.');
      if (!L.isLI(F, base.concat(list))) return bad('La família ampliada queda linealment dependent.');
      return ok();
    },
    eqVec(F, v, target) { return L.eqV(F, v, target) ? ok() : bad(); },
    eqMat(F, M, target) { return L.eqM(F, M, target) ? ok() : bad(); },
    eqScalar(F, a, b) { return F.eq(a, b) ? ok() : bad(); },
    // multiconjunt de valors
    sameMultiset(F, xs, ys, msgCount) {
      if (xs.length !== ys.length) return bad(msgCount || ('Hi ha ' + ys.length + ' valor' + (ys.length === 1 ? '' : 's') + '.'));
      const used = ys.map(() => false);
      for (const x of xs) { const k = ys.findIndex((y, i) => !used[i] && F.eq(x, y)); if (k < 0) return bad(); used[k] = true; }
      return ok();
    },
    sameSet(F, xs, ys) {
      const uniq = []; xs.forEach((x) => { if (!uniq.some((u) => F.eq(u, x))) uniq.push(x); });
      if (uniq.length !== ys.length) return bad('Hi ha ' + ys.length + ' valor' + (ys.length === 1 ? '' : 's') + ' diferent' + (ys.length === 1 ? '' : 's') + '.');
      return uniq.every((x) => ys.some((y) => F.eq(x, y))) ? ok() : bad();
    },
  };

  /* ---------------- Ajudes per escriure solucions (HTML + TeX) ---------------- */
  const m = (t) => '\\(' + t + '\\)';
  const dm = (t) => '\\[' + t + '\\]';
  function chain(F, rr, opts) {
    opts = opts || {};
    const aug = opts.aug !== undefined ? opts.aug : rr.aug;
    const fmt = (M) => T.augmented(F, M, aug);
    let h = '<div class="chain"><span class="cm">' + m(fmt(rr.start)) + '</span>';
    const steps = opts.maxSteps ? rr.steps.slice(0, opts.maxSteps) : rr.steps;
    steps.forEach((s) => { h += '<span class="cm">' + m(T.arrow(s.ops) + fmt(s.M)) + '</span>'; });
    if (!rr.steps.length) h += '<span class="cm note">(ja està ' + (opts.echelon ? 'esglaonada' : 'reduïda') + ')</span>';
    return h + '</div>';
  }
  const box = (cls, title, body) => '<div class="box ' + cls + '">' + (title ? '<div class="box-t">' + title + '</div>' : '') + body + '</div>';
  const P_ = (s) => '<p>' + s + '</p>';
  const ul = (items) => '<ul>' + items.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
  const ans = (s) => '<div class="final">⇒ ' + s + '</div>';
  const warn = (s) => box('warn', 'Compte', s);
  const tip = (s) => box('tip', 'Truc', s);

  // Llista d'elements d'un espai en TeX
  const listTex = (sp, list) => list.map((c) => sp.tex(sp.fromC(c))).join(',\\ ');

  EV.makeRng = makeRng; EV.newSeed = newSeed;
  EV.Sp = { Kn, Pn, Mmn, CAN, fieldOfSym };
  EV.Sub = { fromGens: subFromGens, fromEqs: subFromEqs };
  EV.C = C; EV.ok = ok; EV.bad = bad;
  EV.H = { m, dm, chain, box, P: P_, ul, ans, warn, tip, listTex };
})(window.EV = window.EV || {});
