import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Player } from '../types';

interface UsePlayerDataResult {
  allPlayers: Player[];
  availablePlayers: Player[];
  filteredPlayers: Player[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAvailablePlayers: (players: Player[]) => void;
  loadPlayers: (version: string) => Promise<void>;
}

export const usePlayerData = (
  initialVersion: string,
  draftActive: boolean
): UsePlayerDataResult => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadPlayers = useCallback(
    async (selectedVersion: string) => {
      try {
        const players = await window.electronAPI.loadCSV(selectedVersion);
        setAllPlayers(players);
        if (!draftActive) {
          setAvailablePlayers(players);
        }
      } catch (error) {
        console.error('Error loading players:', error);
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error loading CSV';
        alert(`Error loading players: ${errorMsg}`);
      }
    },
    [draftActive]
  );

  // Filter players by search term (memoized to avoid re-filtering on every render)
  const filteredPlayers = useMemo(() => {
    const source = draftActive ? availablePlayers : allPlayers;
    const term = searchTerm.toLowerCase();
    
    let filtered = source;
    if (term) {
      filtered = source.filter((p) => p.short_name.toLowerCase().includes(term));
    }
    
    // Limit to 1000 players for performance (prevents rendering 228k DOM nodes)
    return filtered.slice(0, 1000);
  }, [draftActive, availablePlayers, allPlayers, searchTerm]);

  return {
    allPlayers,
    availablePlayers,
    filteredPlayers,
    searchTerm,
    setSearchTerm,
    setAvailablePlayers,
    loadPlayers,
  };
};
