/* Tipo: hábitos de la semana */
(function (M) {
  var esc = M.esc;
  var DAYS = ["D", "L", "M", "M", "J", "V", "S"];
  function cat(i) {
    var c = M.C.categories || [];
    return c.length ? c[i % c.length] : "";
  }
  function streak(it) {
    var n = 0;
    for (var i = 0; i < 365; i++) {
      if (it.days.indexOf(M.today(-i)) !== -1) n++;
      else if (i > 0) break;
    }
    return n;
  }
  M.start({
    addLabel: "Agregar hábito",
    empty: "Agrega un hábito que quieras repetir cada día.",
    sample: function () {
      return [
        { id: M.uid(), name: "Tomar 2 litros de agua", days: [M.today(-1), M.today(-2), M.today(-3)], cat: cat(0) },
        { id: M.uid(), name: "Leer 10 páginas", days: [M.today(0), M.today(-1)], cat: cat(1) },
        { id: M.uid(), name: "Dormir antes de las 11", days: [M.today(-2)], cat: cat(2) },
      ];
    },
    form: function () {
      return '<input name="name" placeholder="Nuevo hábito, ej: meditar 5 minutos" required autocomplete="off">';
    },
    read: function (f) {
      var t = f.name.value.trim();
      return t ? { name: t, days: [] } : null;
    },
    item: function (it) {
      var dots = "";
      for (var i = 6; i >= 0; i--) {
        var day = M.today(-i);
        var on = it.days.indexOf(day) !== -1;
        var d = new Date(day + "T12:00:00");
        dots += '<button type="button" class="day' + (on ? " on" : "") + (i === 0 ? " hoy" : "") + '" data-act="dia" data-day="' + day + '" aria-label="' + day + '">' + DAYS[d.getDay()] + "</button>";
      }
      var s = streak(it);
      return '<div class="grow"><strong>' + esc(it.name) + "</strong>" +
        '<span class="mut small">' + (s ? "🔥 " + s + (s === 1 ? " día seguido" : " días seguidos") : "Empieza hoy") + "</span></div>" +
        '<div class="days">' + dots + "</div>";
    },
    act: function (act, it, el) {
      if (act !== "dia") return;
      var day = el.getAttribute("data-day");
      var i = it.days.indexOf(day);
      if (i === -1) it.days.push(day);
      else it.days.splice(i, 1);
    },
    summary: function (items) {
      var t = M.today(0);
      var done = items.filter(function (i) { return i.days.indexOf(t) !== -1; }).length;
      var pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return '<div class="card stat"><span class="big">' + done + " de " + items.length + '</span><span class="mut">hábitos cumplidos hoy</span>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    },
    text: function (it) { return it.name; },
    csvHead: ["Hábito", "Días cumplidos", "Racha actual"],
    csv: function (it) { return [it.name, it.days.length, streak(it)]; },
  });
})(window.MicroApp);
