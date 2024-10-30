import { damageDealtEvents, eventExtraTime } from "../constants/consts";
import { overwolfStartCapture, overwolfStopCapture, overwolfTurnOffReplays, overwolfTurnOnReplays } from "./utils";
import EventManager from "../EventManager/EventManager";
import { EventListenerConfig, EventTypes } from "../types/EventTypes";
import { DatabaseHighlightItem, HighlightData } from "../types";
import DatabaseManager from "../DatabaseManager/DatabaseManager";

class CaptureManager {
  private _streamSettings: any;
  private _turnedOn: boolean;
  private _isCapturing: boolean;

  private _replayId: string;
  private _replayPath: string;
  private _replayURL: string;

  private _recordingStartTime: number = null;
  private _recordingEndTime: number = null;
  private _hasDied: boolean = false;

  private _eventsManager: EventManager;
  private _databaseManager: DatabaseManager;

  constructor() {
    this._streamSettings = {
      video: {
        buffer_length: 30000,
      }
    }
    this._turnedOn = false;
    this._isCapturing = false;
    this._replayId = null;
    this._eventsManager = overwolf.windows.getMainWindow().event_bus;
    this._databaseManager = DatabaseManager.getInstance();
  }

  public async turnOnReplays(): Promise<void> {
    if (this._turnedOn) {
      console.log('Replays already turned on');
      return;
    }

    const callback = (result: overwolf.media.replays.TurnOnResult) => {
      if (result.success) {
        console.log('overwolf.media.replays.turnOn(): success:', result);
        this._turnedOn = true;
        this._eventsManager.addEventListeners(this._eventTypes);
        this._databaseManager.openDatabase();
      } else {
        console.error('Failed to turn on replays:', result.error);
        return;
      }
    };

    overwolfTurnOnReplays(this._streamSettings, callback);
    console.log('overwolf.media.replays.turnOn(): waiting for response');
  }

  public turnOffReplays(): void {
    if (!this._turnedOn) {
      console.log('Replays already turned off');
      return;
    }
    this._eventsManager.removeEventListeners(this._eventTypes);
    const callback = (result: overwolf.media.replays.TurnOffResult) => {
      if (result.success) {
        this._turnedOn = false;
      } else {
        console.error('Failed to turn off replays:', result.error);
      }
    }
    overwolfTurnOffReplays(callback);
    console.log('overwolf.media.replays.turnOff(): waiting for response');
  }

  public startRecording(futureDuration: number): void {
    if (!this._turnedOn) {
      console.log('capture(): replays turned off, you need to turn on replay API first');
      return;
    }
    const pastDuration = 20000;
    const onSuccess = (result: overwolf.media.FileResult) => {
      this._replayId = result.path.split('\\').pop();
      this._replayPath = result.path;
      this._replayURL = result.url;
      this._isCapturing = true;
      const startTime = parseInt(localStorage.getItem('startTime'));
      this._recordingStartTime = Date.now() - startTime - pastDuration;
      this._setExtraTime(futureDuration);
    }
    overwolfStartCapture(pastDuration, futureDuration, onSuccess, (error) => { });
  }

  public stopRecording(): void {
    if (!this._turnedOn || !this._isCapturing) {
      // console.log(`stopRecording not possible, this._turnedOn: ${this._turnedOn}, isCapturing: ${this._isCapturing}`);
      return;
    }
    const callback = async (result: overwolf.Result) => {
      this._isCapturing = false;
      this._hasDied = false;
      const matchId = localStorage.getItem('matchId');
      const startTime = parseInt(localStorage.getItem('startTime'));
      const highlightData: HighlightData = {
        startTime: this._recordingStartTime,
        endTime: this._recordingEndTime - startTime,
        path: this._replayPath,
        url: this._replayURL,
      }
      const databaseHighlight: DatabaseHighlightItem = {
        matchId,
        data: highlightData
      };
      console.log('highlightData: ', JSON.stringify(databaseHighlight, null, 2));
      this._databaseManager.addHighlight(databaseHighlight);
    }
    overwolfStopCapture(this._replayId, callback);
  }

  // # Private Methods 
  // ## Event Handlers 

  private readonly _eventTypes: EventListenerConfig[] = [
    {
      type: EventTypes.KILL,
      name: "replayController highlight kill",
      handler: (event) => this._onHighlightEvent(event, "kill")
    },
    {
      type: EventTypes.ASSIST,
      name: "replayController highlight assist",
      handler: (event) => this._onHighlightEvent(event, "assist")
    },
    {
      type: EventTypes.DEATH,
      name: "replayController highlight death",
      handler: (event) => this._onHighlightEvent(event, "death")
    },
    {
      type: EventTypes.DEATH,
      name: "replayController death",
      handler: (event) => this._onDeathEvent(event)
    },
    {
      type: EventTypes.DAMAGE,
      name: "replayController damage",
      handler: (event) => this._onDamageEvent(event)
    },
    {
      type: EventTypes.MATCH_CLOCK,
      name: "replayController match clock",
      handler: (event) => this._onMatchClock(event)
    }
  ];

  private _onDamageEvent(event): void {
    if (damageDealtEvents.includes(event.name) && this._isCapturing && !this._hasDied) {
      this._setExtraTime(eventExtraTime.get("damage"));
    }
  }

  private _onMatchClock(event): void {
    this._checkToStopRecording();
  }

  private _onHighlightEvent(event, type: string): void {
    const extraTime = eventExtraTime.get(type);
    if (this._isCapturing) {
      this._setExtraTime(extraTime);
    } else {
      this.startRecording(extraTime);
    }
  }

  private _onDeathEvent(event): void {
    this._hasDied = true;
  }

  // ## Helpers

  private _checkToStopRecording() {
    if (Date.now() > this._recordingEndTime) {
      this.stopRecording();
    }
  }

  private _setExtraTime(extraTime: number) {
    this._recordingEndTime = Math.max(Date.now() + extraTime, this._recordingEndTime);
  }
}

export default CaptureManager;