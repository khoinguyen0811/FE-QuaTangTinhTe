export function openLightbox(images, selectedImg, productName) {
  images = [...new Set((images || []).filter(Boolean))];
  if (images.length === 0) return;

  let activeIdx = images.indexOf(selectedImg);
  if (activeIdx === -1) activeIdx = 0;

  const modal = document.createElement('div');
  modal.id = 'image-lightbox-modal';
  modal.className = 'fixed inset-0 z-[200000] bg-black/95 flex flex-col justify-between p-6 select-none font-sans text-white';
  modal.setAttribute('data-lenis-prevent', 'true');

  document.body.style.overflow = 'hidden';

  const hasMultipleImages = images.length > 1;

  // Touch gesture processing
  let touchStartX = 0;
  let touchEndX = 0;

  const isImgZoomed = () => {
    const img = modal.querySelector('#lightbox-img');
    return img && img.classList.contains('zoomed');
  };

  const handleGesture = () => {
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 50; // Min distance in px
    if (swipeDistance < -minSwipeDistance) {
      // Swipe Left -> Next Image
      activeIdx = (activeIdx + 1) % images.length;
      renderModalContent();
    } else if (swipeDistance > minSwipeDistance) {
      // Swipe Right -> Previous Image
      activeIdx = (activeIdx - 1 + images.length) % images.length;
      renderModalContent();
    }
  };

  modal.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && !isImgZoomed()) {
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1 && !isImgZoomed()) {
      touchEndX = e.changedTouches[0].clientX;
      handleGesture();
    }
  }, { passive: true });

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && hasMultipleImages) {
      activeIdx = (activeIdx - 1 + images.length) % images.length;
      renderModalContent();
    } else if (e.key === 'ArrowRight' && hasMultipleImages) {
      activeIdx = (activeIdx + 1) % images.length;
      renderModalContent();
    } else if (e.key === 'Escape') {
      cleanup();
    }
  };

  const cleanup = () => {
    modal.remove();
    document.body.style.overflow = '';
    window.removeEventListener('keydown', handleKeyDown);
  };

  window.addEventListener('keydown', handleKeyDown);

  const renderModalContent = () => {
    const currentImg = images[activeIdx] || selectedImg;

    modal.innerHTML = `
      <div class="flex justify-between items-center text-sm font-bold">
        <span>${activeIdx + 1}/${images.length}</span>
        <button id="lightbox-close-btn" class="text-white hover:text-zinc-400 text-xl font-bold cursor-pointer select-none bg-transparent border-none z-10">&times;</button>
      </div>

      <div class="flex-1 flex justify-between items-center relative min-h-0">
        ${hasMultipleImages ? `
          <button id="lightbox-prev-btn" class="absolute left-0 md:left-4 z-10 w-12 h-12 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 rounded-full transition cursor-pointer select-none border-none">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        ` : ''}

        <div id="lightbox-img-wrap" data-lenis-prevent class="w-full h-full flex items-center justify-center p-4 overflow-hidden">
          <img id="lightbox-img" src="${currentImg}" class="max-w-full max-h-full object-contain cursor-zoom-in transition-all duration-300" />
        </div>

        ${hasMultipleImages ? `
          <button id="lightbox-next-btn" class="absolute right-0 md:right-4 z-10 w-12 h-12 flex items-center justify-center text-white bg-black/40 hover:bg-black/60 rounded-full transition cursor-pointer select-none border-none">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        ` : ''}
      </div>

      <div class="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
        ${productName}
      </div>
    `;

    modal.querySelector('#lightbox-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      cleanup();
    });

    modal.querySelector('#lightbox-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      activeIdx = (activeIdx - 1 + images.length) % images.length;
      renderModalContent();
    });

    modal.querySelector('#lightbox-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      activeIdx = (activeIdx + 1) % images.length;
      renderModalContent();
    });

    const imgEl = modal.querySelector('#lightbox-img');
    const imgWrap = modal.querySelector('#lightbox-img-wrap');
    if (imgEl && imgWrap) {
      imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const isZoomed = imgEl.classList.toggle('zoomed');
        if (isZoomed) {
          imgEl.style.width = '200%';
          imgEl.style.height = '200%';
          imgEl.style.maxWidth = '250%';
          imgEl.style.maxHeight = '250%';
          imgEl.style.cursor = 'zoom-out';
          imgWrap.className = 'w-full h-full flex items-start justify-start p-4 overflow-auto scrollbar-none';
        } else {
          imgEl.style.width = '';
          imgEl.style.height = '';
          imgEl.style.maxWidth = '';
          imgEl.style.maxHeight = '';
          imgEl.style.cursor = 'zoom-in';
          imgWrap.className = 'w-full h-full flex items-center justify-center p-4 overflow-hidden';
        }
      });

      imgWrap.addEventListener('click', (e) => {
        if (e.target === imgWrap) {
          cleanup();
        }
      });
    }
  };

  renderModalContent();

  modal.addEventListener('click', (e) => {
    if (e.target === modal || (!e.target.closest('#lightbox-img') && !e.target.closest('button'))) {
      cleanup();
    }
  });

  modal.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  modal.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

  document.body.appendChild(modal);
}
