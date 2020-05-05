export type EventPrefix =
  | 'created'
  | 'modified'
  | 'assigned'
  | 'assigned_to'
  | 'status'
  | 'subtask_created'
  | 'subtask_type_created'
  | 'subtask_status'
  | 'subtask_type_status'
  | 'deleted';

export const eventPrefixes: EventPrefix[] = [
  'created',
  'modified',
  'assigned',
  'assigned_to',
  'status',
  'subtask_created',
  'subtask_type_created',
  'subtask_status',
  'subtask_type_status',
  'deleted',
];

export const standaloneEvents: EventPrefix[] = [
  'created',
  'modified',
  'assigned',
  'subtask_created',
  'deleted',
  'subtask_status',
];

type Event<Prefix extends EventPrefix, Value extends any = never> = Value extends never
  ? [string, Prefix]
  : [string, Prefix, Value];

export type CreatedEvent = Event<'created'>;
export type Modified = Event<'modified'>;
export type Assigned = Event<'assigned'>;
export type SubtaskCreated = Event<'subtask_created'>;
export type Deleted = Event<'deleted'>;
export type AssignedTo = Event<'assigned_to', string>;
export type StatusChanged = Event<'status', string>;
export type SubtaskOfTypeCreated = Event<'subtask_type_created', string>;
export type SubtaskStatus = Event<'subtask_status', number>;
export type SubtaskTypeStatus = Event<'subtask_type_status', string>;

export type AnyEvent =
  | CreatedEvent
  | Modified
  | Assigned
  | SubtaskCreated
  | AssignedTo
  | StatusChanged
  | SubtaskOfTypeCreated
  | SubtaskStatus
  | SubtaskTypeStatus;

export type FromPrefix<Prefix extends EventPrefix, A extends AnyEvent = AnyEvent> = A extends Event<Prefix, infer Value>
  ? Value
  : never;

export function parseEvent<E extends AnyEvent>(event: string, queueList: string[]): E | undefined {
  const [queue, prefix, value, value2] = event.split('.') as
    | [string, EventPrefix, string, string]
    | [string, EventPrefix, string]
    | [string, EventPrefix];

  if (queueList.indexOf(queue) === -1) {
    return undefined;
  }

  if (eventPrefixes.indexOf(prefix) === -1) {
    return undefined;
  }

  if (prefix === 'subtask_type_status') {
    return [queue, prefix, `${value}.${value2}`] as E;
  }

  if (standaloneEvents.indexOf(prefix) === -1) {
    return [queue, prefix] as any;
  }

  return [queue, prefix, value] as E;
}

export function parseEvents(events: string[] = [], queueList: string[] = []): AnyEvent[] {
  return events.map(e => parseEvent(e, queueList)).filter(ev => ev !== undefined) as AnyEvent[];
}

export function validateEvents(events: string[], queueList: string[]) {
  const parsed = parseEvents(events, queueList);
  if (parsed.length === 0) {
    return undefined;
  }
  return parsed.map(([queue, prefix, value]) => {
    return `${queue}.${prefix}${value ? `.${value}` : ''}`;
  });
}

export async function ifEvent<Prefix extends EventPrefix>(
  event: Prefix,
  events: string[] = [],
  callback: (value: FromPrefix<Prefix>) => void
) {
  const parsed = parseEvents(events);
  for (const [, prefix, arg] of parsed) {
    if (prefix === event) {
      await (callback as any)(prefix, arg);
    }
  }
}
