/* ============================================================
   Espais vectorials · Lectura i comprovació d'una resposta
   segons el tipus d'apartat.
   ============================================================ */
(function (EV) {
  'use strict';

  // Retorna el valor llegit (o llança ParseError)
  function parseAnswer(part, raw) {
    const F = part.F || (part.space && part.space.F) || EV.QQ;
    switch (part.kind) {
      case 'choice': if (raw === null || raw === undefined || raw === '') throw new EV.ParseError('Tria una opció'); return raw;
      case 'int': {
        const s = String(raw).trim();
        if (!/^-?\d+$/.test(s)) throw new EV.ParseError('Escriu un nombre enter');
        return Number(s);
      }
      case 'scalar': return EV.parseScalar(raw, F);
      case 'scalars': return EV.parseScalarList(raw, F);
      case 'vector': return EV.parseVector(raw, F, part.n);
      case 'vectors': return String(raw).trim() === '' ? [] : EV.parseVectorList(raw, F, part.n);
      case 'matrix': return EV.parseMatrix(raw, F, part.m, part.n);
      case 'poly': return EV.parsePolyExpr(raw, F);
      case 'elem': return part.space.toC(part.space.parse(raw));
      case 'elems': return String(raw).trim() === '' ? [] : part.space.parseList(raw).map((e) => part.space.toC(e));
      case 'yesplus': {
        // raw = {yes: 'si'|'no', text}. Si la resposta coincideix amb part.textWhen ('si' per defecte), es llegeix el text
        if (!raw || !raw.yes) throw new EV.ParseError('Tria una opció');
        const when = part.textWhen || 'si';
        if (raw.yes !== when) return { yes: raw.yes === 'si', val: null };
        const t = String(raw.text || '').trim();
        const sub = Object.assign({ F }, part.text);
        if (!t && !part.text.allowEmpty) throw new EV.ParseError(part.text.emptyMsg || 'Completa el camp de text');
        return { yes: raw.yes === 'si', val: t ? parseAnswer(sub, t) : (sub.kind === 'elems' || sub.kind === 'vectors' || sub.kind === 'scalars' ? [] : null) };
      }
      case 'multi': { // diversos camps de tipus diferents: raw = {key: rawValue}
        const out = {};
        part.fields.forEach((f) => { out[f.key] = parseAnswer(Object.assign({ F }, f), raw[f.key]); });
        return out;
      }
      default: throw new Error('Tipus d\'apartat desconegut: ' + part.kind);
    }
  }

  function checkAnswer(part, raw, ctx) {
    let val;
    try { val = parseAnswer(part, raw); } catch (e) {
      if (e instanceof EV.ParseError) return { ok: false, parseError: true, msg: e.message };
      throw e;
    }
    try {
      const r = part.check(val, ctx || {});
      return Object.assign({ value: val }, r);
    } catch (e) {
      return { ok: false, msg: 'No s\'ha pogut comprovar: ' + e.message };
    }
  }

  EV.parseAnswer = parseAnswer;
  EV.checkAnswer = checkAnswer;
})(window.EV = window.EV || {});
