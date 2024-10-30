import { processHighlight } from "../EventsSaver/highlightProcessing";
import { fetchAndProcessMatchData, processMatch } from "../EventsSaver/matchProcessing";
import { processedMatchesStore, matchesStore, highlightsStore, processedHighlightsStore, dbName } from "../constants/consts";
import { MatchExtraData, PlayerEvents, TimelineData, DatabaseMatchItem, DatabaseHighlightItem, DatabaseProcessedHighlightItem, DatabaseProcessedMatchItem, ExclusiveFilter, InclusiveFilter, OP } from "../types";

function getNestedValue(obj: any, field: string): any {
  const parts = field.split('.');
  let currentObj = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (Object.prototype.hasOwnProperty.call(currentObj, part)) {
      currentObj = currentObj[part];
    } else {
      return null;
    }
  }

  return currentObj;
}


// DB 003 Has some useful items that cna be used in the future
// DB 004 Has some useful items that cna be used in the future
class DatabaseManager {
  private dbName = dbName;
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  public static instance: DatabaseManager;

  private constructor() { }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }

    return DatabaseManager.instance;
  }

  private operator<T>(op: OP, a: T, b: T): boolean {
    switch (op) {
      case OP.EQL:
        return a === b;
      case OP.GTN:
        return a > b;
      case OP.GTE:
        return a >= b;
      case OP.LTN:
        return a < b;
      case OP.LTE:
        return a <= b;
      default:
        return false;
    }
  }


  public async query<T>(storeName: string, incF: InclusiveFilter, excF: ExclusiveFilter): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      let query = store.openCursor();
      let items: T[] = [];

      query.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item: T = cursor.value;

          // Log the current item being processed
          // console.log(`Processing item:`, JSON.stringify(item));

          // Here we'll check if the item pass any of the inclusive filters
          // If it does, we'll check if it passes any of the exclusive filters
          let include = true;
          for (let i = 0; i < incF.length; i++) {
            const incFilters = incF[i];
            let pass = false;
            for (let i = 0; i < incFilters.length; i++) {
              const incFilter = incFilters[i];
              const value = getNestedValue(item, incFilter.field);
              if (!value) {
                console.log(`Field ${incFilter.field} not found in item`);
                continue;
              }
              const success = this.operator(incFilter.operator, value, incFilter.value);
              if (success) {
                pass = true;
                console.log(`PASS :) - inc filter at ${incFilter.field}, ${value} ${incFilter.operator} ${incFilter.value}`);
                break;
              } else {
                console.log(`FAIL :( - inc filter at ${incFilter.field}, ${value} ${incFilter.operator} ${incFilter.value}`);
              }
            }
            if (!pass) {
              include = false;
              break;
            }
          };

          if (!include) {
            console.log(`Item failed inclusive filters`);
            cursor.continue();
            return;
          }

          let exclude = false;
          for (let i = 0; i < excF.length; i++) {
            const excFilter = excF[i];
            const value = getNestedValue(item, excFilter.field);
            if (!value) {
              console.log(`Field ${excFilter.field} not found in item`);
              continue;
            }
            const success = this.operator(excFilter.operator, value, excFilter.value);
            if (success) {
              console.log(`Item passed exclusive filter:`, excFilter);
              continue;
            } else {
              exclude = true;
              console.log(`Item failed exclusive filter:`, excFilter);
              break;
            }
          }

          if (include && !exclude) {
            console.log(`Item passed all filters`);
            items.push(item);
          }

          cursor.continue();
        } else {
          resolve(items);
        };



      };
      query.onerror = (event) => {
        console.error('Error querying items:', event);
        reject((event.target as IDBRequest).error);
      }
    })
  }

  public async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event: Event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('Error opening database:', error);
        reject(error);
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  public async processMatches(): Promise<void> {
    const matches = await this.getStoreItems<DatabaseMatchItem>(matchesStore);
    if (matches.length > 0) {
      matches.map(async (match) => {
        if (match.isProcessed) {
          console.log(`Match is already processed: ${match.gameData.matchId}`);
          return;
        }
        const { matchData, timelineData } = await fetchAndProcessMatchData(match.gameData);
        const processedMatch = processMatch(matchData, match);
        await this._addProcessedMatch(processedMatch);
        await this._markMatchAsProcessed(match.gameData.matchId);
        await this._upgradeHighlights(match.gameData.matchId, matchData, match.playerEvents, timelineData);
      });
    } else {
      console.log('No unprocessed matches found.');
    }
  }

  public async tempUpdateMatches(): Promise<void> {
    const matches = await this.getStoreItems<DatabaseMatchItem>(matchesStore);
    matches.map(async (match) => {
      const isProcessed = match.isProcessed ? 1 : 0;
      const newMatch = { ...match, isProcessed };
      await this._updateItem<DatabaseMatchItem>(matchesStore, newMatch);
    });
  }

  public async processMatch(matchId: string): Promise<void> {
    try {
      const match = await this.getItemsWithFilter<DatabaseMatchItem>(matchesStore, 'matchId', IDBKeyRange.only(matchId));
      if (match.length === 0) {
        console.error('Match not found');
        return;
      }
      const { matchData, timelineData } = await fetchAndProcessMatchData(match[0].gameData);
      const processedMatch = processMatch(matchData, match[0]);
      await this._addProcessedMatch(processedMatch);
      await this._markMatchAsProcessed(matchId);
      await this._upgradeHighlights(matchId, matchData, match[0].playerEvents, timelineData);
    } catch (error) {
      throw new Error('An error occurred while processing the match');
      // console.error('An error occurred while processing the match:', error);
    }
  }

  public async addHighlight(highlight: DatabaseHighlightItem): Promise<void> {
    return this._addItem(highlightsStore, highlight);
  }

  public async addMatch(match: DatabaseMatchItem): Promise<void> {
    return this._addItem(matchesStore, match);
  }

  public async getStoreItems<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = (event) => {
        console.error('Error getting items:', event);
        reject(event);
      };

      request.onsuccess = () => {
        console.log('Items retrieved successfully');
        resolve((request.result as any[]));
      };
    });
  }

  public async getMatch(matchId: string): Promise<DatabaseMatchItem | null> {
    const matches = await this.getItemsWithFilter<DatabaseMatchItem>(matchesStore, 'matchId', IDBKeyRange.only(matchId));
    if (matches.length === 0) {
      return null;
    }
    return matches[0]
  }

  public async getItemsWithFilter<T>(storeName: string, index: string, range: IDBKeyRange): Promise<T[]> {
    return this.getItemsWithFilters(storeName, [{ index, range }]);
  }

  public async getItemsWithFilters<T>(storeName: string, filters: { index: string, range: IDBKeyRange }[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const itemsMap: { [key: number]: { item: T, seen: number } } = {};

      const promises = filters.map((filter) => {
        return new Promise<void>((res, rej) => {
          const index = store.index(filter.index);
          const request = index.openCursor(filter.range);

          request.onerror = (event) => {
            console.error('Error getting items:', event);
            rej(event);
          };

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              const item = itemsMap[cursor.value.id] || { item: cursor.value, seen: 0 };
              item.seen++;
              itemsMap[cursor.value.id] = item;

              cursor.continue();
            } else {
              res();
            }
          };
        });
      });

      Promise.all(promises).then(() => {
        console.log('Items retrieved successfully');
        const totalFilters = filters.length;
        const items: T[] = [];
        // Only show items that match all filters
        Object.values(itemsMap).forEach((item) => {
          if (item.seen === totalFilters) {
            items.push(item.item);
          }
        })
        resolve(items);
      }).catch((err) => {
        reject(err);
      });
    });

  }

  private async _upgradeHighlights(matchId: string, matchData: MatchExtraData, playerEvents: PlayerEvents, timelineData: TimelineData): Promise<void> {
    const highlights = await this.getItemsWithFilter<DatabaseHighlightItem>(highlightsStore, 'matchId', IDBKeyRange.only(matchId));
    console.log(`Upgrading ${highlights.length} highlights`);
    highlights.map(async (highlight) => {
      const processedHighlight = processHighlight(highlight, matchData, playerEvents, timelineData);
      await this._addProcessedHighlight(processedHighlight);
    });
  }

  private async _markMatchAsProcessed(matchId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([matchesStore], 'readwrite');
      const store = transaction.objectStore(matchesStore);
      const index = store.index('matchId');
      const request = index.get(matchId);

      request.onerror = (event) => {
        console.error('Error marking match as processed:', event);
        reject(event);
      };

      request.onsuccess = () => {
        const match = request.result as DatabaseMatchItem;
        match.isProcessed = 1;
        const updateRequest = store.put(match);

        updateRequest.onerror = (event) => {
          console.error('Error marking match as processed:', event);
          reject(event);
        };

        updateRequest.onsuccess = () => {
          console.log('Match marked as processed successfully');
          resolve();
        };
      };
    });
  }

  private async _addProcessedMatch(match: DatabaseProcessedMatchItem): Promise<void> {
    return this._addItem(processedMatchesStore, match);
  }

  private async _addProcessedHighlight(highlight: DatabaseProcessedHighlightItem): Promise<void> {
    return this._addItem(processedHighlightsStore, highlight);
  }

  private async _addItem<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = (event) => {
        console.error('Error adding item:', event);
        reject(event);
      };

      request.onsuccess = () => {
        console.log('Item added successfully');
        resolve();
      };
    });
  }

  private async _updateItem<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = (event) => {
        console.error('Error updating item:', event);
        reject(event);
      };

      request.onsuccess = () => {
        console.log('Item updated successfully');
        resolve();
      };
    });
  }

  public async deleteProcessedItem<T>(storeName: string, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not opened'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = (event) => {
        console.error('Error deleting item:', event);
        reject(event);
      };

      request.onsuccess = () => {
        console.log('Item deleted successfully');
        resolve();
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(matchesStore)) {
      console.log(`Creating object store: ${matchesStore}`);
      const MS = db.createObjectStore(matchesStore, { keyPath: 'id', autoIncrement: true });
      MS.createIndex('matchId', 'gameData.matchId', { unique: true });
      MS.createIndex('isProcessed', 'isProcessed');
      console.log(`Indexes created for object store ${matchesStore}`);
    }

    if (!db.objectStoreNames.contains(processedMatchesStore)) {
      console.log(`Creating object store: ${processedMatchesStore}`);
      const PMS = db.createObjectStore(processedMatchesStore, { keyPath: 'id', autoIncrement: true });
      PMS.createIndex('matchId', 'gameData.matchId', { unique: true });
      PMS.createIndex('result', 'filterData.result');
      PMS.createIndex('champion', 'filterData.champion');
      PMS.createIndex('matchup', 'filterData.matchup');
      PMS.createIndex('role', 'filterData.role');
      PMS.createIndex('kills', 'filterData.kills');
      PMS.createIndex('deaths', 'filterData.deaths');
      PMS.createIndex('assists', 'filterData.assists');
      PMS.createIndex('KDA', 'filterData.KDA');
      PMS.createIndex('items', 'filterData.items', { multiEntry: true });
      PMS.createIndex('alliedChampions', 'filterData.alliedChampions', { multiEntry: true });
      PMS.createIndex('enemyChampions', 'filterData.enemyChampions', { multiEntry: true });
      console.log(`Indexes created for object store ${processedMatchesStore}`);
    }

    if (!db.objectStoreNames.contains(highlightsStore)) {
      console.log(`Creating object store: ${highlightsStore}`);
      const HS = db.createObjectStore(highlightsStore, { keyPath: 'id', autoIncrement: true });
      HS.createIndex('matchId', 'matchId');
      HS.createIndex('startTime', 'data.startTime');
    }

    if (!db.objectStoreNames.contains(processedHighlightsStore)) {
      console.log(`Creating object store: ${processedHighlightsStore}`);
      const PHS = db.createObjectStore(processedHighlightsStore, { keyPath: 'id', autoIncrement: true });
      PHS.createIndex('matchId', 'matchId');
      PHS.createIndex('kills', 'filterData.kills');
      PHS.createIndex('deaths', 'filterData.deaths');
      PHS.createIndex('assists', 'filterData.assists');
      PHS.createIndex('killsBefore', 'filterData.killsBefore');
      PHS.createIndex('deathsBefore', 'filterData.deathsBefore');
      PHS.createIndex('assistsBefore', 'filterData.assistsBefore');
      PHS.createIndex('KDA', 'filterData.KDA');
      PHS.createIndex('level', 'filterData.level');
      PHS.createIndex('damageDealtTotal', 'filterData.damageDealtTotal');
      PHS.createIndex('damageTakenTotal', 'filterData.damageTakenTotal');
      PHS.createIndex('healTotal', 'filterData.healTotal');
      PHS.createIndex('goldDiffBefore', 'filterData.goldDiffBefore');
      PHS.createIndex('goldDiffAfter', 'filterData.goldDiffAfter');
      PHS.createIndex('items', 'filterData.items', { multiEntry: true });
      PHS.createIndex('alliedParticipants', 'filterData.alliedParticipants', { multiEntry: true });
      PHS.createIndex('enemyParticipants', 'filterData.enemyParticipants', { multiEntry: true });
      PHS.createIndex('tags', 'filterData.tags', { multiEntry: true });
      console.log(`Indexes created for object store ${processedHighlightsStore}`);
    }
  }
}

export default DatabaseManager;