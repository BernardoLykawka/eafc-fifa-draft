import React from 'react';
import type { Player } from '../../../types';
import PlayerRow from './PlayerRow';
import styles from './PlayerTable.module.css';

interface PlayerTableProps {
  players: Player[];
  selectedPlayer: Player | null;
  onPlayerSelect: (player: Player) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  selectedPlayer,
  onPlayerSelect,
}) => {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Name</th>
            <th>Positions</th>
            <th>OVR</th>
            <th>Age</th>
            <th>Height cm</th>
            <th>Club</th>
            <th>Nationality</th>
            <th>Preferred Foot</th>
            <th>Skill Moves</th>
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
    </div>
  );
};

export default React.memo(PlayerTable);
