import {
  OWGamesEvents,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";
import WindowState = overwolf.windows.WindowStateEx;

import { EventTypes } from "../../types";
import { kHotkeys, kWindowNames, leagueId, eventsToListen, } from "../../constants/consts";
import { getCurrentGameClassId } from "../../utils";

import CaptureManager from "../../CaptureManager/CaptureManager";
import EventManager from "../../EventManager/EventManager";
import AppWindow from "../AppWindow";

// The window displayed in-game while a game is running.
// It listens to all info events and to the game events listed in the consts.ts file
// and writes them to the relevant log using <pre> tags.
// The window also sets up Ctrl+F as the minimize/restore hotkey.
// Like the background window, it also implements the Singleton design pattern.
class InGame extends AppWindow {
  private static _instance: InGame;
  private _gameEventsListener: OWGamesEvents;
  private _eventsLog: HTMLElement;
  private _infoLog: HTMLElement;
  private _replayController: CaptureManager;
  private _eventsManager: EventManager;

  private constructor() {
    super(kWindowNames.inGame);

    this._eventsLog = document.getElementById('eventsLog');
    this._infoLog = document.getElementById('infoLog');
    this._eventsManager = overwolf.windows.getMainWindow().event_bus;
    this._eventsManager.registerEventListener(EventTypes.MATCH_CLOCK, "in-game match_clock", this.onFirstMatchClock.bind(this))
    this._eventsManager.registerEventListener(EventTypes.GAME_INFO, "in-game game_info", this.onGameInfo.bind(this));
    this._eventsManager.registerEventListener(EventTypes.SUMMONER_INFO, "in-game summoner_info", this.onSummonerInfo.bind(this));

    this._replayController = new CaptureManager();

    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();

    this._gameEventsListener = new OWGamesEvents(
      {
        onInfoUpdates: this.onInfoUpdates.bind(this),
        onNewEvents: this.onNewEvents.bind(this)
      },
      eventsToListen
    );
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }

    return this._instance;
  }

  public async run() {
    const gameClassId = await getCurrentGameClassId();
    if (gameClassId !== leagueId) {
      this.currWindow.close();
      console.log('Game is not League of Legends, closing in-game window')
      return;
    }
    this._gameEventsListener.start();
  }

  private async onInfoUpdates(info) {
    this._eventsManager.notifyInfoUpdate(info);
    this.logLine(this._infoLog, info, false);
  }

  private async onNewEvents(e) {
    e.events.forEach((event) => {
      this._eventsManager.notifyEvent(event);
    });
    this.logLine(this._eventsLog, e.events, false);
  }

  private async onGameInfo(info: any) {
    if (info.matchId) {
      console.log('game info: ', JSON.stringify(info));
      console.log('setting matchId: ', info.matchId);
      localStorage.setItem('matchId', info.matchId);
      this._eventsManager.removeEventListener(EventTypes.GAME_INFO, "in-game game_info")
    }
  }

  private async onSummonerInfo(info: any) {
    console.log('setting summonerId: ', info.id);
    console.log('setting region: ', info.region);
    console.log('setting championName: ', info.champion);
    console.log('setting summonerName: ', info.name);
    localStorage.setItem('summonerId', info.id);
    localStorage.setItem('region', info.region);
    localStorage.setItem('championName', info.champion);
    localStorage.setItem('summonerName', info.name);
    this._eventsManager.removeEventListener(EventTypes.SUMMONER_INFO, "in-game summoner_info")
  }

  private async onFirstMatchClock(event) {
    console.log('onFirstMatchClock: ', JSON.stringify(event, null, 2));
    const gameStart = Date.now() - (event.data * 1000);
    await this.start(gameStart);
  }

  private async start(startTime: number) {
    localStorage.setItem('startTime', startTime.toString());
    this._eventsManager.notifyEvent({ title: "game_start", startTime });
    this._eventsManager.removeEventListener(EventTypes.MATCH_CLOCK, "in-game match_clock");
    await this._replayController.turnOnReplays();
  }

  // Displays the toggle minimize/restore hotkey in the window header
  private async setToggleHotkeyText() {
    const gameClassId = await getCurrentGameClassId();
    const hotkeyText = await OWHotkeys.getHotkeyText(kHotkeys.toggle, gameClassId);
    const hotkeyElem = document.getElementById('hotkey');
    hotkeyElem.textContent = hotkeyText;
  }

  // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
  private async setToggleHotkeyBehavior() {
    const toggleInGameWindow = async (
      hotkeyResult: overwolf.settings.hotkeys.OnPressedEvent
    ): Promise<void> => {
      console.log(`pressed hotkey for ${hotkeyResult.name}`);
      const inGameState = await this.getWindowState();

      if (inGameState.window_state === WindowState.NORMAL ||
        inGameState.window_state === WindowState.MAXIMIZED) {
        this.currWindow.minimize();
      } else if (inGameState.window_state === WindowState.MINIMIZED ||
        inGameState.window_state === WindowState.CLOSED) {
        this.currWindow.restore();
      }
    }

    OWHotkeys.onHotkeyDown(kHotkeys.toggle, toggleInGameWindow);
  }

  // Appends a new line to the specified log
  private logLine(log: HTMLElement, data, highlight) {
    const line = document.createElement('pre');
    line.textContent = JSON.stringify(data);

    if (highlight) {
      line.className = 'highlight';
    }

    // Check if scroll is near bottom
    const shouldAutoScroll =
      log.scrollTop + log.offsetHeight >= log.scrollHeight - 10;

    // log.innerHTML = '';
    log.appendChild(line);


    if (shouldAutoScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }
}

InGame.instance().run();