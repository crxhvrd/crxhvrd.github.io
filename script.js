/* ---------- helpers ---------- */
let homeTemplate=""; 
const hideAll = ids => ids.forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
const show    = el  => {el.style.display='flex';el.classList.add('fade-in');setTimeout(()=>el.classList.remove('fade-in'),500)};
function setActiveNav(hash){
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const link=document.querySelector(`.nav-link[href='${hash.startsWith('#')?hash:'#'+hash}']`);if(link)link.classList.add('active');
}

// Lazy loading and memory release might need review if other sections rely heavily on them.
// For the new showcase, they are not directly used.
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
    if (img.src && !img.closest('#fullscreen-slideshow-container')) { // Avoid affecting new slideshow
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
const SLIDESHOW_INTERVAL_DURATION = 8000; // 8 seconds

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
    startAutomaticSlideshowTimer(); // Reset the timer
}

function buildFullscreenSlideshow(showcaseSectionElement) {
  showcaseSectionElement.innerHTML = ''; 

  const slideshowContainer = document.createElement('div');
  slideshowContainer.id = 'fullscreen-slideshow-container';
  // Note: z-index for slideshowContainer is handled by CSS

  fullscreenSlideshowImages.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'CoreFX Showcase Image';
    img.className = 'slide';
    slideshowContainer.appendChild(img);
  });

  const textOverlay = document.createElement('div');
  textOverlay.id = 'slideshow-text-overlay';
  // Note: z-index for textOverlay is handled by CSS
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
  // Note: z-index for prevButton is handled by CSS
  
  const nextButton = document.createElement('a');
  nextButton.id = 'slideshow-next';
  nextButton.className = 'slideshow-nav-button';
  nextButton.innerHTML = '❯';
  nextButton.href = '#';
  nextButton.onclick = (e) => { e.preventDefault(); handleManualNavigation('next'); };
  // Note: z-index for nextButton is handled by CSS

  showcaseSectionElement.appendChild(slideshowContainer);
  showcaseSectionElement.appendChild(textOverlay);
  showcaseSectionElement.appendChild(prevButton);
  showcaseSectionElement.appendChild(nextButton);

  // Style #showcase-section for full-screen slideshow
  // These styles are applied directly and override stylesheet defaults for #showcase-section when it's a slideshow
  showcaseSectionElement.style.padding = '0';
  showcaseSectionElement.style.background = 'none'; 
  showcaseSectionElement.style.width = '100vw';
  showcaseSectionElement.style.height = '100vh';
  showcaseSectionElement.style.display = 'block'; // Ensures it's block, not flex
  showcaseSectionElement.style.position = 'fixed'; // Cover entire viewport
  showcaseSectionElement.style.top = '0';
  showcaseSectionElement.style.left = '0';
  showcaseSectionElement.style.zIndex = '1000'; // Below nav bar (z-index 1200 for #top-nav)
  showcaseSectionElement.style.overflow = 'hidden'; // Prevent scrollbars
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
      if (!activeFound && initialSlides[0]) { // Check if initialSlides[0] exists
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
    // Reset styles that were applied for fullscreen mode
    showcaseSectionElement.style.padding = ''; // Resets to stylesheet default
    showcaseSectionElement.style.background = ''; // Resets to stylesheet default
    showcaseSectionElement.style.width = '';
    showcaseSectionElement.style.height = '';
    showcaseSectionElement.style.position = '';
    showcaseSectionElement.style.top = '';
    showcaseSectionElement.style.left = '';
    showcaseSectionElement.style.zIndex = '';
    showcaseSectionElement.style.overflow = '';
    // display will be handled by hideAll/show in router
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
    case 'showcase':{
      const s = document.getElementById('showcase-section');
      if (previousHash === 'showcase') {
          stopFullscreenSlideshow(s); 
      }
      buildFullscreenSlideshow(s);
      startFullscreenSlideshow();
      
      s.style.opacity = '0'; 
      s.style.display = 'block'; 
      s.classList.add('fade-in');
      setTimeout(() => {
          s.classList.remove('fade-in');
          s.style.opacity = ''; 
      }, 500);
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
    default:{ // Home
      const m=document.getElementById('main-section');
      if(m && m.innerHTML.trim()==='' && homeTemplate) { m.innerHTML=homeTemplate; }
      else if (m && m.innerHTML.trim()==='' && !homeTemplate) { 
        // Fallback if homeTemplate somehow wasn't captured (e.g. direct nav to other page on first load very fast)
        // This could involve fetching a default home structure if necessary, or leaving it to initial HTML.
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
  const maxScroll  = document.documentElement.scrollHeight - innerHeight;
  const distance   = Math.max(maxScroll, 1000);
  const t          = Math.min(window.scrollY / distance, 1);
  const col1 = [10,194,255];
  const col2 = [30,255,180];
  const mix  = col1.map((v,i)=>Math.round(v + (col2[i]-v)*t));
  const accent      = `rgb(${mix[0]},${mix[1]},${mix[2]})`;
  const accentAlpha = `rgba(${mix[0]},${mix[1]},${mix[2]},1.0)`; 
  const root = document.documentElement;
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-alpha', accentAlpha); 
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
});
window.addEventListener('hashchange',route);