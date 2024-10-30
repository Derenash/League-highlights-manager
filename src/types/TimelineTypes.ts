import { Kill, Level } from '.';

export interface TimelineData {
  blueTowersEvents: Building[];
  redTowersEvents: Building[];
  itemsEvents: ItemEvent[];
  killsEvents: Kill[];
  levelEvents: Level[];
  teamsGoldTimeline: TeamsGold[];
}

export interface Building {
  type: string;
  lane: string;
  timestamp: number;
}

export interface ItemEvent {
  id: number;
  type: string;
  timestamp: number;
  parts?: number[];
}

export interface TeamsGold {
  blue: number;
  red: number;
  difference: number;
  timestamp?: number;
}

export interface TowerStatus {
  blue: TeamTowerStatus,
  red: TeamTowerStatus
}

export interface TeamTowerStatus {
  top: number,
  mid: number,
  bot: number
}

