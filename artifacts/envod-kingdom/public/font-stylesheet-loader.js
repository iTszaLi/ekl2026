(() => {
  const stylesheet = document.getElementById("envod-google-fonts");
  if (!(stylesheet instanceof HTMLLinkElement)) return;

  const applyFonts = () => {
    stylesheet.media = "all";
  };

  if (stylesheet.sheet) {
    applyFonts();
  } else {
    stylesheet.addEventListener("load", applyFonts, { once: true });
  }
})();
