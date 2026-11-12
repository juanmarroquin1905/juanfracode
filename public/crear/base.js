/* Micro app web hecha con el creador de Juanfra Code (juanfracode.vercel.app/crear).
   Todo funciona en el navegador: los datos se guardan en este dispositivo (localStorage).
   La configuración (nombre, colores, funciones, link de pago) está en config.js. */
(function () {
  var C = window.APP_CONFIG;
  var KEY = "microapp:" + C.slug;
  var memory = {};

  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return memory[key] || null;
    }
  }
  function write(key, value) {
    memory[key] = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function has(feature) {
    return C.features.indexOf(feature) !== -1;
  }
  function today(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.toISOString().slice(0, 10);
  }
  function niceDate(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  }

  function start(type) {
    var root = document.getElementById("app");
    var state = { items: read(KEY), q: "", cat: "" };
    if (!state.items) state.items = type.sample();
    var theme = read(KEY + ":tema");
    if (theme && has("oscuro")) document.documentElement.setAttribute("data-theme", theme);

    function save() {
      write(KEY, state.items);
    }
    function find(id) {
      for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
      return null;
    }

    var cats = has("categorias") ? C.categories : [];

    root.innerHTML =
      '<div class="wrap">' +
      '<header class="top">' +
      '<div class="brand"><span class="logo">' + esc(C.emoji) + "</span>" +
      "<div><h1>" + esc(C.name) + "</h1>" + (C.description ? "<p>" + esc(C.description) + "</p>" : "") + "</div></div>" +
      '<div class="actions">' +
      (has("oscuro") ? '<button type="button" class="ghost" data-ui="tema" aria-label="Cambiar tema">🌙</button>' : "") +
      (has("exportar") ? '<button type="button" class="ghost" data-ui="exportar">Exportar</button>' : "") +
      (C.pay && C.pay.url ? '<a class="buy" href="' + esc(C.pay.url) + '" target="_blank" rel="noopener">' + esc(C.pay.label || "Comprar") + "</a>" : "") +
      "</div></header>" +
      '<section class="summary" data-ui="resumen"></section>' +
      '<form class="add card" data-ui="form">' + type.form(C) +
      (cats.length ? '<select name="cat" aria-label="Categoría">' + cats.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + "</select>" : "") +
      '<button type="submit" class="primary">' + esc(type.addLabel || "Agregar") + "</button></form>" +
      ((has("buscar") || cats.length) ? '<div class="tools">' +
        (has("buscar") ? '<input type="search" placeholder="Buscar…" data-ui="buscar" aria-label="Buscar">' : "") +
        (cats.length ? '<div class="chips" data-ui="cats"></div>' : "") + "</div>" : "") +
      '<ul class="list" data-ui="lista"></ul>' +
      '<p class="empty" data-ui="vacio" hidden>' + esc(type.empty || "Todavía no hay nada aquí.") + "</p>" +
      (C.pay && C.pay.url && C.pay.text ? '<aside class="card promo"><p>' + esc(C.pay.text) + '</p><a class="buy" href="' + esc(C.pay.url) + '" target="_blank" rel="noopener">' + esc(C.pay.label || "Comprar") + "</a></aside>" : "") +
      (C.credit ? '<footer class="foot">Hecho con <a href="https://juanfracode.vercel.app/crear" target="_blank" rel="noopener">Juanfra Code</a></footer>' : "") +
      "</div>";

    function ui(name) {
      return root.querySelector('[data-ui="' + name + '"]');
    }

    function render() {
      var q = state.q.toLowerCase();
      var shown = state.items.filter(function (it) {
        if (state.cat && it.cat !== state.cat) return false;
        if (q && JSON.stringify(type.text ? type.text(it) : it).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      if (type.sort) shown.sort(type.sort);
      ui("lista").innerHTML = shown
        .map(function (it) {
          return '<li class="item card" data-id="' + esc(it.id) + '">' + type.item(it, C) +
            (cats.length && it.cat ? '<span class="tag">' + esc(it.cat) + "</span>" : "") +
            '<button type="button" class="del" data-act="borrar" aria-label="Borrar">×</button></li>';
        })
        .join("");
      ui("vacio").hidden = shown.length > 0;
      ui("resumen").innerHTML = type.summary ? type.summary(state.items, C) : "";
      var chips = ui("cats");
      if (chips) {
        chips.innerHTML = ["Todas"].concat(cats).map(function (c) {
          var value = c === "Todas" ? "" : c;
          return '<button type="button" data-cat="' + esc(value) + '" class="chip' + (state.cat === value ? " on" : "") + '">' + esc(c) + "</button>";
        }).join("");
      }
      var t = ui("tema");
      if (t) t.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    }

    ui("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      var item = type.read(form, C);
      if (!item) return;
      item.id = uid();
      if (form.cat) item.cat = form.cat.value;
      state.items.unshift(item);
      save();
      form.reset();
      render();
      var first = form.querySelector("input,textarea");
      if (first) first.focus();
    });

    root.addEventListener("click", function (e) {
      var el = e.target.closest("[data-act],[data-cat],[data-ui]");
      if (!el) return;
      if (el.hasAttribute("data-cat")) {
        state.cat = el.getAttribute("data-cat");
        return render();
      }
      var uiName = el.getAttribute("data-ui");
      if (uiName === "tema") {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        write(KEY + ":tema", next);
        return render();
      }
      if (uiName === "exportar") return exportCsv();
      var act = el.getAttribute("data-act");
      if (!act) return;
      var li = el.closest("[data-id]");
      var it = li && find(li.getAttribute("data-id"));
      if (!it) return;
      if (act === "borrar") {
        if (!confirm("¿Borrar este elemento?")) return;
        state.items = state.items.filter(function (x) { return x !== it; });
      } else if (type.act) {
        type.act(act, it, el, C);
      }
      save();
      render();
    });

    var search = ui("buscar");
    if (search) search.addEventListener("input", function () {
      state.q = search.value;
      render();
    });

    function exportCsv() {
      var rows = [type.csvHead.concat(cats.length ? ["Categoría"] : [])].concat(
        state.items.map(function (it) {
          return type.csv(it, C).concat(cats.length ? [it.cat || ""] : []);
        })
      );
      var csv = rows.map(function (r) {
        return r.map(function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(",");
      }).join("\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
      a.download = C.slug + ".csv";
      a.click();
    }

    render();
  }

  window.MicroApp = { C: C, esc: esc, uid: uid, has: has, today: today, niceDate: niceDate, start: start };
})();
