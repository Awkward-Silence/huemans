import { AssignmentDTO } from './Assignment';

/** An attendee's assignment with the current size of their group, which keeps growing as others join it. */
export interface AttendeeAssignmentView extends AssignmentDTO {
  groupMembers: number;
}
