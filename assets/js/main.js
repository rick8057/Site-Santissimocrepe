const menus = {
  santo: { desc: 'Sabores tradicionais, pensados para festas com bastante crianças e diversão para todos.', sav: ['Frango Cremoso', 'Queijo e Presunto', 'Açoriano', 'Marguerita', 'Light'], sweet: ['Sensação', 'Doce de Leite', 'Banana'], note: 'Acompanha calda e sorvete.' },
  santidade: { desc: 'Para quem não abre mão dos sabores queridinhos do Brasil, com a leveza da massa fininha do crepe francês.', sav: ['Frango Cremoso', 'Portuguesa', 'Calabresa', 'Pizza', 'Light'], sweet: ['Sensação', 'Banana', 'Prestígio'], note: 'Acompanha calda e sorvete.' },
  santissimo: { desc: 'O equilíbrio entre preço e qualidade, com destaque para carne desfiada e bacon.', sav: ['Carne Desfiada', 'Poulet', 'Marguerita', 'Milho e Bacon', 'Champignon'], sweet: ['Sensação', 'Strogonofe de Nozes', 'Doce de Leite'], note: 'Acompanha calda e sorvete.' },
  divindade: { desc: 'Sabores requintados com ingredientes especiais. Destaque para carne e camarão.', sav: ['Croupe', 'Poulet', 'Camarão', 'Light', '3 Queijos'], sweet: ['Nutella e Morango', 'Strogonofe de Nozes', 'Suzette'], note: 'Acompanha salada básica, molho Bechamel e molho Sugo. Calda e sorvete inclusos.' },
  cone: { desc: 'Uma forma criativa e elegante de servir nossos crepes artesanais, com praticidade e sofisticação.', sav: ['Frango', 'Calabresa', 'Queijo e Presunto', 'Rúcula com Tomate', 'Pizza'], sweet: ['Morango e Chocolate', 'Queijo e Goiabada', 'Banana e Doce de Leite'], note: 'Servido em cone.' }
};

const menuButton = document.querySelector('.menu');
const mainNav = document.querySelector('#main-nav');

function closeMenu() {
  mainNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (mainNav.classList.contains('open') && !mainNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mainNav.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});

const panel = document.querySelector('#menu-panel');
const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];

