import React, { useEffect, useMemo, useState } from 'react';
import type {
  Player,
  SavedTournamentState,
  Team,
  TournamentFormat,
  TournamentMatch,
  TournamentSettings,
} from '../types';
import styles from './TournamentSetup.module.css';
import type { TranslationKey } from '../i18n';
import { useI18n } from '../i18n-context';

const FORMAT_OPTIONS: Array<{
  value: TournamentFormat;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    value: 'knockout',
    titleKey: 'knockout',
    descriptionKey: 'knockoutDescription',
  },
  {
    value: 'groupsAndKnockout',
    titleKey: 'groupsKnockout',
    descriptionKey: 'groupsKnockoutDescription',
  },
  {
    value: 'league',
    titleKey: 'league',
    descriptionKey: 'leagueDescription',
  },
];

interface StandingRow {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface TournamentSetupProps {
  draftName: string;
  teams: Team[];
  initialState: SavedTournamentState | null;
  onStateChange: (state: SavedTournamentState | null) => void;
  onBackToDraft: () => void;
  onOpenLineups: () => void;
  squadsDisabled?: boolean;
  onSaveFile: () => void;
}

const buildMatch = (
  id: string,
  stage: string,
  homeLabel: string,
  awayLabel: string,
  homeTeamIndex: number | null,
  awayTeamIndex: number | null,
  isBye = false,
  round?: number,
  leg?: 1 | 2
): TournamentMatch => ({
  id,
  stage,
  round,
  leg,
  homeLabel,
  awayLabel,
  homeTeamIndex,
  awayTeamIndex,
  isBye,
  homeScore: '',
  awayScore: '',
  homeScorers: [],
  awayScorers: [],
});

const createRoundRobinMatches = (
  teamIndexes: number[],
  teams: Team[],
  stage: string,
  roundTrip: boolean,
  idPrefix: string
): TournamentMatch[] => {
  const rotation: Array<number | null> =
    teamIndexes.length % 2 === 0 ? [...teamIndexes] : [...teamIndexes, null];
  const rounds: Array<Array<{ homeIndex: number; awayIndex: number }>> = [];
  const roundCount = rotation.length - 1;

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const roundMatches: Array<{ homeIndex: number; awayIndex: number }> = [];

    for (let pairIndex = 0; pairIndex < rotation.length / 2; pairIndex += 1) {
      const firstTeamIndex = rotation[pairIndex];
      const secondTeamIndex = rotation[rotation.length - 1 - pairIndex];

      if (firstTeamIndex === null || secondTeamIndex === null) continue;

      const shouldSwapHome = roundIndex % 2 === 1;
      roundMatches.push({
        homeIndex: shouldSwapHome ? secondTeamIndex : firstTeamIndex,
        awayIndex: shouldSwapHome ? firstTeamIndex : secondTeamIndex,
      });
    }

    rounds.push(roundMatches);

    const fixedTeamIndex = rotation[0];
    const lastTeamIndex = rotation.pop();
    rotation.splice(1, 0, lastTeamIndex ?? null);
    rotation[0] = fixedTeamIndex;
  }

  const firstLegMatches = rounds.flatMap((roundMatches, roundIndex) =>
    roundMatches.map(({ homeIndex, awayIndex }, matchIndex) =>
      buildMatch(
        `${idPrefix}-leg-1-round-${roundIndex + 1}-match-${matchIndex + 1}`,
        stage,
        teams[homeIndex].name,
        teams[awayIndex].name,
        homeIndex,
        awayIndex,
        false,
        roundIndex + 1,
        1
      )
    )
  );

  if (!roundTrip) return firstLegMatches;

  const secondLegMatches = rounds.flatMap((roundMatches, roundIndex) =>
    roundMatches.map(({ homeIndex, awayIndex }, matchIndex) =>
      buildMatch(
        `${idPrefix}-leg-2-round-${roundIndex + 1}-match-${matchIndex + 1}`,
        stage,
        teams[awayIndex].name,
        teams[homeIndex].name,
        awayIndex,
        homeIndex,
        false,
        roundIndex + 1,
        2
      )
    )
  );

  return [...firstLegMatches, ...secondLegMatches];
};

const createGroups = (teams: Team[]): number[][] => {
  if (teams.length < 4) return [teams.map((_, index) => index)];

  return teams.reduce<number[][]>(
    (groups, _, index) => {
      groups[index % 2].push(index);
      return groups;
    },
    [[], []]
  );
};

