import { DatabaseMatchItem, DatabaseProcessedMatchItem, MatchExtraData, PlayerEvents, PlayerMatchData } from "../../types";
import { itensToList } from "../../utils";

export function processMatch(extraData: MatchExtraData, match: DatabaseMatchItem): DatabaseProcessedMatchItem {
  const matchId = extraData.matchInfo.matchId;
  const result = extraData.matchInfo.matchResult;
  const champion = extraData.playerInfo.champion;
  const enemyTeam = extraData.playerInfo.team === 'blue' ? extraData.blueTeam : extraData.redTeam;
  const matchup = enemyTeam.participants.find(participant => participant.role === extraData.playerInfo.role).champion;
  const role = extraData.playerInfo.role;
  const kills = extraData.playerInfo.stats.kills;
  const deaths = extraData.playerInfo.stats.deaths;
  const assists = extraData.playerInfo.stats.assists;
  const KDA = (kills + assists) / deaths;
  const items = itensToList(extraData.playerInfo.items);
  const alliedChampions = extraData.playerInfo.team === 'blue' ? extraData.blueTeam.participants.map(participant => participant.champion) : extraData.redTeam.participants.map(participant => participant.champion);
  const enemyChampions = extraData.playerInfo.team === 'blue' ? extraData.redTeam.participants.map(participant => participant.champion) : extraData.blueTeam.participants.map(participant => participant.champion);
  const filterData = {
    result,
    champion,
    matchup,
    role,
    kills,
    deaths,
    assists,
    KDA,
    items,
    alliedChampions,
    enemyChampions
  }
  const processedMatch: DatabaseProcessedMatchItem = {
    isProcessed: 1,
    gameData: match.gameData,
    filterData,
    playerEvents: match.playerEvents,
    extraData
  }
  return processedMatch;
}