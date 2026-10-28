export interface FormationPosition {
  x: number;
  y: number;
}

export type Formation = FormationPosition[];

export const FORMATIONS: Record<string, Formation> = {
  '4-3-3': [
    { x: 0.5, y: 0.92 },  // GK
    { x: 0.1, y: 0.72 }, { x: 0.3, y: 0.72 }, { x: 0.7, y: 0.72 }, { x: 0.9, y: 0.72 },  // Defense
    { x: 0.2, y: 0.52 }, { x: 0.5, y: 0.52 }, { x: 0.8, y: 0.52 },  // Midfield
    { x: 0.25, y: 0.32 }, { x: 0.5, y: 0.32 }, { x: 0.75, y: 0.32 },  // Attack
  ],
  '4-4-2': [
    { x: 0.5, y: 0.92 },  // GK
    { x: 0.1, y: 0.72 }, { x: 0.3, y: 0.72 }, { x: 0.7, y: 0.72 }, { x: 0.9, y: 0.72 },  // Defense
    { x: 0.2, y: 0.52 }, { x: 0.4, y: 0.52 }, { x: 0.6, y: 0.52 }, { x: 0.8, y: 0.52 },  // Midfield
    { x: 0.4, y: 0.32 }, { x: 0.6, y: 0.32 },  // Attack
  ],
  '3-5-2': [
    { x: 0.5, y: 0.92 },  // GK
    { x: 0.2, y: 0.72 }, { x: 0.5, y: 0.72 }, { x: 0.8, y: 0.72 },  // Defense
    { x: 0.15, y: 0.52 }, { x: 0.35, y: 0.52 }, { x: 0.5, y: 0.45 }, { x: 0.65, y: 0.52 }, { x: 0.85, y: 0.52 },  // Midfield
    { x: 0.4, y: 0.32 }, { x: 0.6, y: 0.32 },  // Attack
  ],
  '4-2-3-1': [
    { x: 0.5, y: 0.92 },  // GK
    { x: 0.1, y: 0.72 }, { x: 0.3, y: 0.72 }, { x: 0.7, y: 0.72 }, { x: 0.9, y: 0.72 },  // Defense
    { x: 0.3, y: 0.58 }, { x: 0.7, y: 0.58 },  // Defensive Midfield
    { x: 0.25, y: 0.45 }, { x: 0.5, y: 0.42 }, { x: 0.75, y: 0.45 },  // Attacking Midfield
    { x: 0.5, y: 0.28 },  // Striker
  ],
};

export const FORMATION_NAMES = Object.keys(FORMATIONS);

export interface FormationRole {
  label: string;
  accepts: string[];
}

const role = (label: string, ...extra: string[]): FormationRole => ({
  label,
  accepts: [label, ...extra],
});

const GK = role('GK');
const LB = role('LB', 'LWB');
const RB = role('RB', 'RWB');
const CB = role('CB');
const CM = role('CM', 'CDM', 'CAM');
const CDM = role('CDM', 'CM');
const CAM = role('CAM', 'CM');
const LM = role('LM', 'LW');
const RM = role('RM', 'RW');
const LWB = role('LWB', 'LB', 'LM');
const RWB = role('RWB', 'RB', 'RM');
const LW = role('LW', 'LM');
const RW = role('RW', 'RM');
const ST = role('ST', 'CF');

// Positions a reserve can be drawn for.
export const BENCH_ROLES: FormationRole[] = [GK, LB, CB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST];

// Same slot order as FORMATIONS: each entry describes the position at the same index.
export const FORMATION_ROLES: Record<string, FormationRole[]> = {
  '4-3-3': [GK, LB, CB, CB, RB, CM, CM, CM, LW, ST, RW],
  '4-4-2': [GK, LB, CB, CB, RB, LM, CM, CM, RM, ST, ST],
  '3-5-2': [GK, CB, CB, CB, LWB, CM, CAM, CM, RWB, ST, ST],
  '4-2-3-1': [GK, LB, CB, CB, RB, CDM, CDM, LM, CAM, RM, ST],
};
