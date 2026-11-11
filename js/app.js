/* Foundry Faces page behaviour: hero face wall, type grid, face finder, copy buttons. */
(function () {
  var F = window.FoundryFaces;
  if (!F) return;
  function $(id) { return document.getElementById(id); }
  function rand(n) { return Math.floor(Math.random() * n); }

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
    setInterval(function () {
      var cells = wall.children;
      for (var k = 0; k < 3; k++) {
        var idx = rand(cells.length);
        var ns = 1 + rand(99999);
        wallSeeds[idx] = ns;
        F.paint(cells[idx], ns);
      }
    }, 1800);
  }

  /* ---- find your face ---- */
  var finder = $("finder-canvas"), findBtn = $("find-btn"), result = $("finder-result");
  var currentSeed = 20261111;
  if (finder) F.paint(finder, currentSeed);
  if (findBtn && finder) {
    findBtn.addEventListener("click", function () {
      findBtn.disabled = true;
      var spins = 0;
      var iv = setInterval(function () {
        F.paint(finder, 1 + rand(999999));
        spins += 1;
        if (spins >= 12) {
          clearInterval(iv);
          currentSeed = 1 + rand(11111);
          var tr = F.paint(finder, currentSeed);
          var type = F.TYPES[currentSeed % 20];
          if (result) {
            result.innerHTML = "Face #" + currentSeed.toLocaleString("en-US") +
              " · Type <b>" + type.name.toUpperCase() + "</b> · " + type.note;
          }
          findBtn.disabled = false;
        }
      }, 70);
    });
  }

  /* ---- twenty types grid ---- */
  var grid = $("types-grid");
  if (grid) {
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
      F.paint(c, 20 * (61 + i * 7) + i, i);
    });
  }

  /* ---- copy buttons ---- */
  function wireCopy(btnId, srcId, label) {
    var btn = $(btnId), src = $(srcId);
    if (!btn || !src) return;
    btn.addEventListener("click", function () {
      var t = src.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = label; }, 1600);
    });
  }
  wireCopy("copy-prompt", "agent-prompt", "Copy prompt");
})();
