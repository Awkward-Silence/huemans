import type { ReactNode } from "react";
import { cx } from "../lib/cx.ts";
import styles from "./InfoCard.module.css";
import { Stack } from "./Stack.tsx";
import { Eyebrow } from "./Text.tsx";

type InfoCardProps = {
  /** Optional eyebrow title. */
  title?: string;
  /** "outline": hairline border on the page. "group": filled with the group colour. */
  tone?: "outline" | "group";
  className?: string;
  children: ReactNode;
};

function InfoCard({ title, tone = "outline", className, children }: InfoCardProps) {
  return (
    <section className={cx(styles.card, styles[tone], className)}>
      <Stack gap="sm">
        {title && <Eyebrow as="h2">{title}</Eyebrow>}
        {children}
      </Stack>
    </section>
  );
}

export { InfoCard };
