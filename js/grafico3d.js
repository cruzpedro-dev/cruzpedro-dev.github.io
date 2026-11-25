import * as THREE from 'three';
import { ESTADO, limitar, suavizar, salto, escalonar } from './estado.js?v=20261125b';

/* =====================================================================
   GRÁFICO 3D DAS SKILLS (estilo do esboço D)
   Caixas de cor sólida com contorno escuro (EdgesGeometry), luz simples que
   mantém as cores chapadas. Sem bloom, sem brilho, sem sombra borrada.
   O canvas fica DENTRO da área #regiao-grafico (rola junto com a página).
   As barras crescem com prog.p (0 → 1), que a linha do tempo da seção anima;
   os rótulos (HTML) acompanham o topo de cada barra.
   ===================================================================== */
const AREAS = [   // contagem real das skills do portfólio, por área
  { nome: 'backend', n: 8, cor: '#2f5bea' },
  { nome: 'frontend', n: 3, cor: '#ff5a3c' },
  { nome: 'ferramentas', n: 6, cor: '#22b573' },
  { nome: 'versionamento', n: 1, cor: '#ffc93c' },
  { nome: 'infraestrutura', n: 3, cor: '#fffdf7' }
];
const TINTA = '#16161a';
const ATRASO_BARRA = 0.22;
const ALVO_GRAFICO = new THREE.Vector3(0, 1.05, 0);
const DIRECAO_CAM = new THREE.Vector3(0.5, 0.48, 1).normalize();   // mais de frente: menos distorção
const PASSO = 1.3, LARGURA = 0.74;
// cantos da caixa que envolve o gráfico (base + barra mais alta), usados para encaixar na área
const CANTOS = [];
for (const x of [-3.5, 3.5]) for (const y of [-0.3, 3.05]) for (const z of [-1.0, 1.15]) CANTOS.push(new THREE.Vector3(x, y, z));

// sombreado "de ilustração": só 3 faixas de luz, sem degradê (o branco não fica cinza)
const TONS = new THREE.DataTexture(new Uint8Array([165, 222, 255]), 3, 1, THREE.RedFormat);
TONS.minFilter = TONS.magFilter = THREE.NearestFilter;
TONS.needsUpdate = true;

// caixa com cor sólida e contorno escuro; base = true cresce a partir do chão
function caixaSolida(w, h, d, cor, base = false) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (base) g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: cor, gradientMap: TONS }));
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: TINTA })));
  return m;
}
// "sombra dura" no chão (como o box-shadow dos botões): placa fina de cor sólida, deslocada
function sombraDura(w, d, cor) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), new THREE.MeshBasicMaterial({ color: cor }));
  return m;
}