const createKnockoutMatches = (
  teams: Team[],
  roundTrip: boolean
): TournamentMatch[] => {
  const matches: TournamentMatch[] = [];
  const startIndex = teams.length % 2 === 1 ? 1 : 0;
  const stage = teams.length <= 2 ? 'Final' : 'Knockout';

  if (teams.length % 2 === 1) {
    const byeTeam = teams[0];
    matches.push(
      buildMatch(
        'ko-bye-0',
        'Bye',
        byeTeam.name,
        'No opponent this round',
        0,
        null,
        true
      )
    );
  }

  for (let index = startIndex; index < teams.length; index += 2) {
    const home = teams[index];
    const away = teams[index + 1];
    if (!away) continue;

    matches.push(
      buildMatch(
        `ko-${index}-${index + 1}`,
        stage,
        home.name,
        away.name,
        index,
        index + 1
      )
    );

    if (roundTrip) {
      matches.push(
        buildMatch(
          `ko-${index + 1}-${index}`,
      `${stage} - second leg`,
          away.name,
          home.name,
          index + 1,
          index
        )
      );
    }
  }

  return matches;
};

const createGroupKnockoutPlaceholders = (
  groupCount: number,
  roundTrip: boolean
): TournamentMatch[] => {
  const baseMatches =
    groupCount <= 1
      ? [
          buildMatch(
            'group-final',
            'Final',
            '1st Group A',
            '2nd Group A',
            null,
            null
          ),
        ]
      : [
          buildMatch('semi-a', 'Semifinal', '1st Group A', '2nd Group B', null, null),
          buildMatch('semi-b', 'Semifinal', '1st Group B', '2nd Group A', null, null),
          buildMatch('final', 'Final', 'Winner Semi A', 'Winner Semi B', null, null),
        ];

  if (!roundTrip) return baseMatches;

  return baseMatches.flatMap((match) => [
    match,
    buildMatch(
      `${match.id}-volta`,
      `${match.stage} - volta`,
      match.awayLabel,
      match.homeLabel,
      null,
      null
    ),
  ]);
};

const createInitialMatches = (
  teams: Team[],
  settings: TournamentSettings
): TournamentMatch[] => {
  if (teams.length < 2) return [];

  if (teams.length === 2) {
    return createKnockoutMatches(teams, settings.knockoutRoundTrip);
  }

  if (settings.format === 'league') {
    return createRoundRobinMatches(
      teams.map((_, index) => index),
      teams,
      'League',
      settings.groupOrLeagueRoundTrip,
      'league'
    );
  }

  if (settings.format === 'knockout') {
    return createKnockoutMatches(teams, settings.knockoutRoundTrip);
  }

  const groups = createGroups(teams);
  const groupMatches = groups.flatMap((group, index) =>
    createRoundRobinMatches(
      group,
      teams,
      `Group ${String.fromCharCode(65 + index)}`,
      settings.groupOrLeagueRoundTrip,
      `group-${index}`
    )
  );

  return [
    ...groupMatches,
    ...createGroupKnockoutPlaceholders(groups.length, settings.knockoutRoundTrip),
  ];
};

const getTeamPlayers = (teams: Team[], teamIndex: number | null): Player[] => {
  if (teamIndex === null) return [];
  return teams[teamIndex]?.players || [];
};

const calculateStandings = (
  teams: Team[],
  matches: TournamentMatch[],
  stageFilter: string
): StandingRow[] => {
  const rows = new Map<number, StandingRow>();

  matches
    .filter((match) => match.stage === stageFilter)
    .forEach((match) => {
      if (
        match.homeTeamIndex === null ||
        match.awayTeamIndex === null ||
        match.homeScore === '' ||
        match.awayScore === ''
      ) {
        return;
      }

      const homeScore = Number(match.homeScore);
      const awayScore = Number(match.awayScore);

      [match.homeTeamIndex, match.awayTeamIndex].forEach((teamIndex) => {
        if (!rows.has(teamIndex)) {
          rows.set(teamIndex, {
            team: teams[teamIndex],
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
          });
        }
      });

      const home = rows.get(match.homeTeamIndex)!;
      const away = rows.get(match.awayTeamIndex)!;

      home.played += 1;
      away.played += 1;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (awayScore > homeScore) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    });

  return Array.from(rows.values()).sort((a, b) => {
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    return (
      b.points - a.points ||
      goalDiffB - goalDiffA ||
      b.goalsFor - a.goalsFor
    );
  });
};

