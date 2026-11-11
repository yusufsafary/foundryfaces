/* Foundry Faces live board.
   Reads totalMinted() and mintOpen() from the NFT contract by racing
   public BSC RPC endpoints, then fills every counter on the page.
   With a placeholder (zero) contract the board stays in SOON mode. */
(function () {
  var CFG = window.FOUNDRY_CONFIG || {};
  var NFT = CFG.CONTRACT || "";
  var SUPPLY = CFG.SUPPLY || 11111;
  var RPCS = CFG.RPCS || [];
  var ZERO = "0x0000000000000000000000000000000000000000";

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return n.toLocaleString("en-US"); }

  function setText(id, txt) { var el = $(id); if (el) el.textContent = txt; }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tweens = {};
  function setNum(id, to) {
    var el = $(id);
    if (!el) return;
    if (reduceMotion) { el.textContent = fmt(to); return; }
    var from = parseInt((el.textContent || "").replace(/[^0-9]/g, ""), 10);
    if (isNaN(from)) from = 0;
    if (tweens[id]) cancelAnimationFrame(tweens[id]);
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 650);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (p < 1) tweens[id] = requestAnimationFrame(step);
    }
    tweens[id] = requestAnimationFrame(step);
  }

  function soonMode() {
    setText("b-status", "SOON");
    setText("h-status", "SOON");
    setText("b-note", "Mint is not open yet. Contract publishes soon. Get your agent ready.");
  }

  function applyState(minted, open) {
    var left = Math.max(0, SUPPLY - minted);
    setNum("b-minted", minted);
    setNum("h-minted", minted);
    setNum("b-left", left);
    if (!open) {
      setText("b-status", minted > 0 ? "PAUSED" : "SOON");
      setText("h-status", minted > 0 ? "PAUSED" : "SOON");
      setText("b-note", "Mint is not open yet. Watch this board and get your agent ready.");
    } else if (minted >= SUPPLY) {
      setText("b-status", "SOLD OUT");
      setText("h-status", "SOLD OUT");
      setText("b-note", "All 11,111 faces are forged. Holder token phase comes next.");
    } else {
      setText("b-status", "LIVE");
      setText("h-status", "LIVE");
      setText("b-note", "Mint is live. Send your Binance agent a prompt below and forge your face.");
    }
  }

  function raceRead() {
    if (!NFT || NFT.toLowerCase() === ZERO) { soonMode(); return; }
    var calls = [
      { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: NFT, data: "0xa2309ff8" }, "latest"] }, // totalMinted()
      { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: NFT, data: "0x24bbd049" }, "latest"] }  // mintOpen()
    ];
    var done = false;
    var pending = RPCS.length;
    RPCS.forEach(function (url) {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calls)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (done || !j || !Array.isArray(j)) return;
        var m = j.find(function (x) { return x.id === 1; });
        var o = j.find(function (x) { return x.id === 2; });
        if (m && m.result && m.result !== "0x") {
          done = true;
          var minted = parseInt(m.result, 16);
          var open = !!(o && o.result && parseInt(o.result, 16) === 1);
          applyState(minted, open);
        }
      }).catch(function () {}).finally(function () {
        pending -= 1;
        if (!done && pending === 0) soonMode();
      });
    });
  }

  if (!NFT || NFT.toLowerCase() === ZERO) soonMode();
  raceRead();
  setInterval(raceRead, 30000);
})();
