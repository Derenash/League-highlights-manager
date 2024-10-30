import { HighlightKills, Team, Kill, ProcessedKill } from "../../types";

export function getKills(kills: Kill[], startTime: number, endTime: number): Kill[] {
  return kills.filter((kill) => kill.timestamp >= startTime && kill.timestamp <= endTime);
}

export function getKillStats(kills: Kill[], endTime: number, func: (kill: Kill) => number): number {
  return kills.reduce((total, kill) => kill.timestamp <= endTime ? total + func(kill) : total, 0);
}

export function processKills(kills: Kill[], startTime: number, team: Team): HighlightKills {
  const alliedParticipants: number[] = [];
  const enemyParticipants: number[] = [];
  const tags: string[] = [];
  const processedKills: ProcessedKill[] = [];
  const isAllied = (id: number) => (id < 6) === (team === "blue");

  kills.forEach((kill) => {
    if (kill.participation !== "none") {
      const replayTimestamp = kill.timestamp - startTime;
      processedKills.push({ ...kill, replayTimestamp });

      if (isAllied(kill.killerId)) {
        alliedParticipants.push(...kill.participants.filter((id) => isAllied(id)));
        enemyParticipants.push(...kill.participants.filter((id) => !isAllied(id)));
      } else {
        alliedParticipants.push(...kill.participants.filter((id) => !isAllied(id)));
        enemyParticipants.push(...kill.participants.filter((id) => isAllied(id)));
      }

      if (kill.participation === "kill") {
        tags.push("Kill");
        if (kill.assists.length === 0) {
          tags.push("Solo kill");
        }
        switch (kill.multiKill) {
          case 2:
            tags.push("Double kill");
            break;
          case 3:
            tags.push("Triple kill");
            break;
          case 4:
            tags.push("Quadra kill");
            break;
          case 5:
            tags.push("Penta kill");
            break;
        }
      } else if (kill.participation === "assist") {
        tags.push("Assist");
      } else if (kill.participation === "death") {
        tags.push("Death");
      }
    }
  });

  return {
    alliedParticipants: [...new Set(alliedParticipants)],
    enemyParticipants: [...new Set(enemyParticipants)],
    tags: [...new Set(tags)],
    kills: processedKills,
  };
}