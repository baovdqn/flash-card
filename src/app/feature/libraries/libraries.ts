import { ChangeDetectionStrategy, Component, OnDestroy, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FolderStore } from '../stores';
import { BaseComponent } from './components/base.component';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CommonModule],
  providers: [FolderStore],
})
export class LibrariesComponent extends BaseComponent implements OnDestroy {
  breadcrumbs = computed<Breadcrumb[]>(() => {
    const folderSelected = this.store.folderSelected();
    const baseBreadcrumbs: Breadcrumb[] = [{ label: 'Libraries', url: '/libraries/list' }];

    if (folderSelected) {
      baseBreadcrumbs.push({
        label: folderSelected.name,
        url: `/libraries/${folderSelected.id}`,
      });
    }

    return baseBreadcrumbs;
  });

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  ngOnDestroy(): void {
    this.store.setStateToDefault();
  }
}
