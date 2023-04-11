import { logger } from "../../../../../../../core/platform/framework";
import DatabaseService from "../..";
import Repository from "./repository";
import { EntityTarget } from "../types";

export class RepositoryManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private repositories: Map<string, Repository<any>> = new Map<string, Repository<any>>();

  constructor(private databaseService: DatabaseService) {}

  async getRepository<Entity>(
    table: string,
    entity: EntityTarget<Entity>,
  ): Promise<Repository<Entity>> {
    if (!this.repositories.has(table)) {
      const repository = new Repository<Entity>(this.databaseService.getConnector(), table, entity);

      try {
        await repository.init();
      } catch (err) {
        logger.error({ err }, "Error while initializing repository");
        throw new Error("Can not initialize repository");
      }

      this.repositories.set(table, repository);
    }

    return this.repositories.get(table);
  }
}
