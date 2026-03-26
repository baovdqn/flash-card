import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'libraries',
    pathMatch: 'full',
  },
  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./feature/dashboard/dashboard').then((c) => c.Dashboard),
  // },
  {
    path: 'libraries',
    loadChildren: () =>
      import('./feature/libraries/libraries.routes').then((r) => r.routesLibraries),
  },
];
