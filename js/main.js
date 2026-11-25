import { ESTADO } from './estado.js?v=20261125b';
import { criarTerminais, TERMS, digitarExtra } from './terminal.js?v=20261125b';
import { aplicarIdioma, idiomaSalvo, linguaAtual } from './idioma.js?v=20261125b';
import { montar, iniciarModal, iniciarFiltro, secaoDe } from './secoes.js?v=20261125b';
import { criarGrafico } from './grafico3d.js?v=20261125b';
import { iniciarPreloader } from './efeitos.js?v=20261125b';
import { sqlK, sqlS, sqlOk, PROMPT_SQL, contarProjetos } from './textos.js?v=20261125b';

/* =====================================================================
   LIGA TUDO: terminais, idioma, rolagem suave (Lenis), gatilhos das seções,
   gráfico 3D, janela de projeto, preloader.
   Sem GSAP (sem internet) a página fica na versão simples (o CSS padrão).
   ===================================================================== */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('animado');
  contarProjetos(document.querySelectorAll('.projeto'));
  criarTerminais();
  aplicarIdioma(idiomaSalvo());
  const grafico = criarGrafico(document.getElementById('gl'));

  // rolagem suave
  let lenis = null;
  if (window.Lenis && !ESTADO.reduzMovimento) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const modal = iniciarModal(lenis);
  iniciarFiltro();

  // ir para uma seção (menu, barra do topo, logo)
  const botaoMenu = document.getElementById('btn-menu'), menuCel = document.getElementById('menu-celular');
  const fecharMenu = () => { menuCel.classList.remove('aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); };
  const irPara = (k) => {
    const alvo = secaoDe(k);
    if (lenis) lenis.scrollTo(alvo, { duration: 1.4 });
    else alvo.scrollIntoView({ behavior: ESTADO.reduzMovimento ? 'auto' : 'smooth' });
  };
  document.querySelectorAll('a[data-k]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); fecharMenu(); irPara(+a.dataset.k);
  }));
  botaoMenu.addEventListener('click', () => {
    const abrir = !menuCel.classList.contains('aberto');
    menuCel.classList.toggle('aberto', abrir); botaoMenu.setAttribute('aria-expanded', String(abrir));
  });

  // PT / EN: o terminal do início digita SET lang = '...'; e todos os textos mudam
  document.getElementById('btn-lang').addEventListener('click', () => {
    const nova = linguaAtual() === 'pt' ? 'en' : 'pt';
    modal.fechar();
    aplicarIdioma(nova);
    if (TERMS[0].pronto) digitarExtra(0, `${sqlK('SET')} lang = ${sqlS("'" + nova + "'")};`, sqlOk('SET'), null, PROMPT_SQL);
  });

  // tudo que depende do tamanho da tela é medido aqui
  function redimensionar() {
    ESTADO.celular = innerWidth < 900;
    document.body.classList.toggle('celular', ESTADO.celular);
    if (grafico) grafico.medir();
  }
  let esperaResize;
  addEventListener('resize', () => { clearTimeout(esperaResize); esperaResize = setTimeout(() => { redimensionar(); ScrollTrigger.refresh(); }, 120); });
  redimensionar();
  if (document.fonts) document.fonts.ready.then(() => { redimensionar(); ScrollTrigger.refresh(); });

  const t0 = performance.now();
  const quadro = () => { if (grafico) grafico.atualizar((performance.now() - t0) / 1000); };
  gsap.ticker.add(quadro);
  addEventListener('mousemove', (e) => { ESTADO.mouseX = (e.clientX / innerWidth - 0.5) * 2; });

  window.__ABRIU = true;   // avisa a trava de segurança do index.html
  if (lenis) lenis.stop();
  iniciarPreloader(document.fonts ? document.fonts.ready : Promise.resolve(), () => {
    document.body.classList.remove('carregando');
    if (lenis) lenis.start();
    redimensionar();
    // cada seção monta sozinha quando está DE FATO na tela (o topo passou de 45% da altura) e continua lá
    // por um instante: ao rolar rápido ou pular pelo menu, as seções do caminho não se montam escondidas.
    // O botão do menu marca a seção atual.
    document.querySelectorAll('.cena').forEach((sec, k) => {
      let espera = null;
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 35%',
        onToggle: (s) => {
          clearTimeout(espera);
          if (s.isActive) espera = setTimeout(() => { if (s.isActive) montar(k, { grafico }); }, 250);
        }
      });
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onToggle: (s) => { if (s.isActive) document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('ativo', +c.dataset.k === k)); }
      });
    });
    ScrollTrigger.refresh();
  });

  // ---------- só para testes (console) ----------
  window.__ESTADO = ESTADO;
  window.__lenis = lenis;
  window.__medirQuadro = (n = 60) => {
    const ini = performance.now();
    for (let i = 0; i < n; i++) if (grafico) grafico.atualizar(i / 60, true);
    return +((performance.now() - ini) / n).toFixed(2);
  };
  // adianta o relógio do GSAP (o painel escondido do navegador anda em câmera lenta)
  window.__avanca = (s) => { gsap.globalTimeline.time(gsap.globalTimeline.time() + s); quadro(); };
  // monta todas as seções já (e termina as animações)
  window.__montarTudo = () => {
    document.querySelectorAll('.cena').forEach((s, k) => montar(k, { grafico }));
    TERMS.forEach((T) => T.tl && T.tl.progress(1));
    quadro();
    return TERMS.map((T) => +T.tl.duration().toFixed(2));
  };
  // confere: nenhum texto/cartão/terminal visível por cima de outro, sem rolagem lateral, texto cortado
  window.__checar = () => {
    const problemas = [];
    const visivel = (el) => { const c = getComputedStyle(el); return c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.01; };
    const nome = (el) => (el.id ? '#' + el.id : el.className.toString().split(' ')[0]) + ':' + (el.textContent || '').trim().slice(0, 18);
    document.querySelectorAll('.cena').forEach((sec) => {
      const els = [...sec.querySelectorAll('.cartao,.term,.titulo,.etiqueta,.subtitulo,.mega,.botao,.rede,.bloco,#regiao-grafico,.obrigado,.rodape,.tempo-linha,.filtro')].filter(visivel);
      for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
        const a = els[i], b = els[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w > 1 && h > 1) problemas.push(`${sec.id}: ${nome(a)} x ${nome(b)}`);
      }
      sec.querySelectorAll('.cartao,.term-tela .l,.bloco,.botao,.rede,.mega,.titulo').forEach((el) => {
        if (visivel(el) && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline') problemas.push(`${sec.id}: transborda ${nome(el)}`);
      });
    });
    const D = document.documentElement;
    return { problemas, rolagemLateral: D.scrollWidth > innerWidth, alturaEmTelas: +(D.scrollHeight / innerHeight).toFixed(2) };
  };
} else {
  document.getElementById('preloader')?.remove();
  document.body.classList.remove('carregando');
  document.body.classList.add('sem-animacao');
}
