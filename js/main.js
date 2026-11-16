/* ==========================================================
   BTS LIVE 20●● in JAPAN  チケット先行受付
   ========================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     設定 1：リンクの遷移先
     URLを入れるとそのまま遷移します。空（''）のままだと
     「リンク未設定」のお知らせが表示されます。
     ---------------------------------------------------------- */
  var LINKS = {
    maxApply: '',        // ドコモMAX先行に申し込む（dアカウント認証 → MAX契約判定）
    maxContract: '',     // ドコモMAX 契約はこちら（MAX契約LP）
    leminoApply: '',     // Leminoプレミアム先行に申し込む（dアカウント認証 → Lemino契約判定）
    leminoContract: '',  // Leminoプレミアム 契約はこちら（Lemino契約LP）
    daccountHelp: '',    // dアカウントのヘルプ
    terms: '',           // 利用規約
    privacy: '',         // プライバシーポリシー
    contact: ''          // お問い合わせ
  };

  /* ----------------------------------------------------------
     設定 2：先行受付の期間と状態
     start / end に日時（例 '2027-01-15T12:00:00+09:00'）を入れると、
     受付前 → 受付中 → 受付終了 が自動で切り替わります。
     日時が空の間は status（'before' | 'open' | 'closed'）の値で表示します。
     periodText   … 「受付期間」に表示する文言
     beforeLabel  … 受付前のボタン文言
     ---------------------------------------------------------- */
  var PRESALES = {
    max: {
      start: '',
      end: '',
      status: 'open',
      periodText: '20●●/●/●(●) ●●:00 〜 ●/●(●) 23:59',
      applyLabel: 'ドコモMAX先行に申し込む',
      beforeLabel: '●/●(●) 受付開始'
    },
    lemino: {
      start: '',
      end: '',
      status: 'before',
      periodText: '20●●/●/●(●) ●●:00 〜 ●/●(●) 23:59',
      applyLabel: 'Leminoプレミアム先行に申し込む',
      beforeLabel: '●/●(●) 受付開始'
    }
  };

  var STATUS_TEXT = { before: '受付前', open: '受付中', closed: '受付終了' };
  var CLOSED_LABEL = '受付は終了しました';

  // 再読み込み時もページの一番上から表示する
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  /* ---------- 背景動画 ---------- */
  var video = document.getElementById('bgVideo');
  var spQuery = window.matchMedia('(max-width: 767px) and (orientation: portrait)');

  function setVideo() {
    var kind = spQuery.matches ? 'sp' : 'pc';
    if (video.getAttribute('data-kind') === kind) return;
    video.setAttribute('data-kind', kind);
    video.poster = video.getAttribute('data-poster-' + kind);
    video.src = video.getAttribute('data-src-' + kind);
    video.muted = true;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* 自動再生不可の端末ではポスター画像を表示 */ });
  }
  setVideo();
  if (spQuery.addEventListener) spQuery.addEventListener('change', setVideo);

  // 省電力モードなどで止まっていた場合、最初の操作で再生する
  function kick() { if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } }
  document.addEventListener('touchstart', kick, { once: true, passive: true });
  document.addEventListener('click', kick, { once: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  /* ---------- 受付状態の判定 ---------- */
  // 表示確認用：URLに ?max=closed&lemino=open のように付けると状態を上書きできます
  var params = new URLSearchParams(location.search);

  function getStatus(key) {
    var forced = params.get(key);
    if (forced && STATUS_TEXT[forced]) return forced;
    var p = PRESALES[key];
    var start = p.start ? new Date(p.start).getTime() : NaN;
    var end = p.end ? new Date(p.end).getTime() : NaN;
    if (!isNaN(start) && !isNaN(end)) {
      var now = Date.now();
      return now < start ? 'before' : now <= end ? 'open' : 'closed';
    }
    return STATUS_TEXT[p.status] ? p.status : 'before';
  }

  var firstRender = true;

  function renderPresales() {
    var statuses = [];
    document.querySelectorAll('[data-presale]').forEach(function (box) {
      var key = box.getAttribute('data-presale');
      var p = PRESALES[key];
      if (!p) return;
      var status = getStatus(key);
      statuses.push(status);
      box.setAttribute('data-status', status);
      box.querySelector('[data-role="status"]').textContent = STATUS_TEXT[status];
      box.querySelectorAll('[data-role="period"]').forEach(function (el) { el.textContent = p.periodText; });

      var btn = box.querySelector('[data-role="apply"]');
      var label = btn.querySelector('span');
      if (status === 'open') {
        label.textContent = p.applyLabel;
        btn.removeAttribute('aria-disabled');
        btn.removeAttribute('tabindex');
      } else {
        label.textContent = status === 'before' ? p.beforeLabel : CLOSED_LABEL;
        btn.setAttribute('aria-disabled', 'true');
        btn.setAttribute('tabindex', '-1');
      }
      // 受付中のものは最初から開いておく
      if (firstRender && status === 'open') toggle(box, true);
    });
    firstRender = false;

    // ファーストビューの案内
    var badge = document.getElementById('heroBadge');
    if (statuses.indexOf('open') !== -1) {
      badge.innerHTML = '<span>ドコモMAX・Leminoプレミアム</span> <span>先行受付中</span>';
      badge.classList.remove('is-off');
    } else if (statuses.indexOf('before') !== -1) {
      badge.innerHTML = '<span>ドコモMAX・Leminoプレミアム</span> <span>先行受付 まもなく開始</span>';
      badge.classList.remove('is-off');
    } else {
      badge.textContent = '先行受付は終了しました';
      badge.classList.add('is-off');
    }
  }

  /* ---------- アコーディオン ---------- */
  function toggle(box, open) {
    box.classList.toggle('is-open', open);
    box.querySelector('.accordion-title').setAttribute('aria-expanded', String(open));
  }

  document.querySelectorAll('.accordion').forEach(function (box, i) {
    var btn = box.querySelector('.accordion-title');
    var content = box.querySelector('.accordion-content');
    content.id = content.id || 'acc-' + i;
    btn.setAttribute('aria-controls', content.id);
    btn.addEventListener('click', function () { toggle(box, !box.classList.contains('is-open')); });
  });

  renderPresales();
  // 期間が設定されている場合は、開いたままでも状態が切り替わるようにする
  setInterval(renderPresales, 30000);

  /* ---------- リンク ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2600);
  }

  document.querySelectorAll('[data-link]').forEach(function (a) {
    var url = LINKS[a.getAttribute('data-link')];
    if (url) a.href = url;
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (!LINKS[a.getAttribute('data-link')]) {
        e.preventDefault();
        showToast('リンク先は準備中です');
      }
    });
  });

  /* ---------- メニュー ---------- */
  var menu = document.getElementById('menu');
  var menuIcon = document.getElementById('menu-icon');

  function setMenu(open) {
    menu.hidden = !open;
    menuIcon.setAttribute('aria-expanded', String(open));
    menuIcon.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.classList.toggle('is-menu-open', open);
  }

  menuIcon.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuIcon.focus(); }
  });
})();
