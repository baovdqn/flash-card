export interface Folder {
  id: string;
  name: string;
  description: string;
  flashCards: FlashCard[];
  totalWords: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlashCard {
  id?: string;
  name: string;
  phonetic: string;
  meaning: string;
  type: string;
  example: string;
  pronunciation: string;
  imageUrl: string;
  isKnown: boolean;
  createdAt?: string;
  updatedAt?: string;
}
