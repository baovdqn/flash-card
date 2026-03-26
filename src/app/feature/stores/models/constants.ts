import { DIFFICULTY } from './enums';

export const DAY_TO_CHECK: Record<DIFFICULTY, number> = {
  [DIFFICULTY.EASY]: 3,
  [DIFFICULTY.MEDIUM]: 2,
  [DIFFICULTY.HARD]: 1,
};

export const MAX_REPETITION_COUNT = 5;
