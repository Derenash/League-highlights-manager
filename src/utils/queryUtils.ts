import DatabaseManager from "../DatabaseManager/DatabaseManager";
import { matchesStore, processedMatchesStore } from "../constants/consts";
import { CheckboxGroups, DatabaseMatchItem, DatabaseProcessedMatchItem, ExclusiveFilter, Filter, InclusiveFilter } from "../types";

export async function getMatchesFromFilters(filters: CheckboxGroups, dbManager: DatabaseManager): Promise<any[]> {
  const { inclusiveFilter, exclusiveFilter } = convertFiltersToQuery(filters);
  const rawMatches = await dbManager.query<DatabaseMatchItem>(matchesStore, [], []);
  const processedMatches = await dbManager.query<DatabaseProcessedMatchItem>(processedMatchesStore, inclusiveFilter, exclusiveFilter);
  console.log("rawMatches", rawMatches.length, "processedMatches", processedMatches.length)
  const processedFilters = filters["processed"].inputs;
  const matches = [];
  if (processedFilters["raw"] && processedFilters["raw"].checked) {
    matches.push(...rawMatches);
  }
  if (processedFilters["processed"] && processedFilters["processed"].checked) {
    matches.push(...processedMatches);
  }
  matches.sort((a, b) => b.id - a.id);
  return matches
}

function convertFiltersToQuery(groups: CheckboxGroups): { inclusiveFilter: InclusiveFilter, exclusiveFilter: ExclusiveFilter } {
  const inclusiveFilters: Map<string, Filter<any>[]> = new Map();
  const exclusiveFilter: ExclusiveFilter = [];

  for (const group in groups) {
    if (!inclusiveFilters.has(group)) {
      inclusiveFilters.set(group, []);
    }
    const incFGroup = inclusiveFilters.get(group);
    const groupFilters = groups[group].inputs;
    for (const filter in groupFilters) {
      const { checked, filter: f, text } = groupFilters[filter];
      if (checked) {
        incFGroup.push(f);
      }
    }
  }

  const inclusiveFilter: InclusiveFilter = Array.from(inclusiveFilters.values());
  return { inclusiveFilter, exclusiveFilter };
}
