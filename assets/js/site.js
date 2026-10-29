/* =============================================================
   The Journey Church — site.js
   Three jobs: mobile nav, trail waypoint reveal, form submit.
   ============================================================= */

/* --- 1. CONFIGURE YOUR FORMS HERE ----------------------------
   Free option (recommended): https://web3forms.com
   Create an access key with the church email, paste it below,
   and both forms start delivering. No account or server needed.
   ------------------------------------------------------------- */
var FORM_ACCESS_KEY = "PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE";
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
      if (links.classList.contains("is-open") && window.scrollY > 10) {
        links.classList.remove("is-open");
        nav.classList.remove("is-menu-open");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.textContent = "Menu";
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
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        nav.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
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

  /* --- "New Here?" slide-out ---------------------------------- */
  var nh = document.querySelector("[data-nh]");
  if (nh) {
    var nhToggle = nh.querySelector("[data-nh-toggle]");
    var nhPanel = nh.querySelector(".nh__panel");
    var nhSr = nh.querySelector("[data-nh-sr]");

    var setNh = function (open) {
      nh.classList.toggle("is-open", open);
      nhToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (nhSr) nhSr.textContent = open ? "Close the new here form" : "Open the new here form";
      if (open) {
        // the panel is visibility:hidden until the transition starts,
        // so focus has to wait a frame or it is dropped
        window.setTimeout(function () {
          var first = nhPanel.querySelector("input:not([type=hidden]):not(.hp)");
          if (first) first.focus();
        }, 60);
      }
    };

    nhToggle.addEventListener("click", function () {
      setNh(!nh.classList.contains("is-open"));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nh.classList.contains("is-open")) {
        setNh(false);
        nhToggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (nh.classList.contains("is-open") && !nh.contains(e.target)) setNh(false);
    });
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
