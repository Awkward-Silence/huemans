import { AssignmentDTO } from './Assignment';

export interface AttendeeAssignmentView extends AssignmentDTO {
  /** The other attendees in the same group; keeps growing as others join it. */
  mates: number;
}
