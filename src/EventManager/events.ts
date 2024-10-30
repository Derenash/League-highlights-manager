import { EventTypes } from "../types/EventTypes";

export const eventsMap: { [key: string]: EventTypes } = {
  "physical_damage_dealt_player": EventTypes.DAMAGE,
  "magic_damage_dealt_player": EventTypes.DAMAGE,
  "true_damage_dealt_player": EventTypes.DAMAGE,
  "physical_damage_dealt_to_champions": EventTypes.DAMAGE,
  "magic_damage_dealt_to_champions": EventTypes.DAMAGE,
  "true_damage_dealt_to_champions": EventTypes.DAMAGE,
  "physical_damage_taken": EventTypes.DAMAGE,
  "magic_damage_taken": EventTypes.DAMAGE,
  "true_damage_taken": EventTypes.DAMAGE,
  "death": EventTypes.DEATH,
  "respawn": EventTypes.RESPAWN,
  "ability": EventTypes.ABILITY,
  "usedAbility": EventTypes.ABILITY,
  "kill": EventTypes.KILL,
  "assist": EventTypes.ASSIST,
  "match_clock": EventTypes.MATCH_CLOCK,
  "chat": EventTypes.CHAT
};

export const infoEventsMap: { [key: string]: EventTypes } = {
  "summoner_info": EventTypes.SUMMONER_INFO,
  "game_info": EventTypes.GAME_INFO,
  "live_client_data": EventTypes.LIVE_CLIENT_DATA,
  "match_info": EventTypes.MATCH_INFO,
  "heal": EventTypes.HEAL,
};