export function criarGrafico(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (erro) {
    document.body.classList.add('sem-webgl');   // sem 3D: aparece o gráfico em HTML
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  const regiao = canvas.parentElement;
  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1.6, 0.1, 300);
  // luz de dia simples, vinda da esquerda/frente: com o material "toon", cada face fica num tom sólido
  cena.add(new THREE.AmbientLight('#ffffff', 1.1));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2); sol.position.set(-3, 6, 5); cena.add(sol);

  const grupo = new THREE.Group(); cena.add(grupo);
  // base com "sombra dura" de cartão: uma placa escura deslocada para baixo/direita
  const baseSombra = caixaSolida(6.9, 0.16, 2.0, TINTA);
  baseSombra.position.set(0.14, -0.2, 0.14); grupo.add(baseSombra);
  const base = caixaSolida(6.9, 0.16, 2.0, '#fffdf7');
  base.position.y = -0.08; grupo.add(base);
  const maxN = Math.max(...AREAS.map((a) => a.n));
  const barras = AREAS.map((a, i) => {
    const h = 0.35 + (a.n / maxN) * 2.55;
    const b = caixaSolida(LARGURA, h, LARGURA, a.cor, true);
    b.position.set((i - 2) * PASSO, 0, 0.05);
    b.scale.y = 0.001;
    // sombra dura da barra no chão (cresce junto com a barra)
    const s = sombraDura(LARGURA, LARGURA * 0.9, '#d8d0bd');
    s.position.set(b.position.x + 0.2, 0.012, b.position.z - 0.22);
    grupo.add(s, b);
    return { malha: b, sombra: s, h, topo: new THREE.Vector3() };
  });
  const rotulos = [...regiao.querySelectorAll('.rotulo3d')];
  const prog = { p: 0 };     // 0 → 1: animado pela linha do tempo da seção (js/secoes.js)
  const _tela = new THREE.Vector3();
  let W = 10, H = 10, noAr = false;
  new IntersectionObserver((es) => { noAr = es[0].isIntersecting; }).observe(regiao);

  function medir() {
    const r = regiao.getBoundingClientRect();
    W = Math.max(r.width, 10); H = Math.max(r.height, 10);
    renderer.setPixelRatio(Math.min(devicePixelRatio, ESTADO.celular ? 1.5 : 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // encaixe: projeta os 8 cantos do gráfico e ajusta distância e deslocamento até caber (92%) e ficar centrado
    let dist = 14, dx = 0, dy = 0;
    for (let volta = 0; volta < 5; volta++) {
      camera.position.copy(ALVO_GRAFICO).addScaledVector(DIRECAO_CAM, dist);
      camera.lookAt(ALVO_GRAFICO);
      camera.setViewOffset(W, H, -dx, -dy, W, H);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      CANTOS.forEach((c) => {
        _tela.copy(c).project(camera);
        const px = (_tela.x * 0.5 + 0.5) * W, py = (-_tela.y * 0.5 + 0.5) * H;
        x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      });
      const fator = Math.max((x1 - x0) / (W * 0.92), (y1 - y0) / (H * 0.84));
      dist *= fator;
      dx += (W / 2 - (x0 + x1) / 2) / fator;
      dy += (H / 2 - (y0 + y1) / 2) / fator;
    }
    camera.position.copy(ALVO_GRAFICO).addScaledVector(DIRECAO_CAM, dist);
    camera.lookAt(ALVO_GRAFICO);
    camera.setViewOffset(W, H, -dx, -dy, W, H);
    camera.updateProjectionMatrix();
  }

  let girar = 0;
  function atualizar(tempo, forcar = false) {
    if (prog.p <= 0.001 || (!noAr && !forcar)) return;
    // a base aparece primeiro, depois cada barra sobe na sua vez
    const pb = Math.max(0.001, salto(limitar(prog.p * 4), 1.2));
    base.scale.setScalar(pb); baseSombra.scale.setScalar(pb);
    const alvoGiro = ESTADO.reduzMovimento ? 0 : ESTADO.mouseX * 0.12 + Math.sin(tempo * 0.35) * 0.04;
    girar += (alvoGiro - girar) * 0.05;
    grupo.rotation.y = girar;
    barras.forEach((b, i) => {
      const p = escalonar(prog.p, i, barras.length, ATRASO_BARRA);
      b.malha.scale.y = Math.max(0.001, salto(p, 1.5));
      b.sombra.scale.setScalar(Math.max(0.001, limitar(p * 3)));
    });
    grupo.updateMatrixWorld();
    renderer.render(cena, camera);
    // rótulos: seguem o topo de cada barra (coordenadas dentro da área do gráfico)
    rotulos.forEach((el, i) => {
      const b = barras[i], p = escalonar(prog.p, i, barras.length, ATRASO_BARRA);
      if (p <= 0.05) { el.style.visibility = 'hidden'; return; }
      b.topo.set(0, b.h * b.malha.scale.y + 0.25, 0);
      b.malha.localToWorld(b.topo);
      _tela.copy(b.topo).project(camera);
      const x = (_tela.x * 0.5 + 0.5) * W, y = (-_tela.y * 0.5 + 0.5) * H;
      el.style.visibility = 'inherit';
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) scale(${(0.5 + 0.5 * limitar(p * 2)).toFixed(3)})`;
    });
  }

  return { renderer, medir, atualizar, prog };
}
