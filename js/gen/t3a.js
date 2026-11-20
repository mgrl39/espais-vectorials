/* ============================================================
   Tema 3 · Generadors: subespais (34, 35), pertinença (37),
   inclusió (38), dependència lineal (40), cert/fals (41), bases (42)
   ============================================================ */
(function (EV) {
  'use strict';
  const L = EV.L, T = EV.T, H = EV.H, S = EV.S, G = EV.G, C = EV.C, Sp = EV.Sp, Sub = EV.Sub;
  const { m, dm } = H;
  const QQ = EV.QQ, CC = EV.CC, Z2 = EV.Z2;
  const fr = EV.fr, cx = EV.cx;
  const VARS = ['x', 'y', 'z', 't', 'u'];

  /* =====================================================================
     34 · Quins subconjunts són subespais? (K^n)
     ===================================================================== */
  function eqTex(F, row, names, rhs) { return T.linexpr(F, row, names) + ' = ' + (rhs === undefined ? '0' : F.tex(rhs)); }
  function setTex(sp, cond) { return '\\{(' + VARS.slice(0, sp.n).join(',') + ')\\in ' + sp.name + ' \\mid ' + cond + '\\}'; }

  // Cada plantilla retorna un "item"
  const ITEMS34 = {
    homog(rng, symOpt) {
      const sym = symOpt || rng.pick(['R', 'R', 'Q', 'C']);
      const n = rng.pick([3, 3, 4, 2]);
      const sp = Sp.Kn(sym, n); const F = sp.F;
      const k = n === 2 ? 1 : rng.pick([1, 1, 2]);
      const A = G.rankMatrix(F, rng, k, n, k, { bound: 4, noZeroRows: true, pIm: 0.3 });
      const cond = A.map((r) => eqTex(F, r, VARS)).join(',\\ ');
      return { sp, tex: setTex(sp, cond), isSub: true, eqs: A, why: 'Totes les condicions són equacions <b>lineals homogènies</b> (sense terme independent): el conjunt és el conjunt de solucions d\'un sistema homogeni, que sempre és subespai.' };
    },
    chain(rng) {
      const sym = rng.pick(['R', 'Q']); const sp = Sp.Kn(sym, 3); const F = sp.F;
      const a = rng.pick([1, 1, 2, -1, 3]), b = rng.pick([1, -1, 2, -2]);
      const ta = a === 1 ? 'y' : a === -1 ? '-y' : a + 'y', tb = b === 1 ? 'z' : b === -1 ? '-z' : b + 'z';
      const A = [[F.one, F.fromInt(-a), F.zero], [F.one, F.zero, F.fromInt(-b)]];
      return { sp, tex: setTex(sp, 'x = ' + ta + ' = ' + tb), isSub: true, eqs: A, why: 'La condició ' + m('x=' + ta + '=' + tb) + ' són dues equacions lineals homogènies: ' + m('x=' + ta) + ' i ' + m('x = ' + tb) + ' (tot passat a l\'esquerra, sense terme independent). Per tant és subespai.' };
    },
    complexline(rng) {
      const sp = Sp.Kn('C', 2); const F = CC;
      const opts = [
        { w: cx(0, 1), t: 'e^{i\\pi/2}' }, { w: cx(-1), t: 'e^{i\\pi}' }, { w: cx(0, -1), t: 'e^{-i\\pi/2}' },
        { w: cx(1, 1), t: '(1+i)' }, { w: cx(2, -1), t: '(2-i)' }, { w: cx(0, 3), t: '3i' },
      ];
      const o = rng.pick(opts);
      const A = [[F.neg(o.w), F.one]];
      return { sp, tex: setTex(sp, 'y = ' + o.t + 'x'), isSub: true, eqs: A, why: m(o.t + '=' + F.tex(o.w)) + ' és un nombre complex fix. L\'equació ' + m('y-' + (F.isNeg(o.w) ? '(' + F.tex(o.w) + ')' : F.tex(o.w)) + 'x=0') + ' és lineal i homogènia ⇒ subespai. Forma paramètrica: ' + m('(x,y)=x(1,' + F.tex(o.w) + ')') + '.' };
    },
    constant(rng) {
      const sym = rng.pick(['R', 'Q', 'C', 'Z2']);
      const n = sym === 'Z2' ? 2 : rng.pick([2, 3]);
      const sp = Sp.Kn(sym, n); const F = sp.F;
      let row, rhs, cond;
      if (sym === 'Z2') { row = [F.one, F.one]; rhs = 1; cond = 'x = y + 1'; }
      else {
        row = G.rankMatrix(F, rng, 1, n, 1, { bound: 3, pIm: 0.2 })[0];
        rhs = G.rnd(F, rng, 1, 4, { realOnly: true });
        cond = eqTex(F, row, VARS, rhs);
      }
      const why = sym === 'Z2'
        ? 'A ' + m('\\mathbb{Z}_2') + ' només hi ha 0 i 1. Si ' + m('x=y=0') + ': ' + m('0\\neq 0+1=1') + '. Per tant ' + m('(0,0)\\notin A') + ' (de fet, ' + m('A=\\{(1,0),(0,1)\\}') + ' i ' + m('(1,0)+(0,1)=(1,1)\\notin A') + ').'
        : 'Hi ha un terme independent ' + m('\\neq 0') + ': el vector zero no compleix la condició (' + m('0\\neq ' + F.tex(rhs)) + '), i tot subespai conté el 0.';
      return { sp, tex: setTex(sp, cond), isSub: false, why };
    },
    product(rng) {
      const v = rng.pick(['xyiz', 'xy0', 'xzy', 'z2xy']);
      if (v === 'xyiz') {
        const a = rng.pick([cx(0, 1), cx(2), cx(0, -1), cx(3)]);
        const sp = Sp.Kn('C', 3);
        const at = CC.tex(a);
        return { sp, tex: setTex(sp, 'xy + ' + (at === '-i' ? '(-i)' : at) + 'z = x'), isSub: false, why: 'Hi ha un producte de variables ' + m('xy') + '. Contraexemple: ' + m('u=(1,1,0)') + ' compleix ' + m('1\\cdot 1+0=1') + ' ✓, però ' + m('2u=(2,2,0)') + ' dóna ' + m('2\\cdot 2+0=4\\neq 2') + '. Falla ' + m('a u\\in F') + '. (Compte: aquí ' + m('0\\in F') + ', mirar el zero no n\'hi ha prou.)' };
      }
      if (v === 'xy0') {
        const sym = rng.pick(['R', 'Q']); const sp = Sp.Kn(sym, 2);
        return { sp, tex: setTex(sp, 'xy = 0'), isSub: false, why: 'És la unió dels dos eixos. ' + m('(1,0),(0,1)\\in F') + ' però ' + m('(1,0)+(0,1)=(1,1)') + ' i ' + m('1\\cdot1\\neq 0') + '. No és tancat per la suma (encara que conté el 0 i és tancat per escalars).' };
      }
      if (v === 'z2xy') {
        const sp = Sp.Kn('Z2', 2);
        return { sp, tex: setTex(sp, 'xy = 0'), isSub: false, why: 'Els elements són ' + m('(0,0),(1,0),(0,1)') + '. Però ' + m('(1,0)+(0,1)=(1,1)') + ' i ' + m('1\\cdot1=1\\neq0') + '. No és tancat per la suma.' };
      }
      const sp = Sp.Kn(rng.pick(['R', 'Q']), 3);
      return { sp, tex: setTex(sp, 'xz = y'), isSub: false, why: m('u=(1,1,1)') + ' compleix ' + m('1\\cdot1=1') + ' ✓; ' + m('2u=(2,2,2)') + ': ' + m('2\\cdot 2=4\\neq 2') + ' ✗. No és tancat pel producte per escalars.' };
    },
    square(rng) {
      if (rng.bool(0.35)) {
        const sp = Sp.Kn('Z2', 2);
        return { sp, tex: setTex(sp, 'y = x^2'), isSub: true, eqs: [[Z2.one, Z2.one]], why: '<b>Truc de ' + m('\\mathbb{Z}_2') + '</b>: ' + m('0^2=0') + ' i ' + m('1^2=1') + ', és a dir ' + m('x^2=x') + ' per a tot ' + m('x\\in\\mathbb{Z}_2') + '. La condició és ' + m('y=x') + ', lineal i homogènia: ' + m('F=\\{(0,0),(1,1)\\}=\\langle(1,1)\\rangle') + '.' };
      }
      const sym = rng.pick(['R', 'Q']); const sp = Sp.Kn(sym, 2);
      const which = rng.pick(['y = x^2', 'x = y^2', 'y = x^3']);
      const ce = which === 'x = y^2' ? m('(1,1)\\in F') + ' però ' + m('2(1,1)=(2,2)') + ' i ' + m('2\\neq 2^2=4') : which === 'y = x^3' ? m('(1,1)\\in F') + ' però ' + m('2(1,1)=(2,2)') + ' i ' + m('2\\neq 2^3=8') : m('(1,1)\\in F') + ' perquè ' + m('1=1^2') + ', però ' + m('2(1,1)=(2,2)') + ' i ' + m('2\\neq 2^2=4');
      return { sp, tex: setTex(sp, which), isSub: false, why: 'Una potència no és lineal. ' + ce + '.' };
    },
    integer(rng) {
      const k = rng.pick([1, 2, 3, 5, 7]);
      const sp = Sp.Kn('Q', 2);
      const cond = k === 1 ? 'x \\text{ és enter}' : 'x \\text{ és enter i múltiple de } ' + k;
      const ex = k === 1 ? '(1,0)' : '(' + k + ',0)';
      return { sp, tex: setTex(sp, cond), isSub: false, why: 'El cos és ' + m('\\mathbb{Q}') + ': podem multiplicar per ' + m('\\tfrac{1}{' + (k === 1 ? 2 : k) + '}') + '. ' + m(ex + '\\in F') + ' però ' + m('\\tfrac{1}{' + (k === 1 ? 2 : k) + '}' + ex + '=(' + (k === 1 ? '\\tfrac12' : '1') + ',0)\\notin F') + '. (És tancat per la suma, però no pel producte per escalars.)' };
    },
    sumsq(rng) {
      if (rng.bool()) {
        const sp = Sp.Kn('R', 2);
        return { sp, tex: setTex(sp, 'x^2+y^2=0'), isSub: true, eqs: L.identity(QQ, 2), zero: true, why: 'A ' + m('\\mathbb{R}') + ', ' + m('x^2+y^2=0\\iff x=y=0') + '. El conjunt és ' + m('\\{(0,0)\\}') + ', el <b>subespai trivial</b> (generat per la família buida, o pel vector 0).' };
      }
      const sp = Sp.Kn('C', 2);
      return { sp, tex: setTex(sp, 'x^2+y^2=0'), isSub: false, why: 'A ' + m('\\mathbb{C}') + ': ' + m('x^2+y^2=(x+iy)(x-iy)') + ', el conjunt és la unió de dues rectes. ' + m('(1,i)') + ' i ' + m('(1,-i)') + ' hi són, però la suma ' + m('(2,0)') + ' no: ' + m('4\\neq0') + '.' };
    },
    absval(rng) {
      const sp = Sp.Kn('R', 2);
      const w = rng.pick(['|x| = |y|', 'x \\geq 0', 'x\\le y']);
      const why = w === '|x| = |y|' ? m('(1,1),(1,-1)\\in F') + ' però la suma ' + m('(2,0)\\notin F') + '.'
        : w === 'x \\geq 0' ? m('(1,0)\\in F') + ' però ' + m('(-1)(1,0)=(-1,0)\\notin F') + '. Les desigualtats no es conserven en multiplicar per negatius.'
          : m('(0,1)\\in F') + ' però ' + m('(-1)(0,1)=(0,-1)') + ' i ' + m('0\\not\\le -1') + '.';
      return { sp, tex: setTex(sp, w), isSub: false, why };
    },
    conj(rng) {
      const sp = Sp.Kn('C', 2);
      if (rng.bool()) return { sp, tex: setTex(sp, 'y = \\overline{x}'), isSub: false, why: m('(1,1)\\in F') + ', però ' + m('i(1,1)=(i,i)') + ' i ' + m('\\overline{i}=-i\\neq i') + '. És tancat per la suma però no per escalars <b>complexos</b>. (Com a ' + m('\\mathbb{R}') + '-espai sí que seria subespai!)' };
      return { sp, tex: setTex(sp, 'x \\in\\mathbb{R}'), isSub: false, why: m('(1,0)\\in F') + ' però ' + m('i(1,0)=(i,0)\\notin F') + ' perquè ' + m('i\\notin\\mathbb{R}') + '.' };
    },
    z2affine(rng) {
      const sp = Sp.Kn('Z2', 3);
      if (rng.bool()) return { sp, tex: setTex(sp, 'x+y+z=0'), isSub: true, eqs: [[1, 1, 1]], why: 'Equació lineal homogènia ⇒ subespai. Té ' + m('2^2=4') + ' elements: ' + m('(0,0,0),(1,1,0),(1,0,1),(0,1,1)') + '.' };
      return { sp, tex: setTex(sp, 'x+y+z=1'), isSub: false, why: m('(0,0,0)') + ' no compleix ' + m('0=1') + ': no conté el zero.' };
    },
  };
  const SUB_KEYS = ['homog', 'chain', 'complexline', 'z2affine'];
  const NOSUB_KEYS = ['constant', 'product', 'square', 'integer', 'sumsq', 'absval', 'conj'];

  function subspacePart(item, idx, F) {
    const sp = item.sp;
    let W = null;
    if (item.isSub) W = Sub.fromEqs(sp.F, item.eqs.map((r) => r.map((a) => (typeof a === 'number' ? sp.F.fromInt(a) : a))), sp.n);
    let sol = H.P(item.why);
    let refText = '';
    if (item.isSub) {
      const ns = W.basis;
      if (!item.zero && item.eqs) sol += G.nullSol(sp.F, W.eqs, VARS.slice(0, sp.n)).html;
      sol += H.ans('Sí és subespai' + (ns.length ? ': ' + m('\\left\\langle ' + ns.map((v) => T.vec(sp.F, v)).join(',\\ ') + '\\right\\rangle') : ' (el trivial ' + m('\\{0\\}') + ')'));
      refText = ns.map((v) => S.vecStr(sp.F, v)).join(', ');
    } else sol += H.ans('No és subespai.');
    return {
      id: 'p' + idx, kind: 'yesplus', label: m(item.tex), F: sp.F,
      options: [{ v: 'si', label: 'Sí, és subespai' }, { v: 'no', label: 'No ho és' }],
      text: { kind: 'elems', space: sp, allowEmpty: true, placeholder: 'Generadors: ' + sp.fmt.replace('vectors entre parèntesis, separats per comes: ', '') },
      textLabel: 'Sistema de generadors (buit si és {0})',
      check: (v) => {
        if (v.yes !== item.isSub) return EV.bad(item.isSub ? 'Sí que és subespai.' : 'No és subespai.');
        if (!item.isSub) return EV.ok();
        return C.gensOf(sp.F, W, v.val || []);
      },
      ref: item.isSub ? { yes: 'si', text: refText } : { yes: 'no' },
      sol,
    };
  }

  G.register({
    tid: 'e34', ex: 34, star: true, topic: 3, sec: '3.2',
    title: 'Quins subconjunts són subespais?', skill: 'Reconèixer subespais (K^n) i donar-ne generadors',
    make(rng) {
      const nSub = rng.int(2, 3), nNo = rng.int(2, 3);
      const keys = rng.shuffle(rng.sample(SUB_KEYS, nSub).concat(rng.sample(NOSUB_KEYS, nNo)));
      const items = keys.map((k) => ITEMS34[k](rng));
      return {
        statement: 'Determineu quins dels subconjunts següents són subespais vectorials. En cas afirmatiu, trobeu un sistema de generadors del subespai.',
        parts: items.map((it, i) => subspacePart(it, i)),
        intro: H.box('tip', 'Com es fa', H.ul(['Equacions lineals <b>homogènies</b> ⇒ sempre subespai: resol el sistema i separa un vector per paràmetre.', 'Terme independent ≠ 0 ⇒ no conté el 0 ⇒ no.', 'Productes, potències, "ser enter", desigualtats... ⇒ busca un <b>contraexemple concret</b> (amb la suma o amb un escalar).', 'Per dir <b>NO</b> n\'hi ha prou amb un contraexemple numèric; per dir <b>SÍ</b> cal un argument general (o escriure ' + m('F=\\langle v_1,\\dots,v_k\\rangle') + ').'])),
      };
    },
    original() {
      const i1 = { sp: Sp.Kn('R', 3), tex: '\\{(x,y,z)\\in\\mathbb{R}^3\\mid x=y=z\\}', isSub: true, eqs: [[QQ.one, QQ.fromInt(-1), QQ.zero], [QQ.zero, QQ.one, QQ.fromInt(-1)]], why: 'Si ' + m('x=y=z') + ', tots els vectors són ' + m('(x,x,x)=x(1,1,1)') + '. La condició són dues equacions lineals homogènies ' + m('x-y=0,\\ y-z=0') + '.' };
      const i2 = { sp: Sp.Kn('C', 3), tex: '\\{(x,y,z)\\in\\mathbb{C}^3\\mid xy+iz=x\\}', isSub: false, why: 'Prenem ' + m('u=(1,2,i)') + ': ' + m('xy+iz=2+i\\cdot i=1=x') + ' ✓. Però ' + m('2u=(2,4,2i)') + ': ' + m('8+2i\\cdot i=6\\neq 2') + ' ✗. Falla ' + m('au\\in F') + '. (Un altre: ' + m('u=(1,1,0)') + ', ' + m('2u') + ' dóna ' + m('4\\neq 2') + '.)' };
      const i3 = { sp: Sp.Kn('Z2', 2), tex: '\\{(x,y)\\in(\\mathbb{Z}_2)^2\\mid x=y+1\\}', isSub: false, why: 'A ' + m('\\mathbb{Z}_2') + ': si ' + m('y=0\\Rightarrow x=1') + ', si ' + m('y=1\\Rightarrow x=0') + '. ' + m('A_3=\\{(1,0),(0,1)\\}') + ' i ' + m('(0,0)\\notin A_3') + '. El terme independent +1 trenca la propietat.' };
      const i4 = { sp: Sp.Kn('Q', 2), tex: '\\{(x,y)\\in\\mathbb{Q}^2\\mid x \\text{ és enter i múltiple de } 7\\}', isSub: false, why: m('(7,0)\\in A_4') + '. Com que treballem a ' + m('\\mathbb{Q}') + ', multipliquem per ' + m('\\tfrac17') + ': ' + m('\\tfrac17(7,0)=(1,0)\\notin A_4') + '. (Sí que és tancat per la suma; falla per escalars.)' };
      const i5 = { sp: Sp.Kn('Q', 2), tex: '\\{(x,y)\\in\\mathbb{Q}^2\\mid y=x^2\\}', isSub: false, why: m('(1,1)\\in A_5') + ' però ' + m('2(1,1)=(2,2)') + ' i ' + m('2\\neq 2^2=4') + '. Una potència no és lineal.' };
      const parts = [i1, i2, i3, i4, i5].map((it, k) => subspacePart(it, k));
      parts.push({
        id: 'p5', kind: 'choice', label: m('\\{(x,y)\\in\\mathbb{C}^2\\mid y=e^{i\\pi/3}x\\}'), options: [{ v: 'si', label: 'Sí, és subespai' }, { v: 'no', label: 'No ho és' }],
        check: (v) => (v === 'si' ? EV.ok() : EV.bad('Sí que ho és.')), ref: 'si',
        sol: H.P(m('\\omega=e^{i\\pi/3}=\\cos\\frac{\\pi}{3}+i\\sin\\frac{\\pi}{3}=\\frac12+\\frac{\\sqrt3}{2}i') + ' és un nombre complex fix (multiplicar per ' + m('\\omega') + ' és girar 60°). L\'equació ' + m('y-\\omega x=0') + ' és lineal i homogènia: ' + m('y_1=\\omega x_1,\\ y_2=\\omega x_2\\Rightarrow y_1+y_2=\\omega(x_1+x_2)') + ' i ' + m('\\lambda y_1=\\omega(\\lambda x_1)') + '. Forma paramètrica ' + m('(x,\\omega x)=x(1,\\omega)') + '.') + H.ans('Sí: ' + m('A_6=\\langle (1,e^{i\\pi/3})\\rangle_{\\mathbb{C}}=\\langle(1,\\tfrac12+\\tfrac{\\sqrt3}{2}i)\\rangle_{\\mathbb{C}}')) + '<p class="small muted">(Aquest apartat només es comprova Sí/No: el generador té ' + m('\\sqrt3') + ' i la web treballa amb racionals exactes.)</p>',
      });
      return { statement: 'Determineu quins dels subconjunts següents són subespais vectorials. En cas afirmatiu, trobeu un sistema de generadors del subespai.', parts };
    },
  });

  /* =====================================================================
     35 · Subconjunts de R[x]
     ===================================================================== */
  function evalRow(F, a, deg) { const r = []; let p = F.one; for (let k = 0; k <= deg; k++) { r.push(p); p = F.mul(p, a); } return r; }
  function derivRow(F, a, deg) { const r = [F.zero]; let p = F.one; for (let k = 1; k <= deg; k++) { r.push(F.mul(F.fromInt(k), p)); p = F.mul(p, a); } return r; }
  const ITEMS35 = {
    degle(rng) {
      const n = rng.int(2, 12);
      const sp = Sp.Pn('R', Math.min(n, 4));
      if (n > 4) return { tex: '\\{p(x)\\in\\mathbb{R}[x]\\mid \\operatorname{grau} p\\le ' + n + '\\}', isSub: true, noCheck: true, why: 'Tot polinomi de grau ' + m('\\le ' + n) + ' és ' + m('a_0+a_1x+\\dots+a_{' + n + '}x^{' + n + '}') + '. Sumant-ne dos o multiplicant per un real el grau continua sent ' + m('\\le ' + n) + ', i el 0 hi és.', ans: m('\\langle 1,x,x^2,\\dots,x^{' + n + '}\\rangle') + ' (' + (n + 1) + ' generadors)' };
      return { sp, tex: '\\{p(x)\\in\\mathbb{R}[x]\\mid \\operatorname{grau} p\\le ' + sp.deg + '\\}', isSub: true, eqs: [], why: 'Tot polinomi de grau ' + m('\\le ' + sp.deg) + ' és combinació lineal de ' + m('1,x,\\dots,x^{' + sp.deg + '}') + '; la suma i el producte per escalars no augmenten el grau, i el 0 hi és.' };
    },
    even(rng) {
      const w = rng.pick(['parell', 'senar', 'exactament ' + rng.int(2, 5)]);
      const why = w === 'parell' ? 'El polinomi zero no té grau parell (per conveni grau ' + m('-\\infty') + '), però l\'argument segur és la suma: ' + m('(x^2+x)+(-x^2)=x') + ' té grau 1. No és tancat per la suma.'
        : w === 'senar' ? m('(x^3+x^2)+(-x^3)=x^2') + ' té grau parell. No és tancat per la suma (ni conté el 0).'
          : m('(x^{' + w.split(' ')[1] + '}+x)+(-x^{' + w.split(' ')[1] + '})=x') + ' té grau 1. No és tancat per la suma (i el 0 no hi és).';
      return { tex: '\\{p(x)\\in\\mathbb{R}[x]\\mid \\operatorname{grau} p \\text{ és ' + w + '}\\}', isSub: false, why };
    },
    root(rng) {
      const deg = rng.pick([2, 3]); const a = rng.pick([1, -1, 2, 0, -2]);
      const sp = Sp.Pn('R', deg);
      return { sp, tex: '\\{p(x)\\in\\mathbb{R}_{' + deg + '}[x]\\mid p(' + a + ')=0\\}', isSub: true, eqs: [evalRow(QQ, fr(a), deg)], why: 'Si ' + m('p=a_0+a_1x+\\dots') + ', la condició ' + m('p(' + a + ')=0') + ' és una equació lineal homogènia en els coeficients: ' + m(T.linexpr(QQ, evalRow(QQ, fr(a), deg), ['a_0', 'a_1', 'a_2', 'a_3']) + '=0') + '.' };
    },
    rootval(rng) {
      const deg = rng.pick([2, 3]); const a = rng.pick([0, 1, 2]); const b = rng.nz(-3, 3);
      return { tex: '\\{p(x)\\in\\mathbb{R}_{' + deg + '}[x]\\mid p(' + a + ')=' + b + '\\}', isSub: false, why: 'El polinomi 0 compleix ' + m('0(' + a + ')=0\\neq ' + b) + ': no conté el zero.' };
    },
    deriv(rng) {
      const deg = 3; const a = rng.pick([0, 1, -1, 2]); const sp = Sp.Pn('R', deg);
      return { sp, tex: '\\{p(x)\\in\\mathbb{R}_{3}[x]\\mid p\'(' + a + ')=0\\}', isSub: true, eqs: [derivRow(QQ, fr(a), deg)], why: m('p\'(x)=a_1+2a_2x+3a_3x^2') + '; la condició és ' + m(T.linexpr(QQ, derivRow(QQ, fr(a), deg), ['a_0', 'a_1', 'a_2', 'a_3']) + '=0') + ', lineal i homogènia.' };
    },
    sym(rng) {
      const deg = rng.pick([3, 4]); const sp = Sp.Pn('R', deg);
      const odd = rng.bool();
      // odd=false: p(-x)=p(x) => coef imparells = 0
      const E = []; for (let k = 0; k <= deg; k++) if ((k % 2 === 1) === !odd) { const r = Array(deg + 1).fill(QQ.zero); r[k] = QQ.one; E.push(r); }
      return { sp, tex: '\\{p(x)\\in\\mathbb{R}_{' + deg + '}[x]\\mid p(-x)=' + (odd ? '-' : '') + 'p(x)\\}', isSub: true, eqs: E, why: 'Comparant coeficients, la condició diu que els coeficients de grau ' + (odd ? 'parell' : 'senar') + ' són 0: equacions lineals homogènies.' };
    },
    product(rng) {
      return { tex: '\\{p(x)\\in\\mathbb{R}_{2}[x]\\mid p(0)\\,p(1)=0\\}', isSub: false, why: m('p=x') + ' i ' + m('q=x-1') + ' hi són, però ' + m('p+q=2x-1') + ' té ' + m('(p+q)(0)(p+q)(1)=(-1)(1)\\neq0') + '. És la unió de dos subespais, no és subespai.' };
    },
    integer(rng) {
      return { tex: '\\{p(x)\\in\\mathbb{R}_{2}[x]\\mid \\text{tots els coeficients de } p \\text{ són enters}\\}', isSub: false, why: m('1\\in F') + ' però ' + m('\\tfrac12\\cdot 1\\notin F') + '. Falla el producte per escalars reals.' };
    },
    equal(rng) {
      const a = rng.pick([0, 1, -1]), b = rng.pick([2, 3]); const deg = 2; const sp = Sp.Pn('R', deg);
      const ra = evalRow(QQ, fr(a), deg), rb = evalRow(QQ, fr(b), deg);
      return { sp, tex: '\\{p(x)\\in\\mathbb{R}_{2}[x]\\mid p(' + a + ')=p(' + b + ')\\}', isSub: true, eqs: [ra.map((x, i) => x.sub(rb[i]))], why: m('p(' + a + ')-p(' + b + ')=0') + ' és una equació lineal homogènia en els coeficients.' };
    },
  };
  function polySubPart(item, idx) {
    let W = null, sol = H.P(item.why), refText = '';
    const sp = item.sp;
    if (item.isSub && !item.noCheck) {
      W = Sub.fromEqs(QQ, item.eqs, sp.dim);
      if (item.eqs.length) sol += G.coordIntro(sp) + G.nullSol(QQ, item.eqs, ['a_0', 'a_1', 'a_2', 'a_3', 'a_4'].slice(0, sp.dim), { sp }).html;
      sol += H.ans('Sí és subespai: ' + m('\\left\\langle ' + W.basis.map((v) => sp.tex(v)).join(',\\ ') + '\\right\\rangle'));
      refText = W.basis.map((v) => sp.str(v)).join(', ');
    } else if (item.isSub) sol += H.ans('Sí és subespai: ' + item.ans);
    else sol += H.ans('No és subespai.');
    if (item.noCheck) {
      return { id: 'p' + idx, kind: 'choice', label: m(item.tex), options: [{ v: 'si', label: 'Sí, és subespai' }, { v: 'no', label: 'No ho és' }], check: (v) => (v === 'si' ? EV.ok() : EV.bad('Sí que ho és.')), ref: 'si', sol };
    }
    const tsp = sp || Sp.Pn('R', 3);
    return {
      id: 'p' + idx, kind: 'yesplus', label: m(item.tex), F: QQ,
      options: [{ v: 'si', label: 'Sí, és subespai' }, { v: 'no', label: 'No ho és' }],
      text: { kind: 'elems', space: tsp, allowEmpty: false, placeholder: 'Generadors: x - 1, x^2 - 1' },
      textLabel: 'Sistema de generadors (polinomis)',
      check: (v) => {
        if (v.yes !== item.isSub) return EV.bad(item.isSub ? 'Sí que és subespai.' : 'No és subespai.');
        if (!item.isSub) return EV.ok();
        return C.gensOf(QQ, W, v.val || []);
      },
      ref: item.isSub ? { yes: 'si', text: refText } : { yes: 'no' }, sol,
    };
  }
  G.register({
    tid: 'e35', ex: 35, star: true, topic: 3, sec: '3.2',
    title: 'Subespais de polinomis', skill: 'Subespais de R[x]: reconèixer-los i donar generadors',
    make(rng) {
      const yes = rng.sample(['degle', 'root', 'deriv', 'sym', 'equal'], 2);
      const no = rng.sample(['even', 'rootval', 'product', 'integer'], 2);
      const items = rng.shuffle(yes.concat(no)).map((k) => ITEMS35[k](rng));
      return { statement: 'Determineu quins dels subconjunts següents de ' + m('\\mathbb{R}[x]') + ' són subespais vectorials. En cas afirmatiu, trobeu un sistema de generadors.', parts: items.map((it, i) => polySubPart(it, i)) };
    },
    original() {
      const a = { tex: '\\{p(x)\\in\\mathbb{R}[x]\\mid p(x)\\text{ és de grau }\\le 12\\}', isSub: true, noCheck: true, why: 'Tot polinomi de grau ' + m('\\le 12') + ' és ' + m('a_0+a_1x+\\dots+a_{12}x^{12}') + '. Sumant-ne dos, o multiplicant per un real, el grau continua sent ' + m('\\le12') + ', i el 0 també hi és (tots els ' + m('a_i=0') + ').', ans: m('\\langle 1,x,x^2,\\dots,x^{12}\\rangle') + ' (13 generadors)' };
      const b = { tex: '\\{p(x)\\in\\mathbb{R}[x]\\mid p(x)\\text{ és de grau parell}\\}', isSub: false, why: 'El polinomi zero no té grau 0 (per conveni grau ' + m('-1') + ' o ' + m('-\\infty') + ', no parell) ⇒ ' + m('0\\notin G') + '. Argument més segur (no depèn del conveni): ' + m('p=x^2+x') + ' i ' + m('q=-x^2') + ' tenen grau 2, però ' + m('p+q=x') + ' té grau 1. No és tancat per la suma.' };
      return { statement: 'Determineu quins dels subconjunts següents de ' + m('\\mathbb{R}[x]') + ' són subespais vectorials. En cas afirmatiu, trobeu un sistema de generadors del subespai.', parts: [polySubPart(a, 0), polySubPart(b, 1)] };
    },
  });

  /* =====================================================================
     37 · Pertinença u ∈ F
     ===================================================================== */
  function genTexList(sp, gens) { return gens.map((g) => sp.tex(sp.fromC(g))); }
  function membershipPart(sp, gens, u, label, coefNames) {
    const F = sp.F;
    const W = Sub.fromGens(F, gens, sp.dim);
    const isIn = W.contains(u);
    const ms = G.membershipSol(sp, gens, u, { coefNames });
    return {
      id: 'mem', kind: 'yesplus', label: label || ('Pertany ' + m('u') + ' a ' + m('F') + '? Si hi pertany, dona coeficients ' + m('a_1,\\dots,a_' + gens.length) + ' amb ' + m('u=a_1v_1+\\dots') + '.'),
      F, options: G.YN,
      text: { kind: 'scalars', F, placeholder: 'coeficients separats per comes, p. ex. -2, 2, 1, 0' }, textLabel: 'Coeficients',
      check: (v) => {
        if (v.yes !== isIn) return EV.bad(isIn ? 'Sí que hi pertany.' : 'No hi pertany.');
        if (!isIn) return EV.ok();
        const c = v.val;
        if (c.length !== gens.length) return EV.bad('Cal donar ' + gens.length + ' coeficients.');
        return L.eqV(F, L.combo(F, c, gens), u) ? EV.ok() : EV.bad('Aquesta combinació lineal no dóna u.');
      },
      ref: isIn ? { yes: 'si', text: ms.res.sol.map((a) => F.str(a)).join(', ') } : { yes: 'no' },
      sol: ms.html, isIn,
    };
  }
  function eqMemberPart(sp, A, u) {
    const F = sp.F;
    const val = L.mulVec(F, A, u);
    const isIn = L.isZeroV(F, val);
    const names = VARS.slice(0, sp.n);
    let sol;
    sol = H.P(m('F') + ' ve donat per equacions: n\'hi ha prou amb <b>substituir</b> ' + m('u=' + T.vec(F, u)) + ':');
    A.forEach((r, i) => {
      const terms = r.map((a, j) => (F.isZero(a) ? null : (F.isOne(a) ? '' : F.isNegOne(a) ? '-' : (EV.needsParens(F, a) ? '(' + F.tex(a) + ')' : F.tex(a))) + '\\cdot' + G.paren(F, u[j]))).filter(Boolean);
      sol += H.P(m(terms.join(' + ').replace(/\+ -/g, '- ') + ' = ' + F.tex(val[i])) + (F.isZero(val[i]) ? ' ✓' : ' ✗ (hauria de ser 0)'));
    });
    sol += H.ans(isIn ? m('u\\in F') : m('u\\notin F'));
    return { id: 'mem', kind: 'choice', label: 'Pertany ' + m('u') + ' a ' + m('F') + '?', options: G.YN, check: (v) => ((v === 'si') === isIn ? EV.ok() : EV.bad()), ref: isIn ? 'si' : 'no', sol };
  }

  function genMembership(rng, variant) {
    if (variant === 'Kn') {
      const sp = Sp.Kn('Q', 4); const F = QQ;
      const k = rng.pick([3, 4]); const r = k - (rng.bool(0.6) ? 1 : 0);
      const gens = G.familyRank(F, rng, k, 4, Math.min(r, 3), { bound: 3 });
      return { sp, gens };
    }
    if (variant === 'Pn') {
      const sp = Sp.Pn('R', 2);
      const gens = G.familyRank(QQ, rng, 4, 3, 2, { bound: 7, ubound: 4, noZeroCols: true });
      return { sp, gens };
    }
    if (variant === 'Mmn') {
      const sp = Sp.Mmn('R', 2, 2);
      const gens = G.familyRank(QQ, rng, 3, 4, rng.pick([2, 3]), { bound: 5 });
      // a vegades amb meitats
      if (rng.bool(0.4)) gens[0] = gens[0].map((a) => a.div(fr(2)));
      return { sp, gens };
    }
    return null;
  }
  function pickU(F, rng, gens, n, wantIn) {
    const W = Sub.fromGens(F, gens, n);
    const basisIdx = L.maximalSubfamily(F, gens).idx;
    let u = L.combo(F, G.smallCoefs(F, rng, basisIdx.length, { allNonzero: true }), basisIdx.map((i) => gens[i]));
    if (!wantIn) {
      for (let t = 0; t < 50; t++) {
        const e = Array(n).fill(F.zero); e[rng.int(0, n - 1)] = F.fromInt(rng.nz(-2, 2));
        const w = L.addV(F, u, e);
        if (!W.contains(w)) return w;
      }
    }
    return u;
  }

  G.register({
    tid: 'e37', ex: 37, star: true, topic: 3, sec: '3.2 · 3.9 (Tasca 1)',
    title: 'Pertany u al subespai F?', skill: 'Pertinença d\'un vector a un subespai (generadors o equacions)',
    variants: [{ v: 'Kn', label: 'ℚ⁴ amb generadors' }, { v: 'Pn', label: 'Polinomis' }, { v: 'Mmn', label: 'Matrius 2×2' }, { v: 'eq', label: 'ℂ⁴ amb equació' }],
    make(rng, opts) {
      const variant = (opts && opts.variant) || rng.pick(['Kn', 'Pn', 'Mmn', 'eq']);
      if (variant === 'eq') {
        const sp = Sp.Kn('C', 4); const F = CC;
        const row = [G.rnd(F, rng, -3, 3, { pIm: 0.7 }), F.zero, G.rnd(F, rng, 1, 3, { pIm: 0.5 }), rng.bool(0.4) ? G.rnd(F, rng, -2, 2) : F.zero];
        if (F.isZero(row[0])) row[0] = F.I;
        const A = [row];
        // u: solució o no
        const ns = L.nullspace(F, A).basis;
        let u = L.combo(F, G.smallCoefs(F, rng, ns.length), ns);
        if (rng.bool(0.4)) u = L.addV(F, u, [F.zero, F.zero, F.one, F.zero]);
        const names = VARS.slice(0, 4);
        return {
          statement: 'Determineu si el vector ' + m('u=' + T.vec(F, u)) + ' pertany al subespai ' + m('F=\\{(x,y,z,t)\\in\\mathbb{C}^4\\mid ' + eqTex(F, row, names) + '\\}\\subseteq\\mathbb{C}^4') + '.',
          parts: [eqMemberPart(sp, A, u)],
        };
      }
      const { sp, gens } = genMembership(rng, variant);
      const u = pickU(sp.F, rng, gens, sp.dim, rng.bool(0.6));
      const st = 'Determineu si el vector ' + m('u=' + sp.tex(sp.fromC(u))) + ' pertany al subespai ' + m('F=' + T.span(genTexList(sp, gens), sp.K) + '\\subseteq ' + (sp.kind === 'Pn' ? '\\mathbb{R}[x]' : sp.name)) + '.';
      return { statement: st, parts: [membershipPart(sp, gens, u)] };
    },
    original() {
      const F = QQ; const q = (M) => L.fromInts(F, M);
      const sp1 = Sp.Kn('Q', 4); const g1 = q([[1, 0, -1, 0], [1, 1, 1, 0], [0, 1, 1, 1], [0, 1, 2, 0]]); const u1 = q([[0, 3, 5, 1]])[0];
      const sp2 = Sp.Pn('R', 2); const g2 = q([[7, 1, 0], [4, 1, 1], [-10, -1, 1], [1, 1, 2]]); const u2 = q([[4, -2, 1]])[0];
      const sp3 = Sp.Mmn('R', 2, 2); const g3 = q([[0, '-1/2', 4, 3], [2, 4, 8, '5/2'], [0, 1, 2, 1]]); const u3 = q([[3, 2, '3/2', -2]])[0];
      const sp4 = Sp.Kn('C', 4); const A4 = [[CC.I, CC.zero, CC.fromInt(3), CC.zero]]; const u4 = [cx(3), cx(0), cx(0, -1), cx(5, 1)];
      const p1 = membershipPart(sp1, g1, u1, m('k=1') + ': ' + m('u_1=(0,3,5,1)\\in F_1=\\langle(1,0,-1,0),(1,1,1,0),(0,1,1,1),(0,1,2,0)\\rangle_{\\mathbb{Q}}') + '? Si hi pertany, dona coeficients.'); p1.id = 'k1';
      const p2 = membershipPart(sp2, g2, u2, m('k=2') + ': ' + m('u_2=x^2-2x+4\\in F_2=\\langle x+7,\\,x^2+x+4,\\,x^2-x-10,\\,2x^2+x+1\\rangle_{\\mathbb{R}}') + '?'); p2.id = 'k2';
      const p3 = membershipPart(sp3, g3, u3, m('k=3') + ': ' + m('u_3=\\begin{pmatrix}3&2\\\\3/2&-2\\end{pmatrix}\\in F_3') + '? Si hi pertany, dona coeficients.'); p3.id = 'k3';
      const p4 = eqMemberPart(sp4, A4, u4); p4.id = 'k4'; p4.label = m('k=4') + ': ' + m('u_4=(3,0,-i,5+i)\\in F_4=\\{ix+3z=0\\}') + '?';
      return {
        statement: 'Determineu si el vector ' + m('u_k') + ' pertany al subespai ' + m('F_k') + ', per ' + m('k=1,2,3,4') + ':' + dm('\\begin{aligned}&u_1=(0,3,5,1), && F_1=\\langle(1,0,-1,0),(1,1,1,0),(0,1,1,1),(0,1,2,0)\\rangle_{\\mathbb{Q}}\\subseteq\\mathbb{Q}^4,\\\\ &u_2=x^2-2x+4, && F_2=\\langle x+7,x^2+x+4,x^2-x-10,2x^2+x+1\\rangle_{\\mathbb{R}}\\subseteq\\mathbb{R}[x],\\\\ &u_3=\\begin{pmatrix}3&2\\\\3/2&-2\\end{pmatrix}, && F_3=\\left\\langle\\begin{pmatrix}0&-1/2\\\\4&3\\end{pmatrix},\\begin{pmatrix}2&4\\\\8&5/2\\end{pmatrix},\\begin{pmatrix}0&1\\\\2&1\\end{pmatrix}\\right\\rangle_{\\mathbb{R}}\\subseteq M_2(\\mathbb{R}),\\\\ &u_4=(3,0,-i,5+i), && F_4=\\{(x,y,z,t)\\in\\mathbb{C}^4\\mid ix+3z=0\\}\\subseteq\\mathbb{C}^4.\\end{aligned}'),
        parts: [p1, p2, p3, p4],
        notes: H.box('note', 'A classe (16/11)', 'Només es va fer ' + m('k=1') + ' (SCI: ' + m('x=t-2,\\ y=2-t,\\ z=1') + '). Resum: ' + m('u_1\\in F_1,\\ u_2\\notin F_2,\\ u_3\\in F_3,\\ u_4\\in F_4') + '. Que ' + m('k=1') + ' sigui SCI vol dir que els generadors de ' + m('F_1') + ' són LD: ' + m('v_4=v_2-v_1') + '.'),
      };
    },
  });

  /* =====================================================================
     38 · F ⊊ G
     ===================================================================== */
  function inclusionExercise(F, sp, gensF, eqG, opts) {
    opts = opts || {};
    const n = sp.n;
    const WG = Sub.fromEqs(F, [eqG], n);
    const WF = Sub.fromGens(F, gensF, n);
    const inc = gensF.every((g) => WG.contains(g));
    const dimF = WF.dim, dimG = WG.dim;
    const equal = inc && dimF === dimG;
    const names = VARS.slice(0, n);
    // equació de G com a "a x + b y + c z = t" si el coef de t és -1
    const gTex = opts.gTex || (eqTex(F, eqG, names));
    const parts = [];
    // (a) inclusió
    let solA = H.P('Comprovem si <b>cada generador</b> de ' + m('F') + ' compleix l\'equació de ' + m('G') + ' (' + m(gTex) + '):');
    gensF.forEach((g) => {
      const v = L.mulVec(F, [eqG], g)[0];
      solA += H.P(m(T.vec(F, g)) + ': ' + m(T.linexpr(F, eqG, g.map((a) => G.paren(F, a))).replace(/([0-9])\(/g, '$1\\cdot(') + ' = ' + F.tex(v)) + (F.isZero(v) ? ' ✓' : ' ✗'));
    });
    solA += inc ? H.P('Com que ' + m('G') + ' és subespai, també conté totes les combinacions lineals dels generadors ⇒ ' + m('F\\subseteq G') + '.') : H.P('Un generador de ' + m('F') + ' no és de ' + m('G') + ' ⇒ ' + m('F\\not\\subseteq G') + '.');
    solA += warn38;
    parts.push({ id: 'inc', kind: 'choice', label: 'És ' + m('F\\subseteq G') + '?', options: G.YN, check: (v) => ((v === 'si') === inc ? EV.ok() : EV.bad()), ref: inc ? 'si' : 'no', sol: solA + H.ans(inc ? m('F\\subseteq G') : m('F\\not\\subseteq G')) });
    // (b) dim F
    const sb = G.spanBasisSol(sp, gensF);
    parts.push({ id: 'dimF', kind: 'int', label: m('\\dim F') + ' =', check: (v) => (v === dimF ? EV.ok() : EV.bad()), ref: String(dimF), sol: sb.html + H.ans(m('\\dim F=' + dimF)) });
    // (c) dim G
    const nsG = G.nullSol(F, [eqG], names);
    parts.push({ id: 'dimG', kind: 'int', label: m('\\dim G') + ' =', check: (v) => (v === dimG ? EV.ok() : EV.bad()), ref: String(dimG), sol: H.P(m('G') + ' és el conjunt de solucions d\'una equació lineal homogènia no nul·la a ' + m(sp.name) + ': ' + m('\\dim G=' + n + '-1=' + (n - 1)) + '.') + nsG.html });
    // (d) F = G?
    let solD = '';
    if (!inc) solD = H.P(m('F\\not\\subseteq G') + ' ⇒ ' + m('F\\neq G') + '.');
    else if (equal) solD = H.P(m('F\\subseteq G') + ' i ' + m('\\dim F=\\dim G=' + dimF) + ' ⇒ ' + m('F=G') + ' (Prop. 3.19 D3).');
    else solD = H.P(m('F\\subseteq G') + ' però ' + m('\\dim F=' + dimF + '<' + dimG + '=\\dim G') + ' ⇒ ' + m('F\\neq G') + ', és a dir, ' + m('F\\subsetneq G') + '.');
    parts.push({ id: 'eq', kind: 'choice', label: 'És ' + m('F=G') + '?', options: G.YN, check: (v) => ((v === 'si') === equal ? EV.ok() : EV.bad()), ref: equal ? 'si' : 'no', sol: solD });
    // (e) vector de G no de F
    // candidats: generadors "aïllant l'última variable" (com a classe) i després la base del nucli sense fraccions
    const cands = [];
    if (F.isNegOne(eqG[n - 1])) for (let j = 0; j < n - 1; j++) { const e = Array(n).fill(F.zero); e[j] = F.one; e[n - 1] = eqG[j]; cands.push(e); }
    nsG.basis.forEach((b) => cands.push(L.clearDen(F, b)));
    const witness = cands.find((b) => !WF.contains(b));
    let solE;
    if (witness) {
      const ms = G.membershipSol(sp, WF.basis.length ? WF.basis : gensF, witness, {});
      solE = H.P('Provem amb els generadors de ' + m('G') + ' (algun no pot ser de ' + m('F') + ' si ' + m('\\dim F<\\dim G') + '). ' + m(T.vec(F, witness) + '\\in G') + '; és de ' + m('F') + '?') + ms.html;
    } else solE = H.P('Tot vector de ' + m('G') + ' és de ' + m('F') + ' (' + m('G\\subseteq F') + ').');
    parts.push({
      id: 'wit', kind: 'yesplus', label: 'Hi ha algun vector de ' + m('G') + ' que no sigui de ' + m('F') + '? Si n\'hi ha, dona\'n un.', F, options: G.YN,
      text: { kind: 'vector', F, n, placeholder: '(1, 0, 0, 3)' }, textLabel: 'Vector',
      check: (v) => {
        const exists = !!witness;
        if (v.yes !== exists) return EV.bad(exists ? 'Sí que n\'hi ha.' : 'No n\'hi ha: G ⊆ F.');
        if (!exists) return EV.ok();
        if (!WG.contains(v.val)) return EV.bad('Aquest vector no és de G.');
        if (WF.contains(v.val)) return EV.bad('Aquest vector és de F.');
        return EV.ok();
      },
      ref: witness ? { yes: 'si', text: S.vecStr(F, witness) } : { yes: 'no' }, sol: solE,
    });
    return parts;
  }
  const warn38 = H.warn('Per veure ' + m('F\\subseteq G') + ' n\'hi ha prou amb comprovar els <b>generadors</b> de ' + m('F') + ' (perquè ' + m('G') + ' és subespai i és tancat per combinacions lineals). Per veure ' + m('F\\neq G') + ' cal un vector de ' + m('G') + ' que no sigui de ' + m('F') + ', o bé comparar dimensions.');

  G.register({
    tid: 'e38', ex: 38, star: true, topic: 3, sec: '3.2 · 3.4',
    title: 'Inclusió de subespais F ⊊ G', skill: 'Inclusió i igualtat de subespais',
    make(rng) {
      const F = QQ; const sp = Sp.Kn('R', 4);
      // G: a x + b y + c z = t
      const a = rng.int(-3, 3), b = rng.nz(-5, 5), c = rng.int(-6, 6);
      const eqG = [fr(a), fr(b), fr(c), fr(-1)];
      const WG = Sub.fromEqs(F, [eqG], 4);
      const mode = rng.pick(['proper', 'proper', 'proper', 'equal', 'notin']);
      const r = mode === 'equal' ? 3 : 2;
      // generadors dins G: combinacions de la base de G
      let gens;
      for (let t = 0; t < 100; t++) {
        const Cm = G.rankMatrix(F, rng, 3, 3, r, { bound: 2, noZeroRows: true });
        gens = Cm.map((row) => L.combo(F, row, WG.basis));
        if (G.maxAbs(F, gens) <= 9) break;
      }
      if (mode === 'notin') gens[rng.int(0, 2)] = L.addV(F, gens[0], [F.zero, F.zero, F.zero, F.one]);
      gens = rng.shuffle(gens);
      const gTex = T.linexpr(F, [fr(a), fr(b), fr(c)], ['x', 'y', 'z']) + ' = t';
      return {
        statement: 'Considerem els subespais de ' + m('\\mathbb{R}^4') + ':' + dm('F=' + T.span(gens.map((g) => T.vec(F, g)), '\\mathbb{R}') + ',\\qquad G=\\{(x,y,z,t)\\in\\mathbb{R}^4\\mid ' + gTex + '\\}.') + 'Estudieu la relació entre ' + m('F') + ' i ' + m('G') + ' (és ' + m('F\\subsetneq G') + '?).',
        parts: inclusionExercise(F, sp, gens, eqG, { gTex }),
      };
    },
    original() {
      const F = QQ; const sp = Sp.Kn('R', 4);
      const gens = L.fromInts(F, [[2, -4, -3, 4], [0, 1, 1, -1], [2, -1, 0, 1]]);
      const eqG = L.fromInts(F, [[3, 5, -6, -1]])[0];
      return {
        statement: 'Considerem els subespais següents de ' + m('\\mathbb{R}^4') + ':' + dm('F=\\langle(2,-4,-3,4),(0,1,1,-1),(2,-1,0,1)\\rangle_{\\mathbb{R}},\\qquad G=\\{(x,y,z,t)\\in\\mathbb{R}^4\\mid 3x+5y-6z=t\\}.') + 'Proveu que ' + m('F\\subsetneq G') + '. (És a dir, ' + m('F\\subseteq G') + ' i ' + m('F\\neq G') + '.)',
        parts: inclusionExercise(F, sp, gens, eqG, { gTex: '3x+5y-6z=t' }),
        notes: H.box('note', 'A classe (16/11)', 'Es va provar ' + m('G\\not\\subseteq F') + ' veient que ' + m('(1,0,0,3)\\in G') + ' (generador de ' + m('G') + ' aïllant ' + m('t') + ') no és de ' + m('F') + ' (surt ' + m('0=-\\tfrac12') + '). Mètode alternatiu: ' + m('(2,-4,-3,4)+3(0,1,1,-1)=(2,-1,0,1)') + ' ⇒ ' + m('\\dim F=2\\neq3=\\dim G') + '.'),
      };
    },
  });

  /* =====================================================================
     40 · Famílies LD: relació i vector de dues maneres
     ===================================================================== */
  function ldExercise(sp, fam) {
    const F = sp.F; const k = fam.length;
    const rr = L.rref(F, L.transpose(fam));
    const LD = rr.rank < k;
    const ns = L.nullspace(F, L.transpose(fam));
    const rel = ns.basis.length ? L.clearDen(F, ns.basis[0]) : null;
    const names = fam.map((_, i) => 'v_{' + (i + 1) + '}');
    let sol = G.coordIntro(sp);
    if (sp.kind !== 'Kn') sol += '<div class="coordlist">' + fam.map((g) => G.coordLine(sp, g)).join('<br>') + '</div>';
    sol += H.P('Posem els vectors <b>en columnes</b> i resolem ' + m(names.map((x, i) => '\\lambda_{' + (i + 1) + '}' + x).join('+') + '=0') + ' (Corol·lari 3.6: LI ' + m('\\iff') + ' rang = nombre de vectors):');
    sol += H.chain(F, rr, { aug: 0 });
    if (!LD) sol += H.P(m('\\operatorname{rang}=' + rr.rank + '=' + k) + ' ⇒ només la solució trivial ⇒ <b>LI</b>.') + H.ans('LI');
    else {
      sol += H.P(m('\\operatorname{rang}=' + rr.rank + '<' + k) + ' ⇒ <b>LD</b>. Una solució no trivial (donant valor a les variables lliures): ' + m('(' + rel.map((a) => F.tex(a)).join(',') + ')') + ', és a dir,');
      sol += dm(T.lincomb(F, rel, names) + ' = 0.');
    }
    const parts = [{
      id: 'ld', kind: 'yesplus', label: 'És una família LD? Si ho és, dona els coeficients ' + m('(\\lambda_1,\\dots,\\lambda_' + k + ')\\neq 0') + ' d\'una relació ' + m('\\sum\\lambda_iv_i=0') + '.', F, options: G.YN,
      text: { kind: 'scalars', F, placeholder: 'p. ex. 1, -1, 2, 0' }, textLabel: 'Coeficients de la relació',
      check: (v) => {
        if (v.yes !== LD) return EV.bad(LD ? 'Sí que és LD.' : 'És LI.');
        if (!LD) return EV.ok();
        const c = v.val;
        if (c.length !== k) return EV.bad('Cal donar ' + k + ' coeficients.');
        if (c.every((a) => F.isZero(a))) return EV.bad('La relació trivial (tot zeros) no compta.');
        return L.isZeroV(F, L.combo(F, c, fam)) ? EV.ok() : EV.bad('Aquesta combinació no dóna 0.');
      },
      ref: LD ? { yes: 'si', text: rel.map((a) => F.str(a)).join(', ') } : { yes: 'no' },
      sol,
    }];
    // vector de dues maneres
    let sol2;
    let ref2 = { yes: 'no' };
    if (LD) {
      const a = Array(k).fill(F.zero); a[0] = F.one;
      const b = L.addV(F, a, rel);
      sol2 = H.P('Si ' + m('\\sum\\lambda_i v_i=0') + ' amb ' + m('\\lambda\\neq0') + ', qualsevol combinació admet una segona expressió sumant-hi la relació. Per exemple, ' + m('w=v_1') + ':');
      sol2 += dm('w = v_1 = ' + T.lincomb(F, b, names) + '.');
      sol2 += H.P('Comprovació: ' + m(sp.tex(sp.fromC(L.combo(F, b, fam)))) + ' = ' + m(sp.tex(sp.fromC(fam[0]))) + ' ✓');
      ref2 = { yes: 'si', text: S.vecStr(F, a) + ', ' + S.vecStr(F, b) };
    } else sol2 = H.P('Si la família és LI, cada vector de ' + m('\\langle v_1,\\dots\\rangle') + ' s\'escriu d\'una <b>única</b> manera (Teorema 3.5: ' + m('\\ell_B') + ' injectiva).');
    parts.push({
      id: 'two', kind: 'yesplus', label: 'Hi ha algun vector que sigui combinació lineal de la família de dues maneres diferents? Si n\'hi ha, dona les dues llistes de coeficients.', F, options: G.YN,
      text: { kind: 'vectors', F, n: k, placeholder: 'dues llistes entre parèntesis: (1,0,0,0), (2,-1,1,0)' }, textLabel: 'Les dues llistes de coeficients',
      check: (v) => {
        if (v.yes !== LD) return EV.bad(LD ? 'Sí que n\'hi ha (la família és LD).' : 'No: la família és LI.');
        if (!LD) return EV.ok();
        if (v.val.length !== 2) return EV.bad('Cal donar exactament dues llistes.');
        const [a, b] = v.val;
        if (L.eqV(F, a, b)) return EV.bad('Les dues llistes han de ser diferents.');
        return L.eqV(F, L.combo(F, a, fam), L.combo(F, b, fam)) ? EV.ok() : EV.bad('Les dues combinacions no donen el mateix vector.');
      },
      ref: ref2, sol: sol2,
    });
    return parts;
  }
  G.register({
    tid: 'e40', ex: 40, star: true, topic: 3, sec: '3.3',
    title: 'Famílies LD i combinacions de dues maneres', skill: 'Dependència lineal (K^n, polinomis, matrius)',
    variants: [{ v: 'Kn', label: 'ℝ⁴' }, { v: 'Pn', label: 'ℝ₃[x]' }, { v: 'Mmn', label: 'M₂ₓ₃(ℚ)' }],
    make(rng, opts) {
      const variant = (opts && opts.variant) || rng.pick(['Kn', 'Pn', 'Mmn']);
      const LD = rng.bool(0.7);
      let sp, fam;
      if (variant === 'Kn') { sp = Sp.Kn('R', 4); fam = G.familyRank(QQ, rng, 4, 4, LD ? rng.pick([2, 3]) : 4, { bound: 6 }); }
      else if (variant === 'Pn') { sp = Sp.Pn('R', 3); fam = G.familyRank(QQ, rng, 4, 4, LD ? 3 : 4, { bound: 7 }); }
      else { sp = Sp.Mmn('Q', 2, 3); fam = G.familyRank(QQ, rng, 3, 6, LD ? 2 : 3, { bound: 6 }); }
      const st = 'Determineu si la família següent és LD i, en cas afirmatiu, trobeu un vector que sigui combinació lineal de la família de dues maneres diferents:' + dm(fam.map((v) => sp.tex(sp.fromC(v))).join(',\\quad ') + '\\ \\in ' + (sp.kind === 'Pn' ? '\\mathbb{R}[x]' : sp.name));
      return { statement: st, parts: ldExercise(sp, fam) };
    },
    original() {
      const q = (M) => L.fromInts(QQ, M);
      const a = ldExercise(Sp.Kn('R', 4), q([[0, -2, 3, 6], [0, '1/3', '-1/2', -1], [0, 3, -2, -4], [0, 0, 1, 2]]));
      const b = ldExercise(Sp.Pn('R', 3), q([[-1, 0, 0, 1], [-1, 0, 1, 0], [-1, 1, 0, 0], [-2, -7, 4, 5]]));
      const c = ldExercise(Sp.Mmn('Q', 2, 3), q([[1, 2, 3, 4, 5, 6], [4, 5, 6, 1, 2, 3], [1, 2, 6, 4, 5, 3]]));
      const tag = (ps, t) => ps.map((p) => Object.assign(p, { id: t + p.id, label: '(' + t + ') ' + p.label }));
      return {
        statement: 'Determineu quines de les famílies de vectors següents són LD, i per a les que ho siguin trobeu un vector que sigui combinació lineal de la família de dues maneres diferents.' + dm('\\begin{aligned}&(a)\\ (0,-2,3,6),\\ (0,\\tfrac13,-\\tfrac12,-1),\\ (0,3,-2,-4),\\ (0,0,1,2)\\in\\mathbb{R}^4\\\\&(b)\\ x^3-1,\\ x^2-1,\\ x-1,\\ 5x^3+4x^2-7x-2\\in\\mathbb{R}[x]\\\\&(c)\\ \\begin{pmatrix}1&2&3\\\\4&5&6\\end{pmatrix},\\begin{pmatrix}4&5&6\\\\1&2&3\\end{pmatrix},\\begin{pmatrix}1&2&6\\\\4&5&3\\end{pmatrix}\\in M_{2\\times3}(\\mathbb{Q})\\end{aligned}'),
        parts: tag(a, 'a').concat(tag(b, 'b'), tag(c, 'c')),
      };
    },
  });

  /* =====================================================================
     41 · Cert o fals (LI / SG)
     ===================================================================== */
  const TF = [
    { k: 'a', s: 'e_1,e_2,e_3 \\text{ LI} \\implies e_1,e_3 \\text{ LI}', t: true, w: 'Una subfamília d\'una família LI és LI: si ' + m('\\lambda_1e_1+\\lambda_3e_3=0') + ', aleshores ' + m('\\lambda_1e_1+0e_2+\\lambda_3e_3=0') + ' i per ser LI ' + m('\\lambda_1=\\lambda_3=0') + '.' },
    { k: 'b', s: 'e_1,e_2,e_3 \\text{ LD} \\implies e_1,e_3 \\text{ LD}', t: false, w: 'Contraexemple a ' + m('\\mathbb{R}^2') + ': ' + m('e_1=(1,0),\\ e_2=(1,1),\\ e_3=(0,1)') + '. Són LD (3 vectors a ' + m('\\mathbb{R}^2') + ') però ' + m('e_1,e_3') + ' són LI.' },
    { k: 'c', s: 'e_1,e_2,e_3 \\text{ LI},\\ v\\notin\\{e_1,e_2,e_3\\} \\implies e_1,e_2,e_3,v \\text{ LI}', t: false, w: 'No ser un dels tres vectors no vol dir no ser combinació d\'ells. Contraexemple: ' + m('v=e_1+e_2') + ' (diferent de cada ' + m('e_i') + ') i la família ampliada és LD.' },
    { k: 'd', s: 'e_1,e_2,e_3 \\text{ LI},\\ v\\notin\\langle e_1,e_2,e_3\\rangle_K \\implies e_1,e_2,e_3,v \\text{ LI}', t: true, w: 'És el Lema 3.7. Si ' + m('\\lambda_1e_1+\\lambda_2e_2+\\lambda_3e_3+\\mu v=0') + ' amb ' + m('\\mu\\neq0') + ', aïllant ' + m('v') + ' seria CL dels ' + m('e_i') + '. Per tant ' + m('\\mu=0') + ' i, per ser ' + m('e_i') + ' LI, tots zero.' },
    { k: 'e', s: 'e_1,e_2,e_3,v \\text{ LD} \\implies v\\in\\langle e_1,e_2,e_3\\rangle_K', t: false, w: 'La dependència pot venir dels ' + m('e_i') + '. Contraexemple a ' + m('\\mathbb{R}^3') + ': ' + m('e_1=e_2=(1,0,0),\\ e_3=(0,1,0),\\ v=(0,0,1)') + '. És LD (' + m('e_1-e_2=0') + ') però ' + m('v\\notin\\langle e_1,e_2,e_3\\rangle') + '. (Sí que seria cert si ' + m('e_1,e_2,e_3') + ' fossin LI.)' },
    { k: 'f', s: 'e_1,e_2,e_3 \\text{ SG de } E,\\ e_3\\in\\langle e_1,e_2\\rangle_K \\implies e_1,e_2 \\text{ SG de } E', t: true, w: 'Lema 3.2: ' + m('e_3\\in\\langle e_1,e_2\\rangle\\iff\\langle e_1,e_2\\rangle=\\langle e_1,e_2,e_3\\rangle=E') + '.' },
    { k: 'g', s: 'e_1,e_2,e_3 \\text{ SG de } E \\implies e_1,e_2,e_3,v \\text{ SG de } E', t: true, w: 'Afegir vectors (de ' + m('E') + ') a un sistema de generadors continua generant: ' + m('E=\\langle e_1,e_2,e_3\\rangle\\subseteq\\langle e_1,e_2,e_3,v\\rangle\\subseteq E') + '.' },
    { k: 'h', s: 'e_1,e_2,e_3 \\text{ SG de } E,\\ v\\notin\\langle e_1,e_2\\rangle_K \\implies e_1,e_2,v \\text{ SG de } E', t: true, w: 'Sigui ' + m('W=\\langle e_1,e_2\\rangle') + '. Com que ' + m('E=W+\\langle e_3\\rangle') + ', ' + m('\\dim E\\le\\dim W+1') + '. Com que ' + m('v\\in E\\setminus W') + ', ' + m('\\dim\\langle e_1,e_2,v\\rangle=\\dim W+1\\ge\\dim E') + ', i per D3 ' + m('\\langle e_1,e_2,v\\rangle=E') + '. (Directament: escrivint ' + m('v=a e_1+b e_2+c e_3') + ', ha de ser ' + m('c\\neq0') + ' i aleshores ' + m('e_3=\\frac1c(v-ae_1-be_2)') + '.)' },
    { k: 'i', s: 'e_1,e_2,e_3,v \\text{ LI} \\iff e_1,2e_2,3e_3,4v \\text{ LI}', t: true, w: 'Si ' + m('K=\\mathbb{R},\\mathbb{Q},\\mathbb{C}') + ': ' + m('2,3,4\\neq0') + ', i ' + m('\\lambda_1e_1+\\lambda_2(2e_2)+\\dots=0\\iff\\lambda_1e_1+(2\\lambda_2)e_2+\\dots=0') + '; els coeficients són tots zero en un cas si i només si ho són en l\'altre. <b>Compte</b>: a ' + m('K=\\mathbb{Z}_2') + ' és fals, perquè ' + m('2e_2=0') + ' i una família amb el 0 és LD.', note: 'Cert per a ' + m('K=\\mathbb{R},\\mathbb{Q},\\mathbb{C}') + ' (fals a ' + m('\\mathbb{Z}_2') + ').' },
    // extra
    { s: '\\dim E=3,\\ e_1,e_2,e_3 \\text{ SG de } E \\implies e_1,e_2,e_3 \\text{ base}', t: true, w: 'Prop. 3.19 (D2): en un espai de dimensió ' + m('n') + ', ' + m('n') + ' vectors que generen són base.' },
    { s: '\\dim E=3 \\implies \\text{quatre vectors qualssevol de } E \\text{ són LD}', t: true, w: 'Prop. 3.19 (D1): una família LI té com a molt ' + m('\\dim E') + ' vectors.' },
    { s: 'e_1,e_2 \\text{ LI},\\ e_1,e_3\\text{ LI},\\ e_2,e_3 \\text{ LI} \\implies e_1,e_2,e_3 \\text{ LI}', t: false, w: 'Contraexemple: ' + m('(1,0),(0,1),(1,1)\\in\\mathbb{R}^2') + ': dos a dos són LI però els tres són LD (' + m('e_3=e_1+e_2') + ').' },
    { s: '(K=\\mathbb{R})\\quad e_1,e_2,e_3 \\text{ LI} \\implies e_1+e_2,\\ e_2+e_3,\\ e_1+e_3 \\text{ LI}', t: true, w: m('a(e_1+e_2)+b(e_2+e_3)+c(e_1+e_3)=(a+c)e_1+(a+b)e_2+(b+c)e_3=0') + ' ⇒ ' + m('a+c=a+b=b+c=0') + ' ⇒ ' + m('2(a+b+c)=0') + ' ⇒ ' + m('a=b=c=0') + '.' },
    { s: '(K=\\mathbb{Z}_2)\\quad e_1,e_2,e_3 \\text{ LI} \\implies e_1+e_2,\\ e_2+e_3,\\ e_1+e_3 \\text{ LI}', t: false, w: 'A ' + m('\\mathbb{Z}_2') + ': ' + m('(e_1+e_2)+(e_2+e_3)+(e_1+e_3)=2e_1+2e_2+2e_3=0') + '. Relació no trivial ⇒ LD. (Precisament el pas "dividir per 2" falla.)' },
    { s: 'e_1,e_2,e_3 \\text{ LI} \\implies e_1-e_2,\\ e_2-e_3,\\ e_3-e_1 \\text{ LI}', t: false, w: m('(e_1-e_2)+(e_2-e_3)+(e_3-e_1)=0') + ': relació no trivial ⇒ LD.' },
    { s: '0\\in\\{e_1,e_2,e_3\\} \\implies e_1,e_2,e_3 \\text{ LD}', t: true, w: 'Si ' + m('e_1=0') + ', ' + m('1\\cdot e_1+0e_2+0e_3=0') + ' és una relació no trivial.' },
    { s: 'e_1,e_2 \\text{ LI} \\implies e_1,\\ e_1+e_2 \\text{ LI}', t: true, w: m('ae_1+b(e_1+e_2)=(a+b)e_1+be_2=0\\Rightarrow b=0,\\ a+b=0\\Rightarrow a=0') + '.' },
    { s: 'e_1,e_2,e_3 \\text{ SG de } E \\implies \\dim E\\le 3', t: true, w: 'D1: ' + m('\\dim E\\le') + ' nombre de generadors.' },
    { s: 'e_1,e_2,e_3 \\text{ SG de } E \\implies \\dim E= 3', t: false, w: 'Els generadors poden ser LD. Ex.: ' + m('(1,0),(0,1),(1,1)') + ' generen ' + m('\\mathbb{R}^2') + ' i ' + m('\\dim=2') + '.' },
    { s: 'u\\in\\langle e_1,e_2\\rangle,\\ u\\neq0 \\implies e_1\\in\\langle u,e_2\\rangle', t: false, w: 'Cal que el coeficient de ' + m('e_1') + ' a ' + m('u') + ' sigui no nul. Contraexemple: ' + m('e_1,e_2') + ' LI i ' + m('u=e_2') + ': ' + m('\\langle u,e_2\\rangle=\\langle e_2\\rangle\\not\\ni e_1') + '.' },
    { s: 'F,G \\text{ subespais de } E \\implies F\\cup G \\text{ és subespai}', t: false, w: 'Els dos eixos de ' + m('\\mathbb{R}^2') + ': ' + m('(1,0)+(0,1)=(1,1)') + ' no és de cap dels dos. (En canvi ' + m('F\\cap G') + ' i ' + m('F+G') + ' sí que són subespais.)' },
    { s: 'F,G \\text{ subespais de } E \\implies F\\cap G \\text{ és subespai}', t: true, w: 'Si ' + m('u,v\\in F\\cap G') + ', ' + m('u+v') + ' i ' + m('au') + ' són de ' + m('F') + ' i de ' + m('G') + ' perquè tots dos són subespais; i ' + m('0\\in F\\cap G') + '.' },
    { s: 'v\\in\\langle e_1,e_2,e_3\\rangle \\iff \\langle e_1,e_2,e_3,v\\rangle=\\langle e_1,e_2,e_3\\rangle', t: true, w: 'Lema 3.2.' },
    { s: 'e_1,e_2,e_3 \\text{ LI a } E \\text{ i } \\dim E=3 \\implies \\text{generen } E', t: true, w: 'D2.' },
  ];
  function tfPart(item, idx) {
    return {
      id: 'tf' + idx, kind: 'choice', label: (item.k ? '(' + item.k + ') ' : '') + m(item.s), options: [{ v: 'c', label: 'Cert' }, { v: 'f', label: 'Fals' }],
      check: (v) => ((v === 'c') === item.t ? EV.ok() : EV.bad()), ref: item.t ? 'c' : 'f',
      sol: H.P('<b>' + (item.t ? 'Cert' : 'Fals') + '.</b> ' + item.w) + (item.note ? H.P('<i>' + item.note + '</i>') : ''),
    };
  }
  G.register({
    tid: 'e41', ex: 41, star: true, topic: 3, sec: '3.3 · 3.4',
    title: 'Cert o fals: LI, LD i sistemes de generadors', skill: 'Raonament teòric amb LI / SG',
    make(rng) {
      const items = rng.sample(TF, 6);
      return { statement: 'Siguin ' + m('v,e_1,e_2,e_3') + ' vectors d\'un ' + m('K') + '-espai vectorial ' + m('E') + '. Demostreu o doneu un contraexemple de les afirmacions següents segons siguin certes o falses:', parts: items.map((it, i) => tfPart(Object.assign({}, it, { k: undefined }), i)) };
    },
    original() {
      return { statement: 'Siguin ' + m('v,e_1,e_2,e_3') + ' vectors d\'un ' + m('K') + '-espai vectorial ' + m('E') + '. Demostreu o doneu un contraexemple de les afirmacions següents segons siguin certes o falses:', parts: TF.slice(0, 9).map((it, i) => tfPart(it, i)) };
    },
  });

  /* =====================================================================
     42 · Base de C^3 i coordenades
     ===================================================================== */
  function basisCoordsExercise(sp, B, w1, w2, c3) {
    const F = sp.F; const n = sp.n;
    const M = L.transpose(B); // vectors en columnes
    const d = L.det(F, M);
    const parts = [];
    parts.push({
      id: 'det', kind: 'scalar', F, label: 'Calcula el determinant de la matriu que té els vectors en columnes (si és ' + m('\\neq0') + ', és base pel Corol·lari 3.20):',
      check: (v) => (F.eq(v, d) ? EV.ok() : (F.eq(v, F.neg(d)) ? EV.bad('Gairebé: revisa el signe.') : EV.bad())), ref: F.str(d),
      sol: H.P('Matriu amb els vectors en columnes: ' + m('P=' + T.matrix(F, M)) + '.') + H.P(G.detTex(F, M) + (n === 3 ? ' (regla de Sarrus o desenvolupament per una fila/columna).' : '')) + H.P(m('\\det P=' + F.tex(d) + '\\neq0') + ' ⇒ ' + m('P') + ' invertible ⇒ ' + n + ' vectors LI a ' + m(sp.name) + ' (de dimensió ' + n + ') ⇒ <b>base</b>.'),
    });
    [w1, w2].forEach((w, i) => {
      const cs = G.coordsSol(sp, B, w, 'B');
      parts.push({ id: 'c' + i, kind: 'vector', F, n, label: 'Coordenades de ' + m(T.vec(F, w)) + ' respecte de ' + m('B') + ':', check: (v) => C.eqVec(F, v, cs.coords), ref: S.vecStr(F, cs.coords), sol: cs.html });
    });
    const v3 = L.combo(F, c3, B);
    parts.push({
      id: 'v', kind: 'vector', F, n, label: 'Quin vector té coordenades ' + m(T.vec(F, c3)) + ' en aquesta base?', check: (v) => C.eqVec(F, v, v3), ref: S.vecStr(F, v3),
      sol: H.P('Tenir coordenades ' + m(T.vec(F, c3)) + ' vol dir ser ' + m(T.lincomb(F, c3, B.map((b) => T.vec(F, b))))) + H.P('Equivalentment, ' + m('P\\cdot' + T.colvec(F, c3) + '=' + T.colvec(F, v3)) + '.') + H.ans(m(T.vec(F, v3))),
    });
    return parts;
  }
  G.register({
    tid: 'e42', ex: 42, star: true, topic: 3, sec: '3.3 · 3.4',
    title: 'Base de ℂ³ i coordenades', skill: 'Comprovar una base i calcular coordenades',
    make(rng) {
      const sym = rng.pick(['C', 'C', 'R']);
      const sp = Sp.Kn(sym, 3); const F = sp.F;
      const P = G.unimodular(F, rng, 3, { bound: 3, ops: 4 });
      const B = L.transpose(P);
      const w1 = L.combo(F, G.smallCoefs(F, rng, 3), B), w2 = (() => { const e = [F.zero, F.zero, F.zero]; e[rng.int(0, 2)] = F.one; return e; })();
      const c3 = [G.rnd(F, rng, -2, 2), G.rnd(F, rng, -1, 1), G.rnd(F, rng, 0, 2)];
      return { statement: 'Proveu que la successió finita de vectors ' + m(B.map((b) => T.vec(F, b)).join(',\\ ')) + ' és una base ' + m('B') + ' de ' + m(sp.name) + '. Trobeu les coordenades dels vectors ' + m(T.vec(F, w1)) + ' i ' + m(T.vec(F, w2)) + ' respecte d\'aquesta base. Quin vector té coordenades ' + m(T.vec(F, c3)) + '?', parts: basisCoordsExercise(sp, B, w1, w2, c3) };
    },
    original() {
      const F = CC; const sp = Sp.Kn('C', 3);
      const B = [[cx(1), cx(1), cx(0, 1)], [cx(1), cx(1), cx(0)], [cx(0, 1), cx(0), cx(1)]];
      return { statement: 'Proveu que la successió finita de vectors ' + m('(1,1,i),\\ (1,1,0),\\ (i,0,1)') + ' és una base de ' + m('\\mathbb{C}^3') + '. Trobeu les coordenades dels vectors ' + m('(1,1,i)') + ' i ' + m('(1,0,0)') + ' respecte d\'aquesta base. Quin vector té coordenades ' + m('(i,0,1)') + ' en aquesta base?', parts: basisCoordsExercise(sp, B, [cx(1), cx(1), cx(0, 1)], [cx(1), cx(0), cx(0)], [cx(0, 1), cx(0), cx(1)]) };
    },
  });

  EV.T3A = { ITEMS34, TF, inclusionExercise, membershipPart, ldExercise, basisCoordsExercise, VARS, eqTex };
})(window.EV = window.EV || {});
