import React from 'react';
import styles from './DraftStatus.module.css';

interface DraftStatusProps {
  draftActive: boolean;
  currentRound: number;
  currentTeamName: string;
  currentPick: number;
  totalPicks: number;
}

const DraftStatus: React.FC<DraftStatusProps> = ({
  draftActive,
  currentRound,
  currentTeamName,
  currentPick,
  totalPicks,
}) => {
  return (
    <span className={styles.status}>
      {draftActive
        ? `ROUND ${currentRound} - ${currentTeamName} PICKING (Pick ${currentPick}/${totalPicks})`
        : 'Draft not started'}
    </span>
  );
};

export default DraftStatus;
