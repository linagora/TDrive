// Channel visibility utils
export function isPublicChannel(visibility: string): boolean {
  return visibility === 'public' ? true : false;
}

export function isPrivateChannel(visibility: string): boolean {
  return visibility === 'private' ? true : false;
}

export function isDirectChannel(visibility: string): boolean {
  return visibility === 'direct' ? true : false;
}
