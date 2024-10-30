import { matchFields, highlightsStore, kWindowNames, processedHighlightsStore, highlightFields, processedMatchesStore } from "../../constants/consts";
import AppWindow from "../AppWindow";
import DatabaseManager from "../../DatabaseManager/DatabaseManager";
import { CheckboxFilter, CheckboxGroups, DatabaseHighlightItem, DatabaseMatchItem, DatabaseProcessedHighlightItem, DatabaseProcessedMatchItem, OP } from "../../types";
import { addHighlightsToDiv, createMatchCard, createProcessedMatchCard, editButtonText, getMatchesFromFilters, showHighlightInfo } from "../../utils";

export interface CurrentMatch {
  matchId: string;
  data: DatabaseMatchItem | DatabaseProcessedMatchItem;
  index: number;
  highlights: (DatabaseHighlightItem | DatabaseProcessedHighlightItem)[];
  highlightIdx?: number;
}

class DesktopWindow extends AppWindow {
  private static _instance: DesktopWindow;
  private _dbManager: DatabaseManager;
  private _filters: CheckboxGroups;
  private _matches: any[] = [];
  private _currentMatch: CurrentMatch;
  private _videoScreen: HTMLElement;
  private _hoveredHighlightIdx: number;

  private constructor() {
    super(kWindowNames.desktop);
    this._dbManager = DatabaseManager.getInstance();
    this._filters = this._initializeFilters();
    this._setupEventListeners();
  }

  public static instance(): DesktopWindow {
    if (!DesktopWindow._instance) {
      DesktopWindow._instance = new DesktopWindow();
    }
    return DesktopWindow._instance;
  }

  public async run(): Promise<void> {
    await this._dbManager.openDatabase();
    await this._changeAndDisplayReplays();
    this._createFiltersDivs();
    this._videoScreen = document.getElementById('video-screen') as HTMLElement;
  }

  private _initializeFilters(): CheckboxGroups {
    const queueId = matchFields["queueId"];
    const lane = matchFields["lane"];
    const isProcessed = matchFields["isProcessed"];
    const filters: CheckboxGroups = {
      "queue": {
        title: "Queue",
        inputs: {
          "solo": {
            checked: true,
            filter: { field: queueId, value: 420, operator: OP.EQL },
            text: "Solo/Duo"
          },
          "flex": {
            checked: true,
            filter: { field: queueId, value: 440, operator: OP.EQL },
            text: "Flex"
          },
          "clash": {
            checked: true,
            filter: { field: queueId, value: 700, operator: OP.EQL },
            text: "Clash"
          }
        }
      },
      "lane": {
        title: "Lane",
        inputs: {
          "top": {
            checked: true,
            filter: { field: lane, value: "TOP", operator: OP.EQL },
            text: "Top"
          },
          "jungle": {
            checked: true,
            filter: { field: lane, value: "JUNGLE", operator: OP.EQL },
            text: "Jungle"
          },
          "mid": {
            checked: true,
            filter: { field: lane, value: "MIDDLE", operator: OP.EQL },
            text: "Mid"
          },
          "adc": {
            checked: true,
            filter: { field: lane, value: "BOTTOM", operator: OP.EQL },
            text: "ADC"
          },
          "support": {
            checked: true,
            filter: { field: lane, value: "UTILITY", operator: OP.EQL },
            text: "Support"
          }
        }
      },
      "processed": {
        title: "Processed",
        inputs: {
          "processed": {
            checked: true,
            filter: { field: isProcessed, value: 1, operator: OP.EQL },
            text: "Processed"
          },
          "raw": {
            checked: false,
            filter: { field: isProcessed, value: 0, operator: OP.EQL },
            text: "Raw"
          }
        }
      }
    }
    return filters;
  };

  private _createFiltersDivs(): void {
    const filtersContainer = document.getElementById('filters-container') as HTMLElement;
    filtersContainer.innerHTML = "";

    for (const group in this._filters) {
      const filterGroup = this._filters[group];
      const dropdown = document.createElement('div');
      dropdown.classList.add('dropdown', 'filter-group');

      const button = document.createElement('button');
      button.classList.add('dropdown-toggle');
      button.innerText = filterGroup.title;
      dropdown.appendChild(button);

      const dropdownMenu = document.createElement('div');
      dropdownMenu.classList.add('dropdown-menu');

      this._setupDropdownToggleListener(button);

      for (const input in filterGroup.inputs) {
        const filter = filterGroup.inputs[input];

        const label = document.createElement('label');
        label.innerText = filter.text;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('filter-checkbox');
        checkbox.id = input;
        checkbox.value = input;
        checkbox.checked = filter.checked;

        checkbox.addEventListener('change', () => {
          this._filters[group].inputs[input].checked = checkbox.checked;
          this._changeAndDisplayReplays();
        });

        label.prepend(checkbox);
        dropdownMenu.appendChild(label);
      }

      dropdown.appendChild(dropdownMenu);
      filtersContainer.appendChild(dropdown);
    }
  }


