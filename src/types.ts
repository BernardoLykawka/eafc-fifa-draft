export interface Player {
  player_id: string;
  fifa_version: string;
  fifa_update: string;
  short_name: string;
  long_name: string;
  player_positions: string;
  overall: number;
  potential: number;
  age: number;
  height_cm: number;
  club_name: string;
  nationality_name: string;
  preferred_foot: string;
  skill_moves: number;
}

export interface Team {
  name: string;
  formation?: string;
  players: Player[];
  lineup: TeamLineup;
}

export interface FieldSlot {
  x: number;
  y: number; 
  player: Player | null;
}

export interface TeamLineup {
  bench: Player[];
  field: FieldSlot[];
}

export type DraftMode = 'classic' | 'formation';

export interface DraftState {
  draftName: string;
  version: string;
  numTeams: number;
  playersPerTeam: number;
  currentRound: number;
  currentTeam: number;
  draftActive: boolean;
  teams: Team[];
  availablePlayers: Player[];
  allPlayers: Player[];
  tournament?: SavedTournamentState;
  mode?: DraftMode;
  benchSize?: number;
  pickOptions?: Record<number, Player[]>;
  pickSlot?: number | null;
  pickBenchPosition?: string | null;
}

export type TournamentFormat =
  | 'knockout'
  | 'groupsAndKnockout'
  | 'league';

export interface TournamentSettings {
  format: TournamentFormat;
  groupOrLeagueRoundTrip: boolean;
  knockoutRoundTrip: boolean;
  trackScorers: boolean;
}

export interface TournamentMatch {
  id: string;
  stage: string;
  round?: number;
  leg?: 1 | 2;
  homeLabel: string;
  awayLabel: string;
  homeTeamIndex: number | null;
  awayTeamIndex: number | null;
  isBye: boolean;
  homeScore: string;
  awayScore: string;
  homeScorers: string[];
  awayScorers: string[];
}

export interface SavedTournamentState {
  settings: TournamentSettings;
  matches: TournamentMatch[];
  finished: boolean;
}

export interface ElectronAPI {
  loadCSV: (version: string | null) => Promise<Player[]>;
  saveDraft: (state: DraftState) => Promise<void>;
  loadDraft: () => Promise<DraftState | null>;
  clearDraft: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
