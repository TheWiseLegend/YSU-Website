import { Injectable } from '@angular/core';

/**
 * Controls the static pre-boot loader baked into `index.html`
 * (`#ysu-app-loader`). That element is painted by the browser before Angular's
 * bundle loads — so there's never a blank frame — and this service is the
 * single place that removes it once the app (or a specific page) is ready.
 *
 * Flow:
 *  - By default `AppComponent` hides the loader right after the first
 *    navigation renders.
 *  - A page that needs to keep it up longer (e.g. the home page waiting on its
 *    hero images) calls `hold()` in its constructor, then `hide()` when ready.
 */
@Injectable({ providedIn: 'root' })
export class AppLoaderService {
  private held = false;
  private done = false;

  /** Claim the loader so the default auto-hide is skipped — call in a page constructor. */
  hold(): void {
    this.held = true;
  }

  get isHeld(): boolean {
    return this.held;
  }

  /** Fade out and remove the loader element. Idempotent. */
  hide(): void {
    if (this.done) return;
    this.done = true;

    const el = document.getElementById('ysu-app-loader');
    if (!el) return;

    el.classList.add('is-hidden');

    const remove = () => el.remove();
    el.addEventListener('transitionend', remove, { once: true });
    // Fallback in case the transition never fires (reduced-motion, etc.).
    setTimeout(remove, 1000);
  }
}
