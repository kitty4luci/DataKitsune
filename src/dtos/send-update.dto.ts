export class SendUpdateDto {
  messenger: string;
  userId: string;

  constructor(messenger: string, userId: string) {
    this.messenger = messenger;
    this.userId = userId;
  }
}
