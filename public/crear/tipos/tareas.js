/* Tipo: lista de tareas */
(function (M) {
  var esc = M.esc;
  function cat(i) {
    var c = M.C.categories || [];
    return c.length ? c[i % c.length] : "";
  }
  M.start({
    addLabel: "Agregar",
    empty: "No hay tareas. ¡Agrega la primera!",
    sample: function () {
      return [
        { id: M.uid(), text: "Comprar fruta y pan", done: false, cat: cat(0) },
        { id: M.uid(), text: "Responder correos pendientes", done: true, cat: cat(1) },
        { id: M.uid(), text: "Salir a caminar 20 minutos", done: false, cat: cat(2) },
      ];
    },
    form: function () {
      return '<input name="text" placeholder="¿Qué tienes que hacer?" required autocomplete="off">';
    },
    read: function (f, C, ex) {
      var t = f.text.value.trim();
      return t ? { text: t, done: ex ? ex.done : false } : null;
    },
    fill: function (f, it) {
      f.text.value = it.text;
    },
    sort: function (a, b) {
      return a.done - b.done;
    },
    item: function (it) {
      return '<button type="button" class="check' + (it.done ? " on" : "") + '" data-act="hecha" aria-label="Marcar">' + (it.done ? M.icon("check") : "") + "</button>" +
        '<span class="grow editable' + (it.done ? " done" : "") + '" data-act="editar">' + esc(it.text) + "</span>";
    },
    act: function (act, it) {
      if (act === "hecha") it.done = !it.done;
    },
    summary: function (items) {
      var done = items.filter(function (i) { return i.done; }).length;
      var pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return '<div class="card stat"><span class="big">' + done + " de " + items.length + '</span><span class="mut">tareas hechas</span>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
    },
    text: function (it) { return it.text; },
    csvHead: ["Tarea", "Hecha"],
    csv: function (it) { return [it.text, it.done ? "Sí" : "No"]; },
  });
})(window.MicroApp);
