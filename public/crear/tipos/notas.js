/* Tipo: notas rápidas */
(function (M) {
  var esc = M.esc;
  function cat(i) {
    var c = M.C.categories || [];
    return c.length ? c[i % c.length] : "";
  }
  M.start({
    addLabel: "Guardar nota",
    views: ["tarjetas", "lista"],
    empty: "No hay notas. Escribe la primera arriba.",
    sample: function () {
      return [
        { id: M.uid(), title: "Ideas para el fin de semana", body: "Ir al parque, probar la receta nueva y ordenar el escritorio.", date: M.today(0), pin: true, cat: cat(0) },
        { id: M.uid(), title: "Libros por leer", body: "Hábitos atómicos, El principito.", date: M.today(-2), pin: false, cat: cat(1) },
      ];
    },
    form: function () {
      return '<input name="title" placeholder="Título" required autocomplete="off">' +
        '<textarea name="body" rows="2" placeholder="Escribe tu nota…"></textarea>';
    },
    read: function (f, C, ex) {
      var t = f.title.value.trim();
      return t ? { title: t, body: f.body.value.trim(), date: ex ? ex.date : M.today(0), pin: ex ? ex.pin : false } : null;
    },
    fill: function (f, it) {
      f.title.value = it.title;
      f.body.value = it.body || "";
    },
    sort: function (a, b) {
      return b.pin - a.pin || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
    },
    item: function (it) {
      return '<button type="button" class="pin' + (it.pin ? " on" : "") + '" data-act="fijar" aria-label="Fijar">' + (it.pin ? "★" : "☆") + "</button>" +
        '<div class="grow editable" data-act="editar"><strong>' + esc(it.title) + "</strong>" +
        (it.body ? '<p class="body">' + esc(it.body) + "</p>" : "") +
        '<span class="mut small">' + M.niceDate(it.date) + "</span></div>";
    },
    act: function (act, it) {
      if (act === "fijar") it.pin = !it.pin;
    },
    summary: function (items) {
      var pins = items.filter(function (i) { return i.pin; }).length;
      return '<div class="card stat"><span class="big">' + items.length + '</span><span class="mut">' + (items.length === 1 ? "nota" : "notas") + (pins ? " · " + pins + " fijadas" : "") + "</span></div>";
    },
    text: function (it) { return it.title + " " + it.body; },
    csvHead: ["Fecha", "Título", "Nota"],
    csv: function (it) { return [it.date, it.title, it.body]; },
  });
})(window.MicroApp);
