import React, { useState } from 'react';
import { Modal, Button } from '../common';
import styles from './TeamNamesModal.module.css';

interface TeamNamesModalProps {
  numTeams: number;
  isOpen: boolean;
  onSubmit: (names: string[]) => void;
  onCancel: () => void;
}

const TeamNamesModal: React.FC<TeamNamesModalProps> = ({
  numTeams,
  isOpen,
  onSubmit,
  onCancel,
}) => {
  const [names, setNames] = useState<string[]>(
    Array.from({ length: numTeams }, () => '')
  );

  const handleSubmit = () => {
    onSubmit(names);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Team Names">
      <p className={styles.description}>
        Enter the name for each team (leave blank to use default)
      </p>
      <div className={styles.inputs}>
        {Array.from({ length: numTeams }).map((_, idx) => (
          <div key={idx} className={styles.inputRow}>
            <label className={styles.label}>Team {idx + 1}:</label>
            <input
              type="text"
              value={names[idx]}
              onChange={(e) => {
                const newNames = [...names];
                newNames[idx] = e.target.value;
                setNames(newNames);
              }}
              placeholder={`Team ${idx + 1}`}
              autoFocus={idx === 0}
              className={styles.input}
            />
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={handleSubmit}>
          Confirm
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default TeamNamesModal;
