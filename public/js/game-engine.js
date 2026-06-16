(function () {
  var cur = 1, max = 10, gameId = "", startTime = 0;
  var modal, titleEl, starsEl, coinEl, nextBtn, retryBtn, scoreEl, lvlEl, xpFill, shopBtn;
  var tutModal, tutTitle, tutText, tutOk;
  function q(id) { return document.getElementById(id); }
  var TUTORIALS = {
    nomad: { title: "Keruen Zholy", text: "Бұйрықтар тізбегін құрастырыңыз: «Алға», «Солға», «Оңға». Мақсат — жалаушаға ең қысқа әрі қатесіз жету." },
    tamga: { title: "Tamba Shesher", text: "Берілген шарттан дұрыс мәнді табыңыз. Жауапты таңдаңыз. Кеңес қолдансаңыз, ұпай азаяды." },
    labirint: { title: "Otyrar Labirinti", text: "Лабиринттен шығатын жолды табыңыз. Әр қадам маңызды: асықпай жоспарлаңыз." },
    qamal: { title: "Qorgan", text: "Жәшіктерді белгіленген орындарға жылжытыңыз. Барлық жәшік орнына қойылғанда деңгей аяқталады." },
    estek: { title: "Zhady", text: "Екі бірдей карточканы табыңыз. Қателеспей, мүмкіндігінше жылдам сәйкестендіріңіз." },
    altyn: { title: "Altyn Adam", text: "Тапсырманы мұқият орындаңыз. Дұрыс шешім — көбірек жұлдыз бен монета." },
    dialog: { title: "Ulagat", text: "Сұраққа дұрыс жауап беріңіз. Дәлдік пен тұрақтылық нәтиже береді." },
    baiterek: { title: "Baiterek Zharys", text: "Сұрақтарға жауап беріңіз. Уақыт шектеулі: жылдамдық бонус береді." },
    expo: { title: "San Alemi", text: "Сандар мен өрнектерді шешіңіз. Дұрыс шешім үшін ұпай өседі." },
    cyber: { title: "Kiberqalqan", text: "Логикалық тапсырмаларды шешіп, деңгейді аяқтаңыз. Қате аз болса — жұлдыз көп." },
    qala: { title: "Qala Bileti", text: "Қалалар мен деректерді сәйкестендіріңіз. Бір қадам алға — бір қадам білім." },
    soztorr: { title: "Soztorr", text: "Жасырын сөзді табыңыз. Әр қате әріпті азайтады. Кеңес бір әріпті ашып береді." }
  };

  function showTutorialIfNeeded() {
    if (!tutModal || !tutOk || !tutTitle || !tutText) return;
    var key = "oq_tutorial_" + gameId;
    if (localStorage.getItem(key) === "1") return;
    var t = TUTORIALS[gameId];
    if (!t) return;
    tutTitle.textContent = t.title;
    tutText.textContent = t.text;
    tutModal.classList.remove("hidden");
    tutOk.onclick = function () {
      localStorage.setItem(key, "1");
      tutModal.classList.add("hidden");
    };
  }

  function ready() {
    modal = q("result-modal"); titleEl = q("result-title"); starsEl = q("result-stars"); coinEl = q("coins-earned");
    nextBtn = q("next-lvl-btn"); retryBtn = q("retry-btn"); scoreEl = q("game-score"); lvlEl = q("game-lvl-label");
    xpFill = q("lvl-progress");
    shopBtn = q("shop-btn");
    tutModal = q("tutorial-modal"); tutTitle = q("tutorial-title"); tutText = q("tutorial-text"); tutOk = q("tutorial-ok");
    var bb = q("back-btn"); if (bb) bb.addEventListener("click", function () { window.location.href = "/dashboard"; });
    if (shopBtn) shopBtn.onclick = function () { window.location.href = "/shop"; };
    var params = new URLSearchParams(window.location.search);
    cur = parseInt(params.get("lvl")) || 1;
    gameId = location.pathname.split("/").pop();
    fetchProgress();
  }
  function fetchProgress() {
    var OQ = window.OQ; if (!OQ) { setTimeout(fetchProgress, 80); return; }
    OQ.apiGet("/api/user/me").then(function (d) {
      if (!d.ok) { window.location.href = "/"; return; }
      if (OQ.setCurrentUser) OQ.setCurrentUser(d.user);
      var c = q("hdr-coins-g"); if (c) c.textContent = (d.user.coins || 0);
      var prog = (d.progress || []).find(function (p) { return p.game_id === gameId; });
      var gameMeta = OQ.GAMES.find(function (g) { return g.id === gameId; });
      max = gameMeta ? gameMeta.max : 10;
      if (prog) cur = Math.max(1, Math.min(prog.current_level || 1, max));
      var title = gameMeta ? gameMeta.kaz : gameId;
      var gTitle = q("game-title"); if (gTitle) gTitle.textContent = title;
      updateLevelLabel();
      showTutorialIfNeeded();
      startGame();
    }).catch(function () { startGame(); });
  }
  function startGame() {
    var mod = window.GameModules;
    if (!mod || !mod[gameId]) {
      var c = q("game-container"); if (c) c.innerHTML = "<div class='game-missing'><div class='game-missing-ico'>&#x1F6A7;</div><p class='game-missing-txt'>Ойын табылмады: " + gameId + "</p></div>";
      return;
    }
    startTime = Date.now();
    try { mod[gameId].startLevel(cur); } catch (e) { var c2 = q("game-container"); if (c2) c2.innerHTML = "<div class='game-error'>Қате: " + e.message + "</div>"; }
  }
  function updateLevelLabel() {
    if (lvlEl) lvlEl.textContent = cur + "-деңгей / " + max;
    if (xpFill) xpFill.style.width = Math.round((cur - 1) / max * 100) + "%";
  }
  function setScore(v) { if (scoreEl) scoreEl.textContent = Math.max(0, v); }
  function approxEarnedCoins(level, stars, isFast) {
    var L = Math.max(1, Math.min(10, level || 1));
    var base = 18 + L * 3;
    var starsCoins = stars === 3 ? 36 : stars === 2 ? 24 : 12;
    var speed = isFast ? (L <= 3 ? 6 : L <= 7 ? 10 : 14) : 0;
    return base + starsCoins + speed;
  }
  function completeLevel(stars) {
    stars = Math.max(1, Math.min(3, stars || 1));
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var isFast = elapsed < 30;
    var OQ = window.OQ; if (!OQ) return;
    OQ.apiPost("/api/games/complete", { gameId: gameId, lvl: cur, stars: stars, fast: isFast }).then(function (d) {
      if (!d || !d.ok) {
        if (OQ.Toast) OQ.Toast.error((d && d.message) ? d.message : "Қате");
        fetchProgress();
        return;
      }
      if (d.earnedCoins) { OQ.showCoinAnim(d.earnedCoins); if (coinEl) coinEl.textContent = d.earnedCoins; }
      showResult(stars, true);
    }).catch(function () {
      if (OQ.Toast) OQ.Toast.error("Сервермен байланыс жоқ");
      showResult(stars, false);
    });
  }
  function showResult(stars, canAdvance) {
    if (!modal) return;
    var emojis = ["&#x1F622;", "&#x1F44D;", "&#x1F3C6;"];
    var titles = ["Жаман емес! Қайта көріңіз", "Жақсы! Жалғастырыңыз", "Тамаша! Жеңдіңіз!"];
    var bigEmo = q("result-big-emoji"); if (bigEmo) bigEmo.innerHTML = emojis[stars - 1];
    if (titleEl) titleEl.textContent = titles[stars - 1];
    var sNodes = starsEl ? starsEl.querySelectorAll(".res-star") : [];
    sNodes.forEach(function (s, i) { s.className = "res-star"; });
    sNodes.forEach(function (s, i) { setTimeout(function () { if (i < stars) s.className = "res-star on"; }, i * 200); });
    if (!coinEl || !coinEl.textContent || coinEl.textContent === "0") if (coinEl) coinEl.textContent = approxEarnedCoins(cur, stars, (Math.floor((Date.now() - startTime) / 1000) < 30));
    var isLast = cur >= max;
    if (nextBtn) {
      nextBtn.style.display = (canAdvance === false) ? "none" : "";
      nextBtn.textContent = isLast ? "Барлық ойындар &#x1F3E0;" : "Келесі деңгей &#x2192;";
      nextBtn.innerHTML = nextBtn.textContent;
    }
    if (nextBtn) {
      nextBtn.onclick = function () {
        if (canAdvance === false) return;
        if (isLast) window.location.href = "/dashboard";
        else { cur++; updateLevelLabel(); modal.classList.add("hidden"); startGame(); }
      };
    }
    retryBtn.onclick = function () { modal.classList.add("hidden"); startGame(); };
    modal.classList.remove("hidden");
  }
  window.GameEngine = {
    updateLevelLabel: updateLevelLabel,
    setScore: setScore,
    completeLevel: completeLevel,
    getCurrentLevel: function () { return cur; },
    getMaxLevel: function () { return max; }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
