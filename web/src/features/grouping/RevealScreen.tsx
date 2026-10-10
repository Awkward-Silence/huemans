import { useQuery } from "@tanstack/react-query";
import { quizQuery } from "../../api/queries.ts";
import { copy } from "../../content/index.ts";
import {
  ButtonLink,
  Chip,
  Eyebrow,
  FloodReveal,
  Heading,
  Rise,
  Screen,
  Stack,
  Text,
} from "../../ui/index.ts";
import { useJoinedSession } from "../join/session.ts";
import { STEP_ROUTES } from "../join/steps.ts";
import { sentenceStatus } from "../quiz/progress.ts";
import { AssignedGroupGate } from "./AssignedGroupGate.tsx";
import styles from "./RevealScreen.module.css";

/** When the content starts rising, relative to the flood. */
const CONTENT_AFTER = "0.55s";

/** Step 5: the colour floods the screen, with the attendee's sentence if they finished it. */
function RevealScreen({ eventId }: { eventId: string }) {
  const session = useJoinedSession(eventId);
  const sentenceQuestion = useQuery(quizQuery(eventId)).data?.sentence;
  const sentence =
    sentenceQuestion &&
    sentenceStatus(sentenceQuestion, session.sentence, session.sentenceSkipped) === "done"
      ? [sentenceQuestion.starter, ...session.sentence].join(" ")
      : undefined;

  return (
    <AssignedGroupGate eventId={eventId}>
      {(group) => {
        const colorName = copy.groups[group.color];
        return (
          <Screen group={group.color} backdrop={<FloodReveal />} className={styles.content}>
            <Stack gap="md">
              <Rise step={0} after={CONTENT_AFTER}>
                <Eyebrow tone="groupInkSoft">{copy.reveal.eyebrow}</Eyebrow>
              </Rise>
              <Rise step={1} after={CONTENT_AFTER}>
                <Heading scale="displayXL" tone="groupInk">
                  {colorName}
                </Heading>
              </Rise>
              <Rise step={2} after={CONTENT_AFTER}>
                <Text scale="subtitle" tone="groupInk">
                  {group.nickname}
                </Text>
              </Rise>
              <Rise step={3} after={CONTENT_AFTER}>
                <Text scale="bodyL" tone="groupInkSoft" measure={26}>
                  {group.blurb}
                </Text>
              </Rise>
              <Rise step={4} after={CONTENT_AFTER}>
                <Stack direction="row" gap="xs" wrap>
                  {group.traits.map((trait) => (
                    <Chip key={trait}>{trait}</Chip>
                  ))}
                </Stack>
              </Rise>
              {sentence && (
                <Rise step={5} after={CONTENT_AFTER}>
                  <Stack gap="2xs" className={styles.sentence}>
                    <Eyebrow tone="groupInkSoft">{copy.reveal.sentenceLabel}</Eyebrow>
                    <Text scale="cta" tone="groupInk">
                      {copy.reveal.sentence(sentence)}
                    </Text>
                  </Stack>
                </Rise>
              )}
            </Stack>

            <Stack pushEnd className={styles.footer}>
              <Rise step={sentence ? 6 : 5} after={CONTENT_AFTER}>
                <Stack gap="lg">
                  <Stack direction="row" gap="sm" align="baseline">
                    <Text as="span" scale="stat" tone="groupInk" tabular>
                      {group.mates}
                    </Text>
                    <Text as="span" scale="body" tone="groupInkSoft" measure={16}>
                      {copy.reveal.mates(colorName)}
                    </Text>
                  </Stack>
                  <ButtonLink to={STEP_ROUTES.icebreaker} params={{ eventId }} variant="groupInk">
                    {copy.reveal.cta}
                  </ButtonLink>
                </Stack>
              </Rise>
            </Stack>
          </Screen>
        );
      }}
    </AssignedGroupGate>
  );
}

export { RevealScreen };
