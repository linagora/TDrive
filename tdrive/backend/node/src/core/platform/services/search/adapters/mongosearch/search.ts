import { buildSelectQuery } from "../../../database/services/orm/connectors/mongodb/query-builder";
import { EntityTarget, FindFilter, FindOptions, getEntityDefinition } from "../../api";
import { asciiFold } from "../utils";

export function buildSearchQuery<Entity>(
  entityType: EntityTarget<Entity>,
  filters: FindFilter,
  options: FindOptions = {},
): { project: any; query: any; sort: any } {
  const instance = new (entityType as any)();
  const { entityDefinition } = getEntityDefinition(instance);

  let project: any = false;
  let query: any = {};
  try {
    query = buildSelectQuery(entityType, filters, options);
  } catch (e) {
    console.log(e);
  }
  let sort: any = {};

  //Build text searches
  if (options.$text) {
    const prefixMapping = entityDefinition?.options?.search?.mongoMapping?.prefix || {};
    const textMapping = entityDefinition?.options?.search?.mongoMapping?.text || {};
    //Try to detect when we need prefix search
    if (Object.values(prefixMapping).length > 0 && options.$text.$search.indexOf(" ") < 0) {
      query.$or = [...Object.keys(prefixMapping), ...Object.keys(textMapping)].map(k => {
        if (prefixMapping[k] === "prefix") {
          return {
            [k]: new RegExp(`^${asciiFold(options.$text.$search || "")}`, "i"),
          };
        } else {
          return {
            [k]: new RegExp(`${asciiFold(options.$text.$search || "")}`, "i"),
          };
        }
      });
    } else {
      project = { score: { $meta: "textScore" } };
      sort = { score: -1 };
      if (options?.$text?.$search)
        options.$text.$search = asciiFold(options.$text.$search || "").toLocaleLowerCase();
      query.$text = options.$text || undefined;
    }
  }

  //Build regexes
  if (options.$regex) {
    options.$regex.forEach(r => {
      //r: [Field, regex, options]
      if (r.length >= 2) {
        const field = r[0];
        query[field] = query[field] || {};
        query[field].$regex = r[1];
        if (r[2]) query[field].$options = r[2];
      }
    });
  }

  return {
    project,
    query,
    sort,
  };
}
