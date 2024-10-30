import { Itens } from "../types";
import { OWGames } from "@overwolf/overwolf-api-ts/dist";

export function itensFromList(list: number[]): Itens {
  const itens: Itens = {
    item0: list[0] || 0,
    item1: list[1] || 0,
    item2: list[2] || 0,
    item3: list[3] || 0,
    item4: list[4] || 0,
    item5: list[5] || 0,
    item6: list[6] || 0
  }
  return itens;
}

export function itensToList(itens: Itens): number[] {
  return [itens.item0, itens.item1, itens.item2, itens.item3, itens.item4, itens.item5, itens.item6];
}

export async function getCurrentGameClassId(): Promise<number | null> {
  const info = await OWGames.getRunningGameInfo();
  return (info && info.isRunning && info.classId) ? info.classId : null;
}
