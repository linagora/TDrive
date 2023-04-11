import { UserType } from 'app/features/users/types/user';
import UserAPIClient from '../api/user-api-client';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';

const currentUserRequests: { [key: string]: PromiseLike<UserType | null> } = {};
const usersCollection = Collections.get('users');
const doNotRetry: Map<string, boolean> = new Map();

export default async (id: string): Promise<UserType | null> => {
  if (
    usersCollection.known_objects_by_id[id] &&
    new Date(usersCollection.known_objects_by_id[id]?._last_modified || 0).getTime() >
      new Date().getTime() - 1000 * 60 * 60
  ) {
    return usersCollection.known_objects_by_id[id];
  }

  if (doNotRetry.get(id)) {
    return null;
  }

  if (currentUserRequests[id] !== undefined) {
    // there are already pending requests for the same user, wait for them
    await currentUserRequests[id];
    setTimeout(() => {
      delete currentUserRequests[id];
    }, 60 * 1000);
    return usersCollection.known_objects_by_id[id];
  } else {
    const userPromise = new Promise<UserType | null>(async resolve => {
      const users = await UserAPIClient.list([id], undefined, { bufferize: true });
      const user = users.length ? users[0] : null;
      user && usersCollection.updateObject(user);
      if (!user || !user?.id) doNotRetry.set(id, true);
      resolve(user);
    });
    currentUserRequests[id] = userPromise;

    return userPromise;
  }
};
