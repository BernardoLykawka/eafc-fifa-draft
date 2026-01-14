import React from 'react';
import type { Player } from '../../../types';
import styles from './PlayerRow.module.css';

interface PlayerRowProps {
  player: Player;
  isSelected: boolean;
  onClick: (player: Player) => void;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, isSelected, onClick }) => {
  return (
    <tr
      className={isSelected ? styles.selected : styles.row}
      onClick={() => onClick(player)}
    >
      <td>{player.short_name}</td>
      <td className={styles.center}>{player.player_positions}</td>
      <td className={styles.center}>{player.overall}</td>
      <td className={styles.center}>{player.age}</td>
      <td className={styles.center}>{player.height_cm}</td>
      <td>{player.club_name}</td>
      <td>{player.nationality_name}</td>
      <td className={styles.center}>{player.preferred_foot}</td>
      <td className={styles.center}>{player.skill_moves}</td>
    </tr>
  );
};

export default React.memo(PlayerRow);
