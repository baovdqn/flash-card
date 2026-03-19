import { Component } from '@angular/core';

interface VocabularyFolder {
  name: string;
  totalWords: number;
  updatedAt: string;
  progress: number;
}

@Component({
  selector: 'app-folder',
  imports: [],
  templateUrl: './folder.html',
  styleUrl: './folder.scss',
})
export class Folder {
  folders: VocabularyFolder[] = [
    { name: 'Daily Conversation', totalWords: 42, updatedAt: '2 days ago', progress: 0.75 },
    { name: 'Business English', totalWords: 28, updatedAt: 'Yesterday', progress: 0.5 },
    { name: 'Travel Basics', totalWords: 31, updatedAt: 'Today', progress: 0.25 },
  ];
}
