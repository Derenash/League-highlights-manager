export enum EventTypes {
  /**
   * Either:
   * - physical_damage_dealt_player 
   * - magic_damage_dealt_player 
   * - true_damage_dealt_player 
   * - physical_damage_dealt_to_champions 
   * - magic_damage_dealt_to_champions 
   * - true_damage_dealt_to_champions 
   * - physical_damage_taken 
   * - magic_damage_taken 
   * - true_damage_taken 
   */
  DAMAGE = 'DAMAGE',


  /**
   * Either:
   * - ability (number) - Pressed the Ability
   * - usedAbility ({ type: string }) - Used the Ability
  */
  ABILITY = 'ABILITY',

  KILL = 'KILL',
  DEATH = 'DEATH',
  ASSIST = 'ASSIST',
  RESPAWN = 'RESPAWN',

  COUNTERS = 'COUNTERS',
  MATCH_CLOCK = 'MATCH_CLOCK',
  CHAT = 'CHAT',

  GOLD = 'GOLD',
  MINIONS = 'MINIONS',
  LEVEL = 'LEVEL',

  /**
   * Either:
   * - total_heal 
   * - total_heal_on_teammates 
   * - total_units_healed 
   */
  HEAL = 'HEAL',

  /**
   * Includes:
   * - id (string)
   * - region (string)
   * - champion (string)
   * - level (string)
   * - tier (string)
   * - division (string)
   * - queue (string)
   * - accountId (string)
   */
  SUMMONER_INFO = 'SUMMONER_INFO',

  /**
   * Includes:
   * - matchStarted (string)
   * - matchId (string)
   * - queueId (string)
   */
  GAME_INFO = 'GAME_INFO',

  /**
   * May include:
   * - active_player
   * - all_players
   * - events
   * - game_data
   * - port
   */
  LIVE_CLIENT_DATA = 'LIVE_CLIENT_DATA',

  /**
   * Includes:
   * - pseudo_match_id (string)
   * - game_mode (string)
   * - match_paused (string)
   * - players_tagline (array)
   */
  MATCH_INFO = 'MATCH_INFO',
}

export interface EventData {
  title: string;
  timestamp: number;
  data: any;
}

export interface EventListenerConfig {
  type: EventTypes;
  name: string;
  handler: (e: any) => void;
}

// GameEvent Types
export interface GameEvent {
  timestamp: number;
  name: string;
  data: string;
}

export interface TotalHeal {
  total: number;
  self: number;
  ally: number;
}

export interface HpEvent {
  timestamp: number;
  type: string;
  data: number;
  currentHealth?: number;
}