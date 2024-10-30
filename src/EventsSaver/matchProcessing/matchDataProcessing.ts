import { ParticipantData, ParticipantStats, SpecialKills, Itens, Runes, TeamData, MatchInfo, MatchExtraData } from "../../types";
import { getFromLeagueAPI } from "../../utils";
import { getMatchUrl } from "../utils";

// # Functions to process Match Data
// ## Fetch

export async function fetchMatchData(matchId: string, summonerId: string, region: string): Promise<overwolf.web.SendHttpRequestResult> {
  const url = getMatchUrl(region, matchId);
  const result = await getFromLeagueAPI(url);
  return result;
}

// ## Transform

// Transforms the match data into a more readable format
export function transformMatchData(summonerName: string, championName: string, matchData: any): MatchExtraData {
  const samePlayer = (participant) => {
    console.log("Checking playerName: ", participant.riotIdGameName, " with: ", summonerName, " and champion: ", participant.championName, " with: ", championName)
    const nameMatch = participant.riotIdGameName === summonerName;
    const championMatch = participant.championName === championName;
    return nameMatch || championMatch;
  }
  const player = matchData.info.participants.find(samePlayer);
  if (!player) {
    throw new Error('Player not found');
  }

  const teamInfo = matchData.info.teams.find(team => team.teamId === player.teamId);
  const isWin = teamInfo ? teamInfo.win : false;

  const matchInfo: MatchInfo = {
    matchId: matchData.metadata.matchId,
    matchResult: isWin ? "win" : "loss",
    queueId: matchData.info.queueId,
    timestamps: {
      start: matchData.info.gameStartTimestamp,
      end: matchData.info.gameEndTimestamp,
      duration: matchData.info.gameDuration,
    },
  };

  const blueTeam: TeamData = {
    teamId: 100,
    result: matchData.info.teams[0].win ? "win" : "loss",
    kills: 0,
    deaths: 0,
    assists: 0,
    participants: []
  };
  const redTeam: TeamData = {
    teamId: 200,
    result: matchData.info.teams[1].win ? "win" : "loss",
    kills: 0,
    deaths: 0,
    assists: 0,
    participants: []
  };

  const updateTeam = (team: TeamData, participant: any) => {
    team.kills += participant.kills;
    team.deaths += participant.deaths;
    team.assists += participant.assists;
    const data = createParticipantData(participant, matchData.info.gameDuration);
    team.participants.push(data);
  };

  matchData.info.participants.forEach(participant => {
    if (participant.teamId === 100) {
      updateTeam(blueTeam, participant);
    } else {
      updateTeam(redTeam, participant);
    }
  });

  const playerInfo: ParticipantData = createParticipantData(player, matchData.info.gameDuration);

  const result: MatchExtraData = {
    matchInfo,
    playerInfo,
    blueTeam,
    redTeam,
  };

  return result;
}

function createParticipantData(player: any, duration: number): ParticipantData {
  const stats: ParticipantStats = {
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    takedowns: player.challenges.takedowns,
    kda: player.challenges.kda,
    killParticipation: player.challenges.killParticipation,
    damageDealt: player.totalDamageDealtToChampions,
    damagePerMinute: player.challenges.damagePerMinute,
    teamDamagePercentage: player.challenges.teamDamagePercentage,
    damageReceived: player.totalDamageTaken,
    healingAndShieldingReceived: player.totalHeal,
    totalHeal: player.totalHeal,
    totalHealsOnTeammates: player.totalHealsOnTeammates,
    goldEarned: player.goldEarned,
    goldPerMinute: player.challenges.goldPerMinute,
    csTotal: player.totalMinionsKilled,
    csPerMinute: player.totalMinionsKilled / (duration / 60000),
  };

  const specialKills: SpecialKills = {
    soloKills: player.challenges.soloKills,
    doubleKills: player.doubleKills,
    tripleKills: player.tripleKills,
    quadraKills: player.quadraKills,
    pentaKills: player.pentaKills,
  };

  const items: Itens = {
    item0: player.item0,
    item1: player.item1,
    item2: player.item2,
    item3: player.item3,
    item4: player.item4,
    item5: player.item5,
    item6: player.item6,
  }

  const runes: Runes = {
    primaryTree: {
      type: player.perks.styles[0].style,
      keystone: player.perks.styles[0].selections[0].perk,
      rune1: player.perks.styles[0].selections[1].perk,
      rune2: player.perks.styles[0].selections[2].perk,
      rune3: player.perks.styles[0].selections[3].perk,
    },
    secondaryTree: {
      type: player.perks.styles[1].style,
      rune1: player.perks.styles[1].selections[0].perk,
      rune2: player.perks.styles[1].selections[1].perk,
    },
    shards: {
      defense: player.perks.statPerks.defense,
      flex: player.perks.statPerks.flex,
      offense: player.perks.statPerks.offense,
    },
  };

  const summonerSpells = {
    slot1: player.summoner1Id,
    slot2: player.summoner2Id,
  };

  const playerData: ParticipantData = {
    team: player.teamId,
    champion: player.championName,
    summonerName: player.riotIdGameName,
    summonerTagline: player.riotIdTagline,
    puuid: player.puuid,
    role: player.teamPosition,
    participantId: player.participantId,
    stats,
    specialKills,
    items,
    runes,
    summonerSpells,
  };

  return playerData;
}
