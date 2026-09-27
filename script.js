/* ============================================================
   أمانك - Safe Guard | script.js (Vanilla JS — بدون مكتبات)
   الميزات: شاشة التحميل · قائمة الجوال · قائمة تنقل ذكية
   (تخفي/تُظهر + تُبرز القسم النشط) · عدّاد أرقام متحرك ·
   IntersectionObserver بظهور متتالٍ · ظهور الصور بأنيميشن ·
   نموذج اتصال متقدم بالتحقق الكامل · نافذة منبثقة للعرض الخاص (30 ثانية)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1) إخفاء شاشة التحميل ---------- */
  var loader = document.getElementById('loader');
  if (loader) {
    var hideLoader = function () { loader.classList.add('is-hidden'); };
    window.addEventListener('load', function () { setTimeout(hideLoader, 350); });
    setTimeout(hideLoader, 2600);
  }

  /* ---------- 2) قائمة الجوال (Hamburger) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'فتح القائمة');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      burger.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    });
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !burger.contains(e.target)) closeNav();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) closeNav(); });
  }

  /* ---------- 3) الهيدر + قائمة تنقل ذكية (تُخفي عند النزول وتظهر عند الصعود) ---------- */
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');
  var lastY = window.scrollY || 0;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('is-stuck', y > 12);

      var goingDown = y > lastY;
      var shouldHide = goingDown && y > 320 && (!nav || !nav.classList.contains('is-open'));
      header.classList.toggle('is-hidden', shouldHide);
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 420);

    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4) زر العودة للأعلى ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 5) التمرير الناعم للروابط الداخلية ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = header ? header.offsetHeight + 12 : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      closeNav();
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* ---------- 6) ظهور العناصر + الصور بأنيميشن (IntersectionObserver بظهور متتالٍ) ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (entry, i) {
        // تأخير متتالٍ ليعطي إحساس الظهور المتتابع
        setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 120);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 7) عدّاد الأرقام المتحرك (من 0 إلى النهاية) ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var decimals = (el.getAttribute('data-decimals') | 0) || 0;
    var duration = 1600;
    var startTime = null;

    function format(value) {
      return prefix + value.toLocaleString('ar-EG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }

    function step(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = format(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') +
        el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- 8) سنة الحقوق في الفوتر ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 9) نموذج الاتصال المتقدم بالتحقق الكامل ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var successBox = document.getElementById('formSuccess');

    function showError(field, message) {
      var wrapper = field.closest('.field');
      var errorEl = wrapper ? wrapper.querySelector('.error') : null;
      if (wrapper) wrapper.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    }
    function clearError(field) {
      var wrapper = field.closest('.field');
      var errorEl = wrapper ? wrapper.querySelector('.error') : null;
      if (wrapper) wrapper.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
    function isValidEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }
    function isValidPhone(value) { return /^[0-9+\-\s]{8,15}$/.test(value); }

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () { clearError(field); });
      field.addEventListener('change', function () { clearError(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // موقع ثابت بدون backend — نمنع الإرسال الفعلي

      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var phone = form.querySelector('#phone');
      var device = form.querySelector('#device');
      var members = form.querySelector('#members');
      var subject = form.querySelector('#subject');
      var message = form.querySelector('#message');
      var firstInvalid = null;

      if (name && name.value.trim().length < 3) {
        showError(name, 'الرجاء إدخال الاسم الكامل (3 أحرف على الأقل).');
        firstInvalid = firstInvalid || name;
      }
      if (email && !isValidEmail(email.value.trim())) {
        showError(email, 'الرجاء إدخال بريد إلكتروني صحيح.');
        firstInvalid = firstInvalid || email;
      }
      if (phone && phone.value.trim() !== '' && !isValidPhone(phone.value.trim())) {
        showError(phone, 'الرجاء إدخال رقم جوال صحيح (أرقام فقط، 8-15 خانة).');
        firstInvalid = firstInvalid || phone;
      }
      if (device && device.value === '') {
        showError(device, 'الرجاء اختيار نوع الجهاز.');
        firstInvalid = firstInvalid || device;
      }
      if (members && (members.value === '' || parseInt(members.value, 10) < 1 || parseInt(members.value, 10) > 30)) {
        showError(members, 'الرجاء إدخال عدد أفراد الأسرة (من 1 إلى 30).');
        firstInvalid = firstInvalid || members;
      }
      if (subject && subject.value === '') {
        showError(subject, 'الرجاء اختيار موضوع الرسالة.');
        firstInvalid = firstInvalid || subject;
      }
      if (message && message.value.trim().length < 10) {
        showError(message, 'الرجاء كتابة رسالة لا تقل عن 10 أحرف.');
        firstInvalid = firstInvalid || message;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        if (successBox) successBox.hidden = true;
        return;
      }

      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });
  }

  /* ---------- 10) تمييز الرابط النشط في القائمة أثناء التمرير ---------- */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { threshold: 0.35, rootMargin: '-20% 0px -40% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- 11) النافذة المنبثقة للعرض الخاص (تظهر بعد 30 ثانية) ---------- */
  var modal = document.getElementById('promoModal');
  if (modal) {
    var MODAL_KEY = 'amanakPromoSeen';
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(MODAL_KEY) === '1'; } catch (err) { alreadySeen = false; }
    var lastFocused = null;

    function openModal() {
      if (modal.classList.contains('is-open')) return;
      lastFocused = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var closeBtn = modal.querySelector('.modal__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      try { sessionStorage.setItem(MODAL_KEY, '1'); } catch (err) { /* تجاهل */ }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    if (!alreadySeen) {
      setTimeout(openModal, 30000); // 30 ثانية من البقاء في الصفحة
    }

    modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // زر داخل النافذة يقود إلى قسم التواصل
    var modalCta = modal.querySelector('[data-modal-cta]');
    if (modalCta) {
      modalCta.addEventListener('click', function () {
        closeModal();
        var contact = document.getElementById('contact');
        if (contact) {
          var top = contact.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight + 12 : 0);
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    }
  }

});
