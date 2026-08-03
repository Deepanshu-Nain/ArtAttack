export interface Player {
  id: string;

  username: string;

  avatar: number;

  language: string;

  score: number;

  roomId: string | null;

  isHost: boolean;

  isDrawing: boolean;

  connected: boolean;

  isReady: boolean;

  // UI-derived: true when this player is the current drawer of the round.
  isDrawer?: boolean;
}

//We'll mostly use interfaces for objects because they are easy to extend later.  we will not use types

export interface Room {

    id:string;

    code: string;

    players:Player[];

    currentRound:number;

    maxRounds:number;

    maxPlayers:number;

    currentDrawerId:string | null;

    currentWord:string | null;

    wordChoices: string[];

    started:boolean;

    roundEndsAt: string | null;

    createdAt: string;

}
