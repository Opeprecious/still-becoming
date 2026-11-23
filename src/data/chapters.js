/*
  CHAPTERS
  One persistent world, many moods. Each chapter describes how the same
  environment should look, where the camera rests, and the story "beats"
  the visitor moves through. Adding a chapter means adding one more entry
  plus its memories. No other code changes.

  atmosphere : three colours for the sky gradient (top, middle, bottom)
  ui         : text colours used by the interface in this chapter
  world      : values the 3D scene blends towards
               cameraGate = where the camera waits at the intro picture
               camera     = where it moves to once the visitor steps inside
               cameraEnd  = where it has drifted to by the end of the chapter
  gate       : the chapter's single intro picture and title; clicking the
               picture steps into the chapter
  beats      : the parts of the chapter, in order. Each picks a layout:
               "intro"     opening lines with two pictures. Clicking either
                           picture goes into the next part.
               "gathering" a wall of pictures (optionally with text beside
                           it). Clicking a picture pops it up large with
                           its caption.
               "editorial" text beside an overlapping collage (3 pictures)
               "letter"    a written letter
               "close"     closing line and the way onward
               (also available: "notes", "cinematic", "voices")
*/
window.SB = window.SB || {};

SB.site = {
  title: "Still Becoming",
  subtitle: "A world of you.",
  intro: "Every version of you has a story. And this is where we begin.",
  enterLabel: "Enter your world"
};

/* The whole journey, for the chapter list. */
SB.outline = [
  { id: "opening",   number: "00", title: "The First Light" },
  { id: "childhood", number: "01", title: "The Little Beginnings" },
  { id: "adventures", number: "02", title: "The Adventures" },
  { id: "becoming",  number: "03", title: "The Becoming" },
  { id: "present",   number: "04", title: "The Man You Are" },
  { id: "future",    number: "05", title: "The Things Ahead" },
  { id: "reveal",    number: "✦",  title: "The Birthday Reveal" }
];

SB.chapters = [
  {
    /* The landing: a glowing gateway with a path of light leading through it. */
    id: "opening",
    number: "00",
    title: "The First Light",
    atmosphere: ["#030212", "#0c0a2a", "#1c1444"],
    ui: { ink: "#f3ead9", soft: "rgba(243,234,217,.72)", line: "rgba(243,234,217,.38)", frame: "rgba(243,234,217,.14)",
          shadow: "0 1px 30px rgba(3,2,18,.9), 0 0 6px rgba(3,2,18,.6)" },
    world: {
      portal: true,              // show the gateway in this chapter
      glow: "#ffe0b0",
      light: "#b9a8ff",
      lightPower: 0.6,
      fill: 0.1,
      sky: "#3c2f7a",
      ground: "#0a0822",
      fog: "#0c0a2a",
      fogDensity: 0.03,
      shapes: ["#5a4aa6", "#7b62b8", "#3f3a86", "#9a7fc4", "#c4b2e6"],
      rim: "#bfaeff",
      trail: "#cdbcff",
      motion: 1,
      glowScale: 0.3,            // the light is a small star inside the gateway
      shapeScale: 0.001,         // the floating forms only appear once inside
      rimPower: 0,
      trailPower: 0,
      camera: { pos: [0, -0.6, 15], look: [0, -2.3, 0] }
    }
  },
  {
    id: "childhood",
    number: "01",
    title: "The Little Beginnings",
    atmosphere: ["#7daedd", "#f3c4a6", "#f8e5a4"],
    ui: { ink: "#241a40", soft: "rgba(36,26,64,.74)", line: "rgba(36,26,64,.34)", frame: "rgba(255,255,255,.5)" },
    world: {
      glow: "#fff2cf",
      light: "#fff0d2",
      lightPower: 1.25,
      fill: 0.5,
      sky: "#bfdcf5",
      ground: "#f6cdae",
      fog: "#f1c9ae",
      fogDensity: 0.03,
      shapes: ["#f6b596", "#f9de86", "#96c6ee", "#ffd0b8", "#fff0bd"],
      rim: "#ffffff",
      trail: "#fff6dc",
      motion: 1.35,
      cameraGate: { pos: [0, 0.1, 12.6], look: [0, -1.0, 0] },
      camera:     { pos: [0, -0.2, 9.6],  look: [0, -1.2, 0] },
      cameraEnd:  { pos: [1.6, -1.5, 5.6], look: [0.4, -2.0, 0] }
    },
    gate: {
      eyebrow: "Chapter 01",
      title: "The Little Beginnings",
      line: "This is where your story first found its light.",
      image: "assets/images/childhood/gate.jpg",
      cta: "Step inside"
    },
    beats: [
      {
        id: "intro", layout: "intro", name: "Where it began",
        eyebrow: "Where it began",
        text: "Before the plans, the titles and the long days, there was you: a boy at the very start of everything.",
        memories: ["childhood-intro-1", "childhood-intro-2"]
      },
      {
        id: "wall", layout: "gathering", name: "The pictures",
        memories: ["childhood-1", "childhood-3", "childhood-5", "childhood-2", "childhood-4", "childhood-6"]
      },
      {
        // Not in the Figma file: kept so there is a way on to chapter 02.
        id: "close", layout: "close", name: "Onward",
        title: "And you kept growing.",
        text: "From being a very smart and introverted child to becoming a curious and adventurous young adult."
      }
    ]
  }
];
