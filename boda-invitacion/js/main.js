/**
 * LÓGICA PRINCIPAL - INVITACIÓN DE BODA DIANA & JOSÉ
 */

document.addEventListener('DOMContentLoaded', () => {
  initEnvelope();
  initCoupleData();
  initPhrases();
  initGiftRegistry();
  initPhotoDeckCarousel();
  initCountdown();
  initLocations();
});


// 1. apertura del sobre en 3d

function initEnvelope() {
  const overlay = document.getElementById('envelope-overlay');
  const wrapper = document.getElementById('envelope-wrapper');
  const openBtn = document.getElementById('envelope-open-btn');
  const reopenBtn = document.getElementById('btn-reopen-envelope');
  const siteWrapper = document.getElementById('site-wrapper');

  if (!overlay || !wrapper) return;

  let isOpening = false;

  function openEnvelope() {
    if (isOpening) return;
    isOpening = true;

    // Paso 1: Activar animación de apertura de solapa y sello
    wrapper.classList.add('opening');

    // Paso 2: La tarjeta interior se eleva
    setTimeout(() => {
      wrapper.classList.add('opened');
    }, 450);

    // Paso 3: Desvanecer sobre y revelar suavemente la invitación completa
    setTimeout(() => {
      overlay.classList.add('fade-out');
      if (siteWrapper) {
        siteWrapper.classList.add('revealed');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1100);

    // Paso 4: Ocultar overlay por completo del flujo
    setTimeout(() => {
      overlay.classList.add('hidden');
      isOpening = false;
    }, 1600);
  }

  // Eventos de apertura
  wrapper.addEventListener('click', openEnvelope);
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  // Soporte de accesibilidad por teclado (Enter o Espacio)
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  // Botón para volver a ver el sobre (desde el pie de página)
  if (reopenBtn) {
    reopenBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      overlay.classList.remove('hidden');
      overlay.classList.remove('fade-out');
      wrapper.classList.remove('opening');
      wrapper.classList.remove('opened');
      if (siteWrapper) {
        siteWrapper.classList.remove('revealed');
      }
    });
  }
}

/* CARGA DE DATOS DE LA PAREJA
*/
function initCoupleData() {
  const couple = WEDDING_CONFIG.couple;
  if (!couple) return;

  const footerNamesEl = document.getElementById('footer-names');
  if (footerNamesEl) {
    footerNamesEl.textContent = `${couple.partner1} & ${couple.partner2}`;
  }

  document.title = `${couple.partner1} & ${couple.partner2} | ${couple.title || 'Nuestra Boda'}`;
}

/* FRASES ARRIBA Y DEBAJO DE LAS FOTOS
 */
function initPhrases() {
  // Frase arriba de las fotos
  const beforeEl = document.getElementById('phrase-before-photos');
  if (beforeEl && WEDDING_CONFIG.phraseBeforePhotos) {
    beforeEl.textContent = WEDDING_CONFIG.phraseBeforePhotos;
  }

  // Frase debajo de las fotos (versículo bíblico)
  const afterVerseEl = document.getElementById('phrase-after-verse');
  const afterRefEl = document.getElementById('phrase-after-ref');

  if (WEDDING_CONFIG.phraseAfterPhotos) {
    const afterData = WEDDING_CONFIG.phraseAfterPhotos;

    if (afterVerseEl) {
      if (typeof afterData === 'string') {
        afterVerseEl.innerHTML = afterData.replace(/\n/g, '<br>');
      } else if (afterData.verse) {
        afterVerseEl.innerHTML = afterData.verse.replace(/\n/g, '<br>');
      }
    }

    if (afterRefEl && afterData.reference) {
      afterRefEl.textContent = afterData.reference;
    }
  }
}

/* =
   MESA DE REGALOS
   */
function initGiftRegistry() {
  const gift = WEDDING_CONFIG.giftRegistry;
  if (!gift) return;

  const titleEl = document.getElementById('gift-title');
  const labelEl = document.getElementById('gift-label');
  const messageEl = document.getElementById('gift-message');
  const bankBoxEl = document.getElementById('gift-bank-info');

  if (titleEl && gift.title) titleEl.textContent = gift.title;
  if (labelEl && gift.label) labelEl.textContent = gift.label;
  if (messageEl && gift.message) messageEl.textContent = gift.message;

  // Si tiene detalles bancarios habilitados
  if (bankBoxEl && gift.bankDetails && gift.bankDetails.enabled) {
    bankBoxEl.style.display = 'block';
    const bankName = document.getElementById('gift-bank-name');
    const bankAccount = document.getElementById('gift-bank-account');
    const bankOwner = document.getElementById('gift-bank-owner');

    if (bankName) bankName.textContent = gift.bankDetails.bank || '';
    if (bankAccount) bankAccount.textContent = `${gift.bankDetails.accountType || ''} ${gift.bankDetails.accountNumber || ''}`;
    if (bankOwner) bankOwner.textContent = gift.bankDetails.owner || '';
  }
}

/*  CARRUSEL DE FOTOS TIPO BARAJA (STACKED CARDS)
  */
let activeCardIndex = 0;
let isAnimating = false;

