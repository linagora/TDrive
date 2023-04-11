import { Paginable } from "../../../../../../framework/api/crud-service";
import { Pagination } from "../../../../../../framework/api/crud-service";

export class MongoPagination extends Pagination {
  limit = 100;
  skip = 0;
  page = 1;

  private constructor(readonly page_token = "1", readonly limitStr = "100") {
    super(page_token, limitStr);
    this.limit = Number.parseInt(limitStr, 10);
    this.page = Number.parseInt(page_token, 10);
    this.skip = (this.page - 1) * this.limit;
  }

  static from(pagination: Paginable): MongoPagination {
    return new MongoPagination(pagination.page_token, pagination.limitStr);
  }

  static next(current: MongoPagination, items: Array<unknown> = []): Paginable {
    const nextToken = items.length === current.limit && (current.page + 1).toString(10);

    return new Pagination(nextToken, current.limitStr);
  }
}
