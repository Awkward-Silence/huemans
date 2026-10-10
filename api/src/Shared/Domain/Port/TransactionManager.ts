export const TRANSACTION_MANAGER = Symbol('TransactionManager');

export interface TransactionManager {
  run<T>(work: () => Promise<T>): Promise<T>;
}
