
import { ItemEvent, Building, TeamsGold, TowerStatus, TeamTowerStatus, Level } from "../../types";

function iterateUntilTimestamp(timestamp: number, events: any[], func: (acc: any, event: any) => any, acc: any) {
  for (const event of events) {
    if (event.timestamp <= timestamp) {
      acc = func(acc, event);
    } else {
      break;
    }
  }
  return acc;
}

export function getItemsAtTimestamp(timestamp: number, itemEvents: ItemEvent[]): number[] {
  const removeItem = (items: number[], id: number) => {
    const index = items.indexOf(id);
    if (index !== -1) {
      items.splice(index, 1);
    }
    return items;
  }
  const func = (items: number[], event: ItemEvent) => {
    if (event.type === 'ITEM_PURCHASED') {
      if (event.parts) {
        event.parts.forEach(partId => { items = removeItem(items, partId); });
      }
      items.push(event.id);
    } else if (event.type === 'ITEM_SOLD') {
      items = removeItem(items, event.id);
    }
    return items;
  }
  return iterateUntilTimestamp(timestamp, itemEvents, func, []);
}

export function getTowersAtTimestamp(timestamp: number, blueTowersEvents: Building[], redTowersEvents: Building[]): TowerStatus {
  const func = (towers: TeamTowerStatus, event: Building) => {
    const lane = event.lane.split('_')[0].toLowerCase();
    towers[lane]--;
    return towers;
  }
  return {
    blue: iterateUntilTimestamp(timestamp, blueTowersEvents, func, { top: 3, mid: 5, bot: 3 }),
    red: iterateUntilTimestamp(timestamp, redTowersEvents, func, { top: 3, mid: 5, bot: 3 })
  }
}

export function getLevelAtTimestamp(timestamp: number, levelEvents: Level[]): number {
  const func = (_, event: any) => {
    return event.level;
  }
  return iterateUntilTimestamp(timestamp, levelEvents, func, 0);
}

export function getGoldAtTimestamp(timestamp: number, goldEvents: TeamsGold[]): TeamsGold {
  const nextTimestamp = goldEvents.findIndex(event => event.timestamp > timestamp)
  const func = (_, event: any) => {
    return { blue: event.blue, red: event.red, difference: event.difference };
  }
  const result = iterateUntilTimestamp(timestamp, goldEvents, func, { blue: 0, red: 0, difference: 0 });
  if (nextTimestamp !== -1) {
    result.next = goldEvents[nextTimestamp];
  }
  return result;
}