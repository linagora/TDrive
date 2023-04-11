/* eslint-disable @typescript-eslint/no-explicit-any */
import FileUploadService from 'app/features/files/services/file-upload-service';
import Observable from 'app/deprecated/CollectionsV1/observable';
import LocalStorage from 'app/features/global/framework/local-storage-service';
import { ToasterService as Toaster } from 'app/features/global/services/toaster-service';
import Languages from 'app/features/global/services/languages-service';

// FIX ME use real File type instead
type FileType = { [key: string]: any };

/*
  This class will manage editor states (opened editor and state)
*/
export class MessageEditorService extends Observable {
  ATTACHEMENTS_LIMIT = 10;
  static LOCALSTORAGE_KEY = 'm_input';

  constructor(channelId: string) {
    super();
    this.channelId = channelId;
  }

  //State
  channelId: string;
  currentEditor: string | false = false; //False no editor opened, string = parent message
  currentEditorThreadId: string | false = false; //False no editor opened, string = parent message
  currentEditorMessageId: string | false = false; //False no editor opened, string = parent message
  editorsContents: { [threadId: string]: string } = {};
  filesAttachements: { [threadId: string]: string[] } = {};
  editorsUploadZones: { [threadId: string]: any } = {};

  setInputNode = () => undefined;

  /**
   * Set the message to cache for the given thread/message
   *
   * @param threadId
   * @param messageId
   * @param content
   */
  async setContent(threadId: string, messageId: string, content: string): Promise<void> {
    const editorId = this.getEditorId(threadId, messageId);

    if (!messageId) {
      const all = LocalStorage.getItem(MessageEditorService.LOCALSTORAGE_KEY) || ({} as any);
      all[this.getCacheId(threadId)] = [content, new Date().getTime()];
      LocalStorage.setItem(MessageEditorService.LOCALSTORAGE_KEY, all);
    }
    this.editorsContents[editorId] = content;
  }

  /**
   * Get the cached message for the thread/message
   *
   * @param threadId
   * @param messageId
   * @returns
   */
  async getContent(threadId = '', messageId = ''): Promise<string> {
    const editorId = this.getEditorId(threadId, messageId);

    if (!messageId) {
      const all = this.cleanSavedInputContents(
        LocalStorage.getItem(MessageEditorService.LOCALSTORAGE_KEY) || {},
      );
      const res = (all[this.getCacheId(threadId)] || {})[0];
      if (res) {
        this.editorsContents[editorId] = res;
      }
    }
    return this.editorsContents[editorId] || '';
  }

  private cleanSavedInputContents(all: any) {
    Object.keys(all).forEach(key => {
      if (
        all[key] &&
        all[key][1] < new Date().getTime() - 1000 * 60 * 60 * 24 * 31 &&
        (key.indexOf('_thread=') ||
          all[key][1] < new Date().getTime() - 1000 * 60 * 60 * 24 * 31 * 6)
      ) {
        delete all[key];
      }
    });
    return all;
  }

  openEditor(threadId: string, messageId: string, context = '') {
    const nextEditor = this.getEditorId(threadId, messageId, context);
    if (nextEditor === this.currentEditor) {
      return;
    }
    this.currentEditor = nextEditor;
    this.currentEditorThreadId = threadId;
    this.currentEditorMessageId = messageId;
    this.notify();
  }

  closeEditor() {
    this.currentEditor = false;
    this.currentEditorThreadId = '';
    this.currentEditorMessageId = '';
    this.notify();
  }

  getUploadZone(threadId: string) {
    return this.editorsUploadZones[this.getThreadId(threadId)];
  }

  setUploadZone(threadId: string, node: any) {
    if (node) {
      this.editorsUploadZones[this.getThreadId(threadId)] = node;
    }
  }

  openFileSelector(threadId: string) {
    const id = this.getThreadId(threadId);
    if (this.editorsUploadZones[id]) this.editorsUploadZones[id].open();
  }

  onAddAttachment(threadId: string, file: FileType) {
    const id = this.getThreadId(threadId);

    if (this.shouldLimitAttachements(threadId)) {
      return Toaster.error(
        Languages.t('services.apps.messages.message_editor_service.upload_error_toaster', [
          file.name,
          this.ATTACHEMENTS_LIMIT,
        ]),
        4,
      );
    }

    if (!this.filesAttachements[id]) {
      this.filesAttachements[id] = [];
    }

    this.filesAttachements[id].push(file.id);

    this.notify();
  }

  setAttachments(threadId: string, list: string[]) {
    const id = this.getThreadId(threadId);
    list.forEach(pendingFileId => {
      const file = FileUploadService.getPendingFile(pendingFileId);

      if (this.shouldLimitAttachements(threadId)) {
        return Toaster.error(
          Languages.t('services.apps.messages.message_editor_service.upload_error_toaster', [
            file?.originalFile?.name || 'unknown file',
            this.ATTACHEMENTS_LIMIT,
          ]),
          4,
        );
      }

      if (!this.filesAttachements[id]) {
        this.filesAttachements[id] = [];
      }

      this.filesAttachements[id].push(file.id);

      this.notify();
    });
  }

  onRemoveAttachement(threadId: string, fileId: string) {
    const id = this.getThreadId(threadId);

    let filesAttachements;
    if (this.filesAttachements[id].length >= 0) {
      filesAttachements = this.filesAttachements[id].filter(val => val !== fileId);
      this.filesAttachements[id] = filesAttachements;
    }

    this.notify();
  }

  hasAttachments(threadId = ''): boolean {
    const id = this.getThreadId(threadId);

    return !!this.filesAttachements[id]?.length;
  }

  getAttachements(threadId = ''): string[] {
    return this.filesAttachements[this.getThreadId(threadId)];
  }

  shouldLimitAttachements(threadId = ''): boolean {
    return this.getAttachements(threadId)?.length >= this.ATTACHEMENTS_LIMIT ? true : false;
  }

  clearAttachments(threadId: string) {
    this.filesAttachements[this.getThreadId(threadId)] = [];
    this.notify();
  }

  clearMessage(threadId: string, messageId: string): Promise<void> {
    return this.setContent(threadId, messageId, '');
  }

  private getThreadId(threadId?: string): string {
    return threadId || 'main';
  }

  private getCacheId(threadId: string): string {
    return `${this.channelId}${threadId ? `_thread=${threadId}` : ''}`;
  }

  getEditorId(threadId: string, messageId: string, context = ''): string {
    return threadId + (messageId ? `_${messageId}` : '') + (context ? `_${context}` : '');
  }
}
