import { Component, input, output } from '@angular/core';
import { FlashCard } from '../../../stores/models';

@Component({
  selector: 'app-word-list',
  imports: [],
  templateUrl: './word-list.html',
  styleUrl: './word-list.scss',
})
export class WordListComponent {
  listWord = input<FlashCard[]>([]);
  editWord = output<FlashCard>();
  deleteWord = output<string>();

  handleEdit(word: FlashCard): void {
    this.editWord.emit(word);
  }

  handleDelete(word: FlashCard): void {
    if (!word.id) {
      return;
    }

    this.deleteWord.emit(word.id);
  }
}
