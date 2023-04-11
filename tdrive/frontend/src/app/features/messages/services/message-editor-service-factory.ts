/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageEditorService } from './message-editor-service';

class MessageEditorServiceFactory {
  private services = new Map<string, MessageEditorService>();

  get(channelId: string): MessageEditorService {
    let service = this.services.get(channelId);

    if (service) {
      return service;
    }

    service = new MessageEditorService(channelId);
    this.services.set(channelId, service);

    return service;
  }
}

const factory = new MessageEditorServiceFactory();
(window as any).TdriveMessageEditorServiceFactory = factory;
export default factory;
