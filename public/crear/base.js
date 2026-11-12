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
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function iso(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function today(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return iso(d);
  }
  function niceDate(value) {
    var d = new Date(value + "T12:00:00");
    if (isNaN(d)) return esc(value);
    var diff = Math.round((d - new Date(today(0) + "T12:00:00")) / 86400000);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff === -1) return "Ayer";
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  }

  // Íconos (trazos simples, toman el color del texto)
  var ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M18 7l-1 13H7L6 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    tarjetas: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    tabla: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    tablero: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    bag: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  };
  function icon(name) {
    return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  var VIEW_NAMES = { lista: "Lista", tarjetas: "Tarjetas", tabla: "Tabla", tablero: "Tablero", calendario: "Calendario" };

  function start(type) {
    var root = document.getElementById("app");
    var views = type.views || ["lista"];
    var state = {
      items: read(KEY),
      q: "",
      cat: "",
      view: read(KEY + ":vista") || C.view || views[0],
      editing: null,
      fresh: null,
      month: today(0).slice(0, 7),
      day: today(0),
    };
    if (!state.items) state.items = type.sample();
    if (views.indexOf(state.view) === -1) state.view = views[0];
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
    var item = C.itemName || "elemento";
    var pay = C.pay && C.pay.url;

    root.innerHTML =
      '<div class="wrap">' +
      '<header class="top">' +
      '<div class="brand"><span class="logo">' + esc(C.emoji) + "</span>" +
      "<div><h1>" + esc(C.name) + "</h1>" + (C.description ? "<p>" + esc(C.description) + "</p>" : "") + "</div></div>" +
      '<div class="actions">' +
      (has("oscuro") ? '<button type="button" class="icon-btn" data-ui="tema" aria-label="Cambiar tema"></button>' : "") +
      (has("exportar") ? '<button type="button" class="ghost" data-ui="exportar">' + icon("download") + "<span>Exportar</span></button>" : "") +
      (pay ? '<a class="buy" href="' + esc(C.pay.url) + '" target="_blank" rel="noopener">' + icon("bag") + esc(C.pay.label || "Comprar") + "</a>" : "") +
      '<button type="button" class="primary add-btn" data-ui="nuevo">' + icon("plus") + "<span>" + esc(type.addLabel || "Agregar") + "</span></button>" +
      "</div></header>" +
      '<section class="summary" data-ui="resumen"></section>' +
      '<div class="sheet-back" data-ui="cerrar"></div>' +
      '<form class="add card" data-ui="form" autocomplete="off">' +
      '<div class="sheet-head"><strong data-ui="titulo">Agregar ' + esc(item) + '</strong><button type="button" class="icon-btn" data-ui="cerrar" aria-label="Cerrar">' + icon("x") + "</button></div>" +
      '<div class="fields">' + type.form(C) +
      (cats.length ? '<select name="cat" aria-label="Categoría">' + cats.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + "</select>" : "") +
      '</div><div class="form-actions"><button type="button" class="ghost cancel" data-ui="cancelar" hidden>Cancelar</button>' +
      '<button type="submit" class="primary" data-ui="enviar">' + icon("plus") + "<span>" + esc(type.addLabel || "Agregar") + "</span></button></div></form>" +
      '<div class="tools">' +
      (has("buscar") ? '<label class="search">' + icon("search") + '<input type="search" placeholder="Buscar…" data-ui="buscar" aria-label="Buscar"></label>' : "") +
      (views.length > 1 ? '<div class="views" role="tablist" data-ui="vistas"></div>' : "") +
      (cats.length ? '<div class="chips" data-ui="cats"></div>' : "") +
      "</div>" +
      '<div data-ui="lista"></div>' +
      '<div class="empty" data-ui="vacio" hidden><span class="empty-emoji">' + esc(C.emoji) + "</span><strong>" + esc(type.empty || "Todavía no hay nada aquí") + '</strong><span class="mut">Toca <b>+ ' + esc(type.addLabel || "Agregar") + '</b> para empezar.</span></div>' +
      (pay && C.pay.text ? '<aside class="card promo"><p>' + esc(C.pay.text) + '</p><a class="buy" href="' + esc(C.pay.url) + '" target="_blank" rel="noopener">' + esc(C.pay.label || "Comprar") + "</a></aside>" : "") +
      (C.credit ? '<footer class="foot">Hecho con <a href="https://juanfracode.vercel.app/crear" target="_blank" rel="noopener">Juanfra Code</a></footer>' : "") +
      "</div>" +
      '<button type="button" class="fab" data-ui="nuevo" aria-label="Agregar">' + icon("plus") + "</button>" +
      '<div class="toast" data-ui="toast" role="status" aria-live="polite"></div>';

    function ui(name) {
      return root.querySelector('[data-ui="' + name + '"]');
    }
    var form = ui("form");

    var api = {
      state: state,
      icon: icon,
      esc: esc,
      cats: cats,
      row: function (it) {
        return '<li class="item card' + (state.fresh === it.id ? " nuevo" : "") + '" data-id="' + esc(it.id) + '">' + type.item(it, C) +
          (cats.length && it.cat ? '<span class="tag">' + esc(it.cat) + "</span>" : "") +
          '<button type="button" class="del" data-act="borrar" aria-label="Borrar">' + icon("trash") + "</button></li>";
      },
    };

    function render() {
      var q = state.q.toLowerCase();
      var shown = state.items.filter(function (it) {
        if (state.cat && it.cat !== state.cat) return false;
        if (q && String(type.text ? type.text(it) : JSON.stringify(it)).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      if (type.sort) shown.sort(type.sort);
      var box = ui("lista");
      var custom = type.view && (state.view === "tabla" || state.view === "tablero" || state.view === "calendario");
      if (custom) {
        box.className = "view view-" + state.view;
        box.innerHTML = type.view(state.view, shown, api);
      } else {
        box.className = "view";
        box.innerHTML = '<ul class="list ' + (state.view === "tarjetas" ? "grid" : "") + '">' + shown.map(api.row).join("") + "</ul>";
      }
      ui("vacio").hidden = shown.length > 0 || (custom && state.view === "calendario");
      ui("resumen").innerHTML = type.summary ? type.summary(state.items, C) : "";
      var chips = ui("cats");
      if (chips) {
        chips.innerHTML = ["Todas"].concat(cats).map(function (c) {
          var value = c === "Todas" ? "" : c;
          return '<button type="button" data-cat="' + esc(value) + '" class="chip' + (state.cat === value ? " on" : "") + '">' + esc(c) + "</button>";
        }).join("");
      }
      var vs = ui("vistas");
      if (vs) {
        vs.innerHTML = views.map(function (v) {
          return '<button type="button" role="tab" aria-selected="' + (state.view === v) + '" data-vista="' + v + '" title="' + VIEW_NAMES[v] + '">' + icon(v) + "<span>" + VIEW_NAMES[v] + "</span></button>";
        }).join("");
      }
      var t = ui("tema");
      if (t) t.innerHTML = icon(document.documentElement.getAttribute("data-theme") === "dark" ? "sun" : "moon");
      if (type.afterRender) type.afterRender(box, api, change);
      state.fresh = null;
    }

    function change() {
      save();
      render();
    }

    var toastTimer;
    function toast(msg, undo) {
      var el = ui("toast");
      el.innerHTML = icon("check") + "<span>" + esc(msg) + "</span>" + (undo ? '<button type="button" data-ui="deshacer">Deshacer</button>' : "");
      el.classList.add("show");
      el._undo = undo || null;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        el.classList.remove("show");
        el._undo = null;
      }, undo ? 5000 : 2200);
    }

    function openForm(editing) {
      state.editing = editing || null;
      ui("titulo").textContent = editing ? "Editar " + item : "Agregar " + item;
      ui("enviar").querySelector("span").textContent = editing ? "Guardar" : type.addLabel || "Agregar";
      ui("cancelar").hidden = !editing;
      if (editing) {
        if (type.fill) type.fill(form, editing, C);
        if (form.cat && editing.cat) form.cat.value = editing.cat;
      }
      root.classList.add("sheet-open");
      var first = form.querySelector("input,textarea");
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
    function closeForm() {
      state.editing = null;
      form.reset();
      ui("titulo").textContent = "Agregar " + item;
      ui("enviar").querySelector("span").textContent = type.addLabel || "Agregar";
      ui("cancelar").hidden = true;
      root.classList.remove("sheet-open");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var editing = state.editing;
      var data = type.read(form, C, editing);
      if (!data) return;
      if (form.cat) data.cat = form.cat.value;
      if (editing) {
        for (var k in data) editing[k] = data[k];
        toast("Cambios guardados");
      } else {
        data.id = uid();
        state.items.unshift(data);
        state.fresh = data.id;
        toast("Agregado");
      }
      closeForm();
      change();
    });

    root.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      var el = e.target.closest("[data-act],[data-cat],[data-ui],[data-vista]");
      if (!el) return;
      if (el.hasAttribute("data-cat")) {
        state.cat = el.getAttribute("data-cat");
        return render();
      }
      if (el.hasAttribute("data-vista")) {
        state.view = el.getAttribute("data-vista");
        write(KEY + ":vista", state.view);
        return render();
      }
      var name = el.getAttribute("data-ui");
      if (name === "tema") {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        write(KEY + ":tema", next);
        return render();
      }
      if (name === "exportar") return exportCsv();
      if (name === "nuevo") return openForm(null);
      if (name === "cerrar" || name === "cancelar") return closeForm();
      if (name === "deshacer") {
        var t = ui("toast");
        if (t._undo) t._undo();
        t.classList.remove("show");
        return;
      }
      if (name && type.ui && type.ui(name, el, state)) return render();
      var act = el.getAttribute("data-act");
      if (!act) return;
      var holder = el.closest("[data-id]");
      var it = holder && find(holder.getAttribute("data-id"));
      if (!it) return;
      if (act === "editar") return type.fill ? openForm(it) : null;
      if (act === "borrar") {
        var index = state.items.indexOf(it);
        state.items.splice(index, 1);
        change();
        toast("Eliminado", function () {
          state.items.splice(index, 0, it);
          change();
        });
        return;
      }
      if (type.act) type.act(act, it, el, C);
      change();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("sheet-open")) closeForm();
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
      toast("Archivo descargado");
    }

    render();
  }

  window.MicroApp = { C: C, esc: esc, uid: uid, has: has, today: today, iso: iso, niceDate: niceDate, icon: icon, start: start };
})();
