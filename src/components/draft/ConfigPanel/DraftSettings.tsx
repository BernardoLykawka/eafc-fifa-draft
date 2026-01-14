import React from 'react';
import { Select, Input } from '../../common';
import styles from './DraftSettings.module.css';

interface DraftSettingsProps {
  version: string;
  versions: string[];
  numTeams: number;
  playersPerTeam: number;
  disabled: boolean;
  onVersionChange: (version: string) => void;
  onNumTeamsChange: (num: number) => void;
  onPlayersPerTeamChange: (num: number) => void;
}

const DraftSettings: React.FC<DraftSettingsProps> = ({
  version,
  versions,
  numTeams,
  playersPerTeam,
  disabled,
  onVersionChange,
  onNumTeamsChange,
  onPlayersPerTeamChange,
}) => {
  return (
    <div className={styles.container}>
      <Select
        label="Versão:"
        value={version}
        onChange={(e) => onVersionChange(e.target.value)}
        disabled={disabled}
        options={versions.map((v) => ({ value: v, label: v }))}
      />

      <Input
        label="Times:"
        type="number"
        value={numTeams}
        onChange={(e) => onNumTeamsChange(Number(e.target.value))}
        min={2}
        max={10}
        disabled={disabled}
      />

      <Input
        label="Jogadores por time:"
        type="number"
        value={playersPerTeam}
        onChange={(e) => onPlayersPerTeamChange(Number(e.target.value))}
        min={1}
        max={23}
        disabled={disabled}
      />
    </div>
  );
};

export default DraftSettings;
