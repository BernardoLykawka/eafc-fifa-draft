import React from 'react';
import { Button } from '../../common';
import DraftSettings from './DraftSettings';
import DraftStatus from './DraftStatus';
import DraftActions from './DraftActions';
import styles from './ConfigPanel.module.css';

interface ConfigPanelProps {
  version: string;
  versions: string[];
  numTeams: number;
  playersPerTeam: number;
  playersCount: number;
  draftActive: boolean;
  currentRound: number;
  currentTeamName: string;
  currentPick: number;
  totalPicks: number;
  onVersionChange: (version: string) => void;
  onNumTeamsChange: (num: number) => void;
  onPlayersPerTeamChange: (num: number) => void;
  onStartDraft: () => void;
  onReset: () => void;
  onOpenTeamViewer: () => void;
  canOpenTeamViewer: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span className={styles.count}>Total: {props.playersCount} jogadores</span>
        <Button variant="secondary" onClick={props.onReset}>
          Reset
        </Button>
      </div>

      <div className={styles.row}>
        <DraftSettings
          version={props.version}
          versions={props.versions}
          numTeams={props.numTeams}
          playersPerTeam={props.playersPerTeam}
          disabled={props.draftActive}
          onVersionChange={props.onVersionChange}
          onNumTeamsChange={props.onNumTeamsChange}
          onPlayersPerTeamChange={props.onPlayersPerTeamChange}
        />

        <DraftActions
          draftActive={props.draftActive}
          canOpenTeamViewer={props.canOpenTeamViewer}
          onStartDraft={props.onStartDraft}
          onReset={props.onReset}
          onOpenTeamViewer={props.onOpenTeamViewer}
        />
      </div>

      <div className={styles.row}>
        <DraftStatus
          draftActive={props.draftActive}
          currentRound={props.currentRound}
          currentTeamName={props.currentTeamName}
          currentPick={props.currentPick}
          totalPicks={props.totalPicks}
        />
      </div>
    </div>
  );
};

export default ConfigPanel;
