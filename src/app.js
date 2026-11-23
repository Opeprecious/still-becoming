/*
  APP
  The chapter state controller. It owns "where are we in the story",
  asks the world to travel there, and keeps the interface in step.
  Nothing here is specific to one chapter: every chapter in
  SB.chapters gets a section, a place in the overview and transitions.

  The journey has three kinds of movement, none of them scrolling:
    travel(index)        between chapters (through the light)
    enterChapter(index)  through a chapter's intro picture, into its story
    step(index, delta)   deeper into (or back out of) the chapter's parts
*/
(function () {
  "use strict";
  var SB = window.SB;
  var chapters = SB.chapters;

  var $ = function (s) { return document.querySelector(s); };
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lite = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
  var forceFallback = /[?&]nowebgl\b/.test(location.search);

  /* ---------- copy ---------- */
  document.querySelectorAll("[data-site]").forEach(function (el) {
    el.textContent = SB.site[el.getAttribute("data-site")];
  });

  /* ---------- atmosphere: one gradient layer per chapter ---------- */
  var atmosphere = $("#atmosphere");
  var layers = chapters.map(function (ch) {
    var i = document.createElement("i");
    var a = ch.atmosphere;
    i.style.background = "linear-gradient(180deg," + a[0] + " 0%," + a[1] + " 56%," + a[2] + " 100%)";
    atmosphere.appendChild(i);
    return i;
  });
  var bloom = $("#bloom");
  var railFill = $("#railFill");

  /* ---------- world (3D, or the CSS stand-in) ---------- */
  var world;
  try {
    if (forceFallback) throw new Error("fallback requested");
    world = SB.createWorld($("#scene"), chapters, { lite: lite, reduceMotion: reduceMotion });
  } catch (err) {
    body.classList.add("no-webgl");
    world = SB.createStaticWorld();
  }

  /* ---------- sections: index 0 is the opening, the rest are chapters ---------- */
  var view = SB.createMemoryView($("#memoryView"));
  var host = $("#chapters");
  var sections = [$("#opening")];
  var parts = [];            // per chapter: { beats, at, entered, story, gate, back, next }

  chapters.forEach(function (ch, i) {
    if (i === 0) return;
    var hasNext = !!chapters[i + 1];
    var upcoming = SB.outline[SB.outline.findIndex(function (o) { return o.id === ch.id; }) + 1];
    var section = SB.renderChapter(ch, SB.memories, {
      open: view.open,
      enter: function () { enterChapter(i); },
      step: function (delta) { step(i, delta); },
      dive: function (el) { dive(i, el); },
      next: hasNext ? function () { travel(i + 1); } : null,
      nextLabel: upcoming ? (isNaN(upcoming.number) ? "" : "Chapter " + upcoming.number + " · ") + upcoming.title : "Onward",
      restart: function () { travel(0); }
    });
    host.appendChild(section);
    sections[i] = section;
    parts[i] = {
      beats: Array.prototype.slice.call(section.querySelectorAll(".beat")),
      at: 0, entered: false,
      story: section.querySelector(".story"),
      gate: section.querySelector(".gate"),
      back: section.querySelector(".depthnav__back"),
      next: section.querySelector(".depthnav__next")
    };
  });

  /* ---------- moving deeper inside a chapter ---------- */
  var stepLock = 0;

  function placeBeats(index, at) {
    var p = parts[index], n = p.beats.length;
    p.at = at;
    p.beats.forEach(function (b, j) {
      b.dataset.pos = j < at ? "past" : j === at ? "current" : j === at + 1 ? "next" : "far";
      b.classList.toggle("is-in", j === at);
      b.inert = j !== at;
      if (j >= at) { b.classList.remove("dive"); b.style.transformOrigin = ""; }
    });
    var progress = n > 1 ? at / (n - 1) : 0;
    world.setProgress(index, progress);                 // the camera moves in with the story
    railFill.style.transform = "scaleY(" + progress.toFixed(4) + ")";

    // "Continue" only where the pictures are not themselves the way onward
    var here = p.beats[at], ahead = p.beats[at + 1];
    p.next.hidden = !ahead || here.dataset.doors === "true";
    if (ahead) p.next.setAttribute("aria-label", "Continue: " + ahead.dataset.name);
    p.back.setAttribute("aria-label", at === 0 ? "Back to the chapter's intro picture" : "Back: " + p.beats[at - 1].dataset.name);
  }

  /* Clicking an intro picture: the scene rushes past from that picture,
     so it feels like stepping into it, and the next part arrives. */
  function dive(index, el) {
    var p = parts[index];
    if (!p || !p.entered || busy || Date.now() < stepLock) return;
    var b = p.beats[p.at];
    if (el && !reduceMotion) {
      var r = el.getBoundingClientRect();
      b.style.transformOrigin = (r.left + r.width / 2) + "px " + (r.top + r.height / 2) + "px";
      b.classList.add("dive");
    }
    step(index, 1);
  }

  function step(index, delta) {
    var p = parts[index];
    var now = Date.now();
    if (!p || !p.entered || busy || now < stepLock) return;
    var to = p.at + delta;
    if (to >= p.beats.length) return;
    stepLock = now + (reduceMotion ? 300 : 950);
    if (to < 0) { leaveChapter(index); return; }
    placeBeats(index, to);
  }

  /* through the intro picture, into the chapter */
  function enterChapter(index) {
    var p = parts[index], s = sections[index];
    if (busy || p.entered || s.classList.contains("is-entering")) return;
    s.classList.add("is-entering");
    p.gate.inert = true;
    world.setEntered(index, true);
    setTimeout(function () {
      p.entered = true;
      s.classList.add("is-entered");
      body.classList.add("in-story");
      p.story.inert = false;
      placeBeats(index, 0);
      var start = s.querySelector("[data-story-start]");
      if (start) start.focus({ preventScroll: true });
    }, reduceMotion ? 350 : 1000);
  }

  /* back out to the intro picture */
  function leaveChapter(index, instant) {
    var p = parts[index], s = sections[index];
    p.entered = false;
    s.classList.remove("is-entered", "is-entering");
    body.classList.remove("in-story");
    p.story.inert = true;
    p.gate.inert = false;
    p.beats.forEach(function (b) { b.dataset.pos = "far"; b.classList.remove("is-in"); b.inert = true; });
    p.at = 0;
    world.setEntered(index, false, instant);
    world.setProgress(index, 0);
    railFill.style.transform = "scaleY(0)";
    if (!instant) {
      var door = s.querySelector(".gate__door");
      if (door) door.focus({ preventScroll: true });
    }
  }

  /* wheel, keys and swipes also move in depth (never a page scroll) */
  function activeChapter() { return current > 0 && parts[current] && parts[current].entered ? current : 0; }
  function dialogOpen() { return !!document.querySelector("dialog[open]"); }

  window.addEventListener("wheel", function (e) {
    var i = activeChapter();
    if (!i || dialogOpen() || Math.abs(e.deltaY) < 12) return;
    step(i, e.deltaY > 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    var i = activeChapter();
    if (!i || dialogOpen()) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); step(i, 1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); step(i, -1); }
  });

  var touchStart = null;
  window.addEventListener("touchstart", function (e) {
    touchStart = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  window.addEventListener("touchend", function (e) {
    var i = activeChapter();
    if (!touchStart || !i || dialogOpen()) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    touchStart = null;
    var d = Math.abs(dy) > Math.abs(dx) ? dy : dx;
    if (Math.abs(d) < 60) return;
    step(i, d < 0 ? 1 : -1);                           // swipe up or left goes deeper
  }, { passive: true });

  /* ---------- theme ---------- */
  function applyTheme(index) {
    var ch = chapters[index], ui = ch.ui;
    body.style.setProperty("--ink", ui.ink);
    body.style.setProperty("--soft", ui.soft);
    body.style.setProperty("--line", ui.line);
    body.style.setProperty("--frame", ui.frame);
    body.style.setProperty("--hover", ui.hover || "rgba(255,255,255,.8)");
    body.style.setProperty("--paper", ui.paper || "#fbf5ea");
    body.style.setProperty("--shadow", ui.shadow || "none");
    // colours for the CSS stand-in world
    body.style.setProperty("--fb-glow", ch.world.glow);
    ch.world.shapes.slice(0, 4).forEach(function (c, i) { body.style.setProperty("--fb-" + (i + 1), c); });
    $("#where").textContent = ch.number + " · " + ch.title;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", ch.atmosphere[0]);
  }

  /* ---------- travelling between chapters ---------- */
  var current = 0, busy = false, themed = 0;

  function onBlend(from, to, k) {
    // cross-fade the sky: the later chapter's layer always sits on top
    var upper = Math.max(from, to), lower = Math.min(from, to);
    var upperK = to > from ? k : 1 - k;
    layers.forEach(function (l, i) {
      l.style.opacity = i === lower ? 1 : i === upper ? upperK : 0;
    });
    // travelling into the light
    var peak = Math.pow(Math.sin(Math.PI * k), 1.3);
    bloom.style.opacity = (peak * (reduceMotion ? 0.35 : 0.92)).toFixed(3);
    bloom.style.transform = "scale(" + (0.5 + k * 1.6).toFixed(3) + ")";
    // swap ink colours while the light covers the screen
    if (k > 0.45 && themed !== to) { themed = to; applyTheme(to); }
    // the destination's interface arrives near the end
    if (k > 0.62 && shown !== to) show(to);
  }

  var shown = -1;
  function show(index) {
    shown = index;
    body.dataset.view = index === 0 ? "opening" : "chapter";
    sections.forEach(function (s, i) {
      s.inert = i !== index;
      s.classList.toggle("is-active", i === index);
    });
  }

  function travel(index) {
    if (busy || index === current || !sections[index]) return Promise.resolve();
    busy = true;
    shown = -1;
    body.dataset.view = "travel";
    body.classList.remove("in-story");
    sections.forEach(function (s) { s.inert = true; s.classList.remove("is-active"); });

    // every chapter is arrived at from its intro picture
    if (index > 0) leaveChapter(index, true);

    var duration = reduceMotion ? 1200 : (index > current ? 4200 : 3000);
    return world.transitionTo(index, duration, onBlend).then(function () {
      var left = current;
      current = index;
      busy = false;
      bloom.style.opacity = 0;
      if (shown !== index) show(index);
      if (left > 0 && left !== index) leaveChapter(left, true);
      markOverview();
      var target = index === 0 ? $("#enter") : sections[index].querySelector("[data-chapter-title]");
      if (target) target.focus({ preventScroll: true });
    });
  }

  var enterBtn = $("#enter");
  enterBtn.addEventListener("click", function () {
    enterBtn.classList.add("is-pressed");              // acknowledge the press
    setTimeout(function () {
      travel(1).then(function () { enterBtn.classList.remove("is-pressed"); });
    }, 180);
  });

  /* ---------- chapter overview ---------- */
  var overview = $("#overview"), list = $("#overviewList"), overviewBtns = [];
  SB.outline.forEach(function (item) {
    var index = chapters.findIndex(function (c) { return c.id === item.id; });
    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "overview__item";
    var num = document.createElement("span"); num.className = "overview__num"; num.textContent = item.number;
    var name = document.createElement("span"); name.className = "overview__name"; name.textContent = item.title;
    var state = document.createElement("span"); state.className = "overview__state";
    btn.appendChild(num); btn.appendChild(name); btn.appendChild(state);
    if (index < 0) { btn.disabled = true; state.textContent = "Coming soon"; }
    else btn.addEventListener("click", function () { overview.close(); travel(index); });
    li.appendChild(btn);
    list.appendChild(li);
    overviewBtns.push({ btn: btn, state: state, index: index });
  });
  function markOverview() {
    overviewBtns.forEach(function (o) {
      if (o.index < 0) return;
      var here = o.index === current;
      o.btn.toggleAttribute("aria-current", here);
      o.state.textContent = here ? "You are here" : "";
    });
  }
  $("#openOverview").addEventListener("click", function () {
    if (busy) return;
    markOverview();
    overview.showModal();
  });
  $("#closeOverview").addEventListener("click", function () { overview.close(); });
  overview.addEventListener("click", function (e) { if (e.target === overview) overview.close(); });

  /* ---------- pointer parallax (mouse only; touch gets a steady scene) ---------- */
  if (!reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      world.setPointer(x, y);
      body.style.setProperty("--px", x.toFixed(3));
      body.style.setProperty("--py", y.toFixed(3));
    });
  }

  /* ---------- start ---------- */
  applyTheme(0);
  var bar = $("#loaderBar");
  bar.style.transform = "scaleX(.35)";

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var patience = new Promise(function (r) { setTimeout(r, 2500); });   // never wait long for fonts
  var minimum = new Promise(function (r) { setTimeout(r, reduceMotion ? 200 : 1100); });

  Promise.all([Promise.race([fontsReady, patience]), minimum]).then(function () {
    bar.style.transform = "scaleX(1)";
    setTimeout(function () {
      body.classList.add("is-ready");
      show(0);
      world.reveal(reduceMotion ? 0 : 4200);           // the first light
    }, 450);
  });
})();
