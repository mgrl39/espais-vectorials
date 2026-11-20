/* ============================================================
   Tema 3 · Generadors: isomorfismes (60, 61), existència (62),
   suma i intersecció (63, 64, 65), matrius respecte de bases (66, 67)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S, G = EV.G, C = EV.C, Sp = EV.Sp, Sub = EV.Sub;
  const { m, dm } = H;
  const QQ = EV.QQ, CC = EV.CC, Z2 = EV.Z2;
  const fr = EV.fr;
  const VARS = ['x', 'y', 'z', 't', 'u'];
  const B3 = EV.T3B, C3 = EV.T3C;

  /* =====================================================================
     60 · Quines són isomorfismes? (no obligatori)
     ===================================================================== */
  function isoPart(F, sym, A, name, idx) {
    const n = A[0].length, mm = A.length;
    let iso, sol;
    if (n !== mm) { iso = false; sol = H.P('Els espais tenen dimensions diferents (' + n + ' i ' + mm + '): no pot ser isomorfisme (Teorema 3.21 / Corol·lari 3.29).'); }
    else {
      const d = L.det(F, A); iso = !F.isZero(d);
      sol = H.P('Mateixa dimensió ⇒ isomorfisme ' + m('\\iff') + ' la matriu és invertible (Corol·lari 3.30). ' + m('A=' + T.matrix(F, A)) + ', ' + m('\\det A=' + F.tex(d)) + (sym === 'Z2' ? ' (a ' + m('\\mathbb{Z}_2') + ')' : '') + (iso ? ' ≠ 0 ⇒ <b>sí</b>.' : ' ⇒ <b>no</b>.'));
    }
    return { id: 'i' + idx, kind: 'choice', label: m(C3.mapTex(F, sym, A, name)), options: [{ v: 'si', label: 'Isomorfisme' }, { v: 'no', label: 'No' }], check: (v) => ((v === 'si') === iso ? EV.ok() : EV.bad()), ref: iso ? 'si' : 'no', sol };
  }
  G.register({
    tid: 'e60', ex: 60, star: false, topic: 3, sec: '3.6', title: 'Quines aplicacions són isomorfismes?', skill: 'Isomorfisme ⇔ mateixa dimensió i matriu invertible',
    make(rng) {
      const parts = [];
      for (let k = 0; k < 3; k++) {
        const sym = rng.pick(['R', 'Q', 'Z2']); const F = Sp.fieldOfSym(sym);
        const n = rng.pick([3, 3, 4]); const mm = rng.bool(0.25) ? n + 1 : n;
        const r = mm === n && rng.bool(0.55) ? n : Math.min(n, mm) - (mm === n ? 1 : 0);
        const A = G.rankMatrix(F, rng, mm, n, r, { bound: 3, noZeroRows: true });
        parts.push(isoPart(F, sym, A, 'f_{' + (k + 1) + '}', k));
      }
      return { statement: 'Digueu quines de les aplicacions lineals següents són isomorfismes.', parts };
    },
    original() {
      const q = (M) => L.fromInts(QQ, M);
      return { statement: 'Digueu quines de les aplicacions lineals següents són isomorfismes.', parts: [
        isoPart(QQ, 'R', q([[1, 1, 0], [1, 1, 0], [2, 1, 1], [1, 1, 0], [3, 1, 1]]), 'f_1', 0),
        isoPart(QQ, 'Q', q([[1, 1, 1, 1], [0, 1, 1, 1], [0, 0, 1, 1], [0, 0, 0, 1]]), 'f_2', 1),
        isoPart(Z2, 'Z2', [[1, 1, 1], [1, 0, 0], [0, 1, 1]], 'f_3', 2),
      ] };
    },
  });

  /* =====================================================================
     61 · Isomorfisme i isomorfisme invers
     ===================================================================== */
  function inverseTasks(F, sym, A, name) {
    const n = A.length;
    const d = L.det(F, A);
    const inv = L.inverse(F, A);
    const parts = [];
    parts.push({ id: 'det', kind: 'scalar', F, label: m('\\det') + ' de la matriu de ' + m(name) + ':', check: (v) => C.eqScalar(F, v, d), ref: F.str(d), sol: H.P(m('A=' + T.matrix(F, A)) + '. ' + G.detTex(F, A) + (sym === 'Z2' ? ' (calculat a ' + m('\\mathbb{Z}_2') + ').' : '.') + ' Com que ' + m('\\neq0') + ' i els espais tenen la mateixa dimensió, ' + m(name) + ' és un isomorfisme.') });
    const sol = H.P('L\'invers de ' + m('v\\mapsto Av') + ' és ' + m('v\\mapsto A^{-1}v') + '. Calculem ' + m('A^{-1}') + ' amb ' + m('(A\\mid I)\\to(I\\mid A^{-1})') + ':') + H.chain(F, inv.rr, { aug: n }) + H.ans(m(name + '^{-1}(' + VARS.slice(0, n).join(',') + ')=(' + inv.inv.map((r) => T.linexpr(F, r, VARS)).join(',\\ ') + ')')) + H.P('Comprovació: ' + m('AA^{-1}=I') + ' ✓');
    parts.push({ id: 'inv', kind: 'matrix', F, m: n, n, label: 'Matriu de ' + m(name + '^{-1}') + ' (en bases canòniques):', check: (M) => C.eqMat(F, M, inv.inv), ref: S.matStr(F, inv.inv), sol });
    return parts;
  }
  function evalTasks(pts) {
    const F = QQ;
    const V = pts.map((a) => [fr(1), fr(a), fr(a * a)]);
    const d = L.det(F, V);
    const inv = L.inverse(F, V);
    const ptsTex = pts.join(',');
    const parts = [];
    parts.push({ id: 'det', kind: 'scalar', F, label: 'Determinant de la matriu de ' + m('f') + ' (base ' + m('1,x,x^2') + ' a la sortida, canònica a l\'arribada):', check: (v) => C.eqScalar(F, v, d), ref: F.str(d), sol: H.P('Columnes: ' + m('f(1),f(x),f(x^2)') + '. Si ' + m('p=a_0+a_1x+a_2x^2') + ', ' + m('p(a)=a_0+a_1a+a_2a^2') + ' ⇒') + dm('A=' + T.matrix(F, V) + ',\\qquad\\det A=' + F.tex(d) + '\\neq0') + H.P('(És una matriu de Vandermonde: ' + m('\\det=\\prod_{i>j}(a_i-a_j)') + ', no nul perquè els punts són diferents.)') });
    parts.push({ id: 'inv', kind: 'matrix', F, m: 3, n: 3, label: 'Matriu de ' + m('f^{-1}') + ' (canònica de ' + m('\\mathbb{R}^3') + ' → base ' + m('1,x,x^2') + '):', check: (M) => C.eqMat(F, M, inv.inv), ref: S.matStr(F, inv.inv), sol: H.chain(F, inv.rr, { aug: 3 }) + H.ans(m('A^{-1}=' + T.matrix(F, inv.inv))) + H.P('Columna ' + m('j') + ' de ' + m('A^{-1}') + ' = coeficients del polinomi que val 1 al punt ' + m('j') + ' i 0 als altres (polinomis de Lagrange).') });
    // un f^{-1}(r,s,t) concret
    const rhs = [fr(1), fr(0), fr(-1)];
    const pc = L.mulVec(F, inv.inv, rhs);
    parts.push({ id: 'p', kind: 'poly', F, label: m('f^{-1}' + T.vec(F, rhs)) + ' = (el polinomi ' + m('p\\in\\mathbb{R}_2[x]') + ' amb ' + m('(p(' + pts[0] + '),p(' + pts[1] + '),p(' + pts[2] + '))=' + T.vec(F, rhs)) + ')', check: (p) => {
      const q = EV.P.pad(F, p, 3); if (p.length > 3) return EV.bad('Ha de tenir grau ≤ 2.');
      return pts.every((a, i) => F.eq(EV.P.evalAt(F, q, fr(a)), rhs[i])) ? EV.ok() : EV.bad('Aquest polinomi no pren aquests valors.');
    }, ref: S.polyStr(F, pc), sol: H.P(m('A^{-1}' + T.colvec(F, rhs) + '=' + T.colvec(F, pc)) + ' ⇒ ' + m('p(x)=' + T.poly(F, pc)) + '. Comprova: ' + pts.map((a) => m('p(' + a + ')=' + F.tex(EV.P.evalAt(F, pc, fr(a))))).join(', ') + '.') });
    return { parts, ptsTex };
  }
  G.register({
    tid: 'e61', ex: 61, star: true, topic: 3, sec: '3.6 · 3.7',
    title: 'Isomorfismes i isomorfisme invers', skill: 'Provar isomorfisme i calcular l\'invers',
    variants: [{ v: 'Z2', label: '(ℤ₂)³' }, { v: 'Q', label: 'ℚ³' }, { v: 'poly', label: 'Avaluació ℝ₂[x] → ℝ³' }],
    make(rng, opts) {
      const variant = (opts && opts.variant) || rng.pick(['Z2', 'Q', 'poly']);
      if (variant === 'poly') {
        const pts = rng.sample([-2, -1, 0, 1, 2, 3], 3).sort((a, b) => a - b);
        const t = evalTasks(pts);
        return { statement: 'Proveu que ' + m('f\\colon\\mathbb{R}_2[x]\\to\\mathbb{R}^3,\\ f(p)=(p(' + pts[0] + '),p(' + pts[1] + '),p(' + pts[2] + '))') + ' és un isomorfisme i calculeu l\'isomorfisme invers.', parts: t.parts };
      }
      const sym = variant; const F = Sp.fieldOfSym(sym);
      const A = G.unimodular(F, rng, 3, { bound: 2, ops: 4 });
      return { statement: 'Proveu que l\'aplicació següent és un isomorfisme i calculeu l\'isomorfisme invers:' + dm(C3.mapTex(F, sym, A)), parts: inverseTasks(F, sym, A, 'f') };
    },
    original() {
      const A = [[1, 1, 1], [0, 0, 1], [0, 1, 1]];
      const p1 = inverseTasks(Z2, 'Z2', A, 'f_1').map((p) => Object.assign(p, { id: 'a' + p.id, label: m('f_1') + ': ' + p.label }));
      const p2 = evalTasks([0, 1, 2]).parts.map((p) => Object.assign(p, { id: 'b' + p.id, label: m('f_2') + ': ' + p.label }));
      return { statement: 'Proveu que les aplicacions següents són isomorfismes i calculeu l\'isomorfisme invers:' + dm('f_1\\colon(\\mathbb{Z}_2)^3\\to(\\mathbb{Z}_2)^3,\\ f_1(x,y,z)=(x+y+z,\\ z,\\ y+z)\\qquad f_2\\colon\\mathbb{R}_2[x]\\to\\mathbb{R}^3,\\ f_2(p)=(p(0),p(1),p(2))'), parts: p1.concat(p2) };
    },
  });

  /* =====================================================================
     62 · Existeix una aplicació lineal amb aquestes condicions? (no obl.)
     ===================================================================== */
  function existTask(F, us, ws, idx) {
    const U = L.transpose(us); // columnes
    const r = L.rank(F, us);
    const ns = L.nullspace(F, U).basis; // relacions sum c_i u_i = 0
    let ok = true;
    const relTex = [];
    ns.forEach((c) => {
      const cc = L.clearDen(F, c);
      const img = L.combo(F, cc, ws);
      relTex.push({ c: cc, img });
      if (!L.isZeroV(F, img)) ok = false;
    });
    let sol;
    if (r === us.length) sol = H.P('Els vectors ' + us.map((u) => m(T.vec(F, u))).join(', ') + ' són LI (rang ' + r + ') i formen una base de ' + m('\\mathbb{R}^' + us[0].length) + ': una aplicació lineal queda determinada (i existeix) donant les imatges d\'una base. <b>Existeix i és única.</b>');
    else {
      sol = H.P('Els vectors són LD (rang ' + r + '). Si ' + m('f') + ' és lineal, tota relació ' + m('\\sum c_iu_i=0') + ' obliga ' + m('\\sum c_if(u_i)=0') + '.');
      relTex.forEach((o) => { sol += H.P('Relació ' + m(T.lincomb(F, o.c, us.map((_, i) => 'u_{' + (i + 1) + '}')) + '=0') + ' ⇒ hauria de ser ' + m(T.lincomb(F, o.c, ws.map((_, i) => 'f(u_{' + (i + 1) + '})')) + '=0') + ', i dóna ' + m(T.vec(F, o.img)) + (L.isZeroV(F, o.img) ? ' ✓' : ' ✗')); });
      sol += H.P(ok ? '<b>Existeix</b> (i n\'hi ha infinites: podem triar lliurement la imatge d\'un vector que completi la base).' : '<b>No existeix.</b>');
    }
    return { id: 'x' + idx, kind: 'choice', label: us.map((u, i) => m('f' + T.vec(F, u) + '=' + T.vec(F, ws[i]))).join(',\\ '), options: [{ v: 'si', label: 'Existeix' }, { v: 'no', label: 'No existeix' }], check: (v) => ((v === 'si') === ok ? EV.ok() : EV.bad()), ref: ok ? 'si' : 'no', sol };
  }
  G.register({
    tid: 'e62', ex: 62, star: false, topic: 3, sec: '3.6', title: 'Existeix una aplicació lineal així?', skill: 'Existència d\'aplicacions lineals amb condicions',
    make(rng) {
      const F = QQ; const parts = [];
      for (let k = 0; k < 3; k++) {
        const LD = rng.bool(0.65);
        const us = G.familyRank(F, rng, 3, 3, LD ? 2 : 3, { bound: 3 });
        let ws = us.map(() => [fr(rng.int(-6, 6)), fr(rng.int(-6, 6))]);
        if (LD && rng.bool(0.5)) { // fem-la consistent
          const c = L.clearDen(F, L.nullspace(F, L.transpose(us)).basis[0]);
          const k0 = c.findIndex((a) => !a.isZero());
          const others = ws.map((w, i) => (i === k0 ? null : L.scaleV(F, c[i], w))).filter(Boolean).reduce((a, b) => L.addV(F, a, b), [fr(0), fr(0)]);
          ws[k0] = L.scaleV(F, F.neg(F.inv(c[k0])), others);
        }
        parts.push(existTask(F, us, ws, k));
      }
      return { statement: 'Determineu si existeixen aplicacions lineals de ' + m('\\mathbb{R}^3') + ' en ' + m('\\mathbb{R}^2') + ' que compleixin cadascuna de les condicions següents:', parts };
    },
    original() {
      const F = QQ; const q = (M) => L.fromInts(F, M);
      const parts = [
        existTask(F, q([[1, 2, -1], [1, 1, -1], [0, 0, 1]]), q([[-1, 5], [2, -10], [3, 4]]), 0),
        existTask(F, q([[1, 2, -1], [1, 1, -1], [0, -1, 0]]), q([[-1, 5], [2, -10], [3, 4]]), 1),
        existTask(F, q([[1, 2, -1], [1, 1, -1], [0, -1, 0]]), q([[-1, 5], [2, -10], [3, -15]]), 2),
        { id: 'x3', kind: 'choice', label: m('\\operatorname{Ker}(f_4)=\\{x-y+3z=0\\},\\ \\operatorname{Im}(f_4)=\\langle(2,-1)\\rangle'), options: [{ v: 'si', label: 'Existeix' }, { v: 'no', label: 'No existeix' }], check: (v) => (v === 'si' ? EV.ok() : EV.bad()), ref: 'si', sol: H.P(m('\\dim\\operatorname{Ker}=2,\\ \\dim\\operatorname{Im}=1') + ', i ' + m('2+1=3=\\dim\\mathbb{R}^3') + ' (teorema de la dimensió ✓). Exemple: ' + m('f_4(x,y,z)=(x-y+3z)(2,-1)=(2x-2y+6z,\\ -x+y-3z)') + ': el nucli és el pla ' + m('x-y+3z=0') + ' i la imatge està generada per ' + m('(2,-1)') + '. <b>Existeix.</b>') },
      ];
      return { statement: 'Determineu si existeixen aplicacions lineals de ' + m('\\mathbb{R}^3') + ' en ' + m('\\mathbb{R}^2') + ' que compleixin cadascuna de les condicions següents:', parts };
    },
  });

  /* =====================================================================
     63 / 64 · Dimensions (i bases) de F, G, F+G, F∩G
     ===================================================================== */
  function sumInterTasks(F, sp, Fg, Gg, opts) {
    opts = opts || {};
    const n = sp.dim;
    const WF = Sub.fromGens(F, Fg, n), WG = Sub.fromGens(F, Gg, n);
    const WS = Sub.fromGens(F, Fg.concat(Gg), n);
    const z = L.zassenhaus(F, WF.basis.length ? WF.basis : Fg, WG.basis.length ? WG.basis : Gg);
    const inter = z.inter.map((v) => L.clearDen(F, v));
    const WI = Sub.fromGens(F, inter.length ? inter : [Array(n).fill(F.zero)], n);
    const dI = WF.dim + WG.dim - WS.dim;
    const parts = [];
    const solF = G.spanBasisSol(sp, Fg, { showSubfamily: false });
    const solG = G.spanBasisSol(sp, Gg, { showSubfamily: false });
    const solS = G.spanBasisSol(sp, Fg.concat(Gg), { showSubfamily: false });
    parts.push(B3.dimPart('dF', WF.dim, m('\\dim F') + ' =', (opts.solF || solF.html)));
    parts.push(B3.dimPart('dG', WG.dim, m('\\dim G') + ' =', (opts.solG || solG.html)));
    parts.push(B3.dimPart('dS', WS.dim, m('\\dim(F+G)') + ' =', H.P(m('F+G') + ' està generat per la unió de les bases (o generadors) de ' + m('F') + ' i de ' + m('G') + ':') + solS.html));
    let solI = H.P('<b>Fórmula de Grassmann</b>: ' + m('\\dim(F\\cap G)=\\dim F+\\dim G-\\dim(F+G)=' + WF.dim + '+' + WG.dim + '-' + WS.dim + '=' + dI) + '.');
    parts.push(B3.dimPart('dI', dI, m('\\dim(F\\cap G)') + ' =', solI));
    if (opts.bases) {
      parts.push(B3.basisPart('bS', sp, WS, 'Una base de ' + m('F+G') + ':', solS.html, { refBasis: solS.basis }));
      let solZ = H.P('<b>Mètode de Zassenhaus</b>: posem en files ' + m('(f_i\\mid f_i)') + ' per a la base de ' + m('F') + ' i ' + m('(g_j\\mid 0)') + ' per a la de ' + m('G') + ', i esglaonem. Les files amb part esquerra no nul·la donen una base de ' + m('F+G') + '; les files amb part esquerra nul·la donen, a la dreta, una base de ' + m('F\\cap G') + '.') + H.chain(F, z.rr, { aug: n });
      solZ += H.ans(inter.length ? m('F\\cap G=' + T.span(inter.map((v) => sp.tex(sp.fromC(v))))) : m('F\\cap G=\\{0\\}'));
      solZ += H.tip('Alternativa: si tens equacions de ' + m('F') + ' i de ' + m('G') + ', ' + m('F\\cap G') + ' és el conjunt de solucions de <b>totes</b> les equacions juntes.');
      parts.push(B3.basisPart('bI', sp, WI.dim === 0 ? { dim: 0, contains: (v) => L.isZeroV(F, v) } : WI, 'Una base de ' + m('F\\cap G') + ' (buit si és ' + m('\\{0\\}') + '):', solZ, { refBasis: inter }));
    }
    return parts;
  }
  function genFG(F, rng, n) {
    for (let t = 0; t < 100; t++) {
      const k = rng.int(0, Math.min(2, n - 1));
      const a = rng.int(0, n - k - 1), b = rng.int(1, n - k - a);
      if (k + a < 1 || k + b < 1 || k + a + b > n) continue;
      const P = G.unimodular(F, rng, n, { bound: 2, ops: n + 1 });
      const I = P.slice(0, k), Fe = P.slice(k, k + a), Ge = P.slice(k + a, k + a + b);
      let Fg = I.concat(Fe), Gg = I.concat(Ge);
      // barregem amb combinacions i a vegades un generador redundant
      const mix = (vs) => { if (vs.length < 1) return vs; const U = G.unimodular(F, rng, vs.length, { bound: 2, ops: vs.length }); let w = L.mul(F, U, vs); if (rng.bool(0.35)) w.push(L.addV(F, w[0], w[w.length - 1])); return rng.shuffle(w); };
      Fg = mix(Fg); Gg = mix(Gg);
      if (G.maxAbs(F, Fg.concat(Gg)) > 5) continue;
      if (Fg.concat(Gg).some((v) => L.isZeroV(F, v))) continue;
      return { Fg, Gg };
    }
    throw new Error('genFG');
  }
  G.register({
    tid: 'e63', ex: 63, star: true, topic: 3, sec: '3.8',
    title: 'Dimensions de F, G, F+G i F∩G', skill: 'Suma i intersecció de subespais (Grassmann)',
    variants: [{ v: 'R3', label: 'ℝ³' }, { v: 'R4', label: 'ℝ⁴' }, { v: 'Z2', label: '(ℤ₂)⁴' }],
    make(rng, opts) {
      const variant = (opts && opts.variant) || rng.pick(['R3', 'R4', 'Z2']);
      const sym = variant === 'Z2' ? 'Z2' : 'R'; const n = variant === 'R3' ? 3 : 4;
      const sp = Sp.Kn(sym, n); const F = sp.F;
      const { Fg, Gg } = genFG(F, rng, n);
      const K = sp.K;
      return { statement: 'Trobeu la dimensió de ' + m('F') + ', ' + m('G') + ', ' + m('F+G') + ' i ' + m('F\\cap G') + ' (i, com a extra, bases de ' + m('F+G') + ' i ' + m('F\\cap G') + '):' + dm('F=' + T.span(Fg.map((v) => T.vec(F, v)), K) + ',\\quad G=' + T.span(Gg.map((v) => T.vec(F, v)), K) + '\\subseteq ' + sp.name), parts: sumInterTasks(F, sp, Fg, Gg, { bases: true }) };
    },
    original() {
      const qa = (M) => L.fromInts(QQ, M);
      const a = sumInterTasks(QQ, Sp.Kn('R', 3), qa([[1, 1, -1], [2, 0, -1]]), qa([[1, 0, -1], [2, 3, 0], [4, 3, -2]]), { bases: true }).map((p) => Object.assign(p, { id: 'a' + p.id, label: '(a) ' + p.label }));
      const b = sumInterTasks(Z2, Sp.Kn('Z2', 4), [[0, 1, 0, 0], [0, 1, 1, 0], [1, 0, 1, 0]], [[1, 0, 0, 1], [1, 1, 1, 0], [1, 1, 1, 1]], { bases: true }).map((p) => Object.assign(p, { id: 'b' + p.id, label: '(b) ' + p.label }));
      return { statement: 'Trobeu la dimensió de ' + m('F') + ', ' + m('G') + ', ' + m('F+G') + ' i ' + m('F\\cap G') + ' en cadascun dels casos següents:' + dm('\\begin{aligned}&(a)\\ F=\\langle(1,1,-1),(2,0,-1)\\rangle_{\\mathbb{R}},\\ G=\\langle(1,0,-1),(2,3,0),(4,3,-2)\\rangle_{\\mathbb{R}}\\subseteq\\mathbb{R}^3\\\\&(b)\\ F=\\langle(0,1,0,0),(0,1,1,0),(1,0,1,0)\\rangle_{\\mathbb{Z}_2},\\ G=\\langle(1,0,0,1),(1,1,1,0),(1,1,1,1)\\rangle_{\\mathbb{Z}_2}\\subseteq(\\mathbb{Z}_2)^4\\end{aligned}'), parts: a.concat(b) };
    },
  });

  function eqSubTasks(F, sp, EF, GgOrEq, gIsEq) {
    const n = sp.dim;
    const nsF = G.nullSol(F, EF, VARS.slice(0, n));
    const Fg = nsF.scaled;
    let Gg, solG;
    if (gIsEq) { const nsG = G.nullSol(F, GgOrEq, VARS.slice(0, n)); Gg = nsG.scaled; solG = nsG.html; }
    else { Gg = GgOrEq; solG = G.spanBasisSol(sp, Gg, { showSubfamily: false }).html; }
    const parts = sumInterTasks(F, sp, Fg, Gg, { bases: true, solF: H.P('Resolem les equacions de ' + m('F') + ':') + nsF.html, solG });
    const WF = Sub.fromEqs(F, EF, n);
    parts.splice(1, 0, B3.basisPart('bF', sp, WF, 'Una base de ' + m('F') + ':', nsF.html, { refBasis: Fg }));
    const WG = Sub.fromGens(F, Gg, n);
    parts.splice(3, 0, B3.basisPart('bG', sp, WG, 'Una base de ' + m('G') + ':', solG, { refBasis: L.rowBasis(F, Gg).basis }));
    return parts;
  }
  G.register({
    tid: 'e64', ex: 64, star: false, topic: 3, sec: '3.8', title: 'Bases de F, G, F+G i F∩G', skill: 'Subespais per equacions: suma i intersecció',
    make(rng) {
      const F = QQ; const n = 4; const sp = Sp.Kn('Q', n);
      const EF = G.rankMatrix(F, rng, rng.pick([1, 2]), n, 0 + 1, { bound: 3, noZeroRows: true });
      const EF2 = EF.length === 1 ? EF : G.rankMatrix(F, rng, 2, n, 2, { bound: 3, noZeroRows: true });
      const Gg = G.familyRank(F, rng, 3, n, rng.pick([2, 3]), { bound: 3 });
      return { statement: 'Trobeu bases dels subespais ' + m('F,G,F+G,F\\cap G') + ' per a ' + m('F=\\{(x,y,z,t)\\in\\mathbb{Q}^4\\mid ' + EF2.map((r) => T.linexpr(F, r, VARS) + '=0').join(',\\ ') + '\\}') + ' i ' + m('G=' + T.span(Gg.map((v) => T.vec(F, v)), '\\mathbb{Q}')) + '.', parts: eqSubTasks(F, sp, EF2, Gg, false) };
    },
    original() {
      const F = QQ; const q = (M) => L.fromInts(F, M);
      const a = eqSubTasks(F, Sp.Kn('R', 5), q([[1, 0, 2, 0, 2], [0, 3, 3, -1, 2]]), q([[2, -1, 0, 1, 0], [3, 0, -1, 1, -4]]), true).map((p) => Object.assign(p, { id: 'a' + p.id, label: '(a) ' + p.label }));
      const b = eqSubTasks(F, Sp.Kn('Q', 4), q([[1, 0, 1, 1], [0, 1, 2, -1], [2, -1, 0, 3]]), q([[1, 1, 0, 1], [3, 2, -1, 0], [1, 0, -1, -2]]), false).map((p) => Object.assign(p, { id: 'b' + p.id, label: '(b) ' + p.label }));
      return { statement: 'Trobeu bases dels subespais ' + m('F,G,F+G') + ' i ' + m('F\\cap G') + ' en cadascun dels casos següents:' + dm('\\begin{aligned}&(a)\\ F=\\{x+2z+2u=0,\\ 3y+3z-t+2u=0\\},\\ G=\\{2x-y+t=0,\\ 3x-z+t-4u=0\\}\\subseteq\\mathbb{R}^5\\\\&(b)\\ F=\\{x+z+t=0,\\ y+2z-t=0,\\ 2x-y+3t=0\\}\\subseteq\\mathbb{Q}^4,\\ G=\\langle(1,1,0,1),(3,2,-1,0),(1,0,-1,-2)\\rangle_{\\mathbb{Q}}\\end{aligned}'), parts: a.concat(b) };
    },
  });
  G.register({
    tid: 'e65', ex: 65, star: false, topic: 3, sec: '3.8', noGen: true, title: 'Dimensió de F+G (raonament)', skill: 'Grassmann sense calcular',
    original() {
      return { statement: 'Siguin ' + m('E,F,G') + ' tres subespais vectorials de dimensió 2 de ' + m('\\mathbb{R}^5') + '. Esbrineu la dimensió de ' + m('F+G') + ' sabent que ' + m('F\\neq G') + ' i que ' + m('E\\cap(F+G)=\\{0\\}') + '.', parts: [{ id: 'd', kind: 'int', label: m('\\dim(F+G)') + ' =', check: (v) => (v === 3 ? EV.ok() : EV.bad()), ref: '3', sol: H.P(m('F\\neq G') + ' i tots dos de dimensió 2 ⇒ ' + m('F\\cap G\\neq F') + ' ⇒ ' + m('\\dim(F\\cap G)\\le1') + ' ⇒ per Grassmann ' + m('\\dim(F+G)=4-\\dim(F\\cap G)\\in\\{3,4\\}') + '.') + H.P('Com que ' + m('E\\cap(F+G)=\\{0\\}') + ', ' + m('\\dim(E+(F+G))=2+\\dim(F+G)\\le5') + ' ⇒ ' + m('\\dim(F+G)\\le3') + '.') + H.ans(m('\\dim(F+G)=3')) }] };
    },
  });

  /* =====================================================================
     66 · Matrius d'una aplicació respecte de bases
     ===================================================================== */
  function basesMatrixTasks(F, A, P, opts) {
    opts = opts || {};
    const n = A.length;
    const us = L.transpose(P);
    const Pinv = L.inverse(F, P).inv;
    const fus = us.map((u) => L.mulVec(F, A, u));
    const MCB = L.mul(F, A, P), MBC = L.mul(F, Pinv, A), MBB = L.mul(F, Pinv, L.mul(F, A, P));
    const parts = [];
    fus.forEach((fu, i) => parts.push({ id: 'f' + i, kind: 'vector', F, n, label: m('f(u_' + (i + 1) + ')') + ' =', check: (v) => C.eqVec(F, v, fu), ref: S.vecStr(F, fu), sol: H.P(m('f' + T.vec(F, us[i]) + '=' + T.vec(F, fu))) }));
    const notation = H.box('note', 'Notació', m('M(\\mathcal{B}\'\\xleftarrow{f}\\mathcal{B})') + ' és la matriu que té per <b>columnes</b> les coordenades, en la base ' + m('\\mathcal{B}\'') + ' (arribada), de les imatges dels vectors de ' + m('\\mathcal{B}') + ' (sortida). Regla: ' + m('M(\\mathcal{B}\'\\xleftarrow{f}\\mathcal{B})=M(\\mathcal{B}\'\\leftarrow\\mathcal{C})\\,M(\\mathcal{C}\\xleftarrow{f}\\mathcal{C})\\,M(\\mathcal{C}\\leftarrow\\mathcal{B})') + ', amb ' + m('P=M(\\mathcal{C}\\leftarrow\\mathcal{B})') + ' = vectors de ' + m('\\mathcal{B}') + ' en columnes.');
    parts.push({ id: 'MCB', kind: 'matrix', F, m: n, n, label: m('M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})') + ' =', check: (M) => C.eqMat(F, M, MCB), ref: S.matStr(F, MCB), sol: notation + H.P('Les coordenades en la base canònica són els mateixos vectors: les columnes són ' + m('f(u_1),f(u_2),f(u_3)') + '. Equivalentment ' + m('AP') + ':') + dm(T.matrix(F, A) + T.matrix(F, P) + '=' + T.matrix(F, MCB)) });
    const inv = L.inverse(F, P);
    parts.push({ id: 'MBC', kind: 'matrix', F, m: n, n, label: m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{C})') + ' =', check: (M) => C.eqMat(F, M, MBC), ref: S.matStr(F, MBC), sol: H.P('Ara cal expressar les imatges ' + m('f(e_j)') + ' (columnes de ' + m('A') + ') en coordenades de ' + m('\\mathcal{B}') + ': ' + m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{C})=P^{-1}A') + '. Calculem ' + m('P^{-1}') + ':') + H.chain(F, inv.rr, { aug: n }) + dm('P^{-1}A=' + T.matrix(F, Pinv) + T.matrix(F, A) + '=' + T.matrix(F, MBC)) });
    parts.push({ id: 'MBB', kind: 'matrix', F, m: n, n, label: m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{B})') + ' =', check: (M) => C.eqMat(F, M, MBB), ref: S.matStr(F, MBB), sol: H.P(m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{B})=P^{-1}AP=P^{-1}\\,M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})') + ':') + dm(T.matrix(F, Pinv) + T.matrix(F, MCB) + '=' + T.matrix(F, MBB)) + H.P('Comprovació per columnes: la columna ' + m('i') + ' són les coordenades de ' + m('f(u_i)') + ' en ' + m('\\mathcal{B}') + ', és a dir ' + m('f(u_i)=\\sum_j (MBB)_{ji}\\,u_j') + '.') });
    return parts;
  }
  G.register({
    tid: 'e66', ex: 66, star: true, topic: 3, sec: '3.5 · 3.7',
    title: 'Matriu d\'una aplicació respecte de bases', skill: 'M(B′ ← B): canvis de base',
    make(rng) {
      const F = QQ;
      const A = G.rankMatrix(F, rng, 3, 3, rng.pick([2, 3, 3]), { bound: 4, noZeroRows: true });
      const P = G.unimodular(F, rng, 3, { bound: 2, ops: 3 });
      if (rng.bool(0.3)) { const j = rng.int(0, 2); for (let i = 0; i < 3; i++) P[i][j] = P[i][j].mul(fr(-1)); }
      const us = L.transpose(P);
      return { statement: 'Considerem ' + m('f\\colon\\mathbb{Q}^3\\to\\mathbb{Q}^3,\\ ' + C3.formula(F, A, ['a', 'b', 'c'])) + ' i la base ' + m('\\mathcal{B}') + ' formada per ' + us.map((u, i) => m('u_' + (i + 1) + '=' + T.vec(F, u))).join(', ') + '. Calculeu ' + m('f(u_1),f(u_2),f(u_3)') + ', la matriu ' + m('M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})') + ' (' + m('\\mathcal{C}') + ' = canònica), ' + m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{C})') + ' i ' + m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{B})') + '.', parts: basesMatrixTasks(F, A, P) };
    },
    original() {
      const F = QQ;
      const A = L.fromInts(F, [[-2, 2, 0], [0, -4, 2], [3, -1, -1]]);
      const P = L.transpose(L.fromInts(F, [[1, 1, 0], [1, -1, 0], [-1, 1, 1]]));
      return { statement: 'Considerem ' + m('f\\colon\\mathbb{Q}^3\\to\\mathbb{Q}^3,\\ f(a,b,c)=(-2a+2b,\\ -4b+2c,\\ 3a-b-c)') + '. Considereu la base ' + m('\\mathcal{B}') + ' donada per ' + m('u_1=(1,1,0),\\ u_2=(1,-1,0),\\ u_3=(-1,1,1)') + '. Calculeu ' + m('f(u_1),f(u_2),f(u_3)') + '. Doneu la matriu ' + m('M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})') + ' de ' + m('f') + ' respecte de la doble elecció de bases: ' + m('\\mathcal{B}') + ' de l\'espai de sortida i la base canònica ' + m('\\mathcal{C}') + ' de l\'espai d\'arribada. Trobeu també ' + m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{C})') + ' i ' + m('M(\\mathcal{B}\\xleftarrow{f}\\mathcal{B})') + '.', parts: basesMatrixTasks(F, A, P) };
    },
  });

  /* =====================================================================
     67 · Base B amb matriu donada; matriu respecte de B1, B2
     ===================================================================== */
  function task67(F, A, target, P1, Q2) {
    const n = A[0].length, mm = A.length;
    const sp = Sp.Kn('Q', n);
    const ki = C3.kerImTasks(F, 'Q', A);
    const parts = ki.parts.map((p) => Object.assign(p, { label: '(a) ' + p.label }));
    // (b) base B amb M(C <- B) = target
    const tcols = L.transpose(target);
    // construïm una base de referència
    const kb = ki.ns.scaled || ki.ns.basis;
    const pre = tcols.filter((c) => !L.isZeroV(F, c)).map((c) => L.solve(F, A, c).sol);
    const refB = pre.concat(kb);
    let solB = H.P('Volem ' + m('u_1,u_2,u_3') + ' tals que les columnes de la matriu siguin ' + m('f(u_1),f(u_2),f(u_3)') + ' (en la base canònica de ' + m('\\mathbb{Q}^2') + '): ' + tcols.map((c, i) => m('f(u_' + (i + 1) + ')=' + T.vec(F, c))).join(', ') + '.');
    solB += H.P('Els vectors amb imatge 0 els prenem d\'una base de ' + m('\\operatorname{Ker}f') + ' (així queden LI); els altres, resolent ' + m('Au=c') + '.');
    solB += H.ans(m('\\mathcal{B}=\\left(' + refB.map((v) => T.vec(F, v)).join(',\\ ') + '\\right)'));
    solB += H.P('És base: els vectors fora del nucli tenen imatges LI, i amb la base del nucli completen ' + n + ' vectors LI (es veu amb el rang o amb la demostració del teorema de la dimensió).');
    parts.push({
      id: 'B', kind: 'vectors', F, n, label: '(b) Una base ' + m('\\mathcal{B}') + ' de ' + m('\\mathbb{Q}^3') + ' amb ' + m('M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})=' + T.matrix(F, target)) + ' (els 3 vectors en ordre):', placeholder: '(1,0,0), (2,-1,0), (3,0,1)',
      check: (vs) => {
        if (vs.length !== n) return EV.bad('Cal donar ' + n + ' vectors.');
        if (!L.isLI(F, vs)) return EV.bad('No és una base (són LD).');
        const bad = vs.findIndex((v, i) => !L.eqV(F, L.mulVec(F, A, v), tcols[i]));
        if (bad >= 0) return EV.bad('f(u' + (bad + 1) + ') no coincideix amb la columna ' + (bad + 1) + '.');
        return EV.ok();
      }, ref: refB.map((v) => S.vecStr(F, v)).join(', '), sol: solB,
    });
    // (c) M(B2 <- B1)
    const Q2inv = L.inverse(F, Q2).inv;
    const M = L.mul(F, Q2inv, L.mul(F, A, P1));
    const inv = L.inverse(F, Q2);
    parts.push({
      id: 'M', kind: 'matrix', F, m: mm, n, label: '(c) ' + m('M(\\mathcal{B}_2\\xleftarrow{f}\\mathcal{B}_1)') + ' =', check: (X) => C.eqMat(F, X, M), ref: S.matStr(F, M),
      sol: H.P(m('M(\\mathcal{B}_2\\xleftarrow{f}\\mathcal{B}_1)=Q^{-1}AP') + ', on ' + m('P') + ' té els vectors de ' + m('\\mathcal{B}_1') + ' en columnes i ' + m('Q') + ' els de ' + m('\\mathcal{B}_2') + '.') + dm('P=' + T.matrix(F, P1) + ',\\quad Q=' + T.matrix(F, Q2)) + H.P('Calculem ' + m('Q^{-1}') + ':') + H.chain(F, inv.rr, { aug: mm }) + dm('AP=' + T.matrix(F, L.mul(F, A, P1)) + ',\\qquad Q^{-1}AP=' + T.matrix(F, M)) + H.P('Interpretació: la columna ' + m('j') + ' són les coordenades de ' + m('f(u_j)') + ' en la base ' + m('\\mathcal{B}_2') + '.'),
    });
    return parts;
  }
  G.register({
    tid: 'e67', ex: 67, star: true, topic: 3, sec: '3.6 · 3.7',
    title: 'Triar bases per obtenir una matriu donada', skill: 'Ker/Im i matrius respecte de bases arbitràries',
    make(rng) {
      const F = QQ;
      const r = rng.pick([1, 1, 2]);
      const A = G.rankMatrix(F, rng, 2, 3, r, { bound: 6, noZeroRows: true, noZeroCols: r === 1 });
      let target;
      if (r === 1) { const j = L.transpose(A).findIndex((c) => !L.isZeroV(F, c)); const c = L.transpose(A)[j]; target = [[c[0], F.zero, F.zero], [c[1], F.zero, F.zero]]; }
      else target = [[F.one, F.zero, F.zero], [F.zero, F.one, F.zero]];
      const P1 = G.unimodular(F, rng, 3, { bound: 2, ops: 3 });
      const Q2 = G.unimodular(F, rng, 2, { bound: 2, ops: 2 });
      const b1 = L.transpose(P1), b2 = L.transpose(Q2);
      return {
        statement: 'Considerem ' + m('f\\colon\\mathbb{Q}^3\\to\\mathbb{Q}^2,\\ ' + C3.formula(F, A)) + '.' + H.ul(['(a) Calculeu la dimensió i una base de ' + m('\\operatorname{Ker}(f)') + ' i ' + m('\\operatorname{Im}(f)') + '.', '(b) Sigui ' + m('\\mathcal{C}') + ' la base canònica de ' + m('\\mathbb{Q}^2') + '. Trobeu una base ' + m('\\mathcal{B}') + ' de ' + m('\\mathbb{Q}^3') + ' tal que ' + m('M(\\mathcal{C}\\xleftarrow{f}\\mathcal{B})=' + T.matrix(F, target)) + '.', '(c) Siguin ' + m('\\mathcal{B}_1=(' + b1.map((v) => T.vec(F, v)).join(',') + ')') + ' i ' + m('\\mathcal{B}_2=(' + b2.map((v) => T.vec(F, v)).join(',') + ')') + '. Trobeu ' + m('M(\\mathcal{B}_2\\xleftarrow{f}\\mathcal{B}_1)') + '.']),
        parts: task67(F, A, target, P1, Q2),
      };
    },
    original() {
      const F = QQ; const q = (M) => L.fromInts(F, M);
      const A = q([[1, 2, -3], [2, 4, -6]]);
      const target = q([[1, 0, 0], [2, 0, 0]]);
      const P1 = L.transpose(q([[1, 0, 1], [0, 1, 1], [1, 0, -1]]));
      const Q2 = L.transpose(q([[1, 2], [-1, 1]]));
      return {
        statement: 'Considerem l\'aplicació lineal ' + m('f\\colon\\mathbb{Q}^3\\to\\mathbb{Q}^2,\\ f(x,y,z)=(x+2y-3z,\\ 2x+4y-6z)') + '.' + H.ul(['(a) Calculeu la dimensió i una base dels subespais ' + m('\\operatorname{Ker}(f)') + ' i ' + m('\\operatorname{Im}(f)') + '.', '(b) Sigui ' + m('\\mathcal{C}') + ' la base canònica de ' + m('\\mathbb{Q}^2') + '. Trobeu una base ' + m('\\mathcal{B}') + ' de ' + m('\\mathbb{Q}^3') + ' tal que la matriu de ' + m('f') + ' respecte de ' + m('\\mathcal{B}') + ' i ' + m('\\mathcal{C}') + ' sigui ' + m('\\begin{pmatrix}1&0&0\\\\2&0&0\\end{pmatrix}') + '.', '(c) Considerem la base ' + m('\\mathcal{B}_1') + ' de ' + m('\\mathbb{Q}^3') + ' formada per ' + m('u_1=(1,0,1),u_2=(0,1,1),u_3=(1,0,-1)') + ', i la base ' + m('\\mathcal{B}_2') + ' de ' + m('\\mathbb{Q}^2') + ' formada per ' + m('v_1=(1,2),v_2=(-1,1)') + '. Trobeu la matriu de ' + m('f') + ' respecte de ' + m('\\mathcal{B}_1,\\mathcal{B}_2') + '.']),
        parts: task67(F, A, target, P1, Q2),
      };
    },
  });

  EV.T3D = { sumInterTasks, basesMatrixTasks, inverseTasks };
})(window.EV = window.EV || {});