const TournamentSetup: React.FC<TournamentSetupProps> = ({
  draftName,
  teams,
  initialState,
  onStateChange,
  onBackToDraft,
  onOpenLineups,
  squadsDisabled = false,
  onSaveFile,
}) => {
  const { t } = useI18n();
  const [settings, setSettings] = useState<TournamentSettings>({
    format: 'groupsAndKnockout',
    groupOrLeagueRoundTrip: false,
    knockoutRoundTrip: false,
    trackScorers: true,
  });
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [scorerMatchId, setScorerMatchId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!initialState) return;
    setSettings(initialState.settings);
    setMatches(initialState.matches);
    setFinished(initialState.finished);
  }, [initialState]);

  useEffect(() => {
    if (matches.length === 0) {
      onStateChange(null);
      return;
    }

    onStateChange({ settings, matches, finished });
  }, [settings, matches, finished, onStateChange]);

  const selectedFormat = FORMAT_OPTIONS.find(
    (option) => option.value === settings.format
  );
  const hasGroupOrLeagueStage =
    settings.format === 'groupsAndKnockout' || settings.format === 'league';
  const hasKnockoutStage =
    settings.format === 'groupsAndKnockout' || settings.format === 'knockout';
  const started = matches.length > 0;

  const standingStages = useMemo(() => {
    if (settings.format === 'league') return ['League'];
    if (settings.format !== 'groupsAndKnockout') return [];

    return Array.from(
      new Set(matches.filter((match) => match.stage.startsWith('Group')).map((match) => match.stage))
    );
  }, [matches, settings.format]);

  const scorerRows = useMemo(() => {
    const scorers = new Map<string, { name: string; team: string; goals: number }>();

    matches.forEach((match) => {
      [
        { scorerIds: match.homeScorers, teamIndex: match.homeTeamIndex },
        { scorerIds: match.awayScorers, teamIndex: match.awayTeamIndex },
      ].forEach(({ scorerIds, teamIndex }) => {
        const team = teamIndex === null ? null : teams[teamIndex];
        scorerIds.forEach((playerId) => {
          const player = team?.players.find((item) => item.player_id === playerId);
          if (!player || !team) return;

          const key = `${team.name}-${player.player_id}`;
          const current = scorers.get(key) || {
            name: player.short_name,
            team: team.name,
            goals: 0,
          };
          current.goals += 1;
          scorers.set(key, current);
        });
      });
    });

    return Array.from(scorers.values()).sort((a, b) => b.goals - a.goals);
  }, [matches, teams]);

  const playableMatches = useMemo(
    () =>
      matches.filter(
        (match) =>
          !match.isBye &&
          match.homeTeamIndex !== null &&
          match.awayTeamIndex !== null
      ),
    [matches]
  );

  const allPlayableMatchesFilled =
    playableMatches.length > 0 &&
    playableMatches.every(
      (match) => match.homeScore !== '' && match.awayScore !== ''
    );

  const totalGoals = playableMatches.reduce(
    (sum, match) => sum + Number(match.homeScore || 0) + Number(match.awayScore || 0),
    0
  );

  const championName = useMemo(() => {
    if (!finished) return null;

    if (settings.format === 'league') {
      return calculateStandings(teams, matches, 'League')[0]?.team.name || null;
    }

    const finalMatch = [...playableMatches]
      .reverse()
      .find((match) => match.stage.toLowerCase().includes('final'));

    if (!finalMatch || finalMatch.homeScore === '' || finalMatch.awayScore === '') {
      return null;
    }

    const homeScore = Number(finalMatch.homeScore);
    const awayScore = Number(finalMatch.awayScore);

    if (homeScore === awayScore) return t('finalDraw');

    return homeScore > awayScore ? finalMatch.homeLabel : finalMatch.awayLabel;
  }, [finished, matches, playableMatches, settings.format, teams, t]);

  const topScorer = scorerRows[0];

  const updateMatch = (
    matchId: string,
    updater: (match: TournamentMatch) => TournamentMatch
  ) => {
    setMatches((currentMatches) =>
      currentMatches.map((match) =>
        match.id === matchId ? updater(match) : match
      )
    );
    setFinished(false);
  };

  const handleScoreChange = (
    matchId: string,
    side: 'home' | 'away',
    value: string
  ) => {
    const score = value === '' ? '' : String(Math.max(0, Number(value)));

    updateMatch(matchId, (match) => {
      const nextMatch = {
        ...match,
        [side === 'home' ? 'homeScore' : 'awayScore']: score,
      };
      const goalsCount = score === '' ? 0 : Number(score);

      if (side === 'home') {
        nextMatch.homeScorers = nextMatch.homeScorers.slice(0, goalsCount);
      } else {
        nextMatch.awayScorers = nextMatch.awayScorers.slice(0, goalsCount);
      }

      return nextMatch;
    });
  };

  const handleScorerChange = (
    matchId: string,
    side: 'home' | 'away',
    goalIndex: number,
    playerId: string
  ) => {
    updateMatch(matchId, (match) => {
      const key = side === 'home' ? 'homeScorers' : 'awayScorers';
      const nextScorers = [...match[key]];
      nextScorers[goalIndex] = playerId;

      return {
        ...match,
        [key]: nextScorers,
      };
    });
  };

  const startTournament = () => {
    if (teams.length < 2) {
      alert(t('needTwoTeamsAlert'));
      return;
    }

    setMatches(createInitialMatches(teams, settings));
    setFinished(false);
  };

  const finishTournament = () => {
    if (!allPlayableMatchesFilled) {
      alert(t('fillScoresAlert'));
      return;
    }

    setFinished(true);
  };

  const scorerMatch = matches.find((match) => match.id === scorerMatchId) || null;
  const getStageLabel = (stage: string) => {
    if (stage === 'League') return t('league');
    if (stage === 'Final') return t('final');
    if (stage === 'Semifinal') return t('semifinal');
    if (stage === 'Knockout') return t('knockout');
    if (stage === 'Bye') return t('bye');
    if (stage.includes('second leg')) {
      return `${getStageLabel(stage.replace(' - second leg', ''))} - ${t('secondLeg')}`;
    }
    if (stage.includes('volta')) {
      return `${getStageLabel(stage.replace(' - volta', ''))} - ${t('secondLeg')}`;
    }
    if (stage.startsWith('Group ')) {
      return `${t('group')} ${stage.replace('Group ', '')}`;
    }
    return stage;
  };
  const matchSections = matches.reduce<
    Array<{ key: string; title: string | null; matches: TournamentMatch[] }>
  >((sections, match) => {
    const sectionKey =
      match.round && match.leg
        ? `${match.stage}-leg-${match.leg}-round-${match.round}`
        : match.id;
    const currentSection = sections.find((section) => section.key === sectionKey);

    if (currentSection) {
      currentSection.matches.push(match);
      return sections;
    }

    sections.push({
      key: sectionKey,
      title:
        match.round && match.leg
          ? `${getStageLabel(match.stage)} - ${
              match.leg === 1 ? t('firstLeg') : t('secondLeg')
            } - ${t('round')} ${match.round}`
          : null,
      matches: [match],
    });

    return sections;
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>
            {started ? t('tournamentInProgress') : t('draftFinishedKicker')}
          </span>
          <h1>{draftName}</h1>
          <p>
            {started
              ? t('tournamentPlayingHelp')
              : t('tournamentSetupHelp')}
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" onClick={onOpenLineups} disabled={squadsDisabled}>
            {t('viewSquads')}
          </button>
          {started ? (
            <button type="button" onClick={onSaveFile}>
              {t('saveFile')}
            </button>
          ) : (
            <button type="button" onClick={onBackToDraft}>
              {t('backToDraft')}
            </button>
          )}
        </div>
      </header>

      {!started ? (
        <section className={styles.content}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span>{t('format')}</span>
              <strong>{teams.length} {t('teams').toLowerCase()}</strong>
            </div>

            <div className={styles.formatGrid}>
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.formatCard} ${
                    settings.format === option.value ? styles.selected : ''
                  }`}
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      format: option.value,
                      groupOrLeagueRoundTrip:
                        option.value === 'knockout'
                          ? false
                          : current.groupOrLeagueRoundTrip,
                      knockoutRoundTrip:
                        option.value === 'league' ? false : current.knockoutRoundTrip,
                    }))
                  }
                >
                  <strong>{t(option.titleKey)}</strong>
                  <span>{t(option.descriptionKey)}</span>
                </button>
              ))}
            </div>

            <div className={styles.optionsBlock}>
              {hasGroupOrLeagueStage && (
                <label className={styles.scorersToggle}>
                  <input
                    type="checkbox"
                    checked={settings.groupOrLeagueRoundTrip}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        groupOrLeagueRoundTrip: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>
                      {settings.format === 'league'
                        ? t('leagueTwoLegs')
                        : t('groupsTwoLegs')}
                    </strong>
                    <small>
                      {t('eachStageTwice')}
                    </small>
                  </span>
                </label>
              )}

              {hasKnockoutStage && (
                <label className={styles.scorersToggle}>
                  <input
                    type="checkbox"
                    checked={settings.knockoutRoundTrip}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        knockoutRoundTrip: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>{t('twoLeggedKnockout')}</strong>
                    <small>
                      {t('knockoutTwoLegsDescription')}
                    </small>
                  </span>
                </label>
              )}
            </div>

            <label className={styles.scorersToggle}>
              <input
                type="checkbox"
                checked={settings.trackScorers}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    trackScorers: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>{t('trackScorers')}</strong>
                <small>
                  {t('trackScorersDescription')}
                </small>
              </span>
            </label>

            <button
              type="button"
              className={styles.startButton}
              onClick={startTournament}
            >
              {t('generateFixtures')}
            </button>
          </div>

          <aside className={styles.summary}>
            <div>
              <span>{t('selectedFormat')}</span>
              <strong>{selectedFormat ? t(selectedFormat.titleKey) : ''}</strong>
              <p>{selectedFormat ? t(selectedFormat.descriptionKey) : ''}</p>
            </div>

            {hasGroupOrLeagueStage && (
              <div>
                <span>
                  {settings.format === 'league' ? t('league') : t('groupStage')}
                </span>
                <strong>
                  {settings.groupOrLeagueRoundTrip ? t('twoLegs') : t('singleGame')}
                </strong>
              </div>
            )}

            {hasKnockoutStage && (
              <div>
                <span>{t('knockout')}</span>
                <strong>
                  {settings.knockoutRoundTrip ? t('twoLegs') : t('singleGame')}
                </strong>
              </div>
            )}

            <div>
              <span>{t('scorers')}</span>
              <strong>{settings.trackScorers ? t('enabled') : t('disabled')}</strong>
            </div>

            <div className={styles.teamList}>
              <span>{t('teams')}</span>
              {teams.map((team) => (
                <strong key={team.name}>{team.name}</strong>
              ))}
            </div>
          </aside>
        </section>
      ) : (
        <section className={styles.tournamentGrid}>
          <div className={styles.matchesPanel}>
            <div className={styles.panelHeader}>
              <span>{t('fixtures')}</span>
              <strong>{playableMatches.length} {t('games')}</strong>
            </div>

            <div className={styles.competitionActions}>
              <button
                type="button"
                className={styles.startButton}
                disabled={!allPlayableMatchesFilled}
                onClick={finishTournament}
              >
                {t('finishCompetition')}
              </button>
              {!allPlayableMatchesFilled && (
                <span>{t('fillScoresToFinish')}</span>
              )}
            </div>

            <div className={styles.matchList}>
              {matchSections.map((section) => (
                <section key={section.key} className={styles.matchSection}>
                  {section.title && (
                    <h3 className={styles.roundTitle}>{section.title}</h3>
                  )}

                  <div className={styles.roundMatches}>
                    {section.matches.map((match) => {
                      const canTrackScorers =
                        settings.trackScorers &&
                        match.homeTeamIndex !== null &&
                        match.awayTeamIndex !== null;

                      return (
                        <article key={match.id} className={styles.matchCard}>
                          <span className={styles.stageBadge}>
                            {getStageLabel(match.stage)}
                          </span>

                          <div className={styles.scoreRow}>
                            <strong>{match.homeLabel}</strong>
                            <input
                              type="number"
                              min={0}
                              value={match.homeScore}
                              onChange={(event) =>
                                handleScoreChange(match.id, 'home', event.target.value)
                              }
                              disabled={match.homeTeamIndex === null || match.isBye}
                            />
                            <span>x</span>
                            <input
                              type="number"
                              min={0}
                              value={match.awayScore}
                              onChange={(event) =>
                                handleScoreChange(match.id, 'away', event.target.value)
                              }
                              disabled={match.awayTeamIndex === null || match.isBye}
                            />
                            <strong>{match.awayLabel}</strong>
                          </div>

                          {canTrackScorers && (
                            <button
                              type="button"
                              className={styles.goalsButton}
                              onClick={() => setScorerMatchId(match.id)}
                            >
                              {t('recordGoals')}
                            </button>
                          )}

                          {match.isBye && (
                            <p className={styles.placeholderNote}>
                              {match.homeLabel} {t('advancesDirectly')}
                            </p>
                          )}

                          {!match.isBye && match.homeTeamIndex === null && (
                            <p className={styles.placeholderNote}>
                              {t('dependsOnPreviousStage')}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className={styles.tablesPanel}>
            {finished && (
              <div className={styles.finishedDetails}>
                <span>{t('competitionFinished')}</span>
                <strong>{championName || t('championNotDefined')}</strong>
                <p>{playableMatches.length} {t('gamesPlayed')}</p>
                <p>{totalGoals} {t('goalsScored')}</p>
                {settings.trackScorers && topScorer && (
                  <p>
                    {t('topScorer')}: {topScorer.name} ({topScorer.goals} {t('goals').toLowerCase()})
                  </p>
                )}
              </div>
            )}

            {standingStages.map((stage) => (
              <div key={stage} className={styles.standingsBlock}>
                <span>{getStageLabel(stage)}</span>
                <table>
                  <thead>
                    <tr>
                      <th>{t('team')}</th>
                      <th>{t('pointsShort')}</th>
                      <th>{t('playedShort')}</th>
                      <th>{t('goalDifferenceShort')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStandings(teams, matches, stage).map((row) => (
                      <tr key={row.team.name}>
                        <td>{row.team.name}</td>
                        <td>{row.points}</td>
                        <td>{row.played}</td>
                        <td>{row.goalsFor - row.goalsAgainst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            {settings.trackScorers && (
              <div className={styles.standingsBlock}>
                <span>{t('topScorers')}</span>
                {scorerRows.length === 0 ? (
                  <p className={styles.placeholderNote}>{t('noGoalsRecorded')}</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>{t('player')}</th>
                        <th>{t('team')}</th>
                        <th>{t('goals')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scorerRows.map((row) => (
                        <tr key={`${row.team}-${row.name}`}>
                          <td>{row.name}</td>
                          <td>{row.team}</td>
                          <td>{row.goals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </aside>
        </section>
      )}

      {scorerMatch && (
        <div className={styles.goalModalOverlay} onClick={() => setScorerMatchId(null)}>
          <div className={styles.goalModal} onClick={(event) => event.stopPropagation()}>
            <header className={styles.goalModalHeader}>
              <div>
                <span>{getStageLabel(scorerMatch.stage)}</span>
                <strong>
                  {scorerMatch.homeLabel} {scorerMatch.homeScore || 0} x{' '}
                  {scorerMatch.awayScore || 0} {scorerMatch.awayLabel}
                </strong>
              </div>
              <button type="button" onClick={() => setScorerMatchId(null)}>
                {t('close')}
              </button>
            </header>

            <div className={styles.scorersGrid}>
              <div>
                <h3>{scorerMatch.homeLabel}</h3>
                {Array.from({ length: Number(scorerMatch.homeScore) || 0 }).map(
                  (_, goalIndex) => (
                    <select
                      key={`${scorerMatch.id}-home-${goalIndex}`}
                      value={scorerMatch.homeScorers[goalIndex] || ''}
                      onChange={(event) =>
                        handleScorerChange(
                          scorerMatch.id,
                          'home',
                          goalIndex,
                          event.target.value
                        )
                      }
                    >
                      <option value="">{t('goal')} {goalIndex + 1}</option>
                      {getTeamPlayers(teams, scorerMatch.homeTeamIndex).map((player) => (
                        <option key={player.player_id} value={player.player_id}>
                          {player.short_name}
                        </option>
                      ))}
                    </select>
                  )
                )}
                {Number(scorerMatch.homeScore) === 0 && (
                  <p className={styles.placeholderNote}>{t('noGoalsToRecord')}</p>
                )}
              </div>

              <div>
                <h3>{scorerMatch.awayLabel}</h3>
                {Array.from({ length: Number(scorerMatch.awayScore) || 0 }).map(
                  (_, goalIndex) => (
                    <select
                      key={`${scorerMatch.id}-away-${goalIndex}`}
                      value={scorerMatch.awayScorers[goalIndex] || ''}
                      onChange={(event) =>
                        handleScorerChange(
                          scorerMatch.id,
                          'away',
                          goalIndex,
                          event.target.value
                        )
                      }
                    >
                      <option value="">{t('goal')} {goalIndex + 1}</option>
                      {getTeamPlayers(teams, scorerMatch.awayTeamIndex).map((player) => (
                        <option key={player.player_id} value={player.player_id}>
                          {player.short_name}
                        </option>
                      ))}
                    </select>
                  )
                )}
                {Number(scorerMatch.awayScore) === 0 && (
                  <p className={styles.placeholderNote}>{t('noGoalsToRecord')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TournamentSetup;
