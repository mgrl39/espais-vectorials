/* ============================================================
   Espais vectorials · Nombres exactes i cossos (Q, Z2, C)
   Tots els càlculs són exactes: fraccions amb BigInt.
   ============================================================ */
(function (EV) {
  'use strict';

  const babs = (a) => (a < 0n ? -a : a);
  function bgcd(a, b) { a = babs(a); b = babs(b); while (b) { [a, b] = [b, a % b]; } return a; }

  class Frac {
    constructor(n, d) {
      n = BigInt(n); d = d === undefined ? 1n : BigInt(d);
      if (d === 0n) throw new Error('Divisió per zero');
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d) || 1n;
      this.n = n / g; this.d = d / g;
    }
    static from(x) {
      if (x instanceof Frac) return x;
      if (typeof x === 'bigint') return new Frac(x, 1n);
      if (typeof x === 'number') {
        if (Number.isInteger(x)) return new Frac(BigInt(x), 1n);
        // decimal finit
        const s = String(x); const k = (s.split('.')[1] || '').length;
        return new Frac(BigInt(Math.round(x * 10 ** k)), 10n ** BigInt(k));
      }
      if (typeof x === 'string') {
        if (x.includes('/')) { const [a, b] = x.split('/'); return new Frac(BigInt(a.trim()), BigInt(b.trim())); }
        if (x.includes('.')) return Frac.from(parseFloat(x));
        return new Frac(BigInt(x.trim()), 1n);
      }
      throw new Error('Frac.from: tipus no suportat');
    }
    add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { if (o.n === 0n) throw new Error('Divisió per zero'); return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    inv() { return new Frac(this.d, this.n); }
    isZero() { return this.n === 0n; }
    isInt() { return this.d === 1n; }
    eq(o) { return this.n === o.n && this.d === o.d; }
    sign() { return this.n > 0n ? 1 : this.n < 0n ? -1 : 0; }
    cmp(o) { const x = this.n * o.d - o.n * this.d; return x > 0n ? 1 : x < 0n ? -1 : 0; }
    toNumber() { return Number(this.n) / Number(this.d); }
    toString() { return this.d === 1n ? String(this.n) : this.n + '/' + this.d; }
  }
  const fr = (n, d) => new Frac(n, d);
  const FZ = fr(0), F1 = fr(1);

  function fracTex(q) {
    if (q.d === 1n) return String(q.n);
    const s = q.n < 0n ? '-' : '';
    return s + '\\frac{' + babs(q.n) + '}{' + q.d + '}';
  }

  /* ---------------- Cos Q (també s'usa per a R) ---------------- */
  const QQ = {
    id: 'Q', char: 0,
    zero: FZ, one: F1,
    of: (n, d) => fr(n, d),
    fromInt: (n) => fr(n),
    add: (a, b) => a.add(b), sub: (a, b) => a.sub(b), mul: (a, b) => a.mul(b),
    div: (a, b) => a.div(b), neg: (a) => a.neg(), inv: (a) => a.inv(),
    isZero: (a) => a.isZero(), eq: (a, b) => a.eq(b),
    isOne: (a) => a.n === 1n && a.d === 1n,
    isNegOne: (a) => a.n === -1n && a.d === 1n,
    isInt: (a) => a.d === 1n,
    // "negatiu" per a la impressió (signe de davant)
    isNeg: (a) => a.n < 0n,
    tex: fracTex,
    str: (a) => a.toString(),
    // part entera útil per a operacions "sense fraccions"
    intVal: (a) => (a.d === 1n ? a.n : null),
    // nombre de "complexitat" (per triar pivots bonics)
    weight: (a) => Number(babs(a.n) + a.d - 1n),
  };

  /* ---------------- Cos Z2 ---------------- */
  const Z2 = {
    id: 'Z2', char: 2,
    zero: 0, one: 1,
    fromInt: (n) => ((Number(n) % 2) + 2) % 2,
    of: (n, d) => { const dd = ((Number(d === undefined ? 1 : d) % 2) + 2) % 2; if (!dd) throw new Error('Divisió per zero a Z2'); return ((Number(n) % 2) + 2) % 2; },
    add: (a, b) => a ^ b, sub: (a, b) => a ^ b, mul: (a, b) => a & b,
    div: (a, b) => { if (!b) throw new Error('Divisió per zero a Z2'); return a; },
    neg: (a) => a, inv: (a) => { if (!a) throw new Error('Invers de 0'); return 1; },
    isZero: (a) => a === 0, eq: (a, b) => a === b,
    isOne: (a) => a === 1, isNegOne: (a) => a === 1, isInt: () => true, isNeg: () => false,
    tex: (a) => String(a), str: (a) => String(a), intVal: (a) => BigInt(a), weight: (a) => a,
  };

  /* ---------------- Cos C (racionals de Gauss Q(i)) ---------------- */
  class Cx {
    constructor(re, im) { this.re = re instanceof Frac ? re : Frac.from(re); this.im = im === undefined ? FZ : (im instanceof Frac ? im : Frac.from(im)); }
  }
  const cx = (re, im) => new Cx(re, im === undefined ? 0 : im);
  function cxTex(z) {
    const r = z.re, m = z.im;
    if (m.isZero()) return fracTex(r);
    let imPart;
    const am = m.sign() < 0 ? m.neg() : m;
    if (am.n === 1n && am.d === 1n) imPart = 'i';
    else if (am.d === 1n) imPart = am.n + 'i';
    else imPart = '\\frac{' + am.n + '}{' + am.d + '}i';
    if (r.isZero()) return (m.sign() < 0 ? '-' : '') + imPart;
    return fracTex(r) + (m.sign() < 0 ? '-' : '+') + imPart;
  }
  function cxStr(z) {
    const r = z.re, m = z.im;
    if (m.isZero()) return r.toString();
    const am = m.sign() < 0 ? m.neg() : m;
    const ip = (am.n === 1n && am.d === 1n) ? 'i' : am.toString() + (am.d === 1n ? 'i' : '*i');
    const ipFixed = am.d === 1n ? ip : '(' + am.toString() + ')i';
    if (r.isZero()) return (m.sign() < 0 ? '-' : '') + ipFixed;
    return r.toString() + (m.sign() < 0 ? '-' : '+') + ipFixed;
  }
  const CC = {
    id: 'C', char: 0,
    zero: cx(0, 0), one: cx(1, 0), I: cx(0, 1),
    fromInt: (n) => cx(n, 0),
    of: (n, d) => new Cx(fr(n, d), FZ),
    add: (a, b) => new Cx(a.re.add(b.re), a.im.add(b.im)),
    sub: (a, b) => new Cx(a.re.sub(b.re), a.im.sub(b.im)),
    mul: (a, b) => new Cx(a.re.mul(b.re).sub(a.im.mul(b.im)), a.re.mul(b.im).add(a.im.mul(b.re))),
    div: (a, b) => {
      const den = b.re.mul(b.re).add(b.im.mul(b.im));
      if (den.isZero()) throw new Error('Divisió per zero');
      const nr = a.re.mul(b.re).add(a.im.mul(b.im)), ni = a.im.mul(b.re).sub(a.re.mul(b.im));
      return new Cx(nr.div(den), ni.div(den));
    },
    neg: (a) => new Cx(a.re.neg(), a.im.neg()),
    inv: (a) => CC.div(CC.one, a),
    conj: (a) => new Cx(a.re, a.im.neg()),
    isZero: (a) => a.re.isZero() && a.im.isZero(),
    eq: (a, b) => a.re.eq(b.re) && a.im.eq(b.im),
    isOne: (a) => a.im.isZero() && a.re.n === 1n && a.re.d === 1n,
    isNegOne: (a) => a.im.isZero() && a.re.n === -1n && a.re.d === 1n,
    isInt: (a) => a.re.d === 1n && a.im.d === 1n,
    isNeg: (a) => (a.im.isZero() ? a.re.sign() < 0 : (a.re.isZero() ? a.im.sign() < 0 : false)),
    isReal: (a) => a.im.isZero(),
    tex: cxTex, str: cxStr,
    intVal: (a) => (a.im.isZero() && a.re.d === 1n ? a.re.n : null),
    weight: (a) => QQ.weight(a.re) + QQ.weight(a.im) * 1.5 + (a.im.isZero() ? 0 : 1),
  };

  // Una "suma" de termes amb signe ben posat: tex d'un nombre com a terme (no el primer)
  function needsParens(F, a) {
    if (F.id === 'C') return !a.re.isZero() && !a.im.isZero();
    return false;
  }

  EV.Frac = Frac; EV.fr = fr; EV.Cx = Cx; EV.cx = cx;
  EV.QQ = QQ; EV.Z2 = Z2; EV.CC = CC;
  EV.fieldById = { Q: QQ, Z2: Z2, C: CC };
  EV.needsParens = needsParens;
  EV.bgcd = bgcd;
})(window.EV = window.EV || {});
