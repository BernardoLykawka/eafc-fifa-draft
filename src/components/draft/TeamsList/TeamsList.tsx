import React from 'react';
import type { Team } from '../../../types';
import TeamsStatsPanel from './TeamsStatsPanel';
import DraftedPlayersTable from './DraftedPlayersTable';
import styles from './TeamsList.module.css';

interface TeamsListProps {
  teams: Team[];
}

const TeamsList: React.FC<TeamsListProps> = ({ teams }) => {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Drafted Teams</h3>

      <TeamsStatsPanel teams={teams} />

      <DraftedPlayersTable teams={teams} />
    </div>
  );
};

export default TeamsList;
