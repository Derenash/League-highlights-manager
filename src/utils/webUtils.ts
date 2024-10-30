import { runesReformedMap, summonerSpellMap, iconsPathes as icons } from "../constants/consts"
import { DatabaseHighlightItem, DatabaseMatchItem, DatabaseProcessedHighlightItem, DatabaseProcessedMatchItem, ParticipantData } from "../types"
import { CurrentMatch } from "../windows/desktop/desktop";

export function editButtonText(card: HTMLElement, text: string) {
  const button = card.querySelector(".upgrade-button")
  button.textContent = text
}

export function createMatchCard(match: DatabaseMatchItem, onClick: (matchId: string) => Promise<void>, onButtonClick: (matchId: string) => void): HTMLElement {
  const main = createNewDiv("match-card-raw");
  const championContainer = createNewDiv("champion-container-raw")
  let portrait: HTMLImageElement;
  if (!match.gameData.championName || match.gameData.championName != "undefined") {
    portrait = createPortrait("portrait-raw", match.gameData.championName)
  } else {
    const img = document.createElement("img");
    img.className = "portrait-raw";
    img.src = `/img/question-mark.png`;
    portrait = img
  }
  appendAll(championContainer, [portrait])

  const upgradeButtonContainer = createNewDiv("upgrade-button-container");
  const upgradeButton = document.createElement("button");
  upgradeButton.textContent = "Upgrade";
  upgradeButton.className = "upgrade-button";
  upgradeButton.addEventListener("click", () => onButtonClick(match.gameData.matchId))
  main.addEventListener("click", () => onClick(match.gameData.matchId))
  appendAll(upgradeButtonContainer, [upgradeButton])
  appendAll(main, [championContainer, upgradeButtonContainer])
  return main
}

export function createProcessedMatchCard(processedData: DatabaseProcessedMatchItem, onClick: () => Promise<void>, buttonHandler: () => Promise<void>): HTMLElement {
  const main = createNewDiv("match-card")
  main.classList.add(processedData.extraData.matchInfo.matchResult)
  const championContainer = createChampionContainer(processedData)
  const statsContainer = createStatsContainer(processedData)
  const teamsContainer = createTeamsContainer(processedData)
  const deleteButton = document.createElement("button")
  deleteButton.textContent = "Delete"
  deleteButton.addEventListener("click", async () => {
    await buttonHandler()
  })
  appendAll(main, [championContainer, statsContainer, teamsContainer])
  main.addEventListener("click", () => onClick())

  return main
}

export function addHighlightsToDiv(
  highlightContainer: HTMLElement,
  match: DatabaseProcessedMatchItem,
  highlights: DatabaseProcessedHighlightItem[],
  onClick: (index: number) => () => void,
  onMouseEnter: (index: number) => () => void
): void {
  let duration: number;
  if (match.extraData) {
    duration = match.extraData.matchInfo.timestamps.duration * 1000;
  } else {
    duration = match.gameData.endTime - match.gameData.startTime;
  }
  highlightContainer.innerHTML = '<div class="event-bar"></div>';
  highlights.forEach((highlight: DatabaseProcessedHighlightItem, index: number) => {

    const start = highlight.data.startTime;
    const end = highlight.data.endTime;
    const left = (start / duration) * 100;
    const width = ((end - start) / duration) * 100;
    const newDiv = document.createElement('div');
    newDiv.className = 'highlight-box';
    newDiv.style.left = `${width / 2 + left}%`;
    newDiv.style.width = `${width * 2}%`;
    newDiv.classList.add(index % 2 == 0 ? 'top' : 'bottom');

    addItemsToHighlightBox(newDiv, highlight);


    const barHighlight = document.createElement('div');
    barHighlight.className = 'highlight-bar';
    barHighlight.id = `highlight-${index}`;
    barHighlight.style.left = `${left}%`;
    barHighlight.style.width = `${width}%`;
    const divs = [barHighlight, newDiv];
    divs.forEach((div) => {
      div.addEventListener('click', onClick(index));
      div.addEventListener('mouseenter', onMouseEnter(index));
    });

    highlightContainer.appendChild(barHighlight);
    highlightContainer.appendChild(newDiv);

    // applyy these thigns below to enwdiv and barhighglihgt
  });
}

function addItemsToHighlightBox(highlightBox: HTMLElement, highlight: DatabaseProcessedHighlightItem): void {
  if (highlight.extraData) {
    const filters = highlight.filterData
    const killsCount = filters.kills;
    const deathsCount = filters.deaths;
    const assistsCount = filters.assists;
    const newDiv = document.createElement('div');
    newDiv.className = 'highlight-icon';

    let icon: string;
    if (killsCount > 0) {
      icon = icons.killMain
    } else if (deathsCount > 0) {
      icon = icons.deathMain
    } else if (assistsCount > 0) {
      icon = icons.assistMain
    }

    if (icon) {
      const mainItem = createNewImg('highlight-icon', icon);
      newDiv.appendChild(mainItem);
    }

    const upperDiv = document.createElement('div');
    upperDiv.className = 'highlight-secondary-row';
    if (killsCount > 1) {
      for (let i = 0; i < killsCount; i++) {
        const killsItem = createNewImg('highlight-icon', icons.multiKillMain);
        upperDiv.appendChild(killsItem);
      }
    }
    if (deathsCount > 0 && (icon != icons.deathMain)) {
      const deathsItem = createNewImg('highlight-icon', icons.deathMain);
      upperDiv.appendChild(deathsItem);
    }
    if (assistsCount > 0 && (icon != icons.assistMain) && (icon != icons.killMain)) {
      const assistsItem = createNewImg('highlight-icon', icons.assistSecondary);
      upperDiv.appendChild(assistsItem);
    }

    highlightBox.appendChild(newDiv);
    highlightBox.appendChild(upperDiv);
  }
}

