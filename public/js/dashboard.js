(function () {
  var OQ; function w() { if (!window.OQ) { setTimeout(w, 80); return; } OQ = window.OQ; init(); }
  function tx(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
  function init() {
    OQ.apiGet("/api/user/me").then(function (d) {
      if (!d.ok) { window.location.href = "/"; return; }
      var u = d.user, prog = d.progress || [];
      OQ.setCurrentUser(u);
      var ava = document.getElementById("sb-ava"); if (ava) OQ.applyCosmeticsTo(ava, u);
      tx("sb-name", u.name); tx("sb-coins", (u.coins || 0).toLocaleString()); tx("hdr-coins", (u.coins || 0).toLocaleString());
      tx("sb-streak", u.streak || 0);
      var hr = new Date().getHours();
      var gr = hr < 12 ? "Қайырлы таң" : (hr < 18 ? "Қайырлы күн" : "Қайырлы кеш");
      tx("topbar-greet", gr + ", " + u.name + " \uD83D\uDC4B");
      tx("sc-coins", (u.coins || 0).toLocaleString()); tx("sc-stars", d.totalStars || 0); tx("sc-streak", u.streak || 0);
      var pm = {}; prog.forEach(function (p) { pm[p.game_id] = p; });
      var tMax = OQ.GAMES.reduce(function (s, g) { return s + g.max; }, 0);
      var tDone = prog.reduce(function (s, p) { return s + Math.max(0, p.max_level_reached - 1); }, 0);
      var gf = prog.filter(function (p) { return p.max_level_reached > 1; }).length;
      var pct = Math.round(tDone / tMax * 100);
      tx("xp-pct", pct + "%"); tx("lvl-done", tDone); tx("stars-total", d.totalStars || 0); tx("sc-games", gf);
      setTimeout(function () { var f = document.getElementById("xp-fg"); if (f) f.style.width = pct + "%"; }, 100);
      renderGames(pm);
    }).catch(function () { window.location.href = "/"; });
  }
  function renderGames(pm) {
    var grid = document.getElementById("games-grid"); if (!grid) return; grid.innerHTML = ""; grid.classList.add("stagger-grid");
    OQ.GAMES.forEach(function (game, idx) {
      var p = pm[game.id] || { max_level_reached: 1, stars_earned: 0 };
      var done = Math.max(0, p.max_level_reached - 1);
      var pct = Math.round(done / game.max * 100);
      var stars = done > 0 ? Math.round(p.stars_earned / done) : 0;
      var starsHtml = "<span class='gc-stars'>";
      for (var i = 0; i < 3; i++) starsHtml += "<span class='gc-star" + (i < stars ? " on" : "") + "'>&#9733;</span>";
      starsHtml += "</span>";
      var a = document.createElement("a");
      a.href = "/game/" + game.id; a.className = "gc stagger-item";
      a.innerHTML =
        "<div class='gc-top'>" +
          "<div class='gc-ico'>" + game.ico + "</div>" +
          "<div class='gc-body'>" +
            "<div class='gc-name'>" + game.kaz + "</div>" +
            "<div class='gc-desc'>" + game.desc + "</div>" +
            (done === 0 ? "<div class='mt-3'><span class='gc-new'>ЖАҢА</span></div>" : "") +
          "</div>" +
        "</div>" +
        "<div class='gc-meta'>" +
          "<div class='gc-bar-wrap'>" +
            "<div class='gc-lvl'><span>" + done + " / " + game.max + " Деңгей</span><span>" + starsHtml + "</span></div>" +
            "<div class='gc-bar-bg'><div class='gc-bar-fg'></div></div>" +
          "</div>" +
          "<div class='gc-status'>&#8594;</div>" +
        "</div>";
      grid.appendChild(a);
      var ico = a.querySelector(".gc-ico"); if (ico) ico.style.background = game.bg;
      var fg = a.querySelector(".gc-bar-fg"); if (fg) { fg.style.width = pct + "%"; fg.style.background = game.color; }
    });
  }
  w();
})();
