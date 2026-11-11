/* stats.iradgov.org: site script. Header, footer, language and the data-driven parts. */
(function () {
  "use strict";
  var SITE = {"store": "tso_lang", "nav": [["home", "/"], ["census", "/census2018.html"], ["business", "/business-census.html"], ["prices", "/prices.html"], ["wages", "/wages.html"], ["indicators", "/indicators.html"], ["pubs", "/publications.html"]], "navAlias": {}, "links": [["gov", "https://iradgov.org/"], ["eirad", "https://e-irad.org/"], ["bank", "https://bank.iradgov.org/"], ["arch", "https://archives.iradgov.org/"], ["post", "https://post.iradgov.org/"], ["elections", "https://elections.iradgov.org/"], ["court", "https://court.iradgov.org/"], ["mejlis", "https://mejlis.iradgov.org/"], ["gidromet", "https://gidromet.iradgov.org/"], ["jandarm", "https://jandarm.iradgov.org/"], ["customs", "https://customs.iradgov.org/"], ["railways", "https://railways.iradgov.org/"], ["avia", "https://avia.iradgov.org/"], ["loto", "https://loto.iradgov.org/"], ["tender", "https://tender.e-irad.org/"], ["talas", "https://talas.iradgov.org/"], ["nurzhan", "https://nurzhan.iradgov.org/"], ["iyikjanyl", "https://iyikjanyl.iradgov.org/"], ["heritage", "https://heritage.iradgov.org/"]], "mastBtn": "/business-census.html"};
  var EXTRA = function () {
    var big = $("#pricesNow"), mini = $("#pricesMini"); if (!big && !mini) return;
    var PER_H = 3250 / 173;
    function txt(p) { var s = LANG === "en" ? p.text : p.text.replace(/,/g, "\u00a0").replace(/\./g, ","); return p.prefix ? t("pnFrom", { v: s }) : s; }
    function som(p) { return p.som != null ? p.som : (p.som_min + p.som_max) / 2; }
    function work(p) { var m = som(p) / PER_H * 60; if (m < 90) return t("pnMin", { v: Math.max(1, Math.round(m)) }); if (m >= 600) return t("pnH", { v: Math.round(m / 60) }); m = Math.round(m / 5) * 5; return t("pnH", { v: Math.floor(m / 60) }) + (m % 60 ? " " + t("pnMin", { v: m % 60 }) : ""); }
    todayData().then(function (d) {
      var P = d.prices || [];
      if (mini) mini.innerHTML = '<table class="facts"><tbody>' + ["bread", "plov", "petrol-92", "bus-nurzhan"].map(function (id) {
        var p = P.filter(function (x) { return x.id === id; })[0]; return p ? "<tr><td>" + esc(tri(p.label)) + '</td><td class="num nw">' + esc(txt(p)) + "</td></tr>" : "";
      }).join("") + "</tbody></table>";
      if (big) {
        var groups = []; P.forEach(function (p) { if (groups.indexOf(p.group) < 0) groups.push(p.group); });
        big.innerHTML = '<p class="small"><span class="live">' + esc(t("lnLive")) + "</span> " + esc(t("pnUpd", { d: fmtDate(d.date) })) + "</p>" +
          '<div class="tbl-wrap"><table class="facts pn"><thead><tr><th>' + esc(t("pnItem")) + '</th><th class="num">' + esc(t("pnPrice")) + '</th><th class="num">' + esc(t("pnWork")) + "</th></tr></thead><tbody>" +
          groups.map(function (g) {
            return '<tr class="grp"><th colspan="3">' + esc(t("pg_" + g)) + "</th></tr>" + P.filter(function (p) { return p.group === g; }).map(function (p) {
              return "<tr><td>" + esc(tri(p.label)) + '</td><td class="num nw">' + esc(txt(p)) + '</td><td class="num nw">' + esc(work(p)) + "</td></tr>";
            }).join("");
          }).join("") + "</tbody></table></div>";
      }
    }).catch(function () { [big, mini].forEach(function (e) { if (e) failBox(e); }); });
  };
  /* What's left of your wage (roadmap X11): Tax Code 2009 (income tax 10%, State Pension Fund 2% from the employee,
     15% from the employer) and a month's basket at today's prices from today.json */
  var WAGE = function () {
    var el = $("#wageCalc"); if (!el) return;
    var BASKET = [["bread", 30], ["potatoes", 15], ["apples", 6], ["walnuts", 0.5], ["plov", 2], ["taxi", 4]];
    var RENT = [["", "wcRentNone"], ["rent-talas", ""], ["rent-nurzhan", ""], ["rent-iyik-janyl", ""]];
    var JOBS = [["wp4", 3250], ["wj0", 9800], ["wj2", 6000], ["wj3", 3400], ["wj4", 2700], ["wj5", 2300], ["wj6", 1850], ["wj7", 1600], ["wcMin", 1000]];
    function n0(x) { var s = String(Math.round(x)); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, LANG === "en" ? "," : " "); return s; }
    function n2(x) { var s = (Math.round(x * 100) / 100).toFixed(2).split("."); return n0(+s[0]) + (LANG === "en" ? "." : ",") + s[1]; }
    function som(p) { return p.som != null ? p.som : (p.som_min + p.som_max) / 2; }
    function lbl(k) { var P = (I.pages || {})[LANG] || {}; var e = document.querySelector('[data-i18n="' + k + '"]'); return LANG !== "en" && P[k] ? P[k] : e ? (e.getAttribute("data-en") || e.textContent) : t(k); }
    var gross = 3250, rent = "";
    try { var q = (location.hash.match(/w=(\d+)/) || [])[1]; if (q) gross = Math.min(999999, +q); } catch (e) {}
    todayData().then(function (d) {
      var P = {}; (d.prices || []).forEach(function (x) { P[x.id] = x; });
      function draw() {
        var pens = gross * 0.02, tax = gross * 0.10, net = gross - pens - tax, emp = gross * 0.15;
        var rows = BASKET.filter(function (b) { return P[b[0]]; }).map(function (b) { return { lab: tri(P[b[0]].label), q: b[1], v: som(P[b[0]]) * b[1] }; });
        var bsum = rows.reduce(function (a, r) { return a + r.v; }, 0), rv = rent && P[rent] ? som(P[rent]) : 0, left = net - bsum - rv;
        var bread = P.bread ? Math.floor(net / som(P.bread)) : 0, pl = P.plov ? Math.floor(net / som(P.plov)) : 0, pet = P["petrol-92"] ? Math.floor(net / som(P["petrol-92"])) : 0;
        $("#wcOut", el).innerHTML =
          '<div class="tbl-wrap"><table class="facts"><tbody>' +
          "<tr><th>" + esc(t("wcGross")) + '</th><td class="num nw">' + n0(gross) + " " + esc(t("wcSom")) + "</td></tr>" +
          "<tr><th>" + esc(t("wcPens")) + '</th><td class="num nw">− ' + n2(pens) + "</td></tr>" +
          "<tr><th>" + esc(t("wcTax")) + '</th><td class="num nw">− ' + n2(tax) + "</td></tr>" +
          '<tr class="tot"><th>' + esc(t("wcNet")) + '</th><td class="num nw"><b>' + n2(net) + " " + esc(t("wcSom")) + "</b></td></tr>" +
          '<tr><th class="muted">' + esc(t("wcEmp")) + '</th><td class="num nw muted">' + n2(emp) + " (" + esc(t("wcCost", { v: n0(gross + emp) })) + ")</td></tr>" +
          "</tbody></table></div>" +
          "<h3>" + esc(t("wcBasketH")) + "</h3>" +
          '<div class="tbl-wrap"><table class="facts"><tbody>' +
          rows.map(function (r) { return "<tr><th>" + esc(r.lab) + " × " + esc(LANG === "en" ? String(r.q) : String(r.q).replace(".", ",")) + '</th><td class="num nw">' + n2(r.v) + "</td></tr>"; }).join("") +
          (rv ? "<tr><th>" + esc(tri(P[rent].label)) + " " + esc(t("wcMid")) + '</th><td class="num nw">' + n0(rv) + "</td></tr>" : "") +
          '<tr class="tot"><th>' + esc(t(left >= 0 ? "wcLeft" : "wcShort")) + '</th><td class="num nw"><b>' + n2(Math.abs(left)) + " " + esc(t("wcSom")) + "</b></td></tr>" +
          "</tbody></table></div>" +
          '<p class="small">' + esc(t("wcBuys", { b: n0(bread), p: n0(pl), f: n0(pet) })) + "</p>" +
          '<p class="small muted"><span class="live">' + esc(t("lnLive")) + "</span> " + esc(t("pnUpd", { d: fmtDate(d.date) })) + ". " + esc(t("wcNote")) + "</p>";
        try { history.replaceState(null, "", "#w=" + Math.round(gross)); } catch (e) {}
      }
      el.innerHTML = '<form class="wc-form" onsubmit="return false"><label>' + esc(t("wcIn")) + ' <input type="number" id="wcG" min="0" max="999999" step="50" value="' + gross + '"> ' + esc(t("wcSom")) + "</label> " +
        '<label>' + esc(t("wcRent")) + ' <select id="wcR">' + RENT.map(function (r) { return '<option value="' + r[0] + '">' + esc(r[0] ? (P[r[0]] ? tri(P[r[0]].label) : r[0]) : t(r[1])) + "</option>"; }).join("") + "</select></label>" +
        '<div class="filters wc-jobs">' + JOBS.map(function (j) { return '<button type="button" data-w="' + j[1] + '">' + esc(j[0] === "wcMin" ? t("wcMin") : lbl(j[0])) + "</button>"; }).join("") + "</div></form>" +
        '<div id="wcOut"></div>';
      $("#wcG", el).addEventListener("input", function () { var v = +this.value; if (v >= 0) { gross = Math.min(999999, v); draw(); } });
      $("#wcR", el).addEventListener("change", function () { rent = this.value; draw(); });
      $$(".wc-jobs button", el).forEach(function (b) { b.addEventListener("click", function () { gross = +b.getAttribute("data-w"); $("#wcG", el).value = gross; draw(); }); });
      draw();
    }).catch(function () { failBox(el); });
  };
  var I = window.SITE_I18N;
  var LANGS = ["en", "ir", "ru"];
  var PAGE = document.body.getAttribute("data-page") || "";
  var LANG = (function () {
    var q = (location.search.match(/[?&]lang=(en|ir|ru)\b/) || [])[1];
    if (q) { try { localStorage.setItem(SITE.store, q); } catch (e) {} return q; }
    try { var s = localStorage.getItem(SITE.store); if (LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    return "en";
  })();
  var cache = {};

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function t(k, v) { var d = I.ui[LANG] || {}; var s = d[k] != null ? d[k] : I.ui.en[k]; return s == null ? k : (v ? fill(s, v) : s); }
  function tri(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[LANG] || o.en || ""; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iradNow() { var n = new Date(); return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 6 * 3600000); }
  function iradToday() { var d = iradNow(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fmtDate(s) {
    var p = String(s).split("-"), M = t("months");
    if (p.length < 3) return t("monthsNom")[+p[1] - 1] + " " + p[0];
    if (LANG === "ir") return (+p[2]) + "-" + M[+p[1] - 1] + " " + p[0];
    return (+p[2]) + " " + M[+p[1] - 1] + " " + p[0];
  }
  function getJSON(url) {
    if (!cache[url]) cache[url] = fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    return cache[url];
  }
  function sortByDate(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }
  /* today's numbers: the public file (iradgov.org/data/today.json) nests its lists; flatten them once */
  function todayData() {
    return getJSON("https://iradgov.org/data/today.json").then(function (d) {
      if (d.weather && d.weather.places) d.weather = d.weather.places;
      if (d.air && d.air.places) d.air = d.air.places;
      if (d.water && d.water.toktogul && !d.toktogul) d.toktogul = d.water.toktogul;
      if (d.rates && d.rates.official && d.rates.official.rows) d.rates.official = d.rates.official.rows;
      if (d.prices && !Array.isArray(d.prices)) {
        var a = [];
        ["food", "fuel", "transport", "rent"].forEach(function (g) {
          (d.prices[g] || []).forEach(function (p) { if (!p.group) p.group = p.id === "hay" ? "farm" : g; a.push(p); });
        });
        d.prices = a;
      }
      if (!d.computed) d.computed = d.updated;
      return d;
    });
  }
  function failBox(el) { if (el) el.innerHTML = '<p class="muted">' + esc(t("loadFail")) + "</p>"; }

  /* ---------- chrome ---------- */
  function navHTML0() {
    return SITE.nav.map(function (n) {
      var cur = n[0] === PAGE || (SITE.navAlias[PAGE] === n[0]);
      return '<li><a href="' + n[1] + '"' + (cur ? ' aria-current="page"' : "") + ">" + esc(t("nav_" + n[0])) + "</a></li>";
    }).join("");
  }
  function chrome() {
    var top = $("#top"), bottom = $("#bottom");
    if (top) {
      top.innerHTML =
        '<a class="skip" href="#main">' + esc(t("skip")) + "</a>" +
        '<div class="util"><div class="wrap"><div class="left"><span>' + esc(t("utilGov")) + '</span><span class="clock" id="clock"></span></div>' +
        '<div class="right"><a class="gov-link" href="https://iradgov.org/">iradgov.org</a>' +
        '<div class="langs" role="group" aria-label="' + esc(t("langLabel")) + '">' +
        LANGS.map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (l === LANG) + '" lang="' + I.htmlLang[l] + '">' + esc(I.langs[l]) + "</button>"; }).join("") +
        "</div></div></div></div>" +
        '<div class="mast"><div class="wrap"><a class="home-link" href="/"><img class="emb" src="/assets/state-emblem-160.png" alt="' + esc(t("embAlt")) + '" width="76" height="76">' +
        '<div class="ttl"><div class="k">' + esc(t("mastK")) + '</div><div class="n">' + esc(t("mastN")) + '</div><div class="s">' + esc(t("mastS")) + "</div></div></a>" +
        (SITE.mastBtn ? '<a class="eirad" href="' + SITE.mastBtn + '">' + t("mastBtn") + "</a>" : "") + "</div></div>" +
        '<nav class="nav" aria-label="' + esc(t("navLabel")) + '"><div class="wrap"><button class="burger" type="button" aria-expanded="false"><span class="bars"></span>' + esc(t("menu")) + '</button><ul class="menu">' + navHTML() +
        '</ul></div></nav><div class="orn" aria-hidden="true"></div>';
      $(".burger", top).addEventListener("click", function () {
        var nav = $(".nav", top), open = !nav.classList.contains("open");
        nav.classList.toggle("open", open); this.setAttribute("aria-expanded", open);
      });
      $$("[data-lang]", top).forEach(function (b) { b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); }); });
      tick();
    }
    if (bottom) {
      bottom.innerHTML =
        '<footer class="foot"><div class="wrap"><div class="cols">' +
        '<div><div class="femb"><img src="/assets/state-emblem-160.png" alt="" width="42" height="42"><strong style="color:#fff">' + esc(t("mastN")) + "</strong></div>" +
        '<address class="addrbox" style="font-style:normal">' + t("footAddr") + "</address></div>" +
        "<div><h4>" + esc(t("footSite")) + "</h4><ul>" +
        SITE.nav.map(function (n) { return '<li><a href="' + n[1] + '">' + esc(t("nav_" + n[0])) + "</a></li>"; }).join("") +
        "</ul></div>" +
        "<div><h4>" + esc(t("footGov")) + "</h4><ul>" +
        SITE.links.map(function (l) { return '<li><a href="' + l[1] + '">' + esc(t("link_" + l[0])) + "</a></li>"; }).join("") +
        "</ul></div></div>" +
        '<div class="fine"><span>' + esc(t("footCopy", { y: iradNow().getFullYear() })) + "</span><span>" + esc(t("footTime")) + "</span></div></div></footer>";
    }
  }
  var tickTimer;
  function tick() {
    var el = $("#clock"); if (!el) return;
    var d = iradNow();
    el.textContent = t("clock", { d: fmtDate(iradToday()), t: pad(d.getHours()) + ":" + pad(d.getMinutes()) });
    clearTimeout(tickTimer); tickTimer = setTimeout(tick, 30000);
  }

  /* ---------- static text ---------- */
  function staticText() {
    var P = (I.pages || {})[LANG] || {};
    $$("[data-i18n]").forEach(function (el) {
      if (!el.hasAttribute("data-en")) el.setAttribute("data-en", el.innerHTML);
      var k = el.getAttribute("data-i18n");
      el.innerHTML = LANG === "en" ? el.getAttribute("data-en") : (P[k] != null ? P[k] : el.getAttribute("data-en"));
    });
    var tk = document.body.getAttribute("data-title");
    var dt = (tk && P["title_" + tk] && LANG !== "en" ? P["title_" + tk] : (document.body.getAttribute("data-title-en") || document.title.split(" | ")[0]));
    document.title = dt === t("mastN") ? dt : dt + " | " + t("mastN");
    document.documentElement.lang = I.htmlLang[LANG];
  }
  function setLang(l) {
    LANG = l;
    try { localStorage.setItem(SITE.store, l); } catch (e) {}
    render();
  }

  /* ---------- data-driven parts ---------- */
  function countdowns() {
    $$("[data-countdown]").forEach(function (el) {
      var to = el.getAttribute("data-countdown").split("-"), now = iradNow();
      var days = Math.ceil((Date.UTC(+to[0], +to[1] - 1, +to[2]) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
      el.innerHTML = days > 0 ? '<b class="cd-n">' + days + "</b> " + esc(t("cdDays")) : esc(t("cdToday"));
    });
  }
  function dates() {
    $$("[data-date]").forEach(function (el) { el.textContent = fmtDate(el.getAttribute("data-date")); });
  }
  function notices() {
    var el = $("#notices"); if (!el) return;
    var n = +(el.getAttribute("data-n") || 99);
    getJSON("/data/notices.json").then(function (d) {
      var items = (d.notices || []).slice().sort(sortByDate).slice(0, n);
      el.innerHTML = items.map(function (x) {
        return '<div class="notice"><div class="meta">' + esc(fmtDate(x.date)) + (x.number ? " · " + esc(tri(x.number)) : "") + '</div><div class="t">' + esc(tri(x.title)) + "</div>" +
          (x.text ? "<p>" + tri(x.text) + "</p>" : "") + (x.signed ? '<p class="small muted">' + esc(tri(x.signed)) + "</p>" : "") + "</div>";
      }).join("");
    }).catch(function () { failBox(el); });
  }
  var regFilter = "all", regQuery = "";
  function register() {
    var el = $("#register"); if (!el) return;
    getJSON("/data/cases.json").then(function (d) {
      var cases = (d.cases || []).slice().sort(function (a, b) { return a.filed < b.filed ? 1 : -1; });
      var courts = ["all"].concat(d.courts.map(function (c) { return c.id; }));
      var cname = {}; d.courts.forEach(function (c) { cname[c.id] = tri(c.name); });
      var bar = $("#regFilter");
      if (bar) {
        bar.innerHTML = courts.map(function (c) { return '<button type="button" data-court="' + c + '" aria-pressed="' + (c === regFilter) + '">' + esc(c === "all" ? t("regAll") : cname[c]) + "</button>"; }).join("") +
          '<input type="search" id="regQ" placeholder="' + esc(t("regSearch")) + '" value="' + esc(regQuery) + '">';
        $$("button", bar).forEach(function (b) { b.addEventListener("click", function () { regFilter = b.getAttribute("data-court"); register(); }); });
        $("#regQ").addEventListener("input", function () { regQuery = this.value; draw(); });
      }
      function draw() {
        var q = regQuery.toLowerCase();
        var rows = cases.filter(function (c) {
          if (regFilter !== "all" && c.court !== regFilter) return false;
          if (!q) return true;
          return (c.no + " " + tri(c.title) + " " + tri(c.kind) + " " + tri(c.counsel || "")).toLowerCase().indexOf(q) >= 0;
        });
        el.innerHTML = rows.length ? '<div class="tbl-wrap"><table class="facts reg"><thead><tr><th>' + esc(t("regNo")) + "</th><th>" + esc(t("regCase")) + "</th><th>" + esc(t("regCourt")) + "</th><th>" + esc(t("regFiled")) + "</th><th>" + esc(t("regStatus")) + "</th></tr></thead><tbody>" +
          rows.map(function (c) {
            return '<tr><td class="nw">' + esc(c.no) + "</td><td><b>" + esc(tri(c.title)) + '</b><br><span class="small muted">' + esc(tri(c.kind)) + (c.counsel ? " · " + esc(tri(c.counsel)) : "") + (c.judge ? " · " + esc(tri(c.judge)) : "") + "</span></td><td>" + esc(cname[c.court]) +
              '</td><td class="nw">' + esc(fmtDate(c.filed)) + "</td><td>" + esc(tri(c.status)) + (c.next ? '<br><span class="small">' + esc(t("regNext")) + ": " + esc(fmtDate(c.next)) + "</span>" : "") + "</td></tr>";
          }).join("") + "</tbody></table></div>" : '<p class="muted">' + esc(t("regNone")) + "</p>";
        var upd = $("#regUpd"); if (upd) upd.textContent = t("regUpdated", { d: fmtDate(d.updated) });
      }
      draw();
    }).catch(function () { failBox(el); });
  }

  /* ---------- forms and online services; "In the news" ---------- */
  var SVC = {"home": [[{"en": "Business census 2026", "ir": "2026-jılkı ishkanalar sanagı", "ru": "Перепись предприятий 2026"}, "https://e-irad.org/census/", "e-Irad"], [{"en": "Census questionnaire for business entities 2026", "ir": "2026-jılkı charbalık subyektterdin sanak suroo kagazı", "ru": "Переписной лист хозяйствующих субъектов 2026"}, "https://e-irad.org/forms/TSO-26.pdf", "TSO-26 · PDF"], [{"en": "Check a firm in the Register", "ir": "Reestrde firmanı tekshirüü", "ru": "Проверить фирму в реестре"}, "https://e-irad.org/service.html?id=firmcheck", "e-Irad"]], "business": [[{"en": "Census questionnaire for business entities 2026", "ir": "2026-jılkı charbalık subyektterdin sanak suroo kagazı", "ru": "Переписной лист хозяйствующих субъектов 2026"}, "https://e-irad.org/forms/TSO-26.pdf", "TSO-26 · PDF"], [{"en": "Check a firm in the Register", "ir": "Reestrde firmanı tekshirüü", "ru": "Проверить фирму в реестре"}, "https://e-irad.org/service.html?id=firmcheck", "e-Irad"], [{"en": "Request for an extract from the Register of Firms", "ir": "Firmalar reestrinen köchürmö suroo", "ru": "Запрос выписки из Реестра фирм"}, "https://e-irad.org/forms/RF-8.pdf", "RF-8 · PDF"], [{"en": "Public tenders", "ir": "Mamlekettik satıp aluular", "ru": "Государственные закупки"}, "https://tender.e-irad.org/", "tender.e-irad.org"]], "census": [[{"en": "Business census 2026", "ir": "2026-jılkı ishkanalar sanagı", "ru": "Перепись предприятий 2026"}, "https://e-irad.org/census/", "e-Irad"], [{"en": "Census questionnaire for business entities 2026", "ir": "2026-jılkı charbalık subyektterdin sanak suroo kagazı", "ru": "Переписной лист хозяйствующих субъектов 2026"}, "https://e-irad.org/forms/TSO-26.pdf", "TSO-26 · PDF"]]};
  var SVC_L = {"svcH": {"en": "Forms and online services", "ir": "Formalar jana onlayn kızmattar", "ru": "Бланки и онлайн-услуги"}, "svcAll": {"en": "All forms on e-Irad", "ir": "e-Iraddagı bardık formalar", "ru": "Все бланки на e-Irad"}, "newsH": {"en": "In the news", "ir": "Jañılıktarda", "ru": "В новостях"}}, NEWS_HOST = "stats.iradgov.org", newsP;
  function linkBoxes() {
    var wrap = $("main .wrap"); if (!wrap) return;
    $$("#svc-box, #news-box").forEach(function (b) { b.parentNode.removeChild(b); });
    var host = $("aside", wrap) || wrap, L = SVC[PAGE];
    if (L && L.length) {
      var box = document.createElement("div");
      box.id = "svc-box"; box.className = "card tone"; box.style.marginTop = "16px";
      box.innerHTML = "<h3>" + esc(tri(SVC_L.svcH)) + '</h3><ul style="margin:0;padding-left:18px">' + L.map(function (x) {
        return '<li style="margin:4px 0"><a href="' + x[1] + '">' + esc(tri(x[0])) + "</a>" + (x[2] ? ' <span class="small muted">' + esc(tri(x[2])) + "</span>" : "") + "</li>";
      }).join("") + '</ul><p class="small" style="margin-bottom:0"><a href="https://e-irad.org/forms.html">' + esc(tri(SVC_L.svcAll)) + "</a></p>";
      host.appendChild(box);
    }
    if (PAGE !== "home") return;
    newsP = newsP || Promise.all(["https://iradone.com/data/sitelinks.json", "https://talasherald.com/data/sitelinks.json"].map(function (u) {
      return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }));
    newsP.then(function (feeds) {
      var items = [];
      feeds.forEach(function (f) { if (f && f.sites && f.sites[NEWS_HOST]) f.sites[NEWS_HOST].forEach(function (s) { items.push({ title: s.title, url: s.url, date: s.date, outlet: f.outlet }); }); });
      if (!items.length || $("#news-box")) return;
      items.sort(sortByDate);
      var box = document.createElement("div");
      box.id = "news-box"; box.className = "card"; box.style.marginTop = "16px";
      box.innerHTML = "<h3>" + esc(tri(SVC_L.newsH)) + '</h3><ul style="margin:0;padding-left:18px">' + items.slice(0, 5).map(function (s) {
        return '<li style="margin:6px 0"><a href="' + esc(s.url) + '">' + esc(s.title) + '</a><br><span class="small muted">' + esc(s.outlet) + " · " + esc(fmtDate(s.date)) + "</span></li>";
      }).join("") + "</ul>";
      host.appendChild(box);
    });
  }

  /* kit:start */
  var KIT = {"pages": [["leadership", "/leadership.html"], ["contacts", "/contacts.html"], ["news", "/news.html"], ["documents", "/documents.html"], ["vacancies", "/vacancies.html"], ["faq", "/faq.html"]]};
  function navHTML() {
    var here = KIT.pages.some(function (p) { return p[0] === PAGE; });
    return navHTML0() + '<li class="dd' + (here ? " here" : "") + '"><button class="dd-btn" type="button" aria-expanded="false">' + esc(t("kit_nav")) + ' <span class="caret" aria-hidden="true">▾</span></button><ul class="sub">' +
      KIT.pages.map(function (p) { return '<li><a href="' + p[1] + '"' + (p[0] === PAGE ? ' aria-current="page"' : "") + ">" + esc(t("kit_nav_" + p[0])) + "</a></li>"; }).join("") + "</ul></li>";
  }
  function kitChrome() {
    $$(".nav .dd").forEach(function (dd) {
      var b = $(".dd-btn", dd);
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var o = !dd.classList.contains("open");
        $$(".nav .dd.open").forEach(function (x) { x.classList.remove("open"); $(".dd-btn", x).setAttribute("aria-expanded", "false"); });
        dd.classList.toggle("open", o); b.setAttribute("aria-expanded", o);
      });
    });
    if (!kitChrome.bound) { kitChrome.bound = true; document.addEventListener("click", function () { $$(".nav .dd.open").forEach(function (x) { x.classList.remove("open"); }); }); }
    var cols = $(".foot .cols");
    if (cols && !$(".kit-foot", cols)) {
      var d = document.createElement("div"); d.className = "kit-foot";
      d.innerHTML = "<h4>" + esc(t("kit_nav")) + "</h4><ul>" + KIT.pages.map(function (p) { return '<li><a href="' + p[1] + '">' + esc(t("kit_nav_" + p[0])) + "</a></li>"; }).join("") + "</ul>";
      cols.appendChild(d);
      cols.style.gridTemplateColumns = window.matchMedia("(max-width: 680px)").matches ? "" : "1.4fr 1fr 1fr 1fr";
    }
    var today = iradToday();
    $$("[data-closes]").forEach(function (v) {
      if (v.getAttribute("data-closes") < today && !$(".kit-cl", v)) {
        v.classList.add("is-closed");
        var h = $("header", v); if (h) h.insertAdjacentHTML("beforeend", '<span class="tag grey kit-cl">' + esc(t("kit_isclosed")) + "</span>");
      }
    });
  }
  /* kit:end */

  function render() {
    chrome();
    kitChrome();
    staticText();
    dates();
    countdowns();
    notices();
    register();
    if (EXTRA) EXTRA();
    WAGE();
    linkBoxes();
  }
  render();
})();

/* holiday, half-mast, pass and power notices shared by the state sites (iradgov.org/assets/irad-bar.js) */
(function () {
  var s = document.createElement("script");
  s.src = "https://iradgov.org/assets/irad-bar.js"; s.defer = true; s.setAttribute("data-kind", "gov");
  document.head.appendChild(s);
})();
