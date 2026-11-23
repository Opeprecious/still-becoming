/*
  WORLD
  The single persistent 3D environment. It is created once and never
  rebuilt; chapters only blend its colours, light, motion and camera.

    const world = SB.createWorld(canvas, SB.chapters, { lite, reduceMotion });
    world.reveal(ms)                       fade the first light in
    world.transitionTo(index, ms, onBlend) returns a Promise
    world.setPointer(x, y)                 -1..1, gentle camera parallax

  Throws if WebGL is unavailable so the app can fall back to the CSS world.
*/
(function () {
  "use strict";
  var SB = (window.SB = window.SB || {});

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  SB.createWorld = function (canvas, chapters, opts) {
    var T = window.THREE;
    if (!T) throw new Error("three.js not loaded");
    opts = opts || {};
    var lite = !!opts.lite;
    var reduce = !!opts.reduceMotion;

    var renderer = new T.WebGLRenderer({
      canvas: canvas, alpha: true, antialias: !lite, powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));

    var scene = new T.Scene();
    scene.fog = new T.FogExp2(0x000000, 0.04);
    var camera = new T.PerspectiveCamera(45, 1, 0.1, 100);

    /* ---------- palettes as THREE colours ---------- */
    var pal = chapters.map(function (ch) {
      var w = ch.world;
      return {
        glow: new T.Color(w.glow), light: new T.Color(w.light),
        sky: new T.Color(w.sky), ground: new T.Color(w.ground),
        fog: new T.Color(w.fog), rim: new T.Color(w.rim), trail: new T.Color(w.trail),
        shapes: w.shapes.map(function (c) { return new T.Color(c); }),
        lightPower: w.lightPower, fill: w.fill, fogDensity: w.fogDensity, motion: w.motion,
        // how the same forms are arranged in this chapter (all optional)
        spread: w.spread == null ? 1 : w.spread,              // how far apart the forms drift
        shapeScale: w.shapeScale == null ? 1 : w.shapeScale,  // how large they are
        glowScale: w.glowScale == null ? 1 : w.glowScale,     // how wide the central light reaches
        trailPower: w.trailPower == null ? 0.22 : w.trailPower,
        rimPower: w.rimPower == null ? 1 : w.rimPower,           // how visible the glass forms are
        portal: w.portal ? 1 : 0,                                 // 1 where the gateway stands
        pos: new T.Vector3().fromArray(w.camera.pos),
        look: new T.Vector3().fromArray(w.camera.look),
        // where the camera has drifted to by the end of the chapter's story
        posEnd: new T.Vector3().fromArray((w.cameraEnd || w.camera).pos),
        lookEnd: new T.Vector3().fromArray((w.cameraEnd || w.camera).look),
        // where the camera waits at the chapter's intro picture, before stepping inside
        gatePos: new T.Vector3().fromArray((w.cameraGate || w.camera).pos),
        gateLook: new T.Vector3().fromArray((w.cameraGate || w.camera).look)
      };
    });

    /* ---------- lighting controller ---------- */
    var LIGHT_BASE = 34;
    var light = new T.PointLight(0xffffff, 0, 0, 1.4);
    scene.add(light);
    var hemi = new T.HemisphereLight(0xffffff, 0x000000, 0);
    scene.add(hemi);

    /* ---------- central glowing form ---------- */
    function softDot() {
      var c = document.createElement("canvas");
      c.width = c.height = 256;
      var g = c.getContext("2d");
      var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.16, "rgba(255,255,255,.6)");
      gr.addColorStop(0.42, "rgba(255,255,255,.17)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
      return new T.CanvasTexture(c);
    }
    var dot = softDot();

    var glow = new T.Group();
    var core = new T.Mesh(
      new T.SphereGeometry(0.46, 40, 28),
      new T.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0 })
    );
    function sprite(scale, opacity) {
      var m = new T.SpriteMaterial({
        map: dot, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false
      });
      var s = new T.Sprite(m);
      s.scale.setScalar(scale);
      s.userData = { scale: scale, opacity: opacity };
      return s;
    }
    var halo = sprite(15, 0.5);
    var inner = sprite(5.6, 0.95);
    glow.add(halo, inner, core);
    scene.add(glow);

    /* ---------- floating shapes (organic + geometric) ---------- */
    function blobGeometry(seed) {
      var g = new T.SphereGeometry(1, 56, 40);
      var p = g.attributes.position, v = new T.Vector3();
      for (var i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        var n = Math.sin(v.x * 2.1 + seed) * 0.16 + Math.sin(v.y * 2.7 + seed * 1.7) * 0.13 +
                Math.sin(v.z * 2.3 + seed * 0.6) * 0.12;
        v.multiplyScalar(1 + n);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return g;
    }
    var SHAPES = [
      { geo: blobGeometry(1.3), pos: [-4.5, 1.2, 1.4], s: 1.15, flat: false },
      { geo: new T.TorusGeometry(0.85, 0.24, 28, 72), pos: [4.7, -0.5, 0.4], s: 1.0, flat: false },
      { geo: new T.IcosahedronGeometry(1, 0), pos: [3.3, 2.7, -3.2], s: 0.85, flat: true },
      { geo: blobGeometry(4.1), pos: [5.9, -2.9, -2.4], s: 0.9, flat: false },
      { geo: new T.SphereGeometry(1, 40, 28), pos: [-5.0, -3.2, 2.2], s: 0.55, flat: false }
    ];
    if (lite) SHAPES = SHAPES.slice(0, 3);      // simpler scene on phones
    var spreadX = lite ? 0.55 : 1;

    var shapes = SHAPES.map(function (spec, i) {
      var mat = new T.MeshStandardMaterial({
        color: 0xffffff, roughness: 0.6, metalness: 0.04, flatShading: spec.flat,
        emissive: 0xffffff, emissiveIntensity: 0
      });
      var mesh = new T.Mesh(spec.geo, mat);
      mesh.scale.setScalar(spec.s);
      if (i === 4) mesh.scale.set(spec.s * 1.5, spec.s * 0.8, spec.s);   // pebble
      mesh.position.set(spec.pos[0] * spreadX, spec.pos[1], spec.pos[2]);
      mesh.userData = { base: mesh.position.clone(), size: mesh.scale.clone(), phase: i * 1.9, spin: 0.05 + i * 0.012 };
      scene.add(mesh);
      return mesh;
    });

    /* ---------- translucent objects (fresnel glass) ---------- */
    function rimMaterial() {
      return new T.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uColor: { value: new T.Color(0xffffff) }, uOpacity: { value: 0 } },
        vertexShader:
          "varying vec3 vN; varying vec3 vV;" +
          "void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);" +
          "vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);" +
          "gl_Position = projectionMatrix * mv; }",
        fragmentShader:
          "uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV;" +
          "void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);" +
          "gl_FragColor = vec4(uColor, (0.05 + f * 0.8) * uOpacity); }"
      });
    }
    var RIMS = [
      { pos: [-2.0, 0.9, 4.3], r: 0.72 },
      { pos: [6.3, 2.3, -2.2], r: 1.5 }
    ];
    if (lite) RIMS = RIMS.slice(0, 1);
    var rims = RIMS.map(function (spec, i) {
      var mesh = new T.Mesh(new T.SphereGeometry(spec.r, 48, 32), rimMaterial());
      mesh.position.set(spec.pos[0] * spreadX, spec.pos[1], spec.pos[2]);
      mesh.userData = { base: mesh.position.clone(), phase: 3 + i * 2.4 };
      scene.add(mesh);
      return mesh;
    });

    /* ---------- light trails (time, progression) ---------- */
    var trailMat = new T.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, fog: false
    });
    var trails = new T.Group();
    var TRAILS = lite ? 2 : 3;
    for (var ti = 0; ti < TRAILS; ti++) {
      var pts = [];
      for (var k = 0; k <= 36; k++) {
        var u = k / 36;
        // a short sweep towards the light, not a full orbit
        var a = ti * 2.2 + u * Math.PI * 0.62;
        var r = lerp(8.5, 0.7, u);
        pts.push(new T.Vector3(
          Math.cos(a) * r * spreadX,
          lerp(ti === 1 ? -3.2 : 2.6 - ti, 0, u) + Math.sin(u * 5 + ti) * 0.35,
          Math.sin(a) * r * 0.55
        ));
      }
      trails.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 140, 0.011, 5), trailMat));
    }
    scene.add(trails);

    /* ---------- a few soft motes for atmospheric depth ---------- */
    var MOTES = lite ? 26 : 56;
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var motePos = new Float32Array(MOTES * 3);
    for (var m = 0; m < MOTES; m++) {
      motePos[m * 3] = (rnd() - 0.5) * 17 * spreadX;
      motePos[m * 3 + 1] = (rnd() - 0.5) * 10;
      motePos[m * 3 + 2] = -4 + rnd() * 13;
    }
    var moteGeo = new T.BufferGeometry();
    moteGeo.setAttribute("position", new T.BufferAttribute(motePos, 3));
    var moteMat = new T.PointsMaterial({
      map: dot, size: 0.1, transparent: true, opacity: 0, depthWrite: false,
      blending: T.AdditiveBlending, sizeAttenuation: true, fog: false
    });
    var motes = new T.Points(moteGeo, moteMat);
    scene.add(motes);

    /* ---------- the gateway: the landing scene ----------
       A glowing doorway standing on a round platform, a small star of
       light inside it and a path of light running through. It belongs to
       the chapter marked `portal: true`; on leaving, it rushes past the
       camera so it feels like walking through. */
    var portal = new T.Group();
    var portalParts = [];                       // { mat, base } so the whole thing can fade
    var FLOOR = -2.5;
    function glowMat(color, opacity, additive) {
      var mat = new T.MeshBasicMaterial({
        color: color, transparent: true, opacity: 0, depthWrite: false, fog: false,
        blending: additive === false ? T.NormalBlending : T.AdditiveBlending, side: T.DoubleSide
      });
      portalParts.push({ mat: mat, base: opacity });
      return mat;
    }
    function archPath(hw, h, r) {
      var pts = [new T.Vector3(-hw, FLOOR, 0), new T.Vector3(-hw, FLOOR + h - r, 0)], i, a;
      for (i = 1; i <= 10; i++) { a = Math.PI - (i / 10) * Math.PI / 2; pts.push(new T.Vector3(-hw + r + Math.cos(a) * r, FLOOR + h - r + Math.sin(a) * r, 0)); }
      for (i = 1; i <= 10; i++) { a = Math.PI / 2 - (i / 10) * Math.PI / 2; pts.push(new T.Vector3(hw - r + Math.cos(a) * r, FLOOR + h - r + Math.sin(a) * r, 0)); }
      pts.push(new T.Vector3(hw, FLOOR, 0));
      var path = new T.CurvePath();
      for (i = 0; i < pts.length - 1; i++) path.add(new T.LineCurve3(pts[i], pts[i + 1]));
      return path;
    }
    var outer = archPath(1.75, 4.7, 0.95), innerArch = archPath(1.5, 4.42, 0.74);
    portal.add(new T.Mesh(new T.TubeGeometry(outer, 160, 0.045, 8), glowMat(0xf1ecff, 1)));
    portal.add(new T.Mesh(new T.TubeGeometry(outer, 160, 0.13, 8), glowMat(0x8f7bff, 0.42)));
    portal.add(new T.Mesh(new T.TubeGeometry(outer, 160, 0.3, 8), glowMat(0x6a55e6, 0.13)));
    portal.add(new T.Mesh(new T.TubeGeometry(innerArch, 160, 0.02, 6), glowMat(0xc9bcff, 0.55)));

    // the round platform: two dark discs with lit edges
    [[3.3, 0, 0.6], [4.8, -0.16, 0.32]].forEach(function (d) {
      var disc = new T.Mesh(new T.CircleGeometry(d[0], 72), glowMat(0x120d36, 0.6, false));
      disc.rotation.x = -Math.PI / 2; disc.position.y = FLOOR + d[1] - 0.01;
      var edge = new T.Mesh(new T.TorusGeometry(d[0], 0.022, 6, 120), glowMat(0x8f7bff, d[2]));
      edge.rotation.x = Math.PI / 2; edge.position.y = FLOOR + d[1];
      portal.add(disc, edge);
    });

    // the path of light, winding from the viewer through the doorway
    for (var pi = 0; pi < 7; pi++) {
      var off = (pi - 3) * 0.085, ppts = [];
      for (var pz = 12; pz >= -9; pz -= 0.5) {
        var sway = Math.sin(pz * 0.5 + 0.6) * 1.25 * Math.min(1, Math.max(0.12, (pz + 0.5) / 7));
        ppts.push(new T.Vector3(sway + off * (1 + Math.max(0, pz) * 0.1), FLOOR + 0.03, pz));
      }
      portal.add(new T.Mesh(
        new T.TubeGeometry(new T.CatmullRomCurve3(ppts), 160, pi === 3 ? 0.028 : 0.014, 5),
        glowMat(pi === 3 ? 0xe6deff : 0x9f8cff, pi === 3 ? 0.75 : 0.3)
      ));
    }

    // the star inside the doorway
    function flareTexture() {
      var c = document.createElement("canvas");
      c.width = c.height = 256;
      var g = c.getContext("2d");
      g.translate(128, 128);
      for (var k = 0; k < 2; k++) {
        var gr = g.createLinearGradient(-128, 0, 128, 0);
        gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.beginPath(); g.moveTo(-128, 0); g.quadraticCurveTo(0, -5, 128, 0); g.quadraticCurveTo(0, 5, -128, 0); g.fill();
        g.rotate(Math.PI / 2);
      }
      return new T.CanvasTexture(c);
    }
    var flareMat = new T.SpriteMaterial({ map: flareTexture(), color: 0xffd9a0, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false });
    portalParts.push({ mat: flareMat, base: 1 });
    var flare = new T.Sprite(flareMat);
    flare.scale.setScalar(2.3);
    portal.add(flare);
    scene.add(portal);

    /* ---------- state ---------- */
    var from = 0, to = 0, blend = 0;
    var tween = null;                // { start, dur, onBlend, resolve }
    var revealV = 0, revealTween = null;
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var time = 0, last = performance.now();
    var camPos = new T.Vector3(), camLook = new T.Vector3();
    var tmpA = new T.Vector3(), tmpB = new T.Vector3();
    // story progress (0..1) through one chapter, driven by scrolling
    var prog = { index: -1, v: 0, target: 0 };
    // per chapter: 0 = waiting at the intro picture, 1 = stepped inside
    var entered = chapters.map(function () { return { v: 0, target: 0 }; });
    function pose(P, i, p, usePos) {
      var e = ease(entered[i].v);
      return tmpA.copy(usePos ? P.gatePos : P.gateLook).lerp(usePos ? P.pos : P.look, e).lerp(usePos ? P.posEnd : P.lookEnd, p);
    }
    var aspectPush = 1;

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // portrait screens see less width, so the camera stands further back
      aspectPush = camera.aspect < 1 ? 1 + (1 - camera.aspect) * 0.75 : 1;
    }
    window.addEventListener("resize", resize);
    resize();

    var env = { spread: 1, shapeScale: 1, glowScale: 1 };

    /* ---------- environment controller: blends chapter A into chapter B ---------- */
    function applyEnvironment(k) {
      var A = pal[from], B = pal[to];
      var show = ease(Math.min(1, revealV));

      scene.fog.color.copy(A.fog).lerp(B.fog, k);
      scene.fog.density = lerp(A.fogDensity, B.fogDensity, k);

      light.color.copy(A.light).lerp(B.light, k);
      light.intensity = LIGHT_BASE * lerp(A.lightPower, B.lightPower, k) * show;
      hemi.color.copy(A.sky).lerp(B.sky, k);
      hemi.groundColor.copy(A.ground).lerp(B.ground, k);
      hemi.intensity = 0.55 * show;

      core.material.color.copy(A.glow).lerp(B.glow, k);
      core.material.opacity = show;
      halo.material.color.copy(core.material.color);
      inner.material.color.copy(core.material.color);
      halo.material.opacity = halo.userData.opacity * show;
      inner.material.opacity = inner.userData.opacity * show;

      for (var i = 0; i < shapes.length; i++) {
        var mat = shapes[i].material;
        mat.color.copy(A.shapes[i]).lerp(B.shapes[i], k);
        mat.emissive.copy(mat.color);
        mat.emissiveIntensity = lerp(A.fill, B.fill, k) * show;
      }
      for (var j = 0; j < rims.length; j++) {
        rims[j].material.uniforms.uColor.value.copy(A.rim).lerp(B.rim, k);
        rims[j].material.uniforms.uOpacity.value = show * lerp(A.rimPower, B.rimPower, k);
      }
      trailMat.color.copy(A.trail).lerp(B.trail, k);
      trailMat.opacity = lerp(A.trailPower, B.trailPower, k) * show;
      moteMat.color.copy(core.material.color);
      moteMat.opacity = 0.5 * show;

      env.spread = lerp(A.spread, B.spread, k);
      env.shapeScale = lerp(A.shapeScale, B.shapeScale, k);
      env.glowScale = lerp(A.glowScale, B.glowScale, k);

      // the gateway: present in its own chapter, then it rushes past the camera
      var pw = lerp(A.portal, B.portal, k);
      portal.visible = pw > 0.004;
      if (portal.visible) {
        var gone = 1 - pw;
        portal.position.z = gone * gone * 22;
        portal.scale.setScalar(1 + gone * 0.5);
        var fade = show * Math.min(1, pw * 2.2);
        for (var pp = 0; pp < portalParts.length; pp++) portalParts[pp].mat.opacity = portalParts[pp].base * fade;
      }

      var amount = reduce ? 0.35 : 1;
      var pa = from === prog.index ? prog.v * amount : 0;
      var pb = to === prog.index ? prog.v * amount : 0;
      camPos.copy(pose(A, from, pa, true));
      camPos.lerp(pose(B, to, pb, true), k);
      camLook.copy(pose(A, from, pa, false));
      camLook.lerp(pose(B, to, pb, false), k);
      return lerp(A.motion, B.motion, k);
    }

    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (revealTween) {
        revealV = Math.min(1, (now - revealTween.start) / revealTween.dur);
        if (revealV >= 1) revealTween = null;
      }

      if (tween) {
        var raw = Math.min(1, (now - tween.start) / tween.dur);
        blend = ease(raw);
        if (tween.onBlend) tween.onBlend(from, to, blend);
        if (raw >= 1) {
          var done = tween.resolve;
          from = to; blend = 0; tween = null;
          done();
        }
      }

      prog.v += (prog.target - prog.v) * (reduce ? 1 : 0.07);
      for (var ei = 0; ei < entered.length; ei++) {
        entered[ei].v += (entered[ei].target - entered[ei].v) * (reduce ? 1 : 0.035);
      }
      var motion = applyEnvironment(blend) * (reduce ? 0.12 : 1);
      time += dt * motion;

      // ambient idle animation
      var pulse = 1 + Math.sin(time * 0.8) * 0.035;
      halo.scale.setScalar(halo.userData.scale * pulse * env.glowScale);
      inner.scale.setScalar(inner.userData.scale * (2 - pulse) * (0.6 + env.glowScale * 0.4));
      for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i], d = s.userData;
        s.position.y = d.base.y * env.spread + Math.sin(time * 0.35 + d.phase) * 0.28;
        s.position.x = d.base.x * env.spread + Math.cos(time * 0.22 + d.phase) * 0.16;
        s.scale.copy(d.size).multiplyScalar(env.shapeScale);
        s.rotation.x += dt * motion * d.spin;
        s.rotation.y += dt * motion * d.spin * 1.4;
      }
      for (var j = 0; j < rims.length; j++) {
        var r = rims[j], rd = r.userData;
        r.position.y = rd.base.y + Math.sin(time * 0.28 + rd.phase) * 0.35;
      }
      trails.rotation.y = time * 0.02;
      flare.material.rotation = Math.sin(time * 0.3) * 0.08;
      flare.scale.setScalar(2.3 * (1 + Math.sin(time * 1.1) * 0.06));
      motes.position.y = Math.sin(time * 0.1) * 0.4;
      motes.rotation.y = time * 0.008;

      // camera controller
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      var sway = reduce ? 0 : 1;
      camera.position.set(
        camPos.x + (pointer.x * 0.7 + Math.sin(time * 0.13) * 0.18) * sway,
        camPos.y + (-pointer.y * 0.45 + Math.cos(time * 0.11) * 0.12) * sway,
        camPos.z * aspectPush
      );
      // on tall screens the camera stands further back, so aim lower to keep the light above the text
      camera.lookAt(camLook.x, camLook.y * aspectPush, camLook.z);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    /* ---------- public API ---------- */
    return {
      reveal: function (ms) {
        if (!ms) { revealV = 1; return; }
        revealTween = { start: performance.now(), dur: ms };
      },
      transitionTo: function (index, ms, onBlend) {
        return new Promise(function (resolve) {
          if (index === from && !tween) { resolve(); return; }
          to = index;
          tween = { start: performance.now(), dur: Math.max(1, ms), onBlend: onBlend, resolve: resolve };
        });
      },
      setPointer: function (x, y) { pointer.tx = x; pointer.ty = y; },
      // how far through a chapter's story the visitor is (0..1)
      // step through a chapter's intro picture (or back out to it)
      setEntered: function (index, on, instant) {
        entered[index].target = on ? 1 : 0;
        if (instant) entered[index].v = entered[index].target;
      },
      setProgress: function (index, p) {
        if (prog.index !== index) { prog.index = index; prog.v = p; }
        prog.target = p;
      }
    };
  };

  /* Same interface, no WebGL: used when 3D is unavailable. The CSS
     environment in styles/main.css takes over the visuals. */
  SB.createStaticWorld = function () {
    var current = 0;
    return {
      reveal: function () {},
      setPointer: function () {},
      setProgress: function () {},
      setEntered: function () {},
      transitionTo: function (index, ms, onBlend) {
        return new Promise(function (resolve) {
          var start = performance.now(), origin = current;
          (function step(now) {
            var raw = Math.min(1, (now - start) / Math.max(1, ms));
            if (onBlend) onBlend(origin, index, ease(raw));
            if (raw < 1) requestAnimationFrame(step);
            else { current = index; resolve(); }
          })(start);
        });
      }
    };
  };
})();
