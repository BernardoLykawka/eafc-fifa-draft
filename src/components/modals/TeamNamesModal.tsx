import React, { useEffect, useState } from 'react';
import { Modal, Button } from '../common';
import { FORMATION_NAMES } from '../../constants/formations';
import styles from './TeamNamesModal.module.css';
import { useI18n } from '../../i18n-context';

interface TeamNamesModalProps {
  numTeams: number;
  isOpen: boolean;
  chooseFormations: boolean;
  onSubmit: (names: string[], formations: string[]) => void;
  onCancel: () => void;
}

const TeamNamesModal: React.FC<TeamNamesModalProps> = ({
  numTeams,
  isOpen,
  chooseFormations,
  onSubmit,
  onCancel,
}) => {
  const { t } = useI18n();
  const [names, setNames] = useState<string[]>(
    Array.from({ length: numTeams }, () => '')
  );

  const [formations, setFormations] = useState<string[]>(
    Array.from({ length: numTeams }, () => FORMATION_NAMES[0])
  );

  useEffect(() => {
    setFormations((current) =>
      Array.from({ length: numTeams }, (_, index) => current[index] || FORMATION_NAMES[0])
    );
    setNames((currentNames) =>
      Array.from({ length: numTeams }, (_, index) => currentNames[index] || '')
    );
  }, [numTeams]);

  const handleSubmit = () => {
    onSubmit(names, formations);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={t('teamNames')}>
      <p className={styles.description}>
        {t('teamNamesDescription')}
        {chooseFormations && ` ${t('teamFormationsDescription')}`}
      </p>
      <div className={styles.inputs} onKeyDown={handleKeyDown}>
        {Array.from({ length: numTeams }).map((_, idx) => (
          <div key={idx} className={styles.inputRow}>
            <label className={styles.label}>{t('team')} {idx + 1}:</label>
            <input
              type="text"
              value={names[idx]}
              onChange={(e) => {
                const newNames = [...names];
                newNames[idx] = e.target.value;
                setNames(newNames);
              }}
              placeholder={`${t('team')} ${idx + 1}`}
              autoFocus={idx === 0}
              className={styles.input}
            />
            {chooseFormations && (
              <select
                value={formations[idx]}
                aria-label={`${t('formation')} ${t('team')} ${idx + 1}`}
                onChange={(e) => {
                  const newFormations = [...formations];
                  newFormations[idx] = e.target.value;
                  setFormations(newFormations);
                }}
                className={styles.select}
              >
                {FORMATION_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={handleSubmit}>
          {t('drawOrder')}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </Modal>
  );
};

export default TeamNamesModal;
