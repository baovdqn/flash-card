import { Component, computed, signal } from '@angular/core';
import { BaseComponent } from '../base.component';
import { FlashCard } from '../../../stores/models';

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.html',
  styleUrls: ['./flashcard.scss'],
})
export class FlashcardComponent extends BaseComponent {
  private readonly initialCards = this.store.folderSelected()?.flashCards ?? [];
  listFlashcards = signal<FlashCard[]>([...this.initialCards]);
  isBackSide = signal(false);

  currentCard = computed<FlashCard | null>(() => this.listFlashcards()[0] ?? null);

  flipCard(event?: Event): void {
    event?.stopPropagation();
    this.isBackSide.update((value) => !value);
  }

  playPronunciation(event?: Event): void {
    const word = this.currentCard()?.name || '';
    if (!word) return;
    event?.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  rateHard(): void {
    this.handleHardAction();
    this.isBackSide.set(false);
  }

  rateMedium(): void {
    this.handleMediumAction();
    this.isBackSide.set(false);
  }

  rateEasy(): void {
    this.handleEasyAction();
    this.isBackSide.set(false);
  }

  private handleHardAction(): void {
    const cards = this.listFlashcards();
    if (cards.length <= 1) {
      return;
    }

    const [current, ...rest] = cards;
    this.listFlashcards.set([...rest, current]);
  }

  private handleMediumAction(): void {
    const cards = this.listFlashcards();
    if (cards.length <= 1) {
      return;
    }

    const [current, ...rest] = cards;
    const insertIndex = Math.floor(rest.length / 2);
    const updated = [...rest];
    updated.splice(insertIndex, 0, current);
    this.listFlashcards.set(updated);
  }

  private handleEasyAction(): void {
    const cards = this.listFlashcards();
    if (cards.length === 0) return;

    const [, ...rest] = cards;

    if (rest.length === 0) {
      this.listFlashcards.set([...this.initialCards]);
      return;
    }

    this.listFlashcards.set(rest);
  }
}
