// =====================================================================
// ESTADO COMPARTILHADO
// A rolagem ESCREVE estes números (quase todos de 0 a 1) e o terminal, o
// conteúdo e o 3D só LEEM a cada quadro. Por isso rolar para trás "desdigita"
// e desfaz tudo sozinho, sem código extra.
// =====================================================================
export const ESTADO = {
  entrada: 0,        // 0 → 1 depois que a cortina do preloader sobe
  termPos: 0,        // índice (com fração) na lista de lugares do terminal (js/terminal.js)
  // uma entrada por seção: 0 início, 1 sobre, 2 formação, 3 experiência,
  // 4 projetos, 5 skills, 6 certificados, 7 contato
  s: Array.from({ length: 8 }, () => ({
    term: 0,         // 0 → 1: quanto da tela do terminal já foi digitado
    solta: 0,        // 0 → 1: o conteúdo pula do terminal para o lugar dele
    sai: 0           // 0 → 1: o conteúdo vai embora (próxima seção)
  })),
  menu: 0,           // 0 → 1: blocos do menu pulam do terminal (seção Início)
  nav: 0,            // 0 → 1: blocos voam do menu para a barra do topo
  trilho: 0,         // 0 → 1: trilho horizontal dos projetos
  mouseX: 0, mouseY: 0,
  celular: false,    // tela estreita (< 760 px): terminal estreito e blocos em coluna
  navCompacta: false, // tela < 1100 px: barra do topo vira um botão "menu"
  reduzMovimento: matchMedia('(prefers-reduced-motion: reduce)').matches
};

// ---------- funções pequenas usadas em vários arquivos ----------
export const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const suavizar = (v) => v * v * (3 - 2 * v);              // curva S suave
export const misturar = (a, b, t) => a + (b - a) * t;            // interpolação linear
// "salto": passa um pouco do ponto e volta (como o back.out do GSAP) — dá o pulo dos blocos
export const salto = (v, forca = 1.5) => {
  const t = v - 1;
  return 1 + (forca + 1) * t * t * t + forca * t * t;
};
// progresso do item i de n, com atraso entre eles (stagger) dentro de um 0 → 1
export const escalonar = (v, i, n, atraso = 0.18) => {
  const total = 1 + atraso * (n - 1);
  return limitar((v * total - i * atraso) / 1);
};
