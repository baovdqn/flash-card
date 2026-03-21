import { inject } from '@angular/core';
import { FolderStore } from '../../stores';
import { Router } from '@angular/router';

export abstract class BaseComponent {
  //injector
  store = inject(FolderStore);
  router = inject(Router);

  //values
}
