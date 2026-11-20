/* ============================================================
   Espais vectorials · Lectura de respostes de l'usuari
   Expressions amb fraccions, i (complexos), polinomis en x,
   vectors, llistes de vectors, matrius.
   ============================================================ */
(function (EV) {
  'use strict';
  const P = EV.P;

  class ParseError extends Error {}

  function normalize(s) {
    return String(s)
      .replace(/[−–—]/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
      .replace(/ /g, ' ').replace(/\*\*/g, '^').replace(/ⁱ/g, 'i')
      .trim();
  }

  function tokenize(s) {
    const toks = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        toks.push({ t: 'num', v: s.slice(i, j) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
        const w = s.slice(i, j);
        // separem "xi", "ix", "ix2" en lletres individuals
        if (w === 'x' || w === 'i' || w === 'X' || w === 'I') toks.push({ t: 'id', v: w.toLowerCase() });
        else if (/^[xi]+$/i.test(w)) for (const ch of w) toks.push({ t: 'id', v: ch.toLowerCase() });
        else throw new ParseError('No entenc «' + w + '»');
        i = j; continue;
      }
      if ('+-*/^()'.includes(c)) { toks.push({ t: c }); i++; continue; }
      throw new ParseError('Caràcter inesperat «' + c + '»');
    }
    return toks;
  }

  // Avaluador: retorna un polinomi en x amb coeficients a F
  function parsePolyExpr(str, F, opts) {
    opts = opts || {};
    const s = normalize(str);
    if (!s) throw new ParseError('Buit');
    const toks = tokenize(s); let pos = 0;
    const peek = () => toks[pos]; const next = () => toks[pos++];
    const cst = (a) => [a];
    function numTok(v) {
      if (F.id === 'Z2') { if (v.includes('.')) throw new ParseError('A ℤ₂ només 0 i 1'); return F.fromInt(Number(v)); }
      if ((v.match(/\./g) || []).length > 1) throw new ParseError('Nombre mal escrit');
      const q = EV.Frac.from(v.includes('.') ? v : v);
      return F.id === 'C' ? new EV.Cx(q, EV.fr(0)) : q;
    }
    function expr() {
      let v = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        const op = next().t; const w = term();
        v = op === '+' ? P.add(F, v, w) : P.sub(F, v, w);
      }
      return v;
    }
    function startsFactor(tk) { return tk && (tk.t === 'num' || tk.t === 'id' || tk.t === '('); }
    function term() {
      let v = unary();
      for (;;) {
        const tk = peek();
        if (tk && tk.t === '*') { next(); v = P.mul(F, v, unary()); }
        else if (tk && tk.t === '/') {
          next(); const w = unary();
          if (P.deg(F, w) > 0) throw new ParseError('Només es pot dividir per constants');
          if (F.isZero(w[0])) throw new ParseError('Divisió per zero');
          v = P.scale(F, F.inv(w[0]), v);
        } else if (startsFactor(tk)) { v = P.mul(F, v, power()); }
        else break;
      }
      return v;
    }
    function unary() {
      const tk = peek();
      if (tk && tk.t === '-') { next(); return P.scale(F, F.neg(F.one), unary()); }
      if (tk && tk.t === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      let b = atom();
      if (peek() && peek().t === '^') {
        next();
        let neg = false; if (peek() && peek().t === '-') { next(); neg = true; }
        const e = next();
        if (!e || e.t !== 'num' || e.v.includes('.')) throw new ParseError('Exponent no vàlid');
        const k = Number(e.v);
        if (k > 5000) throw new ParseError('Exponent massa gran');
        let r = [F.one], bb = b, kk = k; while (kk > 0) { if (kk & 1) r = P.mul(F, r, bb); kk >>= 1; if (kk) bb = P.mul(F, bb, bb); }
        if (neg) {
          if (P.deg(F, r) > 0) throw new ParseError('Exponent negatiu de x');
          r = [F.inv(r[0])];
        }
        b = r;
      }
      return b;
    }
    function atom() {
      const tk = next();
      if (!tk) throw new ParseError('Expressió incompleta');
      if (tk.t === 'num') return cst(numTok(tk.v));
      if (tk.t === 'id') {
        if (tk.v === 'i') { if (F.id !== 'C') throw new ParseError('«i» només té sentit a ℂ'); return cst(F.I); }
        if (tk.v === 'x') { if (opts.noVar) throw new ParseError('Aquí no hi pot haver x'); return [F.zero, F.one]; }
      }
      if (tk.t === '(') {
        const v = expr();
        const c = next(); if (!c || c.t !== ')') throw new ParseError('Falta tancar parèntesi');
        return v;
      }
      throw new ParseError('Expressió no vàlida');
    }
    const v = expr();
    if (pos < toks.length) throw new ParseError('Sobra text al final');
    return P.trim(F, v);
  }

  function parseScalar(str, F) {
    const p = parsePolyExpr(str, F, { noVar: true });
    return p[0];
  }

  /* ---------- separació a nivell superior ---------- */
  function splitTop(s, seps) {
    const out = []; let depth = 0, cur = '';
    for (const c of s) {
      if ('([{'.includes(c)) depth++;
      if (')]}'.includes(c)) depth--;
      if (depth === 0 && seps.includes(c)) { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur);
    return out.map((x) => x.trim()).filter((x) => x.length);
  }
  function topGroups(s, open, close) {
    const out = []; let depth = 0, cur = null;
    for (const c of s) {
      if (c === open) { if (depth === 0) { cur = ''; depth++; continue; } depth++; }
      if (c === close) { depth--; if (depth === 0) { out.push(cur); cur = null; continue; } }
      if (depth > 0 && cur !== null) cur += c;
    }
    if (depth !== 0) throw new ParseError('Parèntesis desequilibrats');
    return out;
  }
  function stripOuter(s, o, c) {
    s = s.trim();
    if (s.startsWith(o) && s.endsWith(c)) {
      // comprova que el parèntesi exterior tanca al final
      let d = 0;
      for (let k = 0; k < s.length; k++) { if (s[k] === o) d++; if (s[k] === c) d--; if (d === 0 && k < s.length - 1) return s; }
      return s.slice(1, -1);
    }
    return s;
  }

  function parseVector(str, F, n) {
    let s = normalize(str);
    s = stripOuter(s, '(', ')');
    let parts = s.includes(',') ? splitTop(s, ',') : (s.includes(';') ? splitTop(s, ';') : s.split(/\s+/).filter(Boolean));
    const v = parts.map((p) => parseScalar(p, F));
    if (n !== undefined && v.length !== n) throw new ParseError('Cal un vector amb ' + n + ' components (n\'has posat ' + v.length + ')');
    return v;
  }

  function parseVectorList(str, F, n) {
    const s = normalize(str);
    if (!s) return [];
    let items;
    if (s.includes('(')) {
      // grups (…) de primer nivell
      const rest = s.replace(/\([^()]*(\([^()]*\)[^()]*)*\)/g, '').replace(/[,;\s]/g, '');
      if (rest.length) throw new ParseError('Escriu cada vector entre parèntesis: (1,2,3), (4,5,6)');
      items = topGroups(s, '(', ')');
    } else items = s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean);
    return items.map((it) => parseVector(it, F, n));
  }

  function parseMatrix(str, F, m, n) {
    let s = normalize(str);
    s = stripOuter(s, '[', ']');
    const rows = s.split(/[;\n]/).map((r) => r.trim()).filter(Boolean);
    const M = rows.map((r) => {
      r = stripOuter(r, '(', ')');
      const parts = r.includes(',') ? splitTop(r, ',') : r.split(/\s+/).filter(Boolean);
      return parts.map((p) => parseScalar(p, F));
    });
    if (!M.length) throw new ParseError('Matriu buida');
    const w = M[0].length;
    if (M.some((r) => r.length !== w)) throw new ParseError('Totes les files han de tenir el mateix nombre d\'entrades');
    if (m !== undefined && (M.length !== m || w !== n)) throw new ParseError('Cal una matriu ' + m + '×' + n + ' (n\'has posat ' + M.length + '×' + w + ')');
    return M;
  }

  function parseMatrixList(str, F, m, n) {
    const s = normalize(str);
    if (!s) return [];
    if (!s.includes('[')) throw new ParseError('Escriu cada matriu entre claudàtors: [1 2; 3 4], [0 1; 1 0]');
    return topGroups(s, '[', ']').map((g) => parseMatrix(g, F, m, n));
  }

  function parseScalarList(str, F) {
    const s = normalize(str);
    if (!s) return [];
    const parts = s.includes(',') || s.includes(';') ? splitTop(s, ',;') : s.split(/\s+/).filter(Boolean);
    return parts.map((p) => parseScalar(p, F));
  }

  /* ---------- serialització en format d'entrada ---------- */
  const scalarStr = (F, a) => F.str(a);
  const vecStr = (F, v) => '(' + v.map((a) => F.str(a)).join(', ') + ')';
  const matStr = (F, M) => '[' + M.map((r) => r.map((a) => F.str(a)).join(', ')).join('; ') + ']';
  function polyStr(F, c) {
    let out = '';
    for (let k = c.length - 1; k >= 0; k--) {
      const a = c[k]; if (F.isZero(a)) continue;
      let s = F.str(a);
      const paren = F.id === 'C' && !a.re.isZero() && !a.im.isZero();
      const neg = !paren && s.startsWith('-');
      if (neg) s = s.slice(1);
      if (paren) s = '(' + s + ')';
      if (k > 0 && (s === '1')) s = '';
      if (k > 0 && s.includes('/') && !paren) s = '(' + s + ')';
      const mon = k === 0 ? '' : k === 1 ? 'x' : 'x^' + k;
      const body = (k > 0 && s && !paren && /i$/.test(s)) ? '(' + s + ')' + mon : s + mon;
      out += (out ? (neg ? ' - ' : ' + ') : (neg ? '-' : '')) + body;
    }
    return out || '0';
  }

  EV.ParseError = ParseError;
  EV.parsePolyExpr = parsePolyExpr;
  EV.parseScalar = parseScalar;
  EV.parseVector = parseVector;
  EV.parseVectorList = parseVectorList;
  EV.parseMatrix = parseMatrix;
  EV.parseMatrixList = parseMatrixList;
  EV.parseScalarList = parseScalarList;
  EV.splitTop = splitTop;
  EV.S = { scalarStr, vecStr, matStr, polyStr };
})(window.EV = window.EV || {});
