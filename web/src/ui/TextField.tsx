import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import { Stack } from "./Stack.tsx";
import { Text } from "./Text.tsx";
import styles from "./TextField.module.css";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  /** Big question-style label. */
  label: ReactNode;
  description?: ReactNode;
  /** Shown under the input while there is no error. */
  hint?: ReactNode;
  error?: ReactNode;
};

/** A single large text input with its question, description and hint. */
function TextField({ label, description, hint, error, className, ...input }: TextFieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const messageId = `${id}-message`;
  return (
    <Stack gap="2xl" className={className}>
      <Stack gap="md">
        <Text as="label" htmlFor={id} scale="title">
          {label}
        </Text>
        {description && (
          <Text id={descriptionId} scale="small" tone="muted">
            {description}
          </Text>
        )}
      </Stack>
      <Stack gap="sm">
        <input
          id={id}
          className={cx(styles.input, error ? styles.invalid : undefined)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(description ? descriptionId : undefined, messageId)}
          {...input}
        />
        <Text id={messageId} scale="caption" tone={error ? "danger" : "muted"} aria-live="polite">
          {error ?? hint}
        </Text>
      </Stack>
    </Stack>
  );
}

export { TextField };
