import { MatchResult, Team } from './CommonTypes';

export interface SpecialKills {
  soloKills: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
}


export interface TeamData {
  teamId: number;
  result: MatchResult;
  kills: number;
  deaths: number;
  assists: number;
  participants: ParticipantData[];
}

export interface ParticipantData {
  team: Team;
  champion: string;
  summonerName: string;
  summonerTagline: string;
  puuid: string;
  role: string;
  participantId: number;
  stats: ParticipantStats;
  specialKills: SpecialKills;
  items: Itens
  runes: Runes;
  summonerSpells: SummonerSpells;
}

export interface Itens {
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
}

export interface SummonerSpells {
  slot1: number;
  slot2: number;
}

export interface Runes {
  primaryTree: {
    type: string;
    keystone: number;
    rune1: number;
    rune2: number;
    rune3: number;
  }
  secondaryTree: {
    type: string;
    rune1: number;
    rune2: number;
  }
  shards: {
    defense: number;
    flex: number;
    offense: number;
  }
}

export interface ParticipantStats {
  kills: number;
  deaths: number;
  assists: number;
  takedowns: number;
  kda: number;
  killParticipation: number;
  damageDealt: number;
  damagePerMinute: number;
  teamDamagePercentage: number;
  damageReceived: number;
  healingAndShieldingReceived: number;
  totalHeal: number;
  totalHealsOnTeammates: number;
  goldEarned: number;
  goldPerMinute: number;
  csTotal: number;
  csPerMinute: number;
}
