(function () {
  function ready(cb) {
    if (window.OQ) return cb(window.OQ);
    setTimeout(function () { ready(cb); }, 80);
  }

  ready(function (OQ) {
    function tx(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

    var ACH_NAMES = { half_way: 'Жарты жол', legend: 'Ойын жеңімпазы', star_50: '50 жұлдыз' };

    function renderAvatarPicker(u) {
      var wrap = document.getElementById('avatar-picks');
      var msg = document.getElementById('ava-msg');
      if (!wrap) return;
      wrap.classList.add('stagger-grid');

      function setMsg(kind, text) {
        if (!msg) return;
        msg.className = 'form-hint' + (kind ? (' ' + kind) : '');
        msg.textContent = text || '';
      }

      OQ.apiGet('/api/shop/my-rewards').then(function (d) {
        var rewards = (d && d.rewards) ? d.rewards : [];
        var owned = {};
        rewards.forEach(function (r) { owned[r.item_id] = true; });

        var picks = [
          { id: 1, name: 'Көк', sub: 'Тегін', requires: null },
          { id: 4, name: 'Күлгін', sub: 'Тегін', requires: null },
          { id: 2, name: 'Номад', sub: owned.avatar_nomad ? 'Дүкен' : 'Сатып алу керек', requires: 'avatar_nomad' },
          { id: 3, name: 'Алтын батыр', sub: owned.avatar_golden ? 'Дүкен' : 'Сатып алу керек', requires: 'avatar_golden' },
        ];

        wrap.innerHTML = picks.map(function (p) {
          var av = OQ.getAvatar(p.id);
          var on = (parseInt(u.avatar_id, 10) || 1) === p.id;
          var locked = p.requires && !owned[p.requires];
          return "<button class='ava-pick stagger-item" + (on ? " on" : "") + "' data-avid='" + p.id + "' " + (locked ? "disabled" : "") + ">" +
            "<span class='ava-ico ava-bg-" + p.id + "'>" + av.emoji + "</span>" +
            "<span class='ava-meta'><span class='ava-name'>" + p.name + "</span><span class='ava-sub'>" + p.sub + "</span></span>" +
          "</button>";
        }).join("");

        wrap.querySelectorAll('[data-avid]').forEach(function (b) {
          b.addEventListener('click', function () {
            var id = parseInt(b.getAttribute('data-avid'), 10) || 1;
            setMsg('', '');
            b.disabled = true;
            OQ.apiPost('/api/user/update-avatar', { avatarId: id }).then(function (d2) {
              b.disabled = false;
              if (!d2 || !d2.ok) return setMsg('bad', (d2 && d2.message) ? d2.message : 'Қате');
              OQ.setCurrentUser(d2.user);
              applyUser(d2.user);
              setMsg('ok', 'Аватар жаңартылды');
            }).catch(function () {
              b.disabled = false;
              setMsg('bad', 'Сервермен байланыс жоқ');
            });
          });
        });
      }).catch(function () {
        wrap.innerHTML = "<div class='cos-empty'>Аватар жүктелмеді</div>";
      });
    }

    function renderTransactions() {
      var el = document.getElementById('tx-list');
      if (!el) return;
      el.classList.add('stagger-grid');

      function fmtDt(s) {
        if (!s) return '';
        return String(s).replace('T', ' ').slice(0, 16);
      }

      OQ.apiGet('/api/user/transactions').then(function (d) {
        if (!d || !d.ok) { el.innerHTML = "<div class='ach-empty'>Транзакциялар жүктелмеді</div>"; return; }
        var list = d.transactions || [];
        if (!list.length) { el.innerHTML = "<div class='ach-empty'>Әзірге транзакция жоқ</div>"; return; }
        el.innerHTML = list.map(function (t) {
          var isEarn = t.type === 'earn';
          var ico = isEarn ? '&#x2795;' : '&#x2796;';
          var amt = (isEarn ? '+' : '-') + (t.amount || 0);
          return "<div class='tx-row stagger-item'>" +
            "<div class='tx-ico'>" + ico + "</div>" +
            "<div class='tx-main'><div class='tx-title'>" + (t.reason || '') + "</div>" +
            "<div class='tx-sub'>" + fmtDt(t.created_at) + "</div></div>" +
            "<div class='tx-amt " + (isEarn ? "pos" : "neg") + "'>&#x1FA99; " + amt + "</div>" +
          "</div>";
        }).join("");
      }).catch(function () {
        el.innerHTML = "<div class='ach-empty'>Сервермен байланыс жоқ</div>";
      });
    }

    function renderCosmetics(u) {
      var c = document.getElementById('cosmetics');
      if (!c) return;
      c.classList.add('stagger-grid');
      var owned = [];
      OQ.apiGet('/api/shop/my-rewards').then(function (d) {
        owned = (d && d.rewards) ? d.rewards.filter(function (r) { return r.qr_code === 'VIRTUAL_ITEM'; }) : [];
        var byId = {};
        owned.forEach(function (r) { byId[r.item_id] = r; });

        var items = [
          { slot: 'avatar', label: 'Аватар', options: ['avatar_nomad', 'avatar_golden'] },
          { slot: 'frame', label: 'Жақтау', options: ['frame_gold'] },
          { slot: 'skin', label: 'Скин', options: ['skin_caravan'] },
        ];

        c.innerHTML = items.map(function (it) {
          var current = it.slot === 'avatar' ? (u.equipped_avatar || '') : it.slot === 'frame' ? (u.equipped_frame || '') : (u.equipped_skin || '');
          var buttons = it.options.map(function (id) {
            var has = !!byId[id];
            var on = current === id;
            var title = id === 'avatar_nomad' ? 'Номад аватары' :
                        id === 'avatar_golden' ? 'Алтын батыр аватары' :
                        id === 'frame_gold' ? 'Алтын жақтау' :
                        id === 'skin_caravan' ? 'Керуен скині' : id;
            var txt = on ? 'Қолданыста' : (has ? 'Қолдану' : 'Жоқ');
            return "<button class='btn btn-ghost btn-sm cos-btn' data-slot='" + it.slot + "' data-item='" + id + "' " + (has && !on ? "" : "disabled") + ">" + title + " · " + txt + "</button>";
          }).join(" ");
          var resetBtn = "<button class='btn btn-ghost btn-sm cos-reset' data-slot='" + it.slot + "' " + (current ? "" : "disabled") + ">Әдепкіге қайтару</button>";
          return "<div class='cos-row stagger-item'>" +
            "<div class='cos-title'>" + it.label + "</div>" +
            "<div class='cos-actions'>" + buttons + resetBtn + "</div>" +
          "</div>";
        }).join("");

        c.querySelectorAll('.cos-btn').forEach(function (b) {
          b.addEventListener('click', function () {
            var slot = b.getAttribute('data-slot');
            var itemId = b.getAttribute('data-item');
            b.disabled = true;
            OQ.apiPost('/api/user/equip', { type: slot, itemId: itemId }).then(function (d2) {
              if (!d2 || !d2.ok) { b.disabled = false; return OQ.Toast.error((d2 && d2.message) ? d2.message : 'Қате'); }
              OQ.setCurrentUser(d2.user);
              applyUser(d2.user);
              OQ.Toast.success('Сәтті қолданылды');
            }).catch(function () { b.disabled = false; OQ.Toast.error('Сервермен байланыс жоқ'); });
          });
        });
        c.querySelectorAll('.cos-reset').forEach(function (b) {
          b.addEventListener('click', function () {
            var slot = b.getAttribute('data-slot');
            b.disabled = true;
            OQ.apiPost('/api/user/equip', { type: slot, itemId: null }).then(function (d2) {
              if (!d2 || !d2.ok) { b.disabled = false; return OQ.Toast.error((d2 && d2.message) ? d2.message : 'Қате'); }
              OQ.setCurrentUser(d2.user);
              applyUser(d2.user);
              OQ.Toast.success('Әдепкіге қайтарылды');
            }).catch(function () { b.disabled = false; OQ.Toast.error('Сервермен байланыс жоқ'); });
          });
        });
      }).catch(function () {
        c.innerHTML = "<div class='cos-empty'>Сәндеу жүктелмеді</div>";
      });
    }

    function applyUser(u) {
      OQ.setCurrentUser(u);
      var sb = document.getElementById('sb-ava'); if (sb) OQ.applyCosmeticsTo(sb, u);
      var pa = document.getElementById('prof-ava'); if (pa) OQ.applyCosmeticsTo(pa, u);
      var ne = document.getElementById('name-edit'); if (ne) ne.value = u.name || '';
      tx('sb-name', u.name);
      tx('sb-coins', (u.coins || 0).toLocaleString());
      tx('sb-streak', u.streak || 0);
      tx('prof-name', u.name);
      tx('prof-phone', u.phone || '');
      tx('ps-coins', (u.coins || 0).toLocaleString());
      tx('ps-streak', u.streak || 0);
    }

    function init() {
      OQ.apiGet('/api/user/me').then(function (d) {
        if (!d || !d.ok) { window.location.href = '/'; return; }
        var u = d.user, prog = d.progress || [], ach = d.achievements || [];
        applyUser(u);
        tx('ps-stars', d.totalStars || 0);
        tx('total-sc', (d.totalScore || 0) + ' ұпай');

        var pm = {}; prog.forEach(function (p) { pm[p.game_id] = p; });
        var pl = document.getElementById('prog-list');
        if (pl) pl.classList.add('stagger-grid');
        if (pl) pl.innerHTML = OQ.GAMES.map(function (g) {
          var p = pm[g.id] || { max_level_reached: 1 };
          var done = Math.max(0, p.max_level_reached - 1);
          var pct = Math.round(done / g.max * 100);
          return "<div class='plist-row stagger-item'>" +
            "<div class='plist-ico'>" + g.ico + "</div>" +
            "<div class='plist-body'><div class='plist-name'>" + g.kaz + "</div>" +
            "<div class='plist-track'><div class='plist-fill' data-pct='" + pct + "'></div></div></div>" +
            "<span class='plist-meta'>" + done + " / " + g.max + "</span></div>";
        }).join("");
        if (pl) {
          pl.querySelectorAll('.plist-fill').forEach(function (fg) {
            var pct = parseInt(fg.getAttribute('data-pct'), 10);
            if (!isFinite(pct)) pct = 0;
            fg.style.width = Math.max(0, Math.min(100, pct)) + "%";
          });
        }

        var al = document.getElementById('ach-list');
        if (al) {
          al.classList.add('stagger-grid');
          if (ach.length) {
            al.innerHTML = ach.map(function (a) {
              var tName = ACH_NAMES[a.achieve_id] || a.achieve_id;
              return "<div class='ach-row stagger-item'>" +
                "<span class='ach-ico'>&#x1F3C5;</span><div><div class='ach-name'>" + tName + "</div>" +
                "<div class='ach-sub'>Марапат алынды!</div></div></div>";
            }).join("");
          } else {
            al.innerHTML = "<div class='ach-empty'>Ойын ойнап марапат жинай бастаңыз!</div>";
          }
        }

        renderCosmetics(u);
        renderAvatarPicker(u);
        renderTransactions();
      }).catch(function () { window.location.href = '/'; });

      var ns = document.getElementById('name-save');
      var ne = document.getElementById('name-edit');
      var nm = document.getElementById('name-msg');
      function setNameMsg(kind, text) {
        if (!nm) return;
        nm.className = 'form-hint' + (kind ? (' ' + kind) : '');
        nm.textContent = text || '';
      }
      function saveName() {
        if (!ne || !ns) return;
        var v = (ne.value || '').trim();
        if (!v) return setNameMsg('bad', 'Атыңызды енгізіңіз');
        if (v.length > 40) return setNameMsg('bad', 'Атыңыз тым ұзын');
        ns.disabled = true;
        setNameMsg('', '');
        OQ.apiPost('/api/user/update-name', { name: v }).then(function (d) {
          ns.disabled = false;
          if (!d || !d.ok) return setNameMsg('bad', (d && d.message) ? d.message : 'Қате');
          var cu = (window.OQ && window.OQ.currentUser) ? window.OQ.currentUser : {};
          cu.name = v;
          OQ.setCurrentUser(cu);
          tx('sb-name', v);
          tx('prof-name', v);
          setNameMsg('ok', 'Сақталды');
        }).catch(function () {
          ns.disabled = false;
          setNameMsg('bad', 'Сервермен байланыс жоқ');
        });
      }
      if (ns) ns.addEventListener('click', saveName);
      if (ne) ne.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveName(); });
      if (ne) ne.addEventListener('input', function () { setNameMsg('', ''); });

      var lb = document.getElementById('logout-btn');
      if (lb) lb.addEventListener('click', function () {
        OQ.apiPost('/api/auth/logout').then(function () { window.location.href = '/'; }).catch(function () { window.location.href = '/'; });
      });
    }

    init();
  });
})();
