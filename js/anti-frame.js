const guard = document.getElementById('antiFrameGuard');

if (window.self === window.top) {
  guard?.remove();
} else {
  try {
    window.top.location = window.self.location.href;
  } catch {
    // Keep the guard in place. If a framing context blocks top-level navigation,
    // the application remains hidden instead of exposing clickable UI.
  }
}
