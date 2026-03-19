import { Component } from '@angular/core';
import { Folder } from './components/folder/folder';

@Component({
  selector: 'app-flash-card',
  imports: [Folder],
  templateUrl: './flash-card.html',
  styleUrl: './flash-card.scss',
})
export class FlashCard {}
