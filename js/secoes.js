import { ESTADO } from './estado.js';
import { TERMS, digitar, acender, digitarExtra, retanguloDaLinha } from './terminal.js';
import { linguaAtual } from './idioma.js';
import { sqlK, sqlS, sqlOk, PROMPT_SQL, PROMPT_CONT, nomeArea } from './textos.js';

/* =====================================================================
   SEÇÕES: quando uma seção entra na tela, ela monta SOZINHA (uma linha do tempo
   só dela, até ~2,5 s): o terminal aparece e digita, o título entra e cada bloco
   de conteúdo "pula" da linha do terminal que o gerou (técnica FLIP).
   Também: a janela (modal) de detalhes dos projetos.
   ===================================================================== */
const feitas = new Set();
export const secaoDe = (k) => document.querySelectorAll('.cena')[k];

export function montar(k, extras = {}) {
  if (feitas.has(k)) return;
  feitas.add(k);
  const sec = secaoDe(k), T = TERMS[k];
  const voas = [...sec.querySelectorAll('.voa')];
  // 1) mede TUDO antes de animar (as animações mexem na posição): de onde cada bloco sai
  const origem = voas.map((el) => {
    const r = el.getBoundingClientRect(), lr = retanguloDaLinha(k, el.dataset.linha);
    return { dx: lr.left + Math.min(lr.width, 220) / 2 - (r.left + r.width / 2), dy: lr.top + lr.height / 2 - (r.top + r.height / 2) };
  });
  // 2) a linha do tempo da seção
  const tl = gsap.timeline({ onComplete: () => { T.pronto = true; sec.classList.add('montada'); } });
  T.tl = tl;
  tl.fromTo(T.el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' }, 0);
  tl.fromTo(sec.querySelectorAll('.ent'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12, clearProps: 'transform' }, 0.05);
  const { fim, tempos } = digitar(tl, k, 0.25);
  let ultimo = 0;
  voas.forEach((el, i) => {
    const chave = el.dataset.linha, t = Math.max((tempos[chave] ?? fim) + 0.1, ultimo + 0.07);
    ultimo = t;
    tl.fromTo(el, { x: origem[i].dx, y: origem[i].dy, scale: 0.3, autoAlpha: 0 },
      { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.3)', clearProps: 'transform' }, t);
    tl.call(() => acender(k, chave), null, t);
  });
  // detalhes de cada seção
  const barra = sec.querySelector('.tempo-barra');
  if (barra) tl.fromTo(barra, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 0.4);
  const niveis = sec.querySelectorAll('.nivel i');
  if (niveis.length) tl.fromTo(niveis, { scaleX: 0 }, { scaleX: (i, el) => +el.dataset.n, duration: 0.8, ease: 'power2.out', stagger: 0.12 }, (tempos.idiomas ?? fim) + 0.2);
  if (extras.grafico) {   // gráfico 3D: as barras sobem enquanto as linhas b0..b4 acendem
    tl.to(extras.grafico.prog, { p: 1, duration: 1.2, ease: 'none' }, tempos.b0 ?? fim);
    [0, 1, 2, 3, 4].forEach((i) => tl.call(() => acender(k, 'b' + i), null, (tempos.b0 ?? fim) + 0.1 + i * 0.22));
  }
  if (ESTADO.reduzMovimento) tl.progress(1);
}

/* ---------- janela de detalhes do projeto ---------- */
export function iniciarModal(lenis) {
  const m = document.getElementById('modal'), q = (s) => m.querySelector(s);
  let foco = null, ocupado = false;
  const aberta = () => !m.hidden;

  function abrir(card) {
    q('#modal-num').textContent = card.querySelector('.proj-num').textContent;
    q('#modal-titulo').innerHTML = card.querySelector('h3').innerHTML;
    q('#modal-desc').innerHTML = card.querySelector('.proj-desc').innerHTML;
    q('#modal-tags').replaceChildren(...[...card.querySelectorAll('.proj-info .tags li')].map((li) => li.cloneNode(true)));
    q('#modal-acoes').replaceChildren(...[...card.querySelectorAll('.acoes > a')].map((a) => a.cloneNode(true)));
    m.style.setProperty('--cor', card.style.getPropertyValue('--cor'));
    m.style.setProperty('--cor-txt', card.style.getPropertyValue('--cor-txt') || 'var(--tinta)');
    foco = document.activeElement;
    m.hidden = false;
    document.body.classList.add('modal-aberto');
    if (lenis) lenis.stop();
    q('#modal-fechar').focus();
    ocupado = false;
  }
  function fechar() {
    if (!aberta()) return;
    m.hidden = true;
    document.body.classList.remove('modal-aberto');
    if (lenis) lenis.start();
    if (foco && foco.focus) foco.focus();
  }
  // clicar no cartão: o terminal digita o SELECT daquele projeto e, no fim, a janela abre
  function clicar(card) {
    if (ocupado) return;
    ocupado = true;
    const en = linguaAtual() === 'en';
    const cmd = `${sqlK('SELECT')} * ${sqlK('FROM')} ${en ? 'projects' : 'projetos'} ${sqlK('WHERE')} id = ${card.dataset.id};`;
    digitarExtra(4, cmd, sqlOk(en ? '(1 row)' : '(1 linha)'), () => setTimeout(() => abrir(card), 120), PROMPT_SQL);
    if (ESTADO.reduzMovimento) TERMS[4].extraTl.progress(1);
  }
  document.querySelectorAll('.projeto').forEach((card) => {
    card.addEventListener('click', (e) => { if (!e.target.closest('a')) clicar(card); });
  });
  q('#modal-fechar').addEventListener('click', fechar);
  m.addEventListener('click', (e) => { if (e.target === m) fechar(); });
  addEventListener('keydown', (e) => {
    if (!aberta()) return;
    if (e.key === 'Escape') fechar();
    if (e.key === 'Tab') {   // o foco fica preso dentro da janela
      const f = [...m.querySelectorAll('a[href],button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  /* ---------- janela do currículo: prévia do PDF + baixar ---------- */
  const cv = document.getElementById('modal-cv');
  if (cv) {
    const quadroPdf = cv.querySelector('iframe');
    const abrirCV = () => {
      // o currículo segue o idioma do site: PT → Curriculo.pdf · EN → Resume.pdf
      const en = linguaAtual() === 'en';
      const arquivo = en ? 'arquivos/Resume.pdf' : 'arquivos/Curriculo.pdf';
      if (quadroPdf.getAttribute('src') !== arquivo + '#view=FitH') quadroPdf.setAttribute('src', arquivo + '#view=FitH');
      cv.querySelectorAll('.cv-acoes a').forEach((a) => a.setAttribute('href', arquivo));
      cv.querySelector('a[download]').setAttribute('download', en ? 'Resume-Pedro-Nunes-Cruz.pdf' : 'Curriculo-Pedro-Nunes-Cruz.pdf');
      foco = document.activeElement;
      cv.hidden = false;
      document.body.classList.add('modal-aberto');
      if (lenis) lenis.stop();
      cv.querySelector('.fechar-cv').focus();
    };
    const fecharCV = () => {
      if (cv.hidden) return;
      cv.hidden = true;
      document.body.classList.remove('modal-aberto');
      if (lenis) lenis.start();
      if (foco && foco.focus) foco.focus();
    };
    document.getElementById('ver-cv')?.addEventListener('click', abrirCV);
    cv.querySelector('.fechar-cv').addEventListener('click', fecharCV);
    cv.addEventListener('click', (e) => { if (e.target === cv) fecharCV(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharCV(); });
  }
  return { fechar, aberta };
}

/* ---------- filtro dos projetos por área: o terminal digita o SELECT ... WHERE ---------- */
export function iniciarFiltro() {
  const botoes = [...document.querySelectorAll('.filtro')], cards = [...document.querySelectorAll('.projeto')];
  botoes.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.f, en = linguaAtual() === 'en';
    botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const vis = cards.filter((c) => f === 'todos' || c.dataset.area.split(' ').includes(f));
    cards.forEach((c) => { c.hidden = !vis.includes(c); });
    if (!ESTADO.reduzMovimento) gsap.fromTo(vis, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', clearProps: 'transform' });
    if (TERMS[4].pronto) {
      const tab = en ? 'projects' : 'projetos';
      const cmd = f === 'todos' ? `${sqlK('SELECT')} * ${sqlK('FROM')} ${tab};`
        : [`${sqlK('SELECT')} * ${sqlK('FROM')} ${tab}`, `  ${sqlK('WHERE')} area = ${sqlS("'" + nomeArea(f, en ? 'en' : 'pt') + "'")};`];
      digitarExtra(4, cmd, sqlOk(en ? `(${vis.length} rows)` : `(${vis.length} linhas)`), null, PROMPT_SQL, PROMPT_CONT);
    }
    ScrollTrigger.refresh();
  }));
}
