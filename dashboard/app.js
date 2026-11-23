/* Token Radar — the dashboard. Reads window.RADAR (written by main.ts from the same board),
   renders the ranked board, its filters, one protocol's detail view, the multiples table and
   the live-token set. No network: the data is the script beside this page. */
(function () {
  'use strict';
  var R = window.RADAR;
  if (!R || !Array.isArray(R.rows)) {
    document.getElementById('rows').innerHTML = '<tr><td colspan="10">No radar data was loaded.</td></tr>';
    return;
  }
  var watch = {};
  R.watchlist.forEach(function (s) { watch[s] = true; });

  /* ---------- formatting ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function usd(n) {
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + Math.round(n);
  }
  function usdFull(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function pct(v) {
    if (v === null || v === undefined) return '<span class="num">—</span>';
    var cls = v > 0 ? 'pos' : v < 0 ? 'neg' : '';
    var sign = v > 0 ? '+' : '';
    return '<span class="num ' + cls + '">' + sign + v.toFixed(1) + '%</span>';
  }
  function age(v) {
    if (v === null || v === undefined) return '—';
    if (v < 30) return v + 'd';
    if (v < 365) return (v / 30).toFixed(1) + 'mo';
    return (v / 365).toFixed(1) + 'y';
  }
  function cat(c) { return c === null || c === undefined ? '—' : c; }

  /* ---------- header ---------- */
  var stats = document.getElementById('stats');
  stats.innerHTML =
    stat(R.board_size, 'ranked') +
    stat(R.watchlist_size, 'on the watchlist') +
    stat(R.live_size, 'live-token shown') +
    stat(R.early_size, 'below the watchlist floor') +
    stat('$' + Math.round(R.floor_usd / 1e6) + 'M', 'watchlist floor');
  function stat(value, label) {
    return '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }
  document.getElementById('formula').textContent =
    'implied = TVL × multiple(' + 'category' + ') × launch odds   ·   model ' + R.model_version +
    '   ·   snapshot ' + R.as_of;
  document.getElementById('global-mult').textContent = R.global_multiple.toFixed(3) +
    ' (median over ' + R.global_live_n + ' live-token protocols)';
  document.getElementById('source').textContent = 'Source: ' + R.source + '.';

  /* ---------- controls ---------- */
  var qEl = document.getElementById('q');
  var catEl = document.getElementById('cat');
  var chainEl = document.getElementById('chain');
  var sortEl = document.getElementById('sort');
  var watchEl = document.getElementById('watch');
  var countEl = document.getElementById('count');
  var rowsEl = document.getElementById('rows');

  var cats = {};
  var chains = {};
  R.rows.forEach(function (r) {
    if (r.category) cats[r.category] = true;
    r.chains.forEach(function (c) { chains[c] = true; });
  });
  Object.keys(cats).sort().forEach(function (c) { addOpt(catEl, c); });
  Object.keys(chains).sort().forEach(function (c) { addOpt(chainEl, c); });
  function addOpt(sel, v) {
    var o = document.createElement('option');
    o.value = v; o.textContent = v;
    sel.appendChild(o);
  }

  /* ---------- verdict badge ---------- */
  function verdictBadge(v) {
    if (v === 'Worth farming') return '<span class="verdict farm">Worth farming</span>';
    if (v === 'Farm small') return '<span class="verdict small">Farm small</span>';
    return '<span class="verdict wait">Wait</span>';
  }

  /* ---------- top 10 at a glance ---------- */
  document.getElementById('top10-rows').innerHTML = R.rows.slice(0, 10).map(function (r) {
    var badge = watch[r.slug] ? '<span class="badge">watchlist</span>' : '';
    return '<tr data-slug="' + esc(r.slug) + '">' +
      '<td class="num">' + r.rank + '</td>' +
      '<td><span class="pname">' + esc(r.name) + '</span>' + badge + '</td>' +
      '<td>' + esc(cat(r.category)) + '</td>' +
      '<td class="num"><strong>' + usd(r.implied_value_usd) + '</strong></td>' +
      '<td>' + verdictBadge(r.verdict) + '</td>' +
      '</tr>';
  }).join('');
  document.getElementById('top10-table').addEventListener('click', function (ev) {
    var tr = ev.target.closest('tr[data-slug]');
    if (!tr) return;
    openDetail(tr.getAttribute('data-slug'));
  });

  /* ---------- board ---------- */
  function filtered() {
    var q = qEl.value.trim().toLowerCase();
    var c = catEl.value;
    var ch = chainEl.value;
    var w = watchEl.checked;
    var out = R.rows.filter(function (r) {
      if (q && r.name.toLowerCase().indexOf(q) === -1 && r.slug.toLowerCase().indexOf(q) === -1) return false;
      if (c && r.category !== c) return false;
      if (ch && r.chains.indexOf(ch) === -1) return false;
      if (w && !watch[r.slug]) return false;
      return true;
    });
    var key = sortEl.value;
    out.sort(function (a, b) {
      if (key === 'tvl') return b.tvl_usd - a.tvl_usd;
      if (key === 'growth') return (b.change_7d === null ? -Infinity : b.change_7d) - (a.change_7d === null ? -Infinity : a.change_7d);
      if (key === 'age') return (b.age_days === null ? -1 : b.age_days) - (a.age_days === null ? -1 : a.age_days);
      if (key === 'name') return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      return b.implied_value_usd - a.implied_value_usd;
    });
    return out;
  }

  function render() {
    var list = filtered();
    countEl.textContent = list.length + ' of ' + R.rows.length + ' protocols shown' +
      (watchEl.checked ? ' (watchlist only)' : '') + '.';
    if (list.length === 0) {
      rowsEl.innerHTML = '<tr><td colspan="10">No protocols match the current filters.</td></tr>';
      return;
    }
    rowsEl.innerHTML = list.map(function (r) {
      var badge = watch[r.slug] ? '<span class="badge">watchlist</span>' : '';
      var mult = r.base_multiple.toFixed(3) + (r.multiple_source === 'global' ? '*' : '');
      return '<tr data-slug="' + esc(r.slug) + '">' +
        '<td class="num">' + r.rank + '</td>' +
        '<td><span class="pname">' + esc(r.name) + '</span>' + badge + '<br><span class="slug">' + esc(r.slug) + '</span></td>' +
        '<td>' + esc(cat(r.category)) + '</td>' +
        '<td>' + esc(r.chains.join(', ') || '—') + '</td>' +
        '<td class="num">' + usd(r.tvl_usd) + '</td>' +
        '<td>' + pct(r.change_7d) + '</td>' +
        '<td class="num">' + age(r.age_days) + '</td>' +
        '<td class="num">' + mult + '</td>' +
        '<td class="num"><strong>' + usd(r.implied_value_usd) + '</strong></td>' +
        '<td>' + verdictBadge(r.verdict) + '</td>' +
        '</tr>';
    }).join('');
  }

  rowsEl.addEventListener('click', function (ev) {
    var tr = ev.target.closest('tr[data-slug]');
    if (!tr) return;
    openDetail(tr.getAttribute('data-slug'));
  });
  [qEl, catEl, chainEl, sortEl, watchEl].forEach(function (el) {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  /* ---------- detail view ---------- */
  var detailEl = document.getElementById('detail');
  function openDetail(slug) {
    var r = null;
    R.rows.forEach(function (x) { if (x.slug === slug) r = x; });
    if (!r) return;
    rowsEl.querySelectorAll('tr.sel').forEach(function (t) { t.classList.remove('sel'); });
    var tr = rowsEl.querySelector('tr[data-slug="' + slug + '"]');
    if (tr) tr.classList.add('sel');
    var base = r.tvl_usd * r.base_multiple;
    var multNote = r.multiple_source === 'category'
      ? 'median mcap / TVL of ' + r.category_live_n + ' live-token ' + (r.category || '') + ' protocols'
      : 'global median (fewer than 5 live-token ' + (r.category || 'protocols') + '), over ' + r.category_live_n + ' protocols';
    var oddsNote = 'share of the snapshot’s protocols in the ' + r.odds_band + ' band that still record no token' +
      (r.age_days === null ? ' (no listing date, so the oldest band’s share is used)' : ' (age ' + r.age_days + ' days)');
    var peers = R.live.filter(function (l) { return l.category === r.category; });
    var peerRows = peers.length === 0
      ? '<p>No protocol in the top-24 live set shares this category, which is why the global multiple is used.</p>'
      : '<div class="tablewrap"><table><thead><tr><th>Protocol</th><th class="num">TVL</th><th class="num">Market cap</th><th class="num">mcap / TVL</th></tr></thead><tbody>' +
        peers.map(function (l) {
          return '<tr><td><span class="pname">' + esc(l.name) + '</span><br><span class="slug">' + esc(l.slug) + '</span></td>' +
            '<td class="num">' + usd(l.tvl_usd) + '</td>' +
            '<td class="num">' + (l.mcap_usd === null ? '—' : usd(l.mcap_usd)) + '</td>' +
            '<td class="num">' + (l.mcap_usd === null ? '—' : (l.mcap_usd / l.tvl_usd).toFixed(3)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    detailEl.innerHTML =
      '<button class="close" type="button" id="detail-close">Close</button>' +
      '<h2>' + esc(r.name) + '</h2>' +
      '<p class="sub">Rank #' + r.rank + ' · ' + esc(r.slug) + ' · ' + esc(cat(r.category)) + ' · ' +
      esc(r.chains.join(', ') || 'no chain listed') + ' · records no token' +
      (watch[r.slug] ? ' · on the watchlist' : '') + '</p>' +
      '<dl class="kv">' +
      '<div><dt>Implied value</dt><dd>' + usdFull(r.implied_value_usd) + '</dd></div>' +
      '<div><dt>TVL</dt><dd>' + usdFull(r.tvl_usd) + '</dd></div>' +
      '<div><dt>7-day change</dt><dd>' + (r.change_7d === null ? 'not reported' : (r.change_7d > 0 ? '+' : '') + r.change_7d.toFixed(1) + '%') + '</dd></div>' +
      '<div><dt>Age</dt><dd>' + (r.age_days === null ? 'not listed' : r.age_days + ' days') + '</dd></div>' +
      '<div><dt>Listed</dt><dd>' + esc(r.listed_at || '—') + '</dd></div>' +
      '</dl>' +
      '<h3>How the value is built</h3>' +
      '<div class="tablewrap"><table class="modeltable"><tbody>' +
      modelRow('TVL', usdFull(r.tvl_usd), 'the protocol’s locked value') +
      modelRow('× category multiple ' + r.base_multiple.toFixed(3), usdFull(base), multNote) +
      modelRow('× launch odds ' + r.launch_odds.toFixed(2), usdFull(r.implied_value_usd), oddsNote) +
      '</tbody></table></div>' +
      '<h3>Farm plan</h3>' +
      '<ol class="steps">' + r.farm_steps.map(function (s, i) { return '<li' + (i === 0 ? ' class="verdict-step"' : '') + '>' + esc(s) + '</li>'; }).join('') + '</ol>' +
      '<h3>Priced against: live-token ' + esc(cat(r.category)) + ' protocols</h3>' +
      peerRows;
    detailEl.hidden = false;
    document.getElementById('detail-close').addEventListener('click', function () {
      detailEl.hidden = true;
      detailEl.innerHTML = '';
      rowsEl.querySelectorAll('tr.sel').forEach(function (t) { t.classList.remove('sel'); });
    });
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function modelRow(step, value, note) {
    return '<tr><td>' + esc(step) + '</td><td class="num">' + esc(value) + '</td><td>' + esc(note) + '</td></tr>';
  }

  /* ---------- launch-odds table ---------- */
  document.getElementById('odds-rows').innerHTML = R.launch_odds.map(function (o) {
    return '<tr><td>' + esc(o.band) + '</td><td class="num">' + o.protocols + '</td>' +
      '<td class="num">' + o.no_token + '</td><td class="num">' + o.odds.toFixed(2) + '</td></tr>';
  }).join('');

  /* ---------- multiples table ---------- */
  document.getElementById('mult-rows').innerHTML = R.multiples.map(function (m) {
    var used = m.live_n >= 5 ? 'category multiple' : 'too few live — global used instead';
    return '<tr><td>' + esc(m.category) + '</td><td class="num">' + m.live_n + '</td>' +
      '<td class="num">' + m.multiple.toFixed(3) + (m.clamped ? ' (clamped)' : '') + '</td><td>' + used + '</td></tr>';
  }).join('') +
  '<tr><td><strong>All categories (global fallback)</strong></td><td class="num">' + R.global_live_n + '</td>' +
  '<td class="num"><strong>' + R.global_multiple.toFixed(3) + '</strong></td><td>used when a category has fewer than 5 live protocols</td></tr>';

  /* ---------- live-token table ---------- */
  document.getElementById('live-rows').innerHTML = R.live.map(function (l) {
    return '<tr><td><span class="pname">' + esc(l.name) + '</span><br><span class="slug">' + esc(l.slug) + '</span></td>' +
      '<td>' + esc(cat(l.category)) + '</td>' +
      '<td class="num">' + usd(l.tvl_usd) + '</td>' +
      '<td class="num">' + (l.mcap_usd === null ? '—' : usd(l.mcap_usd)) + '</td>' +
      '<td class="num">' + (l.mcap_usd === null ? '—' : (l.mcap_usd / l.tvl_usd).toFixed(3)) + '</td>' +
      '<td>' + pct(l.change_7d) + '</td></tr>';
  }).join('');

  render();
})();
