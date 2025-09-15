// Each caption submitted by a user
export interface Caption {
  id: string;           // Unique ID
  text: string;         // Caption text
  votes: number;        // Vote count
  userId: string;       // Who submitted it
}

// Phase of the round
export type Phase = 'submission' | 'voting' | 'results';

// Each meme round
export interface Round {
  id: string;           // Unique round ID
  memeUrl: string;      // Meme image URL
  captions: Caption[];  // List of captions
  status: Phase;        // Current phase
  winner?: Caption;     // Winner caption (optional)
  timeLeft?: number;    // Countdown seconds for UI (optional)
}

// Leaderboard entry for users
export interface LeaderboardEntry {
  userId: string;       // User ID
  wins: number;         // Total wins
}

// Full game state (optional, useful for multi-rounds)
export interface GameState {
  rounds: Round[];             // All rounds
  currentRoundIndex: number;   // Current round number
  leaderboard: LeaderboardEntry[]; // Tracks cumulative wins
}
