import { Component, HostListener, OnDestroy, computed, signal } from '@angular/core';
import { STUDY_PHASE } from '../../../stores/models/enums';
import { BaseComponent } from '../base.component';
import { FlashcardComponent } from '../flashcard/flashcard';
import { WordListComponent } from '../word-list/word-list';
import { FlashCard, Folder } from '../../../stores/models';
import { ModalComponent } from '../../../ui/modal/modal';
import { form, FormField, required, submit } from '@angular/forms/signals';
import * as XLSX from 'xlsx';
import { CardComponent } from '../card/card';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.html',
  styleUrl: './folder.scss',
  imports: [FlashcardComponent, WordListComponent, ModalComponent, FormField, CardComponent],
})
export class FolderComponent extends BaseComponent implements OnDestroy {
  folderSelected = this.store.folderSelected;
  currentCard = computed(() => this.folderSelected()?.flashCards?.[0] ?? null);
  studyPhase = this.store.studyPhase;
  STUDY_PHASE = STUDY_PHASE;
  isKebabMenuOpen = signal(false);
  isImportModalOpen = signal(false);
  importFile = signal<File | null>(null);
  isCreateWordModalOpen = signal(false);
  createWordSubmitted = signal(false);
  editingWordId = signal<string | null>(null);
  isEditingWord = computed(() => this.editingWordId() !== null);
  isEditFolderModalOpen = signal(false);
  editFolderSubmitted = signal(false);

  wordModel = signal<FlashCard>({
    name: '',
    phonetic: '',
    meaning: '',
    type: '',
    example: '',
    pronunciation: '',
    imageUrl: '',
  });

  formCreateWord = form(this.wordModel, (w) => {
    required(w.name);
    required(w.meaning);
  });

  folderMetaModel = signal({
    name: '',
    description: '',
  });

  formEditFolder = form(this.folderMetaModel, (f) => {
    required(f.name);
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

  openImportModal(): void {
    this.importFile.set(null);
    this.isImportModalOpen.set(true);
  }

  closeImportModal(): void {
    this.importFile.set(null);
    this.isImportModalOpen.set(false);
  }

  downloadImportTemplate(): void {
    const templateRows = [
      {
        name: 'example',
        phonetic: '/ɪɡˈzæm.pəl/',
        meaning: 'a thing characteristic of its kind',
        type: 'noun',
        example: 'This is an example sentence.',
        pronunciation: 'example',
        imageUrl: 'https://example.com/image.jpg',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'template');
    const data = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'flashcard-import-template.xlsx';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  onImportFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.importFile.set(file);

    if (input) {
      input.value = '';
    }
  }

  onImportFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.importFile.set(file);
  }

  onImportDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  async submitImportExcel(): Promise<void> {
    const folder = this.folderSelected();
    const file = this.importFile();

    if (!folder || !file) {
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return;
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

    const importedCards = rows
      .map((row) => this.mapExcelRowToFlashCard(row))
      .filter((card): card is FlashCard => card !== null);

    if (importedCards.length === 0) {
      return;
    }

    const updatedCards = [...importedCards, ...folder.flashCards];
    const now = new Date().toISOString();

    const updatedFolder: Folder = {
      ...folder,
      flashCards: updatedCards,
      totalWords: updatedCards.length,
      progress: 0,
      updatedAt: now,
    };

    const updatedFolders = this.store
      .folders()
      .map((item) => (item.id === updatedFolder.id ? updatedFolder : item));

    this.store.setFolders(updatedFolders);
    this.store.setFolderSelected(updatedFolder);
    this.closeImportModal();
  }

  closeCreateWordModal(): void {
    this.resetCreateWordForm();
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
                createdAt: now,
                updatedAt: now,
              },
              ...folder.flashCards,
            ];

        const updatedFolder: Folder = {
          ...folder,
          flashCards: updatedCards,
          totalWords: updatedCards.length,
          progress: 0,
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
    });
    this.isCreateWordModalOpen.set(true);
  }

  handleDelete(wordId: string): void {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    const updatedCards = folder.flashCards.filter((card) => card.id !== wordId);
    const now = new Date().toISOString();

    const updatedFolder: Folder = {
      ...folder,
      flashCards: updatedCards,
      totalWords: updatedCards.length,
      progress: 0,
      updatedAt: now,
    };

    const updatedFolders = this.store
      .folders()
      .map((item) => (item.id === updatedFolder.id ? updatedFolder : item));

    this.store.setFolders(updatedFolders);
    this.store.setFolderSelected(updatedFolder);
  }

  closeKebabMenu(): void {
    this.isKebabMenuOpen.set(false);
  }

  openKebabMenu(): void {
    this.isKebabMenuOpen.update((open) => !open);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isKebabMenuOpen()) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const isInsideKebab = !!target.closest('.kebab-menu-container');
    if (!isInsideKebab) {
      this.closeKebabMenu();
    }
  }

  openEditFolderModal(): void {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    this.editFolderSubmitted.set(false);
    this.folderMetaModel.set({
      name: folder.name,
      description: folder.description,
    });
    this.isEditFolderModalOpen.set(true);
    this.closeKebabMenu();
  }

  closeEditFolderModal(): void {
    this.isEditFolderModalOpen.set(false);
  }

  async submitEditFolder(): Promise<void> {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    this.editFolderSubmitted.set(true);

    const submitted = await submit(this.formEditFolder, {
      action: async (field) => {
        const value = field().value();
        const now = new Date().toISOString();

        const updatedFolder: Folder = {
          ...folder,
          name: value.name.trim(),
          description: value.description.trim(),
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
        this.editFolderSubmitted.set(true);
      },
    });

    if (submitted) {
      this.closeEditFolderModal();
    }
  }

  handleDeleteFolder(): void {
    const folder = this.folderSelected();
    if (!folder) {
      return;
    }

    const updatedFolders = this.store.folders().filter((item) => item.id !== folder.id);
    this.store.setFolders(updatedFolders);
    this.store.setFolderSelected(null);
    this.closeKebabMenu();

    this.router.navigate(['/libraries/list']);
  }

  handlePractice() {
    this.store.setStudyPhase(STUDY_PHASE.PRACTICE);
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
    });
  }

  private mapExcelRowToFlashCard(row: Record<string, unknown>): FlashCard | null {
    const normalized = Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
      const normalizedKey = key.trim().toLowerCase();
      acc[normalizedKey] = value == null ? '' : String(value).trim();
      return acc;
    }, {});

    const name = normalized['name'] ?? '';
    const meaning = normalized['meaning'] ?? '';

    if (!name || !meaning) {
      return null;
    }

    const now = new Date().toISOString();

    return {
      id: this.createId(),
      name,
      phonetic: normalized['phonetic'] ?? '',
      meaning,
      type: normalized['type'] ?? '',
      example: normalized['example'] ?? '',
      pronunciation: normalized['pronunciation'] || name,
      imageUrl: normalized['imageurl'] ?? '',
      createdAt: now,
      updatedAt: now,
    };
  }
}
