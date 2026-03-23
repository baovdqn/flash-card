import { Component, input } from '@angular/core';
import { FlashCard } from '../../../stores/models';

@Component({
  selector: 'app-word-list',
  imports: [],
  templateUrl: './word-list.html',
  styleUrl: './word-list.scss',
})
export class WordListComponent {
  listWord = input<FlashCard[]>([]);
}
