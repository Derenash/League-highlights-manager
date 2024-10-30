export interface ProcessedKill extends Kill {
  replayTimestamp: number;
}

export interface HighlightKills {
  alliedParticipants: number[];
  enemyParticipants: number[];
  tags: string[];
  kills: ProcessedKill[];
}

export interface Kill {
  killerId: number;
  victimId: number;
  assists: number[];
  participants: number[];
  participation: Participation;
  bounty: number;
  multiKill: number;
  ace: boolean;
  firstBlood: boolean;
  position: {
    x: number;
    y: number;
  }
  timestamp: number;
}

export interface Level {
  level: number;
  timestamp: number;
}

export type Team = "blue" | "red" | "none";

export type Participation = "kill" | "assist" | "death" | "none";

export type MatchResult = "win" | "loss";

