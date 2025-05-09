/* ---------- helpers ---------- */
let homeTemplate=""; 
const hideAll = ids => ids.forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
const show    = el  => {el.style.display='flex';el.classList.add('fade-in');setTimeout(()=>el.classList.remove('fade-in'),500)};
function setActiveNav(hash){
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const link=document.querySelector(`.nav-link[href='${hash.startsWith('#')?hash:'#'+hash}']`);if(link)link.classList.add('active');
}

let lazyObs;
function initLazy() {
  lazyObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '300px' });

  document.querySelectorAll('img[data-src]').forEach(img => lazyObs.observe(img));
}

function releaseGalleryMemory() {
  document.querySelectorAll('#showcase-section img:not([data-video])').forEach(img => {
    if (img.src && !img.closest('#fullscreen-slideshow-container')) { 
        img.dataset.src = img.src; img.removeAttribute('src');
    }
  });
}

/* ---------- оборачиваем видео-миниатюры ---------- */
function wrapVideoThumbs(){
  document.querySelectorAll('.showcase-gallery img[data-video="true"]').forEach(img=>{
    if(img.parentElement.classList.contains('video-thumb')) return;
    const wrap=document.createElement('div');wrap.className='video-thumb';
    const icon=document.createElement('span');icon.className='play-icon';
    img.parentNode.insertBefore(wrap,img);wrap.appendChild(img);wrap.appendChild(icon);
  });
}

