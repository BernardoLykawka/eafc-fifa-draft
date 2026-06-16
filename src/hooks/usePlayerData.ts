import { useState, useCallback, useMemo } from 'react';
import type { Player } from '../types';
import { runtimeApi } from '../services/runtimeApi';

const INITIAL_VISIBLE_PLAYERS = 1000;
const LOAD_MORE_PLAYERS_STEP = 1000;

interface UsePlayerDataResult {
  allPlayers: Player[];
  availablePlayers: Player[];
  filteredPlayers: Player[];
  totalFilteredPlayers: number;
  searchTerm: string;
  positionFilter: string;
  isLoadingPlayers: boolean;
  setSearchTerm: (term: string) => void;
  setPositionFilter: (position: string) => void;
  setAvailablePlayers: (players: Player[]) => void;
  canLoadMorePlayers: boolean;
  loadMorePlayers: () => void;
  loadPlayers: (version: string) => Promise<void>;
}

export const usePlayerData = (
  initialVersion: string,
  draftActive: boolean
): UsePlayerDataResult => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [positionFilter, setPositionFilterState] = useState<string>('ALL');
  const [isLoadingPlayers, setIsLoadingPlayers] = useState<boolean>(false);
  const [visiblePlayersCount, setVisiblePlayersCount] = useState<number>(
    INITIAL_VISIBLE_PLAYERS
  );

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    setVisiblePlayersCount(INITIAL_VISIBLE_PLAYERS);
  }, []);

  const handlePositionFilterChange = useCallback((position: string) => {
    setPositionFilterState(position);
    setVisiblePlayersCount(INITIAL_VISIBLE_PLAYERS);
  }, []);

  const loadPlayers = useCallback(
    async (selectedVersion: string) => {
      try {
        setIsLoadingPlayers(true);
        const players = await runtimeApi.loadCSV(selectedVersion);
        setAllPlayers(players);
        setVisiblePlayersCount(INITIAL_VISIBLE_PLAYERS);
        if (!draftActive) {
          setAvailablePlayers(players);
        }
      } catch (error) {
        console.error('Error loading players:', error);
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error loading CSV';
        alert(`Error loading players: ${errorMsg}`);
      } finally {
        setIsLoadingPlayers(false);
      }
    },
    [draftActive]
  );

  // Filter players by search term (memoized to avoid re-filtering on every render)
  const filteredSourcePlayers = useMemo(() => {
    const source = draftActive ? availablePlayers : allPlayers;
    const term = searchTerm.toLowerCase();
    
    let filtered = source;

    if (positionFilter !== 'ALL') {
      filtered = filtered.filter((player) =>
        player.player_positions
          .split(',')
          .map((position) => position.trim())
          .includes(positionFilter)
      );
    }

    if (!term) return filtered;

    return filtered.filter((p) => p.short_name.toLowerCase().includes(term));
  }, [draftActive, availablePlayers, allPlayers, searchTerm, positionFilter]);

  const filteredPlayers = useMemo(
    () => filteredSourcePlayers.slice(0, visiblePlayersCount),
    [filteredSourcePlayers, visiblePlayersCount]
  );

  const loadMorePlayers = useCallback(() => {
    setVisiblePlayersCount((currentCount) =>
      Math.min(currentCount + LOAD_MORE_PLAYERS_STEP, filteredSourcePlayers.length)
    );
  }, [filteredSourcePlayers.length]);

  return {
    allPlayers,
    availablePlayers,
    filteredPlayers,
    totalFilteredPlayers: filteredSourcePlayers.length,
    searchTerm,
    positionFilter,
    isLoadingPlayers,
    setSearchTerm: handleSearchTermChange,
    setPositionFilter: handlePositionFilterChange,
    setAvailablePlayers,
    canLoadMorePlayers: filteredPlayers.length < filteredSourcePlayers.length,
    loadMorePlayers,
    loadPlayers,
  };
};
