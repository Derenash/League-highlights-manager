import { HighlightKills, MatchResult } from "./CommonTypes";
import { GameEvent, HpEvent } from "./EventTypes";
import { ParticipantData, TeamData } from "./StatsTypes";


// MatchData  
export interface MatchExtraData {
  matchInfo: MatchInfo;
  playerInfo: ParticipantData;
  blueTeam: TeamData;
  redTeam: TeamData;
}

export interface MatchInfo {
  matchId: string;
  matchResult: MatchResult;
  queueId: number;
  timestamps: {
    start: number;
    end: number;
    duration: number;
  }
}

export interface PlayerEvents {
  damageEvents: HpEvent[];
  healEvents: HpEvent[];
  healthEvents: HpEvent[];
  levelEvents: GameEvent[];
  abilityEvents: GameEvent[];
}

export interface MatchFilterData {
  result: MatchResult;
  champion: string;
  matchup: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  KDA: number;
  items: number[];
  alliedChampions: string[];
  enemyChampions: string[];
}

export interface HighlightFilterData {
  kills: number;
  deaths: number;
  assists: number;
  killsBefore: number;
  deathsBefore: number;
  assistsBefore: number;
  KDA: number;
  items: number[];
  level: number;
  damageDealtTotal: number;
  damageTakenTotal: number;
  healTotal: number;
  goldDiffBefore: number;
  goldDiffAfter: number;
  alliedParticipants: string[];
  enemyParticipants: string[];
  tags: string[];
}

export interface HighlightData {
  startTime: number;
  endTime: number;
  path: string;
  url: string;
}

export interface HighlightExtraData {
  kills: HighlightKills;
  damageEvents: HpEvent[];
  healEvents: HpEvent[];
}

export type HighlightsEvents = { [highlightId: string]: HighlightData };
