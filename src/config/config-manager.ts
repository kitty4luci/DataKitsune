import { AppConfig } from "../interfaces/app-config";

export class ConfigManager {
  static getConfig(): AppConfig {
    return {
      appMode: process.env.APP_MODE,
      appPort: Number(process.env.APP_PORT),
      appPrefix: process.env.APP_PREFIX,

      telegramBotApiToken: process.env.TELEGRAM_BOT_API_TOKEN,
      telegramBotWebhookDomain: process.env.TELEGRAM_BOT_WEBHOOK_DOMAIN,
      telegramBotWebhookPath: process.env.TELEGRAM_BOT_WEBHOOK_PATH,
      telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME,

      postgresHost: process.env.POSTGRES_HOST,
      postgresPort: Number(process.env.POSTGRES_PORT),
      postgresUser: process.env.POSTGRES_USER,
      postgresPassword: process.env.POSTGRES_PASSWORD,
      postgresDb: process.env.POSTGRES_DB,

      redisConnectionString: process.env.REDIS_CONNECTION_STRING,

      firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
      openAiKey: process.env.OPENAI_API_KEY,
      googleLocation: process.env.GOOGLE_LOCATION,
      googleProjectId: process.env.GOOGLE_PROJECT_ID,
      googleCredentials: process.env.GOOGLE_CREDENTIALS,
      grokApiKey: process.env.GROK_API_KEY,

      r2rBaseUrl: process.env.R2R_BASE_URL,
      r2rUser: process.env.R2R_EMAIL,
      r2rPassword: process.env.R2R_PASSWORD,

      saveLinkQueue: "save-link-queue",
      parseContentQueue: "parse-content-queue",
      describeContentQueue: "describe-content-queue",
      r2rInjectorQueue: "r2r-injector-queue",
      scheduledUpdatesQueue: "scheduled-updates-queue",
      finalizerQueue: "finalizer-queue",
    };
  }
}
