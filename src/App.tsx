import React, { useState, useEffect } from 'react';
import type { Player, DraftState } from './types';
import { FIFA_VERSIONS, DEFAULT_VERSION } from './constants/versions';
import { validateDraftConfig } from './services/draftEngine';
import { usePlayerData, useDraftState, useDraftPersistence } from './hooks';
import ConfigPanel from './components/draft/ConfigPanel/ConfigPanel';
import PlayerList from './components/draft/PlayerList/PlayerList';
import TeamsList from './components/draft/TeamsList/TeamsList';
import TeamViewer from './components/TeamViewer';
import TeamNamesModal from './components/modals/TeamNamesModal';

const App: React.FC = () => {
  const [version, setVersion] = useState<string>(DEFAULT_VERSION);
  const [numTeams, setNumTeams] = useState<number>(4);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(11);
  const [showTeamViewer, setShowTeamViewer] = useState<boolean>(false);
  const [showTeamNamesModal, setShowTeamNamesModal] = useState<boolean>(false);

  const draftState = useDraftState();
  const playerData = usePlayerData(version, draftState.draftActive);

  useEffect(() => {
    playerData.loadPlayers(version);
  }, [version]);

  const { clearDraft } = useDraftPersistence({
    draftActive: draftState.draftActive,
    draftState: {
      version,
      numTeams,
      playersPerTeam,
      currentRound: draftState.currentRound,
      currentTeam: draftState.currentTeam,
      draftActive: draftState.draftActive,
      teams: draftState.teams,
      availablePlayers: playerData.availablePlayers,
      allPlayers: playerData.allPlayers,
    },
    onRestore: (savedState: DraftState) => {
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
    },
  });

  const handleVersionChange = async (newVersion: string) => {
    if (draftState.draftActive) {
      const shouldChange = confirm(
        'Changing the version will restart the draft. Do you want to continue?'
      );
      if (!shouldChange) return;
      await handleReset();
    }
    setVersion(newVersion);
  };

  const handleReset = async () => {
    draftState.resetDraft();
    playerData.setSearchTerm('');
    await clearDraft();
    await playerData.loadPlayers(version);
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
    playerData.setAvailablePlayers([...playerData.allPlayers]);
  };

  const handlePlayerSelect = (player: Player) => {
    if (!draftState.draftActive) return;
    draftState.setSelectedPlayer(player);
  };

  const handlePickPlayer = () => {
    if (!draftState.draftActive || !draftState.selectedPlayer) return;

    const { updatedAvailable, isComplete } = draftState.pickPlayer(
      draftState.selectedPlayer,
      playerData.availablePlayers,
      playersPerTeam,
      numTeams
    );

    playerData.setAvailablePlayers(updatedAvailable);
    playerData.setSearchTerm('');

    if (isComplete) {
      alert(
        `Draft finished!\nAll ${numTeams} teams have been formed with ${playersPerTeam} players each.`
      );
      clearDraft();
    }
  };

  return (
    <div className="app">
      <ConfigPanel
        version={version}
        versions={FIFA_VERSIONS}
        numTeams={numTeams}
        playersPerTeam={playersPerTeam}
        playersCount={playerData.allPlayers.length}
        draftActive={draftState.draftActive}
        currentRound={draftState.currentRound}
        currentTeamName={draftState.getCurrentTeamName(numTeams)}
        currentPick={draftState.getCurrentPickNumber(numTeams)}
        totalPicks={draftState.getTotalPicks(numTeams, playersPerTeam)}
        onVersionChange={handleVersionChange}
        onNumTeamsChange={setNumTeams}
        onPlayersPerTeamChange={setPlayersPerTeam}
        onStartDraft={handleStartDraft}
        onReset={handleReset}
        onOpenTeamViewer={() => setShowTeamViewer(true)}
        canOpenTeamViewer={draftState.teams.length > 0}
      />

      <div className="main-content">
        <PlayerList
          players={playerData.filteredPlayers}
          selectedPlayer={draftState.selectedPlayer}
          searchTerm={playerData.searchTerm}
          draftActive={draftState.draftActive}
          onSearchChange={playerData.setSearchTerm}
          onPlayerSelect={handlePlayerSelect}
          onPickPlayer={handlePickPlayer}
        />

        <TeamsList teams={draftState.teams} />
      </div>

      {showTeamViewer && (
        <TeamViewer
          teams={draftState.teams}
          onClose={() => setShowTeamViewer(false)}
          onUpdateTeams={draftState.setTeams}
        />
      )}

      <TeamNamesModal
        numTeams={numTeams}
        isOpen={showTeamNamesModal}
        onSubmit={handleTeamNamesSubmit}
        onCancel={() => setShowTeamNamesModal(false)}
      />
    </div>
  );
};

export default App;
