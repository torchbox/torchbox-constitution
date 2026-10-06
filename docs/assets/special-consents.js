// Enhances the Special Consents markdown table: category headings, filters,
// level tags, and a toggle on each row to show/hide its rationale.
// Without JS the page falls back to the plain markdown table.
(function () {
  var LEVELS = {
    "Supermajority 75%": "super",
    "Majority": "majority",
    "Consulted": "consulted",
    "Informed": "informed",
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function enhance(table, tableIndex) {
    var heads = [].map.call(table.querySelectorAll("thead th"), function (th) {
      return th.textContent.trim();
    });
    table.classList.add("sc-table");
    // Keep column headers consistent: no glossary underline on just one of them
    table.tHead.classList.add("no-glossary");

    var rows = [].slice.call(table.querySelectorAll("tbody tr"));
    var cats = [];

    rows.forEach(function (tr, i) {
      var td = tr.children;
      var cat = td[0].textContent.trim();
      tr.dataset.cat = cat;

      if (cats.indexOf(cat) < 0) {
        cats.push(cat);
        var groupRow = el("tr", "sc-group");
        groupRow.dataset.cat = cat;
        var groupHead = el("th", null, cat);
        groupHead.colSpan = heads.length;
        groupHead.scope = "colgroup";
        groupRow.appendChild(groupHead);
        tr.parentNode.insertBefore(groupRow, tr);
      }

      // Consent matter becomes a disclosure button controlling the rationale
      var id = "sc-why-" + tableIndex + "-" + i;
      // no-glossary: glossary terms are focusable and must not nest inside a button
      var toggle = el("button", "sc-toggle no-glossary");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", id);
      toggle.innerHTML = td[1].innerHTML;

      var why = el("div", "sc-why");
      why.id = id;
      why.hidden = true;
      why.appendChild(el("strong", null, "Rationale: "));
      why.insertAdjacentHTML("beforeend", td[5].innerHTML);

      td[1].textContent = "";
      td[1].appendChild(toggle);
      td[1].appendChild(why);

      [2, 3, 4].forEach(function (c) {
        var value = td[c].textContent.trim();
        var level = LEVELS[value];
        td[c].dataset.who = heads[c];
        td[c].textContent = "";
        if (level) {
          td[c].appendChild(el("span", "sc-lv sc-lv--" + level + " no-glossary", value));
        } else {
          var none = el("span", "sc-lv sc-lv--none");
          none.appendChild(el("span", null, "—")).setAttribute("aria-hidden", "true");
          none.appendChild(el("span", "sc-sr", "Not involved"));
          td[c].appendChild(none);
        }
      });

      function setOpen(open) {
        tr.classList.toggle("sc-row-open", open);
        toggle.setAttribute("aria-expanded", open);
        why.hidden = !open;
      }

      toggle.addEventListener("click", function () {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
      });

      // Let the whole row act as a click target, without stealing clicks
      // from the button itself, links or glossary terms
      tr.addEventListener("click", function (e) {
        if (e.target.closest("button, a, .glossary-term")) return;
        if (window.getSelection && String(window.getSelection())) return;
        toggle.click();
      });
    });

    // Category filters
    var bar = el("div", "sc-filters no-glossary");
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter by category");
    var status = el("p", "sc-sr");
    status.setAttribute("aria-live", "polite");

    ["All"].concat(cats).forEach(function (cat) {
      var chip = el("button", "sc-chip", cat);
      chip.type = "button";
      chip.setAttribute("aria-pressed", cat === "All");
      chip.addEventListener("click", function () {
        bar.querySelectorAll(".sc-chip").forEach(function (other) {
          other.setAttribute("aria-pressed", other === chip);
        });
        var shown = 0;
        table.querySelectorAll("tbody tr").forEach(function (tr) {
          tr.hidden = cat !== "All" && tr.dataset.cat !== cat;
          if (!tr.hidden && !tr.classList.contains("sc-group")) shown++;
        });
        status.textContent =
          "Showing " + shown + " consent" + (shown === 1 ? "" : "s") +
          (cat === "All" ? "" : " in " + cat);
      });
      bar.appendChild(chip);
    });

    var wrap = table.closest(".md-typeset__scrollwrap") || table;
    wrap.parentNode.insertBefore(bar, wrap);
    wrap.parentNode.insertBefore(status, wrap);
  }

  function init() {
    document.querySelectorAll(".md-typeset table").forEach(function (table, i) {
      if (table.classList.contains("sc-table")) return;
      var heads = [].map.call(table.querySelectorAll("thead th"), function (th) {
        return th.textContent.trim();
      });
      if (heads[1] !== "Consent matter" || heads.length !== 6) return;
      enhance(table, i);
    });
  }

  if (window.document$) document$.subscribe(init);
  else document.addEventListener("DOMContentLoaded", init);
})();
