/* ==========================================================================
   PORTFOLIO MICHAEL CHRISTIAN WITANTO — Skrip bersama semua halaman
   Tema: Neobrutal Pop
   --------------------------------------------------------------------------
   Bagian:
     A. Toast neobrutal + aksi cepat (salin surel, detail proyek, salin kode)
     B. Bilah progres gulir + tombol ke atas
     C. Angka berhitung saat muncul
     D. Kursor pengikut (perangkat dengan penunjuk presisi)
     E. Navigasi mobile
     F. Salam mengikuti waktu + sorot menu/link navigasi aktif
     G. Scroll reveal (IntersectionObserver)
     H. Pencarian & filter proyek (hanya di index.html)
     I. Validasi formulir kontak (hanya di kontak.html)
   Setiap bagian aman dijalankan pada halaman yang tidak memilikinya.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================================================================
     A. TOAST NEOBRUTAL + AKSI CEPAT
     ====================================================================== */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message, tone) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.className = 'toast is-show' + (tone ? ' toast-' + tone : '');
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-show');
      toastEl.hidden = true;
    }, 3800);
  }

  /* Salin teks apa pun ke papan klip (dipakai tombol salin surel & kode) */
  function salinTeks(teks, pesanSukses) {
    var sukses = function () { showToast(pesanSukses, 'mint'); };
    var gagal = function () { showToast('Gagal menyalin — salin manual ya.', 'coral'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(teks).then(sukses, gagal);
    } else {
      var sementara = document.createElement('textarea');
      sementara.value = teks;
      sementara.setAttribute('readonly', '');
      document.body.appendChild(sementara);
      sementara.select();
      try { document.execCommand('copy'); sukses(); } catch (err) { gagal(); }
      document.body.removeChild(sementara);
    }
  }

  var copyButtons = document.querySelectorAll('[data-copy]');
  for (var ci = 0; ci < copyButtons.length; ci++) {
    copyButtons[ci].addEventListener('click', function () {
      salinTeks(this.getAttribute('data-copy'), this.getAttribute('data-copy-message') || 'Teks disalin ke papan klip');
    });
  }

  /* Tautan detail proyek — isi detail menyusul, jadi beri umpan balik */
  var projectLinks = document.querySelectorAll('.project-link');
  for (var pl = 0; pl < projectLinks.length; pl++) {
    projectLinks[pl].addEventListener('click', function (e) {
      var href = this.getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        e.preventDefault();
        showToast('Detail proyek sedang disiapkan — kabari saya untuk demo langsung.', 'yellow');
      }
    });
  }

  /* ======================================================================
     B. BILAH PROGRES GULIR + TOMBOL KE ATAS
     ====================================================================== */
  var progressEl = document.getElementById('scroll-progress');
  var toTopEl = document.getElementById('to-top');
  var scrollTicking = false;

  function paintScroll() {
    var maks = document.documentElement.scrollHeight - window.innerHeight;
    var persen = maks > 0 ? (window.scrollY / maks) * 100 : 0;
    if (progressEl) { progressEl.style.width = persen.toFixed(2) + '%'; }
    if (toTopEl) { toTopEl.classList.toggle('is-visible', window.scrollY > 620); }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(paintScroll);
    }
  }, { passive: true });
  paintScroll();

  /* ======================================================================
     C. ANGKA BERHITUNG SAAT MUNCUL
     ====================================================================== */
  var statNums = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) { return; }
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    var durasi = 950;
    var mulai = null;
    function langkah(ts) {
      if (mulai === null) { mulai = ts; }
      var p = Math.min((ts - mulai) / durasi, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(decimals) + suffix;
      if (p < 1) { window.requestAnimationFrame(langkah); }
    }
    window.requestAnimationFrame(langkah);
  }

  if ('IntersectionObserver' in window && statNums.length) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    for (var sn = 0; sn < statNums.length; sn++) { countIo.observe(statNums[sn]); }
  } else {
    for (var sn2 = 0; sn2 < statNums.length; sn2++) { animateCount(statNums[sn2]); }
  }

  /* ======================================================================
     D. KURSOR PENGIKUT (hanya perangkat dengan penunjuk presisi)
     ====================================================================== */
  var pointerHalus = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var dotEl = document.getElementById('cursor-dot');
  var ringEl = document.getElementById('cursor-ring');

  if (pointerHalus && !reduceMotion && dotEl && ringEl) {
    document.documentElement.classList.add('has-cursor');
    var mx = -120, my = -120, rx = -120, ry = -120;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    document.addEventListener('mouseover', function (e) {
      var interaktif = e.target.closest ? e.target.closest('a, button, input, textarea, select, [data-cursor]') : null;
      dotEl.classList.toggle('is-hover', Boolean(interaktif));
      ringEl.classList.toggle('is-hover', Boolean(interaktif));
    });

    (function ikuti() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dotEl.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      ringEl.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      window.requestAnimationFrame(ikuti);
    })();
  }

  /* ======================================================================
     E. NAVIGASI MOBILE (panel berbingkai)
     ====================================================================== */
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    var setNav = function (open) {
      siteNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    };
    navToggle.addEventListener('click', function () {
      setNav(!siteNav.classList.contains('is-open'));
    });
    siteNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setNav(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setNav(false); }
    });
  }

  /* ======================================================================
     F. SALAM WAKTU + SOROT MENU AKTIF
     ====================================================================== */
  var greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    var jam = new Date().getHours();
    var salam = jam < 11 ? 'Selamat pagi' : (jam < 15 ? 'Selamat siang' : (jam < 18 ? 'Selamat sore' : 'Selamat malam'));
    greetingEl.textContent = salam;
  }

  var spyLinks = document.querySelectorAll('.site-nav > a[href^="#"]:not(.btn)');
  var spyPairs = [];
  for (var sp = 0; sp < spyLinks.length; sp++) {
    var spyTarget = document.querySelector(spyLinks[sp].getAttribute('href'));
    if (spyTarget) { spyPairs.push({ link: spyLinks[sp], section: spyTarget }); }
  }

  function updateSpy() {
    if (!spyPairs.length) { return; }
    var posisi = window.scrollY + 160;
    var aktifSekarang = null;
    for (var n = 0; n < spyPairs.length; n++) {
      if (spyPairs[n].section.offsetTop <= posisi) { aktifSekarang = spyPairs[n].link; }
    }
    for (var m = 0; m < spyPairs.length; m++) {
      spyPairs[m].link.classList.toggle('is-active', spyPairs[m].link === aktifSekarang);
    }
  }

  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

  /* ======================================================================
     G. SCROLL REVEAL
     ====================================================================== */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    for (var i = 0; i < revealItems.length; i++) { revealItems[i].classList.add('reveal'); }
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    for (var j = 0; j < revealItems.length; j++) { io.observe(revealItems[j]); }

    /* Sapu cadangan: apa pun yang sudah lewat viewport tetap ditampilkan */
    var sapu = function () {
      var sisa = document.querySelectorAll('[data-reveal]:not(.reveal):not(.reveal-fallback)');
      for (var k = 0; k < sisa.length; k++) {
        if (sisa[k].getBoundingClientRect().top < window.innerHeight) {
          sisa[k].classList.add('reveal-fallback');
        }
      }
    };
    window.setTimeout(sapu, 900);
    window.addEventListener('load', sapu);
  }

  /* ======================================================================
     H. PENCARIAN & FILTER PROYEK (index.html)
     ====================================================================== */
  var chips = document.querySelectorAll('.chip');
  var projectCards = document.querySelectorAll('.project-card');
  var searchInput = document.getElementById('project-search');
  var countEl = document.getElementById('project-count');
  var emptyEl = document.getElementById('project-empty');
  var resetBtn = document.getElementById('reset-filter');
  var activeFilter = 'all';

  function applyFilter() {
    if (!projectCards.length) { return; }
    var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var tampil = 0;
    for (var i = 0; i < projectCards.length; i++) {
      var kartu = projectCards[i];
      var okKat = activeFilter === 'all' || kartu.getAttribute('data-category') === activeFilter;
      var okTeks = !q || kartu.textContent.toLowerCase().indexOf(q) !== -1;
      var tampilKartu = okKat && okTeks;
      kartu.hidden = !tampilKartu;
      if (tampilKartu) { tampil++; }
    }
    if (countEl) {
      countEl.textContent = 'Menampilkan ' + tampil + ' dari ' + projectCards.length + ' proyek';
    }
    if (emptyEl) { emptyEl.hidden = tampil !== 0; }
  }

  function setChipAktif(tombol) {
    for (var k = 0; k < chips.length; k++) {
      var aktif = chips[k] === tombol;
      chips[k].classList.toggle('is-active', aktif);
      chips[k].setAttribute('aria-pressed', aktif ? 'true' : 'false');
    }
    activeFilter = tombol ? tombol.getAttribute('data-filter') : 'all';
  }

  for (var ch = 0; ch < chips.length; ch++) {
    chips[ch].addEventListener('click', function () {
      setChipAktif(this);
      applyFilter();
    });
  }

  if (searchInput) { searchInput.addEventListener('input', applyFilter); }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (searchInput) { searchInput.value = ''; }
      setChipAktif(null);
      applyFilter();
      if (searchInput) { searchInput.focus(); }
    });
  }

  if (projectCards.length) { applyFilter(); }

  /* ======================================================================
     I. VALIDASI FORMULIR KONTAK (kontak.html)
     ====================================================================== */
  var form = document.getElementById('contact-form');

  if (form) {
    var statusEl = document.getElementById('form-status');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = [
      { id: 'nama', message: 'Nama wajib diisi, minimal 2 karakter.' },
      { id: 'email', message: 'Format surel belum benar.' },
      { id: 'perihal', message: 'Perihal wajib diisi.' },
      { id: 'pesan', message: 'Pesan wajib diisi, minimal 10 karakter.' }
    ];

    var fieldValue = function (id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    var isValid = function (id) {
      var value = fieldValue(id);
      if (id === 'nama') { return value.length >= 2; }
      if (id === 'email') { return emailPattern.test(value); }
      if (id === 'perihal') { return value.length > 0; }
      return value.length >= 10;
    };

    var paint = function (id, message) {
      var input = document.getElementById(id);
      var error = document.getElementById('err-' + id);
      if (!input || !error) { return; }
      error.textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      input.classList.toggle('is-invalid', Boolean(message));
    };

    rules.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      if (input) {
        input.addEventListener('input', function () {
          var error = document.getElementById('err-' + rule.id);
          if (error && error.textContent) { paint(rule.id, ''); }
        });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;

      rules.forEach(function (rule) {
        var message = isValid(rule.id) ? '' : rule.message;
        paint(rule.id, message);
        if (message) {
          valid = false;
          if (!firstInvalid) { firstInvalid = document.getElementById(rule.id); }
        }
      });

      if (!valid) {
        if (statusEl) {
          statusEl.textContent = 'Ada isian yang perlu diperbaiki dulu ya.';
          statusEl.className = 'form-status is-error';
        }
        if (firstInvalid) { firstInvalid.focus(); }
        return;
      }

      if (statusEl) {
        statusEl.textContent = 'Terima kasih! Pesan Anda sudah tercatat. Saya akan membalas lewat surel.';
        statusEl.className = 'form-status is-success';
      }
      showToast('Pesan tercatat — terima kasih!', 'mint');
      form.reset();
      rules.forEach(function (rule) { paint(rule.id, ''); });
    });
  }
})();
