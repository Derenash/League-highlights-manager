import {
  OWGames,
  OWGameListener,
  OWWindow
} from '@overwolf/overwolf-api-ts';

import { kWindowNames, leagueId } from "../../constants/consts";

import EventsSaver from "../../EventsSaver/EventsSaver";

// Aliases
import AppLaunchTriggeredEvent = overwolf.extensions.AppLaunchTriggeredEvent;
import RunningGameInfo = overwolf.games.RunningGameInfo;
import EventManager from '../../EventManager/EventManager';
import DatabaseManager from '../../DatabaseManager/DatabaseManager';
import { DatabaseHighlightItem, HighlightData } from '../../types';

// The background controller holds all of the app's background logic - hence its name. it has
// many possible use cases, for example sharing data between windows, or, in our case,
// managing which window is currently presented to the user. To that end, it holds a dictionary
// of the windows available in the app.
// Our background controller implements the Singleton design pattern, since only one
// instance of it should exist.

const myEventBus = EventManager.getInstance();
window.event_bus = myEventBus;

class BackgroundController {
  private static _instance: BackgroundController;
  private _windows: Record<string, OWWindow> = {};
  private _gameListener: OWGameListener;
  private _databaseManager: DatabaseManager;
  private _eventsSaver: EventsSaver;

  private constructor() {
    // Populating the background controller's window dictionary
    this._windows[kWindowNames.desktop] = new OWWindow(kWindowNames.desktop);
    this._windows[kWindowNames.inGame] = new OWWindow(kWindowNames.inGame);
    this._databaseManager = DatabaseManager.getInstance();
    this._eventsSaver = EventsSaver.getInstance();

    // When a a supported game game is started or is ended, toggle the app's windows
    this._gameListener = new OWGameListener({
      onGameStarted: this.onStartGame.bind(this),
      onGameEnded: this.onEndGame.bind(this)
    });

    overwolf.extensions.onAppLaunchTriggered.addListener(
      e => this.onAppLaunchTriggered(e)
    );
  };

  // Implementing the Singleton design pattern
  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }

    return BackgroundController._instance;
  }

  // When running the app, start listening to games' status and decide which window should
  // be launched first, based on whether a supported game is currently running
  public async run() {
    this._gameListener.start();

    await this._databaseManager.openDatabase();

    const currWindowName = (await this.isSupportedGameRunning())
      ? kWindowNames.inGame
      : kWindowNames.desktop;

    this._windows[currWindowName].restore();
  }

  private async onAppLaunchTriggered(e: AppLaunchTriggeredEvent) {
    console.log('onAppLaunchTriggered():', e);

    if (!e || e.origin.includes('gamelaunchevent')) {
      return;
    }

    if (await this.isSupportedGameRunning()) {
      this._windows[kWindowNames.desktop].close();
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.desktop].restore();
      this._windows[kWindowNames.inGame].close();
    }
  }

  private toggleWindows(info: RunningGameInfo) {
    if (!info || !this.isLeague(info)) {
      return;
    }

    if (info.isRunning) {
      this._windows[kWindowNames.desktop].close();
      this._windows[kWindowNames.inGame].restore();
    } else {
      this._windows[kWindowNames.desktop].restore();
      this._windows[kWindowNames.inGame].close();
    }
  }

  private onStartGame(info: RunningGameInfo) {
    this._eventsSaver.run();
    this.toggleWindows(info);
  }

  private onEndGame(info: RunningGameInfo) {
    this._eventsSaver.onEndGame();
    window.event_bus.clearEventListeners();
    this.toggleWindows(info);
  }

  private async isSupportedGameRunning(): Promise<boolean> {
    const info = await OWGames.getRunningGameInfo();

    return info && info.isRunning && this.isLeague(info);
  }

  // Identify whether the RunningGameInfo object we have references a supported game
  private isLeague(info: RunningGameInfo) {
    return info.classId === leagueId;
  }
}

declare global {
  interface Window {
    event_bus: EventManager;
  }
}

BackgroundController.instance().run();

