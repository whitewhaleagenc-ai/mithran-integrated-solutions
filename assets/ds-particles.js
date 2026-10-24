/* Mithran design system — particle universe engine
   splash:true  -> particles assemble into the real logo, burst, then settle into an ambient field
   splash:false -> ambient field only (used behind every page so the brand look is continuous) */
(function () {
  "use strict";
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var ease = function (x) { x = clamp(x, 0, 1); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var sm = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  var PAL = [[52, 209, 124], [240, 208, 142], [235, 255, 245]];

  window.MisParticles = function (o) {
    var cv = o.canvas, cx = cv.getContext("2d"), bl = o.bloom, bx = bl.getContext("2d");
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var splash = !!o.splash && !reduce;
    var wm = o.wordmark, pn = o.pct, pb = o.bar;
    var W, H, sc, bw, bh, img, data, mobile, LW, mode = "ambient";
    var F = 900, CAMZ = 900, CYF = splash ? .44 : .5, BURST_AT = o.burstAt || 4.8;
    var pts = null, NT = 0, ND = 0, N = 0, NA = 0;
    var X, Y, Z, SX, SY, SZ, TX, TY, TZ, CR, CG, CB, DEL, DUR, BX, BY, BZ, VX, VY, VZ, AX, AY, AZ, DXs, DYs, RING, PH, KIND;
    var QS = new URLSearchParams(location.search), OFF = parseFloat(QS.get("t")) || 0, HOLD = QS.has("hold");
    var mx = -9999, my = -9999, t0 = 0, tb = null, ambStart = null, stopped = false, raf = 0, intensity = o.intensity || 1;

    function size() {
      W = innerWidth; H = innerHeight; mobile = W < 760;
      sc = mode === "ambient" ? (W > 1000 ? 2 : 1.6) : (W > 1000 ? 1.25 : 1);
      bw = Math.round(W / sc); bh = Math.round(H / sc);
      cv.width = bw; cv.height = bh; img = cx.createImageData(bw, bh); data = img.data;
      for (var i = 3; i < data.length; i += 4) data[i] = 255;
      bl.width = Math.round(bw / 4); bl.height = Math.round(bh / 4);
      LW = Math.max(170, Math.min(W * .62, H * .5, 390));
      if (wm) wm.style.top = (H * CYF + LW * .46 * (560 / 652) + 34) + "px";
    }
    size();
    addEventListener("resize", function () { size(); layout(); });
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    addEventListener("pointerleave", function () { mx = my = -9999; });

    function alloc(n) {
      N = n; var A = function () { return new Float32Array(N); };
      X = A(); Y = A(); Z = A(); SX = A(); SY = A(); SZ = A(); TX = A(); TY = A(); TZ = A(); CR = A(); CG = A(); CB = A();
      DEL = A(); DUR = A(); BX = A(); BY = A(); BZ = A(); VX = A(); VY = A(); VZ = A(); AX = A(); AY = A(); AZ = A(); DXs = A(); DYs = A(); RING = A(); PH = A();
      KIND = new Uint8Array(N);
      for (var i = 0; i < N; i++) {
        var r = rnd(380, 1250), th = Math.random() * 6.2832, ph = Math.acos(rnd(-1, 1));
        SX[i] = r * Math.sin(ph) * Math.cos(th); SY[i] = r * Math.sin(ph) * Math.sin(th) * .75; SZ[i] = r * Math.cos(ph);
        PH[i] = Math.random() * 6.28; DEL[i] = Math.random(); DUR[i] = rnd(1.5, 2.1);
        KIND[i] = Math.random() < .78 ? 0 : (Math.random() < .8 ? 1 : 2);
        AX[i] = rnd(-1300, 1300); AY[i] = rnd(-800, 800); AZ[i] = rnd(-500, 1900);
      }
    }
    function layout() {
      if (!pts || !X) return;
      for (var i = 0; i < NT; i++) { var p = pts[i]; TX[i] = p[0] * LW; TY[i] = p[1] * LW; TZ[i] = rnd(-14, 14); CR[i] = p[2]; CG[i] = p[3]; CB[i] = p[4]; }
      for (i = NT; i < N; i++) { RING[i] = rnd(.62, 1.12) * LW; }
    }

    /* ---- start ---- */
    if (splash) {
      var logo = new Image(); logo.src = o.logo;
      logo.onload = function () {
        var tw = mobile ? 230 : 320, th = Math.round(tw * logo.height / logo.width), c = document.createElement("canvas");
        c.width = tw; c.height = th;
        var g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(logo, 0, 0, tw, th);
        var px = g.getImageData(0, 0, tw, th).data; pts = [];
        for (var y = 0; y < th; y++) for (var x = 0; x < tw; x++) { var i = (y * tw + x) * 4; if (px[i + 3] > 140) pts.push([x / tw - .5, (y / th - .5) * th / tw, px[i], px[i + 1], px[i + 2]]); }
        for (var k = pts.length - 1; k > 0; k--) { var j = (Math.random() * (k + 1)) | 0, tmp = pts[k]; pts[k] = pts[j]; pts[j] = tmp; }
        NT = Math.min(pts.length, mobile ? 5200 : 13000); ND = mobile ? 650 : 1400;
        alloc(NT + ND);
        for (var q = NT; q < N; q++) { AY[q] = rnd(0, 6.28); AX[q] = rnd(.3, 1.2); AZ[q] = rnd(.5, 1.2) * (Math.random() < .5 ? -1 : 1); }
        layout(); mode = "splash"; t0 = performance.now(); raf = requestAnimationFrame(loop);
      };
      logo.onerror = function () { startAmbient(); };
    } else startAmbient();

    function startAmbient() {
      mode = "ambient"; size(); alloc(mobile ? 650 : 1300); NA = N;
      for (var i = 0; i < N; i++) { DXs[i] = DYs[i] = 0; }
      ambStart = 0; t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    }
    function burst(t) {
      tb = t;
      if (wm) { wm.classList.remove("show"); wm.classList.add("hide"); }
      for (var i = 0; i < N; i++) {
        BX[i] = X[i]; BY[i] = Y[i]; BZ[i] = Z[i];
        var L = Math.sqrt(X[i] * X[i] + Y[i] * Y[i]) + 1, sp = rnd(250, 900);
        VX[i] = X[i] / L * sp + rnd(-80, 80); VY[i] = Y[i] / L * sp + rnd(-80, 80); VZ[i] = -rnd(600, 1900);
      }
      if (o.onBurst) o.onBurst();
    }
    function toAmbient() {
      /* keep a subset of the splash particles as the ambient field */
      NA = mobile ? 1500 : 2600; mode = "ambient"; size();
      for (var q = 0; q < N; q++) { AX[q] = rnd(-1300, 1300); AY[q] = rnd(-800, 800); AZ[q] = rnd(-500, 1900); DXs[q] = DYs[q] = 0; }
      ambStart = (performance.now() - t0) / 1000;
      if (o.onDone) o.onDone();
    }

    function splat(x, y, r, g, b) {
      var ix = x | 0, iy = y | 0; if (ix < 0 || iy < 0 || ix >= bw - 1 || iy >= bh - 1) return;
      var fx = x - ix, fy = y - iy, i = (iy * bw + ix) * 4, w = bw * 4, a,
        w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      a = data[i] + r * w00; data[i] = a > 255 ? 255 : a; a = data[i + 1] + g * w00; data[i + 1] = a > 255 ? 255 : a; a = data[i + 2] + b * w00; data[i + 2] = a > 255 ? 255 : a;
      i += 4; a = data[i] + r * w10; data[i] = a > 255 ? 255 : a; a = data[i + 1] + g * w10; data[i + 1] = a > 255 ? 255 : a; a = data[i + 2] + b * w10; data[i + 2] = a > 255 ? 255 : a;
      i += w - 4; a = data[i] + r * w01; data[i] = a > 255 ? 255 : a; a = data[i + 1] + g * w01; data[i + 1] = a > 255 ? 255 : a; a = data[i + 2] + b * w01; data[i + 2] = a > 255 ? 255 : a;
      i += 4; a = data[i] + r * w11; data[i] = a > 255 ? 255 : a; a = data[i + 1] + g * w11; data[i + 1] = a > 255 ? 255 : a; a = data[i + 2] + b * w11; data[i + 2] = a > 255 ? 255 : a;
    }

    var last = 0;
    function loop(now) {
      if (stopped) return;
      raf = requestAnimationFrame(loop);
      if (document.hidden) { last = now; return; }
      var dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
      var t = HOLD ? OFF : (now - t0) / 1000 + OFF;
      if (mode === "splash") {
        if (tb === null && t >= BURST_AT) burst(t);
        if (tb !== null && t - tb > 1.6) { toAmbient(); return; }
      }
      var tau = tb === null ? 0 : (HOLD && QS.has("tau") ? parseFloat(QS.get("tau")) : t - tb), m = mode === "ambient" ? 2 : (tb === null ? 0 : 1);
      var keep = m === 1 ? 238 : (m === 2 ? 214 : 208);
      for (var i = 0; i < data.length; i += 4) { data[i] = (data[i] * keep) >> 8; data[i + 1] = (data[i + 1] * keep) >> 8; data[i + 2] = (data[i + 2] * keep) >> 8; }
      var cw = W / 2 + (mx > -999 ? (mx - W / 2) * -.03 : 0), ch = H * CYF + (my > -999 ? (my - H / 2) * -.03 : 0);
      var cs = Math.cos(t * .32), sn = Math.sin(t * .32), fade = sm(t / 1.2), waveR = (t - 3.5) * LW * .9;
      if (m === 0) {
        if (t > 3.2 && wm && !wm.classList.contains("show")) wm.classList.add("show");
        var pc = Math.min(100, Math.floor(t / BURST_AT * 100));
        if (pn) pn.textContent = String(pc).padStart(3, "0"); if (pb) pb.style.transform = "scaleX(" + (pc / 100) + ")";
      }
      var count = m === 2 ? NA : N;
      for (i = 0; i < count; i++) {
        var x, y, z, r, g, b, inten = 1, pal = PAL[KIND[i]];
        if (m === 0) {
          var tc = 1.3 + DEL[i], e = ease((t - tc) / DUR[i]);
          if (e <= 0) {
            x = SX[i] * cs + SZ[i] * sn; z = -SX[i] * sn + SZ[i] * cs; y = SY[i] + Math.sin(t * .7 + PH[i]) * 18;
            r = pal[0]; g = pal[1]; b = pal[2]; inten = .55 * fade;
          } else {
            var s0x = SX[i] * Math.cos(tc * .32) + SZ[i] * Math.sin(tc * .32), s0z = -SX[i] * Math.sin(tc * .32) + SZ[i] * Math.cos(tc * .32), s0y = SY[i], tx, ty, tz;
            if (i < NT) { tx = TX[i]; ty = TY[i]; tz = TZ[i]; }
            else { var a = AY[i] + t * AX[i] * .7, ct = Math.cos(AZ[i]), st = Math.sin(AZ[i]); tx = RING[i] * Math.cos(a); ty = RING[i] * Math.sin(a) * ct * .55; tz = RING[i] * Math.sin(a) * st; }
            var sw = Math.sin(e * 3.14159) * (i < NT ? 160 : 60), dx = tx - s0x, dy = ty - s0y, dz = tz - s0z, dl = Math.sqrt(dx * dx + dz * dz) + 1;
            x = s0x + dx * e + (-dz / dl) * sw; y = s0y + dy * e; z = s0z + dz * e + (dx / dl) * sw;
            if (i < NT) {
              r = pal[0] + (CR[i] * 1.5 - pal[0]) * e; g = pal[1] + (CG[i] * 1.5 - pal[1]) * e; b = pal[2] + (CB[i] * 1.5 - pal[2]) * e;
              if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255;
              inten = .7 + .5 * e;
              if (e >= 1) { var dd = Math.sqrt(TX[i] * TX[i] + TY[i] * TY[i]), wv = Math.exp(-Math.pow((dd - waveR) / (LW * .12), 2)); inten = 1.05 + 1.5 * wv; r += wv * 120; g += wv * 120; b += wv * 120; x += Math.sin(t * 3 + PH[i]) * .6; y += Math.cos(t * 2.6 + PH[i]) * .6; }
            } else { r = pal[0]; g = pal[1]; b = pal[2]; inten = .9; }
          }
        } else if (m === 1) {
          var T = tau, acc = T * (1 + 1.6 * T);
          x = BX[i] + VX[i] * acc; y = BY[i] + VY[i] * acc; z = BZ[i] + VZ[i] * acc;
          r = pal[0] * .6 + 150; g = pal[1] * .6 + 150; b = pal[2] * .6 + 150; inten = 1.1 * (1 - sm((T - 1.0) / .6));
          var T2 = Math.max(0, T - .035), acc2 = T2 * (1 + 1.6 * T2), x2 = BX[i] + VX[i] * acc2, y2 = BY[i] + VY[i] * acc2, z2 = BZ[i] + VZ[i] * acc2, d2 = CAMZ + z2;
          if (d2 > 40 && CAMZ + z > 40) {
            var s2 = F / d2, s1 = F / (CAMZ + z), ax = (cw + x2 * s2) / sc, ay = (ch + y2 * s2) / sc, bx1 = (cw + x * s1) / sc, by1 = (ch + y * s1) / sc;
            for (var q2 = 1; q2 <= 3; q2++) { var u = q2 / 4; splat(ax + (bx1 - ax) * u, ay + (by1 - ay) * u, r * inten * .35, g * inten * .35, b * inten * .35); }
          }
        } else {
          var tt = t - ambStart, a_ = sm(tt / 1.4);
          AZ[i] -= 26 * dt; if (AZ[i] < -650) AZ[i] += 2550;
          x = AX[i] + Math.sin(t * .25 + PH[i]) * 40; y = AY[i] + Math.cos(t * .2 + PH[i]) * 30; z = AZ[i];
          var s_ = F / (CAMZ + z), sxp = cw + (x + DXs[i]) * s_, syp = ch + (y + DYs[i]) * s_;
          if (mx > -999) { var ddx = sxp - mx, ddy = syp - my, d2m = ddx * ddx + ddy * ddy; if (d2m < 26000) { var f = (1 - d2m / 26000) * 28, dl2 = Math.sqrt(d2m) + 1; DXs[i] += ddx / dl2 * f / s_; DYs[i] += ddy / dl2 * f / s_; } }
          DXs[i] *= .96; DYs[i] *= .96; x += DXs[i]; y += DYs[i];
          r = pal[0]; g = pal[1]; b = pal[2]; inten = intensity * a_ * (.6 + .4 * Math.sin(t * 1.5 + PH[i]));
        }
        X[i] = x; Y[i] = y; Z[i] = z;
        var dep = CAMZ + z; if (dep < 40) continue;
        var s = F / dep, I = inten * (s > 1.6 ? 1.6 : s);
        if (I <= .02) continue;
        splat((cw + x * s) / sc, (ch + y * s) / sc, r * I, g * I, b * I);
      }
      cx.putImageData(img, 0, 0);
      bx.globalCompositeOperation = "copy"; bx.imageSmoothingEnabled = true; bx.drawImage(cv, 0, 0, bl.width, bl.height);
    }

    return {
      skip: function () { if (mode === "splash" && tb === null && X) burst((performance.now() - t0) / 1000); },
      setIntensity: function (v) { intensity = v; },
      stop: function () { stopped = true; cancelAnimationFrame(raf); }
    };
  };
})();
