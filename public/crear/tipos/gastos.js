/* Tipo: control de gastos */
(function (M) {
  var esc = M.esc;
  function cat(i) {
    var c = M.C.categories || [];
    return c.length ? c[i % c.length] : "";
  }
  function money(n) {
    return (M.C.currency || "$") + " " + Number(n).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  M.start({
    addLabel: "Agregar gasto",
    empty: "Sin gastos todavía. Anota el primero.",
    sample: function () {
      return [
        { id: M.uid(), desc: "Supermercado", amount: 85.5, date: M.today(0), cat: cat(0) },
        { id: M.uid(), desc: "Pasaje de bus", amount: 3.2, date: M.today(-1), cat: cat(1) },
        { id: M.uid(), desc: "Cine con amigos", amount: 28, date: M.today(-3), cat: cat(2) },
      ];
    },
    form: function () {
      return '<input name="desc" placeholder="¿En qué gastaste?" required autocomplete="off">' +
        '<input name="amount" type="number" step="0.01" min="0" placeholder="Monto" required inputmode="decimal" class="narrow">';
    },
    read: function (f) {
      var d = f.desc.value.trim();
      var a = parseFloat(f.amount.value);
      return d && a > 0 ? { desc: d, amount: a, date: M.today(0) } : null;
    },
    sort: function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    },
    item: function (it) {
      return '<div class="grow"><strong>' + esc(it.desc) + '</strong><span class="mut small">' + M.niceDate(it.date) + "</span></div>" +
        '<span class="amount">' + money(it.amount) + "</span>";
    },
    summary: function (items) {
      var month = M.today(0).slice(0, 7);
      var total = 0;
      var byCat = {};
      items.forEach(function (i) {
        if (i.date.slice(0, 7) !== month) return;
        total += i.amount;
        if (i.cat) byCat[i.cat] = (byCat[i.cat] || 0) + i.amount;
      });
      var bars = Object.keys(byCat).map(function (c) {
        var pct = total ? Math.round((byCat[c] / total) * 100) : 0;
        return '<div class="row"><span>' + esc(c) + "</span><span class=\"mut\">" + money(byCat[c]) + '</span></div><div class="bar"><i style="width:' + pct + '%"></i></div>';
      }).join("");
      return '<div class="card stat"><span class="mut">Gastado este mes</span><span class="big">' + money(total) + "</span>" + bars + "</div>";
    },
    text: function (it) { return it.desc; },
    csvHead: ["Fecha", "Descripción", "Monto"],
    csv: function (it) { return [it.date, it.desc, it.amount]; },
  });
})(window.MicroApp);
