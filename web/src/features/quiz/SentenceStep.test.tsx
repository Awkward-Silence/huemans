import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createSentenceTreeLoader } from "../../api/sentenceTree.ts";
import { sentenceTree as bundledTree } from "../../content/index.ts";
import type { SentenceTree } from "../../domain/sentence.ts";
import { SentenceStep } from "./SentenceStep.tsx";

const apiTree: SentenceTree = {
  ...bundledTree,
  options: bundledTree.options.map((option, index) => ({ ...option, text: `ai word ${index}` })),
};
const loaded = { current: undefined as SentenceTree | undefined };
vi.mock("../../api/sentenceTree.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../api/sentenceTree.ts")>()),
  useSentenceTree: () => loaded.current,
}));

const question = { id: "sentence-i", starter: "I", picks: 5 };
const renderStep = (picks: string[], onPick = vi.fn()) =>
  render(
    <SentenceStep
      question={question}
      picks={picks}
      timeUp={false}
      onPick={onPick}
      onSkip={vi.fn()}
    />,
  );

describe("SentenceStep", () => {
  it("shows placeholders while the tree is still undecided", () => {
    loaded.current = undefined;
    renderStep([]);
    expect(screen.queryAllByRole("button", { name: /loudly/ })).toHaveLength(0);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("offers the tree's options for the next pick", async () => {
    loaded.current = bundledTree;
    const onPick = vi.fn();
    renderStep(["loudly"], onPick);
    await userEvent.click(screen.getByRole("button", { name: "apologise to" }));
    expect(onPick).toHaveBeenCalledWith("apologise to");
  });

  it("uses the tree it is given", () => {
    loaded.current = apiTree;
    renderStep([]);
    expect(screen.getByRole("button", { name: "ai word 0" })).toBeInTheDocument();
  });
});

describe("useSentenceTree", () => {
  it("renders the chosen tree once the loader decides", async () => {
    vi.useFakeTimers();
    const { useSentenceTree: realHook } = await vi.importActual<
      typeof import("../../api/sentenceTree.ts")
    >("../../api/sentenceTree.ts");
    const loader = createSentenceTreeLoader(() => new Promise(() => {}), bundledTree);
    const { result } = renderHook(() => realHook(loader));
    expect(result.current).toBeUndefined();
    await act(() => vi.advanceTimersByTimeAsync(400));
    expect(result.current).toBe(bundledTree);
    vi.useRealTimers();
  });
});
