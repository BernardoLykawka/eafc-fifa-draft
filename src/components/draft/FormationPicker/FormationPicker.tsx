import React from 'react';
import type { FieldSlot, Player } from '../../../types';
import { FORMATION_ROLES } from '../../../constants/formations';
import { Button } from '../../common';
import { useI18n } from '../../../i18n-context';
import styles from './FormationPicker.module.css';

interface FormationPickerProps {
  formation: string;
  slotIndex: number | null;
  round: number;
  totalRounds: number;
  teamName: string;
  field: FieldSlot[];
  optionsBySlot: Record<number, Player[]>;
  selectedPlayer: Player | null;
  onSlotSelect: (slotIndex: number) => void;
  onPlayerSelect: (player: Player) => void;
  benchPosition: string | null;
  finished: boolean;
  onPickPlayer: () => void;
}

const FormationPicker: React.FC<FormationPickerProps> = ({
  formation,
  slotIndex,
  round,
  totalRounds,
  teamName,
  field,
  optionsBySlot,
  selectedPlayer,
  onSlotSelect,
  onPlayerSelect,
  benchPosition,
  finished,
  onPickPlayer,
}) => {
  const { t } = useI18n();

  if (finished) {
    return (
      <div className={styles.panel}>
        <span className={styles.kicker}>{t('draftFinished')}</span>
        <h3 className={styles.title}>{t('formationDraftDone')}</h3>
      </div>
    );
  }

  const isBench = benchPosition !== null;
  const currentRole =
    slotIndex === null || isBench ? null : FORMATION_ROLES[formation][slotIndex];
  const badge = isBench ? benchPosition : currentRole?.label;
  const options = slotIndex === null ? [] : optionsBySlot[slotIndex] || [];
  const locked = slotIndex !== null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            {t('round')} {round}/{totalRounds} · {formation}
          </span>
          <h3 className={styles.title}>
            {isBench
              ? `${teamName}: ${t('reservePosition')} ${benchPosition}`
              : currentRole
              ? `${teamName}: ${t('fillPosition')} ${currentRole.label}`
              : `${teamName}: ${t('selectPosition')}`}
          </h3>
        </div>
        {badge && <strong className={styles.slotBadge}>{badge}</strong>}
      </div>

      <div className={styles.body}>
        <div className={styles.pitch} aria-label={formation}>
          {field.map((slot, index) => (
            <button
              key={index}
              type="button"
              disabled={!!slot.player || locked}
              onClick={() => onSlotSelect(index)}
              className={`${styles.dot} ${slot.player ? styles.filled : styles.open} ${
                index === slotIndex ? styles.current : ''
              }`}
              style={{ left: `${slot.x * 100}%`, top: `${slot.y * 100}%` }}
              title={slot.player?.short_name || FORMATION_ROLES[formation][index].label}
            >
              <b>{FORMATION_ROLES[formation][index].label}</b>
              {slot.player && <small>{slot.player.short_name}</small>}
            </button>
          ))}
        </div>

        <div className={styles.options}>
          <p className={styles.hint}>
            {isBench ? t('reserveHint') : locked ? t('slotLockedHint') : t('chooseSlotHint')}
          </p>
          {options.map((player) => (
            <button
              key={player.player_id}
              type="button"
              className={`${styles.card} ${
                selectedPlayer?.player_id === player.player_id ? styles.selected : ''
              }`}
              onClick={() => onPlayerSelect(player)}
            >
              <b className={styles.overall}>{player.overall}</b>
              <span className={styles.info}>
                <strong>{player.short_name}</strong>
                <small>{player.player_positions}</small>
                <small>
                  {player.club_name} · {player.nationality_name}
                </small>
              </span>
              <span className={styles.meta}>
                <small>{t('age')} {player.age}</small>
                <small>{player.preferred_foot}</small>
                <small>{player.skill_moves}★</small>
              </span>
            </button>
          ))}
          {locked && options.length === 0 && (
            <p className={styles.empty}>{t('noOptions')}</p>
          )}
        </div>
      </div>

      <Button variant="action" onClick={onPickPlayer} disabled={!selectedPlayer}>
        {t('pickPlayer')}
      </Button>
    </div>
  );
};

export default FormationPicker;
