/* =====================================================================
   EFEITOS: só o preloader (o cursor próprio e o botão magnético foram removidos).
   Digita "iniciando portfolio...", conta até ~86% enquanto carrega, completa 100%
   e a cortina sobe.
   ===================================================================== */
export function iniciarPreloader(pronto, aoAbrir) {
  const el = document.getElementById('preloader');
  if (!el) { aoAbrir(); return; }
  const num = el.querySelector('.pl-num'), barra = el.querySelector('.pl-barra i');
  const linha = el.querySelector('.pl-linha'), texto = 'iniciando portfolio...';
  const cont = { v: 0, letras: 0 };
  const mostrar = () => {
    num.textContent = String(Math.round(cont.v)).padStart(3, '0');
    barra.style.transform = `scaleX(${(cont.v / 100).toFixed(3)})`;
  };
  gsap.to(cont, { letras: texto.length, duration: 0.9, ease: 'none', onUpdate: () => { linha.textContent = texto.slice(0, Math.round(cont.letras)); } });
  gsap.to(cont, { v: 86, duration: 1.4, ease: 'power2.out', onUpdate: mostrar });
  const minimo = new Promise((r) => setTimeout(r, 1400));
  const limite = new Promise((r) => setTimeout(r, 4000));
  Promise.all([Promise.race([pronto, limite]), minimo]).then(() => {
    gsap.timeline()
      .to(cont, { v: 100, duration: 0.45, onUpdate: mostrar, overwrite: true })
      .to(el, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
      .add(aoAbrir, '-=0.6')
      .add(() => el.remove());
  });
}
