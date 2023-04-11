import { Entity, RawDraftContentBlock } from "draft-js";

export type EntityItemsOptions = {
  [key: string]: {
      open: (entity?: Entity, block?: RawDraftContentBlock) => string;
      close: (entity?: Entity, block?: RawDraftContentBlock) => string;
  };
} | undefined;
