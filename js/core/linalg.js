/* ============================================================
   Espais vectorials · Àlgebra lineal exacta sobre un cos F
   (Gauss-Jordan amb registre de passos, rang, nucli, sistemes,
   inverses, determinants, bases, Zassenhaus...)
   ============================================================ */
(function (EV) {
  'use strict';
  const T = EV.T;

  const clone = (M) => M.map((r) => r.slice());
  const zeros = (F, m, n) => Array.from({ length: m }, () => Array.from({ length: n }, () => F.zero));
  const identity = (F, n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? F.one : F.zero)));
  const transpose = (M) => (M.length ? M[0].map((_, j) => M.map((r) => r[j])) : []);
  const fromInts = (F, M) => M.map((r) => r.map((x) => toF(F, x)));

  function toF(F, x) {
    if (typeof x === 'number' || typeof x === 'bigint') return F.fromInt(x);
    if (typeof x === 'string') {
      if (F.id === 'Q') return EV.Frac.from(x);
      return EV.parseScalar(x, F);
    }
    return x; // ja és element
  }

  function mul(F, A, B) {
    const m = A.length, n = B[0].length, k = B.length;
    const C = zeros(F, m, n);
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      let s = F.zero;
      for (let t = 0; t < k; t++) s = F.add(s, F.mul(A[i][t], B[t][j]));
      C[i][j] = s;
    }
    return C;
  }
  const mulVec = (F, A, v) => A.map((r) => r.reduce((s, a, j) => F.add(s, F.mul(a, v[j])), F.zero));
  const addM = (F, A, B) => A.map((r, i) => r.map((a, j) => F.add(a, B[i][j])));
  const subM = (F, A, B) => A.map((r, i) => r.map((a, j) => F.sub(a, B[i][j])));
  const scaleM = (F, c, A) => A.map((r) => r.map((a) => F.mul(c, a)));
  const eqM = (F, A, B) => A.length === B.length && A.every((r, i) => r.length === B[i].length && r.every((a, j) => F.eq(a, B[i][j])));
  const eqV = (F, u, v) => u.length === v.length && u.every((a, i) => F.eq(a, v[i]));
  const isZeroV = (F, v) => v.every((a) => F.isZero(a));
  const addV = (F, u, v) => u.map((a, i) => F.add(a, v[i]));
  const subV = (F, u, v) => u.map((a, i) => F.sub(a, v[i]));
  const scaleV = (F, c, v) => v.map((a) => F.mul(c, a));
  const combo = (F, coefs, vecs) => vecs[0].map((_, j) => coefs.reduce((s, c, i) => F.add(s, F.mul(c, vecs[i][j])), F.zero));
  const isDiag = (F, M) => M.every((r, i) => r.every((a, j) => i === j || F.isZero(a)));

  /* ---------- etiquetes d'operacions elementals ---------- */
  function scalarFactorTex(F, c) {
    // tex de "c·" davant d'una fila (c ≠ 0)
    if (F.isOne(c)) return '';
    if (F.isNegOne(c)) return '-';
    if (EV.needsParens(F, c)) return '(' + F.tex(c) + ')';
    return F.tex(c);
  }
  // etiqueta: a·F_i + b·F_p  (a ≠ 0)
  function opLabel(F, i, a, p, b) {
    let s = scalarFactorTex(F, a) + T.Fr(i);
    if (F.isNeg(b) && !EV.needsParens(F, b)) s += ' - ' + scalarFactorTex(F, F.neg(b)) + T.Fr(p);
    else s += ' + ' + scalarFactorTex(F, b) + T.Fr(p);
    return s;
  }

  function pivotChoice(F, M, r, c) {
    let best = -1, bw = Infinity;
    for (let i = r; i < M.length; i++) {
      const a = M[i][c];
      if (F.isZero(a)) continue;
      let w = F.weight(a);
      if (F.isOne(a)) w = -2; else if (F.isNegOne(a)) w = -1;
      if (i === r) w -= 0.5; // preferim no intercanviar si no cal
      if (w < bw) { bw = w; best = i; }
    }
    return best;
  }

  function allIntRow(F, row) { return F.id === 'Q' && row.every((a) => a.d === 1n); }

  /**
   * Esglaonament / Gauss-Jordan amb passos.
   * opts.aug: nombre de columnes ampliades (no s'hi busquen pivots)
   * opts.echelon: si true, s'atura a la forma esglaonada (no redueix cap amunt)
   * opts.intFriendly: (per defecte true) evita fraccions mentre es pugui a Q
   */
  function rref(F, M0, opts) {
    opts = opts || {};
    const aug = opts.aug || 0;
    const intFriendly = opts.intFriendly !== false;
    const M = clone(M0);
    const m = M.length, n = m ? M[0].length : 0;
    const steps = [];
    const pivots = [];
    let r = 0;
    for (let c = 0; c < n - aug && r < m; c++) {
      const p = pivotChoice(F, M, r, c);
      if (p < 0) continue;
      const ops = [];
      if (p !== r) { [M[p], M[r]] = [M[r], M[p]]; ops.push(T.Fr(r) + '\\leftrightarrow ' + T.Fr(p)); }
      const a = M[r][c];
      for (let i = r + 1; i < m; i++) {
        const b = M[i][c];
        if (F.isZero(b)) continue;
        if (intFriendly && allIntRow(F, M[i]) && allIntRow(F, M[r]) && (b.n % a.n !== 0n)) {
          // a F_i - b F_r  (amb a,b sense factor comú, a > 0)
          let g = EV.bgcd(a.n, b.n); let aa = a.n / g, bb = b.n / g;
          if (aa < 0n) { aa = -aa; bb = -bb; }
          const A_ = EV.fr(aa), B_ = EV.fr(-bb);
          M[i] = M[i].map((x, j) => F.add(F.mul(A_, x), F.mul(B_, M[r][j])));
          ops.push(opLabel(F, i, A_, r, B_));
        } else {
          const f = F.neg(F.div(b, a));
          M[i] = M[i].map((x, j) => F.add(x, F.mul(f, M[r][j])));
          ops.push(opLabel(F, i, F.one, r, f));
        }
      }
      if (ops.length) steps.push({ ops, M: clone(M) });
      pivots.push(c);
      r++;
    }
    const rank = pivots.length;
    if (!opts.echelon) {
      // simplificar files enteres per mcd (opcional i només a Q) abans de reduir? no: mantenim clar.
      for (let k = rank - 1; k >= 0; k--) {
        const c = pivots[k];
        const ops = [];
        const a = M[k][c];
        if (!F.isOne(a)) {
          const s = F.inv(a);
          M[k] = M[k].map((x) => F.mul(s, x));
          if (F.isNegOne(a)) ops.push('-' + T.Fr(k));
          else if (F.id === 'Q' && a.d === 1n) ops.push(T.Fr(k) + '/' + (a.n < 0n ? '(' + a.n + ')' : a.n));
          else ops.push(scalarFactorTex(F, s) + T.Fr(k));
        }
        for (let i = 0; i < k; i++) {
          const b = M[i][c];
          if (F.isZero(b)) continue;
          const f = F.neg(b);
          M[i] = M[i].map((x, j) => F.add(x, F.mul(f, M[k][j])));
          ops.push(opLabel(F, i, F.one, k, f));
        }
        if (ops.length) steps.push({ ops, M: clone(M) });
      }
    }
    return { R: M, pivots, rank, steps, start: clone(M0), aug };
  }

  const rank = (F, M) => (M.length ? rref(F, M, { echelon: true }).rank : 0);

  /* ---------- Sistemes ---------- */
  // Nucli de A (solucions de Ax = 0) a partir de la forma reduïda
  function nullFromRref(F, R, pivots, n) {
    const free = [];
    for (let j = 0; j < n; j++) if (!pivots.includes(j)) free.push(j);
    const basis = free.map((fj) => {
      const v = Array(n).fill(F.zero);
      v[fj] = F.one;
      pivots.forEach((pc, k) => { v[pc] = F.neg(R[k][fj]); });
      return v;
    });
    return { basis, free };
  }

  function nullspace(F, A) {
    const n = A[0].length;
    const rr = rref(F, A);
    const ns = nullFromRref(F, rr.R, rr.pivots, n);
    return { basis: ns.basis, free: ns.free, rr };
  }

  // Resol A x = b. Retorna {type: 'SCD'|'SCI'|'SI', sol, dirs, free, rr}
  function solve(F, A, b) {
    const n = A[0].length;
    const Ab = A.map((r, i) => r.concat([b[i]]));
    const rr = rref(F, Ab, { aug: 1 });
    // incompatible si hi ha fila 0 ... 0 | c≠0
    const inc = rr.R.some((row) => row.slice(0, n).every((a) => F.isZero(a)) && !F.isZero(row[n]));
    if (inc) return { type: 'SI', rr, rankA: rr.rank, rankAb: rr.rank + 1 };
    const sol = Array(n).fill(F.zero);
    rr.pivots.forEach((pc, k) => { sol[pc] = rr.R[k][n]; });
    const ns = nullFromRref(F, rr.R.map((r) => r.slice(0, n)), rr.pivots, n);
    return { type: ns.free.length ? 'SCI' : 'SCD', sol, dirs: ns.basis, free: ns.free, rr, rankA: rr.rank, rankAb: rr.rank };
  }

  function inverse(F, A) {
    const n = A.length;
    const AI = A.map((r, i) => r.concat(identity(F, n)[i]));
    const rr = rref(F, AI, { aug: n });
    if (rr.rank < n) return { inv: null, rr };
    return { inv: rr.R.map((r) => r.slice(n)), rr };
  }

  function det(F, A) {
    const n = A.length; const M = clone(A); let d = F.one;
    for (let c = 0; c < n; c++) {
      let p = -1; for (let i = c; i < n; i++) if (!F.isZero(M[i][c])) { p = i; break; }
      if (p < 0) return F.zero;
      if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; d = F.neg(d); }
      d = F.mul(d, M[c][c]);
      for (let i = c + 1; i < n; i++) {
        const f = F.div(M[i][c], M[c][c]);
        if (F.isZero(f)) continue;
        M[i] = M[i].map((x, j) => F.sub(x, F.mul(f, M[c][j])));
      }
    }
    return d;
  }

  /* ---------- Subespais de K^n (vectors com a arrays) ---------- */
  // Base (files no nul·les de la forma de Gauss-Jordan) del subespai generat
  function rowBasis(F, vecs) {
    if (!vecs.length) return { basis: [], rr: null, rank: 0 };
    const rr = rref(F, vecs);
    return { basis: rr.R.slice(0, rr.rank), rr, rank: rr.rank };
  }
  // Subfamília maximal LI (vectors originals en posició de pivot, posats en columnes)
  function maximalSubfamily(F, vecs) {
    if (!vecs.length) return { idx: [], rr: null };
    const rr = rref(F, transpose(vecs));
    return { idx: rr.pivots.slice(), rr };
  }
  const isLI = (F, vecs) => vecs.length === 0 || rank(F, vecs) === vecs.length;
  function inSpan(F, gens, v) {
    if (!gens.length) return isZeroV(F, v);
    return rank(F, gens.concat([v])) === rank(F, gens);
  }
  function spanContains(F, gens, others) { return others.every((v) => inSpan(F, gens, v)); }
  function spanEqual(F, A, B) { return rank(F, A) === rank(F, B) && spanContains(F, A, B); }
  // Coordenades de v en la família LI `basis` (o null si no hi pertany)
  function coords(F, basis, v) {
    const s = solve(F, transpose(basis), v);
    if (s.type !== 'SCD') return null;
    return s.sol;
  }
  // Ampliar una família LI a una base de K^n amb vectors canònics (Tasca 2)
  function extendCanonical(F, vecs, n) {
    const rr = vecs.length ? rref(F, vecs, { echelon: true }) : { pivots: [], rank: 0, steps: [], R: [] };
    const add = [];
    for (let j = 0; j < n; j++) if (!rr.pivots.includes(j)) {
      const e = Array(n).fill(F.zero); e[j] = F.one; add.push(e);
    }
    return { add, rr };
  }
  // Equacions implícites del subespai generat per gens dins K^n: A x = 0
  function implicitEqs(F, gens, n) {
    if (!gens.length) return identity(F, n);
    const ns = nullspace(F, gens); // vectors y amb gens·y = 0  → y·x = 0 per a x ∈ F
    return ns.basis;
  }
  // Zassenhaus: base de F+G i de F∩G
  function zassenhaus(F, Fg, Gg) {
    const n = (Fg[0] || Gg[0]).length;
    const Z = Fg.map((v) => v.concat(v)).concat(Gg.map((v) => v.concat(Array(n).fill(F.zero))));
    const rr = rref(F, Z, { aug: n });
    const sum = [], inter = [];
    rr.R.forEach((row) => {
      const L = row.slice(0, n), Rr = row.slice(n);
      if (!isZeroV(F, L)) sum.push(L);
      else if (!isZeroV(F, Rr)) inter.push(Rr);
    });
    // la part dreta de les files amb esquerra nul·la pot no estar reduïda: la reduïm
    const interB = inter.length ? rowBasis(F, inter).basis : [];
    return { sum, inter: interB, rr, Z };
  }
  function intersection(F, Fg, Gg) {
    // resol sum a_i f_i - sum b_j g_j = 0
    const n = (Fg[0] || Gg[0]).length;
    if (!Fg.length || !Gg.length) return [];
    const cols = Fg.concat(Gg.map((g) => scaleV(F, F.neg(F.one), g)));
    const ns = nullspace(F, transpose(cols));
    const vecs = ns.basis.map((c) => combo(F, c.slice(0, Fg.length), Fg));
    const nz = vecs.filter((v) => !isZeroV(F, v));
    return nz.length ? rowBasis(F, nz).basis : [];
  }

  // Esborra denominadors (Q): múltiple enter primitiu del vector (mateix subespai)
  function clearDen(F, v) {
    if (F.id !== 'Q') return v;
    let L = 1n;
    v.forEach((a) => { L = (L * a.d) / EV.bgcd(L, a.d); });
    let w = v.map((a) => a.n * (L / a.d));
    let g = 0n; w.forEach((x) => { g = EV.bgcd(g, x); });
    if (g === 0n) return v;
    // primer no nul positiu
    const first = w.find((x) => x !== 0n);
    if (first < 0n) g = -g;
    return w.map((x) => EV.fr(x / g));
  }

  /* ---------- Polinomis (coeficients [a0..an]) ---------- */
  const P = {
    trim(F, p) { const q = p.slice(); while (q.length > 1 && F.isZero(q[q.length - 1])) q.pop(); return q; },
    deg(F, p) { const q = P.trim(F, p); return q.length === 1 && F.isZero(q[0]) ? -1 : q.length - 1; },
    add(F, p, q) { const n = Math.max(p.length, q.length); return P.trim(F, Array.from({ length: n }, (_, i) => F.add(p[i] || F.zero, q[i] || F.zero))); },
    sub(F, p, q) { const n = Math.max(p.length, q.length); return P.trim(F, Array.from({ length: n }, (_, i) => F.sub(p[i] || F.zero, q[i] || F.zero))); },
    mul(F, p, q) {
      const r = Array(p.length + q.length - 1).fill(F.zero);
      p.forEach((a, i) => q.forEach((b, j) => { r[i + j] = F.add(r[i + j], F.mul(a, b)); }));
      return P.trim(F, r);
    },
    scale(F, c, p) { return P.trim(F, p.map((a) => F.mul(c, a))); },
    evalAt(F, p, x) { let s = F.zero; for (let k = p.length - 1; k >= 0; k--) s = F.add(F.mul(s, x), p[k]); return s; },
    deriv(F, p) { return p.length <= 1 ? [F.zero] : P.trim(F, p.slice(1).map((a, k) => F.mul(F.fromInt(k + 1), a))); },
    // divisió per (x - r): retorna quocient
    divLinear(F, p, r) {
      const n = p.length - 1; const q = Array(n).fill(F.zero); let acc = F.zero;
      for (let k = n; k >= 1; k--) { acc = F.add(F.mul(acc, r), p[k]); q[k - 1] = acc; }
      return q;
    },
    pad(F, p, len) { const q = p.slice(0, len); while (q.length < len) q.push(F.zero); return q; },
  };

  // Polinomi característic det(xI - A) (Faddeev-LeVerrier per a car. 0; directe per a n≤3)
  function charPoly(F, A) {
    const n = A.length;
    if (F.char !== 0) {
      // expansió directa per a mides petites (n ≤ 3)
      if (n === 2) { const tr = F.add(A[0][0], A[1][1]); return [det(F, A), F.neg(tr), F.one]; }
    }
    let M = zeros(F, n, n);
    const c = Array(n + 1).fill(F.zero); c[n] = F.one;
    for (let k = 1; k <= n; k++) {
      // M_k = A M_{k-1} + c_{n-k+1} I
      const AM = mul(F, A, M);
      M = AM.map((r, i) => r.map((a, j) => (i === j ? F.add(a, c[n - k + 1]) : a)));
      const AMk = mul(F, A, M);
      let tr = F.zero; for (let i = 0; i < n; i++) tr = F.add(tr, AMk[i][i]);
      c[n - k] = F.neg(F.div(tr, F.fromInt(k)));
    }
    return c;
  }
  const trace = (F, A) => A.reduce((s, r, i) => F.add(s, r[i]), F.zero);
  function tr2(F, A) { // suma de menors principals 2x2
    let s = F.zero; const n = A.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) s = F.add(s, F.sub(F.mul(A[i][i], A[j][j]), F.mul(A[i][j], A[j][i])));
    return s;
  }

  // Arrels racionals (amb multiplicitat) d'un polinomi de Q[x]; retorna {roots:[{r,m}], rest}
  function rationalRoots(p) {
    const F = EV.QQ;
    let q = P.trim(F, p);
    const roots = [];
    // arrel 0
    let m0 = 0; while (q.length > 1 && q[0].isZero()) { q = q.slice(1); m0++; }
    if (m0) roots.push({ r: F.zero, m: m0 });
    const cands = () => {
      // passa a enters
      let L = 1n; q.forEach((a) => { L = (L * a.d) / EV.bgcd(L, a.d); });
      const ints = q.map((a) => a.n * (L / a.d));
      const a0 = ints[0] < 0n ? -ints[0] : ints[0], an = ints[ints.length - 1] < 0n ? -ints[ints.length - 1] : ints[ints.length - 1];
      const divs = (x) => { const out = []; for (let d = 1n; d * d <= x; d++) if (x % d === 0n) { out.push(d); if (d * d !== x) out.push(x / d); } return out; };
      if (a0 > 1000000n || an > 1000000n) return [];
      const res = [];
      divs(a0).forEach((pp) => divs(an).forEach((qq) => { res.push(EV.fr(pp, qq)); res.push(EV.fr(-pp, qq)); }));
      return res;
    };
    let changed = true;
    while (changed && q.length > 2) {
      changed = false;
      for (const r of cands()) {
        if (P.evalAt(F, q, r).isZero()) {
          let m = 0; while (q.length > 1 && P.evalAt(F, q, r).isZero()) { q = P.divLinear(F, q, r); m++; }
          const ex = roots.find((o) => o.r.eq(r)); if (ex) ex.m += m; else roots.push({ r, m });
          changed = true; break;
        }
      }
    }
    if (q.length === 2) { // lineal
      const r = q[0].neg().div(q[1]);
      const ex = roots.find((o) => o.r.eq(r)); if (ex) ex.m += 1; else roots.push({ r, m: 1 });
      q = [q[1]];
    }
    roots.sort((a, b) => a.r.cmp(b.r));
    return { roots, rest: q };
  }

  EV.L = {
    clone, zeros, identity, transpose, fromInts, toF, mul, mulVec, addM, subM, scaleM, eqM, eqV, isZeroV, addV, subV, scaleV, combo, isDiag,
    rref, rank, nullspace, solve, inverse, det, rowBasis, maximalSubfamily, isLI, inSpan, spanContains, spanEqual, coords,
    extendCanonical, implicitEqs, zassenhaus, intersection, clearDen, charPoly, trace, tr2, rationalRoots, opLabel,
  };
  EV.P = P;
})(window.EV = window.EV || {});
