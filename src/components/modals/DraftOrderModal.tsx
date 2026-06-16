import React from 'react';
import type { Team } from '../../types';
import { Button, Modal } from '../common';
import styles from './DraftOrderModal.module.css';
import { useI18n } from '../../i18n-context';

interface DraftOrderModalProps {
  isOpen: boolean;
  teams: Team[];
  onContinue: () => void;
}

const DraftOrderModal: React.FC<DraftOrderModalProps> = ({
  isOpen,
  teams,
  onContinue,
}) => {
  const { t } = useI18n();

  return (
    <Modal isOpen={isOpen} onClose={onContinue} title={t('draftOrder')}>
      <p className={styles.description}>
        {t('draftOrderDescription')}
      </p>

      <ol className={styles.orderList}>
        {teams.map((team, index) => (
          <li key={`${team.name}-${index}`} className={styles.orderItem}>
            <span className={styles.pickNumber}>{index + 1}</span>
            <strong>{team.name}</strong>
            <span>{t('roundOnePick')}</span>
          </li>
        ))}
      </ol>

      <div className={styles.footer}>
        <Button variant="primary" onClick={onContinue}>
          {t('startPicking')}
        </Button>
      </div>
    </Modal>
  );
};

export default DraftOrderModal;
