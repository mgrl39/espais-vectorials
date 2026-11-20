/* ============================================================
   Tema 3 · Generadors: bases, dimensió, coordenades i ampliació
   (43, 44, 45, 46, 47, 48, 49)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S, G = EV.G, C = EV.C, Sp = EV.Sp, Sub = EV.Sub;
  const { m, dm } = H;
  const QQ = EV.QQ, CC = EV.CC, Z2 = EV.Z2;
  const fr = EV.fr, cx = EV.cx;
  const VARS = ['x', 'y', 'z', 't', 'u'];

  const elemsList = (sp, list) => list.map((c) => sp.str(sp.fromC(c))).join(', ');
  const texList = (sp, list) => '\\left(' + list.map((c) => sp.tex(sp.fromC(c))).join(',\\ ') + '\\right)';

  /* ---------- apartats reutilitzables ---------- */
  function basisPart(id, sp, W, label, solHtml, opts) {
    opts = opts || {};
    return {
      id, kind: 'elems', space: sp, label, placeholder: sp.fmt,
      check: (v) => C.basisOf(sp.F, W, v, opts),
      ref: elemsList(sp, opts.refBasis || W.basis), sol: solHtml,
    };
  }
  function dimPart(id, d, label, sol) {
    return { id, kind: 'int', label: label || 'Dimensió:', check: (v) => (v === d ? EV.ok() : EV.bad()), ref: String(d), sol };
  }
  function extendPart(id, sp, W, label, sol, ambient) {
    const Amb = ambient || Sub.fromGens(sp.F, L.identity(sp.F, sp.dim), sp.dim);
    const ext = L.extendCanonical(sp.F, W.basis, sp.dim).add;
    return {
      id, kind: 'elems', space: sp, label, placeholder: sp.fmt,
      check: (v) => C.extension(sp.F, Amb, W.basis, v),
      ref: elemsList(sp, ext), sol,
    };
  }
  // coordenades de u respecte de la base donada a l'apartat `basisId`
  function coordsPart(id, sp, W, u, basisId, ourBasis, label) {
    const F = sp.F;
    const cs = G.coordsSol(sp, ourBasis, u, 'B');
    const ourC = cs.coords;
    return {
      id, kind: 'vector', F, n: W.dim, label: label || ('Coordenades de ' + m('u') + ' respecte de la base que has trobat a l\'apartat de la base:'),
      dependsOn: basisId,
      check: (v, ctx) => {
        const B = ctx && ctx.answers ? ctx.answers[basisId] : null;
        if (!B) return EV.bad('Primer resol correctament l\'apartat de la base: les coordenades depenen de quina base hagis triat.');
        const c = L.coords(F, B, u);
        if (!c) return EV.bad('u no pertany al subespai generat per la teva base?');
        return L.eqV(F, v, c) ? EV.ok() : EV.bad('Respecte de la teva base, no són aquestes.');
      },
      ref: S.vecStr(F, ourC),
      sol: H.P('Calculem-les respecte de la base ' + m('B=' + texList(sp, ourBasis)) + ' (si la teva base és una altra, les coordenades seran diferents; la web comprova la teva resposta amb <b>la teva</b> base).') + G.coordIntro(sp) + cs.html,
    };
  }
  function containPart(id, sp, W, u, ourBasis) {
    const F = sp.F;
    const r = G.basisWithUSol(sp, ourBasis, u);
    return {
      id, kind: 'elems', space: sp, label: 'Una base del subespai que contingui ' + m('u') + ':', placeholder: sp.fmt,
      check: (v) => C.basisOf(F, W, v, { mustContain: u }),
      ref: elemsList(sp, r.basis), sol: r.html,
    };
  }

  /* =====================================================================
     43 · F = <v1..v4> ⊆ Q^4: base, ampliar, coordenades, base amb u
     ===================================================================== */
  function spanTasks(sp, gens, u, opts) {
    opts = opts || {};
    const F = sp.F;
    const W = Sub.fromGens(F, gens, sp.dim);
    const sb = G.spanBasisSol(sp, gens);
    const ourB = sb.basis;
    const parts = [];
    parts.push(basisPart('a', sp, W, (opts.la || '(a)') + ' Una base de ' + m('F') + ':', sb.html + H.ans(m('\\dim F=' + W.dim)), { refBasis: ourB }));
    if (opts.dim) parts.push(dimPart('dim', W.dim, m('\\dim F') + ' =', H.P('És el nombre de vectors de qualsevol base (Teorema 3.16): ' + m('\\dim F=\\operatorname{rang}=' + W.dim) + '.')));
    if (opts.extend !== false) {
      const es = G.extendSol(sp, ourB);
      parts.push(extendPart('b', sp, W, (opts.lb || '(b)') + ' Vectors que cal afegir a la base de ' + m('F') + ' per obtenir una base de ' + m(sp.name) + ':', es.html));
    }
    if (u) {
      const isIn = W.contains(u);
      if (opts.memberQ) {
        const ms = G.membershipSol(sp, gens, u, {});
        parts.push({ id: 'in', kind: 'choice', label: (opts.lc || '(c)') + ' Pertany ' + m('u') + ' a ' + m('F') + '?', options: G.YN, check: (v) => ((v === 'si') === isIn ? EV.ok() : EV.bad()), ref: isIn ? 'si' : 'no', sol: ms.html });
      }
      if (isIn) {
        parts.push(coordsPart('c', sp, W, u, 'a', ourB, (opts.lc || '(c)') + ' Coordenades de ' + m('u') + ' respecte de la base de ' + m('F') + ' que has donat a (a):'));
        if (opts.contain !== false) parts.push(containPart('d', sp, W, u, ourB));
        if (opts.contain !== false) parts[parts.length - 1].label = (opts.ld || '(d)') + ' ' + parts[parts.length - 1].label;
      }
    }
    return { parts, W, ourB };
  }

  G.register({
    tid: 'e43', ex: 43, star: true, topic: 3, sec: '3.3 · 3.4 · 3.9',
    title: 'Base d\'un subespai generat, ampliació i coordenades', skill: 'Base de ⟨v₁,…,vₖ⟩, ampliar a base, coordenades, base que contingui u',
    make(rng) {
      const F = QQ; const sp = Sp.Kn('Q', 4);
      const r = rng.pick([2, 2, 3]);
      const gens = G.familyRank(F, rng, 4, 4, r, { bound: 7 });
      const W = Sub.fromGens(F, gens, 4);
      const idx = L.maximalSubfamily(F, gens).idx;
      const u = L.combo(F, G.smallCoefs(F, rng, idx.length, { allNonzero: true }), idx.map((i) => gens[i]));
      const t = spanTasks(sp, gens, u, { memberQ: false });
      return {
        statement: 'Considerem el subespai vectorial ' + m('F=' + T.span(gens.map((g) => T.vec(F, g)), '\\mathbb{Q}') + '\\subseteq\\mathbb{Q}^4') + '.' +
          H.ul(['(a) Trobeu una base de ' + m('F') + '.', '(b) Amplieu aquesta base de ' + m('F') + ' a una base de ' + m('\\mathbb{Q}^4') + '.', '(c) Comproveu que ' + m('u=' + T.vec(F, u)) + ' pertany a ' + m('F') + ' i calculeu les seves coordenades respecte de la base de (a).', '(d) Trobeu una base de ' + m('F') + ' que contingui ' + m('u') + '.']),
        parts: t.parts,
      };
    },
    original() {
      const F = QQ; const sp = Sp.Kn('Q', 4);
      const gens = L.fromInts(F, [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6, 7]]);
      const u = L.fromInts(F, [[-1, 0, 1, 2]])[0];
      const t = spanTasks(sp, gens, u, { memberQ: false });
      return {
        statement: 'Considerem el subespai vectorial ' + m('F=\\langle(1,2,3,4),(2,3,4,5),(3,4,5,6),(4,5,6,7)\\rangle_{\\mathbb{Q}}\\subseteq\\mathbb{Q}^4') + '.' + H.ul(['(a) Trobeu una base de ' + m('F') + '.', '(b) Amplieu aquesta base de ' + m('F') + ' a una base de ' + m('\\mathbb{Q}^4') + '.', '(c) Comproveu que el vector ' + m('u=(-1,0,1,2)') + ' pertany a ' + m('F') + ' i calculeu les coordenades de ' + m('u') + ' respecte de la base de ' + m('F') + ' que heu trobat a l\'apartat (a).', '(d) Trobeu una base de ' + m('F') + ' que contingui ' + m('u') + ' entre els seus membres.']),
        parts: t.parts,
      };
    },
  });

  /* =====================================================================
     44 / 45 · V = solucions d'un sistema homogeni
     ===================================================================== */
  function eqTasks(sp, A, u, opts) {
    opts = opts || {};
    const F = sp.F; const n = sp.dim;
    const W = Sub.fromEqs(F, A, n);
    const ns = G.nullSol(F, A, VARS.slice(0, n), {});
    const ourB = ns.scaled && F.id === 'Q' ? ns.scaled : ns.basis;
    const parts = [];
    parts.push(basisPart('a', sp, W, (opts.la || '(a)') + ' Una base de ' + m('V') + ':', ns.html + H.ans(m('\\dim V=' + W.dim)), { refBasis: ourB }));
    const es = G.extendSol(sp, ourB);
    parts.push(extendPart('b', sp, W, (opts.lb || '(a)') + ' Vectors que cal afegir a la base de ' + m('V') + ' per obtenir una base de ' + m(sp.name) + ':', es.html));
    if (u) {
      // comprovar u ∈ V substituint
      const val = L.mulVec(F, A, u);
      let solIn = H.P('Substituïm ' + m('u') + ' a les equacions: ' + m('A\\,u^t=' + T.colvec(F, val)) + (L.isZeroV(F, val) ? ' ✓, per tant ' + m('u\\in V') + '.' : '.'));
      parts.push(coordsPart('c', sp, W, u, 'a', ourB, (opts.lc || '(b)') + ' Comprova que ' + m('u\\in V') + ' i dona les seves coordenades respecte de la teva base de ' + m('V') + ':'));
      parts[parts.length - 1].sol = solIn + parts[parts.length - 1].sol;
      const cp = containPart('d', sp, W, u, ourB); cp.label = (opts.ld || '(c)') + ' ' + cp.label;
      parts.push(cp);
    }
    return { parts, W, ourB };
  }
  function sysTex(F, A) { const n = A[0].length; return T.matrix(F, A) + '\\begin{pmatrix}' + VARS.slice(0, n).join('\\\\') + '\\end{pmatrix}=\\begin{pmatrix}' + A.map(() => '0').join('\\\\') + '\\end{pmatrix}'; }

  G.register({
    tid: 'e44', ex: 44, star: true, topic: 3, sec: '3.3 · 3.4 · 3.9 (Tasca 5)',
    title: 'Base d\'un subespai donat per equacions', skill: 'Base de les solucions d\'un sistema homogeni, ampliar, coordenades',
    make(rng) {
      const F = QQ; const sp = Sp.Kn('R', 4);
      const r = rng.pick([2, 2, 3]);
      let A = G.rankMatrix(F, rng, 3, 4, r, { bound: 5, noZeroRows: true });
      if (rng.bool(0.4)) { const i = rng.int(0, 2); A[i] = A[i].map((a) => a.div(fr(2))); }
      const W = Sub.fromEqs(F, A, 4);
      const u = L.clearDen(F, L.combo(F, G.smallCoefs(F, rng, W.dim, { allNonzero: true }), W.basis));
      const t = eqTasks(sp, A, u);
      return {
        statement: 'Considerem el subespai vectorial ' + m('V\\subseteq\\mathbb{R}^4') + ' format pels vectors ' + m('(x,y,z,t)') + ' que satisfan:' + dm(sysTex(F, A)) + H.ul(['(a) Trobeu una base de ' + m('V') + ' i amplieu-la fins obtenir una base de ' + m('\\mathbb{R}^4') + '.', '(b) Comproveu que ' + m('u=' + T.vec(F, u)) + ' pertany a ' + m('V') + ' i calculeu les seves coordenades respecte de la base de ' + m('V') + ' que heu trobat.', '(c) Trobeu una base de ' + m('V') + ' de la qual ' + m('u') + ' en formi part.']),
        parts: t.parts,
      };
    },
    original() {
      const F = QQ; const sp = Sp.Kn('R', 4);
      const A = L.fromInts(F, [[-4, 0, -2, 1], [2, 0, 1, '-1/2'], [3, 1, 2, 0]]);
      const u = L.fromInts(F, [[1, 1, -2, 0]])[0];
      const t = eqTasks(sp, A, u);
      return {
        statement: 'Considerem el subespai vectorial ' + m('V\\subseteq\\mathbb{R}^4') + ' format pels vectors ' + m('(x,y,z,t)\\in\\mathbb{R}^4') + ' que satisfan:' + dm('\\begin{pmatrix}-4&0&-2&1\\\\2&0&1&-\\frac12\\\\3&1&2&0\\end{pmatrix}\\begin{pmatrix}x\\\\y\\\\z\\\\t\\end{pmatrix}=\\begin{pmatrix}0\\\\0\\\\0\\end{pmatrix}') + H.ul(['(a) Trobeu una base de ' + m('V') + ' i amplieu-la fins obtenir una base de ' + m('\\mathbb{R}^4') + '.', '(b) Comproveu que el vector ' + m('u=(1,1,-2,0)') + ' pertany a ' + m('V') + ' i calculeu les coordenades de ' + m('u') + ' respecte de la base de ' + m('V') + ' que heu trobat a l\'apartat anterior.', '(c) Trobeu una base de ' + m('V') + ' de la qual ' + m('u') + ' en formi part.']),
        parts: t.parts,
        notes: H.tip('Fixa\'t que la segona equació és ' + m('-\\tfrac12') + ' per la primera: només hi ha 2 equacions independents i ' + m('\\dim V=4-2=2') + '.'),
      };
    },
  });

  G.register({
    tid: 'e45', ex: 45, star: false, topic: 3, sec: '3.4',
    title: 'Base d\'un hiperplà que contingui u', skill: 'Base que contingui un vector donat',
    make(rng) {
      const F = QQ; const sp = Sp.Kn('R', 4);
      const row = [fr(rng.pick([1, 1, 2])), fr(rng.pick([1, -1, 1])), fr(rng.pick([1, 1, -1, 3])), fr(rng.pick([1, 1, 2, -1]))];
      const W = Sub.fromEqs(F, [row], 4);
      const u = L.clearDen(F, L.combo(F, G.smallCoefs(F, rng, 3, { allNonzero: true }), W.basis));
      const t = eqTasks(sp, [row], u);
      const parts = [t.parts[0], t.parts[3], t.parts[1]];
      parts[1].label = 'Una base de ' + m('V') + ' que contingui ' + m('u') + ':'; parts[2].label = 'Vectors per ampliar la base de ' + m('V') + ' a una base de ' + m('\\mathbb{R}^4') + ':';
      parts[0].label = 'Una base qualsevol de ' + m('V') + ':';
      return { statement: 'Considerem ' + m('V=\\{(x,y,z,t)\\in\\mathbb{R}^4\\mid ' + T.linexpr(F, row, VARS) + '=0\\}') + '. Trobeu una base de ' + m('V') + ' que contingui ' + m('u=' + T.vec(F, u)) + ' i amplieu-la a una base de ' + m('\\mathbb{R}^4') + '.', parts };
    },
    original() {
      const F = QQ; const sp = Sp.Kn('R', 4);
      const row = [fr(1), fr(1), fr(1), fr(1)]; const u = [fr(2), fr(3), fr(-1), fr(-4)];
      const t = eqTasks(sp, [row], u);
      const parts = [t.parts[0], t.parts[3], t.parts[1]];
      parts[0].label = 'Una base qualsevol de ' + m('V') + ':'; parts[1].label = 'Una base de ' + m('V') + ' que contingui ' + m('u') + ':'; parts[2].label = 'Vectors per ampliar a una base de ' + m('\\mathbb{R}^4') + ':';
      return { statement: 'Considerem el subespai vectorial ' + m('V=\\{(x,y,z,t)\\in\\mathbb{R}^4\\mid x+y+z+t=0\\}\\subseteq\\mathbb{R}^4') + '. Trobeu una base de ' + m('V') + ' que contingui el vector ' + m('u=(2,3,-1,-4)') + '. Amplieu la base de ' + m('V') + ' que heu trobat en una base de ' + m('\\mathbb{R}^4') + '.', parts };
    },
  });

  /* =====================================================================
     46 · Treballar en coordenades a R3[x]
     ===================================================================== */
  function evalRow(F, a, deg) { const r = []; let p = F.one; for (let k = 0; k <= deg; k++) { r.push(p); p = F.mul(p, a); } return r; }
  function derivRow(F, a, deg) { const r = [F.zero]; let p = F.one; for (let k = 1; k <= deg; k++) { r.push(F.mul(F.fromInt(k), p)); p = F.mul(p, a); } return r; }

  function polyTasks(sp, gens, a) {
    const F = QQ;
    const W = Sub.fromGens(F, gens, sp.dim);
    const sb = G.spanBasisSol(sp, gens);
    const parts = [];
    parts.push(basisPart('a', sp, W, '(a) Una base de ' + m('F') + ':', sb.html + H.ans(m('\\dim F=' + W.dim)), { refBasis: sb.basis }));
    // (x-a)^2
    const sq = EV.P.pad(F, EV.P.mul(F, [F.neg(fr(a)), F.one], [F.neg(fr(a)), F.one]), 4);
    const isIn = W.contains(sq);
    const sqTex = '(x' + (a === 0 ? '' : a > 0 ? '-' + a : '+' + (-a)) + ')^2';
    if (isIn) parts.push(coordsPart('c', sp, W, sq, 'a', sb.basis, '(a) Coordenades de ' + m(sqTex) + ' respecte de la teva base de ' + m('F') + ':'));
    // F = {p(a)=0}
    const E = Sub.fromEqs(F, [evalRow(F, fr(a), 3)], 4);
    const equal = L.spanEqual(F, W.basis, E.basis);
    const allVanish = gens.every((g) => F.isZero(EV.P.evalAt(F, g, fr(a))));
    let solEq = H.P('Sigui ' + m('W=\\{p\\in\\mathbb{R}_3[x]\\mid p(' + a + ')=0\\}') + '. En coordenades ' + m('(a_0,a_1,a_2,a_3)') + ' és l\'equació ' + m(T.linexpr(F, evalRow(F, fr(a), 3), ['a_0', 'a_1', 'a_2', 'a_3']) + '=0') + ' ⇒ ' + m('\\dim W=4-1=3') + '.');
    solEq += H.P((allVanish ? 'Tots els generadors de ' + m('F') + ' s\'anul·len a ' + m('x=' + a) + ' ⇒ ' + m('F\\subseteq W') + '. ' : 'Algun generador de ' + m('F') + ' no s\'anul·la a ' + m('x=' + a) + ' ⇒ ' + m('F\\not\\subseteq W') + '. ') + (allVanish ? (W.dim === 3 ? 'I ' + m('\\dim F=3=\\dim W') + ' ⇒ ' + m('F=W') + ' (D3).' : 'Però ' + m('\\dim F=' + W.dim + '<3') + ' ⇒ ' + m('F\\subsetneq W') + '.') : ''));
    parts.push({ id: 'eqW', kind: 'choice', label: '(a) Coincideix ' + m('F') + ' amb el subespai dels polinomis que s\'anul·len a ' + m('x=' + a) + '?', options: G.YN, check: (v) => ((v === 'si') === equal ? EV.ok() : EV.bad()), ref: equal ? 'si' : 'no', sol: solEq });
    // (b) V = {p(a)=0=p'(a)}
    const A = [evalRow(F, fr(a), 3), derivRow(F, fr(a), 3)];
    const V = Sub.fromEqs(F, A, 4);
    const ns = G.nullSol(F, A, ['a_0', 'a_1', 'a_2', 'a_3'], { sp });
    const ourV = ns.scaled;
    let solV = H.P('Si ' + m('p=a_0+a_1x+a_2x^2+a_3x^3') + ', ' + m('p\'=a_1+2a_2x+3a_3x^2') + '. Les condicions ' + m('p(' + a + ')=0') + ' i ' + m('p\'(' + a + ')=0') + ' són:' + dm(T.system(F, A, null, ['a_0', 'a_1', 'a_2', 'a_3']))) + ns.html;
    solV += H.tip('Interpretació: ' + m('p(' + a + ')=p\'(' + a + ')=0') + ' vol dir que ' + m('x=' + a) + ' és arrel doble, és a dir ' + m(sqTex + '\\mid p') + '. Per tant ' + m('V=\\{' + sqTex + '(b+cx)\\}=\\langle ' + sqTex + ',\\ x' + sqTex + '\\rangle') + '.');
    parts.push(basisPart('vb', sp, V, '(b) Una base de ' + m('V=\\{p\\in\\mathbb{R}_3[x]\\mid p(' + a + ')=0=p\'(' + a + ')\\}') + ':', solV, { refBasis: ourV }));
    const es = G.extendSol(sp, ourV);
    parts.push(extendPart('ve', sp, V, '(b) Polinomis que cal afegir a la base de ' + m('V') + ' per obtenir una base de ' + m('\\mathbb{R}_3[x]') + ':', es.html));
    return parts;
  }
  function polyGensVanishing(rng, a) {
    const F = QQ;
    // tres polinomis que s'anul·len a x=a, LI, més un de combinació
    for (let t = 0; t < 200; t++) {
      const qs = [0, 1, 2].map(() => [G.rnd(F, rng, -2, 2), G.rnd(F, rng, -2, 2), G.rnd(F, rng, -1, 1)]);
      const lin = [F.neg(fr(a)), F.one];
      let gens = qs.map((q) => EV.P.pad(F, EV.P.mul(F, lin, q), 4));
      if (L.rank(F, gens) < 3) continue;
      const c = G.smallCoefs(F, rng, 3, { allNonzero: true });
      gens.push(L.combo(F, c, gens));
      gens = rng.shuffle(gens);
      if (G.maxAbs(F, gens) > 9) continue;
      if (gens.some((g) => L.isZeroV(F, g))) continue;
      return gens;
    }
    return [[fr(-1), fr(0), fr(0), fr(1)], [fr(-1), fr(0), fr(1), fr(0)], [fr(-1), fr(1), fr(0), fr(0)], [fr(-2), fr(-4), fr(1), fr(5)]];
  }
  G.register({
    tid: 'e46', ex: 46, star: true, topic: 3, sec: '3.3 · 3.4 (coordenades)',
    title: 'Treballar en coordenades a ℝ₃[x]', skill: 'Bases i coordenades en espais de polinomis',
    make(rng) {
      const a = rng.pick([1, 1, -1, 2]);
      const sp = Sp.Pn('R', 3);
      const gens = polyGensVanishing(rng, a);
      const parts = polyTasks(sp, gens, a);
      const sqTex = '(x' + (a > 0 ? '-' + a : '+' + (-a)) + ')^2';
      return {
        statement: 'Seleccioneu una base de l\'espai ' + m('\\mathbb{R}_3[x]') + ' i resoleu els exercicis següents treballant en coordenades:' + H.ul(['(a) Trobeu una base de ' + m('F=' + T.span(gens.map((g) => sp.tex(g)), '\\mathbb{R}')) + '. Comproveu que ' + m(sqTex) + ' pertany a ' + m('F') + ' i trobeu-ne les coordenades. Proveu que ' + m('F') + ' coincideix amb el subespai dels polinomis que s\'anul·len a ' + m('x=' + a) + '.', '(b) Trobeu una base de ' + m('V=\\{p\\in\\mathbb{R}_3[x]\\mid p(' + a + ')=0=p\'(' + a + ')\\}') + ' i amplieu-la a una base de ' + m('\\mathbb{R}_3[x]') + '.']),
        parts,
      };
    },
    original() {
      const F = QQ; const sp = Sp.Pn('R', 3);
      const gens = L.fromInts(F, [[-1, 0, 0, 1], [-1, 0, 1, 0], [-1, 1, 0, 0], [-2, -4, 1, 5]]);
      return {
        statement: 'Seleccioneu una base de l\'espai ' + m('\\mathbb{R}_3[x]') + ' format pels polinomis de grau ' + m('\\le3') + '. Resoleu els exercicis següents treballant en coordenades respecte de la base escollida.' + H.ul(['(a) Trobeu una base del subespai ' + m('F=\\langle x^3-1,\\ x^2-1,\\ x-1,\\ 5x^3+x^2-4x-2\\rangle_{\\mathbb{R}}') + '. Comproveu que ' + m('(x-1)^2') + ' pertany a ' + m('F') + ' i trobeu les seves coordenades respecte de la base trobada. Proveu que ' + m('F') + ' coincideix amb el subespai de ' + m('\\mathbb{R}_3[x]') + ' format per tots els polinomis que s\'anul·len per a ' + m('x=1') + '.', '(b) Trobeu una base del subespai ' + m('V=\\{p(x)\\in\\mathbb{R}_3[x]\\mid p(1)=0=p\'(1)\\}\\subseteq\\mathbb{R}_3[x]') + '. Amplieu la base de ' + m('V') + ' a una base de ' + m('\\mathbb{R}_3[x]') + '.']),
        parts: polyTasks(sp, gens, 1),
      };
    },
  });

  /* =====================================================================
     47 · C2[x] (no obligatori)
     ===================================================================== */
  G.register({
    tid: 'e47', ex: 47, star: false, topic: 3, sec: '3.4',
    title: 'Dimensió i base a ℂ₂[x]', skill: 'Coordenades amb polinomis complexos',
    make(rng) {
      const F = CC; const sp = Sp.Pn('C', 2);
      const gens = G.familyRank(F, rng, 4, 3, 2, { bound: 4, pIm: 0.5 });
      const t = spanTasks(sp, gens, null, { dim: true });
      return { statement: 'Treballant en coordenades respecte de la base canònica de ' + m('\\mathbb{C}_2[x]') + ', trobeu la dimensió i una base de ' + m('F=' + T.span(gens.map((g) => sp.tex(g)), '\\mathbb{C}')) + ' i amplieu-la a una base de ' + m('\\mathbb{C}_2[x]') + '.', parts: t.parts };
    },
    original() {
      const F = CC; const sp = Sp.Pn('C', 2);
      const gens = [[cx(1), cx(0), cx(1)], [cx(-1), cx(0), cx(-1)], [cx(0, -1), cx(1), cx(0)], [cx(-1), cx(0, -2), cx(1)]];
      const t = spanTasks(sp, gens, null, { dim: true });
      return { statement: 'Seleccioneu una base de l\'espai ' + m('\\mathbb{C}_2[x]') + '. Treballant en coordenades respecte d\'aquesta base, trobeu la dimensió i una base del subespai ' + m('F=\\langle x^2+1,\\ -1-x^2,\\ x-i,\\ (x-i)^2\\rangle_{\\mathbb{C}}') + ', i amplieu aquesta base de ' + m('F') + ' a una base de ' + m('\\mathbb{C}_2[x]') + '.', parts: t.parts, notes: H.tip(m('(x-i)^2=x^2-2ix-1') + ' ⇒ coordenades ' + m('(-1,-2i,1)') + '.') };
    },
  });

  /* =====================================================================
     48 · Subespai de M2(Q) donat per condicions
     ===================================================================== */
  const COND48 = [
    { t: 'la suma dels elements de la primera fila és 0', r: [1, 1, 0, 0] },
    { t: 'la suma dels elements de la primera columna és igual a la suma dels de la segona columna', r: [1, -1, 1, -1] },
    { t: 'la traça és 0', r: [1, 0, 0, 1] },
    { t: 'la matriu és simètrica', r: [0, 1, -1, 0] },
    { t: 'a_{11}=2a_{22}', r: [1, 0, 0, -2], math: true },
    { t: 'la suma de tots els elements és 0', r: [1, 1, 1, 1] },
    { t: 'la suma de la segona fila és 0', r: [0, 0, 1, 1] },
    { t: 'a_{12}=a_{11}+a_{21}', r: [-1, 1, -1, 0], math: true },
    { t: 'a_{21}=0', r: [0, 0, 1, 0], math: true },
  ];
  function matTasks(sp, A, u, condTexts) {
    const F = sp.F;
    const W = Sub.fromEqs(F, A, 4);
    const ns = G.nullSol(F, A, ['a_{11}', 'a_{12}', 'a_{21}', 'a_{22}'], { sp });
    const ourB = ns.scaled;
    let sol = G.coordIntro(sp) + H.P('Una matriu ' + m('\\begin{pmatrix}a_{11}&a_{12}\\\\a_{21}&a_{22}\\end{pmatrix}') + ' té coordenades ' + m('(a_{11},a_{12},a_{21},a_{22})') + '. Les condicions són:' + dm(T.system(F, A, null, ['a_{11}', 'a_{12}', 'a_{21}', 'a_{22}']))) + ns.html;
    const parts = [];
    parts.push(dimPart('dim', W.dim, '(a) ' + m('\\dim V') + ' =', H.P(m('\\dim V=4-\\operatorname{rang}=4-' + (4 - W.dim) + '=' + W.dim) + '.')));
    parts.push(basisPart('a', sp, W, '(a) Una base de ' + m('V') + ':', sol, { refBasis: ourB }));
    if (u) parts.push(coordsPart('c', sp, W, u, 'a', ourB, '(b) Coordenades de ' + m('u') + ' respecte de la teva base de ' + m('V') + ':'));
    return parts;
  }
  G.register({
    tid: 'e48', ex: 48, star: true, topic: 3, sec: '3.3 · 3.4 (coordenades)',
    title: 'Subespai de matrius donat per condicions', skill: 'Bases i coordenades a M₂(ℚ)',
    make(rng) {
      const F = QQ; const sp = Sp.Mmn('Q', 2, 2);
      let conds, A;
      for (;;) { conds = rng.sample(COND48, 2); A = conds.map((c) => c.r.map((x) => fr(x))); if (L.rank(F, A) === 2) break; }
      const W = Sub.fromEqs(F, A, 4);
      let u;
      for (let t = 0; ; t++) { u = L.clearDen(F, L.combo(F, G.smallCoefs(F, rng, W.dim, { allNonzero: true }), W.basis)); if ((G.maxAbs(F, [u]) <= 9 && u.filter((a) => !a.isZero()).length >= (t < 30 ? 3 : 2)) || t > 80) break; }
      const ct = conds.map((c) => (c.math ? m(c.t) : c.t));
      return {
        statement: 'Seleccioneu una base de ' + m('M_2(\\mathbb{Q})') + ' i treballeu en coordenades.' + H.ul(['(a) Trobeu la dimensió i una base del subespai ' + m('V') + ' format per les matrius que satisfan: ' + ct.join(' i, simultàniament, ') + '.', '(b) Comproveu que ' + m('u=' + sp.tex(u)) + ' pertany a ' + m('V') + ' i calculeu les seves coordenades respecte de la base de ' + m('V') + ' trobada.']),
        parts: matTasks(sp, A, u),
      };
    },
    original() {
      const F = QQ; const sp = Sp.Mmn('Q', 2, 2);
      const A = [[1, 1, 0, 0], [1, -1, 1, -1]].map((r) => r.map((x) => fr(x)));
      const u = [fr(-3), fr(3), fr(8), fr(2)];
      return {
        statement: 'Seleccioneu una base de l\'espai ' + m('M_2(\\mathbb{Q})') + ' i resoleu les qüestions següents treballant en coordenades respecte de la base escollida.' + H.ul(['(a) Trobeu la dimensió i una base del subespai ' + m('V') + ' format per les matrius que satisfan: la suma dels elements de la primera fila = 0 i, simultàniament, la suma dels elements de la primera columna = la suma dels elements de la segona columna.', '(b) Clarament, la matriu ' + m('u=\\begin{pmatrix}-3&3\\\\8&2\\end{pmatrix}') + ' pertany al subespai ' + m('V') + '. Calculeu les coordenades de ' + m('u') + ' respecte de la base de ' + m('V') + ' que heu trobat.']),
        parts: matTasks(sp, A, u),
      };
    },
  });

  /* =====================================================================
     49 · M2x3(Z2) (no obligatori)
     ===================================================================== */
  G.register({
    tid: 'e49', ex: 49, star: false, topic: 3, sec: '3.4',
    title: 'Subespai de M₂ₓ₃(ℤ₂)', skill: 'Bases i coordenades sobre ℤ₂',
    make(rng) {
      const F = Z2; const sp = Sp.Mmn('Z2', 2, 3);
      const gens = G.familyRank(F, rng, 4, 6, rng.pick([2, 3]), {});
      const W = Sub.fromGens(F, gens, 6);
      const idx = L.maximalSubfamily(F, gens).idx;
      const u = L.combo(F, idx.map(() => 1), idx.map((i) => gens[i]));
      const t = spanTasks(sp, gens, u, { dim: true, extend: false, contain: false, lc: '' });
      return { statement: 'Treballant en coordenades respecte de la base canònica de ' + m('M_{2\\times3}(\\mathbb{Z}_2)') + ', trobeu la dimensió i una base de ' + m('F=' + T.span(gens.map((g) => sp.tex(g)), '\\mathbb{Z}_2')) + '. Comproveu que ' + m('U=' + sp.tex(u)) + ' pertany a ' + m('F') + ' i trobeu les seves coordenades respecte de la base trobada.', parts: t.parts };
    },
    original() {
      const F = Z2; const sp = Sp.Mmn('Z2', 2, 3);
      const gens = [[1, 1, 1, 0, 1, 1], [1, 1, 1, 1, 0, 1], [0, 0, 0, 1, 1, 0], [0, 0, 1, 0, 0, 1]];
      const u = [1, 1, 0, 1, 0, 0];
      const t = spanTasks(sp, gens, u, { dim: true, extend: false, contain: false, lc: '' });
      return { statement: 'Seleccioneu una base de l\'espai ' + m('M_{2\\times3}(\\mathbb{Z}_2)') + '. Treballant en coordenades respecte d\'aquesta base, trobeu la dimensió i una base del subespai ' + m('F=\\left\\langle\\begin{pmatrix}1&1&1\\\\0&1&1\\end{pmatrix},\\begin{pmatrix}1&1&1\\\\1&0&1\\end{pmatrix},\\begin{pmatrix}0&0&0\\\\1&1&0\\end{pmatrix},\\begin{pmatrix}0&0&1\\\\0&0&1\\end{pmatrix}\\right\\rangle_{\\mathbb{Z}_2}') + '. Comproveu que ' + m('U=\\begin{pmatrix}1&1&0\\\\1&0&0\\end{pmatrix}') + ' pertany a ' + m('F') + ' i trobeu les seves coordenades respecte de la base trobada.', parts: t.parts };
    },
  });

  EV.T3B = { spanTasks, eqTasks, basisPart, dimPart, extendPart, coordsPart, containPart, sysTex };
})(window.EV = window.EV || {});
