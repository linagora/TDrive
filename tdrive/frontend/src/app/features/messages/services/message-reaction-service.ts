import { Message, ReactionType } from 'app/features/messages/types/message';
import UserService from 'app/features/users/services/current-user-service';
import MessageEditorManager from './message-editor-service-factory';
import DepreciatedCollections, {
  Collection,
} from 'app/deprecated/CollectionsV1/Collections/Collections.js';

/**
 * ChannelServiceImpl that allow you to manage message reactions
 */
class MessageReactionService {
  collection: Collection;

  constructor() {
    this.collection = DepreciatedCollections.get('messages');
  }

  /**
   * Get user reactions in a message
   * @param message Message
   * @param userId string
   */
  public getUserReactions(message: Message, userId?: string): ReactionType[] {
    const { reactions } = message;
    let userReactions: ReactionType[] = [];

    if (reactions?.length && userId) {
      userReactions = reactions.filter(r => r.users.includes(userId));
    }

    return userReactions;
  }

  /**
   * Update reactions in message object
   * @param message Message
   * @param reactionName
   * @param userId
   */
  private realtimeReactionsUpdate(message: Message, reactionName: string, userId: string): void {
    message.reactions = message.reactions?.map(r =>
      r.name === reactionName
        ? { ...r, count: Math.max(0, r.users.includes(userId) ? r.count - 1 : r.count + 1) }
        : r,
    );
  }

  /**
   * Set new user reaction
   * @param reactions User ReactionType[]
   * @param reaction ReactionType
   */
  private setUserReactions(reactions: ReactionType[], reaction: ReactionType): ReactionType[] {
    const reactionsArray: ReactionType[] = [...reactions];
    const alreadyInReactions = reactionsArray.map(r => r.name).includes(reaction.name);

    return alreadyInReactions
      ? reactionsArray.filter(r => r.name !== reaction.name)
      : [...reactionsArray, reaction];
  }

  /**
   * Allow user to react a message
   * @param message Message
   * @param reaction string
   * @param messagesCollectionKey string
   */
  public react(message: Message, reactionName: string, messagesCollectionKey: string): void {
    const userId = UserService.getCurrentUserId();
    const currentUserReactions = this.getUserReactions(message, userId);

    const currentReaction: ReactionType = {
      name: reactionName,
      count: 1,
      users: [userId],
    };

    const userReactionsNames = this.setUserReactions(currentUserReactions, currentReaction).map(
      r => r.name,
    );

    this.realtimeReactionsUpdate(message, reactionName, userId);

    this.collection.completeObject({ _user_reaction: userReactionsNames }, message.front_id);
    this.collection.save(message, messagesCollectionKey);
    MessageEditorManager.get(message?.channel_id || '').closeEditor();
  }
}

export default new MessageReactionService();
