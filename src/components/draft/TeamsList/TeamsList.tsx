import React from 'react';
import type { Team } from '../../../types';
import TeamsStatsPanel from './TeamsStatsPanel';
import DraftedPlayersTable from './DraftedPlayersTable';
import styles from './TeamsList.module.css';
import { useI18n } from '../../../i18n-context';

interface TeamsListProps {
  teams: Team[];
}

const TeamsList: React.FC<TeamsListProps> = ({ teams }) => {
  const { t } = useI18n();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>{t('squads')}</span>
          <h3 className={styles.title}>{t('draftedTeams')}</h3>
        </div>
        <strong className={styles.count}>{teams.length}</strong>
      </div>

      <TeamsStatsPanel teams={teams} />

      <DraftedPlayersTable teams={teams} />
    </div>
  );
};

export default TeamsList;
