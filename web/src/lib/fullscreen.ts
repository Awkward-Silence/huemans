/** Best-effort fullscreen. Must be called from a user gesture (a tap). */
function enterFullscreen(): void {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
  document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
}

function exitFullscreen(): void {
  if (!document.fullscreenElement) return;
  document.exitFullscreen().catch(() => undefined);
}

export { enterFullscreen, exitFullscreen };
