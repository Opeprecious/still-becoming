/*
  MEMORIES
  ------------------------------------------------------------------
  Every picture in the site is one entry here. Photos and captions were
  last synced from the Figma file.

  TO CHANGE A PICTURE: replace the file (same name) or change `src`.
  TO CHANGE A CAPTION: edit `caption`.

  Fields:
    id       unique name; chapters.js lists these ids per part
    chapter  the chapter it belongs to
    type     "image" (also supported: "video", "audio", "text")
    src      the large picture shown when it pops up
    thumb    the smaller crop shown on the wall (optional; falls back to src)
    caption  the line shown above the picture when it pops up
    shape    "portrait" | "landscape" | "square" (frame proportion on the page)
    fit      true = show the whole picture uncropped inside the frame
  ------------------------------------------------------------------
*/
window.SB = window.SB || {};

SB.memories = [
  /* ---------- 01 · intro (the two doors into the chapter) ---------- */
  { id: "childhood-intro-1", chapter: "childhood", type: "image", shape: "portrait",
    src: "assets/images/childhood/intro-1.jpg", caption: "" },
  { id: "childhood-intro-2", chapter: "childhood", type: "image", shape: "landscape",
    src: "assets/images/childhood/intro-2.jpg", caption: "" },

  /* ---------- 01 · the wall ---------- */
  { id: "childhood-1", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-1.jpg", thumb: "assets/images/childhood/wall-1-thumb.jpg",
    caption: "Hot gidan sama boy" },
  { id: "childhood-2", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-2.jpg", thumb: "assets/images/childhood/wall-2-thumb.jpg",
    caption: "Hotness" },
  { id: "childhood-3", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-3.jpg", thumb: "assets/images/childhood/wall-3-thumb.jpg",
    caption: "Such cuteness" },
  { id: "childhood-4", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-4.jpg", thumb: "assets/images/childhood/wall-4-thumb.jpg",
    caption: "Such cuteness" },
  { id: "childhood-5", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-5.jpg", thumb: "assets/images/childhood/wall-5-thumb.jpg",
    caption: "Such a fine boy" },
  { id: "childhood-6", chapter: "childhood", type: "image", shape: "square",
    src: "assets/images/childhood/wall-6.jpg", thumb: "assets/images/childhood/wall-6-thumb.jpg",
    caption: "Cutest adolescent" }
];
