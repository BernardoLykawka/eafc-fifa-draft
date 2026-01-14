import React from 'react';
import { Button } from '../../common';
import styles from './DraftActions.module.css';

interface DraftActionsProps {
  draftActive: boolean;
  canOpenTeamViewer: boolean;
  onStartDraft: () => void;
  onReset: () => void;
  onOpenTeamViewer: () => void;
}

const DraftActions: React.FC<DraftActionsProps> = ({
  draftActive,
  canOpenTeamViewer,
  onStartDraft,
  onReset,
  onOpenTeamViewer,
}) => {
  return (
    <div className={styles.container}>
      <Button variant="primary" onClick={onStartDraft} disabled={draftActive}>
        {draftActive ? 'Draft in Progress' : 'Start Draft'}
      </Button>
      
      <Button variant="secondary" onClick={onOpenTeamViewer} disabled={!canOpenTeamViewer}>
        View Teams / Lineup
      </Button>
    </div>
  );
};

export default DraftActions;
