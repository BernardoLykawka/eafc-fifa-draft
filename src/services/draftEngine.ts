import type { Team } from '../types';

export const getSnakeDraftTeamIndex = (
  currentRound: number,
  currentTeam: number,
  numTeams: number
): number => {
  return currentRound % 2 === 1 
    ? currentTeam 
    : numTeams - 1 - currentTeam;
};

export const getCurrentPickNumber = (
  currentRound: number,
  currentTeam: number,
  numTeams: number
): number => {
  return (currentRound - 1) * numTeams + currentTeam + 1;
};

export const getTotalPicks = (numTeams: number, playersPerTeam: number): number => {
  return numTeams * playersPerTeam;
};

export const validateDraftConfig = (
  numTeams: number,
  playersPerTeam: number,
  availablePlayers: number
): { valid: boolean; message?: string } => {
  if (numTeams < 2) {
    return { valid: false, message: 'Must have at least 2 teams' };
  }
  
  if (numTeams > 10) {
    return { valid: false, message: 'Maximum of 10 teams allowed' };
  }
  
  if (playersPerTeam < 1) {
    return { valid: false, message: 'Must have at least 1 player per team' };
  }
  
  const totalNeeded = numTeams * playersPerTeam;
  if (totalNeeded > availablePlayers) {
    return {
      valid: false,
      message: `Not enough players!\nRequired: ${totalNeeded}\nAvailable: ${availablePlayers}`,
    };
  }
  
  return { valid: true };
};

export const calculateTeamAverage = (team: Team): number => {
  if (team.players.length === 0) return 0;
  const sum = team.players.reduce((acc, p) => acc + p.overall, 0);
  return Math.round(sum / team.players.length);
};

export const isDraftComplete = (
  currentRound: number,
  playersPerTeam: number
): boolean => {
  return currentRound > playersPerTeam;
};

export const getNextDraftPosition = (
  currentRound: number,
  currentTeam: number,
  numTeams: number,
  playersPerTeam: number
): { nextRound: number; nextTeam: number; isComplete: boolean } => {
  const nextTeam = currentTeam + 1;
  
  if (nextTeam >= numTeams) {
    const nextRound = currentRound + 1;
    if (nextRound > playersPerTeam) {
      return { nextRound, nextTeam: 0, isComplete: true };
    }
    return { nextRound, nextTeam: 0, isComplete: false };
  }
  
  return { nextRound: currentRound, nextTeam, isComplete: false };
};
