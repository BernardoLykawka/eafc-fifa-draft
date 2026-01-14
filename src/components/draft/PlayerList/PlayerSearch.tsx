import React from 'react';
import { Input } from '../../common';
import styles from './PlayerSearch.module.css';

interface PlayerSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className={styles.container}>
      <Input
        label="Buscar:"
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Nome do jogador..."
      />
    </div>
  );
};

export default PlayerSearch;
