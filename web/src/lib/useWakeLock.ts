import { useEffect } from "react";

/**
 * Keeps the screen on while `enabled`. Best effort: browsers without the
 * Screen Wake Lock API, or that refuse it, simply let the screen sleep.
 * The lock is re-requested when the page becomes visible again, since
 * browsers drop it whenever the tab is hidden.
 */
function useWakeLock(enabled = true): void {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | undefined;
    let active = true;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (active) sentinel = lock;
        else await lock.release();
      } catch {
        // Denied (battery saver, not visible): nothing to do.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
}

export { useWakeLock };
