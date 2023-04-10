import CompanyApplication, {
  CompanyApplicationPrimaryKey,
  CompanyApplicationWithApplication,
  TYPE,
} from "../entities/company-application";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import {
  Initializable,
  logger,
  RealtimeDeleted,
  RealtimeSaved,
  TwakeServiceProvider,
} from "../../../core/platform/framework";
import {
  DeleteResult,
  ListResult,
  OperationType,
  Paginable,
  Pagination,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import { CompanyExecutionContext } from "../web/types";
import { getCompanyApplicationRoom } from "../realtime";
import gr from "../../global-resolver";

export class CompanyApplicationServiceImpl implements TwakeServiceProvider, Initializable {
  version: "1";
  repository: Repository<CompanyApplication>;

  async init(): Promise<this> {
    try {
      this.repository = await gr.database.getRepository<CompanyApplication>(
        TYPE,
        CompanyApplication,
      );
    } catch (err) {
      console.log(err);
      logger.error("Error while initializing applications service");
    }
    return this;
  }

  // TODO: remove logic from context
  async get(
    pk: Pick<CompanyApplicationPrimaryKey, "company_id" | "application_id"> & { id?: string },
    context?: CompanyExecutionContext,
  ): Promise<CompanyApplicationWithApplication> {
    const companyApplication = await this.repository.findOne(
      {
        group_id: context ? context.company.id : pk.company_id,
        app_id: pk.application_id,
      },
      {},
      context,
    );

    const application = await gr.services.applications.marketplaceApps.get(
      {
        id: pk.application_id,
      },
      context,
    );

    return {
      ...companyApplication,
      application: application,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @RealtimeSaved<CompanyApplication>((companyApplication, _context) => {
    return [
      {
        room: getCompanyApplicationRoom(companyApplication.id),
        resource: companyApplication,
      },
    ];
  })
  async save<SaveOptions>(
    item: Pick<CompanyApplicationPrimaryKey, "company_id" | "application_id">,
    _?: SaveOptions,
    context?: CompanyExecutionContext,
  ): Promise<SaveResult<CompanyApplication>> {
    if (!context?.user?.id && !context?.user?.server_request) {
      throw new Error("Only an user of a company can add an application to a company.");
    }

    let operation = OperationType.UPDATE;
    let companyApplication = await this.repository.findOne(
      {
        group_id: context?.company.id,
        app_id: item.application_id,
      },
      {},
      context,
    );
    if (!companyApplication) {
      operation = OperationType.CREATE;

      companyApplication = new CompanyApplication();
      companyApplication.company_id = context.company.id;
      companyApplication.application_id = item.application_id;
      companyApplication.created_at = new Date().getTime();
      companyApplication.created_by = context?.user?.id || "";

      await this.repository.save(companyApplication, context);
    }

    return new SaveResult(TYPE, companyApplication, operation);
  }

  async initWithDefaultApplications(
    companyId: string,
    context: CompanyExecutionContext,
  ): Promise<void> {
    const defaultApps = await gr.services.applications.marketplaceApps.listDefaults(context);
    for (const defaultApp of defaultApps.getEntities()) {
      await this.save({ company_id: companyId, application_id: defaultApp.id }, {}, context);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @RealtimeDeleted<CompanyApplication>((companyApplication, _context) => {
    return [
      {
        room: getCompanyApplicationRoom(companyApplication.id),
        resource: companyApplication,
      },
    ];
  })
  async delete(
    pk: CompanyApplicationPrimaryKey,
    context?: CompanyExecutionContext,
  ): Promise<DeleteResult<CompanyApplication>> {
    const companyApplication = await this.repository.findOne(
      {
        group_id: context.company.id,
        app_id: pk.application_id,
      },
      {},
      context,
    );

    let deleted = false;
    if (companyApplication) {
      this.repository.remove(companyApplication, context);
      deleted = true;
    }

    return new DeleteResult(TYPE, companyApplication, deleted);
  }

  async list<ListOptions>(
    pagination: Paginable,
    options?: ListOptions,
    context?: CompanyExecutionContext,
  ): Promise<ListResult<CompanyApplicationWithApplication>> {
    const companyApplications = await this.repository.find(
      {
        group_id: context.company.id,
      },
      { pagination: Pagination.fromPaginable(pagination) },
      context,
    );

    const applications = [];

    for (const companyApplication of companyApplications.getEntities()) {
      const application = await gr.services.applications.marketplaceApps.get(
        {
          id: companyApplication.application_id,
        },
        context,
      );
      if (application)
        applications.push({
          ...companyApplication,
          application: application,
        });
    }

    return new ListResult<CompanyApplicationWithApplication>(
      TYPE,
      applications,
      companyApplications.nextPage,
    );
  }
}