/* ---------- gallery / lightbox (for old grid, keep if used elsewhere or for lightbox functionality) ---------- */
function initGallery(){
  document.querySelectorAll('.showcase-gallery img').forEach((el,i)=>el.addEventListener('click',()=>openLB(i)));
}
let cur=0;
function openLB(i){cur=i;document.getElementById('lightbox').style.display='block';showSlide(i);}
const closeLB=()=>{document.getElementById('lightbox').style.display='none';document.getElementById('lightbox-content').innerHTML='';};
function showSlide(i){
  const imgs=[...document.querySelectorAll('.showcase-gallery img')]; 
  i=(i+imgs.length)%imgs.length;cur=i;
  const box=document.getElementById('lightbox-content');
  const el=imgs[i];
  if(el.dataset.video){
    box.innerHTML=`<div class="lightbox-video-container"><iframe src="https://www.youtube.com/embed/${el.dataset.videoId}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
  }else{
    box.innerHTML=`<img src="${el.src}" alt="">`;
  }
}

/* ---------- NEW FULLSCREEN SLIDESHOW LOGIC ---------- */
let fullscreenSlideshowInterval;
let fullscreenSlideshowImages = [];
let currentSlideIndex = 0;
const SLIDESHOW_INTERVAL_DURATION = 8000; 

function cacheSlideshowImages() {
  const galleryImages = document.querySelectorAll('#showcase-section .showcase-gallery img:not([data-video="true"])');
  if (galleryImages.length > 0) {
    fullscreenSlideshowImages = Array.from(galleryImages).map(img => img.src);
  } else { 
      fullscreenSlideshowImages = [
        'https://i.imgur.com/sclszvM.png', 'https://i.imgur.com/VV4vy6H.jpeg',
        'https://i.imgur.com/YoSvkFF.jpeg', 'https://i.imgur.com/FDnano1.jpeg',
        'https://i.imgur.com/PgnkDDD.jpeg', 'https://i.imgur.com/yt3BCSo.jpeg',
        'https://i.imgur.com/CPQVBtC.jpeg', 'https://i.imgur.com/sZhTBjW.jpeg',
        'https://i.imgur.com/CYy4wx6.jpeg', 'https://i.imgur.com/zbe6Kdj.png',
        'https://i.imgur.com/pv5R1XJ.jpeg', 'https://i.imgur.com/5i0i3au.png'
      ];
  }
}

function updateActiveSlide(newIndex) {
    const slides = document.querySelectorAll('#fullscreen-slideshow-container .slide');
    if (slides.length === 0) return;

    slides[currentSlideIndex]?.classList.remove('active-slide'); 
    currentSlideIndex = newIndex;
    slides[currentSlideIndex]?.classList.add('active-slide'); 
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('#fullscreen-slideshow-container .slide');
    if (slides.length === 0) return;

    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentSlideIndex + 1) % slides.length;
    } else if (direction === 'prev') {
        nextIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    } else {
        return; 
    }
    updateActiveSlide(nextIndex);
}

function startAutomaticSlideshowTimer() {
    if (fullscreenSlideshowInterval) clearInterval(fullscreenSlideshowInterval);
    if (fullscreenSlideshowImages.length === 0) return;
    
    fullscreenSlideshowInterval = setInterval(() => {
        changeSlide('next');
    }, SLIDESHOW_INTERVAL_DURATION);
}

function handleManualNavigation(direction) {
    changeSlide(direction);
    startAutomaticSlideshowTimer(); 
}

function buildFullscreenSlideshow(showcaseSectionElement) {
  showcaseSectionElement.innerHTML = ''; 

  const slideshowContainer = document.createElement('div');
  slideshowContainer.id = 'fullscreen-slideshow-container';

  fullscreenSlideshowImages.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'CoreFX Showcase Image';
    img.className = 'slide';
    slideshowContainer.appendChild(img);
  });

  const textOverlay = document.createElement('div');
  textOverlay.id = 'slideshow-text-overlay';
  textOverlay.innerHTML = `
    <img src="https://i.imgur.com/47LeW6H.png" alt="CoreFX Mod Logo" id="slideshow-logo">
    <div id="slideshow-text-content">
      <h2>Priceless experience</h2>
      <p>Transform your GTA V experience with CoreFX, a free visual overhaul.</p>
    </div>
  `;

  const prevButton = document.createElement('a');
  prevButton.id = 'slideshow-prev';
  prevButton.className = 'slideshow-nav-button';
  prevButton.innerHTML = '❮';
  prevButton.href = '#'; 
  prevButton.onclick = (e) => { e.preventDefault(); handleManualNavigation('prev'); };
  
  const nextButton = document.createElement('a');
  nextButton.id = 'slideshow-next';
  nextButton.className = 'slideshow-nav-button';
  nextButton.innerHTML = '❯';
  nextButton.href = '#';
  nextButton.onclick = (e) => { e.preventDefault(); handleManualNavigation('next'); };

  showcaseSectionElement.appendChild(slideshowContainer);
  showcaseSectionElement.appendChild(textOverlay);
  showcaseSectionElement.appendChild(prevButton);
  showcaseSectionElement.appendChild(nextButton);

  showcaseSectionElement.style.padding = '0';
  showcaseSectionElement.style.background = 'none'; 
  showcaseSectionElement.style.width = '100vw';
  showcaseSectionElement.style.height = '100vh';
  showcaseSectionElement.style.display = 'block';
  showcaseSectionElement.style.position = 'fixed';
  showcaseSectionElement.style.top = '0';
  showcaseSectionElement.style.left = '0';
  showcaseSectionElement.style.zIndex = '1000';
  showcaseSectionElement.style.overflow = 'hidden';
}

function startFullscreenSlideshow() {
  if (fullscreenSlideshowImages.length === 0) return;

  const initialSlides = document.querySelectorAll('#fullscreen-slideshow-container .slide');
  let activeFound = false;
  if (initialSlides.length > 0) {
      initialSlides.forEach((slide, index) => {
          if (slide.classList.contains('active-slide')) {
              currentSlideIndex = index;
              activeFound = true;
          }
      });
      if (!activeFound && initialSlides[0]) {
          currentSlideIndex = 0;
          initialSlides[0].classList.add('active-slide');
      }
  }
  startAutomaticSlideshowTimer();
}

function stopFullscreenSlideshow(showcaseSectionElement) {
  if (fullscreenSlideshowInterval) clearInterval(fullscreenSlideshowInterval);
  fullscreenSlideshowInterval = null;
  if (showcaseSectionElement) {
    showcaseSectionElement.innerHTML = ''; 
    showcaseSectionElement.style.padding = '';
    showcaseSectionElement.style.background = '';
    showcaseSectionElement.style.width = '';
    showcaseSectionElement.style.height = '';
    showcaseSectionElement.style.position = '';
    showcaseSectionElement.style.top = '';
    showcaseSectionElement.style.left = '';
    showcaseSectionElement.style.zIndex = '';
    showcaseSectionElement.style.overflow = '';
  }
}


/* ---------- router ---------- */
function route(){
  const newHash = (location.hash||'#home').slice(1).toLowerCase()||'home';
  const previousHash = window.currentRouteHash || 'home';

  document.getElementById('top-nav').style.display = newHash ==='home' ? 'none' : 'block';
  setActiveNav('#'+newHash);

  if (previousHash === 'showcase' && newHash !== 'showcase') {
    const showcaseSection = document.getElementById('showcase-section');
    if (showcaseSection) stopFullscreenSlideshow(showcaseSection);
  }
  
  if(newHash !=='home' && previousHash === 'home'){
    const m=document.getElementById('main-section');
    if(m && m.innerHTML && !homeTemplate) { homeTemplate = m.innerHTML; } 
    if(m) m.innerHTML='';
  }

  hideAll(['main-section','showcase-section','install-section','faq-section','changelog-section']);

  switch(newHash){
    case 'showcase': {
      const s = document.getElementById('showcase-section');
      if (previousHash === 'showcase') {
        stopFullscreenSlideshow(s);
      }
      buildFullscreenSlideshow(s);
      startFullscreenSlideshow();
      s.style.display = 'block';
      s.style.opacity = '';
      break;
    }
    case 'installation':
    case 'install': show(document.getElementById('install-section')); break;
    case 'faq':       show(document.getElementById('faq-section'));   break;
    case 'changelog': {
      const s = document.getElementById('changelog-section');
      show(s);
      initChangelog();
      break;
    }
    default:{ 
      const m=document.getElementById('main-section');
      if(m && m.innerHTML.trim()==='' && homeTemplate) { m.innerHTML=homeTemplate; }
      else if (m && m.innerHTML.trim()==='' && !homeTemplate) { 
      }
      show(m);
      if (location.hash !== '#home' && location.hash !== '') location.hash='home'; 
    }
  }
  window.currentRouteHash = newHash; 
}

function initChangelog(){
  document.querySelectorAll('.changelog-entry').forEach(entry=>{
    const main=entry.querySelector('.changelog-main');
    const thumbs=entry.querySelectorAll('.changelog-thumb-row img');
    if(thumbs.length && main) { 
        if (!main.src && thumbs[0]) main.src = thumbs[0].src; 
        thumbs[0]?.classList.add('active'); 
    }
    thumbs.forEach(t=>{
      t.addEventListener('click',()=>{
        if(main) main.src=t.src;
        thumbs.forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
      });
    });
  });
}

function showTab(id){
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  const tab  = document.getElementById(id);
  const btn  = document.getElementById(id + '-btn');
  if(tab) tab.style.display = 'block';
  if(btn) btn.classList.add('active');
}

function updateAccentColor(){
  const maxScroll  = document.documentElement.scrollHeight - window.innerHeight;
  const distance   = Math.max(maxScroll, 1000); // Минимальная дистанция для плавной анимации
  const t          = Math.min(window.scrollY / distance, 1); // Нормализованный прогресс прокрутки (0 до 1)

  const col1 = [10, 194, 255];  // Голубой цвет (соответствует --accent-blue-static)
  const col2 = [255, 100, 200];   // Розовый цвет (соответствует --accent-pink-static)

  // Интерполируем каждый компонент цвета
  const mix  = col1.map((startComponent, i) => Math.round(startComponent + (col2[i] - startComponent) * t));

  const newAnimatedAccentColor = `rgb(${mix[0]},${mix[1]},${mix[2]})`;
  
  document.documentElement.style.setProperty('--accent', newAnimatedAccentColor);
  // CSS автоматически обновит --accent-alpha и --accent-dim на основе нового значения --accent
}
window.addEventListener('scroll', updateAccentColor, { passive:true });

/* ---------- boot ---------- */
window.addEventListener('DOMContentLoaded',()=>{
  const mainSectionInitial = document.getElementById('main-section');
  if (mainSectionInitial && mainSectionInitial.innerHTML.trim() !== '') {
      homeTemplate = mainSectionInitial.innerHTML;
  }

  cacheSlideshowImages(); 
  window.currentRouteHash = (location.hash || '#home').slice(1).toLowerCase() || 'home';

  hideAll(['main-section','showcase-section','install-section','faq-section','changelog-section']);
  route(); 
  
  initChangelog(); 
  updateAccentColor(); // Установить начальный цвет при загрузке

  // --- React Integration ---
  // Глобальный футер с использованием React
  function GlobalSiteFooter() {
    return React.createElement(
      'p',
      { style: { textAlign: 'center', padding: '20px 0', color: '#aaa', borderTop: '1px solid #333', marginTop: '40px', fontSize: '0.9em' } },
      'CoreFX by Beta. React integrated. Gradient theme active.'
    );
  }

  const globalFooterContainer = document.getElementById('react-global-footer');
  if (globalFooterContainer && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    const reactRoot = ReactDOM.createRoot(globalFooterContainer);
    reactRoot.render(React.createElement(GlobalSiteFooter));
  } else if (globalFooterContainer) {
      globalFooterContainer.innerHTML = '<p style="text-align:center; padding:20px 0; color:#777;">Error: React not loaded.</p>';
  }
  // --- End React Integration ---
});
window.addEventListener('hashchange',route);
