import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./libs/dashboard/dashboard').then((c) => c.Dashboard),
  },
  {
    path: 'flash-card',
    loadComponent: () => import('./libs/flash-card/flash-card').then((c) => c.FlashCard),
  },
];
