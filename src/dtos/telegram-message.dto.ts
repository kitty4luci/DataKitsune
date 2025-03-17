export class TelegramMessage {
  id: string;
  chatId: string;
  userId: string;
  username: string;
  text: string;
  entities: any[];

  constructor(
    id: string,
    chatId: string,
    userId: string,
    username: string,
    text: string,
    entities: any[]
  ) {
    this.id = id;
    this.chatId = chatId;
    this.userId = userId;
    this.username = username;
    this.text = text;
    this.entities = entities;
  }
}
