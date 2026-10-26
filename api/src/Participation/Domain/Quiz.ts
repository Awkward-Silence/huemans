import { EventId } from '@Huemans/Shared/Domain/ValueObject/EventId';
import { QuizView } from './QuizView';
import { QuizQuestion } from './ValueObject/QuizQuestion';
import { QuizSettings } from './ValueObject/QuizSettings';
import { SentenceQuestion } from './ValueObject/SentenceQuestion';

/**
 * The questions an event asks, picked from the event id alone: every phone, and every restart, gets the same quiz
 * without storing it (catalog content is frozen once seeded).
 */
export class Quiz {
  private constructor(
    private readonly questions: readonly QuizQuestion[],
    private readonly settings: QuizSettings,
  ) {}

  static for(eventId: EventId, catalog: readonly QuizQuestion[], settings: QuizSettings): Quiz {
    const shuffled = shuffle(
      [...catalog].sort((a, b) => a.id.localeCompare(b.id)),
      seededRandom(fnv1a(eventId.value)),
    );
    const picked: QuizQuestion[] = [];
    const themes = new Set<string>();
    for (const question of shuffled) {
      if (picked.length < settings.questionCount && !themes.has(question.theme)) {
        picked.push(question);
        themes.add(question.theme);
      }
    }
    for (const question of shuffled) {
      if (picked.length < settings.questionCount && !picked.includes(question)) {
        picked.push(question);
      }
    }

    return new Quiz(picked, settings);
  }

  toDTO(): QuizView {
    return {
      questions: this.questions.map((question) => question.toPrimitives()),
      durationSeconds: this.settings.durationSeconds,
      sentence: SentenceQuestion.standard().toPrimitives(),
    };
  }
}

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: a tiny seeded PRNG, so the shuffle depends on the seed only. */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}
