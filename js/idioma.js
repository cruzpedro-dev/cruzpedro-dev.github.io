import { EN, UI } from './textos.js?v=20261125b';
import { atualizarIdioma } from './terminal.js?v=20261125b';

/* =====================================================================
   IDIOMA (PT / EN). O português é o texto que já está no HTML (guardado em data-pt
   na primeira vez); o inglês vem de EN em js/textos.js. Chaves: data-t (texto) e
   data-aria (aria-label).
   ===================================================================== */
let idiomaAtual = 'pt';
export const linguaAtual = () => idiomaAtual;

export function idiomaSalvo() {
  try { return localStorage.getItem('lang') === 'en' ? 'en' : 'pt'; } catch (e) { return 'pt'; }
}

export function aplicarIdioma(l) {
  idiomaAtual = l;
  document.querySelectorAll('[data-t]').forEach((el) => {
    if (el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;          // guarda o português
    el.innerHTML = l === 'en' ? (EN[el.dataset.t] ?? el.dataset.pt) : el.dataset.pt;
  });
  document.querySelectorAll('[data-aria]').forEach((el) => {
    if (el.dataset.ariaPt === undefined) el.dataset.ariaPt = el.getAttribute('aria-label') || '';
    const v = l === 'en' ? EN[el.dataset.aria] : el.dataset.ariaPt;
    if (v) el.setAttribute('aria-label', v);
  });
  document.documentElement.lang = l === 'en' ? 'en' : 'pt-BR';
  document.title = UI[l].titulo;
  document.querySelector('meta[name="description"]')?.setAttribute('content', UI[l].desc);
  document.querySelectorAll('#btn-lang span').forEach((s) => s.classList.toggle('on', s.dataset.l === l));
  atualizarIdioma(l);
  try { localStorage.setItem('lang', l); } catch (e) { /* sem armazenamento: tudo bem */ }
}
