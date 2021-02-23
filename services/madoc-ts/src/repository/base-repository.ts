import { DatabasePoolConnectionType, DatabaseTransactionConnectionType } from 'slonik';
import { PageBlocksRepository } from './page-blocks-repository';

export class BaseRepository {
  connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType;
  constructor(connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType) {
    this.connection = connection;
  }
}

export const Transaction = (target: BaseRepository, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  const targetConnection = target.connection;

  descriptor.value = function(...args: any[]) {
    return targetConnection.transaction(connection => {
      const newRepo = new PageBlocksRepository(connection);
      return originalMethod.apply(newRepo, args);
    });
  };

  return descriptor;
};
