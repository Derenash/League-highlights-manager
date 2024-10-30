import { sendGetRequest } from "../../utils";
import { GameEvent, HpEvent } from "../../types";

type Callback = overwolf.CallbackFunction<overwolf.web.SendHttpRequestResult>;

export async function fetchActivePlayerData() {
  const url = 'https://127.0.0.1:2999/liveclientdata/activeplayer';
  const headers = [];
  const result = await sendGetRequest(url, headers);
  return result;
}

export function createGameEvent(name: string, data: string, startTime: number): GameEvent {
  return {
    timestamp: Date.now() - startTime,
    name: name,
    data: data,
  };
}

export function createHpEvent(type: string, data: number, startTime: number): HpEvent {
  console.log("createHpEvent: ", type, data, Date.now() - startTime)
  return {
    timestamp: Date.now() - startTime,
    type: type,
    data: data,
  };
}

export function logEvent(list: any, name: string, data: string, startTime: number): void {
  const event = createGameEvent(name, data, startTime);
  list.push(event);
}

export function logHpEvent(list: any, type: string, data: number, startTime: number): void {
  const event = createHpEvent(type, data, startTime);
  list.push(event);
}

export { fetchAndProcessMatchData } from '../matchProcessing';