export function showHighlightInfo(idx: number, currentMatch: CurrentMatch): void {
  if ((currentMatch.highlights[currentMatch.highlightIdx] as DatabaseProcessedHighlightItem).extraData) {
    showProcessedHighlightInfo(idx, currentMatch);
  } else {
    showRawHighlightInfo(idx, currentMatch);
  }
};

function showProcessedHighlightInfo(idx: number, currentMatch: CurrentMatch) {
  const highlightScreen = document.getElementById('highlight-info-container');
  const highlight = currentMatch.highlights[idx] as DatabaseProcessedHighlightItem;
  const highlightBar = document.getElementById(`highlight-${idx}`) as HTMLDivElement;
  highlightScreen.innerHTML = ``;
  if (highlight.extraData) {
    const divs = [];
    if (highlight.filterData.kills > 0) divs.push(`<div class="highlight-info">Kills: ${highlight.filterData.kills}</div>`);
    if (highlight.filterData.deaths > 0) divs.push(`<div class="highlight-info">Death: ${highlight.filterData.deaths}</div>`);
    if (highlight.filterData.assists > 0) divs.push(`<div class="highlight-info">Assts: ${highlight.filterData.assists}</div>`);
    divs.push(`<div class="highlight-info">Dealt: ${highlight.filterData.damageDealtTotal.toFixed(0)}</div>`);
    divs.push(`<div class="highlight-info">Taken: ${highlight.filterData.damageTakenTotal.toFixed(0)}</div>`);
    highlightScreen.innerHTML = divs.join('');
  } else {
    highlightScreen.innerHTML = `<div class="highlight-info">No data available</div>`;
  }
  const rect = highlightBar.getBoundingClientRect();
  highlightScreen.style.left = `${rect.left - 15}px `;
  if (idx % 2 == 0) {
    highlightScreen.style.top = `${rect.top}px`;
    highlightScreen.style.transform = 'translateY(-100%)';
  } else {
    highlightScreen.style.top = `${rect.top + rect.height}px`;
    highlightScreen.style.transform = 'translateY(0%)';
  }
  highlightScreen.classList.add('visible');

  highlightScreen.onclick = (event) => {
    event.stopPropagation();
    highlightBar.click();
  };
};

function showRawHighlightInfo(idx: number, currentMatch: CurrentMatch) {
  const highlightScreen = document.getElementById('highlight-info-container');
  const highlightBar = document.getElementById(`highlight-${idx}`) as HTMLDivElement;
  highlightScreen.innerHTML = `<div class="highlight-info">No data available</div>`;
  const rect = highlightBar.getBoundingClientRect();
  highlightScreen.style.left = `${rect.left - 15}px `;
  highlightScreen.style.top = `${rect.top + rect.height}px`;
  highlightScreen.classList.add('visible');

  highlightScreen.onclick = (event) => {
    event.stopPropagation();
    highlightBar.click();
  };
}

// ############################################################################################################
// Auxiliary functions
// ############################################################################################################

function createStatsContainer(processedData: DatabaseProcessedMatchItem): HTMLElement {
  const main = createNewDiv("stats-tags-container")
  const player = processedData.extraData.playerInfo
  const match = processedData.extraData.matchInfo
  const stats = player.stats
  const timeAgoDiv = createNewDiv("time-ago", getTimeAgo(new Date(match.timestamps.end).getTime()))
  const killsDeathAssistsDiv = createNewDiv("kills-death-assists")
  killsDeathAssistsDiv.innerHTML = `
    <span class="kill">${stats.kills}</span>
    <span class="kda-bar">/</span>
    <span class="death">${stats.deaths}</span>
    <span class="kda-bar">/</span>
    <span class="assist">${stats.assists}</span>
  `
  const kdaDiv = createNewDiv("kda", `${stats.kda.toFixed(2)} KDA`)
  const statsDiv = createNewDiv("stats")
  appendAll(statsDiv, [timeAgoDiv, killsDeathAssistsDiv, kdaDiv])
  const tagsDiv = createNewDiv("tags")
  tagsDiv.innerHTML = `
    <div class="tag">Quadra-Kill</div>
    <div class="tag">Solo Kill</div>
    <div class="tag">Clutch</div>
    <div class="tag">5K Burst</div>
  `
  appendAll(main, [statsDiv, tagsDiv])
  return main
}

