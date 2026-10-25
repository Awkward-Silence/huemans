import type { EventResponse } from '../../contracts/event';
import type { AttendeeAssignmentResponse, EventDistributionView } from '../../contracts/colorDistribution';
import type { JoinResponse, QuizResponse, SubmitAnswersResponse } from '../../contracts/participation';
import type { AttendeeIcebreakerResponse, HostIcebreakerResponse } from '../../contracts/nightIcebreaker';
import type { RoomResponse } from '../../contracts/room';
import { Choice } from '../Support/room';

// Runs against a live API (E2E_API_URL, default http://localhost:3000) with migrations and the catalog seed applied.
// Every run creates its own event, so it never touches the seeded demo event.
const API_URL = (process.env.E2E_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const PEOPLE = 10;
const MEETING_SPOTS = { amber: 'the bar', coral: 'the entrance', teal: 'the stage', violet: 'the back corner' };

type Person = { name: string; attendeeId: string };

async function call<T>(method: 'GET' | 'POST', path: string, body?: object): Promise<{ status: number; body: T }> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as T };
}

function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

/** One random answer per quiz question, as a person tapping through the quiz would. */
function randomAnswersTo(quiz: QuizResponse): Choice[] {
  return quiz.questions.map((question) => ({
    questionId: question.id,
    answerId: pickRandom(question.answers, 1)[0].id,
  }));
}

describe('A night with 10 virtual people (live API)', () => {
  let eventId: string;
  let quiz: QuizResponse;
  const people: Person[] = [];
  const submitted = new Map<string, SubmitAnswersResponse>();

  beforeAll(async () => {
    const health = await call<{ status: string }>('GET', '/health').catch(() => null);
    if (health?.status !== 200) {
      throw new Error(`No API at ${API_URL}: start it with \`pnpm start:dev\` or set E2E_API_URL`);
    }
  });

  it('testTheHostCreatesAnOpenEvent', async () => {
    const created = await call<EventResponse>('POST', '/events', { name: `E2E night ${new Date().toISOString()}` });

    expect(created.status).toBe(201);
    expect(created.body.status).toBe('open');
    eventId = created.body.id;
  });

  it('testTenPeopleJoinAtOnceAndAllSeeTheSameQuiz', async () => {
    const names = Array.from({ length: PEOPLE }, (_, index) => `Virtual person ${index + 1}`);
    const joins = await Promise.all(
      names.map((name) => call<JoinResponse>('POST', `/events/${eventId}/attendees`, { name })),
    );
    joins.forEach((join, index) => {
      expect(join.status).toBe(201);
      people.push({ name: names[index], attendeeId: join.body.attendeeId });
    });

    const quizzes = await Promise.all(people.map(() => call<QuizResponse>('GET', `/events/${eventId}/quiz`)));
    quiz = quizzes[0].body;
    expect(quiz.questions).toHaveLength(5);
    for (const other of quizzes) {
      expect(other.body).toEqual(quiz);
    }

    const room = await call<RoomResponse>('GET', `/events/${eventId}/room`);
    expect(room.body).toMatchObject({ total: PEOPLE, answered: 0 });
  });

  it('testEveryoneAnswersAtOnceAndGetsAGroup', async () => {
    const responses = await Promise.all(
      people.map((person) =>
        call<SubmitAnswersResponse>('POST', `/events/${eventId}/attendees/${person.attendeeId}/answers`, {
          answers: randomAnswersTo(quiz),
          elapsedMs: 15_000,
          sentence: null,
        }),
      ),
    );

    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('assigned');
      submitted.set(people[index].attendeeId, response.body);
    });
  });

  it('testEachPhoneReadsBackTheGroupItWasGiven', async () => {
    for (const person of people) {
      const assignment = await call<AttendeeAssignmentResponse>(
        'GET',
        `/events/${eventId}/attendees/${person.attendeeId}/assignment`,
      );

      expect(assignment.body).toMatchObject({
        status: 'assigned',
        color: submitted.get(person.attendeeId)?.color,
        personalityType: submitted.get(person.attendeeId)?.personalityType,
      });
    }
  });

  it('testTheTenPeopleAreSpreadEvenlyAcrossTheFourColors', async () => {
    const distribution = await call<EventDistributionView>('GET', `/events/${eventId}/distribution`);
    const room = await call<RoomResponse>('GET', `/events/${eventId}/room`);
    const sizes = distribution.body.groups.map((group) => group.members);

    printDistribution(distribution.body, people, submitted);
    expect(sizes.reduce((sum, size) => sum + size, 0)).toBe(PEOPLE);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(room.body).toMatchObject({ total: PEOPLE, answered: PEOPLE });
    for (const group of distribution.body.groups) {
      const members = [...submitted.values()].filter((assigned) => assigned.color === group.color);
      expect(group.personalityTypes.sort()).toEqual(members.map((member) => member.personalityType).sort());
      expect(room.body.groups.find((roomGroup) => roomGroup.color === group.color)?.count).toBe(group.members);
    }
  });

  it('testTheIcebreakerStaysLockedUntilTheReveal', async () => {
    const host = await call<HostIcebreakerResponse>('GET', `/events/${eventId}/icebreaker`);

    expect(host.body).toEqual({ status: 'locked' });
  });

  it('testAfterTheRevealEveryoneSharesOneIcebreakerAndMeetsAtTheirColorsSpot', async () => {
    const revealed = await call<EventResponse>('POST', `/events/${eventId}/reveal`);
    expect(revealed.body.status).toBe('revealed');

    const host = await call<HostIcebreakerResponse>('GET', `/events/${eventId}/icebreaker`);
    expect(host.body.status).toBe('ready');
    if (host.body.status !== 'ready') return;
    console.log(`Icebreaker: "${host.body.question}"\nWhy: ${host.body.why}`);

    for (const person of people) {
      const icebreaker = await call<AttendeeIcebreakerResponse>(
        'GET',
        `/events/${eventId}/attendees/${person.attendeeId}/icebreaker`,
      );
      expect(icebreaker.body).toEqual({
        status: 'ready',
        question: host.body.question,
        why: host.body.why,
        gatherEndsAt: host.body.gatherEndsAt,
        meetingSpot: MEETING_SPOTS[submitted.get(person.attendeeId)!.color],
      });
    }
  });
});

function printDistribution(
  distribution: EventDistributionView,
  people: Person[],
  submitted: Map<string, SubmitAnswersResponse>,
): void {
  const lines = distribution.groups.map((group) => {
    const names = people
      .filter((person) => submitted.get(person.attendeeId)?.color === group.color)
      .map((person) => `${person.name} (${submitted.get(person.attendeeId)?.personalityType})`);
    return `${group.color.padEnd(6)} ${group.members}  ${names.join(', ')}`;
  });
  console.log(`Event ${distribution.eventId}\n${lines.join('\n')}`);
}
