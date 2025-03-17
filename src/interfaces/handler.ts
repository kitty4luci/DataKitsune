export interface IHandler<T> {
  handle(data: T): Promise<void>;
}
