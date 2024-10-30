import { damageTakenEvents } from "../constants/consts";
import { HpEvent, GameEvent, TotalHeal, HighlightsEvents, PlayerMatchData, DatabaseMatchItem, EventListenerConfig, EventTypes, PlayerEvents } from "../types";
import { createHpEvent, fetchActivePlayerData, logEvent, logHpEvent } from "./utils";
import EventManager from "../EventManager/EventManager";
import DatabaseManager from "../DatabaseManager/DatabaseManager";

class EventsSaver {
  private _damageEvents: HpEvent[] = [];
  private _healEvents: HpEvent[] = [];
  private _levelEvents: GameEvent[] = [];
  private _abilityEvents: GameEvent[] = [];
  private _healthEvents: HpEvent[] = [];

  private _totalHeal: TotalHeal = { total: 0, self: 0, ally: 0 };

  private _eventsManager: EventManager;
  private _databaseManager: DatabaseManager;
  private static _instance: EventsSaver;

  private constructor() {
    console.log('EventsSaver constructor')
    this._databaseManager = DatabaseManager.getInstance();
  }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new EventsSaver();
    }
    return this._instance;
  }

  public async run() {
    this._eventsManager = overwolf.windows.getMainWindow().event_bus;
    this._eventsManager.addEventListeners(this._eventTypes);
  }

  public onEndGame() {
    const matchData: DatabaseMatchItem = this._createDatabaseMatch();
    this._databaseManager.addMatch(matchData);
    this._eventsManager.removeEventListeners(this._eventTypes);
    this._clearEvents();
  }

  private _clearEvents() {
    this._damageEvents = [];
    this._healEvents = [];
    this._levelEvents = [];
    this._abilityEvents = [];
    this._healthEvents = [];
    this._totalHeal = { total: 0, self: 0, ally: 0 };
  }

  // # Private Methods
  // ## Event Handlers
  private readonly _eventTypes: EventListenerConfig[] = [
    {
      type: EventTypes.DAMAGE,
      name: "eventLogger damage",
      handler: (event) => this._onDamage(event)
    },
    {
      type: EventTypes.ABILITY,
      name: "eventLogger ability",
      handler: (event) => this._onAbility(event)
    },
    {
      type: EventTypes.HEAL,
      name: "eventLogger heal",
      handler: (event) => this._onHeal(event)
    },
    {
      type: EventTypes.LEVEL,
      name: "eventLogger level",
      handler: (event) => this._onLevel(event)
    }
  ];

  private _onDamage(event): void {
    console.log('damage event: ', JSON.stringify(event, null, 2));
    logHpEvent(this._damageEvents, event.name, parseFloat(event.data), parseInt(localStorage.getItem('startTime')));
    if (damageTakenEvents.includes(event.name)) {
      this._fetchAndSaveCurrentHealth();
    }
  }

  private _onAbility(event): void {
    console.log('ability event: ', JSON.stringify(event, null, 2));
    if (event.name === "usedAbility") {
      logEvent(this._abilityEvents, "ability", event.data, parseInt(localStorage.getItem('startTime')));
    }
  }

  private _onLevel(event): void {
    console.log('level event: ', JSON.stringify(event, null, 2));
    logEvent(this._levelEvents, "level", event.level, parseInt(localStorage.getItem('startTime')));
  }

  private _onHeal(event): void {
    console.log('heal event: ', JSON.stringify(event, null, 2));
    if (event.total_heal) {
      this._onHealReceived(event.total_heal);
    }
    if (event.total_heal_on_teammates) {
      this._onHealToAllies(event.total_heal_on_teammates);
    }
  }

  // ## Helpers
  private _onHealReceived(total_heal: string): void {
    const eventTotalHeal = parseFloat(total_heal);
    const healReceived = eventTotalHeal - this._totalHeal.total;
    this._totalHeal.self += healReceived;
    this._totalHeal.total = eventTotalHeal;
    const newEvent = createHpEvent("heal_received", healReceived, parseInt(localStorage.getItem('startTime')));
    this._healEvents.push(newEvent);
  }

  private _onHealToAllies(total_heal_on_teammates: string): void {
    const eventTotalHealOnTeammates = parseFloat(total_heal_on_teammates);
    const healIssued = eventTotalHealOnTeammates - this._totalHeal.ally;
    this._totalHeal.self -= healIssued;
    this._totalHeal.ally = eventTotalHealOnTeammates;
    this._healEvents.pop();
    const newEvent = createHpEvent("heal_to_allies", healIssued, parseInt(localStorage.getItem('startTime')));
    this._healEvents.push(newEvent);
  }

  private _getPlayerEvents(): PlayerEvents {
    return {
      damageEvents: this._damageEvents,
      healEvents: this._healEvents,
      healthEvents: this._healthEvents,
      levelEvents: this._levelEvents,
      abilityEvents: this._abilityEvents,
    };
  }

  private _logCurrentHealth(health: number): void {
    const event = createHpEvent("health", health, parseInt(localStorage.getItem('startTime')));
    this._healthEvents.push(event);
  }

  // ### Fetching and Processing
  private _createDatabaseMatch() {
    const matchId = localStorage.getItem('matchId');
    const summonerId = localStorage.getItem('summonerId');
    const region = localStorage.getItem('region');
    const startTime = parseInt(localStorage.getItem('startTime'));
    const championName = localStorage.getItem('championName');
    const summonerName = localStorage.getItem('summonerName');
    const endTime = Date.now();
    const gameData: PlayerMatchData = { matchId, summonerId, championName, summonerName, region, startTime, endTime };
    const playerEvents = this._getPlayerEvents();
    // console.log('playerEvents: ', JSON.stringify(playerEvents, null, 2));
    console.log('endTime: ', endTime);
    console.log('match:', JSON.stringify(playerEvents));
    const matchData: DatabaseMatchItem = { gameData, isProcessed: 0, playerEvents };
    EventsSaver._instance = null;
    return matchData;
  }

  private async _fetchAndSaveCurrentHealth(): Promise<void> {
    try {
      const result = await fetchActivePlayerData();
      const parsedData = JSON.parse(result.data);
      if (parsedData.championStats.currentHealth) {
        this._logCurrentHealth(parsedData.championStats.currentHealth);
      }
    } catch (error) {
      console.error("Error fetching and saving current health:", error);
    }
  }
}

export default EventsSaver;