import { TERMINAL, COR } from './textos.js?v=20261125b';

/* =====================================================================
   TERMINAIS: cada seção tem o seu. As linhas existem desde o começo (altura fixa,
   para nada pular de lugar) e o texto é digitado por uma linha do tempo do GSAP.
   ===================================================================== */
export const TERMS = [];      // um por seção: { el, k, linhas, n, pronto, tl }
let lingua = 'pt';
const CARET = '<span class="caret">▌</span>';
const comp = (h) => h.replace(/<[^>]+>/g, '').length;          // tamanho do texto sem as tags
const linhasDe = (k) => TERMINAL[lingua][k];

// cria as linhas vazias de cada terminal (n = linhas da tela + linhas extras reservadas)
export function criarTerminais() {
  document.querySelectorAll('.term').forEach((el) => {
    const k = +el.dataset.k, extra = +(el.dataset.extra || 0), n = TERMINAL.pt[k].length;
    const tela = el.querySelector('.term-tela');
    el.style.setProperty('--n', n + extra);
    for (let i = 0; i < n + extra; i++) { const d = document.createElement('div'); d.className = 'l'; tela.appendChild(d); }
    TERMS[k] = { el, k, linhas: [...tela.children], n, pronto: false, tl: null };
  });
}

// pega só os primeiros n caracteres VISÍVEIS de um texto com tags <span>, fechando a tag aberta
export function fatiar(html, n) {
  let saida = '', vistos = 0, aberto = false, m;
  const re = /(<[^>]+>)|([^<]+)/g;
  while ((m = re.exec(html))) {
    if (m[1]) { saida += m[1]; aberto = !m[1].startsWith('</'); continue; }
    const resto = n - vistos;
    if (resto <= 0) break;
    saida += m[2].slice(0, resto); vistos += Math.min(resto, m[2].length);
    if (resto < m[2].length) break;
  }
  return aberto ? saida + '</span>' : saida;
}

function htmlFinal(k, i) {
  const l = linhasDe(k)[i];
  if (!l) return '';
  return l.tipo === 'com' ? `<span class="com">${l.txt}</span>` : (l.pre || '') + l.txt;
}
export const indiceDaChave = (k, chave) => linhasDe(k).findIndex((l) => l.chave === chave);

// acrescenta na linha do tempo a digitação de TODA a tela k; devolve quando acaba e quando cada chave apareceu
export function digitar(tl, k, t0) {
  const T = TERMS[k], L = linhasDe(k), tempos = {};
  const total = L.reduce((s, l) => s + (l.tipo === 'cmd' ? comp(l.txt) : 0), 0);
  const cd = Math.min(0.032, 1.35 / Math.max(total, 1));        // ~0,03 s por letra; no máx. ~1,35 s digitando por seção (+0,5 s, pedido do Pedro)
  let t = t0;
  L.forEach((l, i) => {
    const d = T.linhas[i];
    if (l.tipo === 'cmd') {
      const c = comp(l.txt), dur = c * cd, o = { n: 0 };
      tl.call(() => { d.innerHTML = l.pre + CARET; }, null, t);
      tl.to(o, { n: c, duration: dur, ease: 'none', onUpdate() { d.innerHTML = l.pre + fatiar(l.txt, Math.round(o.n)) + CARET; } }, t);
      tl.call(() => { d.innerHTML = htmlFinal(k, i); }, null, t + dur + 0.005);
      t += dur + 0.03;
    } else {
      tl.call(() => { d.innerHTML = htmlFinal(k, i); }, null, t);
      t += l.tipo === 'com' ? 0.06 : 0.035;
    }
    if (l.chave) tempos[l.chave] = t;
  });
  return { fim: t, tempos };
}

// acende a linha (cor do bloco que nasceu dela)
export function acender(k, chave) {
  const i = indiceDaChave(k, chave);
  if (i < 0) return;
  const d = TERMS[k].linhas[i];
  d.classList.add('acesa'); d.style.background = linhasDe(k)[i].luz; d.style.color = COR.tinta;
}
// se a linha não existir, o bloco sai do meio do terminal (nunca trava a montagem da seção)
export const retanguloDaLinha = (k, chave) => (TERMS[k].linhas[indiceDaChave(k, chave)] || TERMS[k].el).getBoundingClientRect();

// digita um comando extra nas linhas reservadas do fim do terminal (SET lang..., SELECT ... WHERE id...).
// cmd pode ser uma lista: cada parte vai numa linha (a 2ª em diante com o prompt de continuação "portfolio-#").
export function digitarExtra(k, cmd, saida, aoFim, prompt, promptCont = prompt) {
  const T = TERMS[k], partes = Array.isArray(cmd) ? cmd : [cmd];
  if (T.extraTl) T.extraTl.kill();
  T.linhas.slice(T.n).forEach((l) => { l.innerHTML = ''; });
  const tl = gsap.timeline({ onComplete: aoFim });
  partes.forEach((p, i) => {
    const d = T.linhas[T.n + i], pr = i ? promptCont : prompt, c = comp(p), o = { n: 0 };
    tl.to(o, { n: c, duration: c * 0.014, ease: 'none', onUpdate() { d.innerHTML = pr + fatiar(p, Math.round(o.n)) + CARET; } });
    tl.call(() => { d.innerHTML = pr + p; });
  });
  tl.call(() => { T.linhas[T.n + partes.length].innerHTML = saida; });
  T.extraTl = tl;
  return tl;
}

// troca o idioma: termina o que estava digitando e reescreve as linhas já prontas no idioma novo
export function atualizarIdioma(l) {
  TERMS.forEach((T) => { if (T.tl && T.tl.progress() < 1) T.tl.progress(1); });
  lingua = l;
  TERMS.forEach((T) => { if (T.pronto) T.linhas.forEach((d, i) => { if (i < T.n) d.innerHTML = htmlFinal(T.k, i); }); });
}
export const linguaDoTerminal = () => lingua;
