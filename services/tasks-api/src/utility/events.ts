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

type Event<Prefix extends EventPrefix, Value extends any = never> = Value extends never ? [Prefix] : [Prefix, Value];

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

export function parseEvent<E extends AnyEvent>(event: string): E | undefined {
  const [prefix, value, value2] = event.split('.') as
    | [EventPrefix, string, string]
    | [EventPrefix, string]
    | [EventPrefix];

  if (eventPrefixes.indexOf(prefix) === -1) {
    return undefined;
  }

  if (prefix === 'subtask_type_status') {
    return [prefix, `${value}.${value2}`] as E;
  }

  if (standaloneEvents.indexOf(prefix) === -1) {
    return [prefix] as any;
  }

  return [prefix, value] as E;
}

export function parseEvents(events: string[] = []): AnyEvent[] {
  return events.map(parseEvent).filter(ev => ev !== undefined) as AnyEvent[];
}

export function validateEvents(events: string[]) {
  const parsed = parseEvents(events);
  if (parsed.length === 0) {
    return undefined;
  }
  return parsed.map(([prefix, value]) => {
    return `${prefix}${value ? `.${value}` : ''}`;
  });
}

export async function ifEvent<Prefix extends EventPrefix>(
  event: Prefix,
  events: string[] = [],
  callback: (value: FromPrefix<Prefix>) => void
) {
  const parsed = parseEvents(events);
  for (const [prefix, arg] of parsed) {
    if (prefix === event) {
      await (callback as any)(prefix, arg);
    }
  }
}
