import { processMatch } from "../EventsSaver/matchProcessing"
import { transformMatchData } from "../EventsSaver/matchProcessing/matchDataProcessing"
import { match } from "../Temp/match1"
import { DatabaseMatchItem, DatabaseProcessedMatchItem, MatchExtraData, PlayerEvents, PlayerMatchData } from "../types"

export function mockMatch(): DatabaseProcessedMatchItem {

  const playerMatchData: PlayerMatchData = {
    matchId: "BR1_2898812789",
    summonerId: "iw0dNNl5q9u4HFR3Bv983gLcGc3ixzzT3RsOUns2TJPx2l8",
    championName: "Akali",
    summonerName: "Derenash",
    region: "BR1",
    startTime: 1708869647885,
    endTime: 1708869647885
  }
  //console.log(JSON.stringify(match))

  const matchData: MatchExtraData = transformMatchData(playerMatchData.summonerName, playerMatchData.championName, match)

  const playerEvents: PlayerEvents = {
    damageEvents: [],
    healEvents: [],
    healthEvents: [],
    levelEvents: [],
    abilityEvents: []
  }

  const matchItem: DatabaseMatchItem = {
    isProcessed: 1,
    gameData: playerMatchData,
    playerEvents
  }

  const processedMatch: DatabaseProcessedMatchItem = processMatch(matchData, matchItem)
  return processedMatch
}
