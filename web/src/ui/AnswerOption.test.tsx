import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnswerOption } from "./AnswerOption.tsx";
import { TextField } from "./TextField.tsx";

describe("AnswerOption", () => {
  it("is a button named by its answer text", async () => {
    const onClick = vi.fn();
    render(
      <AnswerOption keyLabel="A" onClick={onClick}>
        Dessert first
      </AnswerOption>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Dessert first" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("TextField", () => {
  it("labels the input and announces errors instead of the hint", () => {
    const { rerender } = render(<TextField label="Your name" hint="12 max" />);
    const input = screen.getByLabelText("Your name");
    expect(input).toHaveAccessibleDescription("12 max");

    rerender(<TextField label="Your name" hint="12 max" error="Type a name first." />);
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Type a name first.");
  });
});
