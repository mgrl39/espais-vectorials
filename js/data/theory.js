/* ============================================================
   Teoria · Capítols 3 (Espais vectorials i aplicacions lineals)
   i 4 (Diagonalització). Numeració dels Apunts (Nart–Xarles).
   ============================================================ */
(function (EV) {
  'use strict';
  const m = (t) => '\\(' + t + '\\)';
  const dm = (t) => '\\[' + t + '\\]';
  const D = (t, b) => '<div class="th def"><div class="th-t">Definició · ' + t + '</div>' + b + '</div>';
  const R = (t, b) => '<div class="th thm"><div class="th-t">' + t + '</div>' + b + '</div>';
  const E = (t, b) => '<div class="th exm"><div class="th-t">Exemple' + (t ? ' · ' + t : '') + '</div>' + b + '</div>';
  const W = (b) => '<div class="th warnb"><div class="th-t">Compte</div>' + b + '</div>';
  const K = (t, b) => '<div class="th recipe"><div class="th-t">Recepta · ' + t + '</div>' + b + '</div>';
  const P = (s) => '<p>' + s + '</p>';
  const UL = (a) => '<ul>' + a.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
  const OL = (a) => '<ol>' + a.map((x) => '<li>' + x + '</li>').join('') + '</ol>';

  const SECTIONS = [
    {
      id: 'mapa', ch: 0, title: 'Mapa del tema i receptes ràpides', practice: [],
      body:
        P('Aquest recurs cobreix <b>tot</b> el que entra dels temes 3 (Espais vectorials i aplicacions lineals) i 4 (Diagonalització). La idea clau del tema és una sola: <b>triant una base, qualsevol problema lineal es converteix en un problema de matrius i sistemes</b>, que ja saps resoldre amb Gauss-Jordan.') +
        '<table class="tbl"><tr><th>Vull…</th><th>Faig…</th><th>Resultat</th></tr>' +
        '<tr><td>Saber si ' + m('u\\in\\langle v_1,\\dots,v_k\\rangle') + '</td><td>' + m('v_i') + ' en <b>columnes</b>, ' + m('u') + ' ampliada; esglaono</td><td>SCD/SCI ⇒ sí (1/∞ maneres); SI ⇒ no</td></tr>' +
        '<tr><td>Saber si ' + m('v_1,\\dots,v_k') + ' són LI</td><td>rang de la matriu (files o columnes)</td><td>LI ⇔ rang = ' + m('k') + '</td></tr>' +
        '<tr><td>Base i dimensió de ' + m('\\langle v_1,\\dots,v_k\\rangle') + '</td><td>' + m('v_i') + ' en <b>files</b>, esglaono</td><td>files no nul·les = base; dim = rang</td></tr>' +
        '<tr><td>Base de ' + m('\\{x\\mid Ax=0\\}') + '</td><td>Gauss-Jordan, aïllo pivots, un vector per paràmetre</td><td>dim = ' + m('n-\\operatorname{rang}A') + '</td></tr>' +
        '<tr><td>Ampliar una base de ' + m('F') + ' a ' + m('K^n') + '</td><td>base en files, esglaono</td><td>afegeixo ' + m('e_j') + ' de les columnes sense pivot</td></tr>' +
        '<tr><td>Coordenades de ' + m('u') + ' en ' + m('B') + '</td><td>' + m('B') + ' en columnes, ' + m('u') + ' ampliada</td><td>solució única del sistema</td></tr>' +
        '<tr><td>' + m('\\operatorname{Ker}f') + ' i ' + m('\\operatorname{Im}f') + '</td><td>Gauss-Jordan de ' + m('A') + '</td><td>Ker: solucions de ' + m('Ax=0') + '; Im: columnes pivot de ' + m('A') + '</td></tr>' +
        '<tr><td>' + m('F+G') + ', ' + m('F\\cap G') + '</td><td>unió de bases / Zassenhaus o equacions juntes</td><td>Grassmann: ' + m('\\dim F+\\dim G=\\dim(F+G)+\\dim(F\\cap G)') + '</td></tr>' +
        '<tr><td>' + m('M(\\mathcal{B}\'\\xleftarrow{f}\\mathcal{B})') + '</td><td>' + m('Q^{-1}AP') + '</td><td>' + m('P,Q') + ' = bases en columnes</td></tr>' +
        '<tr><td>Diagonalitzar ' + m('A') + '</td><td>' + m('P_A(x)') + ', arrels, ' + m('E_\\lambda=\\operatorname{Ker}(A-\\lambda I)') + '</td><td>diagonalitza ⇔ arrels reals i ' + m('\\dim E_\\lambda') + ' = multiplicitat</td></tr></table>' +
        K('Les tres regles d\'or', OL(['<b>Columnes</b> quan resols ' + m('a_1v_1+\\dots+a_kv_k=u') + ' (pertinença, coordenades, relacions de dependència).', '<b>Files</b> quan vols una base del subespai generat (les operacions de files no canvien el subespai, Lema 3.3).', 'Un problema en ' + m('K_n[x]') + ' o ' + m('M_{m\\times n}(K)') + ' es passa a ' + m('K^N') + ' amb les <b>coordenades en la base canònica</b>.'])) +
        W(UL(['Per dir que <b>no</b> és subespai / no és lineal / és fals: n\'hi ha prou amb <b>un contraexemple concret</b>. Per dir que <b>sí</b>: cal un argument general.', 'A ' + m('\\mathbb{Z}_2') + ': ' + m('1+1=0') + ', ' + m('-1=1') + ', ' + m('x^2=x') + ', ' + m('2v=0') + '. Moltes "veritats" de ' + m('\\mathbb{R}') + ' fallen (i al revés).', 'Comprova sempre el resultat final (substituint, multiplicant ' + m('AP') + ' i ' + m('PD') + '...). A classe es van detectar diversos errors de càlcul als apunts precisament així.'])),
      quiz: [
        { q: 'Per saber si ' + m('u\\in\\langle v_1,v_2,v_3\\rangle') + ', poso els ' + m('v_i') + ' en files o en columnes?', a: 'En <b>columnes</b>, amb ' + m('u') + ' com a columna ampliada: resolc ' + m('a_1v_1+a_2v_2+a_3v_3=u') + '.' },
        { q: 'I per trobar una base de ' + m('\\langle v_1,v_2,v_3\\rangle') + '?', a: 'En <b>files</b>: les files no nul·les de l\'esglaonada són base (o, posant-los en columnes, els ' + m('v_i') + ' de les columnes pivot).' },
      ],
    },
    {
      id: '3.1', ch: 3, title: '3.1 Espai vectorial: definició i exemples', practice: ['e34'],
      body:
        D('K-espai vectorial', P('Fixem un cos ' + m('K') + ' (' + m('\\mathbb{Q},\\mathbb{R},\\mathbb{C},\\mathbb{Z}_2') + '). Un conjunt ' + m('E') + ' és un <b>' + m('K') + '-espai vectorial</b> si té una <b>suma</b> ' + m('E\\times E\\to E') + ' i un <b>producte per escalars</b> ' + m('K\\times E\\to E') + ' tals que, per a ' + m('u,v,w\\in E,\\ a,b\\in K') + ':') + UL([m('u+(v+w)=(u+v)+w') + ' (associativa), ' + m('u+v=v+u') + ' (commutativa)', 'existeix ' + m('0_E') + ' amb ' + m('u+0_E=u') + '; per a cada ' + m('u') + ' existeix ' + m('-u') + ' amb ' + m('u+(-u)=0_E'), m('(ab)u=a(bu),\\quad (a+b)u=au+bu,\\quad a(u+v)=au+av,\\quad 1u=u')]) + P('Els elements de ' + m('E') + ' s\'anomenen <b>vectors</b>.')) +
        R('Observació (conseqüències immediates)', P(m('(-a)u=-au,\\quad 0u=0_E,\\quad a0_E=0_E,\\quad au=0_E\\Rightarrow a=0\\text{ o }u=0_E') + '.')) +
        E('Els espais que surten sempre', UL([m('K^n') + ' (n-tuples) amb operacions component a component. Model de tots els espais de dimensió ' + m('n') + '.', m('K[x]') + ': polinomis amb coeficients a ' + m('K') + ' (dimensió infinita). ' + m('K_n[x]') + ': polinomis de grau ' + m('\\le n') + ' (dimensió ' + m('n+1') + ').', m('M_{m\\times n}(K)') + ': matrius ' + m('m\\times n') + ' (dimensió ' + m('mn') + ').', m('\\mathbb{C}') + ' com a ' + m('\\mathbb{R}') + '-espai té dimensió 2 (base ' + m('1,i') + '); com a ' + m('\\mathbb{C}') + '-espai, dimensió 1.', m('(\\mathbb{Z}_2)^n') + ' té exactament ' + m('2^n') + ' vectors.'])) +
        P('Geometria a ' + m('\\mathbb{R}^2') + ': sumar és la regla del paral·lelogram; multiplicar per ' + m('a') + ' estira el vector (i el gira 180° si ' + m('a<0') + ').'),
      quiz: [
        { q: 'Quants vectors té ' + m('(\\mathbb{Z}_2)^3') + '?', a: m('2^3=8') + '.' },
        { q: 'Quina és la dimensió de ' + m('\\mathbb{R}_3[x]') + '? I de ' + m('M_{2\\times 3}(\\mathbb{Q})') + '?', a: m('4') + ' (base ' + m('1,x,x^2,x^3') + ') i ' + m('6') + '.' },
      ],
    },
    {
      id: '3.2', ch: 3, title: '3.2 Subespais vectorials i generadors', practice: ['e34', 'e35', 'e37', 'e38'],
      body:
        D('Subespai', P(m('F\\subseteq E') + ' és un <b>subespai</b> si:') + OL([m('u,v\\in F\\Rightarrow u+v\\in F'), m('u\\in F,\\ a\\in K\\Rightarrow au\\in F'), m('F\\neq\\emptyset') + ' (en particular ' + m('0_E\\in F') + ').']) + P('Equivalentment: ' + m('F') + ' és tancat per combinacions lineals ' + m('au+bv') + '. Un subespai és ell mateix un espai vectorial.')) +
        W('Correcció feta a classe: a ' + m('\\mathbb{R}^2') + ' els subespais són ' + m('\\{0\\}') + ', les <b>rectes que passen per l\'origen</b> i tot ' + m('\\mathbb{R}^2') + '. Una recta que no passa per l\'origen no ho és (no conté el 0). I a la definició no es pot oblidar ' + m('0\\in F') + '.') +
        K('Com reconèixer un subespai ràpidament', UL(['Equacions <b>lineals homogènies</b> (tot igualat a 0, sense terme independent) ⇒ sempre és subespai.', 'Hi ha un terme independent ' + m('\\neq0') + ' ⇒ no ho és (' + m('0\\notin F') + ').', 'Productes de variables, potències, valors absoluts, desigualtats, "ser enter", "grau parell", "grau exactament n"... ⇒ busca un contraexemple.', 'Compte amb el cos: ' + m('\\{(x,y)\\in\\mathbb{Z}_2^2\\mid y=x^2\\}') + ' <b>sí</b> és subespai (a ' + m('\\mathbb{Z}_2') + ', ' + m('x^2=x') + '); ' + m('\\{x\\in\\mathbb{Q}\\text{ enter}\\}') + ' no ho és perquè podem multiplicar per ' + m('\\frac12') + '.'])) +
        E('', UL([m('\\{x=y=z\\}\\subseteq\\mathbb{R}^3') + ' = ' + m('\\langle(1,1,1)\\rangle') + ' ✓', m('\\{xy+iz=x\\}\\subseteq\\mathbb{C}^3') + ': ' + m('u=(1,2,i)') + ' hi és però ' + m('2u') + ' no ✗ (aquí sí que ' + m('0\\in F') + ': no n\'hi ha prou mirant el zero!)', m('\\{xy=0\\}\\subseteq\\mathbb{R}^2') + ' (els dos eixos): ' + m('(1,0)+(0,1)=(1,1)\\notin F') + ' ✗', m('\\{p\\in\\mathbb{R}[x]\\mid\\operatorname{grau}p\\le12\\}=\\langle1,x,\\dots,x^{12}\\rangle') + ' ✓; grau parell ✗ (' + m('(x^2+x)+(-x^2)=x') + ')'])) +
        D('Combinació lineal i subespai generat', P('Una <b>combinació lineal</b> de ' + m('v_1,\\dots,v_k') + ' és ' + m('a_1v_1+\\dots+a_kv_k') + '. El conjunt de totes és el <b>subespai generat</b>:') + dm('\\langle v_1,\\dots,v_k\\rangle_K=\\{a_1v_1+\\dots+a_kv_k\\mid a_i\\in K\\},') + P('que sempre és subespai (el més petit que conté els ' + m('v_i') + '). Si ' + m('F=\\langle v_1,\\dots,v_k\\rangle') + ', diem que ' + m('v_1,\\dots,v_k') + ' és un <b>sistema de generadors</b> (SG) de ' + m('F') + '.')) +
        R('Lema 3.2', P(m('u\\in\\langle u_1,\\dots,u_m\\rangle\\iff\\langle u_1,\\dots,u_m\\rangle=\\langle u,u_1,\\dots,u_m\\rangle') + '. (Afegir o treure un vector que és CL dels altres no canvia el subespai.)')) +
        R('Lema 3.3', P('Si ' + m('P') + ' és invertible, les files de ' + m('A') + ' i les de ' + m('PA') + ' generen el mateix subespai. En particular, <b>les files no nul·les de qualsevol esglaonament de ' + m('A') + ' generen el mateix que les files de ' + m('A') + '</b>.')) +
        R('Lema 3.4', P('Les solucions de ' + m('Ax=0') + ' formen un subespai generat pels vectors directors que surten de resoldre per Gauss-Jordan (un per variable lliure): ' + m('n-\\operatorname{rang}(A)') + ' vectors.')) +
        K('Equacions ↔ generadors', P('<b>D\'equacions a generadors</b>: resol el sistema homogeni, escriu la solució en forma paramètrica i separa un vector per paràmetre. Ex.: ' + m('z=x+2y\\Rightarrow(x,y,x+2y)=x(1,0,1)+y(0,1,2)') + '.') + P('<b>De generadors a equacions</b> (implícites): ' + m('(x_1,\\dots,x_n)\\in\\langle v_1,\\dots,v_k\\rangle') + ' ⇔ el sistema amb columnes ' + m('v_i') + ' i ampliada ' + m('(x_1,\\dots,x_n)') + ' és compatible: esglaona i imposa que les files ' + m('(0\\cdots0\\mid *)') + ' tinguin ' + m('*=0') + '.')) +
        K('Pertinença i inclusió', UL([m('u\\in\\langle v_1,\\dots,v_k\\rangle') + '? Resol ' + m('x_1v_1+\\dots+x_kv_k=u') + ' (columnes + ampliada). SCD ⇒ sí, d\'una única manera; SCI ⇒ sí, d\'infinites maneres (els ' + m('v_i') + ' són LD); SI ⇒ no.', 'Si ' + m('F') + ' ve donat per <b>equacions</b>, simplement substitueix ' + m('u') + '.', m('\\langle w_1,\\dots,w_r\\rangle\\subseteq G') + ' ⇔ <b>cada</b> ' + m('w_i\\in G') + ' (perquè ' + m('G') + ' és subespai i és tancat per CL).', m('F=G') + ' ⇔ ' + m('F\\subseteq G') + ' i ' + m('\\dim F=\\dim G') + ' (o doble inclusió).'])),
      quiz: [
        { q: 'És subespai ' + m('\\{(x,y)\\in\\mathbb{R}^2\\mid x+y=1\\}') + '?', a: 'No: ' + m('(0,0)') + ' no compleix ' + m('0+0=1') + '.' },
        { q: 'És subespai ' + m('\\{(x,y)\\in\\mathbb{C}^2\\mid y=\\overline{x}\\}') + ' (com a ' + m('\\mathbb{C}') + '-espai)?', a: 'No: ' + m('(1,1)') + ' hi és, però ' + m('i(1,1)=(i,i)') + ' i ' + m('\\overline{i}=-i\\neq i') + '.' },
        { q: 'Si ' + m('F=\\langle w_1,w_2\\rangle') + ', què cal comprovar per veure ' + m('F\\subseteq G') + '?', a: 'Que ' + m('w_1\\in G') + ' i ' + m('w_2\\in G') + '. N\'hi ha prou amb els generadors.' },
      ],
    },
    {
      id: '3.3', ch: 3, title: '3.3 Dependència lineal, bases i coordenades', practice: ['e40', 'e41', 'e42'],
      body:
        D('LI / LD', P('La família ' + m('u_1,\\dots,u_m') + ' és <b>linealment independent</b> (LI) si cap vector és CL dels altres. Si no, és <b>linealment dependent</b> (LD).')) +
        R('Teorema 3.5 (criteri d\'independència lineal)', P('Són equivalents: (1) ' + m('u_1,\\dots,u_m') + ' LI; (2) ' + m('a_1u_1+\\dots+a_mu_m=0\\Rightarrow a_1=\\dots=a_m=0') + '; (3) l\'aplicació ' + m('\\ell_B\\colon K^m\\to E,\\ (a_i)\\mapsto\\sum a_iu_i') + ' és injectiva.') + P('Consequència: si són LI, cada vector de ' + m('\\langle u_1,\\dots,u_m\\rangle') + ' s\'escriu d\'una <b>única</b> manera. Si són LD, de <b>infinites</b> maneres (sumant-hi una relació no trivial).')) +
        R('Corol·lari 3.6', P(m('u_1,\\dots,u_m\\in K^n') + ' són LI ⇔ la matriu ' + m('n\\times m') + ' que els té en columnes té rang ' + m('m') + '.')) +
        R('Lema 3.7', P('Si ' + m('u_1,\\dots,u_m') + ' és LI: ' + m('u_1,\\dots,u_m,u') + ' LI ' + m('\\iff u\\notin\\langle u_1,\\dots,u_m\\rangle') + '.')) +
        UL(['Una família amb el vector 0 és LD. Un sol vector ' + m('u\\neq0') + ' és LI.', 'Dos vectors són LD ⇔ un és múltiple de l\'altre.', 'Una subfamília d\'una família LI és LI. Una família que conté una LD és LD.']) +
        W(UL(['"' + m('v\\notin\\{e_1,e_2,e_3\\}') + '" NO vol dir "' + m('v\\notin\\langle e_1,e_2,e_3\\rangle') + '". Ex.: ' + m('v=e_1+e_2') + '.', 'Tres vectors LI dos a dos poden ser LD: ' + m('(1,0),(0,1),(1,1)') + '.', 'A ' + m('\\mathbb{Z}_2') + ': ' + m('e_1+e_2,\\ e_2+e_3,\\ e_1+e_3') + ' és sempre LD (la suma és ' + m('2(\\dots)=0') + ').'])) +
        D('Base i coordenades', P('Una <b>base</b> de ' + m('E') + ' és una família ' + m('B=(u_1,\\dots,u_n)') + ' LI que genera ' + m('E') + '. Per a cada ' + m('v\\in E') + ' hi ha uns únics ' + m('a_i') + ' amb ' + m('v=\\sum a_iu_i') + ': són les <b>coordenades</b> ' + m('v_B=(a_1,\\dots,a_n)') + '. <b>L\'ordre dels vectors importa.</b>')) +
        R('Teorema 3.9 (propietat fonamental de les bases)', P(m('B') + ' és base ⇔ ' + m('\\ell_B\\colon K^n\\to E') + ' és bijectiva. La inversa ' + m('c_B=\\ell_B^{-1}') + ' és l\'<b>isomorfisme de coordenació</b>: permet traduir tot problema a ' + m('K^n') + '.')) +
        E('Bases canòniques', UL([m('K^n') + ': ' + m('e_1=(1,0,\\dots,0),\\dots,e_n') + '. Les coordenades d\'un vector són ell mateix.', m('K_n[x]') + ': ' + m('1,x,\\dots,x^n') + '. ' + m('x^2-2x+4\\leftrightarrow(4,-2,1)') + '.', m('M_{2}(K)') + ': ' + m('E_{11},E_{12},E_{21},E_{22}') + '. ' + m('\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}\\leftrightarrow(a,b,c,d)') + '.'])) +
        R('Teorema 3.12 i Corol·lari 3.13', P('Tota subfamília LI <b>maximal</b> d\'un sistema de generadors és base (d\'un SG en podem treure vectors fins a obtenir una base). I tota família LI es pot <b>completar</b> a una base afegint vectors.')) +
        K('Base que contingui un vector donat (intercanvi)', P('Si ' + m('B=(w_1,\\dots,w_n)') + ' és base de ' + m('F') + ' i ' + m('u=\\sum c_iw_i\\in F') + ' amb ' + m('c_k\\neq0') + ', aleshores canviant ' + m('w_k') + ' per ' + m('u') + ' tenim una altra base de ' + m('F') + '. <b>Només</b> es pot canviar un ' + m('w_k') + ' amb coeficient no nul.')),
      quiz: [
        { q: 'Són LI ' + m('(1,2),(2,4)') + '?', a: 'No: ' + m('(2,4)=2(1,2)') + '.' },
        { q: 'Si ' + m('e_1,e_2,e_3') + ' és LD, és ' + m('e_1,e_3') + ' LD?', a: 'No necessàriament: ' + m('(1,0),(1,1),(0,1)') + ' és LD però ' + m('(1,0),(0,1)') + ' és LI.' },
        { q: 'Coordenades de ' + m('3-x^2') + ' en la base ' + m('(1,x,x^2)') + '?', a: m('(3,0,-1)') + '.' },
      ],
    },
    {
      id: '3.4', ch: 3, title: '3.4 Dimensió', practice: ['e43', 'e44', 'e46', 'e48'],
      body:
        R('Teorema 3.16 (dimensió)', P('Totes les bases d\'un espai finitament generat tenen el mateix nombre de vectors: la <b>dimensió</b> ' + m('\\dim E') + '. (' + m('\\dim\\{0\\}=0') + '.)')) +
        R('Proposició 3.17', P('Si ' + m('F=\\langle u_1,\\dots,u_m\\rangle\\subseteq K^n') + ' i ' + m('A') + ' té els ' + m('u_i') + ' per <b>files</b>: ' + m('\\dim F=\\operatorname{rang}A') + ' i les files no nul·les de qualsevol esglaonament de ' + m('A') + ' són base de ' + m('F') + '. (Les de la forma de Gauss-Jordan són la <b>base de Gauss-Jordan</b>, única.)')) +
        R('Proposició 3.18', P('El subespai de solucions de ' + m('Ax=0') + ' (' + m('A\\in M_{m\\times n}') + ') té dimensió ' + m('n-\\operatorname{rang}A') + ', i els vectors directors de Gauss-Jordan en són una base.')) +
        R('Proposició 3.19 (propietats de la dimensió)', UL(['<b>(D1)</b> Si ' + m('v_1,\\dots,v_r') + ' és LI i ' + m('u_1,\\dots,u_m') + ' és SG de ' + m('E') + ', aleshores ' + m('r\\le\\dim E\\le m') + '.', '<b>(D2)</b> Si ' + m('\\dim E=n') + ' i ' + m('B') + ' té ' + m('n') + ' vectors: ' + m('B') + ' LI ⇔ ' + m('B') + ' base ⇔ ' + m('B') + ' genera. (Amb ' + m('n') + ' vectors n\'hi ha prou amb comprovar <b>una</b> de les dues coses.)', '<b>(D3)</b> Si ' + m('F\\subseteq E') + ' és subespai, ' + m('\\dim F\\le\\dim E') + ', i ' + m('\\dim F=\\dim E\\Rightarrow F=E') + '.'])) +
        R('Corol·lari 3.20', P(m('u_1,\\dots,u_n\\in K^n') + ' és base ⇔ la matriu que els té en columnes és invertible (⇔ ' + m('\\det\\neq0') + ').')) +
        R('Teorema 3.21', P('Dos espais de dimensió finita són isomorfs ⇔ tenen la mateixa dimensió. (Tot espai de dimensió ' + m('n') + ' "és" ' + m('K^n') + '.)')) +
        K('Ampliar una família LI a una base de K^n (Tasca 2)', OL(['Posa els vectors en files i esglaona.', 'Mira quines columnes <b>no</b> tenen pivot.', 'Afegeix els vectors canònics ' + m('e_j') + ' d\'aquestes columnes. La matriu resultant és esglaonada (reordenant files) amb ' + m('n') + ' pivots ⇒ base.'])) +
        K('Treballar en coordenades (polinomis, matrius)', P('Tria la base canònica, passa cada element al seu vector de coordenades, resol el problema a ' + m('K^N') + ' i torna a traduir. Ex.: ' + m('F=\\langle x^3-1,x^2-1,x-1,5x^3+x^2-4x-2\\rangle') + ' ↔ ' + m('\\langle(-1,0,0,1),(-1,0,1,0),(-1,1,0,0),(-2,-4,1,5)\\rangle') + '.') + P('Una condició com ' + m('p(1)=0') + ' es tradueix en una equació lineal en els coeficients: ' + m('a_0+a_1+a_2+a_3=0') + '. ' + m('p\'(1)=0') + ' és ' + m('a_1+2a_2+3a_3=0') + '.')),
      quiz: [
        { q: 'Dimensió de ' + m('V=\\{x+y+z+t=0\\}\\subseteq\\mathbb{R}^4') + '?', a: m('4-1=3') + '.' },
        { q: 'Tres vectors de ' + m('\\mathbb{R}^3') + ' que generen ' + m('\\mathbb{R}^3') + ': són base?', a: 'Sí, per (D2).' },
        { q: m('F\\subseteq G') + ', ' + m('\\dim F=\\dim G=2') + '. Què pots dir?', a: m('F=G') + ' (D3).' },
      ],
    },
    {
      id: '3.5', ch: 3, title: '3.5 Matrius de canvi de base', practice: ['e66'],
      body:
        D('Matriu de canvi de base', P('Si ' + m('B=(u_1,\\dots,u_n)') + ' i ' + m('C') + ' són bases de ' + m('E') + ', ' + m('M(C\\leftarrow B)') + ' és la matriu que té per <b>columnes</b> les coordenades dels ' + m('u_j') + ' en la base ' + m('C') + '. Compleix:') + dm('v_C=M(C\\leftarrow B)\\,v_B.')) +
        R('Proposició 3.22 i Corol·lari 3.23', P(m('M(D\\leftarrow B)=M(D\\leftarrow C)\\,M(C\\leftarrow B)') + ', i ' + m('M(C\\leftarrow B)') + ' és invertible amb inversa ' + m('M(B\\leftarrow C)') + '.')) +
        K('A K^n (Tasca 7)', P(m('M(\\mathcal{C}_{can}\\leftarrow B)=P') + ' = vectors de ' + m('B') + ' en columnes. Per tant ' + m('M(C\\leftarrow B)=Q^{-1}P') + ' amb ' + m('Q') + ' = vectors de ' + m('C') + ' en columnes. I les coordenades d\'un ' + m('v') + ' en ' + m('B') + ' són ' + m('v_B=P^{-1}v') + '.')) +
        E('', P(m('B=((2,5),(3,7))') + ': ' + m('P=\\begin{pmatrix}2&3\\\\5&7\\end{pmatrix}') + ', ' + m('P^{-1}=\\begin{pmatrix}-7&3\\\\5&-2\\end{pmatrix}') + '. Coordenades de ' + m('(1,0)') + ' en ' + m('B') + ': ' + m('(-7,5)') + ' (comprova: ' + m('-7(2,5)+5(3,7)=(1,0)') + ' ✓).')),
      quiz: [{ q: 'Si ' + m('P=M(\\mathcal{C}\\leftarrow B)') + ', com calculo les coordenades de ' + m('v') + ' en ' + m('B') + '?', a: m('v_B=P^{-1}v') + ' (o resolent ' + m('Px=v') + ').' }],
    },
    {
      id: '3.6', ch: 3, title: '3.6 Aplicacions lineals: nucli i imatge', practice: ['e50', 'e51', 'e53', 'e55', 'e58', 'e61'],
      body:
        D('Aplicació lineal', P(m('f\\colon E\\to V') + ' és <b>lineal</b> si ' + m('f(u+v)=f(u)+f(v)') + ' i ' + m('f(au)=af(u)') + '. Conseqüència: ' + m('f(0)=0') + ' i ' + m('f(\\sum a_iu_i)=\\sum a_if(u_i)') + '. Un endomorfisme és una aplicació lineal ' + m('E\\to E') + '; un isomorfisme, una lineal bijectiva.')) +
        K('És lineal?', UL(['Test ràpid: ' + m('f(0)=0') + '? Si no, no és lineal (constants sumades).', 'Si cada component és combinació lineal de les variables (sense constants, productes, potències, ' + m('e^x') + ', ' + m('|x|') + '...) ⇒ és ' + m('v\\mapsto Av') + ' ⇒ lineal.', 'Derivar, transposar, traça, avaluar un polinomi en un punt, multiplicar per ' + m('x') + '... són lineals. ' + m('\\det') + ' (' + m('n\\ge2') + '), ' + m('X\\mapsto X^2') + ' no.', 'Compte amb el cos: ' + m('z\\mapsto\\overline z') + ' no és ' + m('\\mathbb{C}') + '-lineal; ' + m('x\\mapsto x^2') + ' sí que és lineal a ' + m('\\mathbb{Z}_2') + '.'])) +
        R('Una aplicació lineal queda determinada per les imatges d\'una base', P('Si ' + m('B=(u_1,\\dots,u_n)') + ' és base de ' + m('E') + ' i triem ' + m('w_1,\\dots,w_n\\in V') + ' qualssevol, hi ha una <b>única</b> lineal amb ' + m('f(u_i)=w_i') + '. Si els ' + m('u_i') + ' donats són LD, les imatges han de complir les mateixes relacions (si no, no existeix).')) +
        R('Teorema 3.24 (matriu d\'una aplicació)', P('Les lineals ' + m('K^n\\to K^m') + ' són exactament ' + m('f(v)=Av') + ' amb ' + m('A\\in M_{m\\times n}(K)') + '. <b>La columna ' + m('j') + ' de ' + m('A') + ' és ' + m('f(e_j)') + '.</b> Les files són les formes lineals ' + m('\\ell_i') + ' (coeficients de cada component).') + P('Corol·lari 3.25: ' + m('M(g\\circ f)=M(g)M(f)') + '.')) +
        D('Nucli i imatge', P(m('\\operatorname{Ker}f=\\{u\\in E\\mid f(u)=0\\}') + ' (subespai de ' + m('E') + '), ' + m('\\operatorname{Im}f=\\{f(u)\\}') + ' (subespai de ' + m('V') + '). Si ' + m('E=\\langle u_1,\\dots,u_n\\rangle') + ', ' + m('\\operatorname{Im}f=\\langle f(u_1),\\dots,f(u_n)\\rangle') + ': a ' + m('K^n') + ', <b>la imatge està generada per les columnes de ' + m('A') + '</b>.')) +
        R('Teorema de la dimensió', dm('\\dim\\operatorname{Ker}f+\\dim\\operatorname{Im}f=\\dim E.') + P('A ' + m('K^n') + ': ' + m('\\dim\\operatorname{Ker}f=n-\\operatorname{rang}A') + ', ' + m('\\dim\\operatorname{Im}f=\\operatorname{rang}A') + '. (Corol·lari 3.26: ' + m('\\operatorname{rang}A=\\operatorname{rang}A^t') + '.)')) +
        R('Lema 3.27 i Teorema 3.28', UL([m('f') + ' injectiva (monomorfisme) ⇔ ' + m('\\operatorname{Ker}f=\\{0\\}') + ' ⇔ ' + m('\\operatorname{rang}A=n') + ' (nombre de columnes).', m('f') + ' exhaustiva (epimorfisme) ⇔ ' + m('\\operatorname{Im}f=V') + ' ⇔ ' + m('\\operatorname{rang}A=m') + ' (nombre de files).'])) +
        R('Corol·laris 3.29 i 3.30', UL(['Epimorfisme ⇒ ' + m('\\dim E\\ge\\dim V') + '; monomorfisme ⇒ ' + m('\\dim E\\le\\dim V') + '.', 'Si ' + m('\\dim E=\\dim V') + ': injectiva ⇔ exhaustiva ⇔ isomorfisme ⇔ ' + m('A') + ' invertible. L\'invers té matriu ' + m('A^{-1}') + '.'])) +
        K('Nucli i imatge (Tasca 6)', OL(['Escriu ' + m('A') + ' (files = coeficients de cada component).', 'Gauss-Jordan de ' + m('A') + '.', m('\\operatorname{Ker}') + ': resol ' + m('Ax=0') + ' (un vector per variable lliure).', m('\\operatorname{Im}') + ': les <b>columnes originals</b> de ' + m('A') + ' en les posicions dels pivots.', 'Comprova ' + m('\\dim\\operatorname{Ker}+\\dim\\operatorname{Im}=n') + '.'])) +
        K('Antiimatges', P(m('f^{-1}(\\{v\\})=\\{x\\mid Ax=v\\}') + ': resol el sistema amb ampliada ' + m('v') + '. Si és incompatible, ' + m('f^{-1}(\\{v\\})=\\emptyset') + ' (' + m('v\\notin\\operatorname{Im}f') + '). Si no, ' + m('f^{-1}(\\{v\\})=p+\\operatorname{Ker}f') + ' amb ' + m('p') + ' una solució particular (no és subespai si ' + m('v\\neq0') + '). Per a un subespai ' + m('W') + ', ' + m('f^{-1}(W)') + ' sí que és subespai.')),
      quiz: [
        { q: 'És lineal ' + m('f(x,y)=(0,y+1,x-y)') + '?', a: 'No: ' + m('f(0,0)=(0,1,0)\\neq0') + '.' },
        { q: m('f\\colon\\mathbb{R}^4\\to\\mathbb{R}^3') + ' pot ser injectiva?', a: 'No: ' + m('\\dim\\operatorname{Ker}=4-\\operatorname{rang}\\ge1') + '.' },
        { q: 'Si ' + m('f(1,0)=(2,-5,9)') + ' i ' + m('f(0,1)=(3,0,1)') + ', quina és la matriu?', a: m('\\begin{pmatrix}2&3\\\\-5&0\\\\9&1\\end{pmatrix}') + ' (imatges en <b>columnes</b>).' },
      ],
    },
    {
      id: '3.7', ch: 3, title: '3.7 Matriu d\'una aplicació respecte de bases', practice: ['e66', 'e67'],
      body:
        D('M(B′ ← f B)', P('Siguin ' + m('B=(u_1,\\dots,u_n)') + ' base de ' + m('E') + ' (sortida) i ' + m('B\'') + ' base de ' + m('V') + ' (arribada). ' + m('M(B\'\\xleftarrow{f}B)') + ' té per <b>columna ' + m('j') + '</b> les coordenades de ' + m('f(u_j)') + ' en la base ' + m('B\'') + '. Compleix ' + m('f(v)_{B\'}=M(B\'\\xleftarrow{f}B)\\,v_B') + '.')) +
        R('Fórmula del canvi de base', dm('M(B\'\\xleftarrow{f}B)=M(B\'\\leftarrow C\')\\,M(C\'\\xleftarrow{f}C)\\,M(C\\leftarrow B)') + P('A ' + m('K^n\\to K^m') + ' amb ' + m('A') + ' la matriu en bases canòniques, ' + m('P') + ' = vectors de ' + m('B') + ' en columnes i ' + m('Q') + ' = vectors de ' + m('B\'') + ' en columnes:') + dm('M(B\'\\xleftarrow{f}B)=Q^{-1}AP.') + P('Per a un endomorfisme amb la mateixa base a sortida i arribada: ' + m('M(f;B)=P^{-1}AP') + '. Dues matrius així es diuen <b>semblants</b>.')) +
        R('Corol·lari 3.35', P('Si ' + m('f') + ' és isomorfisme, ' + m('M(B_V\\xleftarrow{f}B_E)') + ' és invertible i la seva inversa és ' + m('M(B_E\\xleftarrow{f^{-1}}B_V)') + '.')) +
        K('Calcular M(B′ ← f B)', OL(['Calcula ' + m('f(u_1),\\dots,f(u_n)') + '.', 'Si l\'arribada és la canònica, aquests vectors <b>són</b> les columnes (' + m('=AP') + ').', 'Si no, expressa\'ls en coordenades de ' + m('B\'') + ': multiplica per ' + m('Q^{-1}') + ' (o resol ' + m('Qx=f(u_j)') + ').'])) +
        K('Trobar una base amb matriu donada', P('Si volem ' + m('M(C\\xleftarrow{f}B)=\\begin{pmatrix}1&0&0\\\\2&0&0\\end{pmatrix}') + ', cal ' + m('f(u_1)=(1,2)') + ' i ' + m('f(u_2)=f(u_3)=0') + ': ' + m('u_2,u_3') + ' una base de ' + m('\\operatorname{Ker}f') + ' i ' + m('u_1') + ' qualsevol solució de ' + m('Au=(1,2)') + '.')),
      quiz: [{ q: 'Quina fórmula dóna ' + m('M(B_2\\xleftarrow{f}B_1)') + '?', a: m('Q^{-1}AP') + ', ' + m('P') + ' = ' + m('B_1') + ' en columnes, ' + m('Q') + ' = ' + m('B_2') + ' en columnes.' }],
    },
    {
      id: '3.8', ch: 3, title: '3.8 Suma, intersecció i suma directa', practice: ['e63', 'e64'],
      body:
        D('Suma i intersecció', P(m('F\\cap G') + ' i ' + m('F+G=\\{u+v\\mid u\\in F,v\\in G\\}') + ' són subespais. Si ' + m('F=\\langle f_i\\rangle,\\ G=\\langle g_j\\rangle') + ', aleshores ' + m('F+G=\\langle f_i,g_j\\rangle') + '. (La unió ' + m('F\\cup G') + ' en general <b>no</b> és subespai.)')) +
        R('Fórmula de Grassmann', dm('\\dim(F+G)+\\dim(F\\cap G)=\\dim F+\\dim G.')) +
        R('Lema 3.36 (suma directa)', P('Són equivalents: (1) ' + m('F\\cap G=\\{0\\}') + '; (2) tot vector de ' + m('F+G') + ' s\'escriu de manera única com ' + m('u+v') + '; (3) la unió d\'una base de ' + m('F') + ' i una de ' + m('G') + ' és base de ' + m('F+G') + '; (4) ' + m('\\dim(F+G)=\\dim F+\\dim G') + '. Llavors escrivim ' + m('F\\oplus G') + '. Si a més ' + m('F\\oplus G=E') + ', són <b>complementaris</b>.')) +
        K('Calcular F∩G', UL(['<b>Amb equacions</b>: si tens equacions de ' + m('F') + ' i de ' + m('G') + ', ' + m('F\\cap G') + ' és el conjunt de solucions de totes juntes.', '<b>Amb generadors</b>: resol ' + m('\\sum a_if_i=\\sum b_jg_j') + '; cada solució dóna un vector ' + m('\\sum a_if_i') + ' de la intersecció.', '<b>Zassenhaus</b>: esglaona la matriu amb files ' + m('(f_i\\mid f_i)') + ' i ' + m('(g_j\\mid 0)') + '. Files amb part esquerra no nul·la → base de ' + m('F+G') + '; files amb esquerra nul·la → la part dreta és base de ' + m('F\\cap G') + '.', 'Per a només la dimensió: Grassmann.'])) +
        E('', P(m('F=\\langle(1,1,-1),(2,0,-1)\\rangle,\\ G=\\langle(1,0,-1),(2,3,0),(4,3,-2)\\rangle\\subseteq\\mathbb{R}^3') + ': ' + m('\\dim F=2') + ', ' + m('\\dim G=2') + ' (el tercer generador és suma dels dos primers... comprova-ho!), ' + m('\\dim(F+G)=3') + ' ⇒ ' + m('\\dim(F\\cap G)=1') + '.')),
      quiz: [{ q: 'Dos plans diferents de ' + m('\\mathbb{R}^3') + ' que passen per l\'origen: dimensió de la intersecció?', a: m('2+2-3=1') + ': una recta.' }],
    },
    {
      id: '3.9', ch: 3, title: '3.9 Resolució de problemes bàsics (Tasques 1–8)', practice: ['e37', 'e43', 'e44', 'e55', 'e63', 'e66'],
      body:
        K('Tasca 1 · Pertinença', P('Matriu ' + m('A') + ' amb ' + m('u_1,\\dots,u_m') + ' en columnes. ' + m('u\\in\\langle u_i\\rangle\\iff\\operatorname{rang}A=\\operatorname{rang}(A|u)') + '; els coeficients són les solucions.')) +
        K('Tasca 2 · LI i ampliar', P('Vectors en files: LI ⇔ rang ' + m('=r') + '. Ampliar: afegir els ' + m('e_j') + ' de les columnes sense pivot de l\'esglaonada.')) +
        K('Tasca 3 · Base i dimensió de ⟨u₁,…,uₘ⟩', P('Vectors en files: ' + m('\\dim=\\operatorname{rang}') + '; files no nul·les de l\'esglaonada = base; de la de Gauss-Jordan = base de Gauss-Jordan.')) +
        K('Tasca 4 · F = G?', P('Mateixa base de Gauss-Jordan; o bé ' + m('F\\subseteq G') + ' i mateixa dimensió.')) +
        K('Tasca 5 · Base de les solucions de Ax = 0', P('Gauss-Jordan; vectors directors de la paramètrica; ' + m('\\dim=n-\\operatorname{rang}A') + '.')) +
        K('Tasca 6 · Ker i Im', P('Ker com a la Tasca 5; Im: columnes de ' + m('A') + ' en posició de pivot; ' + m('\\dim\\operatorname{Im}=\\operatorname{rang}A') + '.')) +
        K('Tasca 7 · Canvi de base', P(m('M(C\\leftarrow B)=Q^{-1}P') + '.')) +
        K('Tasca 8 · F+G i F∩G', P('Bases de ' + m('F') + ' i ' + m('G') + ', i Zassenhaus.')) +
        P('La <b>Calculadora</b> d\'aquesta web fa qualsevol d\'aquestes tasques mostrant els passos, perquè puguis comprovar els teus càlculs a mà.'),
      quiz: [],
    },
    {
      id: '4.1', ch: 4, title: '4.1 Valors propis i vectors propis', practice: ['e68', 'e69'],
      body:
        D('Valor propi i vector propi', P('Sigui ' + m('f\\colon E\\to E') + ' un endomorfisme. ' + m('\\lambda\\in K') + ' és un <b>valor propi</b> si existeix ' + m('e\\neq0') + ' amb ' + m('f(e)=\\lambda e') + '; ' + m('e') + ' és un <b>vector propi</b> de valor propi ' + m('\\lambda') + '. Geomètricament: ' + m('f') + ' deixa fixa la recta ' + m('\\langle e\\rangle') + ' (l\'estira per ' + m('\\lambda') + ').') + P('El <b>subespai propi</b> és ' + m('E_\\lambda=\\{e\\mid f(e)=\\lambda e\\}=\\operatorname{Ker}(f-\\lambda\\,\\mathrm{id})') + ' (vectors propis + el 0).')) +
        D('Polinomi característic', P(m('P_A(x)=\\det(xI_n-A)=(-1)^n\\det(A-xI_n)') + ', mònic de grau ' + m('n') + '. No depèn de la base: si ' + m('B=PAP^{-1}') + ', ' + m('P_B=P_A') + '.')) +
        R('Proposició 4.1', P('(1) Els valors propis de ' + m('f') + ' són les arrels de ' + m('P_f(x)') + ' (com a molt ' + m('n') + '). (2) ' + m('E_\\lambda') + ' correspon a les solucions de ' + m('(A-\\lambda I)x=0') + ', i ' + m('\\dim E_\\lambda=n-\\operatorname{rang}(A-\\lambda I)') + '.')) +
        K('Càlcul ràpid del polinomi característic', dm('n=2:\\quad P_A(x)=x^2-\\operatorname{tr}(A)\\,x+\\det A') + dm('n=3:\\quad P_A(x)=x^3-\\operatorname{tr}(A)\\,x^2+\\operatorname{tr}_2(A)\\,x-\\det A') + P('on ' + m('\\operatorname{tr}_2(A)') + ' és la suma dels tres menors principals ' + m('2\\times2') + ': ' + m('\\begin{vmatrix}a_{11}&a_{12}\\\\a_{21}&a_{22}\\end{vmatrix}+\\begin{vmatrix}a_{11}&a_{13}\\\\a_{31}&a_{33}\\end{vmatrix}+\\begin{vmatrix}a_{22}&a_{23}\\\\a_{32}&a_{33}\\end{vmatrix}') + '.') + P('Arrels d\'un polinomi amb coeficients enters: prova els divisors del terme independent (Ruffini). Triangular ⇒ els valors propis són la diagonal.')) +
        E('END2 dels apunts', P(m('f(x,y)=(2x+y,5x-2y)') + ', ' + m('A=\\begin{pmatrix}2&1\\\\5&-2\\end{pmatrix}') + ', ' + m('\\operatorname{tr}=0,\\ \\det=-9') + ' ⇒ ' + m('P_A=x^2-9') + '. ' + m('E_3=\\operatorname{Ker}(A-3I)=\\langle(1,1)\\rangle') + ', ' + m('E_{-3}=\\langle(1,-5)\\rangle') + '.')) +
        E('Projecció', P(m('p(x,y,z)=(x,y,0)') + ': ' + m('P=x(x-1)^2') + ', ' + m('E_0=\\langle(0,0,1)\\rangle') + ' (eix Oz), ' + m('E_1=\\langle e_1,e_2\\rangle') + ' (pla xy).')),
      quiz: [
        { q: 'Polinomi característic de ' + m('\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}') + '?', a: m('x^2-5x-2') + ' (traça 5, det ' + m('-2') + ').' },
        { q: 'Si ' + m('\\det A=0') + ', quin valor propi segur que té ' + m('A') + '?', a: m('\\lambda=0') + ' (' + m('\\operatorname{Ker}A\\neq\\{0\\}') + ').' },
      ],
    },
    {
      id: '4.2', ch: 4, title: '4.2 Diagonalització', practice: ['e68', 'e69', 'e71', 'e72'],
      body:
        D('Diagonalitzable', P(m('f') + ' és <b>diagonalitzable</b> si hi ha una base ' + m('B') + ' amb ' + m('M(f;B)') + ' diagonal. Una matriu ' + m('A') + ' és diagonalitzable si existeix ' + m('P') + ' invertible amb ' + m('P^{-1}AP=D') + ' diagonal, és a dir ' + m('A=PDP^{-1}') + ' (Lema 4.9).')) +
        R('Lema 4.2 i Corol·lari 4.3', P(m('M(f;B)=\\operatorname{diag}(\\lambda_1,\\dots,\\lambda_n)') + ' ⇔ cada ' + m('e_i') + ' de ' + m('B') + ' és vector propi de valor propi ' + m('\\lambda_i') + '. Per tant: diagonalitzable ⇔ hi ha una <b>base formada per vectors propis</b>.')) +
        R('Lema 4.4', P('Vectors propis de valors propis diferents són LI (els ' + m('E_{\\lambda_i}') + ' estan en suma directa).')) +
        R('Teorema 4.5 (primer criteri)', P(m('f') + ' diagonalitza ⇔ ' + m('\\dim E_{\\lambda_1}+\\dots+\\dim E_{\\lambda_r}=\\dim E') + '.')) +
        R('Corol·lari 4.6', P('Si ' + m('P_f') + ' té ' + m('n') + ' arrels <b>diferents</b> a ' + m('K') + ', ' + m('f') + ' diagonalitza (i cada ' + m('E_\\lambda') + ' té dimensió 1).')) +
        R('Proposició 4.7', P('Si ' + m('\\lambda') + ' té multiplicitat algebraica ' + m('m') + ': ' + m('1\\le\\dim E_\\lambda\\le m') + '. (Els valors propis simples sempre tenen ' + m('\\dim E_\\lambda=1') + ': només cal mirar els múltiples!)')) +
        R('Teorema 4.8 (segon criteri)', P(m('f') + ' diagonalitza ⇔ (1) ' + m('P_f=(x-\\lambda_1)^{m_1}\\cdots(x-\\lambda_r)^{m_r}') + ' descompon completament a ' + m('K[x]') + ', i (2) ' + m('\\dim E_{\\lambda_i}=m_i') + ' per a tot ' + m('i') + '.')) +
        K('Diagonalitzar (pas a pas)', OL(['Matriu ' + m('A') + ' en la base canònica.', m('P_A(x)') + ' i les seves arrels amb multiplicitat.', 'Si alguna arrel no és de ' + m('K') + ' (p. ex. complexa treballant a ' + m('\\mathbb{R}') + ') ⇒ <b>no</b> diagonalitza.', 'Per a cada ' + m('\\lambda') + ' múltiple: ' + m('\\dim E_\\lambda=n-\\operatorname{rang}(A-\\lambda I)') + '. Si és més petita que la multiplicitat ⇒ <b>no</b> diagonalitza.', 'Si diagonalitza: base de cada ' + m('E_\\lambda') + '; ' + m('P') + ' = tots aquests vectors en <b>columnes</b>; ' + m('D') + ' = els valors propis corresponents <b>en el mateix ordre</b>.', 'Comprova ' + m('AP=PD') + '.'])) +
        E('Els casos típics (2×2)', UL([m('f(x,y)=(-x,x-y)') + ': ' + m('P=(x+1)^2') + ', ' + m('E_{-1}=\\langle(0,1)\\rangle') + ' de dim 1 < 2 ⇒ <b>no</b> diagonalitza.', m('f(x,y)=(x-\\tfrac12y,\\ y-2x)') + ': ' + m('P=x^2-2x=x(x-2)') + ', dues arrels diferents ⇒ diagonalitza; ' + m('E_0=\\langle(1,2)\\rangle,\\ E_2=\\langle(1,-2)\\rangle') + '.', m('\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}') + ' (gir de 90°): ' + m('P=x^2+1') + ', sense arrels reals ⇒ no diagonalitza a ' + m('\\mathbb{R}') + ', però sí a ' + m('\\mathbb{C}') + ' (' + m('\\pm i') + ').'])) +
        W(UL(['Una matriu amb un valor propi triple ' + m('\\lambda') + ' només diagonalitza si és ' + m('\\lambda I') + '.', 'El nombre de vectors propis LI és ' + m('\\sum\\dim E_\\lambda') + ', no el nombre de valors propis.', 'Ordre de ' + m('P') + ' i ' + m('D') + ': la columna ' + m('i') + ' de ' + m('P') + ' ha de ser vector propi del valor ' + m('d_{ii}') + '.'])),
      quiz: [
        { q: 'Una ' + m('3\\times3') + ' té valors propis ' + m('1,2,5') + '. Diagonalitza?', a: 'Sí: 3 valors propis diferents (Corol·lari 4.6).' },
        { q: m('P_A=(x-2)^2(x+1)') + ' i ' + m('\\operatorname{rang}(A-2I)=2') + '. Diagonalitza?', a: 'No: ' + m('\\dim E_2=3-2=1<2') + '.' },
      ],
    },
    {
      id: '4.3', ch: 4, title: '4.3 Aplicacions de la diagonalització', practice: ['e73', 'e74'],
      body:
        R('Potències', P('Si ' + m('A=PDP^{-1}') + ': ' + m('A^n=PD^nP^{-1}') + ', amb ' + m('D^n=\\operatorname{diag}(\\lambda_1^n,\\dots,\\lambda_k^n)') + '. Així es calculen ' + m('f^{1000}') + ', recurrències i evolucions a llarg termini.')) +
        E('Recurrència de Fibonacci', P(m('\\begin{pmatrix}F_{n+1}\\\\F_n\\end{pmatrix}=\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}\\begin{pmatrix}F_{n}\\\\F_{n-1}\\end{pmatrix}') + '. Valors propis ' + m('\\frac{1\\pm\\sqrt5}{2}') + ' ⇒ ' + m('F_n=\\frac{1}{\\sqrt5}\\left(\\left(\\frac{1+\\sqrt5}{2}\\right)^n-\\left(\\frac{1-\\sqrt5}{2}\\right)^n\\right)') + '.')) +
        R('Comportament a llarg termini', P('Si ' + m('N_{k+1}=AN_k') + ', ' + m('N_k=A^kN_0') + '. Si tots els ' + m('|\\lambda|<1') + ' ⇒ ' + m('N_k\\to0') + ' (extinció); si el més gran en valor absolut és ' + m('>1') + ' ⇒ creix; si hi ha valors propis de mòdul 1 (p. ex. ' + m('\\pm1') + ') ⇒ es pot estabilitzar o oscil·lar.')) +
        E('Escarabats (exercici 74)', P(m('A=\\begin{pmatrix}0&2&0\\\\P_0&0&0\\\\0&0.8&0\\end{pmatrix}') + ', ' + m('P_A=x(x^2-2P_0)') + ': valors propis ' + m('0,\\pm\\sqrt{2P_0}') + '. ' + m('P_0=0.18') + ' ⇒ ' + m('\\sqrt{0.36}=0.6<1') + ': extinció. ' + m('P_0=0.5') + ' ⇒ ' + m('\\pm1') + ': oscil·lació de període 2. ' + m('P_0=0.72') + ' ⇒ ' + m('1.2>1') + ': creix.')),
      quiz: [{ q: 'Si ' + m('A=PDP^{-1}') + ', quant val ' + m('A^5') + '?', a: m('PD^5P^{-1}') + '.' }],
    },
    {
      id: '4.4', ch: 4, title: '4.4 Matrius reals simètriques (complement)', practice: [],
      body:
        P('<i>Secció complementària dels apunts; a classe només es veu la diagonalització general.</i>') +
        R('Lemes 4.12 i 4.13 (teorema espectral)', P('Una matriu real simètrica (' + m('A=A^t') + ') té tots els valors propis reals, vectors propis de valors propis diferents són ortogonals, i <b>sempre diagonalitza</b>; de fet, amb ' + m('P') + ' ortogonal (' + m('P^{-1}=P^t') + '): ' + m('A=PDP^t') + '.')) +
        E('', P(m('\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}') + ': valors propis 3 i 1, vectors propis ' + m('(1,1)') + ' i ' + m('(1,-1)') + ' (ortogonals). Normalitzant: ' + m('P=\\frac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}') + '.')),
      quiz: [],
    },
    {
      id: 'errors', ch: 0, title: 'Errors típics (els que es van corregir a classe)', practice: [],
      body:
        UL([
          '<b>Signes en restar</b>: a l\'exercici 38 apareixia "5 − 6 = −2"; és −1. A l\'exercici 37 la tercera equació es va copiar "= 0" en lloc de "= 5". Copia l\'ampliada amb cura.',
          '<b>Copiar malament la matriu inicial</b>: al 38 la quarta fila es va escriure (4 1 1 | 3) en lloc de (4 −1 1 | 3). Un sol signe canvia la conclusió.',
          '<b>Barrejar dos exemples</b>: "3(1,1,1) = 7(1,1,1) = (−4,−4,−4)" no té sentit; són càlculs separats.',
          '<b>Dir "multiplico per i" i multiplicar per 2</b>: escriu exactament l\'operació que fas.',
          '<b>Oblidar la conclusió</b>: acaba sempre amb "⇒ és subespai: F = ⟨…⟩" o "⇒ u ∉ F".',
          '<b>Recta que no passa per l\'origen</b>: no és subespai.',
          '<b>Grau del polinomi zero</b>: no és 0. Per a "grau parell" és més segur un contraexemple amb la suma.',
          '<b>Vectors en files o columnes</b>: pertinença/coordenades → columnes; base del generat → files.',
          '<b>Imatge d\'una aplicació</b>: són les columnes originals de A en posició de pivot, no les columnes de la matriu esglaonada.',
          '<b>P i D</b>: els vectors propis van en columnes de P i en el mateix ordre que a D.',
        ]),
      quiz: [],
    },
  ];

  EV.THEORY = SECTIONS;
})(window.EV = window.EV || {});
