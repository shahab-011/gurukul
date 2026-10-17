/* ===== Vedhya Library — Home page extras =====
   Shared behaviours (header scroll, progress bar, reveal, counters,
   magnetic buttons, mobile menu) live in site.js. This file adds only
   the home-specific flourishes. */
(function () {
  /* ---- Word-by-word hero heading reveal ---- */
  (function () {
    var h = document.getElementById('heroTitle');
    if (!h) return;
    var frag = [];
    h.childNodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (w.trim()) frag.push({ t: w });
          else if (w) frag.push({ s: w });
        });
      } else {
        frag.push({ el: n });
      }
    });
    h.innerHTML = '';
    var i = 0;
    frag.forEach(function (f) {
      if (f.s) { h.appendChild(document.createTextNode(' ')); return; }
      var line = document.createElement('span'); line.className = 'wline';
      var word = document.createElement('span'); word.className = 'word';
      word.style.transitionDelay = (i * 0.07) + 's';
      if (f.el) { word.appendChild(f.el); } else { word.textContent = f.t; }
      line.appendChild(word); h.appendChild(line); i++;
    });
    requestAnimationFrame(function () {
      setTimeout(function () {
        document.querySelectorAll('#heroTitle .word').forEach(function (w) { w.classList.add('in'); });
      }, 250);
    });
  })();

  /* ---- 3D tilt on home cards ---- */
  if (window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card,.amen,.plan,.story-card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateY(' + (px * 6) + 'deg) rotateX(' + (-py * 6) + 'deg) translateY(-8px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ---- Subtle image parallax on scroll ---- */
  var plx = [].slice.call(document.querySelectorAll('.hero-img img,.about-media .m1 img,.vision-media img'));
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      plx.forEach(function (img) {
        var r = img.getBoundingClientRect();
        var off = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = 'scale(1.12) translateY(' + (off * -22) + 'px)';
      });
      ticking = false;
    });
  }, { passive: true });
})();
