/* ===================================================
   THIỆP CƯỚI — TEMPLATE ENGINE
   JS: Data loading, Countdown, Firebase, Gallery
   =================================================== */

(function () {
  'use strict';

  var DATA = null;
  var WEDDING_DATE = null;

  // ── Load Data from JSON ─────────────────────────
  async function loadData() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');

    if (!id) {
      showNoIdScreen();
      return Promise.resolve(null);
    }

    return fetch('data/' + id + '.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Data not found');
        return res.json();
      })
      .then(function (data) {
        DATA = data;
        WEDDING_DATE = new Date(data.weddingDate);
        populateTemplate(data);
        return data;
      })
      .catch(function (err) {
        showErrorScreen(id);
        console.error('Load data error:', err);
        return null;
      });
  }

  // ── Show error when no id or invalid id ─────────
  function showNoIdScreen() {
    var loading = document.getElementById('loadingScreen');
    if (loading) {
      loading.innerHTML =
        '<div style="text-align:center;padding:2rem;max-width:400px;">' +
        '<h2 style="font-family:\'Great Vibes\',cursive;font-size:3rem;margin-bottom:1.5rem;">Thiệp Cưới</h2>' +
        '<div style="display:flex;flex-direction:column;gap:0.75rem;">' +
        '<p style="font-family:\'Josefin Sans\',sans-serif;font-size:0.8rem;color:#888;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:0.5rem;">Nhài & Long</p>' +
        '<a href="?id=long-nhai/gai" style="display:block;padding:0.75rem 1.5rem;background:#333;color:#fff;text-decoration:none;border-radius:50px;font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;border:2px solid #333;">Nhà Gái — Họ Đào</a>' +
        '<a href="?id=long-nhai/trai" style="display:block;padding:0.75rem 1.5rem;background:transparent;color:#333;text-decoration:none;border-radius:50px;font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;border:2px solid #333;">Nhà Trai — Họ Bùi</a>' +
        '<p style="font-family:\'Josefin Sans\',sans-serif;font-size:0.8rem;color:#888;letter-spacing:0.15em;text-transform:uppercase;margin-top:0.5rem;margin-bottom:0.5rem;">Phương Anh & Minh Hiếu</p>' +
        '<a href="?id=hieu-phuonganh/gai" style="display:block;padding:0.75rem 1.5rem;background:#333;color:#fff;text-decoration:none;border-radius:50px;font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;border:2px solid #333;">Nhà Gái — Họ Phan</a>' +
        '<a href="?id=hieu-phuonganh/trai" style="display:block;padding:0.75rem 1.5rem;background:transparent;color:#333;text-decoration:none;border-radius:50px;font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;border:2px solid #333;">Nhà Trai — Họ Phùng</a>' +
        '</div></div>';
    }
    document.body.style.overflow = 'hidden';
  }

  function showErrorScreen(id) {
    var loading = document.getElementById('loadingScreen');
    if (loading) {
      loading.innerHTML =
        '<div style="text-align:center;padding:2rem;max-width:400px;">' +
        '<h2 style="font-family:\'Great Vibes\',cursive;font-size:2rem;margin-bottom:1rem;">Không tìm thấy</h2>' +
        '<p style="font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;color:#888;margin-bottom:1.5rem;">' +
        'Không tìm thấy thiệp với mã: <strong>' + escapeHtml(id) + '</strong></p>' +
        '<a href="?" style="display:inline-block;padding:0.75rem 1.5rem;background:var(--sage,#6b8f71);color:#fff;text-decoration:none;border-radius:8px;font-family:\'Josefin Sans\',sans-serif;font-size:0.85rem;">Về trang chủ</a>' +
        '</div>';
    }
    document.body.style.overflow = 'hidden';
  }

  // ── Populate Template with Data ─────────────────
  function populateTemplate(data) {
    // Update meta tags
    document.title = data.meta.title;
    document.querySelector('meta[name="description"]').setAttribute('content', data.meta.description);
    document.querySelector('meta[property="og:title"]').setAttribute('content', data.meta.ogTitle);
    document.querySelector('meta[property="og:description"]').setAttribute('content', data.meta.ogDescription);
    if (data.coupleNames && data.coupleNames.photo) {
      document.querySelector('meta[property="og:image"]').setAttribute('content', data.coupleNames.photo);
    }

    // Update all data-field elements
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var fieldPath = el.getAttribute('data-field');
      var value = getNestedValue(data, fieldPath);
      if (value !== undefined && value !== null) {
        var attr = el.getAttribute('data-field-attr');
        if (attr) {
          el.setAttribute(attr, value);
        } else {
          el.innerHTML = value;
        }
      }
    });

    // Update data-field-alt elements
    document.querySelectorAll('[data-field-alt]').forEach(function (el) {
      var fieldPath = el.getAttribute('data-field-alt');
      var value = getNestedValue(data, fieldPath);
      if (value !== undefined) {
        el.setAttribute('alt', value);
      }
    });

    // Build dynamic sections
    buildEvents(data.events);
    buildFamilies(data.families);
    buildGallery(data.gallery);

    // Update wishes placeholders
    var wishName = document.getElementById('wishName');
    var wishMessage = document.getElementById('wishMessage');
    if (wishName && data.wishes) wishName.setAttribute('placeholder', data.wishes.namePlaceholder);
    if (wishMessage && data.wishes) wishMessage.setAttribute('placeholder', data.wishes.messagePlaceholder);

    // Update calendar highlight
    if (data.saveTheDate && data.saveTheDate.calendarHighlight) {
      var calendarDays = document.getElementById('calendarDays');
      if (calendarDays) {
        var spans = calendarDays.querySelectorAll('span');
        spans.forEach(function (span) {
          if (span.textContent === data.saveTheDate.calendarHighlight) {
            span.className = 'highlight';
          } else {
            span.className = '';
          }
        });
      }
    }

    // Update audio source
    if (data.audio) {
      var bgMusic = document.getElementById('bg-music');
      if (bgMusic) {
        var source = bgMusic.querySelector('source');
        if (source) {
          source.setAttribute('src', data.audio);
          bgMusic.load();
        }
      }
    }

    // Hide loading, show cover
    var loading = document.getElementById('loadingScreen');
    if (loading) {
      loading.style.opacity = '0';
      loading.style.transition = 'opacity 0.5s ease';
      setTimeout(function () {
        loading.style.display = 'none';
      }, 500);
    }
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : undefined;
    }, obj);
  }

  // ── Build Events Grid ───────────────────────────
  function buildEvents(eventsData) {
    var grid = document.getElementById('eventsGrid');
    if (!grid || !eventsData || !eventsData.items) return;

    var icons = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    ];

    var delays = ['0.2', '0.4'];
    grid.innerHTML = eventsData.items.map(function (item, i) {
      return '<div class="event-card" data-animate="fade-up" data-delay="' + (delays[i] || '0.2') + '">' +
        '<div class="event-icon">' + (icons[i] || icons[0]) + '</div>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p class="event-time">' + escapeHtml(item.time) + '</p>' +
        '<p class="event-location">' + escapeHtml(item.location) + '</p>' +
        '<p class="event-address">' + escapeHtml(item.address) + '</p>' +
        '</div>';
    }).join('');
  }

  // ── Build Families Grid ─────────────────────────
  function buildFamilies(familiesData) {
    var grid = document.getElementById('familiesGrid');
    if (!grid || !familiesData || !familiesData.items) return;

    var delays = ['0.2', '0.4'];
    var anims = ['fade-right', 'fade-left'];
    grid.innerHTML = familiesData.items.map(function (item, i) {
      return '<div class="family-card" data-animate="' + (anims[i] || 'fade-up') + '" data-delay="' + (delays[i] || '0.2') + '">' +
        '<div class="family-badge">' + escapeHtml(item.badge) + '</div>' +
        '<h3 class="family-name">' + escapeHtml(item.name) + '</h3>' +
        '<p class="family-member">' + item.member + '</p>' +
        '<div class="family-divider"></div>' +
        '<p class="family-address">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' +
        escapeHtml(item.address) + '</p>' +
        '</div>';
    }).join('');
  }

  // ── Build Gallery ───────────────────────────────
  function buildGallery(galleryData) {
    var wrapper = document.getElementById('galleryWrapper');
    if (!wrapper || !galleryData || !galleryData.images) return;

    wrapper.innerHTML = galleryData.images.map(function (img) {
      return '<div class="swiper-slide">' +
        '<img src="' + escapeHtml(img.src) + '" alt="' + escapeHtml(img.alt) + '" loading="lazy">' +
        '</div>';
    }).join('');
  }

  // ── Cover → Main Transition ─────────────────────
  function initCoverTransition() {
    var cover = document.getElementById('cover');
    var invitation = document.getElementById('invitation');
    var openBtn = document.getElementById('openBtn');
    var navDots = document.getElementById('navDots');

    if (!openBtn) return;

    openBtn.addEventListener('click', function () {
      cover.classList.add('zoom-out');

      setTimeout(function () {
        cover.classList.add('hidden');
        invitation.classList.add('visible');
        navDots.classList.remove('hidden');

        initCountdown();
        initScrollAnimations();
        initNavDots();
        initGallery();
        initWishes();
        initMusic();
      }, 2500);
    });
  }

  // ── Music Player ────────────────────────────────
  function initMusic() {
    var musicPlayer = document.getElementById('music-player');
    var bgMusic = document.getElementById('bg-music');
    if (musicPlayer && bgMusic) {
      musicPlayer.classList.add('visible');
      bgMusic.play().catch(function (e) {
        console.log("Auto-play prevented:", e);
        musicPlayer.classList.add('paused');
      });

      musicPlayer.addEventListener('click', function () {
        if (bgMusic.paused) {
          bgMusic.play();
          musicPlayer.classList.remove('paused');
        } else {
          bgMusic.pause();
          musicPlayer.classList.add('paused');
        }
      });
    }
  }

  // ── Countdown Timer ─────────────────────────────
  var countDays, countHours, countMinutes, countSeconds;
  var countdownInterval = null;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    if (!WEDDING_DATE) return;

    var now = Date.now();
    var diff = WEDDING_DATE.getTime() - now;

    if (diff <= 0) {
      if (countDays) countDays.textContent = '00';
      if (countHours) countHours.textContent = '00';
      if (countMinutes) countMinutes.textContent = '00';
      if (countSeconds) countSeconds.textContent = '00';
      if (countdownInterval) clearInterval(countdownInterval);
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (countDays) countDays.textContent = pad(days);
    if (countHours) countHours.textContent = pad(hours);
    if (countMinutes) countMinutes.textContent = pad(minutes);
    if (countSeconds) countSeconds.textContent = pad(seconds);
  }

  function initCountdown() {
    countDays = document.getElementById('countDays');
    countHours = document.getElementById('countHours');
    countMinutes = document.getElementById('countMinutes');
    countSeconds = document.getElementById('countSeconds');
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  // ── Scroll Animations ───────────────────────────
  function initScrollAnimations() {
    var animatedEls = document.querySelectorAll('[data-animate]');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      animatedEls.forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    animatedEls.forEach(function (el) {
      el.style.opacity = '0';
      var animType = el.getAttribute('data-animate');
      if (animType === 'fade-right') {
        el.style.transform = 'translateX(-40px)';
      } else if (animType === 'fade-left') {
        el.style.transform = 'translateX(40px)';
      } else {
        el.style.transform = 'translateY(40px)';
      }
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      var delay = parseFloat(el.getAttribute('data-delay')) || 0;
      if (delay > 0) {
        el.style.transitionDelay = delay + 's';
      }
    });

    var scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.style.opacity = '1';
            el.style.transform = 'translate(0, 0)';
            observer.unobserve(el);
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ── Navigation Dots ─────────────────────────────
  function initNavDots() {
    var navDots = document.getElementById('navDots');
    var sections = document.querySelectorAll('.scroll-section');
    if (!navDots) return;

    var dotButtons = navDots.querySelectorAll('.dot');

    dotButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-section'));
        if (sections[idx]) {
          sections[idx].scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    var scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', function () {
      var scrollTop = scrollContainer.scrollTop;
      var viewHeight = scrollContainer.clientHeight;

      sections.forEach(function (section, idx) {
        var top = section.offsetTop;
        if (scrollTop >= top - viewHeight / 2 && scrollTop < top + viewHeight / 2) {
          dotButtons.forEach(function (b) { b.classList.remove('active'); });
          if (dotButtons[idx]) dotButtons[idx].classList.add('active');
        }
      });
    });
  }

  // ── Swiper Gallery ──────────────────────────────
  function initGallery() {
    try {
      new Swiper('.gallery-swiper', {
        loop: true,
        grabCursor: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 15,
          slideShadows: false,
          depth: 100,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        spaceBetween: 20,
        speed: 600,
      });
    } catch (e) {
      console.warn('Swiper init error:', e);
    }
  }

  // ── Firebase ────────────────────────────────────
  var db = null;

  function initFirebase() {
    try {
      var firebaseConfig = {
        apiKey: 'AIzaSyDWy1zleQMkMkF0812D_74ZrkmYk3CAsMs',
        authDomain: 'thiepcuoi-89ccd.firebaseapp.com',
        databaseURL: 'https://thiepcuoi-89ccd-default-rtdb.asia-southeast1.firebasedatabase.app',
        projectId: 'thiepcuoi-89ccd',
        storageBucket: 'thiepcuoi-89ccd.firebasestorage.app',
        messagingSenderId: '138523503422',
        appId: '1:138523503422:web:a3bfa96f9fa25d48459a6f',
      };
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
    } catch (e) {
      console.warn('Firebase init error:', e);
    }
  }

  if (typeof firebase !== 'undefined') {
    initFirebase();
  }

  var wishForm, wishName, wishMessage, wishSubmitBtn, wishStatus, wishesList, wishesLoading;
  var lastSubmitTime = 0;
  var wishesLoaded = false;

  function createWishCard(wish) {
    var card = document.createElement('div');
    card.className = 'wish-card';

    var timeStr = '';
    if (wish.timestamp) {
      var d = new Date(wish.timestamp);
      timeStr = d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    card.innerHTML =
      '<p class="wish-card-name">' + escapeHtml(wish.name) + '</p>' +
      '<p class="wish-card-message">' + escapeHtml(wish.message) + '</p>' +
      (timeStr ? '<p class="wish-card-time">' + timeStr + '</p>' : '');

    return card;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showStatus(msg, isError) {
    if (!wishStatus) return;
    wishStatus.textContent = msg;
    wishStatus.className = 'wish-status' + (isError ? ' error' : '');
    setTimeout(function () {
      if (wishStatus) {
        wishStatus.textContent = '';
        wishStatus.className = 'wish-status';
      }
    }, 3000);
  }

  function initWishes() {
    wishForm = document.getElementById('wishForm');
    wishName = document.getElementById('wishName');
    wishMessage = document.getElementById('wishMessage');
    wishSubmitBtn = document.getElementById('wishSubmitBtn');
    wishStatus = document.getElementById('wishStatus');
    wishesList = document.getElementById('wishesList');
    wishesLoading = document.getElementById('wishesLoading');

    if (!db || !DATA) {
      if (wishesLoading) {
        wishesLoading.innerHTML = '<span style="color:var(--text-light);font-style:italic;">Không thể kết nối database</span>';
      }
      return;
    }

    var wishesPath = DATA.firebase ? DATA.firebase.wishesPath : 'wishes';
    var wishesRef = db.ref(wishesPath);

    wishesRef.orderByChild('timestamp').limitToLast(5).on(
      'child_added',
      function (snapshot) {
        var wish = snapshot.val();
        if (!wish) return;

        if (!wishesLoaded) {
          wishesLoaded = true;
          if (wishesLoading) wishesLoading.style.display = 'none';
        }

        var card = createWishCard(wish);
        if (wishesList.firstChild && wishesList.firstChild !== wishesLoading) {
          wishesList.insertBefore(card, wishesList.firstChild);
        } else {
          wishesList.appendChild(card);
        }
      },
      function (error) {
        console.warn('Firebase read error:', error);
        if (wishesLoading) {
          wishesLoading.innerHTML = '<span style="color:var(--text-light);font-style:italic;">Không thể tải lời chúc</span>';
        }
      }
    );

    if (wishForm) {
      wishForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var now = Date.now();
        if (now - lastSubmitTime < 10000) {
          showStatus('Vui lòng đợi 10 giây trước khi gửi lại!', true);
          return;
        }

        var name = wishName ? wishName.value.trim() : '';
        var message = wishMessage ? wishMessage.value.trim() : '';

        if (!name || !message) {
          showStatus('Vui lòng nhập đầy đủ tên và lời chúc!', true);
          return;
        }

        wishSubmitBtn.disabled = true;
        wishSubmitBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Đang gửi...';

        wishesRef
          .push({
            name: name,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
          })
          .then(function () {
            lastSubmitTime = Date.now();
            wishName.value = '';
            wishMessage.value = '';
            showStatus('Cảm ơn bạn đã gửi lời chúc!', false);
          })
          .catch(function (err) {
            showStatus('Có lỗi xảy ra, vui lòng thử lại!', true);
            console.error('Firebase push error:', err);
          })
          .finally(function () {
            wishSubmitBtn.disabled = false;
            wishSubmitBtn.innerHTML =
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> <span data-field="wishes.submitText">Gửi Lời Chúc</span>';
          });
      });
    }
  }

  // ── INIT ────────────────────────────────────────
  loadData().then(function (data) {
    if (data) {
      initCoverTransition();
    }
  });

})();
