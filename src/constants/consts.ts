import { DatabaseProcessedMatchItem } from "../types";

// Constants
export const apiKey = '_';

export const dbName = 'league_replay_03';
// export const dbName = 'league_replay_02';
// export const dbName = 'league_replay_01';
export const matchesStore = 'matches';
export const processedMatchesStore = 'processed_matches';
export const highlightsStore = 'highlights';
export const processedHighlightsStore = 'processed_highlights';

export const iconsPathes = {
  assistMain: '../../icons/assistIcon.svg',
  assistSecondary: '../../icons/assistIconSecondary.svg',
  deathMain: '../../icons/deathIcon.svg',
  multiKillMain: '../../icons/multiKillIcon.svg',
  killMain: '../../icons/killIcon.svg',
}

export const damageDealtEvents: string[] = [
  "physical_damage_dealt_to_champions",
  "magic_damage_dealt_to_champions",
  "true_damage_dealt_to_champions",
];

export const damageTakenEvents: string[] = [
  "physical_damage_taken",
  "magic_damage_taken",
  "true_damage_taken",
];

export const leagueId = 5426;

const f = (match: DatabaseProcessedMatchItem) => {
}

export const matchFields = {
  "queueId": "extraData.matchInfo.queueId",
  "lane": "extraData.playerInfo.role",
  "isProcessed": "isProcessed",
  "matchId": "match.gameData.matchId"
}

export const highlightFields = {
  "matchId": "matchId",
}

export const eventsToListen = [
  "live_client_data",
  "matchState",
  "match_info",
  "death",
  "respawn",
  "abilities",
  "kill",
  "assist",
  "gold",
  "minions",
  "summoner_info",
  "gameMode",
  "teams",
  "level",
  "announcer",
  "counters",
  "damage",
  "heal"
];

export const eventExtraTime: Map<string, number> = new Map([
  ["kill", 10000],
  ["assist", 7000],
  ["death", 5000],
  ["damage", 5000]
]);

export const kWindowNames = {
  inGame: 'in_game',
  desktop: 'desktop'
};

export const kHotkeys = {
  toggle: 'sample_app_ts_showhide'
};

export const regions = {
  "NA": {
    routing: "americas",
    prefix: "NA1"
  },
  "BR": {
    routing: "americas",
    prefix: "BR1"
  },
  "LAN": {
    routing: "americas",
    prefix: "LA1"
  },
  "LAS": {
    routing: "americas",
    prefix: "LA2"
  },
  "KR": {
    routing: "asia",
    prefix: "KR"
  },
  "JP": {
    routing: "asia",
    prefix: "JP1"
  },
  "EUNE": {
    routing: "europe",
    prefix: "EUN1"
  },
  "EUW": {
    routing: "europe",
    prefix: "EUW1"
  },
  "TR": {
    routing: "europe",
    prefix: "TR1"
  },
  "RU": {
    routing: "europe",
    prefix: "RU"
  },
  "OCE": {
    routing: "sea",
    prefix: "OC1"
  },
  "PH2": {
    routing: "sea",
    prefix: "PH2"
  },
  "SG2": {
    routing: "sea",
    prefix: "SG2"
  },
  "TH2": {
    routing: "sea",
    prefix: "TH2"
  },
  "TW2": {
    routing: "sea",
    prefix: "TW2"
  },
  "VN2": {
    routing: "sea",
    prefix: "VN2"
  }
}

export const summonerSpellMap = {
  21: "SummonerBarrier",
  1: "SummonerBoost",
  2202: "SummonerCherryFlash",
  2201: "SummonerCherryHold",
  14: "SummonerDot",
  3: "SummonerExhaust",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  13: "SummonerMana",
  30: "SummonerPoroRecall",
  31: "SummonerPoroThrow",
  11: "SummonerSmite",
  39: "SummonerSnowURFSnowball_Mark",
  32: "SummonerSnowball",
  12: "SummonerTeleport",
  54: "Summoner_UltBookPlaceholder",
  55: "Summoner_UltBookSmitePlaceholder"
}

