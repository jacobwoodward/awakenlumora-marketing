/* Lumora sales page — interactions (vanilla, no deps) */
(function () {
  "use strict";

  /* sticky header shadow */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile nav */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav__burger");
  if (burger && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!nav.classList.contains("open"));
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* soul-keys accordion */
  document.querySelectorAll(".key__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.closest(".key");
      var isOpen = key.classList.contains("open");
      document.querySelectorAll(".key.open").forEach(function (k) { k.classList.remove("open"); });
      if (!isOpen) key.classList.add("open");
    });
  });

  /* reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* founding-pricing countdown -> June 21, 2026 (local end of day) */
  var cd = document.getElementById("countdown");
  if (cd) {
    var target = new Date(2026, 5, 21, 23, 59, 59).getTime(); // month is 0-indexed
    var fields = {
      d: cd.querySelector('[data-cd="d"]'),
      h: cd.querySelector('[data-cd="h"]'),
      m: cd.querySelector('[data-cd="m"]'),
      s: cd.querySelector('[data-cd="s"]')
    };
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var diff = target - Date.now();
      if (diff <= 0) {
        ["d", "h", "m", "s"].forEach(function (k) { if (fields[k]) fields[k].textContent = "00"; });
        return;
      }
      var s = Math.floor(diff / 1000);
      if (fields.d) fields.d.textContent = pad(Math.floor(s / 86400));
      if (fields.h) fields.h.textContent = pad(Math.floor((s % 86400) / 3600));
      if (fields.m) fields.m.textContent = pad(Math.floor((s % 3600) / 60));
      if (fields.s) fields.s.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* free-lessons lead capture -> Kitchanga interest list -> redirect */
  var flForm = document.getElementById("fl-form");
  if (flForm) {
    var FL = {
      endpoint: "https://app.awakenlumora.com/api/interest",
      apiKey: "0283930c20e7045e84725fc7b932f7a2f51d040a9929a3306710c8b7154f8b33",
      source: "awakenlumora-free-lessons",
      dest: "/free-lessons/"
    };
    var msg = document.getElementById("fl-msg");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var setMsg = function (text, cls) { if (msg) { msg.textContent = text || ""; msg.className = "fl-msg" + (cls ? " " + cls : ""); } };

    flForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (flForm.classList.contains("loading")) return;

      var name = (document.getElementById("fl-name").value || "").trim();
      var email = (document.getElementById("fl-email").value || "").trim();
      var hp = (document.getElementById("fl-company").value || "").trim();

      if (hp) { window.location.href = FL.dest; return; } // bot honeypot
      if (!name) { setMsg("Please enter your first name.", "err"); return; }
      if (!emailRe.test(email)) { setMsg("Please enter a valid email address.", "err"); return; }

      flForm.classList.add("loading");
      setMsg("Unlocking your lessons…", "ok");

      var done = function () {
        try { localStorage.setItem("lumora_unlocked", "1"); localStorage.setItem("lumora_name", name); } catch (_) {}
        window.location.href = FL.dest;
      };

      fetch(FL.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": FL.apiKey },
        body: JSON.stringify({ name: name, email: email, source: FL.source })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok && res.d && res.d.success) {
            done();
          } else {
            // Soft-fail: don't trap the visitor behind a backend hiccup — still grant access.
            done();
          }
        })
        .catch(function () { done(); });
    });
  }

  /* current year */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
