import Observable from 'app/deprecated/Observable/Observable';
import LocalStorage from 'app/features/global/framework/local-storage-service';

class ChannelsBarService extends Observable {
  private callbacks = new Map<string, (state: boolean) => void>();
  private ready = new Map<string, boolean>();

  collectionIsReady(companyId: string, workspaceId: string, suffix?: string[]): void {
    const callbackId = this.getCallbackId(companyId, workspaceId, suffix);

    if (!this.ready.has(callbackId)) {
      this.ready.set(callbackId, true);
      this.notify();
    }
  }

  isReady(companyId = '', workspaceId = '', suffix?: string[]): boolean {
    return !!this.ready.get(this.getCallbackId(companyId, workspaceId, suffix));
  }

  updateCurrentChannelId(
    companyId = '',
    workspaceId = '',
    channelId = '',
  ): void {
    LocalStorage.setItem(this.getLocalStorageKey(companyId, workspaceId), channelId);
  }

  private getLocalStorageKey(companyId: string, workspaceId: string): string {
    return `${companyId}:${workspaceId}:channel`;
  }

  private getCallbackId(companyId: string, workspaceId: string, suffix?: string[]): string {
    let key = `${companyId}+${workspaceId}`;

    if (suffix && suffix.length) {
      key = [key, ...suffix].join('+');
    }

    return key;
  }
}

export default new ChannelsBarService();
