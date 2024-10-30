import { regions } from "../../constants/consts";

export function getMatchUrl(region, matchId) {
  const regionRouting = regions[region].routing;
  const riotUrl = ".api.riotgames.com";
  const riotMatchId = `${regions[region].prefix}_${matchId}`;
  const url = `https://${regionRouting}${riotUrl}/lol/match/v5/matches/${riotMatchId}`
  return url;
}

export function getMatchTimelineUrl(region, matchId) {
  const matchUrl = getMatchUrl(region, matchId);
  return `${matchUrl}/timeline`;
}