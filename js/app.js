/* Foundry Faces page behaviour: hero face wall, type grid, face finder, copy buttons. */
(function () {
  var F = window.FoundryFaces;
  if (!F) return;
  function $(id) { return document.getElementById(id); }
  function rand(n) { return Math.floor(Math.random() * n); }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fadePaint(cv, seed, typeIdx) {
    if (reduceMotion) { F.paint(cv, seed, typeIdx); return; }
    cv.style.opacity = "0";
    setTimeout(function () {
      F.paint(cv, seed, typeIdx);
      cv.style.opacity = "1";
    }, 190);
  }

  /* ---- hero wall: 24 living faces, a few re-forge every couple of seconds ---- */
  var wall = $("wall");
  var wallSeeds = [];
  if (wall) {
    for (var i = 0; i < 24; i++) {
      var cv = document.createElement("canvas");
      cv.setAttribute("aria-hidden", "true");
      wall.appendChild(cv);
      var s = 1 + rand(99999);
      wallSeeds.push(s);
      F.paint(cv, s);
    }
    var wallLive = true, wallSeen = true;
    function wallTick() {
      if (!wallLive || !wallSeen || document.hidden) return;
      var cells = wall.children;
      var n = window.innerWidth <= 560 ? 2 : 3;
      for (var k = 0; k < n; k++) {
        var idx = rand(cells.length);
        var ns = 1 + rand(99999);
        wallSeeds[idx] = ns;
        fadePaint(cells[idx], ns);
      }
    }
    setInterval(wallTick, 1800);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { wallSeen = en[0].isIntersecting; }, { threshold: 0.02 }).observe(wall);
    }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) wallLive = false;
  }

  /* ---- find your face ---- */
  var finder = $("finder-canvas"), findBtn = $("find-btn"), result = $("finder-result");
  var currentSeed = 20261111;
  if (finder) F.paint(finder, currentSeed);
  if (findBtn && finder) {
    findBtn.addEventListener("click", function () {
      findBtn.disabled = true;
      finder.classList.remove("landed");
      if (result) result.classList.remove("show");
      var spins = 0;
      function spin() {
        F.paint(finder, 1 + rand(999999));
        spins += 1;
        if (spins >= 13) {
          currentSeed = 1 + rand(11111);
          var tr = F.paint(finder, currentSeed);
          var type = F.TYPES[currentSeed % 20];
          if (result) {
            result.innerHTML = "Face #" + currentSeed.toLocaleString("en-US") +
              " · Type <b>" + type.name.toUpperCase() + "</b> · " + type.note;
            result.classList.add("show");
          }
          finder.classList.add("landed");
          findBtn.disabled = false;
          return;
        }
        setTimeout(spin, 65 + spins * spins * 1.6);
      }
      spin();
    });
  }

  /* ---- twenty types grid: living faces, re-forged in place ---- */
  var grid = $("types-grid");
  if (grid) {
    var typeFaces = [];
    F.TYPES.forEach(function (t, i) {
      var card = document.createElement("article");
      card.className = "type-card";
      var c = document.createElement("canvas");
      card.appendChild(c);
      var tn = document.createElement("div");
      tn.className = "tn";
      tn.innerHTML = t.name + "<i>TYPE " + String(i + 1).padStart(2, "0") + "</i>";
      card.appendChild(tn);
      var td = document.createElement("p");
      td.className = "td";
      td.textContent = t.note;
      card.appendChild(td);
      grid.appendChild(card);
      var seed0 = 20 * (61 + i * 7) + i;
      F.paint(c, seed0, i);
      var rec = { cv: c, type: i, seed: seed0 };
      typeFaces.push(rec);
      card.addEventListener("click", function () {
        rec.seed = 1 + rand(999999);
        fadePaint(rec.cv, rec.seed, rec.type);
      });
    });
    var gridSeen = false;
    function typeTick() {
      if (!gridSeen || document.hidden || reduceMotion) return;
      for (var k = 0; k < 2; k++) {
        var rec = typeFaces[rand(typeFaces.length)];
        rec.seed = 1 + rand(999999);
        fadePaint(rec.cv, rec.seed, rec.type);
      }
    }
    setInterval(typeTick, 2300);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { gridSeen = en[0].isIntersecting; }, { threshold: 0.02 }).observe(grid);
    } else {
      gridSeen = true;
    }
  }

  /* ---- copy buttons ---- */
  function wireCopy(btnId, srcId, label) {
    var btn = $(btnId), src = $(srcId);
    if (!btn || !src) return;
    btn.addEventListener("click", function () {
      var t = src.textContent;
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(t);
        else {
          var ta = document.createElement("textarea");
          ta.value = t; document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); ta.remove();
        }
      } catch (err) { /* clipboard unavailable */ }
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = label; }, 1600);
    });
  }
  wireCopy("copy-prompt", "agent-prompt", "Copy prompt");

  /* ---- reveal on scroll: gentle rise-in for sections and cards ---- */
  if ("IntersectionObserver" in window) {
    var rvEls = document.querySelectorAll(".blk, .fact, .type-card, .board, .tiers, .prompt-wrap, .faq, .finder");
    var rvIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); rvIO.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    rvEls.forEach(function (el, i) {
      el.classList.add("rv");
      if (el.classList.contains("type-card")) el.style.transitionDelay = (i % 5) * 45 + "ms";
      rvIO.observe(el);
    });
  }
})();
