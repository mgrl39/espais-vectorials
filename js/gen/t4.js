/* ============================================================
   Tema 4 · Diagonalització (68–74)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S, G = EV.G, C = EV.C, Sp = EV.Sp, Sub = EV.Sub, P = EV.P;
  const { m, dm } = H;
  const QQ = EV.QQ, CC = EV.CC;
  const fr = EV.fr, cx = EV.cx;
  const VARS = ['x', 'y', 'z', 't'];
  const C3 = EV.T3C;

  const toC = (M) => M.map((r) => r.map((a) => new EV.Cx(a, fr(0))));

  /* ---------- anàlisi espectral exacta ---------- */
  // Retorna {cp, eig: [{l (en F), m (alg), F}], complex: bool, splitsR}
  function spectrum(A) {
    const n = A.length;
    const cp = L.charPoly(QQ, A);
    const rr = L.rationalRoots(cp);
    const eig = rr.roots.map((o) => ({ l: o.r, m: o.m, F: QQ }));
    let cplx = [];
    const rest = rr.rest;
    if (rest.length === 3) { // quadràtic irreductible a Q: x^2 + bx + c (normalitzat)
      const a2 = rest[2], b = rest[1].div(a2), c = rest[0].div(a2);
      const disc = b.mul(b).sub(fr(4).mul(c));
      if (disc.sign() < 0) {
        // arrels -b/2 ± i sqrt(-disc)/2: cal que -disc sigui un quadrat racional
        const nd = disc.neg();
        const sq = (q) => { const s = (x) => { let r = BigInt(Math.round(Math.sqrt(Number(x)))); while (r * r > x) r--; while ((r + 1n) * (r + 1n) <= x) r++; return r * r === x ? r : null; }; const a = s(q.n), d = s(q.d); return a !== null && d !== null ? fr(a, d) : null; };
        const r = sq(nd);
        if (r) {
          const re = b.neg().div(fr(2)), im = r.div(fr(2));
          cplx = [{ l: new EV.Cx(re, im), m: 1, F: CC }, { l: new EV.Cx(re, im.neg()), m: 1, F: CC }];
        } else cplx = null;
      } else cplx = null; // irracional real
    } else if (rest.length > 3) cplx = null;
    return { cp, eig, cplx, n };
  }
  function eigenspace(F, A, l) {
    const n = A.length;
    const M = A.map((r, i) => r.map((a, j) => (i === j ? F.sub(a, l) : a)));
    const ns = L.nullspace(F, M);
    const basis = ns.basis.map((b) => (F.id === 'Q' ? L.clearDen(F, b) : b));
    return { M, ns, basis, dim: basis.length };
  }
  function lamTex(F, l) { const t = F.tex(l); return t; }
  function shiftTex(F, l) { // "A - λI" amb signe bonic
    if (F.isZero(l)) return 'A';
    if (F.isNeg(l) && !EV.needsParens(F, l)) return 'A+' + F.tex(F.neg(l)) + 'I';
    return 'A-' + (EV.needsParens(F, l) ? '(' + F.tex(l) + ')' : F.tex(l)) + 'I';
  }
  function factorTex(F, eig) {
    return eig.map((e) => {
      const l = e.l;
      let base;
      if (F.isZero(l)) base = 'x';
      else if (F.isNeg(l) && !EV.needsParens(F, l)) base = '(x+' + F.tex(F.neg(l)) + ')';
      else base = '(x-' + (EV.needsParens(F, l) ? '(' + F.tex(l) + ')' : F.tex(l)) + ')';
      return base + (e.m > 1 ? '^{' + e.m + '}' : '');
    }).join('');
  }

  function charPolySol(A) {
    const F = QQ; const n = A.length;
    const cp = L.charPoly(F, A);
    let h = H.P('Matriu de ' + m('f') + ' en la base canònica: ' + m('A=' + T.matrix(F, A)) + '.');
    if (n === 2) {
      const tr = L.trace(F, A), d = L.det(F, A);
      h += H.P('Per a matrius ' + m('2\\times2') + ': ' + m('P_A(x)=x^2-\\operatorname{tr}(A)\\,x+\\det(A)') + ', amb ' + m('\\operatorname{tr}A=' + F.tex(tr)) + ' i ' + G.detTex(F, A) + '.');
    } else if (n === 3) {
      const tr = L.trace(F, A), t2 = L.tr2(F, A), d = L.det(F, A);
      const minor = (i, j) => F.sub(F.mul(A[i][i], A[j][j]), F.mul(A[i][j], A[j][i]));
      h += H.P('Per a ' + m('3\\times3') + ': ' + m('P_A(x)=x^3-\\operatorname{tr}(A)x^2+\\operatorname{tr}_2(A)x-\\det(A)') + ' (apunts, secció 4.1), on ' + m('\\operatorname{tr}_2') + ' és la suma dels menors principals ' + m('2\\times2') + '.');
      h += H.P(m('\\operatorname{tr}A=' + F.tex(tr)) + ', ' + m('\\operatorname{tr}_2A=' + [[0, 1], [0, 2], [1, 2]].map(([i, j]) => G.paren(F, minor(i, j))).join('+') + '=' + F.tex(t2)) + ', ' + m('\\det A=' + F.tex(d)) + '.');
    } else h += H.P(m('P_A(x)=\\det(xI-A)') + ' (desenvolupant el determinant).');
    h += H.ans(m('P_A(x)=' + T.poly(F, cp)));
    return { html: h, cp };
  }

  /**
   * Tasques de diagonalització per a una matriu racional A.
   * opts.overC: també estudiar sobre C quan hi ha arrels complexes
   */
  function diagTasks(A, opts) {
    opts = opts || {};
    const F = QQ; const n = A.length;
    const sp = spectrum(A);
    const cps = charPolySol(A);
    const parts = [];
    const sign = n % 2 === 0 ? 1 : -1;
    parts.push({
      id: 'cp', kind: 'poly', F, label: 'Polinomi característic ' + m('P_A(x)=\\det(xI-A)') + ':', placeholder: 'p. ex. x^2 - 3x + 2  o  (x-1)(x-2)',
      check: (p) => {
        const q = P.trim(F, p);
        if (q.length === sps(sp.cp).length && q.every((a, i) => F.eq(a, sp.cp[i]))) return EV.ok();
        const neg = sp.cp.map((a) => F.neg(a));
        if (q.length === neg.length && q.every((a, i) => F.eq(a, neg[i]))) return EV.ok('És ' + 'det(A − xI) = −P_A(x); també val.');
        return EV.bad();
      }, ref: S.polyStr(F, sp.cp), sol: cps.html,
    });
    function sps(c) { return P.trim(F, c); }
    // factorització i valors propis reals
    const realEig = sp.eig;
    const factorR = factorTex(F, realEig) + (sp.cplx && sp.cplx.length ? '(' + T.poly(F, P.trim(F, L.rationalRoots(sp.cp).rest)) + ')' : '');
    let solV = H.P('Busquem les arrels de ' + m('P_A') + '. Arrels racionals possibles: divisors del terme independent (Ruffini).');
    solV += H.ans(m('P_A(x)=' + factorR));
    if (sp.cplx && sp.cplx.length) solV += H.P('El factor de grau 2 té discriminant negatiu: arrels complexes ' + m(CC.tex(sp.cplx[0].l) + ',\\ ' + CC.tex(sp.cplx[1].l)) + ', que <b>no</b> són reals.');
    solV += H.P('Valors propis reals: ' + (realEig.length ? realEig.map((e) => m('\\lambda=' + F.tex(e.l)) + ' (multiplicitat algebraica ' + e.m + ')').join(', ') : 'cap') + '.');
    parts.push({
      id: 'vals', kind: 'scalars', F, label: 'Valors propis reals (diferents, separats per comes; buit si no n\'hi ha):', placeholder: 'p. ex. -1, 2', after: 'cp',
      check: (v) => C.sameSet(F, v, realEig.map((e) => e.l)), ref: realEig.map((e) => F.str(e.l)).join(', '), sol: solV,
    });
    // subespais propis
    const spaces = realEig.map((e) => Object.assign({ l: e.l, m: e.m }, eigenspace(F, A, e.l)));
    spaces.forEach((s, k) => {
      const W = Sub.fromGens(F, s.basis, n);
      let sol = H.P(m('E_{' + F.tex(s.l) + '}=\\operatorname{Ker}(' + shiftTex(F, s.l) + ')') + ': resolem ' + m('(' + shiftTex(F, s.l) + ')v=0') + ' amb ' + m(shiftTex(F, s.l) + '=' + T.matrix(F, s.M)) + '.');
      sol += G.nullSol(F, s.M, VARS.slice(0, n)).html;
      sol += H.P(m('\\dim E_{' + F.tex(s.l) + '}=' + n + '-\\operatorname{rang}(' + shiftTex(F, s.l) + ')=' + s.dim) + ' (multiplicitat geomètrica) ' + (s.dim === s.m ? '= ' : '&lt; ') + s.m + ' (algebraica).');
      parts.push({
        id: 'E' + k, kind: 'vectors', F, n, label: 'Base de ' + m('E_{' + F.tex(s.l) + '}') + ' (vectors propis de valor propi ' + m(F.tex(s.l)) + '):', placeholder: '(1, 1' + (n > 2 ? ', 0' : '') + ')', after: 'vals',
        check: (v) => C.basisOf(F, W, v), ref: s.basis.map((b) => S.vecStr(F, b)).join(', '), sol,
      });
    });
    const splits = sp.cplx === null ? false : (sp.cplx.length === 0);
    const diagR = splits && spaces.every((s) => s.dim === s.m);
    let solD = H.P('<b>Segon criteri de diagonalització (Teorema 4.8)</b>: ' + m('f') + ' diagonalitza ' + m('\\iff') + ' (1) ' + m('P_f') + ' descompon completament (totes les arrels a ' + m('\\mathbb{R}') + ') i (2) per a cada valor propi, ' + m('\\dim E_\\lambda') + ' = multiplicitat algebraica.');
    if (!splits) solD += H.P('Falla (1): ' + m('P_A') + ' té arrels no reals ⇒ <b>no diagonalitza a ' + m('\\mathbb{R}') + '</b>.');
    else {
      solD += '<table class="mini"><tr><th>' + m('\\lambda') + '</th><th>mult. alg.</th><th>' + m('\\dim E_\\lambda') + '</th></tr>' + spaces.map((s) => '<tr><td>' + m(F.tex(s.l)) + '</td><td>' + s.m + '</td><td>' + s.dim + (s.dim === s.m ? ' ✓' : ' ✗') + '</td></tr>').join('') + '</table>';
      solD += H.P(diagR ? 'Es compleixen les dues condicions ⇒ <b>diagonalitza</b>.' : 'Algun valor propi té ' + m('\\dim E_\\lambda<') + ' multiplicitat ⇒ <b>no diagonalitza</b> (no hi ha prou vectors propis LI per fer una base).');
      if (diagR && spaces.every((s) => s.m === 1)) solD += H.tip(n + ' valors propis diferents ⇒ diagonalitza segur (Corol·lari 4.6), sense mirar dimensions.');
    }
    parts.push({ id: 'diag', kind: 'choice', label: 'Diagonalitza (a ' + m('\\mathbb{R}') + ')?', options: G.YN, after: 'vals', check: (v) => ((v === 'si') === diagR ? EV.ok() : EV.bad()), ref: diagR ? 'si' : 'no', sol: solD });
    if (diagR) {
      const cols = [], dvals = [];
      spaces.forEach((s) => s.basis.forEach((b) => { cols.push(b); dvals.push(s.l); }));
      const Pm = L.transpose(cols);
      const D = dvals.map((l, i) => dvals.map((_, j) => (i === j ? l : F.zero)));
      parts.push(pdPart(F, A, Pm, D, spaces, 'diag'));
    }
    if (opts.overC && sp.cplx && sp.cplx.length) {
      const Ac = toC(A);
      const allC = realEig.map((e) => ({ l: new EV.Cx(e.l, fr(0)), m: e.m })).concat(sp.cplx);
      const spacesC = allC.map((e) => Object.assign({ l: e.l, m: e.m }, eigenspace(CC, Ac, e.l)));
      const diagC = spacesC.every((s) => s.dim === s.m);
      let solC = H.P('A ' + m('\\mathbb{C}') + ' tot polinomi descompon completament. Valors propis: ' + allC.map((e) => m(CC.tex(e.l))).join(', ') + '.');
      spacesC.forEach((s) => { solC += H.P(m('E_{' + CC.tex(s.l) + '}') + ': ' + m(T.matrix(CC, s.M)) + ' ⇒ base ' + m(s.basis.map((b) => T.vec(CC, b)).join(',\\ ')) + '.'); });
      solC += H.P(diagC ? 'Tots els valors propis són simples (o amb ' + m('\\dim E=') + ' multiplicitat) ⇒ <b>diagonalitza a ' + m('\\mathbb{C}') + '</b>.' : 'No diagonalitza ni tan sols a ' + m('\\mathbb{C}') + '.');
      parts.push({ id: 'diagC', kind: 'choice', label: 'Diagonalitza a ' + m('\\mathbb{C}') + '?', options: G.YN, after: 'diag', check: (v) => ((v === 'si') === diagC ? EV.ok() : EV.bad()), ref: diagC ? 'si' : 'no', sol: solC });
      if (diagC) {
        const cols = [], dvals = [];
        spacesC.forEach((s) => s.basis.forEach((b) => { cols.push(b); dvals.push(s.l); }));
        const Pm = L.transpose(cols);
        const D = dvals.map((l, i) => dvals.map((_, j) => (i === j ? l : CC.zero)));
        const p = pdPart(CC, Ac, Pm, D, spacesC, 'diagC'); p.id = 'PDC'; p.label = 'Sobre ' + m('\\mathbb{C}') + ': ' + p.label;
        parts.push(p);
      }
    }
    return { parts, sp, spaces, diagR };
  }
  function pdPart(F, A, Pm, D, spaces, after) {
    const n = A.length;
    return {
      id: 'PD', kind: 'multi', F, after, label: 'Matrius ' + m('P') + ' (invertible) i ' + m('D') + ' (diagonal) amb ' + m('A=PDP^{-1}') + ':',
      fields: [{ key: 'P', kind: 'matrix', m: n, n, label: 'P', placeholder: n === 2 ? '[1 1; 0 1]' : '[1 0 1; 0 1 1; 1 1 0]' }, { key: 'D', kind: 'matrix', m: n, n, label: 'D', placeholder: n === 2 ? '[2 0; 0 -1]' : '[2 0 0; 0 2 0; 0 0 -1]' }],
      check: (v) => {
        const Pv = v.P, Dv = v.D;
        if (!L.isDiag(F, Dv)) return EV.bad('D ha de ser diagonal.');
        if (F.isZero(L.det(F, Pv))) return EV.bad('P ha de ser invertible.');
        if (!L.eqM(F, L.mul(F, A, Pv), L.mul(F, Pv, Dv))) return EV.bad('No es compleix AP = PD: la columna i de P ha de ser vector propi de valor propi d_ii.');
        return EV.ok();
      },
      ref: { P: S.matStr(F, Pm), D: S.matStr(F, D) },
      sol: H.P('Lema 4.9: ' + m('P') + ' té per <b>columnes</b> una base de vectors propis (unint les bases de cada ' + m('E_\\lambda') + '), i ' + m('D') + ' té a la diagonal els valors propis <b>en el mateix ordre</b>.') + dm('P=' + T.matrix(F, Pm) + ',\\qquad D=' + T.matrix(F, D)) + H.P('Comprovació ràpida: ' + m('AP=PD=' + T.matrix(F, L.mul(F, A, Pm))) + ' ✓') + H.warn('Error típic: posar els vectors propis en files, o desordenar ' + m('D') + ' respecte de les columnes de ' + m('P') + '. Qualsevol ordre val si és coherent.'),
    };
  }

  /* ---------- generació de matrius amb espectre controlat ---------- */
  function conj(F, rng, J, opts) {
    opts = opts || {};
    const n = J.length;
    for (let t = 0; t < 200; t++) {
      const Pm = G.unimodular(F, rng, n, { bound: opts.pb || 2, ops: opts.ops || n + 1, allowSparse: true });
      const A = L.mul(F, Pm, L.mul(F, J, L.inverse(F, Pm).inv));
      if (G.maxAbs(F, A) <= (opts.bound || 12) && !L.isDiag(F, A) && A.flat().filter((a) => F.isZero(a)).length <= (n === 2 ? 1 : 4)) return A;
    }
    const Pm = G.unimodular(F, rng, n, { bound: 2, ops: n });
    return L.mul(F, Pm, L.mul(F, J, L.inverse(F, Pm).inv));
  }
  function genMatrix(rng, n, type) {
    const F = QQ;
    const vals = rng.shuffle([-3, -2, -1, 0, 1, 2, 3, 4]);
    const d = (arr) => arr.map((x, i) => arr.map((_, j) => (i === j ? fr(x) : fr(0))));
    let J;
    if (n === 2) {
      if (type === 'distinct') J = d([vals[0], vals[1]]);
      else if (type === 'jordan') { J = d([vals[0], vals[0]]); J[0][1] = fr(1); }
      else if (type === 'complex') { const a = rng.int(-2, 2), b = rng.nz(1, 2); J = [[fr(a), fr(-b)], [fr(b), fr(a)]]; }
      else J = d([vals[0], vals[0]]);
    } else {
      if (type === 'distinct') J = d([vals[0], vals[1], vals[2]]);
      else if (type === 'double') J = d([vals[0], vals[0], vals[1]]);
      else if (type === 'jordan') { J = d([vals[0], vals[0], vals[1]]); J[0][1] = fr(1); }
      else if (type === 'triple') { J = d([vals[0], vals[0], vals[0]]); J[0][1] = fr(1); }
      else if (type === 'complex') { const a = rng.int(-1, 1), b = rng.nz(1, 2); J = [[fr(a), fr(-b), fr(0)], [fr(b), fr(a), fr(0)], [fr(0), fr(0), fr(vals[0])]]; }
      else J = d([vals[0], vals[1], vals[2]]);
    }
    if (type === 'scalar' && n === 2) return J; // λI
    let A = conj(F, rng, J, { bound: n === 2 ? 10 : 12 });
    return A;
  }
  function endoTex(F, A) { const n = A.length; return 'f(' + VARS.slice(0, n).join(',') + ')=(' + A.map((r) => T.linexpr(F, r, VARS)).join(',\\ ') + ')'; }

  const STD_INTRO = H.box('tip', 'Recepta', H.ul(['Matriu ' + m('A') + ' en la base canònica.', m('P_A(x)=\\det(xI-A)') + ' (traça i determinant).', 'Valors propis = arrels; per a cada ' + m('\\lambda') + ', ' + m('E_\\lambda=\\operatorname{Ker}(A-\\lambda I)') + '.', 'Diagonalitza ⇔ arrels totes reals i ' + m('\\dim E_\\lambda') + ' = multiplicitat per a cada ' + m('\\lambda') + '.', m('P') + ' = vectors propis en columnes, ' + m('D') + ' = valors propis en el mateix ordre.']));

  G.register({
    tid: 'e68', ex: 68, star: true, topic: 4, sec: '4.1 · 4.2',
    title: 'Valors i vectors propis a ℝ² · diagonalitzar', skill: 'Diagonalització 2×2',
    variants: [{ v: 'distinct', label: 'Valors propis diferents' }, { v: 'jordan', label: 'Valor propi doble' }, { v: 'complex', label: 'Sense valors propis reals' }],
    make(rng, opts) {
      const type = (opts && opts.variant) || rng.pick(['distinct', 'distinct', 'jordan', 'complex', 'distinct']);
      let A = genMatrix(rng, 2, type);
      if (type === 'distinct' && rng.bool(0.3)) { // amb meitats, com el (ii)
        const S2 = [[fr(1), fr(0)], [fr(0), fr(2)]];
        const A2 = L.mul(QQ, L.inverse(QQ, S2).inv, L.mul(QQ, A, S2));
        if (G.maxAbs(QQ, A2.map((r) => r.map((a) => a.mul(fr(2))))) <= 24) A = A2;
      }
      return { statement: 'Per a l\'endomorfisme de ' + m('\\mathbb{R}^2') + ' ' + m(endoTex(QQ, A)) + ', trobeu-ne els valors propis i vectors propis. Si és diagonalitzable, i ' + m('A') + ' és la seva matriu en la base canònica, trobeu una matriu invertible ' + m('P') + ' tal que ' + m('A=PDP^{-1}') + ' amb ' + m('D') + ' diagonal.', parts: diagTasks(A).parts, intro: STD_INTRO };
    },
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const A1 = q([[-1, 0], [1, -1]]), A2 = q([[1, '-1/2'], [-2, 1]]);
      const p1 = diagTasks(A1).parts.map((p) => Object.assign(p, { id: 'i' + p.id, after: p.after ? 'i' + p.after : undefined, label: '(i) ' + p.label }));
      const p2 = diagTasks(A2).parts.map((p) => Object.assign(p, { id: 'ii' + p.id, after: p.after ? 'ii' + p.after : undefined, label: '(ii) ' + p.label }));
      return { statement: 'Per a cadascun dels endomorfismes de ' + m('\\mathbb{R}^2') + ' següents, trobeu-ne els valors propis i vectors propis. Per a cada cas en què sigui diagonalitzable, i si ' + m('A') + ' és la seva matriu en la base canònica, trobeu una matriu invertible ' + m('P') + ' tal que ' + m('A=PDP^{-1}') + ', on ' + m('D') + ' és diagonal.' + dm('(i)\\ f_1(x,y)=(-x,\\ x-y),\\qquad (ii)\\ f_2(x,y)=(x-\\tfrac12y,\\ y-2x)'), parts: p1.concat(p2), intro: STD_INTRO };
    },
  });
  G.register({
    tid: 'e69', ex: 69, star: true, topic: 4, sec: '4.1 · 4.2',
    title: 'Diagonalització a ℝ³', skill: 'Diagonalització 3×3',
    variants: [{ v: 'distinct', label: '3 valors propis diferents' }, { v: 'double', label: 'Doble, diagonalitza' }, { v: 'jordan', label: 'Doble, no diagonalitza' }, { v: 'triple', label: 'Triple' }],
    make(rng, opts) {
      const type = (opts && opts.variant) || rng.pick(['distinct', 'double', 'jordan', 'double', 'distinct', 'triple']);
      let A = genMatrix(rng, 3, type);
      if (rng.bool(0.2)) { // escalat com el (iii): entrades amb 1/3, 1/9
        const S3 = [[fr(1), fr(0), fr(0)], [fr(0), fr(3), fr(0)], [fr(0), fr(0), fr(9)]];
        A = L.mul(QQ, S3, L.mul(QQ, A, L.inverse(QQ, S3).inv));
      }
      return { statement: 'Per a l\'endomorfisme de ' + m('\\mathbb{R}^3') + ' ' + m(endoTex(QQ, A)) + ', trobeu-ne els valors propis i vectors propis. Si és diagonalitzable, trobeu ' + m('P') + ' invertible i ' + m('D') + ' diagonal amb ' + m('A=PDP^{-1}') + '.', parts: diagTasks(A).parts, intro: STD_INTRO };
    },
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const mats = [
        ['i', q([[-1, 2, 2], [0, 1, 4], [0, 0, -2]]), 'f_1(x,y,z)=(-x+2y+2z,\\ y+4z,\\ -2z)'],
        ['iii', q([[0, 3, 9], ['1/3', 0, 3], ['1/9', '1/3', 0]]), 'f_3(x,y,z)=(3y+9z,\\ \\tfrac{x}{3}+3z,\\ \\tfrac{x}{9}+\\tfrac{y}{3})'],
        ['iv', q([[6, -7, -20], [0, 0, -8], [1, -1, 0]]), 'f_4(x,y,z)=(6x-7y-20z,\\ -8z,\\ x-y)'],
      ];
      let parts = [];
      mats.forEach(([t, A]) => { parts = parts.concat(diagTasks(A).parts.map((p) => Object.assign(p, { id: t + p.id, after: p.after ? t + p.after : undefined, label: '(' + t + ') ' + p.label }))); });
      return { statement: 'Feu el mateix (valors i vectors propis; ' + m('P') + ' i ' + m('D') + ' si diagonalitza) per als endomorfismes ★ de ' + m('\\mathbb{R}^3') + ':' + dm('\\begin{aligned}&(i)\\ ' + mats[0][2] + '\\\\&(iii)\\ ' + mats[1][2] + '\\\\&(iv)\\ ' + mats[2][2] + '\\end{aligned}') + '<p class="small muted">Els apartats (ii), (v)–(viii) no són obligatoris: els trobaràs a l\'exercici 69 «no obligatori» de la llista.</p>', parts, intro: STD_INTRO };
    },
  });
  G.register({
    tid: 'e69x', ex: 69, star: false, topic: 4, sec: '4.2', noGen: true,
    title: 'Diagonalització a ℝ³ (apartats no obligatoris)', skill: 'Diagonalització 3×3',
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const mats = [
        ['ii', q([[-1, 2, 0], [4, -1, 4], [0, 2, -1]]), 'f_2=(-x+2y,\\ 4x-y+4z,\\ 2y-z)'],
        ['v', q([[2, 1, 1], [2, 3, 2], [4, 4, 3]]), 'f_5=(2x+y+z,\\ 2x+3y+2z,\\ 4x+4y+3z)'],
        ['vi', q([[8, -1, -5], [-2, 3, 1], [4, -1, -1]]), 'f_6=(8x-y-5z,\\ -2x+3y+z,\\ 4x-y-z)'],
        ['vii', q([[2, 4, 2], [3, 3, 2], [9, 12, 5]]), 'f_7=(2x+4y+2z,\\ 3x+3y+2z,\\ 9x+12y+5z)'],
        ['viii', q([[4, 3, -1], [1, 3, 2], [1, 0, 5]]), 'f_8=(4x+3y-z,\\ x+3y+2z,\\ x+5z)'],
      ];
      let parts = [];
      mats.forEach(([t, A]) => { parts = parts.concat(diagTasks(A).parts.map((p) => Object.assign(p, { id: t + p.id, after: p.after ? t + p.after : undefined, label: '(' + t + ') ' + p.label }))); });
      return { statement: 'Apartats no obligatoris de l\'exercici 69:' + dm('\\begin{aligned}' + mats.map((x) => '&(' + x[0] + ')\\ ' + x[2]).join('\\\\') + '\\end{aligned}'), parts };
    },
  });
  G.register({
    tid: 'e70', ex: 70, star: false, topic: 4, sec: '4.2', noGen: true,
    title: 'Diagonalització a ℝ⁴', skill: 'Diagonalització 4×4',
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const A1 = q([[1, 1, 1, 1], [0, 2, 1, 1], [0, 0, 1, 0], [0, 1, 1, 2]]);
      const A2 = q([[1, 1, 1, 1], [1, 1, -1, -1], [1, -1, 1, -1], [1, -1, -1, 1]]);
      const p1 = diagTasks(A1).parts.map((p) => Object.assign(p, { id: 'a' + p.id, after: p.after ? 'a' + p.after : undefined, label: m('f_1') + ': ' + p.label }));
      const p2 = diagTasks(A2).parts.map((p) => Object.assign(p, { id: 'b' + p.id, after: p.after ? 'b' + p.after : undefined, label: m('f_2') + ': ' + p.label }));
      return { statement: 'Feu el mateix per als endomorfismes de ' + m('\\mathbb{R}^4') + ':' + dm('f_1=(x+y+z+t,\\ 2y+z+t,\\ z,\\ y+z+2t),\\quad f_2=(x+y+z+t,\\ x+y-z-t,\\ x-y+z-t,\\ x-y-z+t)'), parts: p1.concat(p2) };
    },
  });

  /* ---------- 71 · paràmetre ---------- */
  function paramTask(A0, A1, lam, c, statementTex) {
    // A(a) = A0 + a A1; P_A = (x-λ)^2 (x-a); diagonalitza ⇔ a = c
    const F = QQ;
    const parts = [];
    const affTex = (i, j) => T.linexpr(F, [A1[i][j]], ['a'], A0[i][j]);
    const Atex = '\\begin{pmatrix}' + A0.map((r, i) => r.map((_, j) => affTex(i, j)).join('&')).join('\\\\') + '\\end{pmatrix}';
    let solL = H.P('Calculem ' + m('\\operatorname{tr}A,\\ \\operatorname{tr}_2A,\\ \\det A') + ' en funció de ' + m('a') + ' i factoritzem. Surt ' + m('P_A(x)=(x-' + F.tex(lam).replace(/^-/, '(-') + (F.isNeg(lam) ? ')' : '') + ')^2(x-a)') + '. (Comprova-ho substituint ' + m('x=a') + ': s\'anul·la.)');
    parts.push({ id: 'lam', kind: 'scalar', F, label: 'Valor propi doble (que no depèn de ' + m('a') + '):', check: (v) => C.eqScalar(F, v, lam), ref: F.str(lam), sol: solL });
    const Aex = A0.map((r, i) => r.map((a, j) => F.add(a, F.mul(c, A1[i][j]))));
    const E = eigenspace(F, Aex, lam);
    let solA = H.P('Valors propis: ' + m(F.tex(lam)) + ' (doble) i ' + m('a') + '.');
    solA += H.ul([
      m('a\\neq ' + F.tex(lam)) + ': cal ' + m('\\dim E_{' + F.tex(lam) + '}=2') + ', és a dir ' + m('\\operatorname{rang}(A-' + G.paren(F, lam) + 'I)=1') + '. Això passa només per a ' + m('a=' + F.tex(c)) + ' (totes les files de ' + m('A-' + G.paren(F, lam) + 'I') + ' esdevenen proporcionals); per a la resta, rang 2 ⇒ no diagonalitza.',
      m('a=' + F.tex(lam)) + ': valor propi triple i ' + m('\\dim E_{' + F.tex(lam) + '}<3') + ' (la matriu no és ' + m(F.tex(lam) + 'I') + ') ⇒ no diagonalitza.',
    ]);
    solA += H.P('Per a ' + m('a=' + F.tex(c)) + ': ' + m('A-' + G.paren(F, lam) + 'I=' + T.matrix(F, E.M)) + ', rang 1, ' + m('\\dim E=2') + ' ✓.');
    solA += H.ans('Diagonalitza ' + m('\\iff a=' + F.tex(c)));
    parts.push({ id: 'set', kind: 'scalars', F, label: 'Valors de ' + m('a') + ' per als quals ' + m('A') + ' diagonalitza (separats per comes):', after: 'lam', check: (v) => C.sameSet(F, v, [c]), ref: F.str(c), sol: solA });
    return { parts, Atex };
  }
  G.register({
    tid: 'e71', ex: 71, star: false, topic: 4, sec: '4.2', title: 'Diagonalització segons un paràmetre', skill: 'Estudi de la diagonalització amb paràmetre',
    make(rng) {
      const F = QQ;
      const lam = fr(rng.pick([-1, 1, 2, 3])); let c; do { c = fr(rng.pick([-2, -1, 0, 1, 2, 4])); } while (c.eq(lam));
      // M(a) = [[λ, a-c, 0],[0, λ, 0],[0,0,a]] = M0 + a M1
      const M0 = [[lam, c.neg(), fr(0)], [fr(0), lam, fr(0)], [fr(0), fr(0), fr(0)]];
      const M1 = [[fr(0), fr(1), fr(0)], [fr(0), fr(0), fr(0)], [fr(0), fr(0), fr(1)]];
      const Pm = G.unimodular(F, rng, 3, { bound: 2, ops: 3 });
      const Pi = L.inverse(F, Pm).inv;
      const A0 = L.mul(F, Pm, L.mul(F, M0, Pi)), A1 = L.mul(F, Pm, L.mul(F, M1, Pi));
      const t = paramTask(A0, A1, lam, c);
      return { statement: 'Estudieu segons els valors del paràmetre ' + m('a\\in\\mathbb{R}') + ' la diagonalització de ' + m('A=' + t.Atex) + '.', parts: t.parts };
    },
    original() {
      const F = QQ; const q = (M) => L.fromInts(F, M);
      const A0 = q([[-1, -3, -3], [3, 5, 3], [-3, -3, 0]]); const A1 = q([[0, 0, 0], [0, 0, 0], [0, 0, 1]]);
      const t = paramTask(A0, A1, fr(2), fr(-1));
      t.parts[0].sol = H.P(m('\\operatorname{tr}A=4+a') + ', ' + m('\\operatorname{tr}_2A=4+(-a-9)+(5a+9)=4+4a') + ', ' + m('\\det A=4a') + ':') + dm('P_A(x)=x^3-(4+a)x^2+(4+4a)x-4a=(x-a)(x-2)^2.') + H.P('(Es veu que ' + m('x=a') + ' és arrel substituint, i el quocient és ' + m('x^2-4x+4=(x-2)^2') + '.)');
      t.parts[1].sol = H.P(m('A-2I=\\begin{pmatrix}-3&-3&-3\\\\3&3&3\\\\-3&-3&a-2\\end{pmatrix}') + ': les dues primeres files són proporcionals; la tercera ho és si i només si ' + m('a-2=-3') + ', és a dir ' + m('a=-1') + '.') + H.ul([m('a\\neq2,-1') + ': ' + m('\\dim E_2=3-2=1<2') + ' ⇒ no diagonalitza.', m('a=-1') + ': valors propis ' + m('2') + ' (doble, ' + m('\\dim E_2=2') + ') i ' + m('-1') + ' ⇒ diagonalitza.', m('a=2') + ': ' + m('2') + ' triple i ' + m('\\dim E_2=1') + ' ⇒ no diagonalitza.']) + H.ans('Diagonalitza ' + m('\\iff a=-1'));
      return { statement: 'Estudieu segons els valors del paràmetre ' + m('a\\in\\mathbb{R}') + ' la diagonalització de la matriu ' + m('A=\\begin{pmatrix}-1&-3&-3\\\\3&5&3\\\\-3&-3&a\\end{pmatrix}') + '.', parts: t.parts };
    },
  });

  /* ---------- 72 · R vs C ---------- */
  G.register({
    tid: 'e72', ex: 72, star: false, topic: 4, sec: '4.2', title: 'No diagonalitza a ℝ però sí a ℂ', skill: 'Diagonalització sobre ℂ',
    make(rng) {
      const n = rng.pick([2, 3]);
      const A = genMatrix(rng, n, 'complex');
      return { statement: 'Comproveu que la matriu ' + m('A=' + T.matrix(QQ, A)) + ' no diagonalitza a ' + m('\\mathbb{R}') + ' però sí a ' + m('\\mathbb{C}') + '.', parts: diagTasks(A, { overC: true }).parts };
    },
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const p1 = diagTasks(q([[0, -1], [1, 0]]), { overC: true }).parts.map((p) => Object.assign(p, { id: 'a' + p.id, after: p.after ? 'a' + p.after : undefined, label: '(1a) ' + p.label }));
      const p2 = diagTasks(q([[-5, -4, 1], [6, 6, -4], [8, 4, 2]]), { overC: true }).parts.map((p) => Object.assign(p, { id: 'b' + p.id, after: p.after ? 'b' + p.after : undefined, label: '(2a) ' + p.label }));
      return { statement: 'Comproveu que les matrius següents no diagonalitzen si treballem a ' + m('\\mathbb{R}') + ', però en canvi diagonalitzen si treballem a ' + m('\\mathbb{C}') + ':' + dm('\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix},\\qquad\\begin{pmatrix}-5&-4&1\\\\6&6&-4\\\\8&4&2\\end{pmatrix}'), parts: p1.concat(p2) };
    },
  });

  /* ---------- 73 · Potències: f^n ---------- */
  function powTex(F, l, nTex) {
    const t = F.tex(l);
    if (F.isOne(l)) return '1';
    if (t.startsWith('-') || t.includes('frac')) return '(' + t + ')^{' + nTex + '}';
    return t + '^{' + nTex + '}';
  }
  function powerTasks(A, N, k) {
    const F = QQ; const n = A.length;
    const dt = diagTasks(A);
    if (!dt.diagR) return null;
    const cols = [], dv = [];
    dt.spaces.forEach((s) => s.basis.forEach((b) => { cols.push(b); dv.push(s.l); }));
    const Pm = L.transpose(cols); const Pi = L.inverse(F, Pm).inv;
    // projectors
    const distinct = dt.spaces.map((s) => s.l);
    const proj = distinct.map((l) => {
      const Dm = dv.map((x, i) => dv.map((_, j) => (i === j && F.eq(x, l) ? F.one : F.zero)));
      return L.mul(F, Pm, L.mul(F, Dm, Pi));
    });
    const entryTex = (i, j, nTex) => {
      let out = '', first = true;
      distinct.forEach((l, t) => {
        const c = proj[t][i][j];
        if (F.isZero(c) || F.isZero(l)) return;
        const pw = powTex(F, l, nTex);
        let term;
        if (pw === '1') term = F.tex(c);
        else term = (F.isOne(c) ? '' : F.isNegOne(c) ? '-' : F.tex(c) + '\\cdot ') + pw;
        if (!first && !term.startsWith('-')) out += '+';
        out += term; first = false;
      });
      return first ? '0' : out;
    };
    const AnTex = '\\begin{pmatrix}' + A.map((_, i) => A.map((__, j) => entryTex(i, j, 'n')).join('&')).join('\\\\') + '\\end{pmatrix}';
    const powM = (M, e) => { let R = L.identity(F, n), B = M; while (e > 0) { if (e & 1) R = L.mul(F, R, B); e >>= 1; if (e) B = L.mul(F, B, B); } return R; };
    const Ak = powM(A, k);
    const A1000 = powM(A, N);
    const parts = [];
    const solGen = H.P('Si ' + m('A=PDP^{-1}') + ', aleshores ' + m('A^n=PD^nP^{-1}') + ' (els ' + m('P^{-1}P') + ' del mig es cancel·len) i ' + m('D^n') + ' és diagonal amb ' + m('\\lambda_i^n') + '.') + dm('P=' + T.matrix(F, Pm) + ',\\quad D=' + T.matrix(F, dv.map((x, i) => dv.map((_, j) => (i === j ? x : F.zero)))) + ',\\quad P^{-1}=' + T.matrix(F, Pi)) + H.P('Multiplicant:') + dm('A^n=' + AnTex) + H.P('(vàlid per a ' + m('n\\ge1') + ').');
    parts.push({ id: 'Ak', kind: 'matrix', F, m: n, n, label: m('A^{' + k + '}') + ' = (comprova la teva fórmula amb un cas petit)', check: (M) => C.eqMat(F, M, Ak), ref: S.matStr(F, Ak), sol: solGen + H.P('Amb ' + m('n=' + k) + ': ' + m('A^{' + k + '}=' + T.matrix(F, Ak)) + '.') });
    const e11 = A1000[0][0];
    parts.push({ id: 'e11', kind: 'scalar', F, label: 'Entrada ' + m('(1,1)') + ' de ' + m('A^{' + N + '}') + ' (pots escriure potències: p. ex. ' + m('(2^{' + N + '}+1)/3') + ' com a ' + '<code>(2^' + N + '+1)/3</code>):', after: 'Ak', check: (v) => C.eqScalar(F, v, e11), ref: (() => { const t = entryTex(0, 0, String(N)); return termStr(distinct, proj, 0, 0, N); })(), sol: H.P('De la fórmula general, ' + m('(A^n)_{11}=' + entryTex(0, 0, 'n')) + ' ⇒ ' + m('(A^{' + N + '})_{11}=' + entryTex(0, 0, String(N))) + '.') });
    parts.push({ id: 'eq', kind: 'choice', label: 'Les equacions de ' + m('f^{' + N + '}') + ' són ' + m('f^{' + N + '}(v)=A^{' + N + '}v') + ' amb ' + m('A^{' + N + '}=PD^{' + N + '}P^{-1}') + '. Cert?', after: 'Ak', options: [{ v: 'c', label: 'Cert' }, { v: 'f', label: 'Fals' }], check: (v) => (v === 'c' ? EV.ok() : EV.bad()), ref: 'c', sol: H.P('Cert: la matriu de ' + m('f\\circ\\dots\\circ f') + ' és el producte de matrius (Corol·lari 3.25).') + dm('f^{' + N + '}(' + VARS.slice(0, n).join(',') + ')=\\left(' + A.map((_, i) => A.map((__, j) => '[' + entryTex(i, j, String(N)) + ']' + VARS[j]).join('+')).join(',\\ ') + '\\right)') });
    return parts;
    function termStr(ls, pr, i, j, Nn) {
      const terms = [];
      ls.forEach((l, t) => {
        const c = pr[t][i][j];
        if (F.isZero(c) || F.isZero(l)) return;
        terms.push('(' + F.str(c) + ')*(' + F.str(l) + ')^' + Nn);
      });
      return terms.length ? terms.join(' + ') : '0';
    }
  }
  G.register({
    tid: 'e73', ex: 73, star: false, topic: 4, sec: '4.3', title: 'Potències d\'un endomorfisme diagonalitzable', skill: 'Aⁿ = P Dⁿ P⁻¹',
    make(rng) {
      for (;;) {
        const n = rng.pick([2, 2, 3]);
        const A = genMatrix(rng, n, rng.pick(['distinct', n === 3 ? 'double' : 'distinct']));
        const t = powerTasks(A, 1000, rng.pick([2, 3]));
        if (t) return { statement: 'L\'endomorfisme ' + m(endoTex(QQ, A)) + ' és diagonalitzable. Calculeu les equacions de ' + m('f^{1000}') + '.', parts: t };
      }
    },
    original() {
      const A = L.fromInts(QQ, [[1, '-1/2'], [-2, 1]]);
      return { statement: 'Per a cadascun dels endomorfismes diagonalitzables dels problemes 68 i 69, calculeu les equacions que defineixen ' + m('f^{1000}') + '. (Exemple resolt: ' + m('f_2(x,y)=(x-\\tfrac12y,\\ y-2x)') + ' del 68.)', parts: powerTasks(A, 1000, 3) };
    },
  });

  /* ---------- 74 · Leslie ---------- */
  function leslieTasks(p0, N0, years) {
    const F = QQ;
    const A = [[fr(0), fr(2), fr(0)], [p0, fr(0), fr(0)], [fr(0), fr(4, 5), fr(0)]];
    let v = N0.slice();
    for (let k = 0; k < years; k++) v = L.mulVec(F, A, v);
    const twoP = fr(2).mul(p0);
    const behav = twoP.cmp(fr(1)) < 0 ? 'ext' : twoP.cmp(fr(1)) === 0 ? 'osc' : 'creix';
    const num = (q) => (q.toNumber()).toLocaleString('ca', { maximumFractionDigits: 3 });
    const parts = [];
    const p0s = num(p0);
    parts.push({
      id: 'N' + years, kind: 'vector', F, n: 3, label: 'Població d\'aquí a ' + years + ' anys (' + m('P_0=' + p0s) + '); pots donar decimals:', placeholder: '(500, 600, 400)',
      check: (u) => (u.every((a, i) => Math.abs(a.toNumber() - v[i].toNumber()) <= 0.51) ? EV.ok() : EV.bad()), ref: S.vecStr(F, v),
      sol: H.P(m('N_{k}=A^{k}N_0') + '. ' + m('P_A(x)=x^3-2P_0x=x(x^2-2P_0)') + ', valors propis ' + m('0,\\ \\pm\\sqrt{2P_0}') + '. Calculant (o observant que ' + m('A^2') + ' actua com ' + m('2P_0') + ' sobre les dues primeres components):') + dm('N_{' + years + '}=' + T.vec(F, v) + '\\approx(' + v.map(num).join(';\\ ') + ')'),
    });
    parts.push({
      id: 'long' + years, kind: 'choice', label: 'A llarg termini (' + m('P_0=' + p0s) + '):', options: [{ v: 'ext', label: 'S\'extingeix' }, { v: 'osc', label: 'Oscil·la (cicle de 2 anys)' }, { v: 'creix', label: 'Creix indefinidament' }],
      check: (x) => (x === behav ? EV.ok() : EV.bad()), ref: behav,
      sol: H.P(m('2P_0=' + num(twoP)) + '. El valor propi dominant és ' + m('\\sqrt{2P_0}') + (behav === 'ext' ? ' < 1 ⇒ ' + m('A^kN_0\\to0') + ': <b>extinció</b>.' : behav === 'osc' ? ' = 1 (i també ' + m('-1') + ') ⇒ ' + m('A^2N=N') + ' a partir del primer any: la població <b>oscil·la</b> amb període 2.' : ' > 1 ⇒ la població <b>creix</b> exponencialment (aprox. ×' + num(twoP) + ' cada 2 anys).')),
    });
    return parts;
  }
  G.register({
    tid: 'e74', ex: 74, star: false, topic: 4, sec: '4.3', title: 'Model de població (escarabats)', skill: 'Aplicació: dinàmica de poblacions',
    make(rng) {
      const p0 = rng.pick([fr(1, 5), fr(3, 10), fr(1, 2), fr(18, 25), fr(4, 5)]);
      const N0 = [fr(rng.int(3, 9) * 100), fr(rng.int(3, 9) * 100), fr(rng.int(2, 6) * 100)];
      const yrs = rng.pick([4, 5, 6]);
      return { statement: 'Població d\'escarabats estructurada per edats amb matriu ' + m('A=\\begin{pmatrix}0&2&0\\\\P_0&0&0\\\\0&0.8&0\\end{pmatrix}') + ', ' + m('P_0=' + p0.toNumber()) + ' i població inicial ' + m(T.vec(QQ, N0)) + '.', parts: leslieTasks(p0, N0, yrs) };
    },
    original() {
      const N0 = [fr(500), fr(600), fr(400)];
      let parts = [];
      [fr(9, 50), fr(1, 2), fr(18, 25)].forEach((p, k) => { parts = parts.concat(leslieTasks(p, N0, 10).map((x) => Object.assign(x, { id: 'p' + k + x.id }))); });
      return { statement: 'Una població d\'escarabats té un cicle vital de 3 anys. ' + m('N=(n_0,n_1,n_2)') + ' i l\'any següent és ' + m('AN') + ' amb ' + m('A=\\begin{pmatrix}0&2&0\\\\P_0&0&0\\\\0&0.8&0\\end{pmatrix}') + '. Població inicial ' + m('(500,600,400)') + '. Per a ' + m('P_0=0.18,\\ 0.5,\\ 0.72') + ': (a) població d\'aquí a 10 anys; (b) a molt llarg termini.', parts };
    },
  });

  EV.T4 = { diagTasks, spectrum, eigenspace, genMatrix };
})(window.EV = window.EV || {});
