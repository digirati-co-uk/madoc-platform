import { DatabasePoolConnectionType, DatabaseTransactionConnectionType } from 'slonik';

export class BaseRepository<Flags extends string = string> {
  connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType;
  flags: Record<Flags, boolean>;
  constructor(
    connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType,
    flags?: Record<string, boolean>
  ) {
    this.connection = connection;
    this.flags = flags || {};
  }
}
