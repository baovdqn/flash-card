import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Folder } from '../../../stores/models';
import { BaseComponent } from '../base.component';
import { ModalComponent } from '../../../ui/modal/modal';
import { form, FormField, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-folder-list',
  imports: [CommonModule, ModalComponent, FormField],
  templateUrl: './folder-list.html',
  styleUrl: './folder-list.scss',
})
export class FolderListComponent extends BaseComponent {
  folders = this.store.folders;
  isCreateModalOpen = signal(false);
  createFolderSubmitted = signal(false);

  folderModel = signal({
    name: '',
    description: '',
  });

  formCreateFolder = form(this.folderModel, (f) => {
    required(f.name);
  });

  openCreateModal(): void {
    this.resetCreateFolderForm();
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.resetCreateFolderForm();
    this.isCreateModalOpen.set(false);
  }

  async submitCreateFolder(): Promise<void> {
    this.createFolderSubmitted.set(true);

    const submitted = await submit(this.formCreateFolder, {
      action: async (field) => {
        const value = field().value();
        const now = new Date().toISOString();

        const newFolder: Folder = {
          id: this.createId(),
          name: value.name.trim(),
          description: value.description.trim(),
          flashCards: [],
          totalWords: 0,
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };

        this.store.setFolders([newFolder, ...this.folders()]);
        return [];
      },
      onInvalid: () => {
        this.createFolderSubmitted.set(true);
      },
    });

    if (submitted) {
      this.closeCreateModal();
      this.resetCreateFolderForm();
    }
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

  private resetCreateFolderForm(): void {
    this.createFolderSubmitted.set(false);
    this.folderModel.set({
      name: '',
      description: '',
    });
  }
}
