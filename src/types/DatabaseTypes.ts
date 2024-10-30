import { PlayerMatchData } from "./DataTypes";
import { HighlightData, HighlightExtraData, HighlightFilterData, MatchExtraData, MatchFilterData, PlayerEvents } from "./ReplayTypes";

interface DatabaseItem {
  id?: number;
}

export interface DatabaseMatchItem extends DatabaseItem {
  isProcessed: number;
  gameData: PlayerMatchData;
  playerEvents: PlayerEvents;
}

export interface DatabaseProcessedMatchItem extends DatabaseMatchItem {
  filterData: MatchFilterData;
  extraData: MatchExtraData;
}

export interface DatabaseHighlightItem extends DatabaseItem {
  matchId: string;
  data: HighlightData;
}

export interface DatabaseProcessedHighlightItem extends DatabaseHighlightItem {
  filterData: HighlightFilterData;
  extraData: HighlightExtraData;
}