  private _hideHighlightInfo(): void {
    const highlightScreen = document.getElementById('highlight-info-container') as HTMLElement;
    highlightScreen.classList.remove('visible');
  };


  private _setHighlights(): void {
    console.log('filters:', JSON.stringify(this._filters));
    const highlights = this._currentMatch.highlights as DatabaseProcessedHighlightItem[];
    const highlightContainer = document.getElementById('events-container') as HTMLElement;
    highlightContainer.innerHTML = `<div class="event-bar"></div>`;
    const onClick = (index: number) => () => {
      this._setCurrentHighlight(index);
    };
    const onMouseEnter = (index: number) => () => {
      showHighlightInfo(index, this._currentMatch);
    };
    addHighlightsToDiv(highlightContainer, this._currentMatch.data as DatabaseProcessedMatchItem, highlights, onClick, onMouseEnter);
  }


  private async _setCurrentMatch(index: number): Promise<void> {
    const match: DatabaseMatchItem | DatabaseProcessedMatchItem = this._matches[index];
    // console.log("Match:", JSON.stringify(match));
    const matchId = match.gameData.matchId;
    const filter = { field: highlightFields["matchId"], value: matchId, operator: OP.EQL };
    const highlights = (match as DatabaseProcessedMatchItem).extraData
      ? await this._dbManager.query<DatabaseProcessedHighlightItem>(processedHighlightsStore, [], [filter])
      : await this._dbManager.query<DatabaseHighlightItem>(highlightsStore, [], [filter]);
    this._currentMatch = { matchId, data: match, index, highlights, highlightIdx: 0 };
    this._setCurrentHighlight(0);
  }

  private _setCurrentHighlight(index: number): void {
    this._currentMatch.highlightIdx = index;
    const highlight = this._currentMatch.highlights[index];
    this._videoScreen.setAttribute("src", highlight.data.path);
    this._setHighlights();
  }


  private async _changeAndDisplayReplays(): Promise<void> {
    await this._getReplays();
    console.log("Matches:", this._matches, length);
    this._displayMatchCards();
  }

  private async _getReplays(): Promise<void> {
    const matches = await getMatchesFromFilters(this._filters, this._dbManager);
    this._matches = matches;
  }

  private async _displayMatchCards(): Promise<void> {
    const main = document.getElementById("cards-container");
    main.innerHTML = "";
    console.log("Matches:", this._matches.length);
    this._matches.forEach((match) => {
      const index = main.children.length;

      const deleteHandler = async () => {
        try {
          await this._dbManager.deleteProcessedItem<DatabaseProcessedMatchItem>(processedMatchesStore, match.id);
          await this._changeAndDisplayReplays();
        } catch (error) {
          console.error("Error deleting match:", error);
        }
      }
      const selectMatch = async () => {
        this._setCurrentMatch(index);
      }
      const card = match.extraData
        ? createProcessedMatchCard(match, selectMatch, deleteHandler)
        : createMatchCard(match, selectMatch, (matchId: string) => this._upgradeReplay(matchId, index));
      main.appendChild(card);
    })
  }

  private async _upgradeReplay(matchId: string, index: number): Promise<void> {
    try {
      await this._dbManager.processMatch(matchId);
      await this._changeAndDisplayReplays();
    } catch (error) {
      console.error(JSON.stringify(error));
      const main = document.getElementById("cards-container") as HTMLElement;
      const card = main.children[index] as HTMLElement;
      editButtonText(card, "Upgrade Failed");
    }
  }

  private _setupEventListeners(): void {
    this._setupVideoScreenClickListener();
    this._setupHighlightScreenListener();
  }

  private _setupVideoScreenClickListener(): void {
    const videoScreen = document.getElementById('video-screen') as HTMLElement;
    videoScreen.addEventListener('click', () => {
      const rightPanel = document.getElementById('right-container') as HTMLElement;
      rightPanel.classList.toggle('hidden');
    });
  }

  private _setupHighlightScreenListener(): void {
    const highlightScreen = document.getElementById('highlight-info-container') as HTMLElement;
    highlightScreen.addEventListener('mouseleave', () => {
      this._hideHighlightInfo();
    });
  }

  private _setupDropdownToggleListener(dropdownToggle: HTMLButtonElement): void {
    dropdownToggle.addEventListener('click', () => {
      dropdownToggle.classList.toggle('expanded');
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach(dropdown => {
        if (dropdown !== dropdownToggle.nextElementSibling) {
          dropdown.classList.remove('show');
          const toggle = dropdown.previousElementSibling as HTMLButtonElement;
          toggle.classList.remove('expanded');
        }
      });
      (dropdownToggle.nextElementSibling as HTMLElement).classList.toggle('show');
    })
  }


}

DesktopWindow.instance().run();