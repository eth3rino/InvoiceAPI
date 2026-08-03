import { Component, signal, WritableSignal } from '@angular/core';
import { LucideMenu, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [LucideMenu, LucideX],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isNavOpen: WritableSignal<boolean> = signal(false)
  toggleNav() {
    this.isNavOpen.update((isNavOpen) => !isNavOpen)
  }

  
}
