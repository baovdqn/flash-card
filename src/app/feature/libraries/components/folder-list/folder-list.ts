import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Folder } from '../../../stores/models';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-folder-list',
  imports: [CommonModule],
  templateUrl: './folder-list.html',
  styleUrl: './folder-list.scss',
})
export class FolderListComponent extends BaseComponent {
  folders = this.store.folders;

  handleToDetail(folder: Folder): void {
    this.store.setFolderSelected(folder);
    this.router.navigate([`/libraries/${folder.id}`]);
  }
}
