import _ from "lodash";
import { getEntityDefinition, unwrapPrimarykey, EntityDefinition } from "../api";
import ASCIIFolder from "./ascii-folder";

export function stringifyPrimaryKey(entity: any): string {
  const { entityDefinition } = getEntityDefinition(entity);
  const pkColumns = unwrapPrimarykey(entityDefinition).sort((a, b) => a.localeCompare(b));
  return JSON.stringify(pkColumns.map(c => entity[c]));
}

export function parsePrimaryKey(
  entityDefinition: EntityDefinition,
  pkStr: string,
): { [key: string]: any } {
  const pkColumns = unwrapPrimarykey(entityDefinition).sort((a, b) => a.localeCompare(b));
  const pkList = JSON.parse(pkStr);
  const pk: { [key: string]: any } = {};
  pkColumns.forEach((c, index) => {
    pk[c] = pkList[index];
  });
  return pk;
}

export function expandStringForPrefix(
  str: string,
  minimalSize: number = 1,
  maximalSize: number = 5,
) {
  const expanded: string[] = [];
  [...str.split(" "), ...str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").split(" ")].map(w => {
    for (let i = minimalSize; i <= Math.min(maximalSize, w.length); i++)
      expanded.push(w.slice(0, i));
  });
  return _.uniq(expanded).join(" ");
}

export function asciiFold(str: string) {
  return ASCIIFolder.foldMaintaining(str);
}
