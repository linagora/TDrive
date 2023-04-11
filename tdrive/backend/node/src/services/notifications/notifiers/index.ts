export * from "./mobile-push";

export interface Notifier {
  notify<Message>(user: string, message: Message): Promise<void>;
}
