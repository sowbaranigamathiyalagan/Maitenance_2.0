import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    } else {
      this.setDarkMode(false);
    }
  }

  public toggleTheme() {
    this.setDarkMode(!this.isDarkMode());
  }

  private setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
    
    // Dispatch a custom event so app.ts can recalculate dynamic background if needed
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: isDark }));
  }
}
