import { copy } from "../../content/index.ts";
import { ButtonLink, Heading, Screen, Stack, Text } from "../../ui/index.ts";

/** Landing page for anyone who opens the bare URL instead of scanning a QR code. */
function HomeScreen() {
  return (
    <Screen>
      <Stack gap="md" grow justify="center">
        <Heading scale="displayL">{copy.home.title}</Heading>
        <Text scale="lead" measure={20}>
          {copy.home.body}
        </Text>
      </Stack>
      <ButtonLink to="/join/$eventId" params={{ eventId: "demo" }}>
        {copy.home.demoLink}
      </ButtonLink>
    </Screen>
  );
}

export { HomeScreen };
