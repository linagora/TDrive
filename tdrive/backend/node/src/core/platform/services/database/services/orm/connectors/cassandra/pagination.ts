import { Paginable } from "../../../../../../framework/api/crud-service";
import { Pagination } from "../../../../../../framework/api/crud-service";

export class CassandraPagination extends Pagination {
  limit = 100;

  private constructor(readonly page_token: string, readonly limitStr = "100") {
    super(page_token, limitStr);
    this.limit = Number.parseInt(limitStr, 10);
  }

  static from(pagination: Paginable): CassandraPagination {
    return new CassandraPagination(pagination.page_token, pagination.limitStr);
  }

  static next(current: Pagination, pageState: string): Paginable {
    return new Pagination(pageState, current.limitStr);
  }
}
