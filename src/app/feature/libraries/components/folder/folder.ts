import { Component, OnDestroy, computed } from '@angular/core';
import { STUDY_PHASE } from '../../../stores/models/enums';
import { BaseComponent } from '../base.component';
import { CardComponent } from '../card/card';
import { FlashcardComponent } from '../flashcard/flashcard';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.html',
  styleUrl: './folder.scss',
  imports: [CardComponent, FlashcardComponent],
})
export class FolderComponent extends BaseComponent implements OnDestroy {
  folderSelected = this.store.folderSelected;
  currentCard = computed(() => this.folderSelected()?.flashCards?.[0] ?? null);
  studyPhase = this.store.studyPhase;
  STUDY_PHASE = STUDY_PHASE;

  ngOnInit(): void {
    if (!this.folderSelected()) {
      this.router.navigate(['/libraries']);
    }
  }

  handleStudy(): void {
    this.store.setStudyPhase(STUDY_PHASE.STUDY);
  }

  handleCreate(): void {}

  handleEdit(): void {}

  ngOnDestroy(): void {
    this.store.setFolderSelected(null);
    this.store.setStudyPhase(STUDY_PHASE.OVERVIEW);
  }
}
