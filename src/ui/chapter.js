/*
  CHAPTER RENDERER
  Turns one chapter's data (chapters.js) into its scrolling story.
  Each beat layout is a small reusable builder, so later chapters reuse
  them just by listing beats in their data.

    const section = SB.renderChapter(chapter, memories, {
      open(memory)   open a memory in the larger view
      enter()        step through the intro picture into the story
      next           function to travel onward, or null if not built yet
      nextLabel      text for the onward button
      restart()      return to the opening scene
    });
*/
(function () {
  "use strict";
  var SB = (window.SB = window.SB || {});

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var VERB = { image: "Open +", video: "Play ▶", audio: "Listen", text: "Read +" };

  /* A floating memory frame. A real <button>, so it works by tap,
     click and keyboard alike. */
  /* opts.bare    no caption row under the picture
     opts.noVerb  caption only, no "Open +"
     opts.door    the picture is a way into the next part, not a pop-up */
  function frame(memory, onClick, opts) {
    opts = opts || {};
    var btn = el("button", "memory");
    btn.type = "button";
    btn.dataset.shape = memory.shape || "landscape";
    btn.dataset.type = memory.type;
    if (memory.fit) btn.dataset.fit = "contain";
    var what = memory.caption || memory.title || "photograph";
    btn.setAttribute("aria-label", opts.door ? "Go into the pictures" :
      (memory.type === "video" ? "Play video: " : "Open picture: ") + what);

    var arrive = el("span", "memory__arrive");
    var float = el("span", "memory__float");
    var box = el("span", "memory__frame");
    var img = new Image();
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = memory.thumb || memory.thumbnail || memory.src;
    box.appendChild(img);
    if (memory.type === "video") box.appendChild(el("span", "memory__play", "▶"));
    float.appendChild(box);

    if (!opts.bare && (memory.caption || memory.title)) {
      var meta = el("span", "memory__meta");
      meta.appendChild(el("span", "memory__caption", memory.caption || memory.title));
      if (!opts.noVerb) meta.appendChild(el("span", "memory__open", VERB[memory.type] || VERB.image));
      float.appendChild(meta);
    }

    arrive.appendChild(float);
    btn.appendChild(arrive);
    btn.addEventListener("click", function () { onClick(memory, btn); });
    return btn;
  }

  function textBlock(beat, headingTag, isChapterTitle) {
    var box = el("div", "beat__text");
    if (beat.eyebrow) box.appendChild(el("p", "beat__eyebrow reveal", beat.eyebrow));
    if (beat.title) {
      var h = el(headingTag, "beat__title reveal", beat.title);
      if (isChapterTitle) { h.classList.add("beat__title--chapter"); h.tabIndex = -1; h.setAttribute("data-chapter-title", ""); }
      box.appendChild(h);
    }
    if (beat.text) box.appendChild(el("p", "beat__body reveal", beat.text));
    return box;
  }

  /* ---------- layouts ---------- */
  var LAYOUTS = {
    intro: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      var text = el("div", "beat__text");
      if (beat.eyebrow) text.appendChild(el("p", "beat__eyebrow reveal", beat.eyebrow));
      var lead = el("p", "beat__lead reveal", beat.text);
      lead.tabIndex = -1;
      lead.setAttribute("data-story-start", "");
      text.appendChild(lead);
      if (beat.hint) text.appendChild(el("p", "beat__hint reveal", beat.hint));
      inner.appendChild(text);
      // the two pictures are doors: clicking one goes into the next part
      ctx.frames(beat.memories, { bare: true, door: true }, ctx.dive).forEach(function (f) { inner.appendChild(f); });
      return [inner];
    },

    gathering: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      if (beat.title || beat.text) inner.appendChild(textBlock(beat, "h3"));
      else inner.classList.add("beat__inner--wall-only");
      var wall = el("div", "wall");
      var cols = [el("div", "wall__col"), el("div", "wall__col"), el("div", "wall__col")];
      // clicking a picture pops it up large with its caption
      ctx.frames(beat.memories, { bare: true }).forEach(function (f, i) { cols[i % 3].appendChild(f); });
      wall.appendChild(cols[0]);
      wall.appendChild(cols[1]);
      wall.appendChild(cols[2]);
      inner.appendChild(wall);
      return [inner];
    },

    editorial: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      inner.appendChild(textBlock(beat, "h3"));
      var collage = el("div", "collage");
      ctx.frames(beat.memories, { bare: beat.captions === false, noVerb: beat.verb === false }).forEach(function (f) { collage.appendChild(f); });
      inner.appendChild(collage);
      return [inner];
    },

    cinematic: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      var m = ctx.memory(beat.memory);
      if (m) inner.appendChild(frame(m, ctx.open));
      if (beat.line) inner.appendChild(el("p", "beat__line reveal", beat.line));
      return [inner];
    },

    cluster: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      inner.appendChild(textBlock(beat, "h3"));
      var group = el("div", "cluster");
      ctx.frames(beat.memories).forEach(function (f) { group.appendChild(f); });
      inner.appendChild(group);
      return [inner];
    },

    voices: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      if (beat.eyebrow) inner.appendChild(el("p", "beat__eyebrow reveal", beat.eyebrow));
      var quote = el("blockquote", "quote reveal");
      quote.appendChild(el("p", "", "“" + beat.quote + "”"));
      if (beat.by) quote.appendChild(el("footer", "", beat.by));
      inner.appendChild(quote);

      var voice = ctx.memory(beat.voice);
      if (voice) {
        var chip = el("button", "voicechip reveal");
        chip.type = "button";
        chip.appendChild(el("span", "voicechip__icon", "▶"));
        chip.appendChild(el("span", "", voice.caption || "Listen to a voice note"));
        chip.addEventListener("click", function () { ctx.open(voice); });
        inner.appendChild(chip);
      }
      // optional discovery: never carries essential story
      var secret = ctx.memory(beat.secret);
      if (secret) {
        var orb = el("button", "secret reveal");
        orb.type = "button";
        orb.setAttribute("aria-label", "A hidden note. Open it.");
        orb.appendChild(el("i"));
        orb.addEventListener("click", function () { ctx.open(secret); });
        inner.appendChild(orb);
      }
      return [inner];
    },

    /* A heading over a few short cards: milestones, qualities, dreams,
       inside jokes. A card with a `memory` opens that memory. */
    notes: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      inner.appendChild(textBlock(beat, "h3"));
      var grid = el("div", "notes");
      (beat.items || []).forEach(function (item) {
        var m = item.memory ? ctx.memory(item.memory) : null;
        var card = el(m ? "button" : "div", "note reveal");
        if (m) {
          card.type = "button";
          card.classList.add("note--open");
          card.addEventListener("click", function () { ctx.open(m); });
        }
        if (item.label) card.appendChild(el("span", "note__label", item.label));
        card.appendChild(el("span", "note__title", item.title));
        if (item.text) card.appendChild(el("span", "note__text", item.text));
        if (m) card.appendChild(el("span", "note__open", VERB[m.type] || VERB.image));
        grid.appendChild(card);
      });
      inner.appendChild(grid);
      return [inner];
    },

    /* A written letter on a quiet sheet of paper. */
    letter: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      var sheet = el("article", "letter reveal");
      sheet.tabIndex = -1;
      sheet.setAttribute("data-story-start", "");
      if (beat.eyebrow) sheet.appendChild(el("p", "letter__eyebrow", beat.eyebrow));
      if (beat.greeting) sheet.appendChild(el("p", "letter__greeting", beat.greeting));
      (beat.paragraphs || []).forEach(function (p) { sheet.appendChild(el("p", "letter__p", p)); });
      if (beat.sign) sheet.appendChild(el("p", "letter__sign", beat.sign));
      inner.appendChild(sheet);
      return [inner];
    },

    close: function (beat, ctx) {
      var inner = el("div", "beat__inner");
      if (beat.final) {
        // the last words of the whole experience: given room, nothing else
        var last = el("div", "beat__text beat__text--final");
        if (beat.text) last.appendChild(el("p", "beat__line reveal", beat.text));
        last.appendChild(el("h3", "beat__title beat__title--chapter reveal", beat.title));
        inner.appendChild(last);
        var again = el("div", "beat__actions reveal");
        var replay = el("button", "pill pill--quiet", "Begin again");
        replay.type = "button";
        replay.addEventListener("click", ctx.restart);
        again.appendChild(replay);
        inner.appendChild(again);
        return [inner];
      }
      inner.appendChild(textBlock(beat, "h3"));
      var actions = el("div", "beat__actions reveal");
      var next = el("button", "pill");
      next.type = "button";
      next.appendChild(el("span", "", ctx.nextLabel));
      if (ctx.next) next.addEventListener("click", ctx.next);
      else { next.disabled = true; next.appendChild(el("small", "", "coming soon")); }
      var restart = el("button", "pill pill--quiet", "← Back to the first light");
      restart.type = "button";
      restart.addEventListener("click", ctx.restart);
      actions.appendChild(next);
      actions.appendChild(restart);
      inner.appendChild(actions);
      return [inner];
    }
  };

  SB.renderChapter = function (chapter, memories, actions) {
    var byId = {};
    memories.forEach(function (m) { if (m.chapter === chapter.id) byId[m.id] = m; });

    var ctx = {
      open: actions.open,
      next: actions.next,
      nextLabel: actions.nextLabel,
      restart: actions.restart,
      dive: function (memory, btn) { actions.dive(btn); },
      memory: function (id) { return byId[id] || null; },
      frames: function (ids, opts, onClick) {
        return (ids || []).map(function (id) { return byId[id]; }).filter(Boolean)
          .map(function (m) { return frame(m, onClick || actions.open, opts); });
      }
    };

    var section = el("section", "chapter");
    section.id = "chapter-" + chapter.id;
    section.setAttribute("aria-label", "Chapter " + chapter.number + ": " + chapter.title);
    section.inert = true;

    /* The gate: title plus the chapter's one intro picture. */
    var g = chapter.gate || { title: chapter.title };
    var gate = el("div", "gate");
    var gtext = el("div", "gate__text");
    if (g.eyebrow) gtext.appendChild(el("p", "beat__eyebrow", g.eyebrow));
    var gtitle = el("h2", "beat__title beat__title--chapter", g.title || chapter.title);
    gtitle.tabIndex = -1;
    gtitle.setAttribute("data-chapter-title", "");
    gtext.appendChild(gtitle);
    if (g.line) gtext.appendChild(el("p", "gate__line", g.line));
    gate.appendChild(gtext);

    var door = el("button", "gate__door");
    door.type = "button";
    door.setAttribute("aria-label", (g.cta || "Step inside") + ": " + (g.eyebrow ? g.eyebrow + ", " : "") + (g.title || chapter.title));
    var arrive = el("span", "gate__arrive");
    var float = el("span", "gate__float");
    var box = el("span", "memory__frame");
    if (g.image) {
      var pic = new Image();
      pic.alt = "";
      pic.decoding = "async";
      pic.src = g.image;
      box.appendChild(pic);
    }
    var cta = el("span", "gate__cta");
    cta.appendChild(el("i"));
    cta.appendChild(el("span", "", g.cta || "Step inside"));
    cta.appendChild(el("i"));
    float.appendChild(box);
    float.appendChild(cta);
    arrive.appendChild(float);
    door.appendChild(arrive);
    door.addEventListener("click", function () { actions.enter(); });
    gate.appendChild(door);
    section.appendChild(gate);

    /* The story: the beats, scrolled through once inside. */
    var story = el("div", "story");
    story.inert = true;
    (chapter.beats || []).forEach(function (beat) {
      var build = LAYOUTS[beat.layout];
      if (!build) return;
      var wrap = el("div", "beat beat--" + beat.layout);
      wrap.dataset.beat = beat.id;
      wrap.dataset.pos = "far";
      wrap.inert = true;
      wrap.dataset.name = beat.name || beat.eyebrow || beat.title || "";
      // an intro's pictures lead onward themselves, so it needs no "Continue"
      if (beat.layout === "intro") wrap.dataset.doors = "true";
      build(beat, ctx).forEach(function (node) { wrap.appendChild(node); });
      story.appendChild(wrap);
    });
    section.appendChild(story);

    /* Moving through the chapter: forward goes deeper, back comes out. */
    var nav = el("nav", "depthnav");
    nav.setAttribute("aria-label", "Move through this chapter");
    var back = el("button", "depthnav__back", "← Back");
    back.type = "button";
    back.addEventListener("click", function () { actions.step(-1); });
    // Not in the Figma file: without it there is no visible way on from a wall of pictures.
    var next = el("button", "depthnav__next", "Continue →");
    next.type = "button";
    next.addEventListener("click", function () { actions.step(1); });
    nav.appendChild(back);
    nav.appendChild(next);
    section.appendChild(nav);
    return section;
  };
})();
