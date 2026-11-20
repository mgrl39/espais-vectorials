/* ============================================================
   Tema 3 · Generadors: aplicacions lineals
   (50 linealitat, 51/52 imatges i antiimatges, 53 matriu,
    54 girs, 55/56/57 nucli i imatge, 58/59 nucli dins G)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S, G = EV.G, C = EV.C, Sp = EV.Sp, Sub = EV.Sub;
  const { m, dm } = H;
  const QQ = EV.QQ, CC = EV.CC, Z2 = EV.Z2;
  const fr = EV.fr, cx = EV.cx;
  const VARS = ['x', 'y', 'z', 't', 'u'];
  const B3 = EV.T3B;

  const spaceName = (sym, n) => (sym === 'Z2' ? '(\\mathbb{Z}_2)^{' + n + '}' : Sp.CAN[sym] + '^{' + n + '}');
  function formula(F, A, vars) {
    vars = vars || VARS.slice(0, A[0].length);
    return 'f(' + vars.join(',') + ')=(' + A.map((r) => T.linexpr(F, r, vars)).join(',\\ ') + ')';
  }
  function mapTex(F, sym, A, name) {
    const n = A[0].length, mm = A.length;
    return (name || 'f') + '\\colon ' + spaceName(sym, n) + '\\to ' + spaceName(sym, mm) + ',\\quad ' + formula(F, A).replace(/^f/, name || 'f');
  }

  /* =====================================================================
     50 · Quines aplicacions són lineals?
     ===================================================================== */
  function linMaps(rng) {
    const F = QQ;
    const A = G.rankMatrix(F, rng, 2, 3, 2, { bound: 4, noZeroRows: true });
    const c = rng.nz(-3, 3);
    const Aff = A.map((r) => r.slice());
    return [
      { tex: mapTex(F, 'R', A), t: true, w: 'Cada component és una combinació lineal de ' + m('x,y,z') + ' sense terme independent ⇒ ' + m('f(v)=Av') + ' per a una matriu ' + m('A') + ', i tota aplicació d\'aquest tipus és lineal.' },
      { tex: 'f\\colon\\mathbb{R}^3\\to\\mathbb{R}^2,\\ f(x,y,z)=(' + T.linexpr(F, Aff[0], VARS) + (c > 0 ? '+' : '') + c + ',\\ ' + T.linexpr(F, Aff[1], VARS) + ')', t: false, w: m('f(0,0,0)=(' + c + ',0)\\neq(0,0)') + '. Tota aplicació lineal compleix ' + m('f(0)=0') + '.' },
      { tex: 'f\\colon\\mathbb{Q}^2\\to\\mathbb{Q}^2,\\ f(x,y)=(xy,\\ x-y)', t: false, w: m('f(1,1)=(1,0)') + ' però ' + m('f(2,2)=(4,0)\\neq 2f(1,1)=(2,0)') + '. El producte ' + m('xy') + ' no és lineal.' },
      { tex: 'f\\colon\\mathbb{R}^2\\to\\mathbb{R},\\ f(x,y)=e^{x+y}', t: false, w: m('f(0,0)=e^0=1\\neq0') + '.' },
      { tex: 'f\\colon(\\mathbb{Z}_2)^2\\to\\mathbb{Z}_2,\\ f(x,y)=x+y', t: true, w: 'És de la forma ' + m('f(v)=Av') + ' amb ' + m('A=(1\\ 1)') + '.' },
      { tex: 'f\\colon\\mathbb{Z}_2\\to\\mathbb{Z}_2,\\ f(x)=x^2', t: true, w: 'A ' + m('\\mathbb{Z}_2') + ', ' + m('0^2=0,\\ 1^2=1') + ': ' + m('f(x)=x') + ' és la identitat, que és lineal.' },
      { tex: 'f\\colon(\\mathbb{Z}_2)^2\\to\\mathbb{Z}_2,\\ f(x,y)=xy', t: false, w: m('f(1,0)+f(0,1)=0+0=0') + ' però ' + m('f((1,0)+(0,1))=f(1,1)=1') + '.' },
      { tex: 'f\\colon\\mathbb{C}\\to\\mathbb{C}^3,\\ f(x)=(-x,\\ 0,\\ 3ix)', t: true, w: 'És ' + m('x\\mapsto x\\cdot(-1,0,3i)') + ': matriu ' + m('3\\times1') + ' amb entrades ' + m('-1,0,3i') + '.' },
      { tex: 'f\\colon\\mathbb{C}\\to\\mathbb{C},\\ f(z)=\\overline{z}', t: false, w: 'Com a aplicació ' + m('\\mathbb{C}') + '-lineal falla: ' + m('f(i\\cdot1)=-i\\neq i\\,f(1)=i') + '. (Com a ' + m('\\mathbb{R}') + '-lineal sí que ho és.)' },
      { tex: 'f\\colon\\mathbb{R}[x]\\to\\mathbb{R}[x],\\ f(p(x))=p\'(x)', t: true, w: m('(p+q)\'=p\'+q\'') + ' i ' + m('(ap)\'=ap\'') + '.' },
      { tex: 'f\\colon\\mathbb{R}[x]\\to\\mathbb{R}[x],\\ f(p(x))=p(x)+1', t: false, w: m('f(0)=1\\neq0') + '.' },
      { tex: 'f\\colon\\mathbb{R}[x]\\to\\mathbb{R}[x],\\ f(p(x))=x\\,p(x)', t: true, w: m('x(p+q)=xp+xq') + ' i ' + m('x(ap)=a(xp)') + '.' },
      { tex: 'f\\colon\\mathbb{R}[x]\\to\\mathbb{R}[x],\\ f(p(x))=p(x+1)', t: true, w: 'Substituir és compatible amb sumes i escalars: ' + m('(p+q)(x+1)=p(x+1)+q(x+1)') + '.' },
      { tex: 'f\\colon\\mathbb{R}[x]\\to\\mathbb{R}[x],\\ f(p(x))=p(x)^2', t: false, w: m('f(2)=4\\neq2f(1)=2') + '.' },
      { tex: 'f\\colon M_2(\\mathbb{R})\\to\\mathbb{R}^2,\\ f(A)=(a_{22}-\\sqrt2a_{11},\\ 7a_{22})', t: true, w: 'Les components són combinacions lineals de les entrades (els coeficients poden ser qualsevol real, també ' + m('\\sqrt2') + ').' },
      { tex: 'f\\colon M_n(\\mathbb{Z}_2)\\to M_n(\\mathbb{Z}_2),\\ f(X)=X^t', t: true, w: m('(X+Y)^t=X^t+Y^t') + ' i ' + m('(aX)^t=aX^t') + '.' },
      { tex: '\\det\\colon M_n(\\mathbb{Q})\\to\\mathbb{Q}\\ (n\\ge2)', t: false, w: m('\\det(2I_n)=2^n\\neq2=2\\det(I_n)') + '. (També ' + m('\\det(I)+\\det(-I)\\neq\\det(0)') + ' per a ' + m('n') + ' parell.) Per a ' + m('n=1') + ' sí que seria lineal.' },
      { tex: '\\operatorname{tr}\\colon M_n(\\mathbb{R})\\to\\mathbb{R}', t: true, w: 'La traça és la suma de la diagonal: ' + m('\\operatorname{tr}(A+B)=\\operatorname{tr}A+\\operatorname{tr}B') + ', ' + m('\\operatorname{tr}(aA)=a\\operatorname{tr}A') + '.' },
      { tex: 'f\\colon M_2(\\mathbb{R})\\to M_2(\\mathbb{R}),\\ f(X)=X^2', t: false, w: m('f(2I)=4I\\neq2f(I)=2I') + '.' },
      { tex: 'f\\colon\\mathbb{R}\\to\\mathbb{R},\\ f(x)=|x|', t: false, w: m('f(-1)=1\\neq -f(1)=-1') + '.' },
      { tex: 'f\\colon\\mathbb{R}^2\\to\\mathbb{R}^2,\\ f(x,y)=(y,\\ x)', t: true, w: 'Matriu ' + m('\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}') + '.' },
      { tex: 'f\\colon\\mathbb{R}^2\\to\\mathbb{R}^3,\\ f(x,y)=(0,\\ y+1,\\ x-y)', t: false, w: m('f(0,0)=(0,1,0)\\neq0') + '.' },
    ];
  }
  function linPart(it, i) {
    return { id: 'f' + i, kind: 'choice', label: m(it.tex), options: [{ v: 'si', label: 'Lineal' }, { v: 'no', label: 'No lineal' }], check: (v) => ((v === 'si') === it.t ? EV.ok() : EV.bad()), ref: it.t ? 'si' : 'no', sol: H.P('<b>' + (it.t ? 'És lineal.' : 'No és lineal.') + '</b> ' + it.w) };
  }
  G.register({
    tid: 'e50', ex: 50, star: true, topic: 3, sec: '3.6',
    title: 'Quines aplicacions són lineals?', skill: 'Reconèixer aplicacions lineals',
    make(rng) {
      const pool = linMaps(rng);
      const items = rng.sample(pool, 6);
      return { statement: 'Determineu quines de les aplicacions següents són lineals:', parts: items.map(linPart), intro: H.box('tip', 'Com es fa', H.ul(['Lineal ⇔ ' + m('f(u+v)=f(u)+f(v)') + ' i ' + m('f(au)=af(u)') + '.', 'Primer test ràpid: ' + m('f(0)=0') + '? Si no, no és lineal.', 'Components que són combinacions lineals de les variables (sense constants, productes, potències...) ⇒ lineal.', 'Per dir NO: un contraexemple numèric.'])) };
    },
    original() {
      const rng = EV.makeRng(1);
      const pool = linMaps(rng);
      const pick = (s) => pool.find((x) => x.tex.includes(s));
      const items = [
        pick('(0,\\ y+1'),
        pick('(xy,'),
        { tex: 'f_3\\colon\\mathbb{R}^3\\to\\mathbb{R}^2,\\ f_3(x,y,z)=(3x-z,\\ 2x+z)', t: true, w: 'Components combinació lineal de les variables: ' + m('f_3(v)=\\begin{pmatrix}3&0&-1\\\\2&0&1\\end{pmatrix}v') + '.' },
        pick('e^{x+y}'), pick('f(x,y)=x+y'), pick('3ix'), pick('p\'(x)'), pick('\\sqrt2'), pick('X^t'), pick('\\det'),
      ];
      return { statement: 'Determineu quines de les aplicacions següents són lineals:', parts: items.map((it, i) => linPart(Object.assign({}, it, { tex: it.tex.replace(/^f\\colon/, 'f_{' + (i + 1) + '}\\colon') }), i)) };
    },
  });

  /* =====================================================================
     51 · f(u), f^{-1}({v}), matriu
     ===================================================================== */
  function preimageTasks(F, sym, A, u, vs, opts) {
    opts = opts || {};
    const n = A[0].length, mm = A.length;
    const parts = [];
    const fu = L.mulVec(F, A, u);
    parts.push({ id: 'fu', kind: 'vector', F, n: mm, label: m('f' + T.vec(F, u)) + ' =', check: (v) => C.eqVec(F, v, fu), ref: S.vecStr(F, fu), sol: H.P('Substituïm a la fórmula: ' + m('f' + T.vec(F, u) + '=(' + A.map((r) => T.linexpr(F, r, u.map((a) => G.paren(F, a))).replace(/([0-9}])\(/g, '$1\\cdot(')).join(',\\ ') + ')=' + T.vec(F, fu))) });
    parts.push({ id: 'A', kind: 'matrix', F, m: mm, n, label: 'Matriu ' + m('A\\in M_{' + mm + '\\times' + n + '}') + ' tal que ' + m('f(v)=Av') + ':', check: (M) => C.eqMat(F, M, A), ref: S.matStr(F, A), sol: H.P('La fila ' + m('i') + ' de ' + m('A') + ' són els coeficients de la component ' + m('i') + ' (equivalentment, la columna ' + m('j') + ' és ' + m('f(e_j)') + '):') + dm('A=' + T.matrix(F, A)) });
    const W = Sub.fromEqs(F, A, n);
    const ns = G.nullSol(F, A, VARS.slice(0, n));
    parts.push(B3.basisPart('ker', Sp.Kn(sym, n), W, 'Una base de ' + m('\\operatorname{Ker} f=f^{-1}(\\{0\\})') + ' (deixa-ho buit si és ' + m('\\{0\\}') + '):', ns.html, { refBasis: ns.scaled || ns.basis }));
    vs.forEach((v, k) => {
      const s = L.solve(F, A, v);
      const nonEmpty = s.type !== 'SI';
      let sol = H.P(m('f^{-1}(\\{v\\})=\\{x\\mid Ax=v\\}') + ': resolem el sistema amb matriu ampliada ' + m('(A\\mid v)') + ':') + H.chain(F, s.rr, { aug: 1 });
      if (!nonEmpty) sol += H.P('Sistema incompatible ⇒ ' + m('v\\notin\\operatorname{Im}f') + '.') + H.ans(m('f^{-1}(\\{' + T.vec(F, v) + '\\})=\\emptyset'));
      else {
        sol += H.P('Compatible. Solució particular ' + m('p=' + T.vec(F, s.sol)) + ' i ' + m('f^{-1}(\\{v\\})=p+\\operatorname{Ker}f') + ':');
        sol += H.ans(m('f^{-1}(\\{' + T.vec(F, v) + '\\})=' + T.vec(F, s.sol) + (s.dirs.length ? '+' + T.span(s.dirs.map((d) => T.vec(F, L.clearDen(F, d)))) : '')));
        if (L.isZeroV(F, v)) sol += H.tip(m('f^{-1}(\\{0\\})=\\operatorname{Ker} f') + ', que sempre conté el 0.');
      }
      parts.push({
        id: 'pre' + k, kind: 'yesplus', label: 'És ' + m('f^{-1}(\\{' + T.vec(F, v) + '\\})') + ' no buit? Si ho és, dona un vector ' + m('p') + ' amb ' + m('f(p)=' + T.vec(F, v)) + '.', F, options: G.YN,
        text: { kind: 'vector', F, n, placeholder: '(1, 0, 0, 0)' }, textLabel: 'Vector p',
        check: (val) => {
          if (val.yes !== nonEmpty) return EV.bad(nonEmpty ? 'Sí que n\'hi ha.' : 'És buit: el sistema és incompatible.');
          if (!nonEmpty) return EV.ok();
          return L.eqV(F, L.mulVec(F, A, val.val), v) ? EV.ok() : EV.bad('f(p) no dóna v.');
        },
        ref: nonEmpty ? { yes: 'si', text: S.vecStr(F, s.sol) } : { yes: 'no' }, sol,
      });
    });
    return parts;
  }
  G.register({
    tid: 'e51', ex: 51, star: true, topic: 3, sec: '3.6',
    title: 'Imatges, antiimatges i matriu d\'una aplicació', skill: 'f(u), f⁻¹({v}) = p + Ker f, matriu associada',
    make(rng) {
      const F = QQ;
      const r = rng.pick([2, 2, 3]);
      const A = G.rankMatrix(F, rng, 3, 4, r, { bound: 7, noZeroRows: true, noZeroCols: true });
      const u = [fr(rng.int(-2, 3)), fr(rng.int(-2, 3)), fr(rng.int(-1, 4)), fr(rng.int(-1, 4))];
      const inIm = L.mulVec(F, A, [fr(rng.int(-1, 1)), fr(1), fr(rng.int(-1, 1)), fr(0)]);
      let out = inIm.map((a, i) => (i === 2 ? a.add(fr(1)) : a));
      if (r === 3) out = inIm.map((a) => a.neg());
      const vs = rng.shuffle([inIm, out]).concat([[fr(0), fr(0), fr(0)]]);
      return {
        statement: 'Sigui ' + m('f\\colon\\mathbb{Q}^4\\to\\mathbb{Q}^3') + ' l\'aplicació lineal ' + dm(formula(F, A)) + 'Calculeu ' + m('f' + T.vec(F, u)) + ', trobeu la matriu ' + m('A') + ' de ' + m('f') + ' i determineu els conjunts ' + vs.map((v) => m('f^{-1}(\\{' + T.vec(F, v) + '\\})')).join(', ') + '.',
        parts: preimageTasks(F, 'Q', A, u, vs),
      };
    },
    original() {
      const F = QQ;
      const A = L.fromInts(F, [[1, 1, 1, 1], [1, -2, 0, -1], [1, 7, 3, 5]]);
      const vs = L.fromInts(F, [[1, 1, 0], [-1, -1, 0], [0, 0, 0], [0, -1, 2]]);
      return {
        statement: 'Sigui ' + m('f\\colon\\mathbb{Q}^4\\to\\mathbb{Q}^3') + ' l\'aplicació lineal donada per ' + dm('f(x,y,z,t)=(x+y+z+t,\\ x-2y-t,\\ x+7y+3z+5t).') + 'Calculeu ' + m('f(1,2,3,4)') + ' i determineu els conjunts ' + m('f^{-1}(\\{v_1\\}),f^{-1}(\\{v_2\\}),f^{-1}(\\{v_3\\}),f^{-1}(\\{v_4\\})') + ' si ' + m('v_1=(1,1,0),\\ v_2=-v_1,\\ v_3=(0,0,0),\\ v_4=(0,-1,2)') + '. Trobeu una matriu ' + m('A\\in M_{3\\times4}(\\mathbb{Q})') + ' tal que ' + m('f') + ' coincideixi amb ' + m('v\\mapsto Av') + '.',
        parts: preimageTasks(F, 'Q', A, L.fromInts(F, [[1, 2, 3, 4]])[0], vs),
        notes: H.tip('Fixa\'t que la tercera component és ' + m('3\\cdot') + '(primera) ' + m('-2\\cdot') + '(segona): ' + m('\\operatorname{rang}A=2') + ', ' + m('\\operatorname{Im}f') + ' és un pla de ' + m('\\mathbb{Q}^3') + ' i ' + m('\\dim\\operatorname{Ker}f=4-2=2') + '.'),
      };
    },
  });

  /* =====================================================================
     52 · Antiimatge d'un subespai (no obligatori)
     ===================================================================== */
  function preimSubspaceTasks(F, A, u, Wgens) {
    const n = A[0].length, mm = A.length;
    const parts = [];
    const fu = L.mulVec(F, A, u);
    parts.push({ id: 'fu', kind: 'vector', F, n: mm, label: m('f' + T.vec(F, u)) + ' =', check: (v) => C.eqVec(F, v, fu), ref: S.vecStr(F, fu), sol: H.P(m('A' + T.colvec(F, u) + '=' + T.colvec(F, fu))) });
    Wgens.forEach((wg, k) => {
      const E = L.implicitEqs(F, wg.filter((w) => !L.isZeroV(F, w)), mm); // equacions de W
      const EA = E.length ? L.mul(F, E, A) : [];
      const P_ = EA.length ? Sub.fromEqs(F, EA, n) : Sub.fromGens(F, L.identity(F, n), n);
      let sol = H.P(m('x\\in f^{-1}(W)\\iff Ax\\in W') + '. Equacions de ' + m('W=' + T.span(wg.map((w) => T.vec(F, w)))) + ': ' + (E.length ? m(E.map((r) => T.linexpr(F, r, ['y_1', 'y_2', 'y_3'].slice(0, mm)) + '=0').join(',\\ ')) : 'cap (és tot l\'espai)') + '. Substituint ' + m('y=Ax') + ':');
      if (EA.length) sol += G.nullSol(F, EA, VARS.slice(0, n)).html;
      parts.push(B3.basisPart('w' + k, Sp.Kn('R', n), P_, 'Una base de ' + m('f^{-1}\\left(' + T.span(wg.map((w) => T.vec(F, w))) + '\\right)') + ':', sol));
    });
    parts.push({ id: 'forms', kind: 'matrix', F, m: mm, n, label: 'Coeficients de les formes lineals ' + m('\\ell_1,\\ell_2') + ' (una fila per forma):', check: (M) => C.eqMat(F, M, A), ref: S.matStr(F, A), sol: H.P('Les formes lineals són les files: ' + A.map((r, i) => m('\\ell_' + (i + 1) + '(x,y,z)=' + T.linexpr(F, r, VARS))).join(', ') + '.') });
    return parts;
  }
  G.register({
    tid: 'e52', ex: 52, star: false, topic: 3, sec: '3.6',
    title: 'Antiimatge d\'un subespai', skill: 'f⁻¹(W) i formes lineals',
    make(rng) {
      const F = QQ; const A = G.rankMatrix(F, rng, 2, 3, 2, { bound: 4, noZeroRows: true });
      const u = [fr(rng.int(-2, 3)), fr(rng.int(-2, 2)), fr(rng.int(-1, 3))];
      const w = [fr(rng.nz(-2, 2)), fr(rng.nz(-2, 2))];
      return { statement: 'Sigui ' + m('f\\colon\\mathbb{R}^3\\to\\mathbb{R}^2,\\ v\\mapsto ' + T.matrix(F, A) + 'v') + '. Calculeu ' + m('f' + T.vec(F, u)) + ' i determineu ' + m('f^{-1}(B_1)') + ' i ' + m('f^{-1}(B_2)') + ' on ' + m('B_1=\\langle' + T.vec(F, w) + '\\rangle') + ' i ' + m('B_2=\\langle(0,0)\\rangle') + '. Trobeu formes lineals ' + m('\\ell_1,\\ell_2') + ' amb ' + m('f=(\\ell_1,\\ell_2)') + '.', parts: preimSubspaceTasks(F, A, u, [[w], [[fr(0), fr(0)]]]) };
    },
    original() {
      const F = QQ; const A = L.fromInts(F, [[-1, 2, 1], [3, 0, -2]]);
      return { statement: 'Sigui ' + m('f\\colon\\mathbb{R}^3\\to\\mathbb{R}^2') + ' determinada per ' + m('v\\mapsto\\begin{pmatrix}-1&2&1\\\\3&0&-2\\end{pmatrix}v') + '. Calculeu ' + m('f(3,-1,2)') + ' i determineu ' + m('f^{-1}(B_1)') + ' i ' + m('f^{-1}(B_2)') + ' on ' + m('B_1=\\langle(1,-1)\\rangle') + ' i ' + m('B_2=\\langle(0,0)\\rangle') + '. Trobeu formes lineals ' + m('\\ell_1,\\ell_2') + ' tals que ' + m('f=(\\ell_1,\\ell_2)') + '.', parts: preimSubspaceTasks(F, A, [fr(3), fr(-1), fr(2)], [[[fr(1), fr(-1)]], [[fr(0), fr(0)]]]) };
    },
  });

  /* =====================================================================
     53 · Matriu a partir de les imatges d'una base
     ===================================================================== */
  G.register({
    tid: 'e53', ex: 53, star: true, topic: 3, sec: '3.6 · 3.7',
    title: 'Matriu d\'una aplicació a partir de les imatges', skill: 'Una aplicació lineal queda determinada per les imatges d\'una base',
    variants: [{ v: 'can', label: 'Imatges de la base canònica' }, { v: 'base', label: 'Imatges d\'una altra base' }],
    make(rng, opts) {
      const F = QQ;
      const variant = (opts && opts.variant) || rng.pick(['can', 'can', 'base']);
      const n = 2, mm = 3;
      const A = Array.from({ length: mm }, () => Array.from({ length: n }, () => fr(rng.int(-5, 9))));
      if (variant === 'can') {
        const p = [fr(rng.int(-3, 3)), fr(rng.int(-3, 3))];
        const fp = L.mulVec(F, A, p);
        const cols = L.transpose(A);
        return {
          statement: 'Sabem que una aplicació lineal ' + m('f\\colon\\mathbb{R}^2\\to\\mathbb{R}^3') + ' satisfà ' + m('f(1,0)=' + T.vec(F, cols[0]) + ',\\quad f(0,1)=' + T.vec(F, cols[1])) + '. Trobeu formes lineals ' + m('\\ell_1,\\ell_2,\\ell_3') + ' amb ' + m('f=(\\ell_1,\\ell_2,\\ell_3)') + ', la matriu ' + m('A\\in M_{3\\times2}(\\mathbb{R})') + ' de ' + m('f') + ' i ' + m('f' + T.vec(F, p)) + '.',
          parts: [
            { id: 'A', kind: 'matrix', F, m: mm, n, label: m('A') + ' =', check: (M) => C.eqMat(F, M, A), ref: S.matStr(F, A), sol: H.P('Per linealitat ' + m('f(x,y)=x\\,f(1,0)+y\\,f(0,1)') + ': les <b>columnes</b> de ' + m('A') + ' són ' + m('f(e_1)') + ' i ' + m('f(e_2)') + '.') + dm('A=' + T.matrix(F, A)) + H.P('Formes lineals (files): ' + A.map((r, i) => m('\\ell_' + (i + 1) + '(x,y)=' + T.linexpr(F, r, VARS))).join(', ') + '.') + H.warn('Error típic: posar ' + m('f(e_j)') + ' en <b>files</b>. Van en columnes!') },
            { id: 'fp', kind: 'vector', F, n: mm, label: m('f' + T.vec(F, p)) + ' =', check: (v) => C.eqVec(F, v, fp), ref: S.vecStr(F, fp), sol: H.P(m('f' + T.vec(F, p) + '=' + G.paren(F, p[0]) + T.vec(F, cols[0]) + '+' + G.paren(F, p[1]) + T.vec(F, cols[1]) + '=' + T.vec(F, fp))) },
          ],
        };
      }
      // imatges d'una base no canònica
      const U = G.unimodular(F, rng, 2, { bound: 3, ops: 3 }); // columnes = u1, u2
      const us = L.transpose(U);
      const W = L.mul(F, A, U); const ws = L.transpose(W);
      const Uinv = L.inverse(F, U).inv;
      return {
        statement: 'Una aplicació lineal ' + m('f\\colon\\mathbb{R}^2\\to\\mathbb{R}^3') + ' satisfà ' + m('f' + T.vec(F, us[0]) + '=' + T.vec(F, ws[0]) + ',\\quad f' + T.vec(F, us[1]) + '=' + T.vec(F, ws[1])) + '. Trobeu la matriu ' + m('A') + ' de ' + m('f') + ' (en bases canòniques).',
        parts: [{
          id: 'A', kind: 'matrix', F, m: mm, n, label: m('A') + ' =', check: (M) => C.eqMat(F, M, A), ref: S.matStr(F, A),
          sol: H.P('Com que ' + m(T.vec(F, us[0]) + ',' + T.vec(F, us[1])) + ' és base, ' + m('f') + ' queda determinada. Si ' + m('U') + ' té ' + m('u_1,u_2') + ' en columnes i ' + m('W') + ' té les imatges en columnes, ' + m('AU=W') + ' ⇒ ' + m('A=WU^{-1}') + '.') + dm('U=' + T.matrix(F, U) + ',\\quad U^{-1}=' + T.matrix(F, Uinv) + ',\\quad A=' + T.matrix(F, W) + T.matrix(F, Uinv) + '=' + T.matrix(F, A)) + H.tip('Alternativa: escriure ' + m('e_1') + ' i ' + m('e_2') + ' com a combinació de ' + m('u_1,u_2') + ' (columnes de ' + m('U^{-1}') + ') i aplicar linealitat.'),
        }],
      };
    },
    original() {
      return {
        statement: 'Sabem que una aplicació lineal ' + m('f\\colon\\mathbb{R}^2\\to\\mathbb{R}^3') + ' satisfà ' + m('f(1,0)=(2,-5,9),\\quad f(0,1)=(3,-\\sqrt2,0)') + '. Trobeu formes lineals ' + m('\\ell_1(x,y),\\ell_2(x,y),\\ell_3(x,y)') + ' tals que ' + m('f(x,y)=(\\ell_1,\\ell_2,\\ell_3)') + '. Trobeu una matriu ' + m('A\\in M_{3\\times2}(\\mathbb{R})') + ' tal que ' + m('f') + ' coincideix amb ' + m('v\\mapsto Av') + '.',
        parts: [{
          id: 'A', kind: 'choice', label: 'Quina és la matriu ' + m('A') + '?', options: [{ v: 'a', label: '\\(\\begin{pmatrix}2&3\\\\-5&-\\sqrt2\\\\9&0\\end{pmatrix}\\)' }, { v: 'b', label: '\\(\\begin{pmatrix}2&-5&9\\\\3&-\\sqrt2&0\\end{pmatrix}\\)' }, { v: 'c', label: '\\(\\begin{pmatrix}3&2\\\\-\\sqrt2&-5\\\\0&9\\end{pmatrix}\\)' }],
          check: (v) => (v === 'a' ? EV.ok() : EV.bad(v === 'b' ? 'Has posat les imatges en files: han d\'anar en columnes (i A ha de ser 3×2).' : 'L\'ordre de les columnes és f(e₁), f(e₂).')), ref: 'a',
          sol: H.P(m('f(x,y)=x f(1,0)+y f(0,1)=x(2,-5,9)+y(3,-\\sqrt2,0)=(2x+3y,\\ -5x-\\sqrt2y,\\ 9x)') + '.') + H.P('Formes lineals: ' + m('\\ell_1=2x+3y,\\ \\ell_2=-5x-\\sqrt2y,\\ \\ell_3=9x') + '.') + dm('A=\\begin{pmatrix}2&3\\\\-5&-\\sqrt2\\\\9&0\\end{pmatrix}'),
        }],
      };
    },
  });

  /* =====================================================================
     54 · Girs (no obligatori) — només l'original
     ===================================================================== */
  G.register({
    tid: 'e54', ex: 54, star: false, topic: 3, sec: '3.6', noGen: true,
    title: 'Girs del pla i fórmules trigonomètriques', skill: 'Composició = producte de matrius',
    original() {
      const sol1 = H.P(m('A(\\alpha)A(-\\alpha)=\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha\\\\\\sin\\alpha&\\cos\\alpha\\end{pmatrix}\\begin{pmatrix}\\cos\\alpha&\\sin\\alpha\\\\-\\sin\\alpha&\\cos\\alpha\\end{pmatrix}=\\begin{pmatrix}\\cos^2\\alpha+\\sin^2\\alpha&0\\\\0&\\sin^2\\alpha+\\cos^2\\alpha\\end{pmatrix}=I') + ' (usant ' + m('\\cos(-\\alpha)=\\cos\\alpha,\\ \\sin(-\\alpha)=-\\sin\\alpha') + '). ' + m('\\det A(\\alpha)=1\\neq0') + '.');
      const sol2 = H.P(m('A(\\alpha)^2=\\begin{pmatrix}\\cos^2\\alpha-\\sin^2\\alpha&-2\\sin\\alpha\\cos\\alpha\\\\2\\sin\\alpha\\cos\\alpha&\\cos^2\\alpha-\\sin^2\\alpha\\end{pmatrix}=A(2\\alpha)') + ' ⇒ ' + m('\\cos2\\alpha=\\cos^2\\alpha-\\sin^2\\alpha,\\quad\\sin2\\alpha=2\\sin\\alpha\\cos\\alpha') + '.');
      const sol3 = H.P(m('A(\\alpha)A(\\beta)=A(\\alpha+\\beta)') + '; comparant la primera columna: ' + m('\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta,\\quad\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta') + '.');
      const ch = (id, label, ok, opts, sol) => ({ id, kind: 'choice', label, options: opts, check: (v) => (v === ok ? EV.ok() : EV.bad()), ref: ok, sol });
      return {
        statement: 'Sigui ' + m('\\alpha\\in\\mathbb{R}') + '. L\'aplicació ' + m('\\mathbb{R}^2\\to\\mathbb{R}^2,\\ v\\mapsto A(\\alpha)v') + ' amb ' + m('A(\\alpha)=\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha\\\\\\sin\\alpha&\\cos\\alpha\\end{pmatrix}') + ' és un gir d\'angle ' + m('\\alpha') + '. (a) Comproveu que ' + m('A(\\alpha)') + ' és invertible amb inversa ' + m('A(-\\alpha)') + '. (b) Deduïu de ' + m('A(2\\alpha)=A(\\alpha)^2') + ' fórmules per a ' + m('\\cos2\\alpha,\\sin2\\alpha') + '. (c) Idem per a ' + m('\\cos(\\alpha+\\beta),\\sin(\\alpha+\\beta)') + '.',
        parts: [
          ch('a', '(a) ' + m('\\det A(\\alpha)') + ' val:', 'b', [{ v: 'a', label: '\\(\\cos 2\\alpha\\)' }, { v: 'b', label: '\\(1\\)' }, { v: 'c', label: '\\(0\\)' }], sol1),
          ch('b', '(b) ' + m('\\sin 2\\alpha') + ' =', 'a', [{ v: 'a', label: '\\(2\\sin\\alpha\\cos\\alpha\\)' }, { v: 'b', label: '\\(\\cos^2\\alpha-\\sin^2\\alpha\\)' }, { v: 'c', label: '\\(2\\sin\\alpha\\)' }], sol2),
          ch('c', '(c) ' + m('\\cos(\\alpha+\\beta)') + ' =', 'c', [{ v: 'a', label: '\\(\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta\\)' }, { v: 'b', label: '\\(\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta\\)' }, { v: 'c', label: '\\(\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta\\)' }], sol3),
        ],
      };
    },
  });

  /* =====================================================================
     55 / 56 / 57 · Nucli i imatge
     ===================================================================== */
  function kerImTasks(F, sym, A) {
    const n = A[0].length, mm = A.length;
    const spN = Sp.Kn(sym, n), spM = Sp.Kn(sym, mm);
    const K = Sub.fromEqs(F, A, n);
    const cols = L.transpose(A);
    const I = Sub.fromGens(F, cols, mm);
    const ns = G.nullSol(F, A, VARS.slice(0, n));
    const rr = ns.ns.rr;
    const pivCols = rr.pivots.map((j) => cols[j]);
    const parts = [];
    parts.push(B3.dimPart('dk', K.dim, m('\\dim\\operatorname{Ker} f') + ' =', H.P(m('\\dim\\operatorname{Ker}f=n-\\operatorname{rang}A=' + n + '-' + rr.rank + '=' + K.dim) + '.')));
    parts.push(B3.basisPart('k', spN, K, 'Base de ' + m('\\operatorname{Ker} f') + ' (buit si és ' + m('\\{0\\}') + '):', H.P(m('\\operatorname{Ker}f=\\{v\\mid Av=0\\}') + ', amb ' + m('A=' + T.matrix(F, A)) + '.') + ns.html, { refBasis: ns.scaled || ns.basis }));
    parts.push(B3.dimPart('di', I.dim, m('\\dim\\operatorname{Im} f') + ' =', H.P(m('\\dim\\operatorname{Im}f=\\operatorname{rang}A=' + rr.rank) + '. Comprovació amb el teorema de la dimensió: ' + m(K.dim + '+' + I.dim + '=' + n + '=\\dim') + ' de l\'espai de sortida ✓')));
    let solI = H.P(m('\\operatorname{Im}f') + ' està generada per les <b>columnes</b> de ' + m('A') + ' (les imatges de la base canònica). Una base: les columnes de ' + m('A') + ' que ocupen les posicions dels pivots de la forma esglaonada (Tasca 6). Amb l\'esglaonament d\'abans, pivots a les columnes ' + m(rr.pivots.map((j) => j + 1).join(',')) + ':');
    solI += H.ans(m('\\operatorname{Im}f=' + T.span(pivCols.map((c) => T.vec(F, c)))));
    if (I.dim === mm) solI += H.P('Com que ' + m('\\dim\\operatorname{Im}f=' + mm + '=\\dim') + ' de l\'arribada, ' + m('\\operatorname{Im}f=' + spM.name) + ' i també serveix la base canònica.');
    parts.push(B3.basisPart('i', spM, I, 'Base de ' + m('\\operatorname{Im} f') + ':', solI, { refBasis: pivCols }));
    return { parts, K, I, ns, pivCols };
  }
  function randomMap(rng) {
    const sym = rng.pick(['Z2', 'C', 'Q', 'R', 'R']);
    const F = Sp.fieldOfSym(sym);
    const n = sym === 'Z2' ? 3 : rng.pick([3, 4, 5, 3]);
    const mm = rng.pick([2, 3, 4].filter((x) => x !== n || n === 3));
    const r = Math.max(1, Math.min(n, mm) - rng.pick([0, 1, 1]));
    const A = G.rankMatrix(F, rng, mm, n, r, { bound: 4, noZeroRows: sym !== 'Z2', noZeroCols: false, pIm: 0.35 });
    return { sym, F, A };
  }
  G.register({
    tid: 'e55', ex: 55, star: true, topic: 3, sec: '3.6 · 3.9 (Tasca 6)',
    title: 'Nucli i imatge d\'una aplicació lineal', skill: 'Dimensió i base de Ker f i Im f',
    make(rng) {
      const { sym, F, A } = randomMap(rng);
      return { statement: 'Calculeu la dimensió i una base del nucli i la imatge de l\'aplicació lineal' + dm(mapTex(F, sym, A)), parts: kerImTasks(F, sym, A).parts };
    },
    original() {
      const maps = [
        { sym: 'Z2', A: [[1, 1, 1], [0, 0, 0], [0, 0, 1], [1, 1, 0]] },
        { sym: 'C', A: [[cx(0, 1), cx(1), cx(0, -1)], [cx(1), cx(0, -1), cx(-1)]] },
        { sym: 'Q', A: [[1, -2, 0, 1], [0, -1, 1, 1], [1, 0, -2, -1]] },
        { sym: 'R', A: [[0, 0, 4, 8, 2], [1, 1, 1, 2, 1], [3, 3, 1, 2, 2]] },
        { sym: 'R', A: [[1, 2, 0], [2, 4, -2], [1, 2, -1], [1, 2, 0]] },
      ];
      let parts = [];
      maps.forEach((mp, k) => {
        const F = Sp.fieldOfSym(mp.sym);
        const A = mp.sym === 'C' ? mp.A : L.fromInts(F, mp.A);
        const ps = kerImTasks(F, mp.sym, A).parts.map((p) => Object.assign(p, { id: 'f' + (k + 1) + p.id, label: m('f_' + (k + 1)) + ': ' + p.label }));
        parts = parts.concat(ps);
      });
      return {
        statement: 'Calculeu la dimensió i una base del nucli i la imatge de les aplicacions lineals següents:' + dm('\\begin{aligned}&f_1\\colon(\\mathbb{Z}_2)^3\\to(\\mathbb{Z}_2)^4, && f_1(x,y,z)=(x+y+z,0,z,x+y)\\\\&f_2\\colon\\mathbb{C}^3\\to\\mathbb{C}^2, && f_2(x,y,z)=(ix+y-iz,\\ x-iy-z)\\\\&f_3\\colon\\mathbb{Q}^4\\to\\mathbb{Q}^3, && f_3(x,y,z,t)=(x-2y+t,\\ z-y+t,\\ x-2z-t)\\\\&f_4\\colon\\mathbb{R}^5\\to\\mathbb{R}^3, && f_4(x,y,z,t,u)=(4z+8t+2u,\\ x+y+z+2t+u,\\ 3x+3y+z+2t+2u)\\\\&f_5\\colon\\mathbb{R}^3\\to\\mathbb{R}^4, && f_5(x,y,z)=(x+2y,\\ 2x+4y-2z,\\ x+2y-z,\\ x+2y)\\end{aligned}'),
        parts,
      };
    },
  });
  G.register({
    tid: 'e56', ex: 56, star: false, topic: 3, sec: '3.6', title: 'Nucli i imatge (ℂ⁵ → ℂ³)', skill: 'Ker i Im amb matriu complexa',
    make(rng) { const F = CC; const A = G.rankMatrix(F, rng, 3, 5, rng.pick([2, 3]), { bound: 6, pIm: 0.5, noZeroRows: true }); return { statement: 'Trobeu la dimensió i una base de ' + m('\\operatorname{Ker}f') + ' i ' + m('\\operatorname{Im}f') + ' per a ' + m('f\\colon\\mathbb{C}^5\\to\\mathbb{C}^3,\\ v\\mapsto ' + T.matrix(F, A) + 'v') + '.', parts: kerImTasks(F, 'C', A).parts }; },
    original() {
      const F = CC; const I = (a, b) => cx(a, b || 0);
      const A = [[I(1), I(5), I(-1), I(9), I(0, -9)], [I(1), I(5), I(2), I(-3), I(0)], [I(0, 1), I(0, 5), I(0), I(0, 5), I(6)]];
      return { statement: 'Considerem ' + m('f\\colon\\mathbb{C}^5\\to\\mathbb{C}^3,\\ v\\mapsto\\begin{pmatrix}1&5&-1&9&-9i\\\\1&5&2&-3&0\\\\i&5i&0&5i&6\\end{pmatrix}v') + '. Trobeu la dimensió i una base de ' + m('\\operatorname{Ker}(f)\\subseteq\\mathbb{C}^5') + ' i ' + m('\\operatorname{Im}(f)\\subseteq\\mathbb{C}^3') + '.', parts: kerImTasks(F, 'C', A).parts };
    },
  });
  G.register({
    tid: 'e57', ex: 57, star: false, topic: 3, sec: '3.6', title: 'Nucli i imatge sobre ℤ₂', skill: 'Ker i Im a ℤ₂',
    make(rng) { const F = Z2; const A = G.rankMatrix(F, rng, 4, 3, rng.pick([2, 3]), {}); return { statement: 'Trobeu la dimensió i una base de ' + m('\\operatorname{Ker}f') + ' i ' + m('\\operatorname{Im}f') + ' per a ' + m('f\\colon(\\mathbb{Z}_2)^3\\to(\\mathbb{Z}_2)^4,\\ v\\mapsto ' + T.matrix(F, A) + 'v') + '.', parts: kerImTasks(F, 'Z2', A).parts }; },
    original() { const A = [[1, 1, 0], [1, 0, 1], [1, 0, 1], [1, 1, 0]]; return { statement: 'Considerem ' + m('f\\colon(\\mathbb{Z}_2)^3\\to(\\mathbb{Z}_2)^4,\\ v\\mapsto\\begin{pmatrix}1&1&0\\\\1&0&1\\\\1&0&1\\\\1&1&0\\end{pmatrix}v') + '. Trobeu la dimensió i una base de ' + m('\\operatorname{Ker}(f)') + ' i ' + m('\\operatorname{Im}(f)') + '.', parts: kerImTasks(Z2, 'Z2', A).parts }; },
  });

  /* =====================================================================
     58 / 59 · Ker, Im, injectiva/exhaustiva, G ⊇ Ker, ampliar
     ===================================================================== */
  function kerInGTasks(F, sym, A, Ggens) {
    const n = A[0].length, mm = A.length;
    const spN = Sp.Kn(sym, n);
    const ki = kerImTasks(F, sym, A);
    const parts = ki.parts.map((p) => Object.assign(p, { label: '(a) ' + p.label }));
    const K = ki.K, I = ki.I;
    const inj = K.dim === 0, exh = I.dim === mm;
    parts.push({ id: 'inj', kind: 'choice', label: '(b) És ' + m('f') + ' injectiva?', options: G.YN, check: (v) => ((v === 'si') === inj ? EV.ok() : EV.bad()), ref: inj ? 'si' : 'no', sol: H.P('Lema 3.27: injectiva ' + m('\\iff\\operatorname{Ker}f=\\{0\\}') + '. Aquí ' + m('\\dim\\operatorname{Ker}f=' + K.dim) + (inj ? ' ⇒ <b>sí</b>.' : ' ⇒ <b>no</b>.') + (n > mm ? ' (De fet, ' + m(n + '>' + mm) + ' ja impedeix que sigui injectiva: Corol·lari 3.29.)' : '')) });
    parts.push({ id: 'exh', kind: 'choice', label: '(b) És ' + m('f') + ' exhaustiva?', options: G.YN, check: (v) => ((v === 'si') === exh ? EV.ok() : EV.bad()), ref: exh ? 'si' : 'no', sol: H.P('Exhaustiva ' + m('\\iff\\operatorname{Im}f') + ' és tot l\'espai d\'arribada ' + m('\\iff\\operatorname{rang}A=' + mm) + ' (Teorema 3.28). Aquí ' + m('\\dim\\operatorname{Im}f=' + I.dim) + (exh ? ' ⇒ <b>sí</b>.' : ' ⇒ <b>no</b>.')) });
    const WG = Sub.fromGens(F, Ggens, n);
    const sb = G.spanBasisSol(spN, Ggens);
    parts.push(B3.dimPart('dG', WG.dim, '(c) ' + m('\\dim G') + ' =', sb.html));
    parts.push(B3.basisPart('bG', spN, WG, '(c) Una base de ' + m('G') + ':', sb.html, { refBasis: sb.basis }));
    const kb = ki.ns.scaled || ki.ns.basis;
    const kinG = kb.every((v) => WG.contains(v));
    let solIn = H.P('N\'hi ha prou amb veure que cada vector de la base de ' + m('\\operatorname{Ker}f') + ' és de ' + m('G') + '.');
    kb.forEach((v) => { const ms = G.membershipSol(spN, sb.basis, v, {}); solIn += H.P(m(T.vec(F, v)) + ':') + ms.html; });
    parts.push({ id: 'kg', kind: 'choice', label: '(d) És ' + m('\\operatorname{Ker} f\\subseteq G') + '?', options: G.YN, check: (v) => ((v === 'si') === kinG ? EV.ok() : EV.bad()), ref: kinG ? 'si' : 'no', sol: solIn });
    if (kinG) {
      // ampliar base de Ker a base de G
      const extra = [];
      const cur = kb.slice();
      sb.basis.forEach((g) => { if (!(cur.length && L.inSpan(F, cur, g))) { extra.push(g); cur.push(g); } });
      const solE = H.P('Partim de la base de ' + m('\\operatorname{Ker}f') + ' i hi anem afegint vectors de la base de ' + m('G') + ' que no siguin combinació dels que ja tenim (Lema 3.7), fins arribar a ' + m('\\dim G=' + WG.dim) + ' vectors:') + H.ans(m('\\left(' + kb.concat(extra).map((v) => T.vec(F, v)).join(',\\ ') + '\\right)')) + H.P('Per comprovar-ho: rang de la matriu amb aquests ' + WG.dim + ' vectors = ' + WG.dim + '.');
      const p = {
        id: 'ext', kind: 'elems', space: spN, label: '(d) Vectors de ' + m('G') + ' que cal afegir a la base de ' + m('\\operatorname{Ker} f') + ' per obtenir una base de ' + m('G') + ':', placeholder: spN.fmt,
        check: (v) => C.extension(F, WG, kb, v), ref: extra.map((e) => S.vecStr(F, e)).join(', '), sol: solE,
      };
      parts.push(p);
    }
    return parts;
  }
  function genKerInG(rng, sym) {
    const F = Sp.fieldOfSym(sym);
    const r = sym === 'Z2' ? rng.pick([2, 3]) : rng.pick([2, 3]);
    const A = G.rankMatrix(F, rng, 3, 4, r, { bound: 6, noZeroRows: true });
    const K = Sub.fromEqs(F, A, 4);
    const kb = K.basis.map((b) => L.clearDen(F, b));
    // un vector extra fora del nucli
    let extra;
    for (;;) { extra = Array.from({ length: 4 }, () => G.rnd(F, rng, -2, 2)); if (!L.inSpan(F, kb, extra)) break; }
    let gens = kb.concat([extra]);
    // barregem: combinacions
    const k = gens.length;
    const U = G.unimodular(F, rng, k, { bound: 2, ops: k });
    gens = L.mul(F, U, gens);
    if (gens.length < 3) gens.push(L.addV(F, gens[0], gens[gens.length - 1]));
    return { F, A, gens: rng.shuffle(gens) };
  }
  G.register({
    tid: 'e58', ex: 58, star: true, topic: 3, sec: '3.6 · 3.4',
    title: 'Nucli, imatge, injectivitat i Ker f ⊆ G', skill: 'Ker/Im, injectiva/exhaustiva, ampliar base de Ker a base de G',
    make(rng) {
      const { F, A, gens } = genKerInG(rng, 'R');
      return { statement: 'Considereu l\'aplicació ' + m('\\mathbb{R}') + '-lineal ' + m('f\\colon\\mathbb{R}^4\\to\\mathbb{R}^3') + ' donada per ' + dm(formula(F, A)) + 'i el subespai ' + m('G=' + T.span(gens.map((g) => T.vec(F, g)), '\\mathbb{R}') + '\\subseteq\\mathbb{R}^4') + '.' + H.ul(['(a) Calculeu la dimensió i una base de ' + m('\\operatorname{Im}(f)') + ' i de ' + m('\\operatorname{Ker}(f)') + '.', '(b) És ' + m('f') + ' injectiva? És exhaustiva? Per què?', '(c) Calculeu la dimensió i una base de ' + m('G') + '.', '(d) Proveu que ' + m('\\operatorname{Ker}(f)\\subset G') + ', i amplieu la base de ' + m('\\operatorname{Ker}(f)') + ' a una base de ' + m('G') + '.']), parts: kerInGTasks(F, 'R', A, gens) };
    },
    original() {
      const F = QQ;
      const A = L.fromInts(F, [[1, 2, -3, -2], [1, 2, -1, -3], [-6, 5, 2, 3]]);
      const gens = L.fromInts(F, [[2, 0, 2, 0], [1, -1, 2, -1], [-1, -1, 0, -1]]);
      return { statement: 'Considereu l\'aplicació ' + m('\\mathbb{R}') + '-lineal ' + m('f\\colon\\mathbb{R}^4\\to\\mathbb{R}^3') + ' donada per ' + dm('f(x,y,z,t)=(x+2y-3z-2t,\\ x+2y-z-3t,\\ -6x+5y+2z+3t)') + 'i el subespai ' + m('G=\\langle(2,0,2,0),(1,-1,2,-1),(-1,-1,0,-1)\\rangle_{\\mathbb{R}}\\subseteq\\mathbb{R}^4') + '.' + H.ul(['(a) Calculeu la dimensió i una base de ' + m('\\operatorname{Im}(f)') + ' i de ' + m('\\operatorname{Ker}(f)') + '.', '(b) És ' + m('f') + ' injectiva? És exhaustiva? Per què?', '(c) Calculeu la dimensió i una base de ' + m('G') + '.', '(d) Proveu que ' + m('\\operatorname{Ker}(f)\\subset G') + ', i amplieu la base de ' + m('\\operatorname{Ker}(f)') + ' a una base de ' + m('G') + '.']), parts: kerInGTasks(F, 'R', A, gens) };
    },
  });
  G.register({
    tid: 'e59', ex: 59, star: false, topic: 3, sec: '3.6', title: 'El mateix que el 58, sobre ℤ₂', skill: 'Ker/Im i ampliació a ℤ₂',
    make(rng) {
      const { F, A, gens } = genKerInG(rng, 'Z2');
      return { statement: 'Considereu ' + m('f\\colon\\mathbb{Z}_2^4\\to\\mathbb{Z}_2^3,\\ ' + formula(F, A, ['a', 'b', 'c', 'd'])) + ' i ' + m('G=' + T.span(gens.map((g) => T.vec(F, g)), '\\mathbb{Z}_2')) + '. (a) Ker i Im; (b) injectiva/exhaustiva; (c) base de ' + m('G') + '; (d) ' + m('\\operatorname{Ker}f\\subset G') + ' i ampliació.', parts: kerInGTasks(F, 'Z2', A, gens) };
    },
    original() {
      const A = [[1, 1, 0, 1], [1, 0, 1, 0], [1, 0, 1, 1]];
      const gens = [[1, 0, 0, 0], [1, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0]];
      return { statement: 'Considereu l\'aplicació ' + m('\\mathbb{Z}_2') + '-lineal ' + m('f\\colon\\mathbb{Z}_2^4\\to\\mathbb{Z}_2^3,\\ f(a,b,c,d)=(a+b+d,\\ a+c,\\ a+c+d)') + ' i ' + m('G=\\langle(1,0,0,0),(1,0,1,0),(0,0,1,0),(0,1,1,0)\\rangle_{\\mathbb{Z}_2}') + '. (a) Dimensió i base de ' + m('\\operatorname{Im}f') + ' i ' + m('\\operatorname{Ker}f') + '. (b) Injectiva? Exhaustiva? (c) Dimensió i base de ' + m('G') + '. (d) Proveu ' + m('\\operatorname{Ker}f\\subset G') + ' i amplieu la base de ' + m('\\operatorname{Ker}f') + ' a una base de ' + m('G') + '.', parts: kerInGTasks(Z2, 'Z2', A, gens) };
    },
  });

  EV.T3C = { formula, mapTex, kerImTasks, spaceName };
})(window.EV = window.EV || {});
