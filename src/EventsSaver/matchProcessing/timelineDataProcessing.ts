import { Building, ItemEvent, Kill, Level, Participation, Team, TeamsGold, TimelineData } from "../../types";
import { getFromLeagueAPI } from "../../utils";
import { getMatchTimelineUrl } from "../utils";

export function fetchTimelineData(matchId: string, region: string): Promise<any> {
  const url = getMatchTimelineUrl(region, matchId);
  const result = getFromLeagueAPI(url);
  return result;
}


export function transformMatchTimelineData(matchTimelineData: any, participantId: number, team: Team): TimelineData {
  const info = matchTimelineData.info;
  const blueTowersEvents: Building[] = [];
  const redTowersEvents: Building[] = [];
  const itemsEvents: ItemEvent[] = [];
  const killsEvents: Kill[] = [];
  const level1: Level = { level: 1, timestamp: 0 };
  const levelEvents: Level[] = [level1];
  const teamsGoldTimeline: TeamsGold[] = [];
  info.frames.forEach(frame => {
    const events = frame.events;
    const playersStats = frame.participantFrames;
    let blueTeamGold = 0;
    let redTeamGold = 0;
    for (let i = 1; i <= Object.keys(playersStats).length; i++) {
      if (i <= (Object.keys(playersStats).length / 2)) {
        blueTeamGold += playersStats[i].totalGold;
      } else {
        redTeamGold += playersStats[i].totalGold;
      }
    }
    const difference = team === 'blue' ? blueTeamGold - redTeamGold : redTeamGold - blueTeamGold;
    teamsGoldTimeline.push({ blue: blueTeamGold, red: redTeamGold, difference, timestamp: frame.timestamp });

    events.forEach(event => {
      if (event.type === "BUILDING_KILL") {

        if (event.buildingType === "TOWER_BUILDING") {
          const lane = event.laneType;
          let buildingType: any;
          switch (event.towerType) {
            case "OUTER_TURRET":
              buildingType = "t1";
              break;
            case "INNER_TURRET":
              buildingType = "t2";
              break;
            case "BASE_TURRET":
              buildingType = "t3";
              break;
            case "NEXUS_TURRET":
              buildingType = "t4";
              break;
          };
          const building: Building = { type: buildingType, lane, timestamp: event.timestamp };
          if (event.teamId === 100) {
            blueTowersEvents.push(building);
          } else {
            redTowersEvents.push(building);
          }

        }
      }
      if (event.type.slice(0, 4) === "ITEM" && event.participantId === participantId) {
        if (event.type === "ITEM_DESTROYED" || event.type === "ITEM_SOLD") {
          const item: ItemEvent = { id: event.itemId, type: event.type, timestamp: event.timestamp };
          itemsEvents.push(item);
        }
        if (event.type === "ITEM_PURCHASED") {
          const parts = [];
          while (itemsEvents.length > 0) {
            const lastItem = itemsEvents[itemsEvents.length - 1];
            if (lastItem.type === "ITEM_DESTROYED" && lastItem.timestamp === event.timestamp) {
              parts.unshift(lastItem.id);
              itemsEvents.pop();
            } else {
              break;
            }
          }
          const item: ItemEvent = { id: event.itemId, type: event.type, timestamp: event.timestamp, parts };
          itemsEvents.push(item);
        }
        if (event.type === "ITEM_UNDO") {
          itemsEvents.pop();
        }
      }

      if (event.type === "CHAMPION_KILL") {
        let participation: Participation;
        const assistIds = event.assistingParticipantIds ? event.assistingParticipantIds : [];

        if (event.killerId === participantId) { participation = "kill" }
        else if (event.victimId === participantId) { participation = "death" }
        else if (assistIds.includes(participantId)) { participation = "assist" }
        else { participation = "none" }

        const kill: Kill = {
          killerId: event.killerId,
          victimId: event.victimId,
          assists: assistIds,
          participants: [event.killerId, event.victimId, ...assistIds],
          participation,
          bounty: event.bounty,
          multiKill: 1,
          ace: false,
          firstBlood: false,
          position: event.position,
          timestamp: event.timestamp,
        };

        killsEvents.push(kill);
      }
      if (event.type === "CHAMPION_SPECIAL_KILL") {
        const lastKill = killsEvents[killsEvents.length - 1];
        if (event.killType === "KILL_MULTI") {
          lastKill.multiKill = event.multiKillLength;
        }
        if (event.killType === "KILL_ACE") {
          lastKill.ace = true;
        }
        if (event.killType === "KILL_FIRST_BLOOD") {
          lastKill.firstBlood = true;
        }
      }
      if (event.type === "LEVEL_UP" && event.participantId === participantId) {
        const levelEvent = { level: event.level, timestamp: event.timestamp };
        levelEvents.push(levelEvent);
      }
    })
  })

  const data = {
    blueTowersEvents,
    redTowersEvents,
    itemsEvents,
    killsEvents,
    levelEvents,
    teamsGoldTimeline
  };

  return data;
}