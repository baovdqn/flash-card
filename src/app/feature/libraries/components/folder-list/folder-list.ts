import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Folder } from '../../../stores/models';
import { BaseComponent } from '../base.component';
import { ModalComponent } from '../../../ui/modal/modal';

@Component({
  selector: 'app-folder-list',
  imports: [CommonModule, ModalComponent],
  templateUrl: './folder-list.html',
  styleUrl: './folder-list.scss',
})
export class FolderListComponent extends BaseComponent {
  folders = this.store.folders;
  isCreateModalOpen = signal(false);

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  handleCreateFolder(nameInput: HTMLInputElement, descriptionInput: HTMLTextAreaElement): void {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
      nameInput.focus();
      return;
    }

    const now = new Date().toISOString();
    const newFolder: Folder = {
      id: this.createId(),
      name,
      description,
      flashCards: [],
      totalWords: 0,
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.store.setFolders([newFolder, ...this.folders()]);
    this.closeCreateModal();
  }

  handleToDetail(folder: Folder): void {
    this.store.setFolderSelected(folder);
    this.router.navigate([`/libraries/${folder.id}`]);
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Date.now().toString();
  }
}
