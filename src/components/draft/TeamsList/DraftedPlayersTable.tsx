import React from 'react';
import type { Team } from '../../../types';
import DraftedPlayerRow from './DraftedPlayerRow';
import styles from './DraftedPlayersTable.module.css';
import { useI18n } from '../../../i18n-context';

interface DraftedPlayersTableProps {
  teams: Team[];
}

const DraftedPlayersTable: React.FC<DraftedPlayersTableProps> = ({ teams }) => {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th>{t('team')}</th>
            <th>{t('pick')}</th>
            <th>Pos</th>
            <th>{t('name')}</th>
            <th>{t('club')}</th>
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
