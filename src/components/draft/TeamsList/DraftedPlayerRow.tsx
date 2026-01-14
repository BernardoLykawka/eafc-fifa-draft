import React from 'react';
import type { Player } from '../../../types';
import styles from './DraftedPlayerRow.module.css';

interface DraftedPlayerRowProps {
  teamName: string;
  pickNumber: number;
  player: Player;
  teamIndex: number;
}

const DraftedPlayerRow: React.FC<DraftedPlayerRowProps> = ({
  teamName,
  pickNumber,
  player,
  teamIndex,
}) => {
  return (
    <tr className={styles[`team${teamIndex % 4}` as keyof typeof styles]}>
      <td>{teamName}</td>
      <td className={styles.center}>{pickNumber}</td>
      <td className={styles.center}>{player.player_positions}</td>
      <td>{player.short_name}</td>
      <td>{player.club_name}</td>
      <td className={styles.center}>{player.overall}</td>
    </tr>
  );
};

export default DraftedPlayerRow;
