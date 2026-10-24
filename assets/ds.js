/* Mithran design system — interactions (no dependencies) */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var embed = root.classList.contains("embed");
  if (/[?&]static/.test(location.search)) root.classList.add("static");

  /* ---------- page transition: leave animation on arrival ---------- */
  if (root.classList.contains("pt-cover")) {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      root.classList.remove("pt-cover"); root.classList.add("pt-leave");
      setTimeout(function () { root.classList.remove("pt-leave"); }, 900);
    }); });
  }
  d.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || reduce) return;
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || /^(mailto:|tel:|https?:|javascript:)/i.test(h)) return;
    e.preventDefault();
    try { sessionStorage.setItem("pt", "1"); } catch (x) {}
    root.classList.add("pt-in");
    setTimeout(function () { location.href = a.href; }, 720);
  });
  addEventListener("pageshow", function (e) { if (e.persisted) { root.classList.remove("pt-in"); } });

  /* ---------- start (called once the splash has handed over, or immediately) ---------- */
  var started = false;
  function start() {
    if (started) return; started = true;
    $$(".split").forEach(function (el) {
      var i = 0;
      (function wrap(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var f = d.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { f.appendChild(d.createTextNode(" ")); return; }
              var w = d.createElement("span"); w.className = "w";
              var s = d.createElement("span"); s.style.setProperty("--i", i++); s.textContent = part;
              w.appendChild(s); f.appendChild(w);
            });
            n.replaceChild(f, c);
          } else if (c.nodeType === 1) wrap(c);
        });
      })(el);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .14, rootMargin: "0px 0px -6% 0px" });
    $$(".rv,.split,.step").forEach(function (el) { io.observe(el); });
  }
  window.MisSite = { start: start };

  /* ---------- header ---------- */
  var hdr = $(".hdr"), lastY = 0;
  function onScroll() {
    var y = scrollY;
    if (hdr) {
      hdr.classList.toggle("scrolled", y > 24);
      if (!root.classList.contains("menu-open")) hdr.classList.toggle("hide", y > lastY + 6 && y > 480 ? true : (y < lastY - 6 ? false : hdr.classList.contains("hide")));
    }
    lastY = y;
    var chain = $(".chain");
    if (chain) { var r = chain.getBoundingClientRect(); chain.style.setProperty("--p", (clamp((innerHeight * .6 - r.top) / r.height, 0, 1) * 100).toFixed(1) + "%"); }
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = $(".burger");
  function setMenu(o) { root.classList.toggle("menu-open", o); if (burger) { burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); } }
  if (burger) burger.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
  $$(".mmenu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- tap ripple ---------- */
  d.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn"); if (!b || reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), el = d.createElement("span");
    el.className = "ripple"; el.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + (e.clientX - r.left - s / 2) + "px;top:" + (e.clientY - r.top - s / 2) + "px";
    b.appendChild(el); setTimeout(function () { el.remove(); }, 750);
  });

  /* ---------- mouse-reactive lighting ---------- */
  var light = $(".cursor-light");
  if (fine && !reduce && light) {
    root.classList.add("has-pointer");
    var mx = innerWidth / 2, my = innerHeight / 2, gx = mx, gy = my;
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() { gx += (mx - gx) * .08; gy += (my - gy) * .08; light.style.transform = "translate(" + gx + "px," + gy + "px)"; requestAnimationFrame(loop); })();
    $$("[data-mag]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px"); b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px"); });
      b.addEventListener("pointerleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
        if (c.classList.contains("tilt")) { c.style.setProperty("--ry", ((x - .5) * 6).toFixed(2) + "deg"); c.style.setProperty("--rx", ((.5 - y) * 6).toFixed(2) + "deg"); }
        var im = $(".step-img", c); if (im) { im.style.setProperty("--px", ((x - .5) * -22).toFixed(1) + "px"); im.style.setProperty("--py", ((y - .5) * -16).toFixed(1) + "px"); }
      });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); var im = $(".step-img", c); if (im) { im.style.setProperty("--px", "0px"); im.style.setProperty("--py", "0px"); } });
    });
    var viz = $(".chain-viz"), pbg = $(".p-hero .bg");
    addEventListener("pointermove", function (e) {
      var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      if (viz) viz.style.transform = "perspective(900px) rotateY(" + (nx * 14).toFixed(2) + "deg) rotateX(" + (-ny * 14).toFixed(2) + "deg)";
      if (pbg) { pbg.style.setProperty("--px", (nx * -26).toFixed(1) + "px"); pbg.style.setProperty("--py", (ny * -18).toFixed(1) + "px"); }
    }, { passive: true });
  } else if (!reduce && light) {
    var show = function (e) { var t = e.touches[0]; light.style.opacity = 1; light.style.transform = "translate(" + t.clientX + "px," + t.clientY + "px)"; };
    addEventListener("touchstart", show, { passive: true }); addEventListener("touchmove", show, { passive: true });
    addEventListener("touchend", function () { setTimeout(function () { light.style.opacity = 0; }, 400); }, { passive: true });
  }

  /* hero chain: nodes scroll to their step */
  $$(".cv-node").forEach(function (n) {
    var go = function () { var t = $(n.getAttribute("data-go")); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); };
    n.addEventListener("click", go);
    n.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  /* FAQ: one open at a time */
  $$(".faq details").forEach(function (dt) {
    dt.addEventListener("toggle", function () { if (dt.open) $$(".faq details").forEach(function (o) { if (o !== dt) o.open = false; }); });
  });

  /* contact form -> email (Web3Forms) + prefilled WhatsApp message, with spam and rate limits */
  var W3F = ["3715eb0a-a75d-4083-9a83-e852e16bb507"];
  var T0 = Date.now(), mem = [];
  function sentList() { var n = Date.now(), a = mem; try { var r = localStorage.getItem("mis-sent"); if (r) a = JSON.parse(r); } catch (x) {} return Array.isArray(a) ? a.filter(function (t) { return typeof t === "number" && n - t < 864e5; }) : []; }
  function guard(f) {
    var hp = f.elements.company_website; if (hp && hp.value) return "bot";
    if (Date.now() - T0 < 4e3) return "Please take a moment to fill in the form, then send it again.";
    var a = sentList(), n = Date.now();
    if (a.length && n - a[a.length - 1] < 6e4) return "You have just sent a request. Please wait one minute before sending another.";
    if (a.length >= 3) return "You have reached today's limit of 3 requests from this device. Please call or WhatsApp us on +91 90258 14383.";
    a.push(n); mem = a; try { localStorage.setItem("mis-sent", JSON.stringify(a)); } catch (x) {}
    return "";
  }
  function note(f, m, ok) {
    var p = $(".form-note", f);
    if (!m) { if (p) p.remove(); return; }
    if (!p) { p = d.createElement("p"); p.className = "form-note"; p.setAttribute("role", "status"); f.appendChild(p); }
    p.classList.toggle("ok", !!ok); p.textContent = m;
    if (ok) setTimeout(function () { if (p.parentNode) p.remove(); }, 5000);
  }
  function clean(v, n) { return String(v || "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, n); }
  $$("form[data-wa]").forEach(function (f) {
    if (!f.elements.company_website) {
      var hp = d.createElement("input"); hp.type = "text"; hp.name = "company_website"; hp.tabIndex = -1; hp.autocomplete = "off";
      hp.setAttribute("aria-hidden", "true"); hp.style.cssText = "position:absolute;left:-10000px;width:1px;height:1px;opacity:0";
      f.appendChild(hp);
    }
    var lim = { name: 100, phone: 20, message: 2000 };
    Object.keys(lim).forEach(function (k) { if (f.elements[k]) f.elements[k].maxLength = lim[k]; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = guard(f);
      if (g) { if (g !== "bot") note(f, g); return; }
      var v = function (n, m) { var el = f.elements[n]; return el ? clean(el.value, m) : ""; };
      var name = v("name", 100).replace(/[\r\n]+/g, " "), phone = v("phone", 20), topic = v("topic", 60), message = v("message", 2000);
      var msg = "Hello Mithran Integrated Solutions,\nName: " + name + "\nPhone: " + phone + "\nInterested in: " + topic + "\n" + message;
      window.open("https://wa.me/919025814383?text=" + encodeURIComponent(msg), "_blank", "noopener");
      var body = { subject: ("New website enquiry: " + (topic || "General") + (name ? " - " + name : "")).slice(0, 150), from_name: "Mithran Integrated Solutions website",
        Name: name, Phone: phone, Service: topic, Message: message, Page: location.origin + location.pathname };
      W3F.forEach(function (k) {
        try { fetch("https://api.web3forms.com/submit", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({ access_key: k }, body)) }).catch(function () {}); } catch (x) {}
      });
      f.reset();
      note(f, "Thank you, " + (name || "we have your request") + ". Your request has been emailed to our team, and WhatsApp has opened if you'd like to message us directly.", true);
    });
  });

  /* image fade-in */
  $$("img.lazy").forEach(function (im) {
    var ok = function () { im.classList.add("ok"); };
    if (im.complete) ok(); else im.addEventListener("load", ok);
  });


  /* embed mode (device-preview frames): keep ?embed&nosplash when navigating between preview pages */
  if (embed) {
    $$("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (h && /^[a-z0-9-]+\.html(#.*)?$/i.test(h)) { var i = h.indexOf("#"); a.setAttribute("href", (i < 0 ? h : h.slice(0, i)) + "?embed&nosplash" + (i < 0 ? "" : h.slice(i))); }
    });
  }

  if (!$("#splash")) start();   /* pages without a splash start immediately */
})();
