import { SentenceOptionView } from '@Huemans/Agents/Domain/SentenceTreeView';
import { SentenceTree } from '@Huemans/Agents/Domain/SentenceTree';
import { InvalidArgumentError } from '@Huemans/Shared/Domain/InvalidArgumentError';
import { completeDraft, textsOf } from './SentenceTreeDraftMother';

const leavesOf = (options: SentenceOptionView[]): SentenceOptionView[] =>
  options.flatMap((option) => (option.next.length === 0 ? [option] : leavesOf(option.next)));

describe('SentenceTree', () => {
  it('testGrowsTheIStarterWithFivePicks', () => {
    const tree = SentenceTree.grow(completeDraft()).toDTO();

    expect(tree).toMatchObject({ id: 'sentence-i', starter: 'I', picks: 5 });
    expect(textsOf(tree.options)).toEqual(['loudly a', 'happily a', 'secretly a']);
  });

  it('testHolds243Sentences', () => {
    expect(leavesOf(SentenceTree.grow(completeDraft()).toDTO().options)).toHaveLength(243);
  });

  it('testNumbersEachOptionByItsPath', () => {
    const tree = SentenceTree.grow(completeDraft()).toDTO();

    expect(tree.options[1].id).toBe('2');
    expect(tree.options[1].next[2].id).toBe('2.3');
    expect(leavesOf(tree.options).at(-1)?.id).toBe('3.3.3.3.3');
  });

  it('testKeepsTheFirstThreeOptionsOfAPick', () => {
    const tree = SentenceTree.grow(completeDraft(5, 4)).toDTO();

    expect(textsOf(tree.options)).toEqual(['loudly a', 'happily a', 'secretly a']);
    expect(leavesOf(tree.options)).toHaveLength(243);
  });

  it('testSkipsAnOptionWithAnUnknownTrait', () => {
    const draft = completeDraft(5, 4);
    draft[0].trait = 'grumpy';

    expect(textsOf(SentenceTree.grow(draft).toDTO().options)).toEqual(['happily a', 'secretly a', 'politely a']);
  });

  it('testSkipsAnOptionThatRepeatsASibling', () => {
    const draft = completeDraft(5, 4);
    draft[1].text = 'LOUDLY A';

    expect(textsOf(SentenceTree.grow(draft).toDTO().options)).toEqual(['loudly a', 'secretly a', 'politely a']);
  });

  it('testSkipsAnOptionWhoseNextPicksAreIncomplete', () => {
    const draft = completeDraft(5, 4);
    draft[0].next![0].next![0].next![0].next = [];

    expect(textsOf(SentenceTree.grow(draft).toDTO().options[0].next[0].next[0].next)).toEqual([
      'happily d',
      'secretly d',
      'politely d',
    ]);
  });

  it('testDropsWhatFollowsTheLastPick', () => {
    const draft = completeDraft(6);

    expect(leavesOf(SentenceTree.grow(draft).toDTO().options)[0].id).toBe('1.1.1.1.1');
  });

  it('testRejectsATreeWithFewerThanThreeUsableOptions', () => {
    const draft = completeDraft();
    draft[2].text = '';

    expect(() => SentenceTree.grow(draft)).toThrow(InvalidArgumentError);
  });

  it('testRejectsATreeThatEndsEarly', () => {
    expect(() => SentenceTree.grow(completeDraft(4))).toThrow(InvalidArgumentError);
  });
});
