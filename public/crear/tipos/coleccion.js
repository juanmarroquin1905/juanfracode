/* Tipo: colección con los datos que elegiste (clientes, citas, recetas...).
   Los campos están en config.js → fields. Tipos: text, longtext, number, money,
   date, time, phone, stars, check, options. */
(function (M) {
  var C = M.C;
  var esc = M.esc;
  var F = C.fields || [];
  var main = F[0];

  function money(n) {
    return (C.currency || "$") + " " + Number(n || 0).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function input(f) {
    var name = ' name="' + esc(f.key) + '" aria-label="' + esc(f.label) + '"';
    var req = f === main ? " required" : "";
    switch (f.type) {
      case "longtext":
        return "<textarea" + name + ' rows="2" placeholder="' + esc(f.label) + '"' + req + "></textarea>";
      case "number":
        return '<input type="number" step="any" inputmode="decimal" class="narrow"' + name + ' placeholder="' + esc(f.label) + '"' + req + ">";
      case "money":
        return '<input type="number" step="0.01" min="0" inputmode="decimal" class="narrow"' + name + ' placeholder="' + esc(f.label) + " (" + esc(C.currency || "$") + ')"' + req + ">";
      case "date":
        return '<label class="field"><span>' + esc(f.label) + '</span><input type="date"' + name + ' value="' + M.today(0) + '"' + req + "></label>";
      case "time":
        return '<label class="field"><span>' + esc(f.label) + '</span><input type="time"' + name + req + "></label>";
      case "phone":
        return '<input type="tel" inputmode="tel"' + name + ' placeholder="' + esc(f.label) + '"' + req + ">";
      case "options":
        return "<select" + name + ">" + (f.options || []).map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
      case "stars":
      case "check":
        return "";
      default:
        return '<input autocomplete="off"' + name + ' placeholder="' + esc(f.label) + '"' + req + ">";
    }
  }
  function show(f, v) {
    if (v === "" || v == null) return "";
    switch (f.type) {
      case "money": return money(v);
      case "date": return "📅 " + M.niceDate(v);
      case "time": return "🕑 " + esc(v);
      case "phone": return '📞 <a href="tel:' + esc(String(v).replace(/[^\d+]/g, "")) + '">' + esc(v) + "</a>";
      case "number": return esc(f.label) + ": " + esc(v);
      default: return esc(v);
    }
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

  var dateField = null;
  F.forEach(function (f) { if (!dateField && f.type === "date") dateField = f; });

  M.start({
    addLabel: "Agregar",
    empty: "Todavía no hay nada. ¡Agrega el primero!",
    sample: sample,
    form: function () {
      return F.map(input).join("");
    },
    read: function (form) {
      var it = {};
      var ok = true;
      F.forEach(function (f) {
        var el = form.elements[f.key];
        var v = el ? el.value.trim() : "";
        if (f.type === "number" || f.type === "money") v = v === "" ? "" : parseFloat(v);
        if (f.type === "check") v = false;
        if (f.type === "stars") v = 0;
        if (f === main && !v) ok = false;
        it[f.key] = v;
      });
      return ok ? it : null;
    },
    sort: C.sortByDate && dateField ? function (a, b) {
      var x = a[dateField.key] || "9999", y = b[dateField.key] || "9999";
      return x < y ? -1 : x > y ? 1 : 0;
    } : null,
    item: function (it) {
      var title = "<strong>" + esc(it[main.key]) + "</strong>";
      var meta = [];
      var body = "";
      var extras = "";
      F.slice(1).forEach(function (f) {
        var v = it[f.key];
        if (f.type === "longtext") {
          if (v) body += '<p class="body">' + esc(v) + "</p>";
        } else if (f.type === "check") {
          extras += '<button type="button" class="toggle' + (v ? " on" : "") + '" data-act="check" data-key="' + esc(f.key) + '">' + (v ? "✓ " : "") + esc(f.label) + "</button>";
        } else if (f.type === "stars") {
          var s = "";
          for (var n = 1; n <= 5; n++) s += '<button type="button" class="star' + (n <= v ? " on" : "") + '" data-act="star" data-key="' + esc(f.key) + '" data-n="' + n + '" aria-label="' + n + ' estrellas">★</button>';
          extras += '<span class="stars">' + s + "</span>";
        } else {
          var txt = show(f, v);
          if (txt) meta.push('<span class="meta">' + txt + "</span>");
        }
      });
      return '<div class="grow">' + title + (meta.length ? '<div class="metas">' + meta.join("") + "</div>" : "") + body +
        (extras ? '<div class="extras">' + extras + "</div>" : "") + "</div>";
    },
    act: function (act, it, el) {
      var key = el.getAttribute("data-key");
      if (act === "check") it[key] = !it[key];
      if (act === "star") {
        var n = Number(el.getAttribute("data-n"));
        it[key] = it[key] === n ? 0 : n;
      }
    },
    summary: function (items) {
      var parts = ['<span class="big">' + items.length + '</span><span class="mut">' + esc(items.length === 1 ? C.itemName || "elemento" : C.itemPlural || "elementos") + "</span>"];
      var rows = "";
      F.forEach(function (f) {
        if (f.type === "money") {
          var t = 0;
          items.forEach(function (i) { t += Number(i[f.key]) || 0; });
          rows += '<div class="row"><span>' + esc(f.label) + ' (total)</span><strong>' + money(t) + "</strong></div>";
        }
        if (f.type === "check") {
          var d = items.filter(function (i) { return i[f.key]; }).length;
          var pct = items.length ? Math.round((d / items.length) * 100) : 0;
          rows += '<div class="row"><span>' + esc(f.label) + '</span><span class="mut">' + d + " de " + items.length + '</span></div><div class="bar"><i style="width:' + pct + '%"></i></div>';
        }
      });
      return '<div class="card stat"><div class="count">' + parts.join("") + "</div>" + rows + "</div>";
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
