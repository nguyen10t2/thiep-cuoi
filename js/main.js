/* ===================================================
   THIỆP CƯỚI — NHÀI & LONG
   JS: Countdown, Firebase, Gallery, Animations
   =================================================== */

(function () {
  'use strict';

  // ── Cover → Main Transition (chạy ngay, không phụ thuộc Firebase) ──
  var cover = document.getElementById('cover');
  var invitation = document.getElementById('invitation');
  var openBtn = document.getElementById('openBtn');
  var navDots = document.getElementById('navDots');

  openBtn.addEventListener('click', function () {
    cover.classList.add('zoom-out');

    setTimeout(function () {
      cover.classList.add('hidden');
      invitation.classList.add('visible');
      navDots.classList.remove('hidden');

      // Init các module sau khi DOM hiện
      initCountdown();
      initScrollAnimations();
      initNavDots();
      initGallery();
      initWishes();
    }, 900);
  });

  // ── Countdown Timer ──────────────────────────────
  var WEDDING_DATE = new Date('2026-07-19T07:00:00Z');
  var countDays, countHours, countMinutes, countSeconds;
  var countdownInterval = null;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
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

  // ── Scroll Animations (Intersection Observer) ────
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

  // ── Navigation Dots ──────────────────────────────
  var sections = document.querySelectorAll('.scroll-section');
  var dotButtons = navDots.querySelectorAll('.dot');

  function initNavDots() {
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

  // ── Swiper Gallery ───────────────────────────────
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

  // ── Firebase Guest Wishes (optional, không crash nếu lỗi) ──
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

  // Khởi tạo Firebase ngay (không block UI)
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

    if (!db) {
      if (wishesLoading) {
        wishesLoading.innerHTML = '<span style="color:var(--text-light);font-style:italic;">Không thể kết nối database</span>';
      }
      return;
    }

    var wishesRef = db.ref('wishes');

    wishesRef.orderByChild('timestamp').on(
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
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> Gửi Lời Chúc';
          });
      });
    }
  }
})();
