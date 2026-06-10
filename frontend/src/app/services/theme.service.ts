import { Injectable, signal, computed } from '@angular/core';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'ysu-theme';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode, disabled storage)
  }
  return 'dark';
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable — in-memory state still works for the session
  }
}

function applyThemeToDOM(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(readStoredTheme());

  /** Readonly signal — current theme value. */
  readonly theme = this._theme.asReadonly();

  /** Convenience computed — true when theme is dark. */
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Reassert the data-theme attribute so the service and DOM stay in sync
    // (the no-FOUC inline script sets it before Angular boots, but this
    // ensures service state matches in case of any mismatch).
    applyThemeToDOM(this._theme());
  }

  /** Flip between dark and light. Persists to localStorage and updates DOM. */
  toggle(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  /** Set theme explicitly. Persists to localStorage and updates DOM. */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    applyThemeToDOM(theme);
    persistTheme(theme);
  }
}
