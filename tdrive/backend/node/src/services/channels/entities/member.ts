import { Type } from "class-transformer";

export class Member {
  @Type(() => String)
  id: string;
}
