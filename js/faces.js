/* Foundry Faces: client-side pixel face painter.
   Every face is painted from a seed on a 24 x 24 pixel grid.
   Layers: background, shoulders, neck, head, hair or headgear, eyes, mouth, extras.
   Same seed always paints same face, on this page and in collection art. */
(function () {
  var GRID = 24, PX = 4;

  var BGS = ["#f2c94c", "#f2994a", "#eb5757", "#bb6bd9", "#56ccf2", "#6fcf97",
             "#f4ecdd", "#2d9cdb", "#f2541b", "#219653", "#f2e3c6", "#33393f",
             "#ffd9a0", "#a8dadc", "#e5989b", "#84a98c"];
  var SKINS = ["#f6cfae", "#eab88c", "#d99e63", "#b97a45", "#8d5524", "#ffe0bd",
               "#cfe8d8", "#d7dbe0"];
  var HAIRS = ["#221a12", "#4a2f1b", "#7a4a21", "#b5651d", "#d9d9d9", "#f2541b",
               "#2d6a9c", "#5b4a8a", "#2e7d5b", "#e8b4b8"];
  var CLOTH = ["#f2541b", "#221a12", "#2d6a9c", "#2e7d5b", "#8a4a2b", "#5b4a8a",
               "#c22f4e", "#e0a100", "#3d5a80", "#6d4c41"];
  var DARK = "#221a12", GOLD = "#ffb340", WHITE = "#fffaf0";

  /* 20 character types. bias fields nudge trait rolls toward a signature look. */
  var TYPES = [
    { name: "Smith",    note: "Hammers first, talks later.", gear: "hardhat" },
    { name: "Dreamer",  note: "Head in a furnace cloud.", gear: "halo" },
    { name: "Operator", note: "Runs a night shift console.", gear: "visor" },
    { name: "Sentinel", note: "Watches a gate, never blinks.", gear: "shades" },
    { name: "Nomad",    note: "Sleeps wherever a chain stops.", gear: "hood" },
    { name: "Oracle",   note: "Reads blocks like weather.", gear: "stareyes" },
    { name: "Tinker",   note: "Fixes agents, bots, and luck.", gear: "cap" },
    { name: "Foreman",  note: "Runs a loud, honest floor.", gear: "hardhat", beard: true },
    { name: "Ghost",    note: "Signed one tx, vanished.", gear: "none", pale: true },
    { name: "Pilot",    note: "Flies mempools at dawn.", gear: "cap" },
    { name: "Mason",    note: "Lays one brick per block.", gear: "crop" },
    { name: "Spark",    note: "Youngest fire in a foundry.", gear: "mohawk" },
    { name: "Keeper",   note: "Guards keys and quiet rooms.", gear: "hood" },
    { name: "Rover",    note: "Collects stamps from every chain.", gear: "cap" },
    { name: "Sage",     note: "Old enough to wait out gas wars.", gear: "none", beard: true, eyes: "sleepy" },
    { name: "Welder",   note: "Joins metal and markets alike.", gear: "visor" },
    { name: "Scout",    note: "First into every new pool.", gear: "antenna" },
    { name: "Monk",     note: "Mints rarely, holds forever.", gear: "none", eyes: "happy" },
    { name: "Rebel",    note: "Forks first, apologises never.", gear: "spikes" },
    { name: "Ancient",  note: "Was here before block one.", gear: "crown", beard: true }
  ];

  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  function traits(seed, typeIdx) {
    var r = rng(seed * 2654435761 % 4294967296);
    var t = TYPES[typeIdx];
    var gearRoll = r();
    var gear = t.gear !== "none" && gearRoll < 0.72 ? t.gear
      : pick(r, ["none", "crop", "cap", "hood", "antenna", "spikes"]);
    if (gear === "stareyes") gear = "none";
    return {
      type: typeIdx,
      bg: pick(r, BGS),
      skin: t.pale ? "#e9edf2" : pick(r, SKINS),
      hair: pick(r, HAIRS),
      cloth: pick(r, CLOTH),
      gear: gear,
      eyes: t.gear === "visor" ? "visor" : t.gear === "shades" ? "shades"
        : t.gear === "stareyes" ? "star" : t.eyes ? t.eyes
        : pick(r, ["dots", "dots", "happy", "wink", "sleepy", "dots"]),
      mouth: pick(r, ["smile", "smile", "grin", "flat", "open", "smirk"]),
      beard: t.beard ? true : r() < 0.16,
      blush: r() < 0.3,
      freckles: r() < 0.22,
      earring: r() < 0.18,
      scar: r() < 0.08
    };
  }

  function paint(canvas, seed, typeIdx) {
    if (!canvas || !canvas.getContext) return null;
    var ti = typeof typeIdx === "number" ? typeIdx : Math.abs(seed) % 20;
    var tr = traits(seed, ti);
    canvas.width = GRID * PX; canvas.height = GRID * PX;
    var c = canvas.getContext("2d");
    function px(x, y, col) { c.fillStyle = col; c.fillRect(x * PX, y * PX, PX, PX); }
    function rect(x, y, w, h, col) { c.fillStyle = col; c.fillRect(x * PX, y * PX, w * PX, h * PX); }

    /* background + speckle */
    rect(0, 0, 24, 24, tr.bg);
    var r = rng(seed ^ 0x9e3779b9);
    c.globalAlpha = 0.16;
    for (var i = 0; i < 26; i++) px(Math.floor(r() * 24), Math.floor(r() * 24), DARK);
    c.globalAlpha = 1;

    /* shoulders + collar */
    rect(3, 21, 18, 3, tr.cloth);
    rect(4, 20, 16, 1, tr.cloth);
    px(11, 21, WHITE); px(12, 21, WHITE); px(11, 22, tr.cloth); px(12, 22, tr.cloth);
    /* neck */
    rect(10, 18, 4, 3, shade(tr.skin));

    /* head */
    rect(6, 5, 12, 14, tr.skin);
    rect(7, 4, 10, 1, tr.skin);
    rect(7, 19, 10, 1, tr.skin);
    px(5, 11, tr.skin); px(5, 12, tr.skin); px(18, 11, tr.skin); px(18, 12, tr.skin); /* ears */
    if (tr.earring) px(5, 13, GOLD);

    /* beard under chin */
    if (tr.beard) {
      rect(6, 16, 2, 3, tr.hair); rect(16, 16, 2, 3, tr.hair);
      rect(8, 18, 8, 1, tr.hair); px(8, 17, tr.hair); px(15, 17, tr.hair);
    }

    /* eyes */
    var ey = 11;
    if (tr.eyes === "dots") { rect(8, ey, 2, 2, DARK); rect(14, ey, 2, 2, DARK); }
    else if (tr.eyes === "happy") { px(8, ey + 1, DARK); px(9, ey, DARK); px(10, ey + 1, DARK); px(13, ey + 1, DARK); px(14, ey, DARK); px(15, ey + 1, DARK); }
    else if (tr.eyes === "wink") { rect(8, ey, 2, 2, DARK); rect(14, ey, 2, 1, DARK); }
    else if (tr.eyes === "sleepy") { rect(8, ey + 1, 2, 1, DARK); rect(14, ey + 1, 2, 1, DARK); }
    else if (tr.eyes === "shades") { rect(6, ey - 1, 12, 3, DARK); px(8, ey, "#5a6b7a"); px(14, ey, "#5a6b7a"); }
    else if (tr.eyes === "visor") { rect(6, ey - 1, 12, 3, DARK); rect(7, ey, 10, 1, "#ff8a3d"); px(11, ey, GOLD); px(12, ey, GOLD); }
    else if (tr.eyes === "star") {
      star(9, ey); star(15, ey);
    }
    function star(cx, cy) { px(cx, cy - 1, GOLD); px(cx - 1, cy, GOLD); px(cx, cy, GOLD); px(cx + 1, cy, GOLD); px(cx, cy + 1, GOLD); }

    /* brows */
    if (tr.eyes !== "shades" && tr.eyes !== "visor") { px(8, 9, shade(tr.hair)); px(9, 9, shade(tr.hair)); px(14, 9, shade(tr.hair)); px(15, 9, shade(tr.hair)); }

    /* nose */
    px(11, 14, shade(tr.skin)); px(12, 14, shade(tr.skin));

    /* mouth */
    var my = 16;
    if (tr.mouth === "smile") { px(9, my, DARK); px(14, my, DARK); px(10, my + 1, DARK); px(11, my + 1, DARK); px(12, my + 1, DARK); px(13, my + 1, DARK); }
    else if (tr.mouth === "grin") { rect(9, my, 6, 2, DARK); rect(10, my, 4, 1, WHITE); }
    else if (tr.mouth === "flat") { rect(10, my, 4, 1, DARK); }
    else if (tr.mouth === "open") { rect(10, my, 4, 2, DARK); px(11, my + 1, "#c22f4e"); px(12, my + 1, "#c22f4e"); }
    else if (tr.mouth === "smirk") { px(11, my, DARK); px(12, my, DARK); px(13, my - 1, DARK); px(10, my + 1, DARK); }

    /* face extras */
    if (tr.blush) { px(7, 14, "#e5989b"); px(8, 14, "#e5989b"); px(15, 14, "#e5989b"); px(16, 14, "#e5989b"); }
    if (tr.freckles) { px(7, 13, shade(tr.skin)); px(16, 13, shade(tr.skin)); px(9, 13, shade(tr.skin)); px(14, 13, shade(tr.skin)); }
    if (tr.scar) { px(16, 8, shade(tr.skin)); px(16, 9, shade(tr.skin)); px(17, 10, shade(tr.skin)); }

    /* hair / headgear on top */
    var H = tr.hair;
    if (tr.gear === "crop") { rect(6, 4, 12, 2, H); rect(6, 6, 12, 1, H); px(7, 7, H); px(11, 7, H); px(16, 7, H); }
    else if (tr.gear === "mohawk") { rect(6, 4, 12, 1, tr.skin); rect(11, 0, 2, 6, H); px(10, 2, H); px(13, 2, H); px(10, 4, H); px(13, 4, H); }
    else if (tr.gear === "spikes") { px(7, 2, H); px(7, 3, H); px(10, 1, H); px(10, 2, H); px(10, 3, H); px(13, 2, H); px(13, 3, H); px(16, 2, H); px(16, 3, H); rect(6, 4, 12, 1, H); }
    else if (tr.gear === "cap") { var cap = tr.cloth; rect(6, 3, 12, 3, cap); rect(5, 6, 14, 1, cap); px(11, 2, cap); px(12, 2, cap); }
    else if (tr.gear === "hardhat") { rect(7, 2, 10, 2, GOLD); rect(6, 4, 12, 2, GOLD); rect(4, 6, 16, 1, GOLD); px(11, 1, GOLD); px(12, 1, GOLD); }
    else if (tr.gear === "crown") { px(7, 2, GOLD); px(10, 1, GOLD); px(13, 2, GOLD); px(16, 1, GOLD); rect(6, 3, 12, 2, GOLD); px(11, 3, "#c22f4e"); px(12, 3, "#c22f4e"); }
    else if (tr.gear === "antenna") { px(12, 1, DARK); px(12, 2, DARK); px(12, 3, DARK); px(11, 0, "#f2541b"); px(12, 0, GOLD); px(13, 0, "#f2541b"); rect(6, 4, 12, 1, H); }
    else if (tr.gear === "halo") { rect(8, 1, 8, 1, GOLD); px(7, 2, GOLD); px(16, 2, GOLD); }
    else if (tr.gear === "hood") {
      var hd = tr.cloth;
      rect(4, 3, 16, 2, hd); rect(4, 5, 2, 14, hd); rect(18, 5, 2, 14, hd); rect(4, 19, 3, 1, hd); rect(17, 19, 3, 1, hd);
    }
    return tr;
  }

  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, ((n >> 16) & 255) - 38), g = Math.max(0, ((n >> 8) & 255) - 38), b = Math.max(0, (n & 255) - 38);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  window.FoundryFaces = {
    TYPES: TYPES,
    paint: paint,
    hash: hashStr,
    typeName: function (seed) { return TYPES[Math.abs(seed) % 20].name; }
  };
})();
