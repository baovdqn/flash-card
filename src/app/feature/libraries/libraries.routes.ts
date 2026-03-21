import { Routes } from '@angular/router';

export const routesLibraries: Routes = [
  {
    path: '',
    loadComponent: () => import('./libraries').then((c) => c.LibrariesComponent),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./components/folder-list/folder-list').then((c) => c.FolderListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./components/folder/folder').then((c) => c.FolderComponent),
      },
    ],
  },
];
