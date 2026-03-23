import { Component, OnDestroy, computed, signal } from '@angular/core';
import { STUDY_PHASE } from '../../../stores/models/enums';
import { BaseComponent } from '../base.component';
import { FlashcardComponent } from '../flashcard/flashcard';
import { WordListComponent } from '../word-list/word-list';
import { FlashCard, Folder } from '../../../stores/models';
import { ModalComponent } from '../../../ui/modal/modal';
import { form, FormField, required, submit } from '@angular/forms/signals';

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
  editingWordId = signal<string | null>(null);
  isEditingWord = computed(() => this.editingWordId() !== null);

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
    this.editingWordId.set(null);
    this.resetCreateWordForm();
    this.isCreateWordModalOpen.set(true);
  }

  closeCreateWordModal(): void {
    this.isCreateWordModalOpen.set(false);
    this.editingWordId.set(null);
  }

  async submitCreateWord(): Promise<void> {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    this.createWordSubmitted.set(true);

    const submitted = await submit(this.formCreateWord, {
      action: async (field) => {
        const value = field().value();
        const now = new Date().toISOString();
        const name = value.name.trim();

        const editingWordId = this.editingWordId();
        const updatedCards = editingWordId
          ? folder.flashCards.map((card) => {
              if (card.id !== editingWordId) {
                return card;
              }

              return {
                ...card,
                name,
                phonetic: value.phonetic.trim(),
                meaning: value.meaning.trim(),
                type: value.type.trim(),
                example: value.example.trim(),
                pronunciation: name,
                imageUrl: value.imageUrl.trim(),
                isKnown: value.isKnown,
                updatedAt: now,
              };
            })
          : [
              {
                id: this.createId(),
                name,
                phonetic: value.phonetic.trim(),
                meaning: value.meaning.trim(),
                type: value.type.trim(),
                example: value.example.trim(),
                pronunciation: name,
                imageUrl: value.imageUrl.trim(),
                isKnown: value.isKnown,
                createdAt: now,
                updatedAt: now,
              },
              ...folder.flashCards,
            ];

        const knownCount = updatedCards.filter((card) => card.isKnown).length;

        const updatedFolder: Folder = {
          ...folder,
          flashCards: updatedCards,
          totalWords: updatedCards.length,
          progress: updatedCards.length ? knownCount / updatedCards.length : 0,
          updatedAt: now,
        };

        const updatedFolders = this.store
          .folders()
          .map((item) => (item.id === updatedFolder.id ? updatedFolder : item));

        this.store.setFolders(updatedFolders);
        this.store.setFolderSelected(updatedFolder);

        return [];
      },
      onInvalid: () => {
        this.createWordSubmitted.set(true);
      },
    });

    if (submitted) {
      this.closeCreateWordModal();
      this.resetCreateWordForm();
    }
  }

  handleEdit(word: FlashCard): void {
    if (!word.id) {
      return;
    }

    this.createWordSubmitted.set(false);
    this.editingWordId.set(word.id);
    this.wordModel.set({
      name: word.name,
      phonetic: word.phonetic,
      meaning: word.meaning,
      type: word.type,
      example: word.example,
      pronunciation: word.pronunciation,
      imageUrl: word.imageUrl,
      isKnown: word.isKnown,
    });
    this.isCreateWordModalOpen.set(true);
  }

  handleDelete(wordId: string): void {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    const updatedCards = folder.flashCards.filter((card) => card.id !== wordId);
    const knownCount = updatedCards.filter((card) => card.isKnown).length;
    const now = new Date().toISOString();

    const updatedFolder: Folder = {
      ...folder,
      flashCards: updatedCards,
      totalWords: updatedCards.length,
      progress: updatedCards.length ? knownCount / updatedCards.length : 0,
      updatedAt: now,
    };

    const updatedFolders = this.store
      .folders()
      .map((item) => (item.id === updatedFolder.id ? updatedFolder : item));

    this.store.setFolders(updatedFolders);
    this.store.setFolderSelected(updatedFolder);
  }

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

  private resetCreateWordForm(): void {
    this.createWordSubmitted.set(false);
    this.wordModel.set({
      name: '',
      phonetic: '',
      meaning: '',
      type: '',
      example: '',
      pronunciation: '',
      imageUrl: '',
      isKnown: false,
    });
  }
}
