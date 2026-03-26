import { Component, input } from '@angular/core';
import { FlashCard } from '../../../stores/models';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class CardComponent {
  card = input<FlashCard>();

  playPronunciation(event: Event, word?: string): void {
    event.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }
}
