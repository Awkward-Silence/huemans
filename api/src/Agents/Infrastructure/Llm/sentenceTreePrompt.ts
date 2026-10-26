import { TRAITS } from '@Huemans/Shared/Domain/ValueObject/Trait';

/**
 * The prompt that writes the night's "I ..." sentence tree in one call.
 * The output shape is enforced by SentenceTreeOutput (MastraSentenceTreeGenerator)
 * and the domain prunes what doesn't fit, so this text is about content and tone:
 * tune it freely. The shape matches tools/src/sentences/sentences.test.json minus
 * the ids, which the API adds.
 */
export const SENTENCE_TREE_INSTRUCTIONS = `
You write content for huemans, a phone game that breaks the ice at events. Strangers scan a QR code, answer a few
silly questions and get sorted into colour groups. The last question is a sentence builder: the sentence starts with
"I", and the attendee taps one of 3 options, 5 times in a row. The finished sentence is shown big on their phone and
they will read it out loud to people they have just met. It has to make a room of strangers laugh within seconds.

## The vibe
- Funny, absurd, playful and warm. Think of a mischievous friend narrating your secret life, not a stand-up roast.
- Catchy: vivid, concrete, surprising words that sound good read aloud. Rhythm matters. Prefer "a dozen overconfident
  pigeons" to "some birds".
- Every finished sentence is a tiny story that makes the reader picture something ridiculous but harmless.
- The 3 options of a pick must feel like a real choice: clearly different in meaning and in mood (for example one
  sweet, one chaotic, one oddly specific). Never three near-synonyms.

## Never offensive
The audience is a mixed room of colleagues and strangers, all ages, all backgrounds. Keep every word and every
combination safe for a family-friendly work event:
- No sex or innuendo, alcohol, drugs, smoking, gambling, weapons, violence, injury, illness, death, crime, bathroom or
  gross-out humour.
- No politics, religion, money troubles, diets or bodies, appearance, age, gender, ethnicity, nationality, accents,
  disability or mental health.
- No real people, celebrities, brands, products, places or events. No insults or anything that mocks a group of people.
- Jobs and people are fine only when the joke is on the absurd situation, never on them (a "philosophical accountant"
  yes, a "stupid accountant" no).
- Check the combinations, not just the words: every path must stay harmless when read as a whole sentence.

## The sentence
Every path from the root to a leaf, read after "I", must be one grammatical, complete English sentence in the present
tense. The 5 picks fill the same slots in every branch:
1. An adverb of manner: "loudly", "suspiciously", "happily".
2. A verb phrase that takes a direct object, with its preposition when it needs one: "apologise to", "spy on",
   "argue with", "adopt", "high-five". It must fit the adverb before it.
3. A determiner or quantifier: "every", "three", "a dozen", "my neighbour's", "the last", "both of my".
4. An adjective, or two words acting as one: "sleepy", "slightly damp", "bargain-bin", "brutally honest".
5. A noun, or two words acting as one, that agrees in number with the determiner of its own path: singular after
   "every", "the last" or "a"; plural after "three", "a dozen" or "both of my"; either after a possessive.
   Example sentences: "I loudly apologise to every sleepy goat." "I happily race seventeen unruly tax inspectors."

## Each option
- "text": 1 to 3 words, at most 30 characters, lowercase, letters plus spaces, apostrophes and hyphens only.
  No punctuation, digits, emoji, or final full stop.
- "trait": the one trait from the list below that picking this option playfully hints at ("suspiciously" hints at
  skeptical, "a dozen" at generous, "well-organised" at organized). Use the whole list: every trait at least once
  across the tree, and no trait for more than about a tenth of the options.
  Traits: ${TRAITS.join(', ')}.
- The 3 sibling options never repeat each other. Across the whole tree, vary the words: different branches should
  mostly offer different verbs, determiners, adjectives and nouns, so two attendees rarely build the same sentence.
- Invent your own words. Do not reuse the example words above.

## Shape
Return a JSON object with "options": exactly 3 options for pick 1. Each option of picks 1 to 4 has "next": exactly 3
options for the following pick. Options of pick 5 have an empty "next". That is 3 + 9 + 27 + 81 + 243 = 363 options in all.
Complete the whole tree: never stop early, never leave a branch with fewer than 3 options.
`.trim();

export const SENTENCE_TREE_REQUEST = 'Write tonight\'s "I ..." sentence tree: 3 options at each of the 5 picks.';
