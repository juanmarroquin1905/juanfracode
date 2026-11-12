/* Tipo: colección con los datos que elegiste (clientes, citas, recetas...).
   Los campos están en config.js → fields. Tipos: text, longtext, number, money,
   date, time, phone, stars, check, options.
   Vistas: lista, tarjetas, tabla, tablero (por opciones o sí/no) y calendario (por fecha). */
(function (M) {
  var C = M.C;
  var esc = M.esc;
  var icon = M.icon;
  var F = C.fields || [];
  var main = F[0];
  var MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  function first(type) {
    for (var i = 1; i < F.length; i++) if (F[i].type === type) return F[i];
    return null;
  }
  var dateField = first("date");
  var boardField = first("options") || first("check");

  var views = ["lista", "tarjetas", "tabla"];
  if (boardField) views.push("tablero");
  if (dateField) views.push("calendario");

  function money(n) {
    return (C.currency || "$") + " " + Number(n || 0).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function input(f) {
    var name = ' name="' + esc(f.key) + '" aria-label="' + esc(f.label) + '"';
    var req = f === main ? " required" : "";
    var label = function (html) {
      return '<label class="field' + (f.type === "longtext" ? " wide" : "") + '"><span>' + esc(f.label) + "</span>" + html + "</label>";
    };
    switch (f.type) {
      case "longtext":
        return label("<textarea" + name + ' rows="2"' + req + "></textarea>");
      case "number":
        return label('<input type="number" step="any" inputmode="decimal"' + name + req + ">");
      case "money":
        return label('<input type="number" step="0.01" min="0" inputmode="decimal"' + name + ' placeholder="' + esc(C.currency || "$") + '"' + req + ">");
      case "date":
        return label('<input type="date"' + name + ' value="' + M.today(0) + '"' + req + ">");
      case "time":
        return label('<input type="time"' + name + req + ">");
      case "phone":
        return label('<input type="tel" inputmode="tel"' + name + req + ">");
      case "options":
        return label("<select" + name + ">" + (f.options || []).map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>");
      case "check":
        return '<label class="field check-field"><input type="checkbox"' + name + "><span>" + esc(f.label) + "</span></label>";
      case "stars":
        return "";
      default:
        return label('<input autocomplete="off"' + name + req + ">");
    }
  }
  function show(f, v, plain) {
    if (v === "" || v == null) return "";
    if (plain && f.type === "number") return esc(v);
    switch (f.type) {
      case "money": return money(v);
      case "date": return icon("calendario") + M.niceDate(v);
      case "time": return "🕑 " + esc(v);
      case "phone": return '📞 <a href="tel:' + esc(String(v).replace(/[^\d+]/g, "")) + '">' + esc(v) + "</a>";
      case "number": return esc(f.label) + ": <b>" + esc(v) + "</b>";
      case "options": return '<span class="pill">' + esc(v) + "</span>";
      default: return esc(v);
    }
  }
  function stars(f, v) {
    var s = "";
    for (var n = 1; n <= 5; n++) s += '<button type="button" class="star' + (n <= v ? " on" : "") + '" data-act="star" data-key="' + esc(f.key) + '" data-n="' + n + '" aria-label="' + n + ' estrellas">★</button>';
    return '<span class="stars">' + s + "</span>";
  }
  function toggle(f, v) {
    return '<button type="button" class="toggle' + (v ? " on" : "") + '" data-act="check" data-key="' + esc(f.key) + '">' + (v ? icon("check") : "") + esc(f.label) + "</button>";
  }
  function sample() {
    return (C.samples || []).map(function (s, i) {
      var it = { id: M.uid() };
      F.forEach(function (f) {
        var v = s[f.key];
        if (f.type === "date" && typeof v === "number") v = M.today(v);
        if (v == null) v = f.type === "check" ? false : f.type === "stars" ? 0 : "";
        it[f.key] = v;
      });
      var cats = C.categories || [];
      if (cats.length) it.cat = cats[i % cats.length];
      return it;
    });
  }

  // Contenido de un elemento (lista y tarjetas)
  function body(it, compact) {
    var meta = [];
    var text = "";
    var extras = "";
    F.slice(1).forEach(function (f) {
      var v = it[f.key];
      if (compact && f === boardField) return; // en el tablero la columna ya lo dice
      if (f.type === "longtext") {
        if (v && !compact) text += '<p class="body">' + esc(v) + "</p>";
      } else if (f.type === "check") {
        if (!compact) extras += toggle(f, v);
      } else if (f.type === "stars") {
        if (!compact || v) extras += stars(f, v);
      } else {
        var t = show(f, v);
        if (t) meta.push('<span class="meta">' + t + "</span>");
      }
    });
    if (compact) meta = meta.slice(0, 3);
    return '<div class="grow editable" data-act="editar"><strong>' + esc(it[main.key]) + "</strong>" +
      (meta.length ? '<div class="metas">' + meta.join("") + "</div>" : "") + text + "</div>" +
      (extras ? '<div class="extras">' + extras + "</div>" : "");
  }

  // Tablero: columnas por opción (o Pendiente / Hecho)
  function columns() {
    if (boardField.type === "options") return (boardField.options || []).map(function (o) { return { value: o, label: o }; });
    return [{ value: false, label: "Pendiente" }, { value: true, label: boardField.label }];
  }
  function colOf(it) {
    var v = it[boardField.key];
    return boardField.type === "check" ? !!v : v;
  }

  function table(items) {
    var head = F.map(function (f) { return "<th>" + esc(f.label) + "</th>"; }).join("");
    var rows = items.map(function (it) {
      return '<tr data-id="' + esc(it.id) + '">' + F.map(function (f, i) {
        var v = it[f.key];
        var cell;
        if (i === 0) cell = '<button type="button" class="link" data-act="editar">' + esc(v) + "</button>";
        else if (f.type === "check") cell = '<button type="button" class="mini-check' + (v ? " on" : "") + '" data-act="check" data-key="' + esc(f.key) + '" aria-label="' + esc(f.label) + '">' + (v ? icon("check") : "") + "</button>";
        else if (f.type === "stars") cell = stars(f, v);
        else if (f.type === "longtext") cell = '<span class="clip">' + esc(v) + "</span>";
        else cell = show(f, v, true);
        return '<td class="t-' + f.type + '">' + cell + "</td>";
      }).join("") + '<td class="t-del"><button type="button" class="del" data-act="borrar" aria-label="Borrar">' + icon("trash") + "</button></td></tr>";
    }).join("");
    return '<div class="table-wrap card"><table><thead><tr>' + head + "<th></th></tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function board(items) {
    var cols = columns();
    return '<div class="board">' + cols.map(function (c, ci) {
      var list = items.filter(function (it) { return colOf(it) === c.value; });
      return '<section class="col" data-col="' + ci + '"><header><span>' + esc(c.label) + '</span><span class="count">' + list.length + "</span></header>" +
        '<div class="col-body">' + list.map(function (it) {
          return '<article class="kcard card" draggable="true" data-id="' + esc(it.id) + '">' + body(it, true) +
            '<footer><button type="button" class="del" data-act="borrar" aria-label="Borrar">' + icon("trash") + "</button>" +
            (cols.length > 1 ? '<button type="button" class="move" data-act="mover" aria-label="Mover a la siguiente columna">' + icon("arrow") + "</button>" : "") +
            "</footer></article>";
        }).join("") + '<p class="col-empty">Arrastra aquí</p></div></section>';
    }).join("") + "</div>";
  }

  function calendar(items, api) {
    var st = api.state;
    var y = Number(st.month.slice(0, 4));
    var m = Number(st.month.slice(5, 7)) - 1;
    var firstDay = new Date(y, m, 1);
    var startCol = (firstDay.getDay() + 6) % 7; // lunes primero
    var days = new Date(y, m + 1, 0).getDate();
    var byDay = {};
    items.forEach(function (it) {
      var d = it[dateField.key];
      if (d) (byDay[d] = byDay[d] || []).push(it);
    });
    var cells = "";
    for (var i = 0; i < startCol; i++) cells += '<span class="cal-cell off"></span>';
    for (var d = 1; d <= days; d++) {
      var key = M.iso(new Date(y, m, d));
      var list = byDay[key] || [];
      cells += '<button type="button" class="cal-cell' + (key === st.day ? " sel" : "") + (key === M.today(0) ? " today" : "") + (list.length ? " has" : "") +
        '" data-ui="dia" data-day="' + key + '"><span class="n">' + d + '</span><span class="dots">' +
        list.slice(0, 3).map(function () { return "<i></i>"; }).join("") + "</span>" +
        (list.length ? '<span class="peek">' + esc(list[0][main.key]) + (list.length > 1 ? " +" + (list.length - 1) : "") + "</span>" : "") +
        "</button>";
    }
    var sel = byDay[st.day] || [];
    var label = new Date(st.day + "T12:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
    return '<div class="calendar card"><div class="cal-head"><button type="button" class="icon-btn" data-ui="mes-prev" aria-label="Mes anterior">' + icon("left") +
      "</button><strong>" + MONTHS[m] + " " + y + '</strong><button type="button" class="icon-btn" data-ui="mes-next" aria-label="Mes siguiente">' + icon("right") + "</button></div>" +
      '<div class="cal-grid">' + ["L", "M", "M", "J", "V", "S", "D"].map(function (w) { return '<span class="wd">' + w + "</span>"; }).join("") + cells + "</div></div>" +
      '<h3 class="day-title">' + esc(label) + '</h3><ul class="list">' + (sel.length ? sel.map(api.row).join("") : '<li class="day-empty">Nada para este día.</li>') + "</ul>";
  }

  M.start({
    addLabel: "Agregar",
    empty: "Todavía no hay nada aquí",
    views: views,
    sample: sample,
    form: function () {
      return F.map(input).join("");
    },
    read: function (form, C, ex) {
      var it = {};
      var ok = true;
      F.forEach(function (f) {
        var el = form.elements[f.key];
        var v = el ? (f.type === "check" ? el.checked : el.value.trim()) : "";
        if (f.type === "number" || f.type === "money") v = v === "" ? "" : parseFloat(v);
        if (f.type === "stars") v = ex ? ex[f.key] || 0 : 0;
        if (f === main && !v) ok = false;
        it[f.key] = v;
      });
      return ok ? it : null;
    },
    fill: function (form, it) {
      F.forEach(function (f) {
        var el = form.elements[f.key];
        if (!el) return;
        if (f.type === "check") el.checked = !!it[f.key];
        else el.value = it[f.key] == null ? "" : it[f.key];
      });
    },
    sort: C.sortByDate && dateField ? function (a, b) {
      var x = a[dateField.key] || "9999", y = b[dateField.key] || "9999";
      return x < y ? -1 : x > y ? 1 : 0;
    } : null,
    item: function (it) {
      return body(it, false);
    },
    view: function (view, items, api) {
      if (view === "tabla") return table(items);
      if (view === "tablero") return board(items);
      return calendar(items, api);
    },
    ui: function (name, el, state) {
      if (name === "dia") {
        state.day = el.getAttribute("data-day");
        return true;
      }
      if (name === "mes-prev" || name === "mes-next") {
        var y = Number(state.month.slice(0, 4));
        var m = Number(state.month.slice(5, 7)) - 1 + (name === "mes-next" ? 1 : -1);
        var d = new Date(y, m, 1);
        state.month = M.iso(d).slice(0, 7);
        state.day = state.month === M.today(0).slice(0, 7) ? M.today(0) : M.iso(d);
        return true;
      }
      return false;
    },
    act: function (act, it, el) {
      var key = el.getAttribute("data-key");
      if (act === "check") it[key] = !it[key];
      if (act === "star") {
        var n = Number(el.getAttribute("data-n"));
        it[key] = it[key] === n ? 0 : n;
      }
      if (act === "mover") {
        var cols = columns();
        var i = 0;
        for (var c = 0; c < cols.length; c++) if (cols[c].value === colOf(it)) i = c;
        it[boardField.key] = cols[(i + 1) % cols.length].value;
      }
    },
    // Arrastrar tarjetas entre columnas del tablero (en computadora)
    afterRender: function (box, api, change) {
      if (api.state.view !== "tablero") return;
      var dragId = null;
      box.querySelectorAll(".kcard").forEach(function (card) {
        card.addEventListener("dragstart", function (e) {
          dragId = card.getAttribute("data-id");
          card.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
        });
        card.addEventListener("dragend", function () {
          card.classList.remove("dragging");
        });
      });
      box.querySelectorAll(".col").forEach(function (col) {
        col.addEventListener("dragover", function (e) {
          e.preventDefault();
          col.classList.add("over");
        });
        col.addEventListener("dragleave", function () {
          col.classList.remove("over");
        });
        col.addEventListener("drop", function (e) {
          e.preventDefault();
          col.classList.remove("over");
          var target = columns()[Number(col.getAttribute("data-col"))];
          api.state.items.forEach(function (it) {
            if (it.id === dragId) it[boardField.key] = target.value;
          });
          change();
        });
      });
    },
    summary: function (items) {
      var stats = '<div class="stat-main"><span class="big">' + items.length + '</span><span class="mut">' + esc(items.length === 1 ? C.itemName || "elemento" : C.itemPlural || "elementos") + "</span></div>";
      var rows = "";
      F.forEach(function (f) {
        if (f.type === "money") {
          var t = 0;
          items.forEach(function (i) { t += Number(i[f.key]) || 0; });
          rows += '<div class="stat-box"><span class="mut">' + esc(f.label) + ' total</span><strong>' + money(t) + "</strong></div>";
        }
        if (f.type === "check") {
          var d = items.filter(function (i) { return i[f.key]; }).length;
          var pct = items.length ? Math.round((d / items.length) * 100) : 0;
          rows += '<div class="stat-box"><span class="mut">' + esc(f.label) + "</span><strong>" + d + " de " + items.length + '</strong><div class="bar"><i style="width:' + pct + '%"></i></div></div>';
        }
      });
      return '<div class="card stat">' + stats + (rows ? '<div class="stat-row">' + rows + "</div>" : "") + "</div>";
    },
    text: function (it) {
      return F.map(function (f) { return it[f.key]; }).join(" ");
    },
    csvHead: F.map(function (f) { return f.label; }),
    csv: function (it) {
      return F.map(function (f) {
        var v = it[f.key];
        return f.type === "check" ? (v ? "Sí" : "No") : v;
      });
    },
  });
})(window.MicroApp);
