/** Keep expensive WebGL scene bootstraps serial instead of mounting several canvases at once. */
type VisualRequest = { id: string; start: () => void };

const waiting: VisualRequest[] = [];
let activeId: string | null = null;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

function clearReleaseTimer() {
  if (releaseTimer !== null) clearTimeout(releaseTimer);
  releaseTimer = null;
}

function drain() {
  if (activeId !== null) return;
  const next = waiting.shift();
  if (!next) return;
  activeId = next.id;
  // A failed chunk must not stall future visuals indefinitely.
  releaseTimer = setTimeout(() => releaseVisualPreparation(next.id), 7_000);
  next.start();
}

export function requestVisualPreparation(id: string, start: () => void): () => void {
  if (activeId === id || waiting.some((request) => request.id === id)) return () => undefined;
  waiting.push({ id, start });
  drain();
  return () => {
    const index = waiting.findIndex((request) => request.id === id);
    if (index >= 0) waiting.splice(index, 1);
    // An active request is released by its readiness event, unmount, or the safety timeout.
  };
}

export function releaseVisualPreparation(id: string) {
  if (activeId !== id) return;
  clearReleaseTimer();
  activeId = null;
  drain();
}
