type Direction = "up" | "down";

export type Completion = {
  top: boolean;
  bottom: boolean;
};

export type FeedResponse<T> = {
  /**
   * The request parameters which produced this response
   */
  query?: NextParameters & { pageSize: number };

  /**
   * The offsets to be used for the next queries
   */
  offsets: {
    up: string;
    down: string;
  },

  /**
   * When the stream end has been reached (top or bottom):
   * - Bottom may switch from true to false if new items are added
   * - Top may not switch from true to false since we can not create items in the past.
   */
  completes: Completion;

  /**
   * A list of items
   */
  items: Array<T>;

  /**
   * false messages were not loaded for some reason 
   */
  loaded: boolean;

  /**
   * Set when an error occured
   */
  err?: Error;
};

export type InitParameters = {
  /**
   * Initial offset to load at a given position. If not defined we start to load like:
   * - If direction is defined and 'up': load from the bottom of the stream
   * - If direction is defined and down: load from the top of the stream
   * - FIXME: THIS MUST BE IMPLEMENTED, this is not like this for now
   */
  offset?: string;

  /**
   * Number of items to fetch
   */
  pageSize?: number;

  /**
   * Initial direction to load the feed. If the offset is defined, we start to load at its position and in the direction given
   */
  direction: Direction;

  /**
   * Lock the item loading in the given direction:
   * - When 'up', do not allow to load items up
   * - When 'down', do not allow to load items down
   * Warning: This may cause conflicts with mostly all the parameters above
   */
  lock?: Direction;
}

export type NextParameters = {
  /**
   * Load previous (up) or next (down) messages
   */
  direction: Direction;

  /**
   * Load from here
   */
  offset?: string;
}

/**
 * Loader interface
 */
export interface FeedLoader<T> {
  /**
   * Init the loader
   *
   * @param parameters
   */
  init(parameters: InitParameters): Promise<FeedResponse<T>>;

  /**
   * Load next page
   *
   * @param parameters
   */
  nextPage(parameters: NextParameters): Promise<FeedResponse<T>>;

  /**
   * Get the already loaded items between the given offsets. When not defined, let the implementation return what it wants.
   * Note that this will not load the items if they are not available, they will just send back what is already available in the loader.
   */
  getItems(fromTo?: { from: string, to: string }): T[];

  /**
   * Get the completion values
   */
  getCompletion(): Completion;

  /**
   * Destroy the loader and all its resources
   *
   * @param force: Optional parameter to destroy more resources on some cases
   */
  destroy?(force?: boolean): void;
}