function createTeamsContainer(processedData: DatabaseProcessedMatchItem): HTMLElement {
  const player = processedData.extraData.playerInfo
  const main = createNewDiv("teams-container");
  const blueTeam = processedData.extraData.blueTeam;
  const redTeam = processedData.extraData.redTeam;
  const blueTeamDiv = createNewDiv("champions-container");
  const redTeamDiv = createNewDiv("champions-container");
  const createPortraitDiv = (participant: ParticipantData) => participant.participantId == player.participantId ? createPortrait("champion", participant.champion, ["player"]) : createPortrait("champion", participant.champion)
  if (blueTeam.participants.length > 5) {
    console.log(JSON.stringify(processedData));
  }
  const blueTeamPlayers = blueTeam.participants.map(createPortraitDiv)
  const redTeamPlayers = redTeam.participants.map(createPortraitDiv)
  appendAll(blueTeamDiv, blueTeamPlayers)
  appendAll(redTeamDiv, redTeamPlayers)
  appendAll(main, [blueTeamDiv, redTeamDiv])
  return main
}

function createSmallerChampionContainer(champion: string): HTMLElement {
  const main = createNewDiv("champion-container");
  const portraitDiv = createPortrait("portrait", champion)
  appendAll(main, [portraitDiv])
  return main
}

function createChampionContainer(processedData: DatabaseProcessedMatchItem): HTMLElement {
  const main = createNewDiv("champion-container");
  const player = processedData.extraData.playerInfo;

  const portraitSpellsRunesDiv = createNewDiv("portrait-spells-runes-container")
  const portraitDiv = createPortrait("portrait", player.champion)

  // Main Div
  const spellsRunesDiv = createNewDiv("spells-runes-grid-container")
  // Sub Divs
  const spellDDiv = createNewImg("spell", `/league/spell/${summonerSpellMap[player.summonerSpells.slot1]}.png`)
  const spellFDiv = createNewImg("spell", `/league/spell/${summonerSpellMap[player.summonerSpells.slot2]}.png`)
  const keystone = runesReformedMap[player.runes.primaryTree.keystone]
  const keystoneImg = keystone ? `/league/${keystone.icon}` : "/league/question-mark.png"
  const keystoneDiv = createNewImg("rune", keystoneImg)
  const secondaryType = runesReformedMap[player.runes.secondaryTree.type]
  const secondaryTypeImg = secondaryType ? `/league/${secondaryType.icon}` : "/league/question-mark.png"
  const secondaryTypeDiv = createNewImg("rune", secondaryTypeImg)
  appendAll(spellsRunesDiv, [spellDDiv, spellFDiv, keystoneDiv, secondaryTypeDiv])

  appendAll(portraitSpellsRunesDiv, [portraitDiv, spellsRunesDiv])

  const inventoryDiv = createNewDiv("itens-container")
  const items = [player.items.item0, player.items.item1, player.items.item2, player.items.item3, player.items.item4, player.items.item5]
  let itemDivs = [];
  items.forEach((item) => {
    if (item != 0) {
      const newDiv = createNewImg("item", `/league/item/${item}.png`)
      itemDivs.push(newDiv)
    } else {
      const newDiv = createNewDiv("item")
      newDiv.classList.add("empty")
      itemDivs.push(newDiv)
    }

  })
  appendAll(inventoryDiv, itemDivs)

  appendAll(main, [portraitSpellsRunesDiv, inventoryDiv])

  return main
}

function createPortrait(className: string, champion: string, classList?: string[]): HTMLImageElement {
  const img = document.createElement("img");
  img.className = className;
  img.src = `/league/champion/${champion}.png`;
  if (classList) { img.classList.add(...classList) }
  return img
}

function getTimeAgo(endTimestamp: number): string {
  const difference = Date.now() - endTimestamp
  const seconds = Math.floor(difference / 1000)
  const placeSuffix = (num: number) => num > 1 ? "s" : ""
  if (seconds < 60) { return `${seconds} second${placeSuffix(seconds)} ago` }

  if (seconds < 3600) {
    const value = Math.floor(seconds / 60)
    return `${value} minute${placeSuffix(value)} ago`
  }

  if (seconds < 86400) {
    const value = Math.floor(seconds / 3600)
    return `${value} hour${placeSuffix(value)} ago`
  }

  if (seconds < 2592000) {
    const value = Math.floor(seconds / 86400)
    return `${value} day${placeSuffix(value)} ago`
  }

  if (seconds < 31536000) {
    const value = Math.floor(seconds / 2592000)
    return `${value} month${placeSuffix(value)} ago`
  }

  const value = Math.floor(seconds / 31536000)
  return `${value} year${placeSuffix(value)} ago`
}

function createNewDiv(className: string, textContent?: string) {
  const node = document.createElement("div")
  node.className = className
  if (textContent) { node.textContent = textContent }
  return node
}

function createNewImg(className: string, src: string) {
  const img = document.createElement("img")
  img.className = className
  img.src = src
  return img
}

function appendAll(node: any, children: any[]) {
  children.forEach((child) => {
    node.appendChild(child)
  })
}

