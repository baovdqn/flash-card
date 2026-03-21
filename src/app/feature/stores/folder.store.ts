import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Folder } from './models';
import { folderMock } from './mocks/folder.mock';
import { STUDY_PHASE } from './models/enums';

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
  withMethods((store) => ({
    setStateToDefault(): void {
      patchState(store, initState);
    },

    setFolders(folders: Folder[]): void {
      patchState(store, (state) => ({ ...state, folders }));
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
      const mock: Folder[] = folderMock;
      patchState(store, { folders: mock });
      console.log('FolderStore initialized with mock data', store.folders());
    },
  }),
);
