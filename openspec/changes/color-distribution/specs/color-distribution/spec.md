# Spec Delta

## Purpose

Splits the attendees of an event into four even color groups that each mix different personality types, and exposes each attendee's group and the live distribution of the event.

## ADDED Requirements

### Requirement: Distribution opens with every new event
The system SHALL open a distribution when an event is created, containing the four color groups RED, YELLOW, GREEN and BLUE, all empty. An event SHALL have exactly one distribution.

#### Scenario: New event starts with four empty groups
- **WHEN** an event is created
- **THEN** the event's distribution lists RED, YELLOW, GREEN and BLUE, each with 0 members and no personality types

#### Scenario: Event created twice does not duplicate its distribution
- **WHEN** the creation of the same event is reported a second time
- **THEN** the event still has exactly one distribution and its existing assignments are unchanged

### Requirement: Personality type comes from the attendee's traits
The system SHALL give each assigned attendee exactly one of 4 personality types. Each trait maps to exactly one personality type through the catalog's trait-type mapping. The attendee's candidate types SHALL be the types that the most of their traits map to; every occurrence of a trait counts. A trait profile SHALL contain at least one trait.

#### Scenario: Clear majority decides the type
- **WHEN** an attendee's trait profile has 3 traits mapping to explorer and 1 mapping to planner
- **THEN** the attendee's personality type is explorer

#### Scenario: Repeated trait counts every time
- **WHEN** an attendee's trait profile is curious, curious, sociable, where curious maps to explorer and sociable maps to connector
- **THEN** the attendee's personality type is explorer

#### Scenario: Empty trait profile is rejected
- **WHEN** an attendee is submitted for distribution with no traits
- **THEN** the attendee is not assigned and the request is rejected as invalid

### Requirement: Groups stay even and mix personality types
The system SHALL assign each attendee to one of the groups with the fewest members, choosing the group with the fewest members of the attendee's personality type. When the attendee is tied between personality types, the system SHALL choose the group and type pair where that type is least represented in the group, and the attendee takes that type. Remaining ties SHALL be broken in the order RED, YELLOW, GREEN, BLUE. Group sizes SHALL never differ by more than 1.

#### Scenario: First attendees fill groups in color order
- **WHEN** the first four attendees of an event are assigned and all have the personality type explorer
- **THEN** they are assigned to RED, YELLOW, GREEN and BLUE in that order

#### Scenario: Smallest groups come first
- **WHEN** RED, YELLOW and GREEN have 2 members each, BLUE has 1, and a new attendee is assigned
- **THEN** the attendee is assigned to BLUE, whatever their personality type

#### Scenario: Attendee joins the group lacking their type
- **WHEN** all four groups have 1 member, RED and YELLOW already have an explorer, GREEN and BLUE do not, and a new explorer is assigned
- **THEN** the attendee is assigned to GREEN

#### Scenario: Tied attendee takes the type the group lacks
- **WHEN** every group has 2 members (RED: explorer and planner, YELLOW: explorer and planner, GREEN: explorer and connector, BLUE: planner and connector) and a new attendee's traits are tied between explorer and planner
- **THEN** the attendee is assigned to GREEN with the personality type planner, because GREEN lacking a planner and BLUE lacking an explorer tie, and GREEN comes first in color order

#### Scenario: Sizes never drift apart
- **WHEN** 13 attendees with any personality types are assigned to one event
- **THEN** one group has 4 members and the other three have 3 members each

### Requirement: Assignments are final
The system SHALL assign an attendee at most once per event. Once made, an attendee's color and personality type SHALL never change, including when the night's icebreaker is revealed or other attendees join later. Attendees who leave SHALL still count in their group.

#### Scenario: Second completion keeps the first assignment
- **WHEN** an attendee who is already assigned to RED as explorer completes the questionnaire again
- **THEN** the attendee remains RED with personality type explorer and no second assignment is made

#### Scenario: Late joiner after the icebreaker reveal
- **WHEN** the event's icebreaker has been revealed and a new attendee completes the questionnaire
- **THEN** the attendee is assigned a color and personality type like any other attendee

### Requirement: Assignment is announced
The system SHALL publish `AttendeeGrouped` with the event id, attendee id, color and personality type every time an attendee is assigned, and only after the assignment has been stored.

#### Scenario: Assignment publishes AttendeeGrouped
- **WHEN** an attendee is assigned to YELLOW as connector
- **THEN** an `AttendeeGrouped` event is published with that attendee's event id, attendee id, color YELLOW and personality type connector

#### Scenario: Rejected assignment publishes nothing
- **WHEN** an assignment is rejected because the attendee is already assigned
- **THEN** no `AttendeeGrouped` event is published

### Requirement: Live distribution of an event
The system SHALL return an event's distribution: for each of the four colors, the number of members and the personality type of each member. All four colors SHALL always be present, and only the requested event's assignments SHALL be included. An unknown event SHALL be reported as not found.

#### Scenario: Distribution reflects assignments
- **WHEN** an event has RED with an explorer and a planner, and YELLOW with a connector
- **THEN** the distribution shows RED with 2 members (explorer, planner), YELLOW with 1 (connector), and GREEN and BLUE with 0

#### Scenario: Other events are not included
- **WHEN** two events each have assigned attendees and the distribution of the first is requested
- **THEN** only the first event's attendees are counted

#### Scenario: Unknown event
- **WHEN** the distribution of an event that does not exist is requested
- **THEN** the request is answered as not found

### Requirement: Attendee can read their own assignment
The system SHALL return an attendee's color and personality type for a given event, so the reveal screen works after a reload or a missed realtime update. An attendee who has not been assigned yet SHALL be reported as not assigned.

#### Scenario: Assigned attendee reads their group
- **WHEN** an attendee assigned to BLUE as dreamer requests their assignment
- **THEN** the response contains color BLUE and personality type dreamer

#### Scenario: Attendee not assigned yet
- **WHEN** an attendee who has not completed the questionnaire requests their assignment
- **THEN** the request is answered as not assigned
