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
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
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

  /* current year */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
