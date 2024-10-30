import { HighlightFilterData, HighlightExtraData, HighlightData, DatabaseHighlightItem, DatabaseProcessedHighlightItem, MatchExtraData, PlayerEvents, TimelineData } from "../../types";
import { calculateTotalDamageDealt, calculateTotalDamageTaken, calculateTotalHeal, createEventsFromRange, filterByTimestamp } from "../utils";
import { processKills, getKillStats, getKills } from "./killProcessing";
import { getItemsAtTimestamp, getLevelAtTimestamp } from "./timestampProcessing";

export function processHighlight(DatabaseHighlight: DatabaseHighlightItem, matchData: MatchExtraData, playerEvents: PlayerEvents, timelineData: TimelineData): DatabaseProcessedHighlightItem {
  const { data } = DatabaseHighlight;
  const extraData: HighlightExtraData = getExtraData(data, matchData, playerEvents, timelineData);
  console.log(JSON.stringify(extraData));
  const filterData: HighlightFilterData = getFilterData(data, matchData, playerEvents, timelineData);
  const highlight: DatabaseProcessedHighlightItem = {
    ...DatabaseHighlight,
    filterData,
    extraData,
  };
  return highlight;
}

function getExtraData(data: HighlightData, matchData: MatchExtraData, playerEvents: PlayerEvents, timelineData: TimelineData): HighlightExtraData {
  const killsFiltered = filterByTimestamp(timelineData.killsEvents, data.startTime, data.endTime);
  const kills = processKills(killsFiltered, data.startTime, matchData.playerInfo.team);
  console.log("startTime: ", data.startTime, "endTime: ", data.endTime)
  console.log("players.events: ", JSON.stringify(playerEvents.damageEvents[14]))
  const damageEvents = createEventsFromRange(playerEvents.damageEvents, data.startTime, data.endTime);
  const healEvents = createEventsFromRange(playerEvents.healEvents, data.startTime, data.endTime);

  return {
    damageEvents,
    healEvents,
    kills
  };
}

function getFilterData(data: HighlightData, matchData: MatchExtraData, playerEvents: PlayerEvents, timelineData: TimelineData): HighlightFilterData {
  const highlightKills = getKills(timelineData.killsEvents, data.startTime, data.endTime);
  const kills = getKillStats(highlightKills, data.endTime, (kill) => kill.participation === 'kill' ? 1 : 0);
  const deaths = getKillStats(highlightKills, data.endTime, (kill) => kill.participation === 'death' ? 1 : 0);
  const assists = getKillStats(highlightKills, data.endTime, (kill) => kill.participation === 'assist' ? 1 : 0);
  const killsBefore = getKillStats(timelineData.killsEvents, data.startTime, (kill) => kill.participation === 'kill' ? 1 : 0);
  const deathsBefore = getKillStats(timelineData.killsEvents, data.startTime, (kill) => kill.participation === 'death' ? 1 : 0);
  const assistsBefore = getKillStats(timelineData.killsEvents, data.startTime, (kill) => kill.participation === 'assist' ? 1 : 0);
  const KDA = (kills + assists) / deaths;

  const goldDiffBefore = timelineData.teamsGoldTimeline.reduce((acc, val) => val.timestamp <= data.startTime ? val.difference : acc, 0)
  const goldDiffAfter = timelineData.teamsGoldTimeline.reduce((acc, val) => val.timestamp >= data.endTime && (acc == 0) ? val.difference : acc, 0)

  const items = getItemsAtTimestamp(data.startTime, timelineData.itemsEvents);

  const level = getLevelAtTimestamp(data.startTime, timelineData.levelEvents);

  const damageEvents = createEventsFromRange(playerEvents.damageEvents, data.startTime, data.endTime);
  const healEvents = createEventsFromRange(playerEvents.healEvents, data.startTime, data.endTime);
  const damageDealtTotal = calculateTotalDamageDealt(damageEvents);
  const damageTakenTotal = calculateTotalDamageTaken(damageEvents);
  const healTotal = calculateTotalHeal(healEvents);

  return {
    kills,
    deaths,
    assists,
    killsBefore,
    deathsBefore,
    assistsBefore,
    KDA,
    items,
    level,
    damageDealtTotal,
    damageTakenTotal,
    healTotal,
    goldDiffBefore,
    goldDiffAfter,
    alliedParticipants: [],
    enemyParticipants: [],
    tags: [], // TODO add tags
  };
}