function initPhotoDeckCarousel() {
  const deckContainer = document.getElementById('photo-deck');
  const dotsContainer = document.getElementById('carousel-dots');
  const photos = WEDDING_CONFIG.photos;

  if (!deckContainer || !photos || photos.length === 0) return;

  deckContainer.innerHTML = '';
  if (dotsContainer) dotsContainer.innerHTML = '';

  // Crear tarjetas fotográficas
  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.setAttribute('data-index', index);

    card.innerHTML = `
      <img src="${encodeURI(photo.url)}" alt="Recuerdo ${index + 1}" onerror="this.onerror=null; this.src='assets/logo-boda.png';">
      <div class="photo-card-overlay">
        <p>${photo.caption || ''}</p>
      </div>
    `;

    // Click en la tarjeta frontal avanza
    card.addEventListener('click', () => {
      if (index === activeCardIndex && !isAnimating) {
        nextPhotoCard();
      }
    });

    deckContainer.appendChild(card);

    // Indicador (punto)
    if (dotsContainer) {
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute('title', `Foto ${index + 1}`);
      dot.addEventListener('click', () => {
        if (!isAnimating && index !== activeCardIndex) {
          goToCardIndex(index);
        }
      });
      dotsContainer.appendChild(dot);
    }
  });

  // Botones de flechas
  const prevBtn = document.getElementById('prev-photo-btn');
  const nextBtn = document.getElementById('next-photo-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAnimating) prevPhotoCard();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAnimating) nextPhotoCard();
    });
  }

  // Soporte de gestos táctiles (Swipe en celulares)
  let touchStartX = 0;
  let touchEndX = 0;

  deckContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  deckContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40 && !isAnimating) {
      if (diff > 0) {
        nextPhotoCard();
      } else {
        prevPhotoCard();
      }
    }
  }, { passive: true });

  updateCardStackPositions();
}

function updateCardStackPositions() {
  const cards = document.querySelectorAll('.photo-card');
  const dots = document.querySelectorAll('.carousel-dots .dot');
  const total = cards.length;

  cards.forEach((card, i) => {
    card.classList.remove('card-pos-0', 'card-pos-1', 'card-pos-2', 'card-pos-hidden', 'swiping-next');

    const relativePos = (i - activeCardIndex + total) % total;

    if (relativePos === 0) {
      card.classList.add('card-pos-0'); // Frontal
    } else if (relativePos === 1) {
      card.classList.add('card-pos-1'); // Detrás asomándose a la derecha
    } else if (relativePos === 2) {
      card.classList.add('card-pos-2'); // Tercera tarjeta
    } else {
      card.classList.add('card-pos-hidden'); // Fondo
    }
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === activeCardIndex);
  });
}

function nextPhotoCard() {
  const cards = document.querySelectorAll('.photo-card');
  if (cards.length === 0) return;

  isAnimating = true;
  const currentCard = cards[activeCardIndex];
  currentCard.classList.add('swiping-next');

  setTimeout(() => {
    activeCardIndex = (activeCardIndex + 1) % cards.length;
    updateCardStackPositions();
    isAnimating = false;
  }, 380);
}

function prevPhotoCard() {
  const cards = document.querySelectorAll('.photo-card');
  if (cards.length === 0) return;

  isAnimating = true;
  activeCardIndex = (activeCardIndex - 1 + cards.length) % cards.length;
  updateCardStackPositions();

  setTimeout(() => {
    isAnimating = false;
  }, 380);
}

function goToCardIndex(index) {
  isAnimating = true;
  activeCardIndex = index;
  updateCardStackPositions();
  setTimeout(() => {
    isAnimating = false;
  }, 400);
}

/*  CUENTA REGRESIVA  */
function initCountdown() {
  const targetDate = new Date(WEDDING_CONFIG.eventDate).getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');
  const formattedDateEl = document.getElementById('wedding-formatted-date');

  // Formato de fecha localizado
  if (formattedDateEl) {
    const eventObj = new Date(WEDDING_CONFIG.eventDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = eventObj.toLocaleDateString('es-ES', options).toUpperCase();
    formattedDateEl.textContent = dateStr;
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      const statusTitle = document.querySelector('.countdown-date-badge');
      if (statusTitle) statusTitle.textContent = "¡HOY ES EL GRAN DÍA! ✨";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* UBICACIONES: */
function initLocations() {
  // Iglesia
  const church = WEDDING_CONFIG.church;
  if (church) {
    const churchTitle = document.getElementById('church-title');
    const churchPlace = document.getElementById('church-place');
    const churchTime = document.getElementById('church-time');
    const churchAddress = document.getElementById('church-address');
    const churchMapLink = document.getElementById('church-map-link');
    const churchIframe = document.getElementById('church-map-iframe');

    if (churchTitle) churchTitle.textContent = church.title;
    if (churchPlace) churchPlace.textContent = church.placeName;
    if (churchTime) churchTime.textContent = church.time;
    if (churchAddress) churchAddress.textContent = church.address;
    if (churchMapLink && church.mapsUrl) churchMapLink.href = church.mapsUrl;
    if (churchIframe && church.embedMapUrl) churchIframe.src = church.embedMapUrl;
  }

  // Recepción / Fiesta
  const reception = WEDDING_CONFIG.reception;
  if (reception) {
    const recTitle = document.getElementById('reception-title');
    const recPlace = document.getElementById('reception-place');
    const recTime = document.getElementById('reception-time');
    const recAddress = document.getElementById('reception-address');
    const recMapLink = document.getElementById('reception-map-link');
    const recIframe = document.getElementById('reception-map-iframe');

    if (recTitle) recTitle.textContent = reception.title;
    if (recPlace) recPlace.textContent = reception.placeName;
    if (recTime) recTime.textContent = reception.time;
    if (recAddress) recAddress.textContent = reception.address;
    if (recMapLink && reception.mapsUrl) recMapLink.href = reception.mapsUrl;
    if (recIframe && reception.embedMapUrl) recIframe.src = reception.embedMapUrl;
  }
}
