import React from 'react';
import type { Team } from '../../../types';
import DraftedPlayerRow from './DraftedPlayerRow';
import styles from './DraftedPlayersTable.module.css';

interface DraftedPlayersTableProps {
  teams: Team[];
}

const DraftedPlayersTable: React.FC<DraftedPlayersTableProps> = ({ teams }) => {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>Time</th>
            <th>Pick</th>
            <th>Pos</th>
            <th>Nome</th>
            <th>Clube</th>
            <th>OVR</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, teamIdx) =>
            team.players.map((player, pickIdx) => (
              <DraftedPlayerRow
                key={`${teamIdx}-${player.player_id}`}
                teamName={team.name}
                pickNumber={pickIdx + 1}
                player={player}
                teamIndex={teamIdx}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DraftedPlayersTable;
