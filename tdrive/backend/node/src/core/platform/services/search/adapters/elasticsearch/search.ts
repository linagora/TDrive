import { RequestParams } from "@elastic/elasticsearch";
import { TransportRequestOptions } from "@elastic/elasticsearch/lib/Transport";
import { logger } from "../../../../../../core/platform/framework/logger";
import { EntityTarget, FindFilter, FindOptions, getEntityDefinition } from "../../api";
import { asciiFold } from "../utils";
import { comparisonType } from "src/core/platform/services/database/services/orm/repository/repository";

export function buildSearchQuery<Entity>(
  entityType: EntityTarget<Entity>,
  filters: FindFilter,
  options: FindOptions = {},
): { esParams: RequestParams.Search; esOptions: TransportRequestOptions } {
  const instance = new (entityType as any)();
  const { entityDefinition } = getEntityDefinition(instance);
  const indexProperties = entityDefinition.options.search.esMapping.properties || {};

  const esBody: any = {
    query: {
      bool: {
        boost: 1.0,
      },
    },
  };

  if (Object.keys(filters || {}).length > 0) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    for (const [key, value] of Object.entries(filters)) {
      const match: any = {};
      match[key] = { query: value, operator: "AND" };
      esBody.query.bool.must.push({ match });
    }
  }

  if (options.$in?.length) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    for (const inOperation of options.$in) {
      if (inOperation[1].length > 0) {
        const bool: any = { bool: { should: [], minimum_should_match: 1 } };
        for (const value of inOperation[1]) {
          const match: any = {};
          match[inOperation[0]] = { query: value, operator: "AND" };
          bool.bool.should.push({ match });
        }
        esBody.query.bool.must.push(bool);
      }
    }
  }

  function buildRangeQuery(
    lteOperations: comparisonType[],
    key: "gte" | "lte" | "lt" | "gt",
  ): void {
    for (const lteOperation of lteOperations) {
      if (lteOperation?.length == 2 && lteOperation[0]) {
        const field_name = lteOperation[0];
        esBody.query.bool.must.push({
          range: {
            [field_name]: {
              [key]: lteOperation[1] ? parseInt(lteOperation[1]) : 0,
            },
          },
        });
      } else {
        logger.warn(`Not enough data to include to the query: ${lteOperation}`);
      }
    }
  }

  if (options.$lte?.length) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    buildRangeQuery(options.$lte, "lte");
  }

  if (options.$gte?.length) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    buildRangeQuery(options.$gte, "gte");
  }

  if (options.$lt?.length) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    buildRangeQuery(options.$lt, "lt");
  }
  if (options.$gt?.length) {
    esBody.query.bool.must = esBody.query.bool.must || [];
    buildRangeQuery(options.$gt, "gt");
  }

  if (options.$text) {
    esBody.query.bool.minimum_should_match = 1;
    esBody.query.bool.should = esBody.query.bool.should || [];

    if (options?.$text?.$search)
      options.$text.$search = asciiFold(options.$text.$search || "").toLocaleLowerCase();

    for (const [key, value] of Object.entries(indexProperties)) {
      if ((value as any)["type"] === "text") {
        const match: any = {};
        match[key] = {
          query: (options.$text.$search || "").toLocaleLowerCase(),
        };
        esBody.query.bool.should.push({
          match,
        });

        //Allow prefix search
        if (indexProperties[key].index_prefixes !== undefined) {
          esBody.query.bool.should.push({
            prefix: { [key]: { value: (options.$text.$search || "").toLocaleLowerCase() } },
          });
        }
      }
    }
  }

  if (options.$sort) {
    for (const [key, value] of Object.entries(options.$sort)) {
      esBody.sort = esBody.sort || [];
      esBody.sort.push({ [key]: value });
    }
  }

  //TODO implement regex search

  logger.debug(`Elasticsearch query: ${JSON.stringify(esBody)}`);

  const esParams: RequestParams.Search = {
    index: entityDefinition.options?.search?.index || entityDefinition.name,
    body: esBody,
  };

  const esOptions: TransportRequestOptions = {
    ignore: [404],
    maxRetries: 3,
  };

  return {
    esParams,
    esOptions,
  };
}
