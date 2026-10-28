import type { Player, Team } from '../types';
import { BENCH_ROLES, FORMATION_ROLES } from '../constants/formations';

export const OPTIONS_PER_PICK = 5;
// Option key used for reserve turns, where the position is drawn instead of chosen.
export const BENCH_SLOT = -1;
const RUN_SIZE = 10;
// No option below this overall is ever offered.
export const MIN_OVERALL = 77;

// Percentile ranges (0 = best player, 1 = worst) a turn's quality tier is drawn from.
const STARTER_BEST_PERCENTILE = 0.002;
const STARTER_WORST_PERCENTILE = 0.12;
const BENCH_BEST_PERCENTILE = 0.05;
const BENCH_WORST_PERCENTILE = 0.25;

// Reserves compensate the squad: each OVR point a team is behind the others moves its
// reserve options up by CORRECTION_PER_POINT, within these limits.
const CORRECTION_PER_POINT = 2;
const MAX_BOOST = 10;
const MAX_PENALTY = 4;

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const getPositions = (player: Player): string[] =>
  player.player_positions.split(',').map((position) => position.trim());

// Players whose main position fits the slot; falls back to any listed position.
const getEligiblePlayers = (players: Player[], accepts: string[]): Player[] => {
  const primary = players.filter((player) =>
    accepts.includes(getPositions(player)[0])
  );
  if (primary.length >= OPTIONS_PER_PICK * 4) return primary;

  return players.filter((player) =>
    getPositions(player).some((position) => accepts.includes(position))
  );
};

const byOverallDesc = (a: Player, b: Player) => b.overall - a.overall;

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

// Log-uniform, so star-level tiers are as likely as solid ones.
const randomLogBetween = (min: number, max: number) =>
  min * Math.pow(max / min, Math.random());

const getAverageOverall = (team: Team): number =>
  team.players.reduce((sum, player) => sum + player.overall, 0) / team.players.length;

// Positive when the team is behind the league average.
const getDeficit = (team: Team, teams: Team[]): number => {
  const withPlayers = teams.filter((candidate) => candidate.players.length > 0);
  if (team.players.length === 0 || withPlayers.length < 2) return 0;

  const leagueAverage =
    withPlayers.reduce((sum, candidate) => sum + getAverageOverall(candidate), 0) /
    withPlayers.length;
  return leagueAverage - getAverageOverall(team);
};

// Draws a window of players around the tier's target and samples options from it,
// preferring different clubs so the choice is not between near-duplicates.
const sampleOptions = (
  availablePlayers: Player[],
  accepts: string[],
  percentile: number,
  boost: number,
  numTeams: number
): Player[] => {
  const ranked = getEligiblePlayers(availablePlayers, accepts).sort(byOverallDesc);
  // The tier is placed on the full ranking, then only players above the floor are offered.
  const rank = Math.max(numTeams * 2, Math.floor(percentile * ranked.length));
  const tierOverall = ranked[Math.min(rank, ranked.length - 1)]?.overall ?? MIN_OVERALL;
  const target = Math.max(MIN_OVERALL, tierOverall + boost);

  const eligible = getEligiblePlayers(
    availablePlayers.filter((player) => player.overall >= MIN_OVERALL),
    accepts
  ).sort(byOverallDesc);

  if (eligible.length <= OPTIONS_PER_PICK) {
    // Last resort when a position runs out of players above the floor (small pools in
    // old game versions): complete the options with the best remaining players, so a
    // team is never left without anyone to pick.
    const missing = OPTIONS_PER_PICK - eligible.length;
    const fill = ranked.filter((player) => !eligible.includes(player)).slice(0, missing);
    return [...eligible, ...fill].sort(byOverallDesc);
  }

  const closest = eligible.findIndex((player) => player.overall <= target);
  const center = closest === -1 ? eligible.length - 1 : closest;
  const half = Math.max(OPTIONS_PER_PICK, numTeams * 2);
  const windowStart = Math.max(0, Math.min(center - half, eligible.length - half * 2));
  const windowEnd = Math.min(eligible.length, windowStart + half * 2);
  // Options come from one contiguous run of the ranking, so they are close in quality.
  const runStart =
    windowStart +
    Math.floor(Math.random() * Math.max(1, windowEnd - windowStart - RUN_SIZE + 1));
  const window = eligible.slice(runStart, runStart + RUN_SIZE);

  const options: Player[] = [];
  const usedClubs = new Set<string>();
  const shuffled = shuffle(window);

  for (const player of shuffled) {
    if (options.length === OPTIONS_PER_PICK) break;
    if (usedClubs.has(player.club_name)) continue;
    usedClubs.add(player.club_name);
    options.push(player);
  }
  for (const player of shuffled) {
    if (options.length === OPTIONS_PER_PICK) break;
    if (!options.includes(player)) options.push(player);
  }

  return options.sort(byOverallDesc);
};

export interface TurnOptions {
  optionsBySlot: Record<number, Player[]>;
  // Set on reserve turns: the position drawn for the team.
  benchPosition: string | null;
}

// Builds the options for one team's turn, generated once so that switching between
// positions cannot be used to re-roll the choices.
//  - Starter turns: the team draws its own random quality tier, shared by all the open
//    positions of that turn, so nobody is held to the same level as the others.
//  - Reserve turns: a random position and a tier corrected by how far the team is behind.
export const buildTurnOptions = (
  formation: string,
  round: number,
  team: Team,
  teams: Team[],
  availablePlayers: Player[],
  numTeams: number
): TurnOptions => {
  const field = team.lineup.field;

  if (round > field.length) {
    const used = new Set(team.lineup.bench.map((player) => getPositions(player)[0]));
    const candidates = BENCH_ROLES.filter((role) => !used.has(role.label));
    const role = shuffle(candidates.length > 0 ? candidates : BENCH_ROLES)[0];

    const deficit = getDeficit(team, teams);
    const boost = Math.round(
      Math.max(-MAX_PENALTY, Math.min(MAX_BOOST, deficit * CORRECTION_PER_POINT))
    );
    const percentile = randomBetween(BENCH_BEST_PERCENTILE, BENCH_WORST_PERCENTILE);

    return {
      optionsBySlot: {
        [BENCH_SLOT]: sampleOptions(
          availablePlayers,
          role.accepts,
          percentile,
          boost,
          numTeams
        ),
      },
      benchPosition: role.label,
    };
  }

  const percentile = randomLogBetween(STARTER_BEST_PERCENTILE, STARTER_WORST_PERCENTILE);
  const roles = FORMATION_ROLES[formation];
  const optionsBySlot: Record<number, Player[]> = {};

  field.forEach((fieldSlot, index) => {
    if (fieldSlot.player) return;
    optionsBySlot[index] = sampleOptions(
      availablePlayers,
      roles[index].accepts,
      percentile,
      0,
      numTeams
    );
  });

  return { optionsBySlot, benchPosition: null };
};