function draw(key) {
  const menu = menus[key];
  const title = key === 'cone' ? 'O Santíssimo Crepe<br>no Cone' : key[0].toUpperCase() + key.slice(1);
  panel.innerHTML = `<div><h3>${title}</h3><p>${menu.desc}</p><p><b>${menu.note}</b></p></div><div><h4>Salgados</h4><ul>${menu.sav.map(item => `<li>${item}</li>`).join('')}</ul></div><div><h4>Doces</h4><ul>${menu.sweet.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
}

function activateTab(tab) {
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  draw(tab.dataset.menu);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let targetIndex;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = tabs.length - 1;
    if (targetIndex === undefined) return;
    event.preventDefault();
    activateTab(tabs[targetIndex]);
    tabs[targetIndex].focus();
  });
});
activateTab(tabs[0]);

const images = [...document.querySelectorAll('.coverflow img')];
let activeImage = 2;

function updateGallery() {
  images.forEach((image, index) => {
    let distance = index - activeImage;
    if (distance > 2) distance -= images.length;
    if (distance < -2) distance += images.length;
    image.style.transform = `translateX(${distance * 46}%) translateZ(${-Math.abs(distance) * 150}px) rotateY(${-distance * 17}deg)`;
    image.style.opacity = Math.abs(distance) > 2 ? 0 : .55 + (.45 * (distance === 0));
    image.style.zIndex = 10 - Math.abs(distance);
    image.setAttribute('aria-hidden', String(distance !== 0));
    image.onclick = () => { activeImage = index; updateGallery(); };
  });
  const active = images[activeImage];
  document.querySelector('.coverflow').setAttribute('aria-label', `Galeria de fotos, imagem ${activeImage + 1} de ${images.length}: ${active.alt}`);
}

updateGallery();
document.querySelector('.next').addEventListener('click', () => { activeImage = (activeImage + 1) % images.length; updateGallery(); });
document.querySelector('.prev').addEventListener('click', () => { activeImage = (activeImage - 1 + images.length) % images.length; updateGallery(); });

let touchStart;
const gallery = document.querySelector('.coverflow');
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') document.querySelector('.prev').click();
  else if (event.key === 'ArrowRight') document.querySelector('.next').click();
  else return;
  event.preventDefault();
});
gallery.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive: true });
gallery.addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const distance = event.changedTouches[0].clientX - touchStart;
  if (distance > 40) document.querySelector('.prev').click();
  if (distance < -40) document.querySelector('.next').click();
  touchStart = undefined;
}, { passive: true });

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('.reveal');
const counter = document.querySelector('.counter');

let scrollAnimationFrame;
const cancelAnimatedScroll = () => {
  cancelAnimationFrame(scrollAnimationFrame);
  document.documentElement.style.removeProperty('scroll-behavior');
};

window.addEventListener('wheel', cancelAnimatedScroll, { passive: true });
window.addEventListener('touchstart', cancelAnimatedScroll, { passive: true });
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelAnimatedScroll();
});

function scrollToSection(target) {
  const startY = window.scrollY;
  const targetY = target.getBoundingClientRect().top + startY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    focusSection(target);
    return;
  }

  cancelAnimationFrame(scrollAnimationFrame);
  document.documentElement.style.scrollBehavior = 'auto';
  if (motionPreference.matches) {
    window.scrollTo(0, targetY);
    document.documentElement.style.removeProperty('scroll-behavior');
    focusSection(target);
    return;
  }
  const duration = Math.min(2000, Math.max(1300, Math.abs(distance) * .42));
  const startTime = performance.now();
  const easeInOutCubic = progress => progress < .5
    ? 4 * Math.pow(progress, 3)
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const animate = now => {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(animate);
    } else {
      document.documentElement.style.removeProperty('scroll-behavior');
      focusSection(target);
    }
  };

  scrollAnimationFrame = requestAnimationFrame(animate);
}

function focusSection(target) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    const target = hash && document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    closeMenu();
    scrollToSection(target);
    if (window.location.hash !== hash) history.pushState(null, '', hash);
  });
});

function reveal(element) {
  element.classList.add('show');
}

let counterAnimationFrame;

function animateCounter(element) {
  cancelAnimationFrame(counterAnimationFrame);
  const target = Number(element.dataset.target);
  const reducedMotion = motionPreference.matches;
  const duration = reducedMotion ? 1000 : 2100;
  const start = performance.now();
  element.textContent = '0';
  if (!reducedMotion) element.classList.add('counting');
  const tick = now => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = Math.floor(progress * target).toLocaleString('pt-BR');
    if (progress < 1) {
      counterAnimationFrame = requestAnimationFrame(tick);
    } else {
      element.textContent = target.toLocaleString('pt-BR');
      element.classList.remove('counting');
    }
  };
  counterAnimationFrame = requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    reveal(entry.target);
    revealObserver.unobserve(entry.target);
  }), { threshold: .15 });
  revealElements.forEach(element => revealObserver.observe(element));

  let counterReady = true;
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.intersectionRatio >= .6 && counterReady) {
      counterReady = false;
      animateCounter(counter);
    } else if (entry.intersectionRatio < .05) {
      counterReady = true;
    }
  }), { threshold: [0, .05, .6] });
  counterObserver.observe(counter);
} else {
  revealElements.forEach(reveal);
  animateCounter(counter);
}

const ambientVideo = document.querySelector('.video-section video');
if (ambientVideo) {
  const videoSource = ambientVideo.querySelector('source[data-src]');
  ambientVideo.muted = true;
  ambientVideo.defaultMuted = true;

  const keepVideoPlaying = () => {
    if (!document.hidden && videoSource.hasAttribute('src') && ambientVideo.paused) ambientVideo.play().catch(() => {});
  };

  const loadVideo = () => {
    if (videoSource.hasAttribute('src')) return;
    videoSource.src = videoSource.dataset.src;
    ambientVideo.load();
    keepVideoPlaying();
  };

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      loadVideo();
      videoObserver.disconnect();
    }, { rootMargin: '300px 0px' });
    videoObserver.observe(ambientVideo);
  } else loadVideo();

  document.addEventListener('visibilitychange', keepVideoPlaying);
  document.addEventListener('pointerdown', keepVideoPlaying, { once: true });
}
