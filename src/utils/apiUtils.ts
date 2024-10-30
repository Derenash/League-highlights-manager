import axios from "axios";
import { apiKey } from "../constants/consts";

export async function getFromLeagueAPI(url: string): Promise<any> {
  const headers = {
    'X-Riot-Token': apiKey,
  };
  return sendGetRequest(url, headers);
}

export async function sendGetRequest(url: string, headers: any): Promise<any> {
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }
}