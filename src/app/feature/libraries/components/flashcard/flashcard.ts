import { Component, computed, signal } from '@angular/core';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.html',
  styleUrls: ['./flashcard.scss'],
})
export class FlashcardComponent extends BaseComponent {
  listFlashcards = this.store.folderSelected()?.flashCards || [];
  indexCurrentCard = signal(0);
  currentCard = signal(this.listFlashcards[0] || null);

  nextCard = computed(() => {
    const nextIndex = this.indexCurrentCard() + 1;
    if (nextIndex < this.listFlashcards.length) {
      return this.listFlashcards[nextIndex];
    }
    return null;
  });

  isFlipped = false;
  dragX = signal(0);
  isDragging = signal(false);

  private readonly swipeThreshold = 110;
  private pointerStartX: number | null = null;
  private pointerStartY: number | null = null;

  private suppressClick = false;

  cardTransform = computed(() => {
    const x = this.dragX();
    const rotateZ = Math.max(-12, Math.min(12, x / 12));
    const rotateY = this.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';

    return `translateX(${x}px) rotate(${rotateZ}deg) ${rotateY}`;
  });

  cardTransition = computed(() =>
    this.isDragging() ? 'none' : 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  );

  leftSwipeOpacity = computed(() => {
    const value = -this.dragX() / this.swipeThreshold;
    return Math.max(0, Math.min(1, value));
  });

  rightSwipeOpacity = computed(() => {
    const value = this.dragX() / this.swipeThreshold;
    return Math.max(0, Math.min(1, value));
  });

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  playPronunciation(event?: Event): void {
    const word = this.currentCard()?.name || '';
    if (!word) return;
    event?.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-UK';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  onCardClick(): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.toggleFlip();
  }

  handleStillLearning(): void {
    this.handleNextCard();
  }

  handleGotIt(): void {
    this.handleNextCard();
  }

  onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
    this.isDragging.set(true);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging() || this.pointerStartX === null || this.pointerStartY === null) {
      return;
    }

    const dx = event.clientX - this.pointerStartX;
    const dy = event.clientY - this.pointerStartY;

    if (Math.abs(dy) > Math.abs(dx) * 1.3) {
      return;
    }

    this.dragX.set(dx);
  }

  onPointerUp(): void {
    if (!this.isDragging()) {
      return;
    }

    const dx = this.dragX();
    const isSwipe = Math.abs(dx) >= this.swipeThreshold;
    this.isDragging.set(false);
    this.pointerStartX = null;
    this.pointerStartY = null;

    if (!isSwipe) {
      this.dragX.set(0);
      return;
    }

    const toRight = dx > 0;
    this.suppressClick = true;
    this.dragX.set(toRight ? 520 : -520);

    window.setTimeout(() => {
      if (toRight) {
        this.handleGotIt();
      } else {
        this.handleStillLearning();
      }
      this.dragX.set(0);
    }, 180);
  }

  onPointerCancel(): void {
    this.isDragging.set(false);
    this.pointerStartX = null;
    this.pointerStartY = null;
    this.dragX.set(0);
  }

  private handleNextCard(): void {
    const nextCard = this.nextCard();
    if (!nextCard) return;
    this.currentCard.set(nextCard);
    this.indexCurrentCard.update((index) => index + 1);
    if (this.indexCurrentCard() >= this.listFlashcards.length - 1) {
      this.indexCurrentCard.set(0);
      this.currentCard.set(this.listFlashcards[0] || null);
    }
    this.isFlipped = false;
    this.suppressClick = true;
  }
}
