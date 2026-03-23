import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { Folder } from './models';
import { STUDY_PHASE } from './models/enums';
import { IndexedDbService } from '../services/indexeddb.service';

interface FolderState {
  folders: Folder[];
  folderSelected: Folder | null;
  studyPhase: STUDY_PHASE;
}
const initState: FolderState = {
  folders: [],
  folderSelected: null,
  studyPhase: STUDY_PHASE.OVERVIEW,
};

export const FolderStore = signalStore(
  { providedIn: 'platform' },
  withState(initState),
  withComputed((store) => ({
    flashCardsOfSelectedFolder: () => store.folderSelected()?.flashCards ?? [],
  })),
  withMethods((store, indexedDb = inject(IndexedDbService)) => ({
    setStateToDefault(): void {
      patchState(store, initState);
    },

    setFolders(folders: Folder[]): void {
      patchState(store, (state) => ({ ...state, folders }));

      void indexedDb.saveFolders(folders);
    },

    setFolderSelected(folderSelected: Folder | null): void {
      patchState(store, (state) => ({ ...state, folderSelected }));
    },

    setStudyPhase(studyPhase: STUDY_PHASE): void {
      patchState(store, (state) => ({ ...state, studyPhase }));
    },

    handleStudy: () => {},
  })),
  withHooks({
    onInit: (store) => {
      const indexedDb = inject(IndexedDbService);

      void (async () => {
        const folders = await indexedDb.getFolders();
        patchState(store, { folders });

        const selectedId = getState(store).folderSelected?.id;
        if (selectedId) {
          const selected = folders.find((folder) => folder.id === selectedId) ?? null;
          patchState(store, { folderSelected: selected });
        }
      })();
    },
  }),
);
