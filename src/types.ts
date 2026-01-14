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

export interface DraftState {
  version: string;
  numTeams: number;
  playersPerTeam: number;
  currentRound: number;
  currentTeam: number;
  draftActive: boolean;
  teams: Team[];
  availablePlayers: Player[];
  allPlayers: Player[];
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
