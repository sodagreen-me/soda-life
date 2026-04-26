export interface PlayerState {
  character: string;
  currentEvent: string;
  flags: Record<string, boolean>;
  probabilityModifiers: Record<string, number>;
  history: { eventId: string; choiceIndex: number; year: number }[];
}

export function createInitialState(character: string, startEvent: string): PlayerState {
  return {
    character,
    currentEvent: startEvent,
    flags: {},
    probabilityModifiers: {},
    history: [],
  };
}

export function applyChoiceEffects(
  state: PlayerState,
  effects: {
    setFlags?: Record<string, boolean>;
    probabilityModifiers?: Record<string, number>;
  }
): PlayerState {
  const newFlags = { ...state.flags };
  if (effects.setFlags) {
    Object.entries(effects.setFlags).forEach(([key, value]) => {
      if (value) {
        newFlags[key] = value;
      } else {
        delete newFlags[key];
      }
    });
  }

  const newModifiers = { ...state.probabilityModifiers };
  if (effects.probabilityModifiers) {
    Object.entries(effects.probabilityModifiers).forEach(([key, value]) => {
      newModifiers[key] = (newModifiers[key] ?? 1) * value;
    });
  }

  return {
    ...state,
    flags: newFlags,
    probabilityModifiers: newModifiers,
  };
}

export function recordChoice(
  state: PlayerState,
  eventId: string,
  choiceIndex: number,
  year: number
): PlayerState {
  return {
    ...state,
    history: [...state.history, { eventId, choiceIndex, year }],
  };
}

export function getModifiedProbability(
  state: PlayerState,
  eventType: string,
  baseProbability: number = 1.0
): number {
  const modifier = state.probabilityModifiers[eventType] ?? 1.0;
  return Math.min(1, Math.max(0, baseProbability * modifier));
}
