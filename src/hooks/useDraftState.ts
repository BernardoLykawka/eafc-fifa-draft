import { useState, useCallback } from 'react';
import type { Player, Team } from '../types';
import {
  getSnakeDraftTeamIndex,
  getCurrentPickNumber,
  getTotalPicks,
  getNextDraftPosition,
} from '../services/draftEngine';
import { initializeField } from '../services/lineupService';

interface UseDraftStateResult {
  draftActive: boolean;
  currentRound: number;
  currentTeam: number;
  teams: Team[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  setTeams: (teams: Team[]) => void;
  initializeDraft: (numTeams: number, teamNames: string[]) => void;
  pickPlayer: (
    player: Player,
    availablePlayers: Player[],
    playersPerTeam: number,
    numTeams: number
  ) => {
    updatedTeams: Team[];
    updatedAvailable: Player[];
    isComplete: boolean;
  };
  resetDraft: () => void;
  restoreDraft: (
    teams: Team[],
    round: number,
    team: number,
    active: boolean
  ) => void;
  getCurrentTeamIndex: (numTeams: number) => number;
  getCurrentTeamName: (numTeams: number) => string;
  getCurrentPickNumber: (numTeams: number) => number;
  getTotalPicks: (numTeams: number, playersPerTeam: number) => number;
}

export const useDraftState = (): UseDraftStateResult => {
  const [draftActive, setDraftActive] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentTeam, setCurrentTeam] = useState<number>(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const initializeDraft = useCallback((numTeams: number, teamNames: string[]) => {
    const newTeams: Team[] = teamNames.map((name, idx) => ({
      name: name || `Team ${idx + 1}`,
      players: [] as Player[],
      lineup: {
        bench: [] as Player[],
        field: initializeField(),
      },
    }));

    const shuffledTeams = [...newTeams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
    }

    setTeams(shuffledTeams);
    setCurrentRound(1);
    setCurrentTeam(0);
    setDraftActive(true);
    setSelectedPlayer(null);
  }, []);

  const pickPlayer = useCallback(
    (
      player: Player,
      availablePlayers: Player[],
      playersPerTeam: number,
      numTeams: number
    ) => {
      const teamIdx = getSnakeDraftTeamIndex(currentRound, currentTeam, numTeams);

      const updatedTeams = [...teams];
      updatedTeams[teamIdx].players.push(player);
      updatedTeams[teamIdx].lineup.bench.push(player);

      const updatedAvailable = availablePlayers.filter(
        (p) => p.player_id !== player.player_id
      );
      
      const { nextRound, nextTeam, isComplete } = getNextDraftPosition(
        currentRound,
        currentTeam,
        numTeams,
        playersPerTeam
      );

      if (!isComplete) {
        setCurrentRound(nextRound);
        setCurrentTeam(nextTeam);
        setTeams(updatedTeams);
      } else {
        setDraftActive(false);
        setTeams(updatedTeams);
      }

      setSelectedPlayer(null);

      return { updatedTeams, updatedAvailable, isComplete };
    },
    [currentRound, currentTeam, teams]
  );

  const resetDraft = useCallback(() => {
    setDraftActive(false);
    setCurrentRound(1);
    setCurrentTeam(0);
    setSelectedPlayer(null);
    setTeams([]);
  }, []);

  const restoreDraft = useCallback(
    (teams: Team[], round: number, team: number, active: boolean) => {
      setTeams(teams);
      setCurrentRound(round);
      setCurrentTeam(team);
      setDraftActive(active);
    },
    []
  );

  const getCurrentTeamIndex = useCallback(
    (numTeams: number) => {
      return getSnakeDraftTeamIndex(currentRound, currentTeam, numTeams);
    },
    [currentRound, currentTeam]
  );

  const getCurrentTeamName = useCallback(
    (numTeams: number) => {
      const idx = getCurrentTeamIndex(numTeams);
      return teams[idx]?.name || `Time ${idx + 1}`;
    },
    [teams, currentRound, currentTeam]
  );

  const getCurrentPick = useCallback(
    (numTeams: number) => {
      return getCurrentPickNumber(currentRound, currentTeam, numTeams);
    },
    [currentRound, currentTeam]
  );

  const getTotalPicksCount = useCallback(
    (numTeams: number, playersPerTeam: number) => {
      return getTotalPicks(numTeams, playersPerTeam);
    },
    []
  );

  return {
    draftActive,
    currentRound,
    currentTeam,
    teams,
    selectedPlayer,
    setSelectedPlayer,
    setTeams,
    initializeDraft,
    pickPlayer,
    resetDraft,
    restoreDraft,
    getCurrentTeamIndex,
    getCurrentTeamName,
    getCurrentPickNumber: getCurrentPick,
    getTotalPicks: getTotalPicksCount,
  };
};
