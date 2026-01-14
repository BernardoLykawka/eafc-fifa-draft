import React from 'react';
import type { Player } from '../../../types';
import { Button } from '../../common';
import PlayerSearch from './PlayerSearch';
import PlayerTable from './PlayerTable';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  players: Player[];
  selectedPlayer: Player | null;
  searchTerm: string;
  draftActive: boolean;
  onSearchChange: (term: string) => void;
  onPlayerSelect: (player: Player) => void;
  onPickPlayer: () => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  selectedPlayer,
  searchTerm,
  draftActive,
  onSearchChange,
  onPlayerSelect,
  onPickPlayer,
}) => {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Available Players (click to select)</h3>

      <PlayerSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <PlayerTable
        players={players}
        selectedPlayer={selectedPlayer}
        onPlayerSelect={onPlayerSelect}
      />

      <Button
        variant="action"
        onClick={onPickPlayer}
        disabled={!draftActive || !selectedPlayer}
      >
        PICK PLAYER
      </Button>
    </div>
  );
};

export default PlayerList;
