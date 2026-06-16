import React from 'react';
import { Input } from '../../common';
import styles from './PlayerSearch.module.css';
import { useI18n } from '../../../i18n-context';

const POSITION_OPTIONS = [
  { value: 'ALL', labelKey: 'all' },
  { value: 'GK', labelKey: 'GK' },
  { value: 'CB', labelKey: 'CB' },
  { value: 'LB', labelKey: 'LB' },
  { value: 'RB', labelKey: 'RB' },
  { value: 'LWB', labelKey: 'LWB' },
  { value: 'RWB', labelKey: 'RWB' },
  { value: 'CDM', labelKey: 'CDM' },
  { value: 'CM', labelKey: 'CM' },
  { value: 'CAM', labelKey: 'CAM' },
  { value: 'LM', labelKey: 'LM' },
  { value: 'RM', labelKey: 'RM' },
  { value: 'LW', labelKey: 'LW' },
  { value: 'RW', labelKey: 'RW' },
  { value: 'CF', labelKey: 'CF' },
  { value: 'ST', labelKey: 'ST' },
];

interface PlayerSearchProps {
  searchTerm: string;
  positionFilter: string;
  onSearchChange: (term: string) => void;
  onPositionChange: (position: string) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  searchTerm,
  positionFilter,
  onSearchChange,
  onPositionChange,
}) => {
  const { t } = useI18n();

  return (
    <div className={styles.container}>
      <Input
        label={t('search')}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('playerNamePlaceholder')}
      />

      <label className={styles.positionFilter}>
        <span>{t('position')}</span>
        <select
          value={positionFilter}
          onChange={(event) => onPositionChange(event.target.value)}
        >
          {POSITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value === 'ALL' ? t('all') : option.labelKey}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default PlayerSearch;
