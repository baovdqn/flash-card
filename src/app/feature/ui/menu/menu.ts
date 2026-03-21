import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update((open) => !open);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
