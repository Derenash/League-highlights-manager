import { EventTypes, EventData, EventListenerConfig } from '../types/EventTypes';
import { infoEventsMap, eventsMap } from './events';

class EventManager {
  private eventListeners: Map<EventTypes, Map<string, (data: EventData) => void>> = new Map();
  private static instance: EventManager;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public clearEventListeners(): void {
    this.eventListeners.clear();
  }

  public removeEventListeners(eventsToListen: EventListenerConfig[]): void {
    eventsToListen.forEach(({ type, name }) => {
      this.removeEventListener(type, name);
    });
  }
  public addEventListeners(eventsToListen: EventListenerConfig[]): void {
    eventsToListen.forEach(({ type, name, handler }) => {
      this.registerEventListener(type, name, handler);
    });
  }

  public registerEventListener(eventType: EventTypes, listenerName: string, listener: (data: EventData) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Map());
    }
    this.eventListeners.get(eventType)!.set(listenerName, listener);
  }

  public removeEventListener(eventType: EventTypes, listenerName: string): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.delete(listenerName);
    }
  }

  public handleEvent(eventType: EventTypes, eventData: EventData): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.forEach((listener) => listener(eventData));
    }
  }

  public notifyInfoUpdate(info: any) {
    // console.log('notifyInfoUpdate', JSON.stringify(info, null, 2));
    const infoKeys = Object.keys(info);
    for (const key of infoKeys) {
      if (key in infoEventsMap) {
        this.handleEvent(infoEventsMap[key], info[key]);
      }
    }
  }

  public notifyEvent(event: any) {
    // console.log('notifyEvent', JSON.stringify(event, null, 2));
    const eventType = eventsMap[event.name];
    if (eventType) {
      this.handleEvent(eventType, event);
    }
  }
}

export default EventManager;