import { fetchMatchData, transformMatchData } from "./matchDataProcessing";
import { fetchTimelineData, transformMatchTimelineData } from "./timelineDataProcessing";
import { MatchExtraData, PlayerMatchData, TimelineData } from "../../types";

export async function fetchAndProcessMatchData(gameData: PlayerMatchData): Promise<{ matchData: MatchExtraData, timelineData: TimelineData }> {
  console.log("gameData", JSON.stringify(gameData));
  checkMatchData(gameData);

  console.log("Fetching match data...");
  const matchDataResult = await fetchMatchData(gameData.matchId, gameData.summonerId, gameData.region);
  console.log("Match data fetched successfully!");

  console.log("Fetching match timeline data...");
  const timelineDataResult = await fetchTimelineData(gameData.matchId, gameData.region);
  console.log("Match timeline data fetched successfully!");

  console.log("Transforming match data...");
  const matchData: MatchExtraData = transformMatchData(gameData.summonerName, gameData.championName, matchDataResult);
  console.log("Match data transformed successfully!");

  console.log("Transforming timeline data...");
  const timelineData: TimelineData = transformMatchTimelineData(timelineDataResult, matchData.playerInfo.participantId, matchData.playerInfo.team);
  console.log("Timeline data transformed successfully!");

  return { matchData, timelineData };
}

function checkMatchData(gameData: PlayerMatchData): void {
  const func = (field: string) => {
    const value = gameData[field];
    console.log(`Checking ${field}: ${value}`);
    console.log(`of type: ${typeof value}`);
    if (!value || value === "" || value === 0 || value === "n/a" || value === "N/A" || value === "undefined") {
      throw new Error(`Invalid ${field} value: ${value}`);
    }
  }
  func("matchId");
  func("region");
}