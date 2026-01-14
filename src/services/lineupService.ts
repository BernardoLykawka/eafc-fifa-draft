import type { FieldSlot, Player } from '../types';
import { FORMATIONS } from '../constants/formations';

export const initializeField = (formation: string = '4-3-3'): FieldSlot[] => {
  const positions = FORMATIONS[formation] || FORMATIONS['4-3-3'];
  return positions.map(pos => ({ ...pos, player: null as Player | null }));
};

export const applyFormation = (
  currentField: FieldSlot[],
  formation: string
): FieldSlot[] => {
  const newPositions = FORMATIONS[formation] || FORMATIONS['4-3-3'];
  const players = currentField.filter(slot => slot.player).map(slot => slot.player);
  
  const newField = newPositions.map((pos, idx) => ({
    ...pos,
    player: players[idx] || null,
  }));
  
  return newField;
};

export const countFieldPlayers = (field: FieldSlot[]): number => {
  return field.filter(slot => slot.player !== null).length;
};

export const findEmptySlot = (field: FieldSlot[]): number => {
  return field.findIndex(slot => slot.player === null);
};

export const isPointInCircle = (
  pointX: number,
  pointY: number,
  circleX: number,
  circleY: number,
  radius: number
): boolean => {
  const dist = Math.sqrt((pointX - circleX) ** 2 + (pointY - circleY) ** 2);
  return dist <= radius;
};
