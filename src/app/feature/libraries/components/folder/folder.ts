import { Component, OnDestroy, computed, signal } from '@angular/core';
import { STUDY_PHASE } from '../../../stores/models/enums';
import { BaseComponent } from '../base.component';
import { FlashcardComponent } from '../flashcard/flashcard';
import { WordListComponent } from '../word-list/word-list';
import { FlashCard, Folder } from '../../../stores/models';
import { ModalComponent } from '../../../ui/modal/modal';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.html',
  styleUrl: './folder.scss',
  imports: [FlashcardComponent, WordListComponent, ModalComponent, FormField],
})
export class FolderComponent extends BaseComponent implements OnDestroy {
  folderSelected = this.store.folderSelected;
  currentCard = computed(() => this.folderSelected()?.flashCards?.[0] ?? null);
  studyPhase = this.store.studyPhase;
  STUDY_PHASE = STUDY_PHASE;
  isCreateWordModalOpen = signal(false);
  createWordSubmitted = signal(false);

  wordModel = signal<FlashCard>({
    name: '',
    phonetic: '',
    meaning: '',
    type: '',
    example: '',
    pronunciation: '',
    imageUrl: '',
    isKnown: false,
  });

  formCreateWord = form(this.wordModel, (w) => {
    required(w.name);
    required(w.meaning);
  });

  flashCardsOfSelectedFolder = this.store.flashCardsOfSelectedFolder;

  ngOnInit(): void {
    if (!this.folderSelected()) {
      this.router.navigate(['/libraries']);
    }
  }

  handleStudy(): void {
    this.store.setStudyPhase(STUDY_PHASE.STUDY);
  }

  handleCreate(): void {
    this.resetCreateWordForm();
    this.isCreateWordModalOpen.set(true);
  }

  closeCreateWordModal(): void {
    this.isCreateWordModalOpen.set(false);
  }

  submitCreateWord(): void {}

  handleEdit(): void {}

  ngOnDestroy(): void {
    this.store.setFolderSelected(null);
    this.store.setStudyPhase(STUDY_PHASE.OVERVIEW);
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Date.now().toString();
  }

  private resetCreateWordForm(): void {}
}
