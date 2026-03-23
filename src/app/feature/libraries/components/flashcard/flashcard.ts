import { Component, computed, signal } from '@angular/core';
import { BaseComponent } from '../base.component';
import { FlashCard } from '../../../stores/models';

const EMPTY_CARD: FlashCard = {
  id: '',
  name: '',
  phonetic: '',
  meaning: '',
  type: '',
  example: '',
  pronunciation: '',
  imageUrl: '',
  isKnown: false,
  createdAt: '',
  updatedAt: '',
};

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.html',
  styleUrls: ['./flashcard.scss'],
})
export class FlashcardComponent extends BaseComponent {
  private readonly initialCards = this.store.folderSelected()?.flashCards ?? [];
  listFlashcards = signal<FlashCard[]>([...this.initialCards]);

  currentCard = computed<FlashCard>(() => this.listFlashcards()[0] ?? EMPTY_CARD);

  isFlipped = signal(false);
  dragX = signal(0);
  isDragging = signal(false);

  private readonly swipeThreshold = 110;
  private readonly swipeOutDistance = 400;
  private readonly swipeOutDurationMs = 450;
  private pointerStartX: number | null = null;
  private pointerStartY: number | null = null;

  private suppressClick = false;

  cardTransform = computed(() => {
    const x = this.dragX();
    const rotateZ = Math.max(-12, Math.min(12, x / 12));
    const rotateY = this.isFlipped() ? 'rotateY(180deg)' : 'rotateY(0deg)';
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
    this.isFlipped.set(!this.isFlipped());
  }

  playPronunciation(event?: Event): void {
    const word = this.currentCard().name || '';
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
    this.animateAndApplyAction('left');
  }

  handleGotIt(): void {
    this.animateAndApplyAction('right');
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

    const direction: 'left' | 'right' = dx > 0 ? 'right' : 'left';
    this.suppressClick = true;
    this.dragX.set(direction === 'right' ? this.swipeOutDistance : -this.swipeOutDistance);

    window.setTimeout(() => {
      this.applyAction(direction);
      this.dragX.set(0);
    }, this.swipeOutDurationMs);
  }

  onPointerCancel(): void {
    this.isDragging.set(false);
    this.pointerStartX = null;
    this.pointerStartY = null;
    this.dragX.set(0);
  }

  private handleStillLearningAction(): void {
    const cards = this.listFlashcards();
    if (cards.length <= 1) {
      this.resetFlashcardState();
      return;
    }

    const [current, ...rest] = cards;
    this.listFlashcards.set([...rest, current]);
    this.resetFlashcardState();
  }

  private handleGotItAction(): void {
    const cards = this.listFlashcards();
    if (cards.length === 0) return;

    const [, ...rest] = cards;

    if (rest.length === 0) {
      this.listFlashcards.set([...this.initialCards]);
      this.resetFlashcardState();
      return;
    }

    this.listFlashcards.set(rest);
    this.resetFlashcardState();
  }

  private resetFlashcardState(): void {
    this.isFlipped.set(false);
    this.suppressClick = true;
  }

  private animateAndApplyAction(direction: 'left' | 'right'): void {
    if (this.listFlashcards().length === 0) return;

    this.isDragging.set(false);
    this.suppressClick = true;
    this.dragX.set(direction === 'right' ? this.swipeOutDistance : -this.swipeOutDistance);

    window.setTimeout(() => {
      this.applyAction(direction);
      this.dragX.set(0);
    }, this.swipeOutDurationMs);
  }

  private applyAction(direction: 'left' | 'right'): void {
    if (direction === 'right') {
      this.handleGotItAction();
      return;
    }

    this.handleStillLearningAction();
  }
}
