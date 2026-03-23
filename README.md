# Flash Card

Flash Card is an Angular 21 application for learning English vocabulary with folders and flashcards.

## Overview

The app helps users:

- Browse vocabulary folders in the Libraries section
- Open a folder to view all words in a table (Word, Meaning, Know)
- Study words with flashcard mode
- Track learning progress per folder

Current data is loaded from local mock data in the store.

## Tech Stack

- Angular 21 (standalone components)
- TypeScript
- SCSS
- Tailwind CSS 4
- NgRx Signals (`@ngrx/signals`) for state management

## Main Features

- Folder list with progress bar
- Folder detail page
- Word list table with known/unknown status
- Flashcard study UI with pronunciation via browser SpeechSynthesis
- Breadcrumb navigation in Libraries

## Project Structure (important folders)

- `src/app/feature/dashboard`: Dashboard screen
- `src/app/feature/libraries`: Libraries feature and routing
- `src/app/feature/libraries/components`: UI components (folder list, word list, flashcard, ...)
- `src/app/feature/stores`: Signal store, models, and mock data

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm start
```

Open http://localhost:4200.

### 3. Build production

```bash
npm run build
```

### 4. Run tests

```bash
npm test
```

## Scripts

- `npm start`: Start dev server
- `npm run build`: Build app
- `npm run watch`: Build in watch mode
- `npm test`: Run unit tests

## Notes

- Store initialization currently uses mock data from `src/app/feature/stores/mocks/folder.mock.ts`.
- `FolderStore` handles folder selection and study phase state.
- Firebase is included in dependencies and can be integrated later for real backend data.
