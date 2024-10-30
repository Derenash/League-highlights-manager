import { GameEvent, HpEvent } from "../../types";
import { damageDealtEvents, damageTakenEvents } from "../../constants/consts";

export function filterByTimestamp(events: any[], startTime: number, endTime: number) {
  return events.filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
}

// Event Logger functions
export function createEventsFromRange(events: any[], startTime: number, endTime: number): any[] {
  const result: any[] = [];

  let start = binarySearch(events, startTime);

  while (start < events.length && events[start].timestamp <= endTime) {
    const newEvent = { ...events[start] };
    newEvent.timestamp -= startTime
    result.push(newEvent);
    start++;
  }

  return result;
}

export function calculateTotalDamage(events: HpEvent[], matches: string[]): number {
  return events.reduce((total, event) => {
    if (matches.includes(event.type)) {
      return total + event.data;
    } else {
      return total;
    }
  }, 0);
}

export function calculateTotalDamageTaken(events: HpEvent[]): number {
  const totalDamage = calculateTotalDamage(events, damageTakenEvents);
  return totalDamage;
}

export function calculateTotalDamageDealt(events: HpEvent[]): number {
  const totalDamage = calculateTotalDamage(events, damageDealtEvents);
  return totalDamage;
}

export function calculateTotalHeal(events: HpEvent[]): number {
  const totalHeal = calculateTotalDamage(events, ["heal_received"]);
  return totalHeal;
}

function binarySearch(events: GameEvent[], targetTime: number): number {
  let start = 0;
  let end = events.length;
  while (start < end) {
    let mid = Math.floor((start + end) / 2);
    if (events[mid].timestamp < targetTime) {
      start = mid + 1;
    } else {
      end = mid;
    }
  }
  return start;
}