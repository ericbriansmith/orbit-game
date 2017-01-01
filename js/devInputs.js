function setupDevInput() {
  message("Setting up dev inputs");
  document.addEventListener("keypress", function(event) {
    //var x = event.which || event.keyCode; for firefox support
    if (!gameState.inputMuted) {
      //49 is the 1 key
      if (event.keyCode >= 49 && event.keyCode <= 57) {
        setLevel(event.keyCode - 49);
      }
    }
  });
}
