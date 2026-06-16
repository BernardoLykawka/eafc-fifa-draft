import React from 'react';
import type { Player } from '../../../types';
import PlayerRow from './PlayerRow';
import styles from './PlayerTable.module.css';
import { useI18n } from '../../../i18n-context';

interface PlayerTableProps {
  players: Player[];
  selectedPlayer: Player | null;
  isLoadingPlayers: boolean;
  canLoadMorePlayers: boolean;
  onPlayerSelect: (player: Player) => void;
  onLoadMorePlayers: () => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  selectedPlayer,
  isLoadingPlayers,
  canLoadMorePlayers,
  onPlayerSelect,
  onLoadMorePlayers,
}) => {
  const { t } = useI18n();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!canLoadMorePlayers) return;

    const target = event.currentTarget;
    const distanceFromBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    if (distanceFromBottom < 360) {
      onLoadMorePlayers();
    }
  };

  return (
    <div className={styles.container} onScroll={handleScroll}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>{t('name')}</th>
            <th>{t('positions')}</th>
            <th>OVR</th>
            <th>{t('age')}</th>
            <th>{t('heightCm')}</th>
            <th>{t('club')}</th>
            <th>{t('nationality')}</th>
            <th>{t('preferredFoot')}</th>
            <th>{t('skillMoves')}</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <PlayerRow
              key={player.player_id}
              player={player}
              isSelected={selectedPlayer?.player_id === player.player_id}
              onClick={onPlayerSelect}
            />
          ))}
        </tbody>
      </table>

      {isLoadingPlayers && (
        <div className={styles.loadingMore}>{t('loadingPlayers')}</div>
      )}
    </div>
  );
};

export default React.memo(PlayerTable);
