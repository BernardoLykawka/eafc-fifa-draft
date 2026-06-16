import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Player, Team } from '../types';
import { initializeField } from '../services/lineupService';
import styles from './TeamViewer.module.css';
import { useI18n } from '../i18n-context';

interface TeamViewerProps {
  teams: Team[];
  onClose: () => void;
  onUpdateTeams: (teams: Team[]) => void;
}

const STARTERS_COUNT = 11;

const TeamViewer: React.FC<TeamViewerProps> = ({
  teams,
  onClose,
  onUpdateTeams,
}) => {
  const { t } = useI18n();
  const [currentTeamIdx, setCurrentTeamIdx] = useState(0);
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const [draggingSlotIndex, setDraggingSlotIndex] = useState<number | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  const currentTeam = teams[currentTeamIdx];
  const selectedBenchPlayer = useMemo(
    () =>
      currentTeam?.lineup.bench.find(
        (player) => player.player_id === selectedBenchId
      ) || null,
    [currentTeam, selectedBenchId]
  );

  useEffect(() => {
    if (!currentTeam) return;

    const hasInvalidFieldSize = currentTeam.lineup.field.length !== STARTERS_COUNT;
    const extraFieldPlayers = currentTeam.lineup.field
      .slice(STARTERS_COUNT)
      .map((slot) => slot.player)
      .filter(Boolean) as Player[];

    if (!hasInvalidFieldSize && extraFieldPlayers.length === 0) return;

    const updatedTeams = teams.map((team, index) => {
      if (index !== currentTeamIdx) return team;

      const baseField = initializeField();
      currentTeam.lineup.field.slice(0, STARTERS_COUNT).forEach((slot, slotIndex) => {
        baseField[slotIndex].player = slot.player;
      });

      const benchIds = new Set(currentTeam.lineup.bench.map((player) => player.player_id));
      const recoveredPlayers = extraFieldPlayers.filter(
        (player) => !benchIds.has(player.player_id)
      );

      return {
        ...team,
        lineup: {
          field: baseField,
          bench: [...team.lineup.bench, ...recoveredPlayers],
        },
      };
    });

    onUpdateTeams(updatedTeams);
  }, [currentTeam, currentTeamIdx, onUpdateTeams, teams]);

  useEffect(() => {
    setSelectedBenchId(null);
  }, [currentTeamIdx]);

  if (!currentTeam) return null;

  const starters = currentTeam.lineup.field.filter((slot) => slot.player).length;
  const bench = currentTeam.lineup.bench;

  const updateCurrentTeam = (updater: (team: Team) => Team) => {
    onUpdateTeams(
      teams.map((team, index) => (index === currentTeamIdx ? updater(team) : team))
    );
  };

  const getPitchPoint = (event: React.PointerEvent<HTMLElement>) => {
    const pitch = pitchRef.current;
    if (!pitch) return null;

    const rect = pitch.getBoundingClientRect();
    return {
      x: Math.max(0.04, Math.min(0.96, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0.05, Math.min(0.95, (event.clientY - rect.top) / rect.height)),
    };
  };

  const handleBenchClick = (player: Player) => {
    setSelectedBenchId((currentId) =>
      currentId === player.player_id ? null : player.player_id
    );
  };

  const handlePitchClick = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedBenchPlayer || event.target !== event.currentTarget) return;

    const point = getPitchPoint(event);
    if (!point) return;

    if (starters >= STARTERS_COUNT) {
      alert(t('maxStartersAlert'));
      return;
    }

    updateCurrentTeam((team) => {
      const field = team.lineup.field.map((fieldSlot) => ({ ...fieldSlot }));
      const emptySlotIndex = field.findIndex((slot) => !slot.player);
      const nextSlot = {
        x: point.x,
        y: point.y,
        player: selectedBenchPlayer,
      };

      field[emptySlotIndex] = nextSlot;

      return {
        ...team,
        lineup: {
          field,
          bench: team.lineup.bench.filter(
            (player) => player.player_id !== selectedBenchPlayer.player_id
          ),
        },
      };
    });

    setSelectedBenchId(null);
  };

  const handlePlayerPointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    slotIndex: number
  ) => {
    event.stopPropagation();
    setDraggingSlotIndex(slotIndex);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePlayerPointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    slotIndex: number
  ) => {
    if (draggingSlotIndex !== slotIndex) return;

    const point = getPitchPoint(event);
    if (!point) return;

    updateCurrentTeam((team) => ({
      ...team,
      lineup: {
        ...team.lineup,
        field: team.lineup.field.map((slot, index) =>
          index === slotIndex ? { ...slot, x: point.x, y: point.y } : slot
        ),
      },
    }));
  };

  const handlePlayerPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setDraggingSlotIndex(null);
  };

  const handleFieldPlayerDoubleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    slotIndex: number
  ) => {
    event.stopPropagation();

    updateCurrentTeam((team) => {
      const player = team.lineup.field[slotIndex]?.player;
      if (!player) return team;

      return {
        ...team,
        lineup: {
          field: team.lineup.field.map((slot, index) =>
            index === slotIndex ? { ...slot, player: null } : slot
          ),
          bench: [...team.lineup.bench, player],
        },
      };
    });
  };

  const handleClearField = () => {
    updateCurrentTeam((team) => {
      const startersToBench = team.lineup.field
        .map((slot) => slot.player)
        .filter(Boolean) as Player[];

      return {
        ...team,
        lineup: {
          field: team.lineup.field.map((slot) => ({ ...slot, player: null })),
          bench: [...team.lineup.bench, ...startersToBench],
        },
      };
    });
    setSelectedBenchId(null);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerIntro}>
          <span className={styles.kicker}>{t('squadCenter')}</span>
          <p>{t('lineupHelp')}</p>
        </div>

        <label className={styles.teamSelect}>
          <span>{t('team')}</span>
          <select
            value={currentTeamIdx}
            onChange={(event) => setCurrentTeamIdx(Number(event.target.value))}
          >
            {teams.map((team, index) => (
              <option key={`${team.name}-${index}`} value={index}>
                {team.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.headerStats}>
          <div className={styles.summary}>
            <strong>{starters}/{STARTERS_COUNT}</strong>
          <span>{t('starters')}</span>
          </div>

          <div className={styles.summary}>
            <strong>{bench.length}</strong>
          <span>{t('bench')}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} type="button" onClick={handleClearField}>
            {t('clearPitch')}
          </button>
          <button className={styles.backButton} type="button" onClick={onClose}>
            {t('backToDraft')}
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.benchPanel}>
          <div className={styles.panelTitle}>
            <span>{t('bench')}</span>
            <strong>{bench.length}</strong>
          </div>

          <div className={styles.benchList}>
            {bench.length === 0 ? (
              <p className={styles.emptyState}>{t('allPlayersOnPitch')}</p>
            ) : (
              bench.map((player) => (
                <button
                  key={player.player_id}
                  type="button"
                  className={`${styles.benchPlayer} ${
                    selectedBenchId === player.player_id ? styles.selectedBench : ''
                  }`}
                  onClick={() => handleBenchClick(player)}
                >
                  <span>
                    <strong>{player.short_name}</strong>
                    <small>{player.player_positions} - {player.club_name}</small>
                  </span>
                  <b>{player.overall}</b>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className={styles.pitchPanel}>
          <div className={styles.pitchHeader}>
            <span>{t('startingPitch')}</span>
            {selectedBenchPlayer ? (
              <strong>{t('clickPitchToPlace')} {selectedBenchPlayer.short_name}</strong>
            ) : (
              <strong>{t('dragMoveDoubleClick')}</strong>
            )}
          </div>

          <div
            ref={pitchRef}
            className={`${styles.pitch} ${
              selectedBenchPlayer ? styles.pitchPlacing : ''
            }`}
            onPointerDown={handlePitchClick}
          >
            <div className={styles.pitchLineCenter} />
            <div className={styles.pitchCircle} />
            <div className={styles.boxTop} />
            <div className={styles.boxBottom} />

            {currentTeam.lineup.field.slice(0, STARTERS_COUNT).map((slot, index) => (
              slot.player ? (
                <button
                  key={index}
                  type="button"
                  className={`${styles.fieldSlot} ${styles.filledSlot} ${
                    draggingSlotIndex === index ? styles.draggingSlot : ''
                  }`}
                  style={{
                    left: `${slot.x * 100}%`,
                    top: `${slot.y * 100}%`,
                  }}
                  onPointerDown={(event) => handlePlayerPointerDown(event, index)}
                  onPointerMove={(event) => handlePlayerPointerMove(event, index)}
                  onPointerUp={handlePlayerPointerUp}
                  onDoubleClick={(event) => handleFieldPlayerDoubleClick(event, index)}
                >
                  <strong>{slot.player.short_name}</strong>
                  <span>{slot.player.overall}</span>
                </button>
              ) : null
            ))}
          </div>
        </main>
      </div>
    </section>
  );
};

export default TeamViewer;
