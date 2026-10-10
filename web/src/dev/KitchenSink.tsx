import { useState, type ReactNode } from "react";
import { GROUP_COLORS, type GroupColor } from "../domain/groupColor.ts";
import { resetSession } from "../features/join/session.ts";
import { groupVars, themes, useTheme, type ThemeName } from "../theme/index.ts";
import {
  AnswerOption,
  Button,
  Chip,
  ColorBlades,
  ColorLoader,
  ColorOrbs,
  Countdown,
  Eyebrow,
  FitText,
  GroupBars,
  Heading,
  InfoCard,
  ProgressBar,
  PulseDot,
  SegmentedProgress,
  Stack,
  Text,
  TextField,
} from "../ui/index.ts";
import styles from "./KitchenSink.module.css";

/* Dev-only page: copy here is sample text on purpose, not app copy. */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <Eyebrow as="h2">{title}</Eyebrow>
      {children}
    </section>
  );
}

function KitchenSink() {
  const { name, setTheme } = useTheme();
  const [group, setGroup] = useState<GroupColor>("teal");

  return (
    <main className={styles.page} style={groupVars(group)}>
      <Stack gap="2xl">
        <Heading scale="headline">Kitchen sink</Heading>

        <Section title="Theme">
          <Stack direction="row" gap="xs" wrap>
            {(Object.keys(themes) as ThemeName[]).map((theme) => (
              <Button
                key={theme}
                size="md"
                block={false}
                variant={theme === name ? "light" : "ghost"}
                onClick={() => setTheme(theme)}
              >
                {theme}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" gap="xs" wrap>
            {GROUP_COLORS.map((color) => (
              <Button
                key={color}
                size="md"
                block={false}
                variant={color === group ? "group" : "ghost"}
                onClick={() => setGroup(color)}
              >
                {color}
              </Button>
            ))}
          </Stack>
          <Button size="md" block={false} variant="ghost" onClick={() => resetSession("demo")}>
            Reset the demo session
          </Button>
        </Section>

        <Section title="Type scale">
          <Text scale="displayXL">Teal</Text>
          <Text scale="headline">Ana, you're sorted.</Text>
          <Text scale="title">What should people call you?</Text>
          <Text scale="question">What's your buffet strategy?</Text>
          <Text scale="subtitle">The Manual Readers</Text>
          <Text scale="lead">Four colours in this room.</Text>
          <Text scale="bodyL">Body large</Text>
          <Text>Body</Text>
          <Text scale="caption" tone="muted">
            Caption, muted
          </Text>
          <Eyebrow>Eyebrow</Eyebrow>
          <FitText text="Maximiliana" scale="badge" />
        </Section>

        <Section title="Buttons">
          <Button icon="arrowRight">Light</Button>
          <Button variant="group">Group</Button>
          <Button nudge>Nudge</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <div className={styles.groupPanel}>
            <Button variant="groupInk">Group ink</Button>
          </div>
        </Section>

        <Section title="Progress">
          <ProgressBar value={0.68} />
          <ProgressBar value={0.92} tone="text" />
          <SegmentedProgress total={3} current={0} />
          <SegmentedProgress total={5} current={2} palette="groups" size="sm" />
          <Countdown seconds={17} unit="s" srLabel={(s) => `${s} seconds left`} />
          <Countdown
            seconds={108}
            format="clock"
            tone="groupText"
            srLabel={(s) => `${s} seconds left`}
          />
        </Section>

        <Section title="Inputs">
          <TextField
            label="What should people call you?"
            description="Description"
            hint="Hint"
            placeholder="Ana"
          />
          <TextField label="With an error" error="Type a name first." defaultValue="" />
          <AnswerOption keyLabel="A">Scout the entire buffet first</AnswerOption>
          <AnswerOption keyLabel="B" selected>
            Dessert first. Life is short
          </AnswerOption>
        </Section>

        <Section title="Cards and chips">
          <Stack direction="row" gap="xs" wrap>
            <Chip tone="accent">food</Chip>
            <Chip>analytical</Chip>
            <PulseDot />
          </Stack>
          <ColorLoader />
          <InfoCard title="Why teal and not violet">
            <Text>Your answers leaned 52% teal and 48% violet.</Text>
          </InfoCard>
          <InfoCard tone="group">
            <Heading scale="question" tone="groupInk">
              What's the last thing you quietly replaced?
            </Heading>
          </InfoCard>
        </Section>

        <Section title="Room">
          <GroupBars
            youLabel="you"
            label="Group sizes"
            groups={GROUP_COLORS.map((color, index) => ({
              color,
              label: color,
              count: [9, 14, 12, 13][index] ?? 0,
              isYou: color === group,
            }))}
          />
        </Section>

        <Section title="Backdrops">
          <div className={styles.backdrop}>
            <ColorBlades />
          </div>
          <div className={styles.backdrop}>
            <ColorOrbs />
          </div>
        </Section>
      </Stack>
    </main>
  );
}

export { KitchenSink };
