const frames = new Map<number, number>();

export function animateCar(
  carEl: HTMLElement,
  distancePx: number,
  durationMs: number,
  carId: number,
): void {
  stopAnimation(carId);
  const start = performance.now();

  const tick = (now: number): void => {
    const elapsed = Math.min(now - start, durationMs);
    const progress = durationMs === 0 ? 1 : elapsed / durationMs;
    carEl.style.transform = `translateX(${distancePx * progress}px)`;
    if (elapsed < durationMs) {
      frames.set(carId, requestAnimationFrame(tick));
    } else {
      frames.delete(carId);
    }
  };

  frames.set(carId, requestAnimationFrame(tick));
}

export function stopAnimation(carId: number): void {
  const frameId = frames.get(carId);
  if (frameId !== undefined) {
    cancelAnimationFrame(frameId);
    frames.delete(carId);
  }
}

export function stopAllAnimations(): void {
  frames.forEach((frameId) => cancelAnimationFrame(frameId));
  frames.clear();
}
