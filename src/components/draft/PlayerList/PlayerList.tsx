import React from 'react';
import type { Player } from '../../../types';
import { Button } from '../../common';
import { useI18n } from '../../../i18n-context';
import PlayerSearch from './PlayerSearch';
import PlayerTable from './PlayerTable';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  players: Player[];
  totalPlayers: number;
  selectedPlayer: Player | null;
  searchTerm: string;
  positionFilter: string;
  draftActive: boolean;
  isLoadingPlayers: boolean;
  canLoadMorePlayers: boolean;
  onSearchChange: (term: string) => void;
  onPositionChange: (position: string) => void;
  onPlayerSelect: (player: Player) => void;
  onLoadMorePlayers: () => void;
  onPickPlayer: () => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  totalPlayers,
  selectedPlayer,
  searchTerm,
  positionFilter,
  draftActive,
  isLoadingPlayers,
  canLoadMorePlayers,
  onSearchChange,
  onPositionChange,
  onPlayerSelect,
  onLoadMorePlayers,
  onPickPlayer,
}) => {
  const { t } = useI18n();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>{t('players')}</span>
          <h3 className={styles.title}>{t('pickNextPlayer')}</h3>
        </div>
        <strong className={styles.count}>
          {players.length}/{totalPlayers}
        </strong>
      </div>

      <PlayerSearch
        searchTerm={searchTerm}
        positionFilter={positionFilter}
        onSearchChange={onSearchChange}
        onPositionChange={onPositionChange}
      />

      <PlayerTable
        players={players}
        selectedPlayer={selectedPlayer}
        isLoadingPlayers={isLoadingPlayers}
        canLoadMorePlayers={canLoadMorePlayers}
        onPlayerSelect={onPlayerSelect}
        onLoadMorePlayers={onLoadMorePlayers}
      />

      <Button
        variant="action"
        onClick={onPickPlayer}
        disabled={!draftActive || !selectedPlayer}
      >
        {t('pickPlayer')}
      </Button>
    </div>
  );
};

export default PlayerList;
