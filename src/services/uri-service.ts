export class UriService {
  static isYouTubeUrl(url: string): boolean {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  }

  static isXUrl(url: string): boolean {
    const xRegex =
      /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/([0-9]+)(\?.*)?$/;
    return xRegex.test(url);
  }

  static isRedditUrl(url: string): boolean {
    const redditRegex =
      /^(https?:\/\/)?((www|old|new|np|i|v)\.)?reddit\.com(\/.*)?/i;
    return redditRegex.test(url);
  }

  static isTelegramUrl(url: string): boolean {
    const telegramRegex = /^(https?:\/\/)?(www\.)?(t\.me)(\/.*)?/i;
    return telegramRegex.test(url);
  }

  static formatUrl(url: string): string {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "")
      .trim();
  }

  static formatTelegramChatLink(chatId: string): string {
    return chatId.startsWith("-100")
      ? `https://t.me/c/${chatId.substring(4)}`
      : `https://t.me/c/${chatId}`;
  }
}
