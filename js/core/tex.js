/* ============================================================
   Espais vectorials · Format TeX (KaTeX) dels objectes
   ============================================================ */
(function (EV) {
  'use strict';

  const SYM = { Q: '\\mathbb{Q}', R: '\\mathbb{R}', C: '\\mathbb{C}', Z2: '\\mathbb{Z}_2' };

  function num(F, a) { return F.tex(a); }

  // Coeficient davant d'una variable/terme: "", "-", "3", "\frac12", "(1+i)"
  function coefTex(F, a, first) {
    let s;
    if (F.isOne(a)) s = '';
    else if (F.isNegOne(a)) s = '-';
    else if (EV.needsParens(F, a)) s = '(' + F.tex(a) + ')';
    else s = F.tex(a);
    if (!first) {
      if (s.startsWith('-')) return ' - ' + s.slice(1);
      return ' + ' + s;
    }
    return s;
  }

  // Combinació lineal sum a_i * name_i (names: TeX). Omet zeros.
  function lincomb(F, coefs, names, zeroTex) {
    let out = '', first = true;
    coefs.forEach((a, i) => {
      if (F.isZero(a)) return;
      out += coefTex(F, a, first) + names[i];
      first = false;
    });
    return first ? (zeroTex === undefined ? '0' : zeroTex) : out;
  }

  // Combinació lineal amb terme independent (constant) al final
  function linexpr(F, coefs, names, constant) {
    let out = '', first = true;
    coefs.forEach((a, i) => {
      if (F.isZero(a)) return;
      out += coefTex(F, a, first) + names[i];
      first = false;
    });
    if (constant !== undefined && !F.isZero(constant)) {
      const t = F.tex(constant);
      if (first) out = t;
      else out += (F.isNeg(constant) && !EV.needsParens(F, constant)) ? ' - ' + t.slice(1) : ' + ' + (EV.needsParens(F, constant) ? '(' + t + ')' : t);
      first = false;
    }
    return first ? '0' : out;
  }

  // Polinomi a partir de coeficients [a0, a1, ..., an], escrit de grau alt a baix
  function poly(F, c, v) {
    v = v || 'x';
    let out = '', first = true;
    for (let k = c.length - 1; k >= 0; k--) {
      const a = c[k];
      if (F.isZero(a)) continue;
      const mon = k === 0 ? '' : k === 1 ? v : v + '^{' + k + '}';
      if (k === 0) {
        const t = F.tex(a);
        if (first) out += t;
        else if (EV.needsParens(F, a)) out += ' + (' + t + ')';
        else out += t.startsWith('-') ? ' - ' + t.slice(1) : ' + ' + t;
      } else out += coefTex(F, a, first) + mon;
      first = false;
    }
    return first ? '0' : out;
  }

  function vec(F, v) { return '(' + v.map((a) => F.tex(a)).join(',\\ ') + ')'; }
  function colvec(F, v) { return '\\begin{pmatrix}' + v.map((a) => F.tex(a)).join('\\\\') + '\\end{pmatrix}'; }

  function matrix(F, M, opts) {
    opts = opts || {};
    const env = opts.env || 'pmatrix';
    const rows = M.map((r) => r.map((a) => (typeof a === 'string' ? a : F.tex(a))).join(' & '));
    return '\\begin{' + env + '}' + rows.join('\\\\') + '\\end{' + env + '}';
  }

  // Matriu ampliada amb línia vertical abans de les últimes `aug` columnes
  function augmented(F, M, aug, hl) {
    if (!aug) return matrix(F, M);
    const n = M[0].length;
    const spec = 'c'.repeat(n - aug) + '|' + 'c'.repeat(aug);
    const rows = M.map((r, i) => r.map((a, j) => {
      const t = typeof a === 'string' ? a : F.tex(a);
      return hl && hl[i] && hl[i][j] ? '\\boxed{' + t + '}' : t;
    }).join(' & '));
    return '\\left(\\begin{array}{' + spec + '}' + rows.join('\\\\') + '\\end{array}\\right)';
  }

  // Sistema d'equacions: A x = b, variables names
  function system(F, A, b, names) {
    const rows = A.map((r, i) => linexpr(F, r, names) + ' &= ' + (b ? F.tex(b[i]) : '0'));
    return '\\left\\{\\begin{aligned}' + rows.join('\\\\') + '\\end{aligned}\\right.';
  }

  function span(items, K) { return '\\left\\langle ' + items.join(',\\ ') + ' \\right\\rangle' + (K ? '_{' + K + '}' : ''); }

  function arrow(ops) {
    if (!ops || !ops.length) return '\\longrightarrow';
    return '\\xrightarrow{' + (ops.length === 1 ? ops[0] : '\\substack{' + ops.join('\\\\') + '}') + '}';
  }

  // Nom de fila
  const Fr = (i) => 'F_{' + (i + 1) + '}';

  EV.T = { SYM, num, coefTex, lincomb, linexpr, poly, vec, colvec, matrix, augmented, system, span, arrow, Fr };
})(window.EV = window.EV || {});
