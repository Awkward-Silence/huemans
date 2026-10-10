import { z } from "zod";

/**
 * The colour groups an attendee can be sorted into.
 * This is the group's identity; how each one looks lives in the theme.
 */
const GROUP_COLORS = ["amber", "coral", "teal", "violet"] as const;

const GroupColorSchema = z.enum(GROUP_COLORS);

type GroupColor = z.infer<typeof GroupColorSchema>;

export { GROUP_COLORS, GroupColorSchema };
export type { GroupColor };
