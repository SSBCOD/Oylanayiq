(function () {
  function ready(cb) {
    if (window.OQ) return cb(window.OQ);
    setTimeout(function () { ready(cb); }, 80);
  }

  ready(function (OQ) {
    var allItems = [];
    var ownedItemIds = [];
    var selectedItem = null;
    var currentCat = 'all';
    var userCoins = 0;

    function tx(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

    function init() {
      OQ.apiGet('/api/user/me').then(function (d) {
        if (!d || !d.ok) { window.location.href = '/'; return; }
        var u = d.user;
        OQ.setCurrentUser(u);
        userCoins = u.coins || 0;
        var sa = document.getElementById('sb-ava'); if (sa) OQ.applyCosmeticsTo(sa, u);
        tx('sb-name', u.name);
        tx('sb-coins', userCoins.toLocaleString());
        tx('sb-streak', u.streak || 0);
        tx('hdr-coins', userCoins.toLocaleString());
        tx('balance-coins', userCoins.toLocaleString());
      }).catch(function () { window.location.href = '/'; });

      OQ.apiGet('/api/shop/items').then(function (d) {
        if (!d || !d.ok) return;
        allItems = d.items || [];
        ownedItemIds = d.ownedItemIds || [];
        userCoins = d.userCoins || userCoins;
        tx('hdr-coins', userCoins.toLocaleString());
        tx('balance-coins', userCoins.toLocaleString());
        tx('items-count', allItems.length ? (allItems.length + ' түр') : '0');
        renderItems();
      }).catch(function () {
        OQ.Toast.error('Дүкен жүктелмеді');
      });

      OQ.apiGet('/api/shop/my-rewards').then(function (d) {
        renderRewards((d && d.rewards) ? d.rewards : []);
      }).catch(function () {
        renderRewards([]);
      });
    }

    function isVirtualOwned(item) {
      if (!item || item.category !== 'virtual') return false;
      return ownedItemIds.indexOf(item.id) !== -1;
    }

    function renderItems() {
      var grid = document.getElementById('shop-grid'); if (!grid) return;
      var filtered = currentCat === 'all' ? allItems : allItems.filter(function (i) { return i.category === currentCat; });
      grid.classList.add('stagger-grid');

      if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state">Марапат табылмады</div>';
        return;
      }

      grid.innerHTML = filtered.map(function (item) {
        var ownedVirtual = isVirtualOwned(item);
        var canAfford = userCoins >= item.price;
        var disabled = ownedVirtual || !canAfford;
        var badge = ownedVirtual ? '<span class="shop-badge">Сатып алынған</span>' : (item.category === 'virtual' ? '<span class="shop-badge">Виртуалды</span>' : '<span class="shop-badge">Нақты</span>');
        var cardClass = 'shop-card stagger-item' + (disabled ? ' disabled' : '');
        var priceClass = 'shop-price' + (disabled ? ' dim' : '');
        return [
          '<div class="', cardClass, '" data-id="', item.id, '" data-disabled="', disabled ? '1' : '0', '">',
            '<div class="shop-row">',
              '<div class="shop-ico">', (item.icon || '🎁'), '</div>',
              '<div class="shop-main">',
                '<div class="shop-name">', item.name, '</div>',
                '<div class="shop-cat">', badge, '</div>',
              '</div>',
            '</div>',
            '<div class="shop-foot">',
              '<div class="', priceClass, '">&#x1FA99; ', item.price, '</div>',
              '<button class="btn btn-blue btn-sm shop-buy-btn" ', (disabled ? 'disabled' : ''), '>',
                ownedVirtual ? 'Алынды' : 'Сатып алу',
              '</button>',
            '</div>',
          '</div>'
        ].join('');
      }).join('');

      grid.querySelectorAll('.shop-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
          var id = card.getAttribute('data-id');
          var item = allItems.find(function (x) { return x.id === id; });
          if (!item) return;

          if (card.getAttribute('data-disabled') === '1') {
            if (isVirtualOwned(item)) return OQ.Toast.info('Бұл виртуалды марапат бұрын сатып алынған');
            return OQ.Toast.error('Монета жеткіліксіз');
          }

          openModal(item);
        });
      });
    }

    function renderRewards(rewards) {
      var list = document.getElementById('rewards-list');
      if (!list) return;
      list.classList.add('stagger-grid');
      tx('rewards-count', rewards.length);

      if (!rewards.length) {
        list.innerHTML = '<div class="empty-state">Әзірге марапат жоқ. Ойын ойнап, монета жинаңыз!</div>';
        return;
      }

      var u = OQ.currentUser || {};
      list.innerHTML = rewards.map(function (r) {
        var isVirtual = r.qr_code === 'VIRTUAL_ITEM';
        var isEquipped = isVirtual && (r.item_id === u.equipped_avatar || r.item_id === u.equipped_frame || r.item_id === u.equipped_skin);
        var statusText = r.redeemed ? 'Пайдаланылды' : 'Белсенді';
        var statusClass = r.redeemed ? 'bad' : 'ok';
        var code = r.qr_code && r.qr_code !== 'VIRTUAL_ITEM' ? r.qr_code : '';
        return [
          '<div class="reward-row stagger-item">',
            '<div class="reward-main">',
              '<div class="reward-title">', r.item_name, '</div>',
              (code ? '<div class="reward-code">' + code + '</div>' : '<div class="reward-sub">Виртуалды марапат</div>'),
            '</div>',
            '<div class="reward-actions">',
              (isVirtual ? ('<button class="btn btn-ghost btn-sm equip-btn" data-item="' + r.item_id + '" ' + (isEquipped ? 'disabled' : '') + '>' + (isEquipped ? 'Қолданыста' : 'Қолдану') + '</button>') : ''),
              '<span class="reward-pill ', statusClass, '">', statusText, '</span>',
            '</div>',
          '</div>'
        ].join('');
      }).join('');

      list.querySelectorAll('.equip-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          var itemId = b.getAttribute('data-item');
          var type = itemId.indexOf('avatar_') === 0 ? 'avatar' : itemId.indexOf('frame_') === 0 ? 'frame' : 'skin';
          b.disabled = true;
          OQ.apiPost('/api/user/equip', { type: type, itemId: itemId }).then(function (d) {
            if (!d || !d.ok) { b.disabled = false; return OQ.Toast.error((d && d.message) ? d.message : 'Қате'); }
            OQ.setCurrentUser(d.user);
            var sa = document.getElementById('sb-ava'); if (sa) OQ.applyCosmeticsTo(sa, d.user);
            OQ.Toast.success('Сәтті қолданылды');
            init();
          }).catch(function () { b.disabled = false; OQ.Toast.error('Сервермен байланыс жоқ'); });
        });
      });
    }

    function openModal(item) {
      selectedItem = item;
      var icon = document.getElementById('buy-icon'); if (icon) icon.textContent = item.icon || '🎁';
      var nm = document.getElementById('buy-item-name'); if (nm) nm.textContent = item.name;
      var desc = document.getElementById('buy-desc'); if (desc) desc.textContent = item.category === 'virtual' ? 'Бұл марапат бір рет қана сатып алынады.' : 'Сатып алғаннан кейін код беріледі.';
      var pr = document.getElementById('buy-price'); if (pr) pr.textContent = '🪙 ' + item.price;
      var modal = document.getElementById('buy-modal'); if (modal) modal.classList.remove('hidden');
      var confirm = document.getElementById('confirm-buy-btn'); if (confirm) confirm.focus();
    }

    function closeBuyModal() {
      var modal = document.getElementById('buy-modal'); if (modal) modal.classList.add('hidden');
      selectedItem = null;
    }

    function closeQrModal() {
      var m = document.getElementById('qr-modal'); if (m) m.classList.add('hidden');
    }

    var buyOverlay = document.getElementById('buy-modal');
    if (buyOverlay) buyOverlay.addEventListener('click', function (e) {
      if (e.target === buyOverlay) closeBuyModal();
    });

    var qrOverlay = document.getElementById('qr-modal');
    if (qrOverlay) qrOverlay.addEventListener('click', function (e) {
      if (e.target === qrOverlay) closeQrModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (buyOverlay && !buyOverlay.classList.contains('hidden')) closeBuyModal();
      if (qrOverlay && !qrOverlay.classList.contains('hidden')) closeQrModal();
    });

    document.querySelectorAll('.shop-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.shop-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCat = btn.getAttribute('data-cat') || 'all';
        renderItems();
      });
    });

    var cancel = document.getElementById('cancel-buy-btn');
    if (cancel) cancel.addEventListener('click', closeBuyModal);

    var confirm = document.getElementById('confirm-buy-btn');
    if (confirm) confirm.addEventListener('click', function () {
      if (!selectedItem) return;
      confirm.disabled = true;
      var prevText = confirm.textContent;
      confirm.textContent = 'Өңделуде...';

      OQ.apiPost('/api/shop/buy', { itemId: selectedItem.id }).then(function (d) {
        confirm.disabled = false;
        confirm.textContent = prevText;
        if (!d || !d.ok) {
          OQ.Toast.error((d && d.message) ? d.message : 'Қате орын алды');
          return;
        }

        userCoins = d.newTotal || userCoins;
        tx('hdr-coins', userCoins.toLocaleString());
        tx('balance-coins', userCoins.toLocaleString());
        tx('sb-coins', userCoins.toLocaleString());

        closeBuyModal();
        OQ.Toast.success('Сәтті сатып алынды');

        if (d.qrCode) {
          var codeEl = document.getElementById('qr-code-display');
          if (codeEl) codeEl.textContent = d.qrCode;
          var qm = document.getElementById('qr-modal');
          if (qm) qm.classList.remove('hidden');
          var closeBtn = document.getElementById('close-qr-btn'); if (closeBtn) closeBtn.focus();
        }

        init();
      }).catch(function () {
        confirm.disabled = false;
        confirm.textContent = prevText;
        OQ.Toast.error('Сервермен байланыс жоқ');
      });
    });

    var closeQr = document.getElementById('close-qr-btn');
    if (closeQr) closeQr.addEventListener('click', closeQrModal);

    init();
  });
})();
