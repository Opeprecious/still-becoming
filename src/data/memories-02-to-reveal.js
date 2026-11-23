/*
  MEMORIES FOR CHAPTERS 02 to 05 AND THE REVEAL
  Same fields as memories.js. Photos and captions were last synced from
  the Figma file. An empty caption means none was written in Figma.
*/
(function () {
  "use strict";
  var SB = window.SB;
  var I = "assets/images/";

  function wall(id, chapter, folder, n, caption, extra) {
    var m = { id: id, chapter: chapter, type: "image", shape: "square",
              src: I + folder + "/wall-" + n + ".jpg", thumb: I + folder + "/wall-" + n + "-thumb.jpg",
              caption: caption };
    for (var k in (extra || {})) m[k] = extra[k];
    return m;
  }

  SB.memories.push(

    /* ================= 02 · THE ADVENTURES ================= */
    { id: "teen-intro-1", chapter: "adventures", type: "image", shape: "portrait", src: I + "teenage/intro-1.jpg", caption: "" },
    { id: "teen-intro-2", chapter: "adventures", type: "image", shape: "square",   src: I + "teenage/intro-2.jpg", caption: "" },

    wall("friends-1", "adventures", "friendships", 1, "Omo, hottest tech bros in the building.", { fit: true }),
    wall("friends-2", "adventures", "friendships", 2, "Days of humble beginnings."),
    wall("friends-3", "adventures", "friendships", 3, "I love the outfits"),
    wall("friends-4", "adventures", "friendships", 4, "Who pls?"),
    wall("friends-5", "adventures", "friendships", 5, ""),          // no caption in Figma yet
    wall("friends-6", "adventures", "friendships", 6, ""),          // no caption in Figma yet

    /* ================= 03 · THE BECOMING ================= */
    { id: "adult-intro-1", chapter: "becoming", type: "image", shape: "portrait", src: I + "adulthood/intro-1.jpg", caption: "" },
    { id: "adult-intro-2", chapter: "becoming", type: "image", shape: "square",   src: I + "adulthood/intro-2.jpg", caption: "" },

    // These six are the captioned pictures from Figma, so the wall shows the same
    // picture that pops up (thumb falls back to src).
    { id: "becoming-1", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-1.jpg", caption: "A degree hotter." },
    { id: "becoming-2", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-2.jpg", caption: "The freshest of our time." },
    { id: "becoming-3", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-3.jpg", caption: "Aura king" },
    { id: "becoming-4", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-4.jpg", caption: "Nobody badder than." },
    { id: "becoming-5", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-5.jpg", caption: "Sun kissed." },
    { id: "becoming-6", chapter: "becoming", type: "image", shape: "square", src: I + "adulthood/wall-6.jpg", caption: "Hot Onibenjo" },

    /* ================= 04 · RIGHT NOW ================= */
    // Captions below are drafts written from the photographs.
    { id: "now-intro-1", chapter: "now", type: "image", shape: "portrait", src: I + "recent/intro-1.jpg", caption: "" },
    { id: "now-intro-2", chapter: "now", type: "image", shape: "square",   src: I + "recent/intro-2.jpg", caption: "" },
    { id: "now-1", chapter: "now", type: "image", shape: "square", src: I + "recent/wall-1.jpg", caption: "Main character, waiting on your coffee." },
    { id: "now-2", chapter: "now", type: "image", shape: "square", src: I + "recent/wall-2.jpg", caption: "Found the party. Became the party." },
    { id: "now-3", chapter: "now", type: "image", shape: "square", src: I + "recent/wall-3.jpg", caption: "A whole city behind you, and you’re the view." },
    { id: "now-4", chapter: "now", type: "image", shape: "square", src: I + "recent/wall-4.jpg", caption: "Flying, and smiling the whole way down." },
    { id: "now-5", chapter: "now", type: "image", shape: "square", src: I + "recent/wall-5.jpg", caption: "Somebody take that sword away from you." },

    /* ================= 05 · THE MAN YOU ARE ================= */
    { id: "present-intro-1", chapter: "present", type: "image", shape: "portrait", src: I + "present/intro-1.jpg", caption: "" },
    { id: "present-intro-2", chapter: "present", type: "image", shape: "square",   src: I + "present/intro-2.jpg", caption: "" },

    wall("us-1", "present", "together", 1, "This was us at CLC Ibadan"),
    wall("us-2", "present", "together", 2, "Us at CLC Ilorin, oshey broad shoulders."),
    wall("us-3", "present", "together", 3, "Us at BJ and Faith’s wedding, we almost didn’t take this picture."),
    wall("us-4", "present", "together", 4, "This was us at White House, Jikwoyi, Abuja, right at service."),
    wall("us-5", "present", "together", 5, "Us at Discovery Museum in Abuja, this was your 2025 birthday."),
    wall("us-6", "present", "together", 6, "", { fit: true }),      // no caption in Figma yet

    /* ================= 06 · THE THINGS AHEAD ================= */
    // The intro pictures and the chapter's intro picture are still placeholders in Figma.
    { id: "future-01", chapter: "future", type: "image", shape: "portrait",  src: I + "future/placeholder-01.svg", caption: "" },
    { id: "future-02", chapter: "future", type: "image", shape: "landscape", src: I + "future/placeholder-02.svg", caption: "" },

    { id: "place-1", chapter: "future", type: "image", shape: "portrait",  src: I + "future/place-1.jpg", caption: "Paris, France" },
    { id: "place-2", chapter: "future", type: "image", shape: "landscape", src: I + "future/place-2.jpg", caption: "Venice, Italy" },
    { id: "place-3", chapter: "future", type: "image", shape: "landscape", src: I + "future/place-3.jpg", caption: "Edinburgh, UK" },

    /* ================= THE BIRTHDAY REVEAL ================= */
    { id: "favourite-1", chapter: "reveal", type: "image", shape: "portrait",  src: I + "reveal/favourite-1.jpg", caption: "" },
    { id: "favourite-2", chapter: "reveal", type: "image", shape: "landscape", src: I + "reveal/favourite-2.jpg", caption: "" },
    { id: "favourite-3", chapter: "reveal", type: "image", shape: "landscape", src: I + "reveal/favourite-3.jpg", caption: "" }
  );
})();
