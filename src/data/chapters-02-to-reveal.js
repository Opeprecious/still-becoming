/*
  CHAPTERS 02 to 05 AND THE BIRTHDAY REVEAL
  Same shape as chapters.js (read the notes at the top of that file).
  The world is never rebuilt: each chapter only changes its colours,
  light, pace and how the same forms are arranged.

  Text here was last synced from the Figma file. Lines that still read
  "Write ..." are prompts waiting for your own words.
*/
(function () {
  "use strict";
  var SB = window.SB;

  var DARK_UI = {
    ink: "#fff6ea", soft: "rgba(255,246,234,.8)", line: "rgba(255,246,234,.42)",
    frame: "rgba(255,255,255,.14)", hover: "rgba(255,255,255,.28)",
    shadow: "0 1px 26px rgba(22,10,46,.7), 0 0 4px rgba(22,10,46,.35)"     // keeps light text readable over the glow
  };
  function ui(base, extra) {
    var o = {};
    Object.keys(base).forEach(function (k) { o[k] = base[k]; });
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }

  SB.chapters.push(

    /* ================= 02 · THE ADVENTURES ================= */
    {
      id: "adventures",
      number: "02",
      title: "The Adventures",
      atmosphere: ["#1f3fd6", "#6a2c8e", "#f2705a"],          // electric blue, plum, coral
      ui: ui(DARK_UI, { paper: "#2a1650" }),
      world: {
        glow: "#ffe9d6", light: "#ffd0c0", lightPower: 1.3, fill: 0.4,
        sky: "#4f6bff", ground: "#7a2f86", fog: "#5a2f8c", fogDensity: 0.032,
        shapes: ["#3d6bff", "#ff7d63", "#8d3fb0", "#ffb199", "#5fd0ff"],
        rim: "#cfe0ff", trail: "#ffd9cf",
        motion: 1.9, trailPower: 0.5, spread: 1.08, glowScale: 0.95,   // more movement and energy
        cameraGate: { pos: [1.5, 0.4, 12.4], look: [0, -3.0, 0] },
        camera:     { pos: [-1.2, 0, 9.2],   look: [0, -2.3, 0] },
        cameraEnd:  { pos: [-2.6, -1.2, 5.4], look: [-0.4, -2.6, 0] }
      },
      gate: {
        eyebrow: "Chapter 02",
        title: "The Adventures",
        line: "The years that got loud, and the people who were there for them.",
        image: "assets/images/teenage/gate.jpg",
        cta: "Step inside"
      },
      beats: [
        {
          id: "intro", layout: "intro", name: "The teenage years",
          eyebrow: "The teenage years",
          text: "Then came the years of big plans, long days out and friends who became family.",
          memories: ["teen-intro-1", "teen-intro-2"]
        },
        {
          id: "wall", layout: "gathering", name: "Friendships",
          memories: ["friends-1", "friends-3", "friends-5", "friends-2", "friends-4", "friends-6"]
        },
        {
          id: "close", layout: "close", name: "Onward",
          title: "Then the adventures turned into ambitions.",
          text: "You were the young teenager from Kakuri, curious about the world outside of your reach."
        }
      ]
    },

    /* ================= 03 · THE BECOMING ================= */
    {
      id: "becoming",
      number: "03",
      title: "The Becoming",
      atmosphere: ["#3f4430", "#8a4a2c", "#b98343"],          // muted olive, terracotta, bronze
      ui: ui(DARK_UI, { paper: "#3a2416" }),
      world: {
        glow: "#ffe2b8", light: "#ffc98a", lightPower: 1.5, fill: 0.22,   // stronger, more directional light
        sky: "#8a8f5e", ground: "#5a2e1a", fog: "#7a4a2e", fogDensity: 0.034,
        shapes: ["#c9683f", "#b08d57", "#7d8457", "#e0a070", "#d4b483"],
        rim: "#f3d9b0", trail: "#ffd9a0",
        motion: 0.75, trailPower: 0.3, spread: 0.86, shapeScale: 1.25,   // larger, closer, more deliberate forms
        cameraGate: { pos: [-1.2, 0.6, 12.8], look: [0, -3.0, 0] },
        camera:     { pos: [0.8, 0.2, 9.8],   look: [0, -2.4, 0] },
        cameraEnd:  { pos: [2.2, 1.0, 6.0],   look: [0.3, -1.6, 0] }
      },
      gate: {
        eyebrow: "Chapter 03",
        title: "The Becoming",
        line: "The work, the choices and the growing up.",
        image: "assets/images/adulthood/gate.jpg",
        cta: "Step inside"
      },
      beats: [
        {
          id: "intro", layout: "intro", name: "Growing into it",
          eyebrow: "Growing into it",
          text: "Nothing here was handed over. It was built, one decision and one long day at a time.",
          memories: ["adult-intro-1", "adult-intro-2"]
        },
        {
          // The six pictures here are the ones that have captions in Figma.
          // The five other wall pictures from Figma are saved, unused, as
          // assets/images/adulthood/unused-wall-2.jpg to unused-wall-6.jpg.
          id: "wall", layout: "gathering", name: "The becoming",
          memories: ["becoming-1", "becoming-2", "becoming-3", "becoming-4", "becoming-5", "becoming-6"]
        },
        {
          id: "close", layout: "close", name: "Onward",
          title: "And all of it made the man you are.",
          text: "You started with curiosity and a stubborn refusal to quit. Skill by skill and win by win, you built a career, and a success, that is entirely your own."
        }
      ]
    },

    /* ================= 04 · RIGHT NOW =================
       Who and what he is today. Captions and lines here are drafts written
       from the photographs: replace them with your own words. */
    {
      id: "now",
      number: "04",
      title: "Right Now",
      atmosphere: ["#0b3d4a", "#14707a", "#e0a74a"],          // deep teal, sea green, sunlit gold
      ui: ui(DARK_UI, { paper: "#0b3d4a", shadow: "0 1px 26px rgba(4,30,38,.75), 0 0 4px rgba(4,30,38,.4)" }),
      world: {
        glow: "#fff1c9", light: "#ffe2a8", lightPower: 1.35, fill: 0.4,
        sky: "#2aa0a6", ground: "#0b3d4a", fog: "#12606b", fogDensity: 0.03,
        shapes: ["#19a3a0", "#f2b84b", "#0f6f7c", "#ffd98a", "#7fdad0"],
        rim: "#c9fff4", trail: "#ffe9b0",
        motion: 1.25, trailPower: 0.4, spread: 1.05, glowScale: 1.05,   // bright, open and on the move
        cameraGate: { pos: [0.8, 0.3, 12.4], look: [0, -3.0, 0] },
        camera:     { pos: [-0.6, 0, 9.4],   look: [0, -2.3, 0] },
        cameraEnd:  { pos: [-1.8, -1.0, 5.8], look: [-0.3, -2.4, 0] }
      },
      gate: {
        eyebrow: "Chapter 04",
        title: "Right Now",
        line: "Who you are, and what you are, today.",
        image: "assets/images/recent/gate.jpg",
        cta: "Step inside"
      },
      beats: [
        {
          id: "intro", layout: "intro", name: "These days",
          eyebrow: "These days",
          text: "Look at you now: out in the world, cap on, saying yes to all of it.",
          memories: ["now-intro-1", "now-intro-2"]
        },
        {
          id: "wall", layout: "gathering", name: "Right now",
          memories: ["now-1", "now-2", "now-3", "now-4", "now-5"]
        },
        {
          id: "close", layout: "close", name: "Onward",
          title: "And this is only who you are so far.",
          text: "Curious, fearless, and still the most fun person in any room."
        }
      ]
    },

    /* ================= 05 · THE MAN YOU ARE ================= */
    {
      id: "present",
      number: "05",
      title: "The Man You Are",
      atmosphere: ["#fbf3e2", "#f1c98a", "#c98e55"],          // warm ivory, amber, deep brown
      ui: {
        ink: "#3a2414", soft: "rgba(58,36,20,.78)", line: "rgba(58,36,20,.34)",
        frame: "rgba(255,255,255,.5)", hover: "rgba(255,255,255,.85)", paper: "#fbf5ea"
      },
      world: {
        glow: "#fff0d0", light: "#ffdca6", lightPower: 1.2, fill: 0.45,
        sky: "#fff3dc", ground: "#c98e55", fog: "#eec890", fogDensity: 0.028,
        shapes: ["#e9b46a", "#fbf0da", "#8a5a36", "#f3cf96", "#c98e55"],
        rim: "#fff8e8", trail: "#fff0cc",
        motion: 0.55, trailPower: 0.18, spread: 0.95, glowScale: 1.2,     // slower, warmer, settled
        cameraGate: { pos: [0, 0.2, 11.6], look: [0, -1.0, 0] },
        camera:     { pos: [0, -0.1, 8.6], look: [0, -1.1, 0] },
        cameraEnd:  { pos: [-1.2, -0.8, 5.8], look: [-0.2, -1.5, 0] }
      },
      gate: {
        eyebrow: "Chapter 05",
        title: "The Man You Are",
        line: "Beyond everything, you are the man I love.",
        image: "assets/images/present/gate.jpg",
        cta: "Step inside"
      },
      beats: [
        {
          id: "intro", layout: "intro", name: "Today",
          eyebrow: "Today",
          text: "This is the part I know best: the you I get to see every day.",
          memories: ["present-intro-1", "present-intro-2"]
        },
        {
          id: "us", layout: "gathering", name: "Us",
          eyebrow: "Us",
          title: "The little things, and the two of us",
          text: "Church Sundays, a wedding photo we almost didn’t take, a birthday at the museum. None of it was planned to be special, and all of it was, because it was with you.",
          memories: ["us-1", "us-3", "us-5", "us-2", "us-4", "us-6"]
        },
        {
          id: "close", layout: "close", name: "Onward",
          title: "And there is so much still ahead.",
          text: "After experiencing so many beautiful moments with you, I can't wait for what is to come."
        }
      ]
    },

    /* ================= 06 · THE THINGS AHEAD ================= */
    {
      id: "future",
      number: "06",
      title: "The Things Ahead",
      atmosphere: ["#bcd6f2", "#f7f3e6", "#f3deaa"],          // soft blue, luminous white, pale gold
      ui: {
        ink: "#27304a", soft: "rgba(39,48,74,.76)", line: "rgba(39,48,74,.32)",
        frame: "rgba(255,255,255,.55)", hover: "rgba(255,255,255,.9)", paper: "#fbf5ea"
      },
      world: {
        glow: "#ffffff", light: "#fff6e0", lightPower: 1.3, fill: 0.6,
        sky: "#d6e8fb", ground: "#f3deaa", fog: "#f2ecdc", fogDensity: 0.02,
        shapes: ["#f1d98f", "#b9d4f2", "#ffffff", "#f6e7b8", "#d3e4f7"],
        rim: "#ffffff", trail: "#ffffff",
        motion: 0.9, trailPower: 0.5, spread: 1.45, glowScale: 1.7, shapeScale: 1.1,   // the world opens up
        cameraGate: { pos: [0, 0.6, 14.5], look: [0, -0.8, 0] },
        camera:     { pos: [0, 0.3, 11.5], look: [0, -0.9, 0] },
        cameraEnd:  { pos: [0, 1.4, 8.5],  look: [0, -0.4, 0] }
      },
      gate: {
        eyebrow: "Chapter 06",
        title: "The Things Ahead",
        line: "Everything from here is still unwritten.",
        image: "assets/images/future/chapter-intro.svg",
        cta: "Step inside"
      },
      beats: [
        {
          id: "intro", layout: "intro", name: "Looking forward",
          eyebrow: "Looking forward",
          text: "This chapter has no photographs yet. That is the best thing about it.",
          memories: ["future-01", "future-02"]
        },
        {
          id: "places", layout: "editorial", name: "Places", captions: false,
          eyebrow: "Places",
          title: "Where you still want to go",
          memories: ["place-1", "place-2", "place-3"]
        },
        {
          id: "close", layout: "close", name: "One more thing",
          title: "There is one more thing.",
          text: "Everything so far has been leading here."
        }
      ]
    },

    /* ================= THE BIRTHDAY REVEAL ================= */
    {
      id: "reveal",
      number: "✦",
      title: "The Birthday Reveal",
      atmosphere: ["#f6e6bd", "#fdf8ea", "#f3d9a0"],          // the future palette, warmer and brighter
      ui: {
        ink: "#33261a", soft: "rgba(51,38,26,.76)", line: "rgba(51,38,26,.3)",
        frame: "rgba(255,255,255,.6)", hover: "rgba(255,255,255,.92)", paper: "#fbf5ea"
      },
      world: {
        glow: "#fffaf0", light: "#ffeccc", lightPower: 1.1, fill: 0.55,
        sky: "#fdf3da", ground: "#f1d49a", fog: "#f8ecd2", fogDensity: 0.018,
        shapes: ["#f3dca0", "#fbf2dc", "#d9e6f5", "#f8e8c0", "#ffffff"],
        rim: "#ffffff", trail: "#fff6dc",
        motion: 0.4, trailPower: 0.14, spread: 1.9, glowScale: 2.1, shapeScale: 0.75,   // quiet: room for the letter
        cameraGate: { pos: [0, 0.2, 13],   look: [0, -1.0, 0] },
        camera:     { pos: [0, 0, 10.5],   look: [0, -1.1, 0] },
        cameraEnd:  { pos: [0, -0.3, 8.6], look: [0, -1.2, 0] }
      },
      gate: {
        eyebrow: "For you",
        title: "Happy Birthday",
        line: "One last thing, and it is only for you.",
        image: "assets/images/reveal/gate.jpg",
        cta: "Open it"
      },
      beats: [
        {
          id: "letter", layout: "letter", name: "The letter",
          eyebrow: "A letter",
          greeting: "My love,",
          paragraphs: [
            "This year has challenged us and somehow we are still here, it has been such a wonderful year.",
            "I am so grateful for you in my life, you inspire me to be more and I admire the fact that you don't give up. I hope that this new year comes with ease for you and you achieve all your goals and aspirations.",
            "I wish you so much love, happiness, money and exposure, I hope you enjoyed your day."
          ],
          sign: "Yours, always"
        },
        {
          id: "favourites", layout: "editorial", name: "Three favourites", captions: false,
          eyebrow: "Three I could not leave out",
          title: "My favourite photographs of you",
          text: "I just love how they are different phases of you.",
          memories: ["favourite-1", "favourite-2", "favourite-3"]
        },
        {
          id: "close", layout: "close", final: true, name: "Happy birthday",
          text: "This is everything you've been. This is everything you are. And I can't wait to see everything you become.",
          title: "Happy birthday, my love."
        }
      ]
    }
  );
})();
