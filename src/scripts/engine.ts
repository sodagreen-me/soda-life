import type { PlayerState } from './state';
import { applyChoiceEffects, recordChoice } from './state';
import { saveGame } from './save';

export interface ChoiceData {
  text: string;
  nextEvent?: string;
  effects?: {
    setFlags?: Record<string, boolean>;
    probabilityModifiers?: Record<string, number>;
  };
}

export interface EventData {
  id: string;
  title: string;
  scene: string;
  year: number;
  age: number;
  body: string;
  choices: ChoiceData[];
}

type EventMap = Record<string, EventData>;

let events: EventMap = {};

export function setEvents(data: EventMap) {
  events = data;
}

export function getEvent(id: string): EventData | undefined {
  return events[id];
}

export function processChoice(
  state: PlayerState,
  choiceIndex: number
): PlayerState {
  const event = events[state.currentEvent];
  if (!event) return state;

  const choice = event.choices[choiceIndex];
  if (!choice) return state;

  let newState = recordChoice(state, state.currentEvent, choiceIndex, event.year);

  if (choice.effects) {
    newState = applyChoiceEffects(newState, choice.effects);
  }

  if (choice.nextEvent) {
    newState = { ...newState, currentEvent: choice.nextEvent };
  }

  saveGame(newState);
  return newState;
}

export function getNextEventId(
  state: PlayerState,
  choiceIndex: number
): string | undefined {
  const event = events[state.currentEvent];
  if (!event) return undefined;
  const choice = event.choices[choiceIndex];
  return choice?.nextEvent;
}
