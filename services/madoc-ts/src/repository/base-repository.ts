import { DatabasePoolConnectionType, DatabaseTransactionConnectionType } from 'slonik';

export class BaseRepository {
  connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType;
  constructor(connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType) {
    this.connection = connection;
  }
}
