import React, { useState, useEffect } from 'react';
import type { Player, DraftState, SavedTournamentState } from './types';
import { DEFAULT_VERSION } from './constants/versions';
import {
  getNextDraftPosition,
  getSnakeDraftTeamIndex,
  validateDraftConfig,
} from './services/draftEngine';
import { usePlayerData, useDraftState, useDraftPersistence } from './hooks';
import PlayerList from './components/draft/PlayerList/PlayerList';
import TeamsList from './components/draft/TeamsList/TeamsList';
import TeamViewer from './components/TeamViewer';
import TeamNamesModal from './components/modals/TeamNamesModal';
import HomePage from './components/HomePage';
import { formatGameVersion } from './components/HomePage';
import DraftOrderModal from './components/modals/DraftOrderModal';
import TournamentSetup from './components/TournamentSetup';
import { useI18n } from './i18n-context';

const App: React.FC = () => {
  const { t } = useI18n();
  const [draftName, setDraftName] = useState<string>(t('friendsDraft'));
  const [version, setVersion] = useState<string>(DEFAULT_VERSION);
  const [numTeams, setNumTeams] = useState<number>(4);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(11);
  const [screen, setScreen] = useState<'home' | 'draft' | 'tournament'>('home');
  const [showTeamViewer, setShowTeamViewer] = useState<boolean>(false);
  const [showTeamNamesModal, setShowTeamNamesModal] = useState<boolean>(false);
  const [showDraftOrderModal, setShowDraftOrderModal] = useState<boolean>(false);
  const [nextPickerName, setNextPickerName] = useState<string | null>(null);
  const [tournamentState, setTournamentState] =
    useState<SavedTournamentState | null>(null);

  const draftState = useDraftState();
  const playerData = usePlayerData(version, draftState.draftActive);

  useEffect(() => {
    playerData.loadPlayers(version);
  }, [version]);

  useEffect(() => {
    if (!nextPickerName) return;

    const timeoutId = window.setTimeout(() => {
      setNextPickerName(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [nextPickerName]);

  const restoreSavedDraft = (savedState: DraftState) => {
    setDraftName(savedState.draftName || t('friendsDraft'));
    setVersion(savedState.version);
    setNumTeams(savedState.numTeams);
    setPlayersPerTeam(savedState.playersPerTeam);
    draftState.restoreDraft(
      savedState.teams,
      savedState.currentRound,
      savedState.currentTeam,
      savedState.draftActive
    );
    playerData.setAvailablePlayers(savedState.availablePlayers);
    setShowTeamViewer(false);
    setShowDraftOrderModal(false);
    setNextPickerName(null);
    setTournamentState(savedState.tournament || null);
    setScreen(savedState.draftActive ? 'draft' : 'tournament');
  };

  const { clearDraft, loadSavedDraft } = useDraftPersistence({
    draftActive: draftState.draftActive,
    draftState: {
      draftName: draftName.trim() || t('untitledDraft'),
      version,
      numTeams,
      playersPerTeam,
      currentRound: draftState.currentRound,
      currentTeam: draftState.currentTeam,
      draftActive: draftState.draftActive,
      teams: draftState.teams,
      availablePlayers: playerData.availablePlayers,
      allPlayers: playerData.allPlayers,
      tournament: tournamentState || undefined,
    },
  });

  const handleVersionChange = async (newVersion: string) => {
    if (draftState.draftActive) {
      const shouldChange = confirm(t('confirmChangeVersion'));
      if (!shouldChange) return;
      await handleReset();
    }
    setVersion(newVersion);
  };

  const handleReset = async () => {
    draftState.resetDraft();
    playerData.setSearchTerm('');
    setShowTeamViewer(false);
    setShowDraftOrderModal(false);
    setNextPickerName(null);
    setTournamentState(null);
    setScreen('home');
    await clearDraft();
    await playerData.loadPlayers(version);
  };

  const handleNewDraftClick = async () => {
    const shouldReset = confirm(
      t('confirmLeaveDraft')
    );

    if (!shouldReset) return;

    await handleReset();
  };

  const getCurrentDraftSnapshot = (): DraftState => ({
    draftName: draftName.trim() || t('untitledDraft'),
    version,
    numTeams,
    playersPerTeam,
    currentRound: draftState.currentRound,
    currentTeam: draftState.currentTeam,
    draftActive: draftState.draftActive,
    teams: draftState.teams,
    availablePlayers: playerData.availablePlayers,
    allPlayers: playerData.allPlayers,
    tournament: tournamentState || undefined,
  });

  const handleSaveDraftFile = () => {
    if (draftState.teams.length === 0) {
      alert(t('noDraftToSave'));
      return;
    }

    const snapshot = getCurrentDraftSnapshot();
    const fileContent = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = snapshot.draftName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'draft';

    link.href = url;
    link.download = `${safeName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadDraftFile = async (file: File) => {
    try {
      const fileContent = await file.text();
      const savedState = JSON.parse(fileContent) as DraftState;

      if (!savedState || !Array.isArray(savedState.teams)) {
        throw new Error('Arquivo invalido.');
      }

      restoreSavedDraft(savedState);
    } catch (error) {
      console.error('Error loading draft:', error);
      alert(t('couldNotLoadDraftFile'));
    }
  };

  const handleContinueLocalDraft = async () => {
    const savedState = await loadSavedDraft();

    if (!savedState || savedState.teams.length === 0) {
      alert(t('noLocalDraft'));
      return;
    }

    restoreSavedDraft(savedState);
  };

  const handleStartDraft = () => {
    const validation = validateDraftConfig(
      numTeams,
      playersPerTeam,
      playerData.allPlayers.length
    );

    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setShowTeamNamesModal(true);
  };

  const handleTeamNamesSubmit = (names: string[]) => {
    setShowTeamNamesModal(false);

    draftState.initializeDraft(numTeams, names);
    setTournamentState(null);
    playerData.setAvailablePlayers([...playerData.allPlayers]);
    setScreen('draft');
    setShowDraftOrderModal(true);
  };

  const handlePlayerSelect = (player: Player) => {
    if (!draftState.draftActive) return;
    draftState.setSelectedPlayer(player);
  };

  const handlePickPlayer = () => {
    if (!draftState.draftActive || !draftState.selectedPlayer) return;

    const nextPosition = getNextDraftPosition(
      draftState.currentRound,
      draftState.currentTeam,
      numTeams,
      playersPerTeam
    );

    const { updatedTeams, updatedAvailable, isComplete } = draftState.pickPlayer(
      draftState.selectedPlayer,
      playerData.availablePlayers,
      playersPerTeam,
      numTeams
    );

    playerData.setAvailablePlayers(updatedAvailable);
    playerData.setSearchTerm('');

    if (isComplete) {
      setNextPickerName(null);
      setScreen('tournament');
    } else {
      const nextTeamIndex = getSnakeDraftTeamIndex(
        nextPosition.nextRound,
        nextPosition.nextTeam,
        numTeams
      );
      setNextPickerName(updatedTeams[nextTeamIndex]?.name || `Team ${nextTeamIndex + 1}`);
    }
  };

  return (
    <div className="app">
      {screen === 'home' ? (
        <HomePage
          draftName={draftName}
          version={version}
          numTeams={numTeams}
          playersPerTeam={playersPerTeam}
          playersCount={playerData.allPlayers.length}
          onDraftNameChange={setDraftName}
          onVersionChange={handleVersionChange}
          onNumTeamsChange={setNumTeams}
          onPlayersPerTeamChange={setPlayersPerTeam}
          onCreateDraft={handleStartDraft}
          onContinueLocalDraft={handleContinueLocalDraft}
          onLoadDraftFile={handleLoadDraftFile}
        />
      ) : screen === 'tournament' ? (
        showTeamViewer ? (
          <TeamViewer
            teams={draftState.teams}
            onClose={() => setShowTeamViewer(false)}
            onUpdateTeams={draftState.setTeams}
          />
        ) : (
          <TournamentSetup
            draftName={draftName.trim() || t('untitledDraft')}
            teams={draftState.teams}
            initialState={tournamentState}
            onStateChange={setTournamentState}
            onBackToDraft={() => setScreen('draft')}
            onOpenLineups={() => setShowTeamViewer(true)}
            onSaveFile={handleSaveDraftFile}
          />
        )
      ) : (
        showTeamViewer ? (
          <TeamViewer
            teams={draftState.teams}
            onClose={() => setShowTeamViewer(false)}
            onUpdateTeams={draftState.setTeams}
          />
        ) : (
          <>
          <header className="draft-header">
            <div className="draft-brand">
              <img src={`${import.meta.env.BASE_URL}icon_novo.ico`} alt="" />
              <div>
                <span>{draftName.trim() || t('untitledDraft')}</span>
                <strong>EAFC Draft Room</strong>
              </div>
            </div>

            <div className="draft-meta" aria-label={t('draftConfiguration')}>
              <span>{t('version')} {formatGameVersion(version)}</span>
              <span>{numTeams} {t('teams').toLowerCase()}</span>
              <span>{playersPerTeam} {t('playersPerTeam').toLowerCase()}</span>
            </div>

            <div className="draft-progress" aria-label={t('draftProgress')}>
              {draftState.draftActive ? (
                <>
                  <div>
                    <span>{t('nowPicking')}</span>
                    <strong>{draftState.getCurrentTeamName(numTeams)}</strong>
                  </div>
                  <div>
                    <span>{t('round')}</span>
                    <strong>{draftState.currentRound}</strong>
                  </div>
                  <div>
                    <span>{t('pick')}</span>
                    <strong>
                      {draftState.getCurrentPickNumber(numTeams)}/
                      {draftState.getTotalPicks(numTeams, playersPerTeam)}
                    </strong>
                  </div>
                </>
              ) : (
                <div>
                  <span>{t('draftFinished')}</span>
                  <strong>{draftState.teams.length} {t('teamsBuilt')}</strong>
                </div>
              )}
            </div>

            <div className="draft-actions">
              {!draftState.draftActive && draftState.teams.length > 0 && (
                <button
                  className="ghost-button primary-action"
                  type="button"
                  onClick={() => setScreen('tournament')}
                >
                  {t('startCompetition')}
                </button>
              )}
              <button
                className="ghost-button"
                type="button"
                onClick={handleSaveDraftFile}
                disabled={draftState.teams.length === 0}
              >
                {t('saveFile')}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setShowTeamViewer(true)}
                disabled={draftState.teams.length === 0}
              >
                {t('viewSquads')}
              </button>
              <button className="ghost-button danger" type="button" onClick={handleNewDraftClick}>
                {t('exit')}
              </button>
            </div>
          </header>

          <div className="main-content">
            <PlayerList
              players={playerData.filteredPlayers}
              totalPlayers={playerData.totalFilteredPlayers}
              selectedPlayer={draftState.selectedPlayer}
              searchTerm={playerData.searchTerm}
              positionFilter={playerData.positionFilter}
              draftActive={draftState.draftActive}
              isLoadingPlayers={playerData.isLoadingPlayers}
              canLoadMorePlayers={playerData.canLoadMorePlayers}
              onSearchChange={playerData.setSearchTerm}
              onPositionChange={playerData.setPositionFilter}
              onPlayerSelect={handlePlayerSelect}
              onLoadMorePlayers={playerData.loadMorePlayers}
              onPickPlayer={handlePickPlayer}
            />

            <TeamsList teams={draftState.teams} />
          </div>
          </>
        )
      )}

      <TeamNamesModal
        numTeams={numTeams}
        isOpen={showTeamNamesModal}
        onSubmit={handleTeamNamesSubmit}
        onCancel={() => setShowTeamNamesModal(false)}
      />

      <DraftOrderModal
        isOpen={showDraftOrderModal}
        teams={draftState.teams}
        onContinue={() => setShowDraftOrderModal(false)}
      />

      {nextPickerName && (
        <div className="next-picker-toast" role="status" aria-live="polite">
          <span>{t('nextToPick')}</span>
          <strong>{nextPickerName}</strong>
        </div>
      )}
    </div>
  );
};

export default App;
