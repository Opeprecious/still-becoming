/*
  MEMORY VIEW
  The pop-up card: the picture shown large over a blurred, lightened
  backdrop, its caption above it and "Back" underneath. It grows out of
  the picture that was clicked and returns the visitor to exactly where
  they were. A native <dialog>, so Escape closes it and focus is trapped.

    const view = SB.createMemoryView(dialogElement);
    view.open(memory, clickedElement);

  Pictures are the main case; video, audio and written notes also work.
*/
(function () {
  "use strict";
  var SB = (window.SB = window.SB || {});
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  SB.createMemoryView = function (dialog) {
    var media = dialog.querySelector("[data-mv-media]");
    var caption = dialog.querySelector("[data-mv-caption]");
    var frame = dialog.querySelector("[data-mv-frame]");
    var closeBtns = dialog.querySelectorAll("[data-mv-close]");
    var playing = null;

    function unavailable() {
      media.innerHTML = "";
      var p = el("p", "mv__missing");
      p.appendChild(el("strong", "", "Not available yet"));
      p.appendChild(el("span", "", "This hasn't been added. The story is still here."));
      media.appendChild(p);
      playing = null;
    }

    function build(memory) {
      media.innerHTML = "";
      playing = null;
      var node;
      if (memory.type === "video") {
        node = document.createElement("video");
        node.controls = true; node.preload = "none"; node.playsInline = true;   // plays only when asked
        if (memory.thumbnail) node.poster = memory.thumbnail;
        node.src = memory.src;
        playing = node;
      } else if (memory.type === "audio") {
        node = document.createElement("audio");
        node.controls = true; node.preload = "none";
        node.src = memory.src;
        playing = node;
      } else if (memory.type === "text") {
        node = el("p", "mv__note", memory.description || "");
      } else {
        node = new Image();
        node.alt = memory.caption || memory.title || "";
        node.src = memory.src;
      }
      node.addEventListener("error", unavailable);
      media.appendChild(node);
      media.dataset.type = memory.type;
      media.dataset.fit = memory.fit ? "contain" : "cover";

      var words = memory.caption || memory.title || "";
      caption.textContent = words;
      caption.classList.toggle("is-empty", !words);
      dialog.setAttribute("aria-label", words || "Picture");
    }

    function silence() { if (playing) { try { playing.pause(); } catch (e) {} } }
    function close() { silence(); if (dialog.open) dialog.close(); }

    closeBtns.forEach(function (b) { b.addEventListener("click", close); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener("close", silence);

    return {
      open: function (memory, origin) {
        build(memory);
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");

        // grow out of the picture that was clicked
        if (origin && !reduce && frame.animate) {
          var from = (origin.querySelector(".memory__frame") || origin).getBoundingClientRect();
          var to = frame.getBoundingClientRect();
          if (from.width && to.width) {
            var s = from.width / to.width;
            var dx = (from.left + from.width / 2) - (to.left + to.width / 2);
            var dy = (from.top + from.height / 2) - (to.top + to.height / 2);
            frame.animate(
              [{ transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")", opacity: 0.6 },
               { transform: "none", opacity: 1 }],
              { duration: 620, easing: "cubic-bezier(.22,.7,.2,1)" }
            );
          }
        }
      },
      close: close
    };
  };
})();
