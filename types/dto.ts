export interface CreatePlayerDTO {
    username: string;
    avatar: number;
    language: string;
    playerId?: string | null;
}

// DTO means Data Transfer object.