export const runesReformedMap = {
  8112: {
    "name": "Electrocute",
    "icon": "perk-images/Styles/Domination/Electrocute/Electrocute.png"
  },
  8124: {
    "name": "Predator",
    "icon": "perk-images/Styles/Domination/Predator/Predator.png"
  },
  8128: {
    "name": "Dark Harvest",
    "icon": "perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png"
  },
  9923: {
    "name": "Hail of Blades",
    "icon": "perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png"
  },
  8126: {
    "name": "Cheap Shot",
    "icon": "perk-images/Styles/Domination/CheapShot/CheapShot.png"
  },
  8139: {
    "name": "Taste of Blood",
    "icon": "perk-images/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png"
  },
  8143: {
    "name": "Sudden Impact",
    "icon": "perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png"
  },
  8136: {
    "name": "Zombie Ward",
    "icon": "perk-images/Styles/Domination/ZombieWard/ZombieWard.png"
  },
  8120: {
    "name": "Ghost Poro",
    "icon": "perk-images/Styles/Domination/GhostPoro/GhostPoro.png"
  },
  8138: {
    "name": "Eyeball Collection",
    "icon": "perk-images/Styles/Domination/EyeballCollection/EyeballCollection.png"
  },
  8135: {
    "name": "Treasure Hunter",
    "icon": "perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png"
  },
  8134: {
    "name": "Ingenious Hunter",
    "icon": "perk-images/Styles/Domination/IngeniousHunter/IngeniousHunter.png"
  },
  8105: {
    "name": "Relentless Hunter",
    "icon": "perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png"
  },
  8106: {
    "name": "Ultimate Hunter",
    "icon": "perk-images/Styles/Domination/UltimateHunter/UltimateHunter.png"
  },
  8351: {
    "name": "Glacial Augment",
    "icon": "perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png"
  },
  8360: {
    "name": "Unsealed Spellbook",
    "icon": "perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png"
  },
  8369: {
    "name": "First Strike",
    "icon": "perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png"
  },
  8306: {
    "name": "Hextech Flashtraption",
    "icon": "perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png"
  },
  8304: {
    "name": "Magical Footwear",
    "icon": "perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png"
  },
  8313: {
    "name": "Triple Tonic",
    "icon": "perk-images/Styles/Inspiration/PerfectTiming/AlchemistCabinet.png"
  },
  8321: {
    "name": "Future's Market",
    "icon": "perk-images/Styles/Inspiration/FuturesMarket/FuturesMarket.png"
  },
  8316: {
    "name": "Minion Dematerializer",
    "icon": "perk-images/Styles/Inspiration/MinionDematerializer/MinionDematerializer.png"
  },
  8345: {
    "name": "Biscuit Delivery",
    "icon": "perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png"
  },
  8347: {
    "name": "Cosmic Insight",
    "icon": "perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png"
  },
  8410: {
    "name": "Approach Velocity",
    "icon": "perk-images/Styles/Resolve/ApproachVelocity/ApproachVelocity.png"
  },
  8352: {
    "name": "Time Warp Tonic",
    "icon": "perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png"
  },
  8005: {
    "name": "Press the Attack",
    "icon": "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png"
  },
  8008: {
    "name": "Lethal Tempo",
    "icon": "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png"
  },
  8021: {
    "name": "Fleet Footwork",
    "icon": "perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png"
  },
  8010: {
    "name": "Conqueror",
    "icon": "perk-images/Styles/Precision/Conqueror/Conqueror.png"
  },
  9101: {
    "name": "Overheal",
    "icon": "perk-images/Styles/Precision/Overheal.png"
  },
  9111: {
    "name": "Triumph",
    "icon": "perk-images/Styles/Precision/Triumph.png"
  },
  8009: {
    "name": "Presence of Mind",
    "icon": "perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png"
  },
  9104: {
    "name": "Legend: Alacrity",
    "icon": "perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png"
  },
  9105: {
    "name": "Legend: Tenacity",
    "icon": "perk-images/Styles/Precision/LegendTenacity/LegendTenacity.png"
  },
  9103: {
    "name": "Legend: Bloodline",
    "icon": "perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png"
  },
  8014: {
    "name": "Coup de Grace",
    "icon": "perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png"
  },
  8017: {
    "name": "Cut Down",
    "icon": "perk-images/Styles/Precision/CutDown/CutDown.png"
  },
  8299: {
    "name": "Last Stand",
    "icon": "perk-images/Styles/Sorcery/LastStand/LastStand.png"
  },
  8437: {
    "name": "Grasp of the Undying",
    "icon": "perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png"
  },
  8439: {
    "name": "Aftershock",
    "icon": "perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png"
  },
  8465: {
    "name": "Guardian",
    "icon": "perk-images/Styles/Resolve/Guardian/Guardian.png"
  },
  8446: {
    "name": "Demolish",
    "icon": "perk-images/Styles/Resolve/Demolish/Demolish.png"
  },
  8463: {
    "name": "Font of Life",
    "icon": "perk-images/Styles/Resolve/FontOfLife/FontOfLife.png"
  },
  8401: {
    "name": "Shield Bash",
    "icon": "perk-images/Styles/Resolve/MirrorShell/MirrorShell.png"
  },
  8429: {
    "name": "Conditioning",
    "icon": "perk-images/Styles/Resolve/Conditioning/Conditioning.png"
  },
  8444: {
    "name": "Second Wind",
    "icon": "perk-images/Styles/Resolve/SecondWind/SecondWind.png"
  },
  8473: {
    "name": "Bone Plating",
    "icon": "perk-images/Styles/Resolve/BonePlating/BonePlating.png"
  },
  8451: {
    "name": "Overgrowth",
    "icon": "perk-images/Styles/Resolve/Overgrowth/Overgrowth.png"
  },
  8453: {
    "name": "Revitalize",
    "icon": "perk-images/Styles/Resolve/Revitalize/Revitalize.png"
  },
  8242: {
    "name": "Unflinching",
    "icon": "perk-images/Styles/Sorcery/Unflinching/Unflinching.png"
  },
  8214: {
    "name": "Summon Aery",
    "icon": "perk-images/Styles/Sorcery/SummonAery/SummonAery.png"
  },
  8229: {
    "name": "Arcane Comet",
    "icon": "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png"
  },
  8230: {
    "name": "Phase Rush",
    "icon": "perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png"
  },
  8224: {
    "name": "Nullifying Orb",
    "icon": "perk-images/Styles/Sorcery/NullifyingOrb/Pokeshield.png"
  },
  8226: {
    "name": "Manaflow Band",
    "icon": "perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png"
  },
  8275: {
    "name": "Nimbus Cloak",
    "icon": "perk-images/Styles/Sorcery/NimbusCloak/6361.png"
  },
  8210: {
    "name": "Transcendence",
    "icon": "perk-images/Styles/Sorcery/Transcendence/Transcendence.png"
  },
  8234: {
    "name": "Celerity",
    "icon": "perk-images/Styles/Sorcery/Celerity/CelerityTemp.png"
  },
  8233: {
    "name": "Absolute Focus",
    "icon": "perk-images/Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png"
  },
  8237: {
    "name": "Scorch",
    "icon": "perk-images/Styles/Sorcery/Scorch/Scorch.png"
  },
  8232: {
    "name": "Waterwalking",
    "icon": "perk-images/Styles/Sorcery/Waterwalking/Waterwalking.png"
  },
  8236: {
    "name": "Gathering Storm",
    "icon": "perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png"
  },
  // Keystones
  8100: {
    "name": "Domination",
    "icon": "perk-images/Styles/7200_Domination.png"
  },
  8300: {
    "name": "Inspiration",
    "icon": "perk-images/Styles/7203_Whimsy.png"
  },
  8000: {
    "name": "Precision",
    "icon": "perk-images/Styles/7201_Precision.png"
  },
  8400: {
    "name": "Resolve",
    "icon": "perk-images/Styles/7204_Resolve.png"
  },
  8200: {
    "name": "Sorcery",
    "icon": "perk-images/Styles/7202_Sorcery.png"
  }
}
