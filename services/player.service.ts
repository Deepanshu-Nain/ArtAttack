import { CreatePlayerDTO } from "@/types/dto";
import { createPlayer, updatePlayer, deletePlayer as deletePlayerRepo, getPlayerById } from "@/repositories/player.repository";

export async function deletePlayer(playerId: string) {
    return deletePlayerRepo(playerId);
}

export async function registerPlayer(
    data: CreatePlayerDTO
){

    if(data.username.trim().length < 3){
        throw new Error(
            "Username must contain at least 3 characters."
        );
    }

    if (data.playerId) {
        const existingPlayer = await getPlayerById(data.playerId);
        if (existingPlayer) {
            return updatePlayer(data.playerId, {
                username: data.username,
                language: data.language,
                avatar: data.avatar,
            });
        }
    }

    return createPlayer(data);
}

export async function assignPlayerToRoom(
    playerId: string,
    roomId: string,
    isHost: boolean = false
) {
    return updatePlayer(playerId, {
        roomId,
        isHost
    });
}

export async function setPlayerReady(playerId: string, isReady: boolean) {
    return updatePlayer(playerId, {
        isReady
    });
}

export async function makePlayerHost(playerId: string) {
    return updatePlayer(playerId, {
        isHost: true
    });
}

import { incrementPlayerScore, getTopPlayers as getTopPlayersRepo } from "@/repositories/player.repository";

export async function addScore(playerId: string, amount: number) {
    return incrementPlayerScore(playerId, amount);
}

export async function getTopPlayers(limit: number = 100) {
    return getTopPlayersRepo(limit);
}