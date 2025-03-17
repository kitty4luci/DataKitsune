export interface IWorker<T> {
  start(): Promise<void>;
  stop(): Promise<void>;
  state(): { running: boolean };
}
