/* =============================================================
   The Journey Church — site.js
   Three jobs: mobile nav, trail waypoint reveal, form submit.
   ============================================================= */

/* --- 1. CONFIGURE YOUR FORMS HERE ----------------------------
   Free option (recommended): https://web3forms.com
   Create an access key with the church email, paste it below,
   and both forms start delivering. No account or server needed.
   ------------------------------------------------------------- */
var FORM_ACCESS_KEY = "c1a64270-f09d-4c38-8f63-ab1bbf792e0c";
var FORM_ENDPOINT = "https://api.web3forms.com/submit";

(function () {
  "use strict";

  /* --- Nav ---------------------------------------------------- */
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var links = document.querySelector("[data-nav-links]");

  /* The header scrolls away with the page, so there is no scroll state
     to track. Close the mobile menu if the header leaves the viewport. */
  if (nav && links) {
    window.addEventListener("scroll", function () {
      var past = window.scrollY > 10;
      /* The mega panel is position:fixed but the header is not: once the
         header has scrolled away the panel would hang in mid-air, so it is
         suppressed (CSS) and any click-opened one is closed (here). */
      nav.classList.toggle("is-past-top", past);
      if (past) {
        closeDrops();
        if (links.classList.contains("is-open")) {
          links.classList.remove("is-open");
          nav.classList.remove("is-menu-open");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.textContent = "Menu";
          }
        }
      }
    }, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-menu-open", open);
      if (!open) closeDrops();
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) {
        links.classList.remove("is-open");
        nav.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
        closeDrops();
      }
    });
  }

  /* --- Nav dropdown -------------------------------------------------
     On desktop CSS opens the panel on hover and on keyboard focus, so
     this only has to handle the click/tap case and closing again.      */
  var drops = Array.prototype.slice.call(document.querySelectorAll("[data-drop]"));

  function closeDrops(except) {
    drops.forEach(function (drop) {
      if (drop === except) return;
      drop.classList.remove("is-open");
      var t = drop.querySelector("[data-drop-toggle]");
      if (t) t.setAttribute("aria-expanded", "false");
    });
    if (nav) nav.classList.remove("has-drop");
  }

  drops.forEach(function (drop) {
    var tog = drop.querySelector("[data-drop-toggle]");
    if (!tog) return;
    tog.addEventListener("click", function (e) {
      e.stopPropagation();
      if (nav) nav.classList.remove("is-esc");
      closeDrops(drop);
      var open = drop.classList.toggle("is-open");
      tog.setAttribute("aria-expanded", open ? "true" : "false");
      /* The header goes solid to match the panel. CSS :has() covers the
         hover case; this covers click and keyboard without relying on it. */
      if (nav) nav.classList.toggle("has-drop", open);
    });
  });

  if (drops.length) {
    document.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("[data-drop]")) closeDrops();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" && e.key !== "Esc") return;
      var open = drops.filter(function (d) { return d.classList.contains("is-open"); });
      if (!open.length) return;
      /* closeDrops, not a loop of its own: it is what also puts the header
         back to its gradient. */
      closeDrops();
      /* A mouse user who clicked is still hovering the button, and CSS
         hover would reopen the panel immediately. This flag holds it shut
         until the pointer actually leaves. */
      if (nav) nav.classList.add("is-esc");
      var t = open[0].querySelector("[data-drop-toggle]");
      if (t) t.focus();
    });
    /* Clear the flag the moment the pointer actually moves: a stationary
       mouse fires nothing, so the panel stays shut, but any real movement
       hands hover back. A keyboard-only flow never fires this, so the
       toggle clears it too (above). */
    document.addEventListener("mousemove", function () {
      if (nav && nav.classList.contains("is-esc")) nav.classList.remove("is-esc");
    }, { passive: true });
  }

  /* --- Trail waypoints ---------------------------------------- */
  var waypoints = document.querySelectorAll(".wp");
  if (waypoints.length) {
    if (!("IntersectionObserver" in window)) {
      waypoints.forEach(function (w) { w.classList.add("is-on"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-on");
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -22% 0px", threshold: 0.05 });
      waypoints.forEach(function (w) { io.observe(w); });
    }
  }

  /* --- Forms -------------------------------------------------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var msg = form.querySelector(".form__msg");
    var btn = form.querySelector("button[type=submit]");
    var keyInput = form.querySelector("input[name=access_key]");
    if (keyInput) keyInput.value = FORM_ACCESS_KEY;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!FORM_ACCESS_KEY || FORM_ACCESS_KEY.indexOf("PASTE-") === 0) {
        show("err", "This form is not connected yet. Add your Web3Forms access key in assets/js/site.js.");
        return;
      }
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending";

      var data = Object.fromEntries(new FormData(form).entries());
      // Collect checkbox groups as a comma list.
      form.querySelectorAll("input[type=checkbox][name$='[]']").forEach(function (box) {
        var key = box.name.replace("[]", "");
        var checked = Array.from(form.querySelectorAll("input[name='" + box.name + "']:checked"))
          .map(function (b) { return b.value; });
        data[key] = checked.join(", ");
        delete data[box.name];
      });

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.success) {
            form.reset();
            show("ok", form.getAttribute("data-success") || "Thanks. Someone from our team will be in touch soon.");
          } else {
            show("err", "That did not go through. Please email hello@thejourneychurchsemo.com and we will follow up.");
          }
        })
        .catch(function () {
          show("err", "That did not go through. Please email hello@thejourneychurchsemo.com and we will follow up.");
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = original;
        });

      function show(kind, text) {
        if (!msg) return;
        msg.className = "form__msg " + kind;
        msg.textContent = text;
        msg.setAttribute("role", "status");
      }
    });
  });
})();
