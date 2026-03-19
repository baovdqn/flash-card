import { Component, signal } from '@angular/core';
import { Menu } from '../menu/menu';

@Component({
  selector: 'app-header',
  imports: [Menu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isDark = signal(false);

  constructor() {
    const hasWindow = typeof window !== 'undefined';
    if (!hasWindow) {
      return;
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    this.applyTheme(useDark);
  }

  toggleTheme() {
    const nextTheme = !this.isDark();
    this.applyTheme(nextTheme);

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    }
  }

  private applyTheme(useDark: boolean) {
    this.isDark.set(useDark);

    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', useDark);
    }
  }
}
