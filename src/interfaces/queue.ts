export interface IQueue<T> {
  enqueue(message: T): Promise<void>;
  dequeue(): Promise<T | null>;
  disconnect(): Promise<void>;
}
