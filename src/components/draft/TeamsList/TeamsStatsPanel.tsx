import React from 'react';
import type { Team } from '../../../types';
import { calculateTeamAverage } from '../../../services/draftEngine';
import styles from './TeamsStatsPanel.module.css';

interface TeamsStatsPanelProps {
  teams: Team[];
}

const TeamsStatsPanel: React.FC<TeamsStatsPanelProps> = ({ teams }) => {
  if (teams.length === 0) return null;

  return (
    <div className={styles.container}>
      {teams.map((team, idx) => (
        <div key={idx} className={styles.stat}>
          <strong>{team.name}:</strong> {team.players.length} players
          {team.players.length > 0 && (
            <span> | Avg OVR: {calculateTeamAverage(team)}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamsStatsPanel;
